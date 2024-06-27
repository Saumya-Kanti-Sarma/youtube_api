const puppeteer = require("puppeteer");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors())
const PORT = process.env.PORT || 9000;
require("dotenv").config();

app.get("/", (req, res) => {
  const data = {
    msg: "Welcome to my youtube search Api",
    description: "welcome to search youtube api, made by Saumya kanti sarma as a side project of web scraping..",
    socials: {
      github: 'https://github.com/Saumya-Kanti-Sarma',
      instagram: 'https://www.instagram.com/serean_miles/',
      gmail: "saumyakantisarma2004@gmail.com"
    },
    status: 200,
  }
  res.json(data);
})

app.get("/api/:id", async (req, res) => {
  const { id } = req.params;
  const BASE_URL = `https://www.youtube.com/results?search_query=${id}`;

  const browser = await puppeteer.launch({
    timeout: 120000,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  const page = await browser.newPage();
  await page.goto(BASE_URL).then(async () => {
    try {
      //console.log(`Welcome to the page`);
      await page.waitForSelector('#dismissible');
      const data = await page.evaluate(() => {
        const Data = [];
        const video_container = document.querySelectorAll("#dismissible");
        for (let i = 0; i < video_container.length && Data.length < 20; i++) {
          const index = video_container[i];
          const title = index.querySelector('yt-formatted-string').innerText;
          const views = index.querySelector('span').innerText;
          const channelName = index.querySelector('.yt-simple-endpoint.style-scope.yt-formatted-string')?.innerText;
          const vidLink = index.querySelector('a').href;
          const thumbnail = index.querySelector("img")?.src;

          if (vidLink && title) {
            Data.push({
              title: title,
              views: views || "",
              channel: channelName || "",
              link: vidLink,
              thumbnail: thumbnail || "",
            });
          }
        };
        return Data
      });

      res.json({
        msg: "Searching Complete..",

        data
      });
    } catch (error) {
      res.send(`ERROR after initializing page \n ${error}`);
    } finally {
      await browser.close();
    }
  });
})

app.listen(PORT, () => {
  console.log(`sserver running at ${PORT}`);
})
