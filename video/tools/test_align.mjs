import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

async function main() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(htmlUrl);

  // Set style of #sc2-selected-card dynamically to test
  await page.evaluate(() => {
    window.seek(25.0);
    const sel = document.querySelector('#sc2-selected-card');
    sel.style.top = '175px';
    sel.style.left = '92px';
    sel.style.width = '170px';
    sel.style.height = '275px';
    sel.style.borderRadius = '24px';
    sel.style.opacity = '1';
  });

  await page.screenshot({ path: path.resolve('review/test_align_alex.jpg') });
  await browser.close();
  console.log('Saved test_align_alex.jpg');
}

main().catch(e => { console.error(e); process.exit(1); });
