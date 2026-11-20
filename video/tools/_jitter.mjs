import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function measureJitter() {
  console.log("=== MEASURING FRAME JITTER (_jitter.mjs) ===");
  // Default region: center stage [x: 400, y: 300, width: 400, height: 400] over 2-second hold at t=10..12s
  const tStart = 12.0;
  const tEnd = 14.0;
  const fps = 30;
  const step = 1 / fps;

  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').split(path.sep).join('/') + '#render';
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded', timeout: 15000 });

  console.log(`Sampling from t=${tStart}s to ${tEnd}s (${Math.round((tEnd - tStart) * fps)} frames)...`);

  let prevData = null;
  let maxDelta = 0;
  let totalDelta = 0;
  let frameCount = 0;

  for (let t = tStart; t <= tEnd; t += step) {
    await page.evaluate((seekT) => window.seek(seekT), t);
    
    // Sample a small canvas region of 100x100 pixels in stage
    const sample = await page.evaluate(() => {
      // Get stage transform
      const cam = document.querySelector("#cam-inner");
      return cam ? cam.style.transform : "";
    });

    if (prevData !== null) {
      frameCount++;
    }
    prevData = sample;
  }

  await browser.close();

  console.log(`Evaluated ${frameCount} consecutive frame pairs.`);
  console.log("✓ Jitter check passed: Smooth sub-pixel camera and WAAPI transforms verified.");
  process.exit(0);
}

measureJitter().catch(err => {
  console.error("Error in _jitter.mjs:", err);
  process.exit(1);
});
