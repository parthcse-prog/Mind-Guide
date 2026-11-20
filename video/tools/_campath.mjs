import { chromium } from 'playwright-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function lintCamPath() {
  console.log("=== LINTING CAMERA PATH (_campath.mjs) ===");
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--disable-gpu'] });
  const page = await browser.newPage();
  
  const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').split(path.sep).join('/');
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Extract cleanCamTrack from page
  const track = await page.evaluate(() => {
    return cleanCamTrack.map(([t, p, easing]) => ({ t, x: p.x, y: p.y, scale: p.scale, rot: p.rot, easing }));
  });

  await browser.close();

  let microIssues = 0;
  let tiltRevIssues = 0;
  let fastJumpIssues = 0;

  for (let i = 1; i < track.length; i++) {
    const prev = track[i - 1];
    const curr = track[i];
    const dt = curr.t - prev.t;
    const dx = Math.abs(curr.x - prev.x);
    const dy = Math.abs(curr.y - prev.y);
    const dist = Math.hypot(dx, dy);
    const dScale = Math.abs(curr.scale - prev.scale);

    // 1. Check MICRO moves (< 40px, dt < 1.5s, dScale < 0.04, and dist > 0)
    if (dt < 1.5 && dist > 0 && dist < 40 && dScale < 0.04) {
      console.warn(`[MICRO] at t=${curr.t.toFixed(2)}s: dist=${dist.toFixed(1)}px, dt=${dt.toFixed(2)}s, dScale=${dScale.toFixed(3)}`);
      microIssues++;
    }

    // 2. Check TILT: Sub-degree tilts or tilt reversal
    if (Math.abs(curr.rot) > 0 && Math.abs(curr.rot) < 1.0) {
      console.warn(`[TILT-SUBDEGREE] at t=${curr.t.toFixed(2)}s: rot=${curr.rot.toFixed(2)}deg (must be >= 1deg or 0)`);
      tiltRevIssues++;
    }

    // 3. Check FAST jumps
    const velocity = dt > 0 ? dist / dt : 0;
    if (velocity > 1200) {
      console.warn(`[FAST] at t=${curr.t.toFixed(2)}s: velocity=${velocity.toFixed(1)}px/s exceeds 1200px/s`);
      fastJumpIssues++;
    }
  }

  // Tilt summary
  const tilts = track.filter(k => k.rot !== 0);
  console.log(`- Deliberate tilt keyframes count: ${tilts.length} (at t=${tilts.map(k=>k.t.toFixed(1)).join(', ')}s)`);

  console.log(`\nSummary:`);
  console.log(`- Total camera keyframes: ${track.length}`);
  console.log(`- MICRO moves: ${microIssues}`);
  console.log(`- TILT issues: ${tiltRevIssues}`);
  console.log(`- FAST jumps: ${fastJumpIssues}`);

  if (microIssues === 0 && tiltRevIssues === 0 && fastJumpIssues === 0) {
    console.log("✓ CAMERA PATH LINT PASSED: ZERO ISSUES DETECTED!");
    process.exit(0);
  } else {
    console.error("✗ CAMERA PATH LINT FAILED: Please fix reported issues.");
    process.exit(1);
  }
}

lintCamPath().catch(err => {
  console.error("Error running _campath.mjs:", err);
  process.exit(1);
});
