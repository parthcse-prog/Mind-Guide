import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

async function main() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(htmlUrl);

  const times = [
    { t: 4, name: 'sc0_welcome' },
    { t: 12, name: 'sc1_mentors' },
    { t: 22, name: 'sc2_counselors' },
    { t: 31, name: 'sc3_swot_report' },
    { t: 41, name: 'sc4_roadmap' },
    { t: 53, name: 'sc5_ats_radar' },
    { t: 63, name: 'sc6_job_board' }
  ];

  for (const item of times) {
    await page.evaluate((t) => window.seek(t), item.t);
    await new Promise(r => setTimeout(r, 100));
    const outPath = path.resolve(`review/preview_${item.name}.jpg`);
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 90 });
    console.log(`Saved review/preview_${item.name}.jpg`);
  }

  await browser.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
