import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verifyFrames() {
  console.log("=== KEYFRAME VERIFICATION CAPTURE (verify.mjs) ===");
  const framesDir = path.resolve(__dirname, '../review/frames');
  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').split(path.sep).join('/') + '#render';
  console.log("Loading page in render mode:", htmlPath);
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded', timeout: 20000 });

  const duration = await page.evaluate(() => window.DURATION);
  console.log(`Video total duration: ${duration.toFixed(2)}s`);

  // Target Keyframe List dynamically anchored to scene timeline
  const keyframes = await page.evaluate(() => {
    return [
      { id: "01", t: (S(0).start + S(0).end) / 2, label: "sc0_hero_welcome" },
      { id: "02", t: T.t0_1 + 0.3, label: "trans_0_to_1_ring" },
      { id: "03", t: (S(1).start + S(1).end) / 2, label: "sc1_3d_mentors_active" },
      { id: "04", t: T.t1_2 + 0.3, label: "trans_1_to_2_push" },
      { id: "05", t: (S(2).start + S(2).end) / 2, label: "sc2_counselors_memory" },
      { id: "06", t: T.t2_3 + 0.3, label: "trans_2_to_3_wipeX" },
      { id: "07", t: (S(3).start + S(3).end) / 2, label: "sc3_guidance_report_swot" },
      { id: "08", t: T.t3_4 + 0.3, label: "trans_3_to_4_zoom" },
      { id: "09", t: (S(4).start + S(4).end) / 2, label: "sc4_roadmap_badges" },
      { id: "10", t: T.t4_5 + 0.3, label: "trans_4_to_5_zoomPast" },
      { id: "11", t: (S(5).start + S(5).end) / 2, label: "sc5_ats_radar_rewrites" },
      { id: "12", t: T.t5_6 + 0.3, label: "trans_5_to_6_morph" },
      { id: "13", t: (S(6).start + S(6).end) / 2, label: "sc6_job_board_match" },
      { id: "14", t: T.t6_7 + 0.3, label: "trans_6_to_7_blur" },
      { id: "15", t: S(7).start + 2.0, label: "sc7_payoff_logo_lockup" },
      { id: "16", t: window.DURATION - 0.8, label: "sc7_outro_hold" }
    ];
  });

  const results = [];

  for (const kf of keyframes) {
    const filename = `frame_${kf.id}_${kf.label}.jpg`;
    const filepath = path.join(framesDir, filename);

    // Seek in page
    await page.evaluate((seekT) => window.seek(seekT), kf.t);
    // Give 50ms for paints to settle
    await page.waitForTimeout(50);

    // Screenshot stage box at 1920x1080
    const stageHandle = await page.$('#stage');
    if (stageHandle) {
      await stageHandle.screenshot({ path: filepath, type: 'jpeg', quality: 92 });
    } else {
      await page.screenshot({ path: filepath, type: 'jpeg', quality: 92 });
    }

    const stats = fs.statSync(filepath);
    console.log(`[SAVED] ${filename} (${(stats.size / 1024).toFixed(1)} KB) at t=${kf.t.toFixed(2)}s`);

    results.push({
      ...kf,
      file: filename,
      sizeBytes: stats.size
    });
  }

  await browser.close();

  // Write index.json
  const indexPath = path.join(framesDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify({ duration, capturedAt: new Date().toISOString(), frames: results }, null, 2));
  console.log(`\n✓ Saved index.json with ${results.length} keyframes to review/frames/index.json`);
  process.exit(0);
}

verifyFrames().catch(err => {
  console.error("Error in verify.mjs:", err);
  process.exit(1);
});
