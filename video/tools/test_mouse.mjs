import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

async function main() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(htmlUrl);

  for (const t of [20.0, 24.1, 25.0]) {
    await page.evaluate((time) => window.seek(time), t);
    await new Promise(r => setTimeout(r, 100));
    await page.screenshot({ path: path.resolve(`review/preview_sc2_mouse_${t}s.jpg`) });
    console.log(`Saved review/preview_sc2_mouse_${t}s.jpg`);
  }

  await browser.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
