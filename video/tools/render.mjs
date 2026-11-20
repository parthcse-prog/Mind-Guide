import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCRIPT = [
  ["Hello and welcome to Saarthi.ai,", "your personalized AI companion", "for life, personal growth,", "and career mentorship."],
  ["Whenever you need guidance,", "Saarthi offers a safe, judgment-free space", "to converse with specialized 3D virtual mentors", "who listen, speak,", "and adapt to your unique journey."],
  ["Covering emotional well-being,", "personal confidence, relationships,", "and career direction,", "your mentors remember past sessions", "so you can always continue right where you left off."],
  ["After every conversation,", "Saarthi automatically compiles an actionable Guidance Report", "with a clear SWOT analysis,", "downloadable instantly as a PDF."],
  ["To turn insights into real progress,", "the platform creates an interactive Visual Roadmap", "with day-wise milestones and curated resources,", "mapping your completed goals to your Profile", "with earned competency badges."],
  ["When you are ready to take your career forward,", "our ATS Resume Analyzer tests your resume against any target role,", "delivering a visual competency radar chart,", "formatting audits,", "and high-impact bullet point rewrites."],
  ["Finally, the Smart Job Board", "connects your verified skills directly with live career opportunities,", "ranked by a personalized match percentage."],
  ["From personal clarity to professional placement,", "Saarthi.ai is your complete guide", "for every step of your journey."]
];

const PACE = { lead: 1.0, perWord: 0.34, chunkGap: 0.18, sentGap: 0.6, outro: 2.8 };

function computeDuration() {
  let cursor = PACE.lead;
  SCRIPT.forEach((chunks, sIdx) => {
    chunks.forEach((chunk, cIdx) => {
      const words = chunk.trim().split(/\s+/).filter(Boolean);
      cursor += words.length * PACE.perWord;
      if (cIdx < chunks.length - 1) cursor += PACE.chunkGap;
    });
    cursor += PACE.sentGap;
  });
  return cursor - PACE.sentGap + PACE.outro;
}

// Resolve ffmpeg binary
async function getFfmpegPath() {
  try {
    const ffmpegStatic = await import('ffmpeg-static');
    if (ffmpegStatic && ffmpegStatic.default && fs.existsSync(ffmpegStatic.default)) {
      return ffmpegStatic.default;
    }
  } catch (e) {}

  const localStatic = path.resolve(__dirname, '../node_modules/ffmpeg-static/ffmpeg.exe');
  if (fs.existsSync(localStatic)) return localStatic;

  return 'ffmpeg';
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    range: null,
    chunks: null,
    audio: null,
    music: null,
    musicVol: 0.8,
    mux: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--range' && args[i + 1]) {
      const parts = args[i + 1].split(',').map(Number);
      options.range = [parts[0], parts[1]];
      i++;
    } else if (args[i] === '--chunks' && args[i + 1]) {
      options.chunks = args[i + 1].split(',').map(Number);
      i++;
    } else if (args[i] === '--audio' && args[i + 1]) {
      options.audio = args[i + 1];
      i++;
    } else if (args[i] === '--music' && args[i + 1]) {
      options.music = args[i + 1];
      i++;
    } else if (args[i] === '--music-vol' && args[i + 1]) {
      options.musicVol = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--mux') {
      options.mux = true;
    }
  }
  return options;
}

