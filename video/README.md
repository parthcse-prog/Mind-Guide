# Saarthi.ai — Script-Driven Product Demo Video (HTML → MP4)

A high-fidelity, 1920×1080 @ 30 fps motion-graphics product explainer video built as a self-contained Web Animations API (`WAAPI`) application in `index.html`, paired with a headless Node.js rendering toolchain.

---

## 📁 File Structure

```text
video/
├── index.html              # Master WAAPI demo video (single file, single clock)
├── package.json            # Node project configuration (ESM modules)
├── README.md               # Video architecture, screenshot registry & render manual
│
├── shots/                  # High-resolution screenshot crops and brand assets
│   ├── Saarthi.png         # Hero landing page device screen (Scene 0)
│   ├── Agent.png           # 3D Dr. Alex counselor conversation interface (Scene 1)
│   ├── Agent 2.png         # Secondary interactive counselor dialog panel (Scene 1)
│   ├── Councellors.png     # Four specialized counselor selection cards (Scene 2)
│   ├── Session Report.png  # Historical session report overview (Scene 3)
│   ├── Report 1.png        # SWOT analysis matrix & PDF export modal (Scene 3)
│   ├── Roadmap 2.png       # Day-wise milestone progression roadmap (Scene 4)
│   ├── Profile.png         # User profile with verified achievements (Scene 4)
│   ├── Resume.png          # Overall ATS Resume score card (Scene 5)
│   ├── Resume 2.png        # Competency radar chart visualization (Scene 5)
│   ├── Resume 3.png        # Before/After bullet point rewrite audit (Scene 5)
│   ├── Job.png             # Smart Job Board live opportunities & match % (Scene 6)
│   ├── logo.png            # MIET Saarthi official logo lockup
│   ├── badge.png           # MIET verified competency badge asset
│   └── mindd.png           # Brand neural asset
│
├── tools/                  # Headless Playwright & ffmpeg toolchain
│   ├── render.mjs          # Chunked parallel renderer (libx264, concat demuxer, audio mux)
│   ├── verify.mjs          # Automated keyframe extractor & index.json generator
│   ├── sheet.mjs           # Multi-frame contact sheet builder (review/contact-sheet-*.jpg)
│   ├── music.mjs           # Procedural transition-synced soundtrack generator (.wav)
│   ├── _campath.mjs        # Anti-tremor and camera path linter (MICRO, TILT, FAST)
│   └── _jitter.mjs         # Sub-pixel frame-to-frame stability and jitter analyzer
│
├── music/
│   └── bg-music.wav        # Transition-synchronized original background audio
│
├── review/
│   ├── contact-sheet-1.jpg # Visual review contact sheet (Scenes 0–3)
│   ├── contact-sheet-2.jpg # Visual review contact sheet (Scenes 4–7)
│   └── frames/             # Full 1080p keyframes with index.json
│
└── render/
    └── test_range_56_60.mp4# Verified transition test clip
```

---

## 🎨 Visual Architecture & Brand System

- **Fixed Stage**: `#stage` at 1920×1080, automatically scaled to window for preview.
- **Layers**:
  - `#bg`: Solid `#f8fafc` with a masked 80px grid (`radial-gradient` mask to prevent edge flicker).
  - `#camera`: Contains `#cam-inner`, hosting all 8 scene sections.
  - `#camblur`: Directional motion-blur simulator during fast moves.
  - `#fg`: Parallax layer floating at 1.4× camera motion with ambient glowing nodes and status pills.
- **Scene Isolation Rule**:
  - Each scene is `<section class="scene" id="scN"><div class="out"><div class="ct">...</div></div></section>`.
  - In-transitions animate `section.scene`; out-transitions animate `.out`.
  - Scenes have explicit holds ensuring strict `opacity: 0` before entrance and after completion.
- **Frosted-Glass Styling**:
  - Pure translucent white gradient (`linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 100%)`).
  - Crisp `1.5px solid rgba(255, 255, 255, 0.95)` border with multi-layered soft drop shadows. No `backdrop-filter` is used to prevent camera layer clipping.
- **Brand Palette**:
  - `--accent`: `#0f766e` (Deep Teal / MIET Saarthi)
  - `--hi`: `#0284c7` (Electric Sky Blue)
  - `--sec`: `#0f172a` (Slate 900)
  - `--warm`: `#f43f5e` (Rose Accent)
  - `--amber`: `#f59e0b` (Verified Gold)

---

