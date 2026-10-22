// Shot planner and rhythm audit for devguide-reel (pure functions, IO lives in vid.mjs).
// planShots: transcript phrases → shot per phrase: face / screen / scene (full-frame, 4–5 s) + catalog codes.
// audit: output timeline events → still stretches, overlaps, code repeats, SFX density.
// The rules are keyword heuristics: the plan is a draft table that Claude/the author rewrites, not a final edit.

const r2 = (x) => Math.round(x * 100) / 100;
const clean = (w) => w.replace(/^[«"„“(\[]+|[»"”)\],.;:!?…]+$/g, '');

// words (output timeline {s,e,w}) → phrases: punctuation, pauses > 0.35 s, or longer than maxDur at the widest gap
export function phrases(words, { gap = 0.35, maxDur = 5 } = {}) {
  const out = [];
  let cur = [];
  const flush = () => { if (cur.length) out.push(cur); cur = []; };
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (!next || /[.!?…]$/.test(w.w) || next.s - w.e > gap) flush();
  });
  flush();
  // split long phrases at the widest internal gap (or the middle)
  const split = (p) => {
    if (p.at(-1).e - p[0].s <= maxDur || p.length < 4) return [p];
    let k = Math.floor(p.length / 2), best = -1;
    for (let i = 1; i < p.length - 1; i++) { const g = p[i].s - p[i - 1].e; if (g > best && i > 1 && i < p.length - 1) { best = g; k = i; } }
    return [...split(p.slice(0, k)), ...split(p.slice(k))];
  };
  // whisper pauses chop speech into 0.5 s bits: glue phrases under 1.5 s to the previous one while it stays ≤ maxDur
  const glued = [];
  for (const p of out.flatMap(split)) {
    const prev = glued.at(-1);
    if (prev && (p.at(-1).e - p[0].s < 1.5 || prev.at(-1).e - prev[0].s < 1.5) && p.at(-1).e - prev[0].s <= maxDur) prev.push(...p); else glued.push([...p]);
  }
  return glued.map((p) => ({ s: r2(p[0].s), e: r2(p.at(-1).e), words: p.map((w) => clean(w.w)).filter(Boolean) }))
    .map((p) => ({ ...p, text: p.words.join(' ') }));
}

const RE = {
  cta: /коментар|напиш\S* слово|підпиш|збереж|посилання|direct|директ/,
  num: /\d|відсот|сотн|тисяч|мільйон|хвилин|годин|секунд|раз(и|ів)?\b|в(дв|тр)ічі/,
  cmp: /раніше|тепер|замість|\bніж\b|проти|\bvs\b|\bа не\b|було|стало|до і після/,
  def: /\bце\b|означає|тобто|називається/,
  steps: /по-перше|по-друге|спочатку|потім|\bдалі\b|крок|наступн|\bперш\b/,
  action: /відкри|натисн|клікн|зайд|обер|вибер|встанов|встав|скопіюй|запуст|напиш|ось тут|дивіться|бачите/,
  warn: /не роби|помилк|увага|обережно|ніколи/,
  tip: /лайфхак|порада|секрет|фішк/,
  emo: /вау|круто|шок|неймовірн|клас|кайф|жах|смішн/,
  fail: /не працю|зламал|баг|помилк|втомив|довго|чекати/,
  joke: /жарт|смішн|ха-ха|прикол|дедлайн|паніка/,
  phone: /телефон|повідомлен|direct|директ|сповіщен/,
};
const TOOL = [[/скіл/, 'B01'], [/промпт/, 'C01'], [/агент/, 'C03'], [/термінал|npm|команд/, 'D01'], [/сайт|сторінк/, 'B02'], [/файл/, 'B07'], [/код\b|коді|кодом/, 'D02'], [/модел|opus|sonnet/, 'C08']];
// fillers for face stretches without a cue, in order of preference
export const FILL = ['H06', 'F06', 'B10', 'H01', 'E10', 'H08', 'H03', 'A09'];
const EMOJI = ['🤯', '🔥', '💡', '🚀', '😎'];

export function classify(text, i, n) {
  const t = text.toLowerCase();
  const tags = Object.entries(RE).filter(([, re]) => re.test(t)).map(([k]) => k);
  if (/\?$/.test(text)) tags.push('question');
  if (i === 0) tags.push('hook');
  if (i === n - 1) tags.push('last');
  return tags;
}

