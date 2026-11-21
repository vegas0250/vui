// Renders raster brand assets from public/vui-mark.svg with Playwright Chromium.
// Output (public/): favicon.ico (16/32/48), apple-touch-icon.png (180), icon-192.png, icon-512.png,
// icon-maskable-512.png, og.png (1200x630). Run: node scripts/brand-assets.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const pub = (name) => resolve(root, 'public', name);
const mark = readFileSync(pub('vui-mark.svg'), 'utf8');
const markUri = `data:image/svg+xml;base64,${Buffer.from(mark).toString('base64')}`;

// Bundled Chromium when installed, else the system Edge/Chrome channel (PW_CHANNEL=msedge|chrome).
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function render(html, width, height, transparent = true) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:transparent}</style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ omitBackground: transparent, type: 'png' });
}

const icon = (size, pad = 0, bg = '') =>
  render(`<div style="width:${size}px;height:${size}px;display:grid;place-items:center;${bg}"><img src="${markUri}" style="width:${size - pad * 2}px;height:${size - pad * 2}px"></div>`, size, size, !bg);

const png16 = await icon(16), png32 = await icon(32), png48 = await icon(48);
writeFileSync(pub('icon-192.png'), await icon(192));
writeFileSync(pub('icon-512.png'), await icon(512));
// iOS masks its own corners: opaque full-bleed brand background with the mark inset.
writeFileSync(pub('apple-touch-icon.png'), await icon(180, 0, 'background:#4f56d9'));
// Maskable: safe zone is the inner 80 %.
writeFileSync(pub('icon-maskable-512.png'), await icon(512, 56, 'background:linear-gradient(135deg,#6d74ff,#4f56d9 55%,#0e7f86)'));

// ICO container with embedded PNG images (supported by all current browsers and Windows).
const images = [[16, png16], [32, png32], [48, png48]];
const header = Buffer.alloc(6 + images.length * 16);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach(([size, data], i) => {
  const e = 6 + i * 16;
  header.writeUInt8(size, e); header.writeUInt8(size, e + 1); header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(data.length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += data.length;
});
writeFileSync(pub('favicon.ico'), Buffer.concat([header, ...images.map(([, d]) => d)]));

const og = `
<div style="width:1200px;height:630px;box-sizing:border-box;padding:84px 96px;display:flex;flex-direction:column;justify-content:space-between;
  font-family:'Segoe UI Variable Display','Segoe UI',system-ui,sans-serif;color:#e7e9f0;
  background:radial-gradient(900px 520px at 85% 10%,rgba(109,116,255,.30),transparent 60%),radial-gradient(700px 480px at 10% 100%,rgba(14,127,134,.28),transparent 60%),#0e1016">
  <div style="display:flex;align-items:center;gap:28px">
    <img src="${markUri}" style="width:112px;height:112px">
    <div style="font-size:96px;font-weight:700;letter-spacing:4px">VUI</div>
  </div>
  <div>
    <div style="font-size:58px;font-weight:650;line-height:1.12;max-width:980px">Компоненты и темы интерфейса</div>
    <div style="margin-top:22px;font-size:30px;color:#9ca3b4">Web Components · VUI Light / VUI Dark · Theme Studio</div>
  </div>
  <div style="display:flex;gap:14px">
    ${['#4f56d9', '#8d95ff', '#0e7f86', '#5ccfc2', '#f5f6f8', '#151821'].map((c) => `<span style="width:56px;height:14px;border-radius:7px;background:${c};box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)"></span>`).join('')}
  </div>
</div>`;
writeFileSync(pub('og.png'), await render(og, 1200, 630, false));

await browser.close();
console.log('brand assets written to public/');
