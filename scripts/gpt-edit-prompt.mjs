// Experiment «GPT as the editor»: GPT writes the whole creative part of edit.json, vid.mjs renders it.
//   node scripts/gpt-edit-prompt.mjs work/<name> [--keyword 3D] [--from work/<other>] → gpt-edit.prompt.md (paste into ChatGPT)
//   (new take: after `vid.mjs prep`, tech fields come from sync.json; --from copies them from an existing edit)
//   node scripts/gpt-edit-prompt.mjs work/<name>-gpt --apply              → gpt-answer.json + tech fields → edit.json
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const AGENT =
  process.env.DEVGUIDE_AGENT || "C:/DevGuide/helpers/devguide-agent";
const { cutSegments, chunksOf, applyCuts, spokenWords } = await import(
  pathToFileURL(path.join(AGENT, "montage.mjs")).href
);

const LAB = path.resolve(import.meta.dirname, "..");
const SKILL = path.join(LAB, ".claude/skills/devguide-reel");
const work = path.resolve(process.argv[2] ?? "");
const arg = (k) => process.argv[process.argv.indexOf(k) + 1];
const read = (f) => JSON.parse(fs.readFileSync(path.join(work, f), "utf8"));
const CREATIVE = [
  "segments",
  "title",
  "captions",
  "fullcam",
  "scenes",
  "cards",
  "ugc",
  "outro",
  "callouts",
  "punch",
  "broll",
  "cutaways",
];

const sil = read("silences.json");
const words = spokenWords(work);
const dur = Math.max(sil.at(-1)?.e ?? 0, words.at(-1)?.e ?? 0);
const chunks = chunksOf(words, cutSegments(sil, dur));

// element registry: code → demo fields (one line per code in motion/Elements.tsx and motion/el/*.tsx)
const motion = [
  path.join(SKILL, "motion/Elements.tsx"),
  ...fs
    .readdirSync(path.join(SKILL, "motion/el"))
    .map((f) => path.join(SKILL, "motion/el", f)),
];
const demos = Object.fromEntries(
  motion.flatMap((f) =>
    [
      ...fs
        .readFileSync(f, "utf8")
        .matchAll(/^\s+([A-J]\d\d): \{ C: \w+, (.*) \},?$/gm),
    ].map((m) => [m[1], m[2]]),
  ),
);
const ugc = JSON.parse(
  fs.readFileSync(path.join(LAB, "public/assets/ugc/ugc.json"), "utf8"),
).clips;

if (process.argv.includes("--apply")) apply();
else prompt();