const firstNum = (t) => Number(t.match(/\d+([.,]\d+)?/)?.[0].replace(',', '.'));
const words6 = (ws, n = 6) => ws.slice(0, n).join(' ');
// filler words of spoken Ukrainian: cards keep only the meaning words (draft quality, the author still edits)
const STOP = new Set('і й та а але або в у на з із зі до по за від для про при над під там тут ось от ну ж же що як це цей ця ці той та те ті він вона воно вони я ти ми ви мій моя моє мої твій свій своя свої свої якісь якийсь якась щось все всі весь вся можна може можете можу хочу хотів треба буде був була було є просто взагалі насправді також тобто ще вже дуже так ніби типу короче значить ось-ось потім знову назад поки коли бо тому щоб чи не ні'.split(' '));
const keys = (ws, n = 4) => ws.filter((w) => !STOP.has(w.toLowerCase()) && w.length > 1).slice(0, n).join(' ');
// ranges like 15-20: show the range, count to the top number; the word after the number is its unit
const numInfo = (ws) => {
  const k = ws.findIndex((w) => /\d/.test(w)); if (k < 0) return null;
  const m = ws[k].match(/(\d+(?:[.,]\d+)?)(?:[-–](\d+(?:[.,]\d+)?))?/);
  const a = Number(m[1].replace(',', '.')), b = m[2] ? Number(m[2].replace(',', '.')) : null;
  return { to: b ?? a, prefix: b != null ? m[1] + '–' : '', unit: ws[k + 1] ?? '', rest: ws.slice(k + 2) };
};
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const splitAt = (ws, re) => { const k = ws.findIndex((w) => re.test(w.toLowerCase())); return k > 0 ? [ws.slice(0, k), ws.slice(k + 1)] : [ws.slice(0, Math.ceil(ws.length / 2)), ws.slice(Math.ceil(ws.length / 2))]; };

// draft fields for one code from the phrase words (Claude rewrites them into ≤6 strong words)
export function fields(code, p, o = { n: 0, step: 0 }) {
  const ws = p.words;
  switch (code) {
    case 'E01': { const n = numInfo(ws); return n ? { to: n.to, prefix: n.prefix, label: [n.unit, keys(n.rest, 2)].filter(Boolean).join(' ') } : { to: firstNum(p.text) }; }
    case 'G01': { const [a, b] = splitAt(ws, /^(замість|ніж|а|проти|тепер)$/); return { bad: cap1(keys(a, 4)), good: cap1(keys(b, 4)) }; }
    case 'G09': { const [a, b] = splitAt(ws, /^(тепер|стало|зараз)$/); return { before: cap1(keys(a, 5)), now: cap1(keys(b, 5)) }; }
    case 'B04': { const k = ws.findIndex((w) => /^(це|означає|тобто)$/.test(w.toLowerCase())); return { term: cap1(ws[Math.max(0, k - 1)] ?? ws[0]), def: words6(ws.slice(k + 1), 9) }; }
    case 'F04': return { items: (p.text.split(/,|\bпотім\b|\bдалі\b|\bі\b/).map((s) => s.trim()).filter(Boolean).slice(0, 3)).map((s) => cap1(words6(s.split(' '), 4))) };
    case 'A04': return { label: cap1(words6(ws.filter((w) => w.length > 2), 2)) };
    case 'I01': return { word: o.keyword ?? 'СЛОВО' };
    case 'B09': case 'B10': return { text: cap1(keys(ws, 6)) };
    case 'H08': return { glyph: '?' };
    case 'H06': return { emoji: EMOJI[o.n++ % EMOJI.length] };
    case 'H01': return { label: 'дивись', x: 260, y: 520, to: [560, 820] };
    case 'H03': return { text: cap1(ws.reduce((a, w) => (w.length > a.length ? w : a), '')) };
    case 'F06': return { n: String(++o.step).padStart(2, '0'), title: cap1(keys(ws, 3)) };
    case 'E10': return { n: Math.min(o.step || 1, 5), of: 5, label: 'кроків' };
    case 'A09': return { text: cap1(keys(ws, 4)) };
    case 'B01': return { name: 'skill-name', author: 'автор', meta: ['тег'], desc: words6(ws, 8) };
    case 'C01': return { prompt: words6(ws, 6), reply: '…' };
    case 'C03': return { steps: ['read', 'edit', 'run'] };
    case 'D01': return { cmd: words6(ws, 4) };
    case 'D02': return { code: ['// приклад'], line: 0 };
    case 'B02': return { url: o.site ?? 'devguide.com.ua' };
    case 'B07': return { name: 'file.md' };
    case 'C08': return { models: ['Haiku', 'Sonnet', 'Opus'], pick: 2 };
    default: return {};
  }
}

