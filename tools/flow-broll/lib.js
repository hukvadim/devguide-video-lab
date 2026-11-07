// Чисті функції без DOM/Chrome: розбір каталогу, промпт, оновлення md і ugc.json. Перевірка: node lib.test.js
const ITEM_RE = /^- \[( |x)\] \*\*(\d{3})\*\* · (?:\*\*(.+?)\*\* · )?(.+)$/;

// Теги за розділами + кілька слів із назви, щоб план кадру підбирав кліп за емоцією.
const SECTION_TAGS = {
  19: ['reaction', 'emo'], 30: ['laptop', 'code', 'work'], 41: ['phone', 'content', 'shoot'],
  52: ['notebook', 'write', 'plan'], 63: ['whiteboard', 'explain', 'scheme'], 74: ['indoor', 'move'],
  85: ['city', 'street'], 96: ['village', 'nature', 'calm'], 107: ['ai', 'site', 'business'],
  118: ['gamedev', '3d', 'blender', 'godot'], 129: ['object', 'detail', 'transition'], 140: ['wow', 'metaphor', 'magic'],
};
const WORD_TAGS = [
  [/вау/i, ['wow', 'surprise']], [/сумнів|не вірю/i, ['doubt', 'question']], [/осяян|ідея/i, ['idea', 'aha']],
  [/полегш/i, ['relief', 'calm']], [/перемог|результат/i, ['success']], [/помилк|баг/i, ['error', 'bug']],
  [/зосеред/i, ['focus']], [/перехід|перекриття|прохід за/i, ['transition']],
];

function sectionTags(n) {
  const start = Object.keys(SECTION_TAGS).map(Number).filter((s) => s <= n).pop();
  return start ? SECTION_TAGS[start] : [];
}

function parseCatalog(md) {
  let section = '';
  const items = [];
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^## (.+)$/);
    if (h) { section = h[1].replace(/^[\d–-]+ · /, ''); continue; }
    const m = line.match(ITEM_RE);
    if (!m) continue;
    const [, mark, id, title, rest] = m;
    const n = Number(id);
    const legacy = !title; // 001–018: лише назва наявного файлу
    const scene = legacy ? '' : rest.trim();
    const tags = [...new Set([...sectionTags(n), ...WORD_TAGS.filter(([re]) => re.test(title || '')).flatMap(([, t]) => t), 'broll'])];
    items.push({
      id, n, section, legacy, checked: mark === 'x',
      title: legacy ? rest.replace(/`/g, '') : title, scene, tags,
      face: /\b(he|him)\b|his reflection/i.test(scene),
    });
  }
  return items;
}

function buildPrompt(item, face, s) {
  return ['Generate one video.', item.scene, s.base, face ? s.refSuffix : ''].filter(Boolean).join(' ');
}

// Ставить [x] у рядку з потрібним ID, решту файлу не чіпає.
function setChecked(md, id) {
  return md.replace(new RegExp(`^- \\[ \\] (\\*\\*${id}\\*\\*)`, 'm'), '- [x] $1');
}

// ugc.json у тому ж вигляді, що й руками: кліп на рядок.
function formatUgc(j, eol = '\n') {
  const val = (v) => (Array.isArray(v) ? `[${v.map((x) => JSON.stringify(x)).join(', ')}]`
    : typeof v === 'number' ? (Number.isInteger(v) ? v.toFixed(1) : String(v)) : JSON.stringify(v));
  const clip = (c) => `    { ${Object.entries(c).map(([k, v]) => `"${k}": ${val(v)}`).join(', ')} }`;
  const head = Object.entries(j).filter(([k]) => k !== 'clips').map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  return ['{', ...head, '  "clips": [', j.clips.map(clip).join(',' + eol), '  ]', '}', ''].join(eol);
}

function upsertClip(j, item) {
  const name = `br-${item.id}`;
  const clip = { name, file: `flow/${name}.mp4`, from: 0.5, dur: 2.5, tags: item.tags, title: item.title };
  const i = j.clips.findIndex((c) => c.name === name);
  if (i >= 0) j.clips[i] = { ...j.clips[i], file: clip.file }; // ручні правки from/dur/tags не перетираємо
  else j.clips.push(clip);
  return j;
}

if (typeof module !== 'undefined') module.exports = { parseCatalog, buildPrompt, setChecked, formatUgc, upsertClip };
