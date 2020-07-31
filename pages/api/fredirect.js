import { userAgent } from "../../lib/configs";
import fetch from 'node-fetch';
import dns from 'dns';

const metaRefreshPattern = '(CONTENT|content)=["\']0;[ ]*(URL|url)=(.*?)(["\']\s*>)';
const MAX_REDIRECT_DEPTH = 20;

const isRedirect = status => status >= 300 && status <= 309;

const extractMetaRefreshUrl = html => {
  const match = html.match(metaRefreshPattern)
  return match && match.length == 5 ? match[3] : null;
}

const prefixWithHttp = url => !/^http/.test(url) ? `http://${url}` : url;

const fetchOptions = {
  redirect: 'manual',
  follow: 0,
  headers: {
    'User-Agent': userAgent,
    'Accept': 'text/html'
  }
}

const visit = async uri => {
  const url = prefixWithHttp(uri);
  const response = await fetch(url, fetchOptions);
  const { status, headers } = response;
  if (isRedirect(status)) {
    const location = headers.get('location')
    if (!location) {
      throw `${url} responded with status ${status} but no location header`
    }
    return { url, redirect: true, status, redirectUrl: headers.get('location') }
  } else if (status == 200) {
    const text = await response.text()
    const redirectUrl = extractMetaRefreshUrl(text)
    return redirectUrl ?
      { url, redirect: true, status: '200 + META REFRESH', redirectUrl } :
      { url, redirect: false, status }
  }
  return { url, redirect: false, status }
}

const getHostIP = async (host) => new Promise((resolve, reject) => {
  dns.lookup(host, (err, address, family) => {
    if (err) {
      return reject(err);
    }
    return resolve({ address, type: family });
  });
});

const startFollowing = async (urlObject) => {
  let { href: url, host } = urlObject;
  let keepGoing = true;
  const visits = [];
  let count = 1;
  while (keepGoing) {
    if (count > MAX_REDIRECT_DEPTH) {
      throw `Exceeded max redirect depth of ${MAX_REDIRECT_DEPTH}`
    }
    try {
      const [response, ipInfo] = await Promise.all([
        visit(url),
        getHostIP(host)
      ]);
      keepGoing = response.redirect;
      url = response.redirectUrl;
      url && ({ host } = new URL(url));
      visits.push({ ...response, ipInfo });
      count++;
    } catch (err) {
      if (err.code === 'ENOTFOUND') {
        visits.push({ url, redirect: false, status: "Address not found." });
      } else {
        visits.push({ url, redirect: false, status: err.toString() });
      }
      console.error(err);
      break
    }
  }
  return visits;
}

export default async (req, res) => {
  try {
    const url = new URL(prefixWithHttp(req.query.url));
    const redirects = await startFollowing(url);
    return res.status(200).json({ redirects })
  } catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      return res.status(400).send("Invalid URL");
    }
    return res.status(400).send(error);
  }
}