// opts: { split, keyword, site, avoid: Set of codes used in recent reels, sceneGap = 10, fillEvery = 4 }
export function planShots(words, opts = {}) {
  const ps = phrases(words);
  const used = new Set(), avoid = opts.avoid ?? new Set();
  const o = { ...opts, n: 0, step: 0 };
  const take = (list) => list.find((c) => !used.has(c) && !avoid.has(c)) ?? list.find((c) => !used.has(c));
  let lastScene = -1e9, lastVisual = 0, lastUgc = -1e9;
  // UGC library (ugc.json clips): phrase tags → clip tags, one insert per ugcGap seconds, never the hook
  const UGC_TAGS = { emo: ['wow', 'emo', 'laugh'], joke: ['joke', 'laugh', 'panic'], fail: ['fail', 'facepalm', 'tired'], warn: ['stop', 'warn'],
    question: ['question', 'serious'], phone: ['phone', 'message'], action: ['typing', 'action'] };
  const usedClips = new Set();
  const pickClip = (tags) => { for (const t of tags) for (const want of UGC_TAGS[t] ?? []) { const c = (opts.ugc ?? []).find((x) => !usedClips.has(x.name) && x.tags.includes(want)); if (c) return c; } return null; };
  const shots = ps.map((p, i) => {
    const tags = classify(p.text, i, ps.length), dur = p.e - p.s;
    const shot = { ...p, tags, kind: opts.split ? 'screen' : 'face', codes: [], cards: [] };
    const add = (code, extra = {}) => { if (!code) return; used.add(code); shot.codes.push(code); shot.cards.push({ type: code, ...fields(code, p, o), ...extra }); };
    if (tags.includes('hook') || tags.includes('question') || tags.includes('emo')) shot.kind = 'face';
    if (tags.includes('cta')) { shot.kind = 'face'; add(take(['I01', 'I03', 'I09'])); lastVisual = p.s; return shot; }
    const sceneCode = tags.includes('num') && /\d/.test(p.text) ? take(['E01', 'E02', 'E03'])
      : tags.includes('cmp') ? take(['G01', 'G09', 'G02'])
      : tags.includes('def') ? take(['B04'])
      : tags.includes('steps') ? take(['F04', 'F05']) : null;
    // a scene needs room: not the hook, ≥2 s of speech, ≥sceneGap since the last one
    const clip = !tags.includes('hook') && !sceneCode && p.s - lastUgc >= (opts.ugcGap ?? 12) && p.s - lastScene >= 4 ? pickClip(tags) : null;
    if (clip) {
      usedClips.add(clip.name);
      shot.kind = 'ugc'; shot.clip = clip.name; shot.codes.push('UGC:' + clip.name); shot.dur = Math.min(clip.dur ?? 3, Math.max(2, dur));
      lastUgc = p.s; lastVisual = p.s;
      return shot;
    }
    if (sceneCode && !tags.includes('hook') && dur >= 2 && p.s - lastScene >= (opts.sceneGap ?? 10)) {
      shot.kind = 'scene';
      shot.dur = r2(Math.min(5, Math.max(4, dur)));
      add(sceneCode, { y: 620, scale: 1.25 });
      lastScene = p.s; lastVisual = p.s;
      return shot;
    }
    if (tags.includes('action') && !opts.split) add(take(['A04', 'A03']));
    else if (tags.includes('warn')) add(take(['B09']));
    else if (tags.includes('tip')) add(take(['B10']));
    else if (tags.includes('question')) add(take(['H08']));
    else { const tool = TOOL.find(([re]) => re.test(p.text.toLowerCase())); if (tool && !used.has(tool[1])) add(tool[1]); }
    // nothing changed for fillEvery seconds → an accent from the filler pool
    if (!shot.codes.length && !tags.includes('hook') && p.s - lastVisual >= (opts.fillEvery ?? 4)) add(take(FILL));
    if (shot.codes.length) lastVisual = p.s;
    return shot;
  });
  return shots;
}

