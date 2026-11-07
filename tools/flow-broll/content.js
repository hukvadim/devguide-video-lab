// Панель Flow B-roll прямо на сторінці Flow + автоматизація кроків.
// Селектори прив'язані до українського інтерфейсу Flow (листопад 2026). Якщо Flow змінить UI — правити тут.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const visible = (el) => el && el.getBoundingClientRect().width > 0;
const byAria = (...labels) =>
  [...document.querySelectorAll('button')].find((b) => labels.includes(b.getAttribute('aria-label') || '') && visible(b));
const center = (el) => {
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
};
const fakeClick = (el) => {
  for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'])
    el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
};
async function waitFor(fn, ms = 8000) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(250)) {
    const v = fn();
    if (v) return v;
  }
  return null;
}
async function bg(msg) {
  const r = await chrome.runtime.sendMessage(msg);
  if (!r?.ok) throw new Error(r?.error || 'розширення не відповідає — онови сторінку');
  return r.v;
}

// ---------------- Flow: кроки ----------------
async function addRef(name) {
  const plus = await waitFor(() => byAria('Додати інгредієнти у вікно запиту', 'Add ingredients to prompt'));
  if (!plus) throw new Error('Не знайшов кнопку «+» (інгредієнти)');
  plus.click();
  const search = await waitFor(() => document.querySelector('input[aria-label="Пошук об’єктів"], input[aria-label="Search assets"]'));
  if (!search) throw new Error('Не відкрилось меню інгредієнтів');
  search.focus();
  search.value = name;
  search.dispatchEvent(new Event('input', { bubbles: true }));
  const item = await waitFor(() =>
    [...document.querySelectorAll('.asset-item-container')].find((e) => e.innerText.includes(name))
  );
  if (!item) throw new Error(`Референс «${name}» не знайдено в цьому проєкті Flow`);
  fakeClick(item);
  const add = await waitFor(() => document.querySelector('button.detail-add-to-prompt-btn'));
  if (!add) throw new Error('Немає кнопки «Додати до запиту»');
  add.click();
  await sleep(800);
}

async function prepare(prompt, refs) {
  byAria('Почати новий сеанс', 'Start new session')?.click();
  await sleep(1200);
  byAria('Очистити запит', 'Clear prompt')?.click();
  await sleep(500);
  for (const r of refs) await addRef(r);
  const pm = await waitFor(() => document.querySelector('.ProseMirror'));
  if (!pm) throw new Error('Немає поля запиту');
  pm.focus();
  document.execCommand('insertText', false, prompt);
  await sleep(600);
  const go = byAria('Почати створення', 'Start creating');
  if (!go) throw new Error('Немає кнопки «Почати створення»');
  return center(go);
}

// Нові плитки Flow кладе зверху сітки. Після генерації агент перейменовує плитку,
// тому «нашу» шукаємо так: верхня плитка, якої не було в знімку до запуску.
function tiles() {
  document.querySelector('.page-container')?.scrollTo(0, 0);
  return [...document.querySelectorAll('flow-grid-tile-container')];
}
// ponytail: у pending/error-плитки нема картинки — тоді id = підпис; збіг підписів дасть хибне «не нове», ціна — таймаут.
const tileId = (t) => t.querySelector('img')?.src || 'aria:' + (t.getAttribute('aria-label') || '');

async function tileState(tile) {
  if (tile.querySelector('flow-pending-tile')) return { state: 'pending' };
  if (tile.querySelector('flow-error-tile'))
    return { state: 'failed', reason: tile.querySelector('.error-subtitle')?.innerText || 'помилка Flow' };
  if (!tile.querySelector('video')) {
    for (const el of [tile.querySelector('flow-video-tile .container'), tile.querySelector('img')]) // <video> з'являється лише при наведенні миші
      for (const ty of ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'mousemove'])
        el?.dispatchEvent(new MouseEvent(ty, { bubbles: !ty.endsWith('enter'), view: window }));
    await waitFor(() => tile.querySelector('video')?.src, 4000);
  }
  const src = tile.querySelector('video')?.src;
  return src ? { state: 'ready', src } : { state: 'pending' };
}
async function newTile(before) {
  const seen = new Set(before);
  const top = tiles().find((t) => !seen.has(tileId(t)));
  return top ? tileState(top) : { state: 'none' };
}

