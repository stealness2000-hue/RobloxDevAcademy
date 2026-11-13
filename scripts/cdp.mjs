// Minimal Chrome DevTools Protocol driver for the running Electron app (used by the e2e acceptance test).
// Usage as module: const page = await connect(9333); await page.eval('1+1'); await page.shot('a.png');
import fs from 'node:fs';

export async function connect(port = 9333, timeoutMs = 20000) {
  const start = Date.now();
  let target;
  while (!target) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === 'page' && /^(app:|http:\/\/localhost)/.test(t.url));
    } catch {
      /* not up yet */
    }
    if (!target) {
      if (Date.now() - start > timeoutMs) throw new Error('App page not found via CDP');
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  const send = (method, params = {}) => new Promise((res) => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const page = {
    send,
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result?.exceptionDetails) throw new Error(`eval failed: ${r.result.exceptionDetails.exception?.description ?? JSON.stringify(r.result.exceptionDetails)}`);
      return r.result?.result?.value;
    },
    async shot(file) {
      await send('Page.bringToFront');
      const r = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
    },
    /** Real mouse click in the centre of the element matching `selector`. */
    async click(selector) {
      const rect = await page.eval(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 60), y: r.top + r.height / 2 }; })()`);
      if (!rect) throw new Error(`No element for ${selector}`);
      for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
    },
    /** Types like a user: one key event per character (editor auto-closing applies). */
    async type(text) {
      for (const ch of text) {
        if (ch === '\n') {
          await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
          await new Promise((r) => setTimeout(r, 120));
          continue;
        }
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ch, text: ch, unmodifiedText: ch });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch });
        await new Promise((r) => setTimeout(r, Number(process.env.E2E_KEY_DELAY ?? 90))); // EditContext processes input asynchronously
      }
    },
    async insertText(text) {
      await send('Input.insertText', { text });
    },
    async key(key, code, keyCode, modifiers = 0) {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, modifiers });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, modifiers });
    },
    async waitFor(expr, timeout = 10000) {
      const t0 = Date.now();
      for (;;) {
        const v = await page.eval(expr).catch(() => false);
        if (v) return v;
        if (Date.now() - t0 > timeout) throw new Error(`Timed out waiting for: ${expr}`);
        await new Promise((r) => setTimeout(r, 150));
      }
    },
    close() {
      ws.close();
    },
  };
  return page;
}