// shots → draft edit fields. unmap: output seconds → source seconds (edit.json "at" is in source time)
export function planToEdit(shots, unmap, { split } = {}) {
  const scenes = [], cards = [], fullcam = [], ugc = [];
  for (const s of shots) {
    const at = r2(unmap(s.s + 0.05));
    if (at == null || Number.isNaN(at)) continue;
    if (s.kind === 'ugc') { ugc.push({ at, clip: s.clip, dur: r2(s.dur) }); continue; }
    if (s.kind === 'scene') scenes.push({ at, dur: s.dur, cards: s.cards.map(({ type, ...f }) => ({ type, ...f })) });
    else s.cards.forEach((c) => cards.push({ at, dur: r2(Math.max(2.5, Math.min(4, s.e - s.s + 0.6))), ...c }));
    if (split && s.kind === 'face') fullcam.push({ at, dur: r2(Math.max(1.5, Math.min(4, s.e - s.s))) });
  }
  // the hook phrase becomes the title (2–5 words on the first seconds)
  const hook = shots[0];
  const title = hook ? { text: cap1(keys(hook.words, 4) || hook.words.slice(0, 4).join(' ')), dur: 2.6 } : undefined;
  return { scenes, cards, ugc, ...(split ? { fullcam } : {}), title };
}

export function planTable(shots) {
  const KIND = { face: 'обличчя', screen: 'екран (спліт)', scene: 'СЦЕНКА', ugc: 'UGC-вставка' };
  const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
  return ['| # | час | кадр | коди | що каже |', '|---|---|---|---|---|',
    ...shots.map((s, i) => `| ${i + 1} | ${fmt(s.s)}–${fmt(s.dur ? s.s + s.dur : s.e)} | ${KIND[s.kind]} | ${s.codes.join(' ') || '—'} | ${s.text} |`)].join('\n');
}

// ---------- audit ----------
// events: [{t, dur?, kind: 'cut'|'card'|'scene'|'cutaway'|'fullcam'|'broll'|'callout'|'title', code?, side?, sfx?}]
export function audit(events, total, { maxStill = 6, prevCodes = new Set() } = {}) {
  const changes = [0, total, ...events.flatMap((e) => (e.dur ? [e.t, e.t + e.dur] : [e.t]))].filter((t) => t >= 0 && t <= total).sort((a, b) => a - b);
  const still = [];
  let gap = [0, 0];
  for (let i = 1; i < changes.length; i++) {
    if (changes[i] - changes[i - 1] > maxStill) still.push([r2(changes[i - 1]), r2(changes[i])]);
    if (changes[i] - changes[i - 1] > gap[1] - gap[0]) gap = [r2(changes[i - 1]), r2(changes[i])];
  }
  const boxes = events.filter((e) => e.kind === 'card' || e.kind === 'scene' || e.kind === 'cutaway');
  const overlaps = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    const hit = a.t < b.t + b.dur && b.t < a.t + a.dur;
    const full = (e) => e.kind === 'scene' || e.kind === 'cutaway'; // full-frame shots hide the speaker: nothing may sit on them
    const clash = full(a) || full(b) || (a.side ?? 'left') === (b.side ?? 'left');
    if (hit && clash) overlaps.push([a.code ?? a.kind, b.code ?? b.kind, r2(Math.max(a.t, b.t))]);
  }
  const codes = events.filter((e) => e.code).map((e) => e.code);
  const repeats = [...new Set(codes.filter((c, i) => codes.indexOf(c) !== i))];
  const fromPrev = [...new Set(codes.filter((c) => prevCodes.has(c)))];
  const perThirty = Math.max(1, total / 30);
  const variety = new Set(codes).size / perThirty;
  const sfx = events.filter((e) => e.sfx).length / Math.max(1 / 6, total / 60);
  const score = Math.max(0, 100 - still.length * 15 - overlaps.length * 10 - repeats.length * 5 - Math.max(0, 4 - variety) * 8 - Math.max(0, sfx - 6) * 3);
  return { still, gap, overlaps, repeats, fromPrev, variety: r2(variety), sfxPerMin: r2(sfx), score: Math.round(score) };
}

// one char per second: S scene, C stock cutaway, F full-face, ▪ card on screen, · nothing on top
export function timeline(events, total) {
  return Array.from({ length: Math.ceil(total) }, (_, s) => {
    const on = (k) => events.some((e) => e.kind === k && e.t <= s + 0.5 && s + 0.5 < e.t + (e.dur ?? 0));
    return on('scene') ? 'S' : on('cutaway') ? 'C' : on('fullcam') ? 'F' : on('card') || on('broll') ? '▪' : '·';
  }).join('').replace(/(.{10})/g, '$1 ');
}