// ---------------- черга ----------------
const TEST5 = ['019', '030', '064', '096', '140'];
const DEFAULTS = {
  refs: 'avatar2-2000, 36d6f794',
  base: 'Vertical 9:16 smartphone B-roll. One continuous shot, one clear action. Keep the important action in the central area. No dialogue, captions, logos or readable interface text.',
  refSuffix: 'Match the person’s face, hair and beard to the supplied reference. Keep his appearance consistent throughout the shot.',
  timeout: 10,
};
let settings = { ...DEFAULTS };
let items = [];
let selected = new Set();
let faceOverride = {};
let fails = {};
let srcs = {}; // id → посилання на вже згенероване, ще не збережене відео (повтор без нових кредитів)
let current = null;
let stopReq = false;
const faceOf = (it) => faceOverride[it.id] ?? it.face;
const pending = () => items.filter((i) => !i.legacy && !i.done);

async function generate(it) {
  const face = faceOf(it);
  const refs = face ? settings.refs.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const before = tiles().map(tileId);
  const go = await prepare(buildPrompt(it, face, settings), refs);
  await bg({ type: 'trustedClick', ...go });
  log(`${it.id}: запит надіслано${face ? ' з фото' : ''}`);
  const end = Date.now() + Number(settings.timeout) * 60e3;
  let approved = false;
  let last = '';
  while (Date.now() < end) {
    if (stopReq) throw new Error('зупинено');
    await sleep(4000);
    if (!approved) {
      // «Розпочати генерування … за N кредитів?» — варіанти відповіді це div[role=radio], беремо останній на екрані
      const a = [...document.querySelectorAll('flow-permission-message [role=radio]')]
        .filter((e) => visible(e) && /^(check\s*)?(Схвалити|Approve)$/i.test(e.innerText.trim()))
        .pop();
      if (a) {
        await bg({ type: 'trustedClick', ...center(a) });
        approved = true;
        log(`${it.id}: схвалено, Flow генерує…`);
        continue;
      }
    }
    const s = await newTile(before);
    if (s.state !== last) last = s.state;
    if (s.state === 'failed') throw new Error(s.reason);
    if (s.state === 'ready') return s.src;
  }
  throw new Error('таймаут — глянь у Flow, кліп міг ще догенеруватись');
}

async function runQueue() {
  const queue = items.filter((i) => selected.has(i.id) && !i.done);
  if (!queue.length) return log('Нічого не вибрано.');
  stopReq = false;
  ui.start.disabled = true;
  ui.stop.disabled = false;
  log(`Старт: ${queue.length} кліп(ів)`);
  for (const it of queue) {
    if (stopReq) break;
    current = it.id;
    render();
    try {
      if (srcs[it.id]) log(`${it.id}: відео вже згенероване раніше — лише зберігаю`);
      const src = srcs[it.id] || (await generate(it));
      srcs[it.id] = src;
      chrome.storage.local.set({ srcs });
      const r = await bg({ type: 'save', id: it.id, src });
      delete srcs[it.id];
      it.done = true;
      selected.delete(it.id);
      delete fails[it.id];
      log(`${it.id}: ✅ збережено ${r.file} (${(r.size / 1e6).toFixed(1)} МБ)`);
    } catch (e) {
      fails[it.id] = e.message;
      log(`${it.id}: ❌ ${e.message}`);
      if (/зупинено|сервер|розширення/.test(e.message)) break;
    }
    chrome.storage.local.set({ fails, srcs });
  }
  current = null;
  await bg({ type: 'detach' }).catch(() => {});
  ui.start.disabled = false;
  ui.stop.disabled = true;
  log('Черга завершена.');
  render();
}

// ---------------- панель ----------------
const ui = {};
function log(msg) {
  ui.log.textContent = `${new Date().toLocaleTimeString('uk-UA')} ${msg}\n` + ui.log.textContent;
}

function render() {
  const done = items.filter((i) => i.done).length;
  ui.stats.textContent = `${done}/${items.length} готово · вибрано ${selected.size}`;
  ui.list.textContent = '';
  let section = '';
  for (const it of items) {
    if (it.section !== section) {
      section = it.section;
      const h = document.createElement('h3');
      h.textContent = section;
      ui.list.append(h);
    }
    const row = document.createElement('label');
    row.className = 'item' + (it.done ? ' done' : '');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = selected.has(it.id);
    cb.disabled = it.done;
    cb.onchange = () => { cb.checked ? selected.add(it.id) : selected.delete(it.id); render(); };
    const t = document.createElement('span');
    t.className = 't';
    t.textContent = `${it.id} · ${it.title}`;
    t.title = it.scene;
    const side = document.createElement('span');
    side.className = 'side';
    if (current === it.id) side.textContent = '⏳';
    else if (it.done) side.textContent = '✓';
    else {
      const f = document.createElement('button');
      f.className = 'face' + (faceOf(it) ? ' on' : '');
      f.textContent = faceOf(it) ? 'фото' : 'без';
      f.title = 'Додавати фото-референс обличчя?';
      f.onclick = (e) => { e.preventDefault(); faceOverride[it.id] = !faceOf(it); chrome.storage.local.set({ faceOverride }); render(); };
      side.append(f);
      if (fails[it.id]) { side.title = fails[it.id]; side.append(' ⚠'); }
    }
    row.append(cb, t, side);
    ui.list.append(row);
  }
}

