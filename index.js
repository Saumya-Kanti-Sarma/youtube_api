const express = require("express");
const { executablePath } = require("puppeteer");

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}
const PORT = process.env.PORT || 9000;
const app = express();

app.get("/", (req, res) => {
  const data = {
    msg: "Welcome to my youtube search Api",
  }
  res.send(data);
})

app.get("/api/:id", async (req, res) => {

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSError: true,
    }
  }

  const { id } = req.params; // Extract the id from the request parameters
  const BASE_URL = `https://www.youtube.com/results?search_query=${id}&sp=EgIQAQ%253D%253D`;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#dismissible');

    // Extract video titles and views for the first 10 videos
    const videos = await page.evaluate(() => {
      const videoDivs = document.querySelectorAll('ytd-video-renderer');
      const videoData = [];
      for (let i = 0; i < 10; i++) {
        const video = videoDivs[i];
        const title = video.querySelector('yt-formatted-string').innerText;
        const views = video.querySelector('span').innerText;
        const channelName = video.querySelector('.yt-simple-endpoint.style-scope.yt-formatted-string')?.innerText;
        const vidLink = video.querySelector('a').href;
        const thumbnail = video.querySelector("img")?.src;
        videoData.push({ title, views, channelName, vidLink, thumbnail });
      }
      return videoData;
    });
    res.send(videos);
    await browser.close();
  } catch (error) {
    res.json(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server Connected at PORT: http://localhost:${PORT}`);
});
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});