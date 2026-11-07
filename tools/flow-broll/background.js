// Фон: справжні кліки (Flow ігнорує синтетичні), завантаження MP4 і передача його локальному серверу.
const SERVER = 'http://127.0.0.1:5177';

// Іконка розширення: показати/сховати панель у вкладці Flow.
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url?.startsWith('https://flow.google.com/')) chrome.tabs.sendMessage(tab.id, { type: 'togglePanel' }).catch(() => {});
  else chrome.tabs.create({ url: 'https://flow.google.com/' });
});

// ponytail: debugger лишається підключеним до кінця черги; Chrome показує жовту смугу «налагоджується» — це воно.
const attached = new Set();
async function attach(tabId) {
  if (attached.has(tabId)) return;
  await chrome.debugger.attach({ tabId }, '1.3');
  attached.add(tabId);
}
chrome.debugger.onDetach.addListener(({ tabId }) => attached.delete(tabId));
const cdp = (tabId, method, params) => chrome.debugger.sendCommand({ tabId }, method, params);

async function json(r) {
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}
async function server(pathname, init) {
  try {
    return await json(await fetch(SERVER + pathname, init));
  } catch (e) {
    if (e instanceof TypeError) throw new Error('Локальний сервер не запущений: node tools/flow-broll/server.js');
    throw e;
  }
}

const handlers = {
  async trustedClick({ tabId, x, y }) {
    await attach(tabId);
    const p = { x, y, button: 'left', clickCount: 1 };
    await cdp(tabId, 'Input.dispatchMouseEvent', { ...p, type: 'mouseMoved' });
    await cdp(tabId, 'Input.dispatchMouseEvent', { ...p, type: 'mousePressed' });
    await cdp(tabId, 'Input.dispatchMouseEvent', { ...p, type: 'mouseReleased' });
  },
  async detach({ tabId }) {
    if (attached.has(tabId)) await chrome.debugger.detach({ tabId }).catch(() => {});
  },
  catalog: () => server('/catalog'),
  // fetch з service worker не проходить (куки Flow), chrome.downloads відкриває «Зберегти як».
  // Тому качаємо від імені самої вкладки Flow через DevTools-протокол і віддаємо байти серверу.
  async save({ tabId, id, src }) {
    await attach(tabId);
    const { frameTree } = await cdp(tabId, 'Page.getFrameTree');
    const { resource } = await cdp(tabId, 'Network.loadNetworkResource', {
      frameId: frameTree.frame.id, url: src, options: { disableCache: false, includeCredentials: true },
    });
    if (!resource.success) throw new Error(`завантаження відео: HTTP ${resource.httpStatusCode || resource.netErrorName}`);
    const parts = [];
    for (;;) {
      const r = await cdp(tabId, 'IO.read', { handle: resource.stream, size: 1 << 20 });
      if (r.data) parts.push(r.base64Encoded ? Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0)) : new TextEncoder().encode(r.data));
      if (r.eof) break;
    }
    await cdp(tabId, 'IO.close', { handle: resource.stream });
    return server(`/save?id=${id}`, { method: 'POST', body: new Blob(parts) });
  },
};

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  const h = handlers[msg.type];
  if (!h) return false;
  Promise.resolve(h({ tabId: sender.tab?.id, ...msg }))
    .then((v) => reply({ ok: true, v }), (e) => reply({ ok: false, error: e.message }));
  return true;
});