async function reload() {
  try {
    items = await bg({ type: 'catalog' });
    render();
  } catch (e) {
    log(e.message);
  }
}

function mountPanel() {
  const host = document.createElement('div');
  host.id = 'flow-broll-panel';
  host.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
<style>
  .p{width:360px;max-height:80vh;display:flex;flex-direction:column;background:#141414;color:#eee;border:1px solid #333;border-radius:12px;
     font:12px/1.35 system-ui,sans-serif;box-shadow:0 8px 30px #000a;overflow:hidden}
  .hd{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;cursor:pointer;background:#1d1d1d}
  .hd b{font-size:13px} .st{color:#999}
  .body{display:flex;flex-direction:column;min-height:0}
  .row{display:flex;gap:4px;flex-wrap:wrap;padding:6px 10px}
  button{background:#2a2a2a;color:#eee;border:1px solid #3a3a3a;border-radius:6px;padding:4px 8px;cursor:pointer;font:inherit}
  button.go{background:#7aa7ff;color:#000;border-color:#7aa7ff;font-weight:600}
  button:disabled{opacity:.4;cursor:default}
  pre{flex-shrink:0;min-height:54px;margin:0 10px 6px;max-height:90px;overflow:auto;background:#0a0a0a;border-radius:6px;padding:5px 7px;white-space:pre-wrap;font:11px ui-monospace,monospace;color:#bbb}
  .list{overflow:auto;padding:0 10px 10px;min-height:120px}
  h3{font-size:11px;color:#888;text-transform:uppercase;margin:10px 0 2px}
  .item{display:flex;gap:6px;align-items:center;padding:3px 0;border-bottom:1px solid #222;cursor:pointer}
  .item .t{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .item.done .t{color:#3ecf7a}
  .side{white-space:nowrap;color:#3ecf7a}
  .face{padding:1px 6px;font-size:11px;color:#888} .face.on{color:#7aa7ff}
  .p.min .body{display:none}
</style>
<div class="p">
  <div class="hd"><b>Flow B-roll</b><span class="st"></span></div>
  <div class="body">
    <div class="row">
      <button data-a="test">Тест 5</button><button data-a="next">Наступні 10</button>
      <button data-a="all">Усі</button><button data-a="none">Зняти</button>
      <button class="go" data-a="start">▶ Старт</button><button data-a="stop" disabled>■ Стоп</button>
    </div>
    <pre></pre>
    <div class="list"></div>
  </div>
</div>`;
  const $ = (s) => root.querySelector(s);
  Object.assign(ui, { panel: $('.p'), stats: $('.st'), log: $('pre'), list: $('.list'), start: $('[data-a=start]'), stop: $('[data-a=stop]') });
  $('.hd').onclick = () => ui.panel.classList.toggle('min');
  const act = {
    test: () => (selected = new Set(TEST5.filter((id) => pending().some((i) => i.id === id)))),
    next: () => (selected = new Set(pending().slice(0, 10).map((i) => i.id))),
    all: () => (selected = new Set(pending().map((i) => i.id))),
    none: () => selected.clear(),
  };
  root.querySelectorAll('[data-a]').forEach((b) => {
    b.onclick = () => {
      if (b.dataset.a === 'start') return runQueue();
      if (b.dataset.a === 'stop') { stopReq = true; return log('Зупиняю після поточного кроку…'); }
      act[b.dataset.a]();
      render();
    };
  });
  document.body.append(host);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'togglePanel') ui.panel?.classList.toggle('min');
});

(async () => {
  if (window.top !== window) return;
  const s = await chrome.storage.local.get(['settings', 'faceOverride', 'fails', 'srcs']);
  settings = { ...DEFAULTS, ...s.settings };
  faceOverride = s.faceOverride || {};
  fails = s.fails || {};
  srcs = s.srcs || {};
  mountPanel();
  log('Відкрий проєкт Flow з фото-референсами, вибери кліпи → ▶ Старт');
  reload();
})();
