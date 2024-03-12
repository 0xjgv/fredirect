import { NextResponse } from "next/server";
import { userAgent } from "@/lib/configs";
import { promises as dns } from "dns";
import crypto from "crypto";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

const metaRefreshPattern =
  "(CONTENT|content)=[\"']0;[ ]*(URL|url)=(.*?)([\"']s*>)";
const MAX_REDIRECT_DEPTH = 20;

const isRedirect = (status: number) => status >= 300 && status <= 309;

const extractMetaRefreshUrl = (html: string) => {
  const match = html.match(metaRefreshPattern);
  return match && match.length == 5 ? match[3] : null;
};

const prefixWithHttp = (url: string) =>
  !/^http/.test(url) ? `http://${url}` : url;

type VisitResponse = {
  redirectUrl?: string | null;
  status: number | string;
  redirect: boolean;
  url: string;
};

const fetchOptions: RequestInit = {
  redirect: "manual",
  headers: {
    "User-Agent": userAgent,
    Accept: "text/html"
  }
};

async function visit(uri: string): Promise<VisitResponse> {
  const url = prefixWithHttp(uri);
  const response = await fetch(url, fetchOptions);
  const { status, headers } = response as Response;
  if (isRedirect(status)) {
    const location = headers.get("location");
    if (!location) {
      throw `${url} responded with status ${status} but no location header`;
    }
    return {
      redirectUrl: headers.get("location"),
      redirect: true,
      status,
      url
    };
  } else if (status == 200) {
    const text = await response.text();
    const redirectUrl = extractMetaRefreshUrl(text);
    return redirectUrl
      ? { url, redirect: true, status: "200 + META REFRESH", redirectUrl }
      : { url, redirect: false, status };
  }
  return { url, redirect: false, status };
}

async function getMXRecords(host: string) {
  return dns.resolveMx(host);
}

interface SoaRecord {
  nsname: string;
  hostmaster: string;
  serial: number;
  refresh: number;
  retry: number;
  expire: number;
  minttl: number;
}

interface LookupRecord {
  address: string;
  family: number;
}

type DNSRecordName = "TXT" | "SOA" | "LOOKUP" | "MX" | "NS";

type DNSRecords = Record<DNSRecordName, string[] | LookupRecord | SoaRecord>;

async function getDNSRecords(host: string): Promise<DNSRecords> {
  const dnsFunctions: [CallableFunction, DNSRecordName][] = [
    [dns.resolveTxt, "TXT"],
    [dns.resolveSoa, "SOA"],
    [dns.lookup, "LOOKUP"],
    [dns.resolveMx, "MX"],
    [dns.resolveNs, "NS"]
  ];

  const results = await Promise.all(
    dnsFunctions.map(([dnsFunction, recordName]) =>
      dnsFunction(host)
        .then((v: string | string[]) => [recordName, v])
        .catch(() => [])
    )
  );

  return results.reduce((acc, [record, values]) => {
    if (record && values) {
      if (Array.isArray(values)) {
        acc[record] = [].concat(...values);
      } else {
        acc[record] = values;
      }
    }
    return acc;
  }, {});
}

function hashify(object: { [key: string]: any }): string {
  const stack = Object.values(object);
  const values = [];

  while (stack.length) {
    const value = stack.pop();
    if (Array.isArray(value)) {
      value.forEach(val => stack.push(val));
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(val => stack.push(val));
    } else {
      values.push(value);
    }
  }

  return crypto.createHash("md5").update(values.sort().join("")).digest("hex");
}

async function startFollowing(
  urlObject: URL
): Promise<{ urls: any[]; records: any }> {
  const records: { [key: string]: any } = {};
  const memo: { [key: string]: number } = {};
  const urls: any[] = [];

  let { href: url, host } = urlObject;
  let previousURL = urlObject;
  let keepGoing = true;

  let count = 1;
  while (keepGoing) {
    if (count > MAX_REDIRECT_DEPTH) {
      throw `Exceeded max redirect depth of ${MAX_REDIRECT_DEPTH}`;
    }
    try {
      const [dnsRecords, response] = await Promise.all([
        getDNSRecords(host),
        visit(url)
      ]);

      const hash = hashify(dnsRecords);
      if (!memo[hash]) {
        records[host] = dnsRecords;
        memo[hash] = 1;
      }
      if (response.url === response.redirectUrl) {
        break;
      }

      keepGoing = response.redirect;

      previousURL = new URL(response.redirectUrl || "", previousURL);
      host = previousURL.host;
      url = previousURL.href;

      urls.push({
        ...response,
        ip: (dnsRecords.LOOKUP as LookupRecord).address
      });
      count += 1;
    } catch (err: any) {
      if (err.code === "ENOTFOUND") {
        urls.push({ url, redirect: false, status: "Address not found." });
      } else {
        urls.push({ url, redirect: false, status: err.toString() });
      }
      console.error(err);
      break;
    }
  }
  return { urls, records };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return new NextResponse("Missing URL", { status: 400 });
    }

    const redirects = await startFollowing(new URL(prefixWithHttp(url)));
    return NextResponse.json({ redirects });
  } catch (error: any) {
    console.error({ error });
    if (error.code === "ERR_INVALID_URL") {
      return new NextResponse("Invalid URL", { status: 400 });
    }
    return new NextResponse(error.toString(), { status: 500 });
  }
}
