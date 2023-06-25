import { userAgent } from "@/lib/configs";
import { promises as dns } from "dns";
import fetch from "node-fetch";
import crypto from "crypto";

const metaRefreshPattern =
  "(CONTENT|content)=[\"']0;[ ]*(URL|url)=(.*?)([\"']s*>)";
const MAX_REDIRECT_DEPTH = 20;

const isRedirect = status => status >= 300 && status <= 309;

const extractMetaRefreshUrl = html => {
  const match = html.match(metaRefreshPattern);
  return match && match.length == 5 ? match[3] : null;
};

const prefixWithHttp = url => (!/^http/.test(url) ? `http://${url}` : url);

const fetchOptions = {
  redirect: "manual",
  follow: 0,
  headers: {
    "User-Agent": userAgent,
    Accept: "text/html"
  }
};

const visit = async uri => {
  const url = prefixWithHttp(uri);
  const response = await fetch(url, fetchOptions);
  const { status, headers } = response;
  if (isRedirect(status)) {
    const location = headers.get("location");
    if (!location) {
      throw `${url} responded with status ${status} but no location header`;
    }
    return {
      url,
      redirect: true,
      status,
      redirectUrl: headers.get("location")
    };
  } else if (status == 200) {
    const text = await response.text();
    const redirectUrl = extractMetaRefreshUrl(text);
    return redirectUrl
      ? { url, redirect: true, status: "200 + META REFRESH", redirectUrl }
      : { url, redirect: false, status };
  }
  return { url, redirect: false, status };
};

const getDNSRecords = async host => {
  const records = new Set(["MX", "TXT", "SOA", "NS", "LOOKUP"]);
  const functions = Object.keys(dns).reduce((acc, key) => {
    const fn = key.toUpperCase();
    for (let record of records) {
      if (fn.endsWith(record)) {
        records.delete(record);
        acc.push([key, record]);
      }
    }
    return acc;
  }, []);
  const results = await Promise.all(
    functions.map(([fnName, recordName]) =>
      dns[fnName](host)
        .then(v => [recordName, v])
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
};

const hashify = object => {
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
};

const startFollowing = async urlObject => {
  let { href: url, host } = urlObject;
  let previousURL = urlObject;
  let keepGoing = true;
  const records = {};
  const memo = {};
  const urls = [];

  let count = 1;
  while (keepGoing) {
    if (count > MAX_REDIRECT_DEPTH) {
      throw `Exceeded max redirect depth of ${MAX_REDIRECT_DEPTH}`;
    }
    try {
      const [response, dnsRecords] = await Promise.all([
        visit(url),
        getDNSRecords(host)
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

      previousURL = new URL(response.redirectUrl, previousURL);
      host = previousURL.host;
      url = previousURL.href;

      urls.push({ ...response, ip: dnsRecords.LOOKUP.address });
      count++;
    } catch (err) {
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
};

const allowCors = fn => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Echo user's origin
  res.setHeader(
    "Access-Control-Allow-Origin",
    req.headers.origin || req.headers.referer
  );
  // Allow all
  // res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader("Access-Control-Allow-Methods", "OPTIONS,GET");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Phisherman"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  try {
    const url = new URL(prefixWithHttp(req.query.url));
    const redirects = await startFollowing(url);
    return res.status(200).json({ redirects });
  } catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      return res.status(400).send("Invalid URL");
    }
    return res.status(400).send(error);
  }
};

export default allowCors(handler);
