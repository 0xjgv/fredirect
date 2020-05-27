import { userAgent } from "../../lib/configs";
import fetch from 'node-fetch';

const metaRefreshPattern = '(CONTENT|content)=["\']0;[ ]*(URL|url)=(.*?)(["\']\s*>)';
const MAX_REDIRECT_DEPTH = 10;

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

const startFollowing = async url => {
  let keepGoing = true
  const visits = []
  let count = 1
  while (keepGoing) {
    if (count > MAX_REDIRECT_DEPTH) {
      throw `Exceeded max redirect depth of ${MAX_REDIRECT_DEPTH}`
    }
    try {
      const response = await visit(url)
      keepGoing = response.redirect;
      url = response.redirectUrl;
      visits.push(response);
      count++;
    } catch (err) {
      visits.push({ url: url, redirect: false, status: `Error: ${err}` })
      break
    }
  }
  return visits;
}

const isRedirect = status => status > 300 && status < 309;

const extractMetaRefreshUrl = html => {
  const match = html.match(metaRefreshPattern)
  return match && match.length == 5 ? match[3] : null;
}

const prefixWithHttp = url => !/^http/.test(url) ? `http://${url}` : url;

export default async (req, res) => {
  try {
    const { url } = req.query;
    const redirects = await startFollowing(url);
    return res.status(200).json({ redirects })
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