## ⏱️ Voice-Over Retiming & Speed Controls

The video is mathematically synchronized to the narrator's voice:

```javascript
const SCRIPT = [
  ["Hello and welcome to Saarthi.ai,", "your personalized AI companion", ...],
  // ... 8 sentences split into breath chunks
];

const VO = {}; // Optional: populate with recorded voice timings, e.g. { 0: [0.0, 7.8], 1: [8.2, 19.4] }
const PACE = { lead: 1.4, perWord: 0.42, chunkGap: 0.24, sentGap: 0.8, outro: 3.5 };
const MS = 1.15; // Global entrance speed factor (>1 = softer, slower entrances)
```

- `S(i)` returns `{start, end, words}` for sentence `i`.
- `W(i, 'wordPrefix', nth)` queries the exact second that word is spoken.
- **Zero hardcoded timings**: all camera pushes, text reveals, and highlight rings are anchored to `W(...)` cues.
- Adding real audio timings into `VO` automatically retimes the entire video without manual adjustments.

---

## 📷 Camera & Transitions Reference

### Anti-Tremor Rules (Enforced in `_campath.mjs`)
1. **Zero Sub-Degree Tilts**: Tilts under 1.0° are automatically discarded.
2. **Opening & Close Tilts Only**: Deliberate tilts are restricted to Scene 0 (-2.0°) and Scene 7 (+1.0°).
3. **No Tremor Moves**: Displacements under 40px within 1.5s with negligible zoom are snapped into steady holds.
4. **Varied Transitions**: Consecutive scenes never share transition styles:
   - `Scene 0 → 1`: Circular reveal (`ring`)
   - `Scene 1 → 2`: Lateral slide (`push left`)
   - `Scene 2 → 3`: Gradient horizontal wipe (`wipeX`)
   - `Scene 3 → 4`: Focal zoom-through (`zoom`)
   - `Scene 4 → 5`: Dynamic fly-through (`zoomPast`)
   - `Scene 5 → 6`: Element crossfade (`morph`)
   - `Scene 6 → 7`: Atmospheric blur fade (`blur`)

---

## 🛠️ CLI Toolchain & Commands

### 1. Interactive Preview
Open `index.html` in Chrome:
- **Sticky Media Player Bar**: Full-width fixed control dock pinned to the bottom of the viewport.
- **Sliced Chapter Progress Bar**: Proportional segmented timeline with 8 interactive chapter slices (`Intro`, `3D Mentors`, `Past Memory`, `SWOT Report`, `Visual Roadmap`, `ATS Analyzer`, `Smart Jobs`, `Outro Lockup`).
  - Hover over slices for interactive tooltips (`Chapter Name · Timecode`).
  - Click or drag on any slice to scrub to that narrative beat.
- **Player Controls**:
  - `Play / Pause`: Toggle video playback (or press `Space`).
  - `Restart`: Instantly rewind to `00:00.0` and play from the beginning (or press `Home`).
  - `Time Readout`: Current time / total duration (`00:00.0 / 01:34.8`) alongside the active chapter badge.
  - `Fullscreen`: Expand/exit fullscreen mode with full resolution scaling (or press `F`).
- **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `←` / `→`: Step 1 second
  - `Shift + ←` / `Shift + →`: Step 5 seconds
  - `Home`: Restart from 00:00
  - `F`: Toggle Fullscreen
- **Image Drag & Drop**: Drag any screenshot directly onto a `.shot` card to live-preview new assets.

### 2. Lint Camera Path
```bash
node tools/_campath.mjs
```
*Validates zero MICRO moves, zero TILT reversals, and zero velocity spikes.*

### 3. Keyframe Verification & Contact Sheets
```bash
node tools/verify.mjs
node tools/sheet.mjs
```
*Captures all 16 keyframes and renders `review/contact-sheet-1.jpg` and `review/contact-sheet-2.jpg`.*

### 4. Synthesize Background Soundtrack
```bash
node tools/music.mjs
```
*Composes a transition-synchronized 44.1kHz 16-bit WAV soundtrack (`music/bg-music.wav`).*

### 5. Render Test Clip
```bash
node tools/render.mjs --range 56,60
```
*Renders a 4-second MP4 test clip around the hardest transition (`render/test_range_56_60.mp4`).*

### 6. Full MP4 Video Production
```bash
node tools/render.mjs
```
*Renders 20-second chunk files in parallel, joins them via ffmpeg concat demuxer, and muxes background music.*