function prompt() {
  // tech fields: an existing edit (--from) or, for a new take, the files `vid.mjs prep` recorded in sync.json
  let base;
  if (process.argv.includes("--from"))
    base = JSON.parse(
      fs.readFileSync(
        path.join(path.resolve(arg("--from")), "edit.json"),
        "utf8",
      ),
    );
  else {
    const s = read("sync.json"); // ponytail: a camera-only take (no sync.json) needs --from
    base = {
      source: s.source,
      ...(s.audio && { audio: s.audio }),
      ...(s.screen && { screen: s.screen, layout: "split" }),
      site: "devguide.com.ua",
      loudness: -12,
    };
  }
  const kw = process.argv.includes("--keyword")
    ? arg("--keyword")
    : base.outro?.keyword;
  if (kw) base.outro = { ...base.outro, keyword: kw };
  fs.writeFileSync(path.join(work, "base.json"), JSON.stringify(base, null, 2));
  const elements = fs
    .readFileSync(path.join(SKILL, "docs/ELEMENTS.md"), "utf8")
    .split("\n")
    .filter((l) => /^###? |^\| [A-JST]\d\d/.test(l))
    .join("\n");
  const text = `Ти режисер монтажу вертикальних рілсів DevGuide (9:16, Instagram/Shorts, ~1 хв, українською).
Автор — Вадим, програміст, розповідає про нейромережі й розробку. Запис: камера (обличчя) + запис екрана, монтаж — спліт:
екран зверху, спікер знизу. Ти пишеш **увесь творчий план монтажу** в JSON, рендер робить наш конвеєр.

## Що ти вирішуєш
1. **drop** — які шматки мови викинути: дублі (лиши останню спробу), фальстарти, «еее», звертання до себе, вода.
   Ролик має лишитися зв'язним і бажано 40–70 с.
2. **title** — титул перших 2.6 с: 2–5 слів, питання або обіцянка; \`*слово*\` в кінці = великий акцентний рядок (одне слово).
3. **fullcam** — моменти, коли спікер на весь кадр (хук на початку, емоції, питання, висновок): \`{at, dur}\`.
   Решта часу — спліт з екраном («відкрий / натисни / дивіться» — точно спліт).
4. **scenes** — сценка 4–5 с на весь кадр без обличчя й екрана (цифра, порівняння, визначення, кроки): \`{at, dur, cards:[{type, ...поля, y?, scale?}]}\`.
5. **cards** — елемент поверх кадру: \`{at, dur, type, side?: "left"|"right"|"center", y?, scale?, ...поля}\`.
6. **ugc** — повноекранна UGC-вставка 2–3 с з емоцією: \`{at, clip}\`, раз на ~12 с максимум.
7. **captions** — \`{cap: "Sxx+Txx+Txx+Txx", emphasis: [початки 4–6 ключових слів]}\` (коди субтитрів з каталогу нижче).
8. **outro** — \`{keyword: "${base.outro?.keyword ?? "ТЕМА"}", cta: "що людина отримає в Direct, ≤6 слів", dur: 7}\`.

## Правила ритму (автора)
- Не частіше одного елемента (сценка / UGC / картка) на 5 с, і не довше 6 с без змін у кадрі.
- На 30 с — не менше 4 різних кодів; один код не частіше разу на ролик.
- Тексти на картках — одна думка, ≤6 слів, сильні слова. Цифри **лише ті, що звучать у розшифровці**. Не вигадуй ціни, статистику, відгуки.
- Усі \`at\` — секунди **вихідного** запису (як у шматках нижче), лише всередині шматків, які ти НЕ викидаєш.
- Поля елемента — як у \`demo\` для його коду (нижче); заміни значення на свої, ключі не вигадуй.

## Мова пронумерованими шматками (секунди запису)
${chunks.map((c) => `${c.n}. [${c.s}–${c.e}] ${c.text}`).join("\n")}

## Каталог елементів і субтитрів (код | що це | як з'являється | коли брати)
${elements}

## Поля елементів (demo кожного коду)
${Object.entries(demos)
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}

## UGC-кліпи (clip = name)
${ugc.map((c) => `${c.name}: ${c.tags.join(", ")}`).join("\n")}

## Відповідь — ЛИШЕ JSON, без пояснень і без \`\`\`:
{"drop":[3,5],"title":{"text":"…","dur":2.6},"captions":{"cap":"S02+T04+T27+T36","emphasis":["…"]},
 "fullcam":[{"at":0,"dur":4}],"scenes":[{"at":0,"dur":4.5,"cards":[{"type":"E01","to":15,"label":"…"}]}],
 "cards":[{"at":0,"dur":3,"type":"G09","before":"…","now":"…"}],"ugc":[{"at":0,"clip":"wow"}],
 "outro":{"keyword":"…","cta":"…","dur":7}}
`;
  fs.writeFileSync(path.join(work, "gpt-edit.prompt.md"), text);
  console.log(
    `gpt-edit.prompt.md: ${text.length} символів, ${chunks.length} шматків, ${Object.keys(demos).length} кодів`,
  );
}

function apply() {
  const raw = fs
    .readFileSync(path.join(work, "gpt-answer.json"), "utf8")
    .replace(/^[^{]*|[^}]*$/g, ""); // tolerate ``` fences
  const a = JSON.parse(raw);
  const errs = [];
  const unknown = Object.keys(a).filter(
    (k) => k !== "drop" && !CREATIVE.includes(k),
  );
  if (unknown.length) errs.push(`невідомі поля: ${unknown.join(", ")}`);
  const said = new Set(words.flatMap((w) => String(w.w).match(/\d+/g) ?? []));
  const check = (where, x) => {
    if (x.at != null && !(x.at >= 0 && x.at <= dur))
      errs.push(`${where}: at ${x.at} поза 0..${dur.toFixed(1)}`);
    if (x.type && !demos[x.type])
      errs.push(`${where}: коду ${x.type} немає в каталогу`);
    for (const n of JSON.stringify(x)
      .replace(/"(at|dur|y|x|scale|to|from)":[\d.]+|"type":"\w+"/g, "")
      .match(/\d+/g) ?? [])
      if (!said.has(n) && n.length > 1)
        console.warn(`  ? ${where}: цифра ${n} не звучить у розшифровці`);
  };
  (a.cards ?? []).forEach((c, i) => check(`cards[${i}]`, c));
  (a.scenes ?? []).forEach((s, i) => {
    check(`scenes[${i}]`, s);
    (s.cards ?? []).forEach((c, j) => check(`scenes[${i}].cards[${j}]`, c));
  });
  (a.ugc ?? []).forEach((u, i) => {
    check(`ugc[${i}]`, u);
    if (!ugc.some((c) => c.name === u.clip))
      errs.push(`ugc[${i}]: кліпу ${u.clip} немає`);
  });
  (a.fullcam ?? []).forEach((f, i) => check(`fullcam[${i}]`, f));
  if (errs.length) {
    console.error(errs.join("\n"));
    process.exit(1);
  }

  const base = read("base.json");
  for (const k of CREATIVE) delete base[k];
  // ponytail: segment focus (screen crop) of the original edit is lost; vid.mjs falls back to the whole screen
  const { drop = [], ...creative } = a;
  const edit = { ...base, segments: cutSegments(sil, dur), ...creative };
  const cut = applyCuts(
    edit,
    chunks,
    `ВИКИНУТИ: ${drop.join(", ") || "НІЧОГО"}`,
  );
  fs.writeFileSync(path.join(work, "edit.json"), JSON.stringify(edit, null, 2));
  const kept = edit.segments.reduce((t, g) => t + g.end - g.start, 0);
  console.log(
    `edit.json: викинуто ${cut.length} шматків, лишилось ${kept.toFixed(1)} с, ${edit.segments.length} склейок`,
  );
}
