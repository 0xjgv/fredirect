import { userAgent } from "@/lib/configs";
import { waitUntil } from "@vercel/functions";
import { promises as dns } from "dns";
import crypto from "crypto";
import { upsertRedirects } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic"; // static by default, unless reading the request
export const revalidate = 60 * 60 * 24; // 24 hours

const metaRefreshPattern =
  "(CONTENT|content)=[\"']0;[ ]*(URL|url)=(.*?)([\"']s*>)";
const MAX_REDIRECT_DEPTH = 30;

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
  ip?: string;
};

interface MXRecord {
  exchange: string;
  priority: number;
}

interface SOARecord {
  hostmaster: string;
  refresh: number;
  nsname: string;
  serial: number;
  expire: number;
  minttl: number;
  retry: number;
}

interface LookupRecord {
  address: string;
  family: number;
}

type DNSRecords = {
  LOOKUP: LookupRecord;
  SOA: SOARecord | [];
  MX: MXRecord[];
  TXT: string[];
  NS: string[];
};

type HostDNSRecords = Record<string, DNSRecords>;

type RedirectionsResult = {
  records: HostDNSRecords;
  urls: VisitResponse[];
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

async function getDNSRecords(host: string): Promise<DNSRecords> {
  const dnsFunctions: [CallableFunction, keyof DNSRecords][] = [
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
        .catch(() => [recordName, []])
    )
  );

  return results.reduce(
    (acc, [record, values]) => ({
      ...acc,
      [record]: Array.isArray(values) ? values.flat() : values
    }),
    {}
  );
}

function hashify(object: { [key: string]: any }): string {
  const stack = Object.values(object);
  const values = [];

  while (stack.length) {
    const value = stack.pop();
    if (value && typeof value === "object") {
      Object.values(value).forEach(val => stack.push(val));
    } else if (Array.isArray(value)) {
      value.forEach(val => stack.push(val));
    } else {
      values.push(value);
    }
  }

  return crypto.createHash("md5").update(values.sort().join("")).digest("hex");
}

const shouldStopRedirection = (
  lastUrl: VisitResponse,
  response: VisitResponse
): boolean =>
  response.url === response.redirectUrl ||
  (lastUrl &&
    lastUrl.redirectUrl === response.redirectUrl &&
    lastUrl.url === response.url);

async function startFollowing(urlObject: URL): Promise<RedirectionsResult> {
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

      const lastUrl = urls[urls.length - 1];
      if (shouldStopRedirection(lastUrl, response)) {
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

      if (response.status === 200 || response.status === "200 + META REFRESH") {
        break;
      }
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

const upsertRedirectsWithoutError = async (redirects: any) => {
  try {
    await upsertRedirects(redirects);
  } catch (error) {
    console.error({ error });
  }
};

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return new Response("Missing URL", { status: 400 });
    }

    const redirects: RedirectionsResult = await startFollowing(
      new URL(prefixWithHttp(url))
    );
    const response = Response.json({ redirects });
    waitUntil(upsertRedirectsWithoutError(redirects));

    // Cache response for 24 hours
    response.headers.set("Cache-Control", `max-age=0, s-maxage=${revalidate}`);
    // CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return response;
  } catch (error: any) {
    console.error({ error });
    if (error.code === "ERR_INVALID_URL") {
      return new Response("Invalid URL", { status: 400 });
    }
    return new Response(error.toString(), { status: 500 });
  }
}
