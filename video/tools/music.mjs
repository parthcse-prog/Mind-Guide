import fs from 'fs';
import path from 'path';
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

function computeTimeline() {
  let cursor = PACE.lead;
  const sEnds = [];
  SCRIPT.forEach((chunks, sIdx) => {
    chunks.forEach((chunk, cIdx) => {
      const words = chunk.trim().split(/\s+/).filter(Boolean);
      cursor += words.length * PACE.perWord;
      if (cIdx < chunks.length - 1) cursor += PACE.chunkGap;
    });
    sEnds.push(cursor);
    cursor += PACE.sentGap;
  });
  const duration = cursor - PACE.sentGap + PACE.outro;
  return { duration, transitions: sEnds.slice(0, -1) };
}

function generateWav(durationSeconds, transitionTimes, bpm = 110) {
  const sampleRate = 44100;
  const numChannels = 2;
  const bytesPerSample = 2;
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const notes = {
    D2: 73.42, Fs2: 92.50, A2: 110.0, B2: 123.47,
    D3: 146.83, E3: 164.81, Fs3: 185.0, G3: 196.0, A3: 220.0, B3: 246.94,
    Cs4: 277.18, D4: 293.66, E4: 329.63, Fs4: 369.99, A4: 440.0, B4: 493.88
  };

  const beatSec = 60 / bpm;
  let offset = 44;

  console.log(`Synthesizing ${durationSeconds.toFixed(1)}s of algorithmic audio at ${bpm} BPM...`);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Ambient Pad (chords evolving every 8 beats)
    const chordProgressions = [
      [notes.D3, notes.Fs3, notes.A3],
      [notes.B2, notes.D3, notes.Fs3],
      [notes.G3, notes.B3, notes.D4],
      [notes.A2, notes.Cs4, notes.E4]
    ];
    const chordIdx = Math.floor(t / (beatSec * 8)) % chordProgressions.length;
    const currentChord = chordProgressions[chordIdx];
    
    let pad = 0;
    for (const freq of currentChord) {
      pad += Math.sin(2 * Math.PI * freq * t) * 0.08;
      pad += Math.sin(2 * Math.PI * (freq * 1.003) * t) * 0.05;
    }

    // Gentle Arpeggio (16th notes)
    const arpSeq = [notes.D4, notes.Fs4, notes.A4, notes.D4, notes.Fs4, notes.B4, notes.A4, notes.Fs4];
    const arpIdx = Math.floor(t / (beatSec / 4)) % arpSeq.length;
    const arpEnv = Math.exp(-((t % (beatSec / 4)) * 12));
    const arp = Math.sin(2 * Math.PI * arpSeq[arpIdx] * t) * 0.07 * arpEnv;

    // Sub-bass
    let bass = 0;
    if (t > 8.0 && t < durationSeconds - 5.0) {
      const bassNote = currentChord[0] / 2;
      const bassEnv = Math.exp(-((t % beatSec) * 3));
      bass = Math.sin(2 * Math.PI * bassNote * t) * 0.12 * bassEnv;
    }

    // Soft beat
    let beat = 0;
    if (t > 20.0 && t < 82.0) {
      const beatPhase = (t % beatSec) / beatSec;
      if (beatPhase < 0.15) {
        const kickPitch = 90 * Math.exp(-beatPhase * 35);
        beat += Math.sin(2 * Math.PI * kickPitch * t) * 0.14 * Math.exp(-beatPhase * 25);
      }
      const hatPhase = (t % (beatSec / 2)) / (beatSec / 2);
      if (hatPhase < 0.08) {
        beat += (Math.random() * 2 - 1) * 0.02 * Math.exp(-hatPhase * 40);
      }
    }

    // Transition whooshes
    let whoosh = 0;
    for (const transT of transitionTimes) {
      if (t >= transT - 0.7 && t <= transT) {
        const p = (t - (transT - 0.7)) / 0.7;
        whoosh += (Math.random() * 2 - 1) * 0.06 * Math.pow(p, 2.5);
      }
    }

    // Master envelope
    let masterEnv = 1.0;
    if (t < 2.0) masterEnv = t / 2.0;
    if (t > durationSeconds - 3.5) masterEnv = Math.max(0, (durationSeconds - t) / 3.5);

    const leftSig = (pad * 1.05 + arp * 0.8 + bass + beat + whoosh) * masterEnv;
    const rightSig = (pad * 0.95 + arp * 1.2 + bass + beat + whoosh) * masterEnv;

    const leftInt = Math.max(-32767, Math.min(32767, Math.floor(leftSig * 32767)));
    const rightInt = Math.max(-32767, Math.min(32767, Math.floor(rightSig * 32767)));

    buffer.writeInt16LE(leftInt, offset);
    buffer.writeInt16LE(rightInt, offset + 2);
    offset += 4;
  }

  return buffer;
}

function run() {
  console.log("=== COMPOSING ORIGINAL SOUNDTRACK (music.mjs) ===");
  const musicDir = path.resolve(__dirname, '../music');
  if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });

  const { duration, transitions } = computeTimeline();
  console.log(`Video duration: ${duration.toFixed(2)}s | Transition points: ${transitions.map(t => t.toFixed(1)).join(', ')}s`);

  const wavBuffer = generateWav(duration, transitions, 120);
  const outPath = path.join(musicDir, 'bg-music.wav');
  fs.writeFileSync(outPath, wavBuffer);

  const stats = fs.statSync(outPath);
  console.log(`✓ Generated background music: ${outPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
  process.exit(0);
}

run();
