FROM ghcr.io/puppeteer/puppeteer:^22.11.2
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD =true \
  PUPPETEER_EXECUTABLE_PATH=/user/bin/google-chrome-stable
WORKDIR /user/src/app

COPY package*.json ./
RUN npm ci
COPY ..
CMD [ "node","main.js"]