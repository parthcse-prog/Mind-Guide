import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildContactSheet() {
  console.log("=== BUILDING CONTACT SHEETS (sheet.mjs) ===");
  const framesDir = path.resolve(__dirname, '../review/frames');
  const reviewDir = path.resolve(__dirname, '../review');
  const indexPath = path.join(framesDir, 'index.json');

  if (!fs.existsSync(indexPath)) {
    console.error("No index.json found. Run tools/verify.mjs first!");
    process.exit(1);
  }

  const { frames } = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  console.log(`Found ${frames.length} keyframes to composite into contact sheets.`);

  const batchSize = 8;
  const numSheets = Math.ceil(frames.length / batchSize);

  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--disable-gpu'] });

  for (let s = 0; s < numSheets; s++) {
    const sheetFrames = frames.slice(s * batchSize, (s + 1) * batchSize);
    const sheetNum = s + 1;
    const outputPath = path.join(reviewDir, `contact-sheet-${sheetNum}.jpg`);

    const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          margin: 0; padding: 40px;
          background: #0b0f19;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          width: 2560px;
          box-sizing: border-box;
        }
        h1 {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 28px;
          color: #38bdf8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
        }
        .cell {
          background: #1e293b;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 16px 36px rgba(0,0,0,0.6);
        }
        .thumb {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          display: block;
        }
        .meta {
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 15px;
          background: rgba(15, 23, 42, 0.95);
        }
        .tag {
          font-weight: 700;
          color: #14b8a6;
        }
        .time {
          font-family: monospace;
          color: #94a3b8;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <h1>
        <span>Saarthi.ai Demo Video — Keyframe Contact Sheet #${sheetNum}</span>
        <span style="font-size: 18px; color: #94a3b8; font-weight: 500;">1920x1080 @ 30fps · WAAPI Single-Clock Engine</span>
      </h1>
      <div class="grid">
        ${sheetFrames.map(f => {
          const framePath = path.join(framesDir, f.file);
          const b64 = fs.readFileSync(framePath).toString('base64');
          const imgUrl = `data:image/jpeg;base64,${b64}`;
          return `
            <div class="cell">
              <img class="thumb" src="${imgUrl}" alt="${f.label}">
              <div class="meta">
                <span class="tag">${f.label}</span>
                <span class="time">${f.t !== undefined ? f.t.toFixed(2) + 's' : ''}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </body>
    </html>`;

    const page = await browser.newPage({ viewport: { width: 2560, height: 1650 } });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(100);

    await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90, fullPage: true });
    await page.close();

    const stats = fs.statSync(outputPath);
    console.log(`[GENERATED] contact-sheet-${sheetNum}.jpg (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  console.log("✓ Contact sheets generated successfully in review/!");
  process.exit(0);
}

buildContactSheet().catch(err => {
  console.error("Error in sheet.mjs:", err);
  process.exit(1);
});
