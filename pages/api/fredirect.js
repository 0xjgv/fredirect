import { userAgent } from "../../lib/configs";
import puppeteer from 'puppeteer';
import { URL } from "url";

async function followRedirects(url) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const [page] = await browser.pages();
    await page.setRequestInterception(true);
    const chainRequests = [];
    page.on('request', request => {
      const chain = request.redirectChain();
      const idx = chain.length;
      if (chainRequests[idx]) {
        request.abort();
      } else {
        const interceptedUrl = request.url();
        chainRequests[idx] = interceptedUrl;
        request.continue();
      }
    });
    await page.setUserAgent(userAgent);
    await page.goto(url);
    return chainRequests;
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default async (req, res) => {
  try {
    const { url } = req.query;
    const { href } = new URL(url);
    const redirects = await followRedirects(href);
    return res.status(200).json({ redirects })
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
