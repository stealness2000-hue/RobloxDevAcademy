// Renders assets/icon.png (512x512) from an inline SVG using Electron. Run: npx electron scripts/make-icon.cjs
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect x="16" y="16" width="480" height="480" rx="112" fill="#527CFF"/>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#g)"/>
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
  <g fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round">
    <path d="M196 150c-40 0-52 18-52 52v26c0 22-12 28-34 28 22 0 34 6 34 28v26c0 34 12 52 52 52"/>
    <path d="M316 150c40 0 52 18 52 52v26c0 22 12 28 34 28-22 0-34 6-34 28v26c0 34-12 52-52 52"/>
  </g>
  <circle cx="256" cy="256" r="26" fill="#fff"/>
</svg>`;
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 512, height: 512, show: false, frame: false, transparent: true, webPreferences: { offscreen: true } });
  await win.loadURL('data:text/html,' + encodeURIComponent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`));
  await new Promise((r) => setTimeout(r, 400));
  const img = await win.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 });
  fs.mkdirSync(path.join(__dirname, '..', 'assets'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'icon.png'), img.toPNG());
  app.quit();
});
