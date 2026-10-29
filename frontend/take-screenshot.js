const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:5174/messages', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();

