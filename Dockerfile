FROM ghcr.io/puppeteer/puppeteer:22.11.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD =false \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WORKDIR /user/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "node","main.js"]