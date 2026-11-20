import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

async function main() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(htmlUrl);

  const captures = [
    { t: 20.0, name: 'sc2_hover_maya' },
    { t: 24.1, name: 'sc2_click_alex' },
    { t: 25.0, name: 'sc2_alex_selected' },
    { t: 42.0, name: 'sc4_roadmap_mouse' },
    { t: 63.5, name: 'sc6_job_mouse' }
  ];

  for (const c of captures) {
    await page.evaluate((time) => window.seek(time), c.t);
    await new Promise(r => setTimeout(r, 100));
    await page.screenshot({ path: path.resolve(`review/preview_${c.name}.jpg`) });
    console.log(`Saved review/preview_${c.name}.jpg`);
  }

  await browser.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