async function renderRange(tStart, tEnd, fps, ffmpegPath, renderDir, htmlPath) {
  const outMp4 = path.join(renderDir, `test_range_${tStart}_${tEnd}.mp4`);
  const frameDir = path.join(renderDir, `tmp_frames_range`);
  if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir, { recursive: true });

  const totalFrames = Math.max(1, Math.round((tEnd - tStart) * fps));
  console.log(`[RANGE TEST] Rendering ${totalFrames} frames from ${tStart}s to ${tEnd}s to ${outMp4}...`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded', timeout: 20000 });

  const stageHandle = await page.$('#stage');

  for (let f = 0; f < totalFrames; f++) {
    const t = tStart + f / fps;
    await page.evaluate((seekT) => window.seek(seekT), t);
    const frameFile = path.join(frameDir, `f_${String(f).padStart(6, '0')}.jpg`);
    if (stageHandle) {
      await stageHandle.screenshot({ path: frameFile, type: 'jpeg', quality: 92 });
    } else {
      await page.screenshot({ path: frameFile, type: 'jpeg', quality: 92 });
    }
  }

  await browser.close();

  console.log(`[RANGE TEST] Encoding test clip...`);
  await new Promise((resolve, reject) => {
    const inputPattern = path.join(frameDir, 'f_%06d.jpg');
    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', inputPattern,
      '-c:v', 'libx264',
      '-crf', '18',
      '-preset', 'veryfast',
      '-pix_fmt', 'yuv420p',
      outMp4
    ];
    const proc = spawn(ffmpegPath, args);
    proc.on('close', (code) => {
      if (code === 0) {
        fs.rmSync(frameDir, { recursive: true, force: true });
        console.log(`✓ Test range video created: ${outMp4}`);
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

async function renderChunk(chunkIdx, tStart, tEnd, fps, ffmpegPath, renderDir, htmlPath) {
  const chunkName = `chunk_${String(chunkIdx).padStart(2, '0')}`;
  const tmpMp4 = path.join(renderDir, `${chunkName}.tmp.mp4`);
  const finalMp4 = path.join(renderDir, `${chunkName}.mp4`);
  const frameDir = path.join(renderDir, `tmp_frames_${chunkName}`);

  if (fs.existsSync(finalMp4)) {
    console.log(`[REUSING] ${chunkName}.mp4 already exists.`);
    return finalMp4;
  }

  if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir, { recursive: true });

  const totalFrames = Math.max(1, Math.round((tEnd - tStart) * fps));
  console.log(`[CHUNK ${chunkIdx}] Rendering ${totalFrames} frames from ${tStart.toFixed(2)}s to ${tEnd.toFixed(2)}s...`);

  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded', timeout: 20000 });

  const stageHandle = await page.$('#stage');

  for (let f = 0; f < totalFrames; f++) {
    const t = tStart + f / fps;
    await page.evaluate((seekT) => window.seek(seekT), t);
    const frameFile = path.join(frameDir, `f_${String(f).padStart(6, '0')}.jpg`);
    if (stageHandle) {
      await stageHandle.screenshot({ path: frameFile, type: 'jpeg', quality: 92 });
    } else {
      await page.screenshot({ path: frameFile, type: 'jpeg', quality: 92 });
    }
  }

  await browser.close();

  // Encode with ffmpeg to .tmp.mp4
  console.log(`[CHUNK ${chunkIdx}] Encoding frames to ${chunkName}.tmp.mp4...`);
  await new Promise((resolve, reject) => {
    const inputPattern = path.join(frameDir, 'f_%06d.jpg');
    const args = [
      '-y',
      '-framerate', String(fps),
      '-i', inputPattern,
      '-c:v', 'libx264',
      '-crf', '18',
      '-preset', 'veryfast',
      '-pix_fmt', 'yuv420p',
      tmpMp4
    ];

    const proc = spawn(ffmpegPath, args);
    proc.on('close', (code) => {
      if (code === 0) {
        fs.renameSync(tmpMp4, finalMp4);
        console.log(`[CHUNK ${chunkIdx}] ✓ Completed ${chunkName}.mp4`);
        fs.rmSync(frameDir, { recursive: true, force: true });
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });

  return finalMp4;
}

async function main() {
  const options = parseArgs();
  const ffmpegPath = await getFfmpegPath();
  console.log(`=== SAARTHI.AI VIDEO RENDERER (render.mjs) ===`);
  console.log(`Using ffmpeg: ${ffmpegPath}`);

  const renderDir = path.resolve(__dirname, '../render');
  const baseDir = path.resolve(__dirname, '..');
  if (!fs.existsSync(renderDir)) fs.mkdirSync(renderDir, { recursive: true });

  const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').split(path.sep).join('/') + '#render';
  const duration = computeDuration();
  const fps = 30;
  console.log(`Video duration: ${duration.toFixed(2)}s @ ${fps} fps (~${Math.round(duration * fps)} total frames)`);

  if (options.range) {
    const [tStart, tEnd] = options.range;
    await renderRange(tStart, tEnd, fps, ffmpegPath, renderDir, htmlPath);
    process.exit(0);
  }

  const chunkSizeSec = 20.0;
  const numChunks = Math.ceil(duration / chunkSizeSec);
  const chunkList = [];
  for (let c = 0; c < numChunks; c++) {
    const t0 = c * chunkSizeSec;
    const t1 = Math.min(duration, (c + 1) * chunkSizeSec);
    chunkList.push({ idx: c, tStart: t0, tEnd: t1 });
  }

  const activeChunks = options.chunks
    ? chunkList.filter(c => options.chunks.includes(c.idx))
    : chunkList;

  if (!options.mux) {
    console.log(`Rendering ${activeChunks.length} chunks...`);
    for (const chunk of activeChunks) {
      await renderChunk(chunk.idx, chunk.tStart, chunk.tEnd, fps, ffmpegPath, renderDir, htmlPath);
    }
  }

  if (options.chunks && options.chunks.length < numChunks) {
    console.log("Partial chunks rendered. Skipping full video join.");
    process.exit(0);
  }

  console.log("\nConcatenating chunks with concat demuxer...");
  const concatTxt = path.join(renderDir, 'concat.txt');
  const concatContent = chunkList.map(c => `file 'chunk_${String(c.idx).padStart(2, '0')}.mp4'`).join('\n');
  fs.writeFileSync(concatTxt, concatContent);

  const rawVideoPath = path.join(renderDir, 'video_raw.mp4');
  await new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', concatTxt,
      '-c', 'copy',
      rawVideoPath
    ];
    const proc = spawn(ffmpegPath, args);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Concat failed with code ${code}`));
    });
  });

  const musicFile = options.music || (fs.existsSync(path.resolve(__dirname, '../music/bg-music.wav')) ? path.resolve(__dirname, '../music/bg-music.wav') : null);
  const audioFile = options.audio || null;
  const finalVideoPath = path.join(baseDir, 'video.mp4');

  if (musicFile || audioFile) {
    console.log("Muxing audio with video...");
    const args = ['-y', '-i', rawVideoPath];

    if (musicFile && audioFile) {
      args.push('-i', audioFile, '-i', musicFile);
      const filterComplex = `[1:a]volume=1.0[v];[2:a]volume=${options.musicVol * 0.4}[m];[v][m]amix=inputs=2:duration=first[a]`;
      args.push('-filter_complex', filterComplex, '-map', '0:v', '-map', '[a]');
    } else if (musicFile) {
      args.push('-i', musicFile);
      args.push('-filter_complex', `[1:a]volume=${options.musicVol}[a]`, '-map', '0:v', '-map', '[a]');
    } else if (audioFile) {
      args.push('-i', audioFile);
      args.push('-map', '0:v', '-map', '1:a');
    }

    args.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', finalVideoPath);

    await new Promise((resolve, reject) => {
      const proc = spawn(ffmpegPath, args);
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Audio mux failed with code ${code}`));
      });
    });
  } else {
    fs.copyFileSync(rawVideoPath, finalVideoPath);
  }

  const finalStats = fs.statSync(finalVideoPath);
  console.log(`\n==============================================`);
  console.log(`✓ FINAL VIDEO RENDER COMPLETE:`);
  console.log(`File: ${finalVideoPath}`);
  console.log(`Size: ${(finalStats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`==============================================`);
  process.exit(0);
}

main().catch(err => {
  console.error("Error in render.mjs:", err);
  process.exit(1);
});
