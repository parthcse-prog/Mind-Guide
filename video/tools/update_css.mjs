import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update .ct and browser frame CSS in <style>
const oldStyleMatch = `    .ct {
      position: relative;
      width: 1520px;
      height: 820px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0 auto;
    }`;

const newStyleReplacement = `    .ct {
      position: relative;
      width: 1680px;
      height: 820px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 50px;
      margin: 0 auto;
    }

    /* Narrative column styling */
    .narrative-col {
      width: 480px;
      flex-shrink: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
    }

    /* Showcase column styling */
    .showcase-col {
      width: 1150px;
      height: 640px;
      flex-shrink: 0;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
    }

    /* Clean Desktop Browser Frame for Readable Product Screenshots */
    .browser-frame {
      position: relative;
      width: 1150px;
      height: 640px;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 28px 70px -15px rgba(15, 23, 42, 0.22), 0 10px 30px -8px rgba(15, 118, 110, 0.12);
      border: 1.5px solid rgba(226, 232, 240, 0.95);
      display: flex;
      flex-direction: column;
      transform-origin: center center;
      will-change: transform, opacity;
    }

    .browser-header {
      height: 38px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      flex-shrink: 0;
      user-select: none;
    }

    .browser-dots {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .browser-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }

    .browser-url {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 3px 12px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      max-width: 380px;
    }

    .browser-badge {
      margin-left: auto;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(15, 118, 110, 0.08);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .browser-content {
      position: relative;
      width: 100%;
      flex: 1;
      overflow: hidden;
      background: #f8fafc;
    }

    .browser-content img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
      image-rendering: -webkit-optimize-contrast;
    }`;

if (!html.includes(oldStyleMatch)) {
  console.error("Could not find oldStyleMatch!");
  process.exit(1);
}

html = html.replace(oldStyleMatch, newStyleReplacement);

// Update typography sizes slightly so they fit neatly in 480px narrative-col
html = html.replace(
  `.h1 {
      font-size: 72px;
      line-height: 1.08;`,
  `.h1 {
      font-size: 48px;
      line-height: 1.12;`
);

html = html.replace(
  `.h2 {
      font-size: 54px;
      line-height: 1.14;`,
  `.h2 {
      font-size: 40px;
      line-height: 1.16;`
);

html = html.replace(
  `.lead {
      font-size: 22px;
      line-height: 1.45;
      font-weight: 400;
      color: var(--muted);
      max-width: 640px;
    }`,
  `.lead {
      font-size: 17px;
      line-height: 1.5;
      font-weight: 400;
      color: var(--muted);
      max-width: 480px;
    }`
);

fs.writeFileSync(indexPath, html);
console.log("Updated CSS styles successfully.");
