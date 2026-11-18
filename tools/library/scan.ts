import fs from "node:fs";
import path from "node:path";

export const REPO = path
  .resolve(import.meta.dirname, "../..")
  .replace(/\\/g, "/");
const SKILL = `${REPO}/.claude/skills/devguide-reel`;
const AUDIO = `${REPO}/public/assets/audio`;
const MUSIC = `${REPO}/public/assets/music`;
const UGC = `${REPO}/public/assets/ugc`;

const read = (f: string) =>
  fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
const ls = (d: string) => (fs.existsSync(d) ? fs.readdirSync(d) : []);
const isAudio = (f: string) => /\.(mp3|wav|ogg|m4a)$/i.test(f);
// рядки markdown-таблиці: "| a | b |" → ['a', 'b']
const rows = (md: string) =>
  md
    .split("\n")
    .filter((l) => l.startsWith("|") && !/^\|\s*-/.test(l))
    .map((l) =>
      l
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim()),
    );
const strip = (s: string) =>
  s
    .replace(/`/g, "")
    .replace(/\s*✅\s*/g, "")
    .trim();

function sounds() {
  const readme = rows(read(`${AUDIO}/README.md`));
  const hint = new Map(
    readme
      .filter((r) => /^`\w+\/`$/.test(r[0]))
      .map((r) => [strip(r[0]).replace("/", ""), { when: r[1], tip: r[2] }]),
  );
  const source = new Map(
    readme
      .filter((r) => /^`\w+\/.+\.\w+`$/.test(r[0]))
      .map((r) => [strip(r[0]), r[1]]),
  );
  const groups = ls(AUDIO)
    .filter((d) => fs.statSync(`${AUDIO}/${d}`).isDirectory())
    .map((d) => ({
      id: d,
      when: hint.get(d)?.when ?? "",
      tip: hint.get(d)?.tip ?? "",
      items: ls(`${AUDIO}/${d}`)
        .filter(isAudio)
        .map((f) => ({
          name: f.replace(/\.\w+$/, ""),
          path: `${AUDIO}/${d}/${f}`,
          use: `${d}/${f}`,
          source: source.get(`${d}/${f}`) ?? "",
        })),
    }));
  const wrap = ls(`${SKILL}/media`)
    .filter(isAudio)
    .map((f) => ({
      name: f.replace(/\.\w+$/, ""),
      path: `${SKILL}/media/${f}`,
      use: f,
      source: "скіл devguide-reel/media",
    }));
  return [
    ...groups,
    {
      id: "обгортка",
      when: "Інтро, удари hits, end card — скіл бере їх сам",
      tip: "",
      items: wrap,
    },
  ];
}

function music() {
  const beats = JSON.parse(read(`${MUSIC}/beats.json`) || "{}");
  const list = rows(read(`${MUSIC}/CATALOG.md`))
    .filter((r) => /^\d+$/.test(r[0]))
    .map((r) => {
      const file = strip(r[6]);
      const local = fs.existsSync(`${MUSIC}/${file}`);
      return {
        n: Number(r[0]),
        title: r[1],
        author: r[2],
        group: r[3],
        genre: r[4],
        dur: r[5],
        file,
        bpm: beats[file]?.bpm ?? null,
        local,
        // не скачано на цьому ПК → слухаємо з CDN Mixkit
        src: local ? `${MUSIC}/${file}` : r[7],
        use: `public/assets/music/${file}`,
      };
    });
  if (fs.existsSync(`${MUSIC}/cat-walk.mp3`))
    list.unshift({
      n: 0,
      title: "Cat Walk",
      author: "—",
      group: "default",
      genre: "Музика скіла за замовчуванням (drop 29.55 с)",
      dur: "",
      file: "cat-walk.mp3",
      bpm: null,
      local: true,
      src: `${MUSIC}/cat-walk.mp3`,
      use: "public/assets/music/cat-walk.mp3",
    });
  return list;
}

function ugc() {
  const lib = JSON.parse(read(`${UGC}/ugc.json`) || '{"clips":[]}');
  const known = new Set(lib.clips.map((c: { file: string }) => c.file));
  const extra = ls(`${UGC}/flow`)
    .filter((f) => f.endsWith(".mp4") && !known.has(`flow/${f}`))
    .map((f) => ({
      name: f.replace(".mp4", ""),
      file: `flow/${f}`,
      from: 0,
      dur: 0,
      tags: ["без тегів"],
    }));
  return [...lib.clips, ...extra].map((c) => ({
    ...c,
    path: `${UGC}/${c.file}`,
  }));
}

// demo-поля кожного коду з реєстрів motion/el/*.tsx і motion/Elements.tsx (рядки «  E01: { C: E01, name: '…', demo: {…} },»)
function demos() {
  const out: Record<string, string> = {};
  const files = [
    `${SKILL}/motion/Elements.tsx`,
    ...ls(`${SKILL}/motion/el`).map((f) => `${SKILL}/motion/el/${f}`),
  ];
  for (const f of files)
    for (const m of read(f).matchAll(
      /^\s+([A-J]\d\d): \{ C: \w+, name: '[^']*', demo: \{(.*)\} \},?\s*$/gm,
    ))
      out[m[1]] = m[2].trim();
  return out;
}

function elements() {
  const md = read(`${SKILL}/docs/ELEMENTS.md`);
  const demo = demos();
  const [els, caps] = md.split(/^## 50 субтитрів.*$/m);
  const groups = [
    ...els.matchAll(
      /^### ([A-J])\. (.+)$([\s\S]*?)(?=^### |^## |$(?![\s\S]))/gm,
    ),
  ].map((m) => {
    const items = rows(m[3])
      .filter((r) => /^[A-J]\d\d/.test(r[0]))
      .map((r) => ({
        code: strip(r[0]),
        name: r[1],
        appear: r[2],
        when: r[3],
        demo: demo[strip(r[0])] ?? "",
      }));
    // у відео Catalog-<група> коди йдуть за абеткою, кожен STEP секунд
    const order = items.map((i) => i.code).sort();
    return {
      id: m[1],
      title: m[2].trim(),
      sheet: `${SKILL}/docs/elements/${m[1]}.jpg`,
      video: catalogVideo(m[1]),
      items: items.map((i) => ({ ...i, t: order.indexOf(i.code) * STEP })),
    };
  });
  // живі приклади субтитрів: CAP_COMBOS з motion/Catalog.tsx, у тому ж порядку, що й у відео CapCatalog
  const combos =
    (
      read(`${SKILL}/motion/Catalog.tsx`).match(
        /CAP_COMBOS = \[([^\]]+)\]/,
      )?.[1] ?? ""
    )
      .match(/'[^']+'/g)
      ?.map((s, i) => ({ cap: s.slice(1, -1), t: i * STEP })) ?? [];
  const captions = [
    ...(caps ?? "").matchAll(
      /^### (.+)$([\s\S]*?)(?=^### |^## |$(?![\s\S]))/gm,
    ),
  ].map((m) => ({
    title: m[1].trim(),
    items: rows(m[2])
      .filter((r) => /^[ST]\d\d/.test(r[0]))
      .map((r) => ({ code: strip(r[0]), name: r[1] })),
  }));
  return {
    groups,
    captions,
    captionSheet: `${SKILL}/docs/elements/captions.jpg`,
    captionVideo: catalogVideo("captions"),
    combos,
  };
}

// відео каталогу (рендер: npm run library:catalog) → out/catalog/<A…J|captions>.mp4
const STEP = 4.7; // LIFE 3.5 + GAP 1.2 з motion/Catalog.tsx
const catalogVideo = (name: string) => {
  const f = `${REPO}/out/catalog/${name}.mp4`;
  return fs.existsSync(f) ? f : "";
};

function images() {
  const d = `${REPO}/public/assets/site`;
  return ls(d)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => ({ name: f, path: `${d}/${f}` }));
}

export function scanLibrary() {
  return {
    repo: REPO,
    sounds: sounds(),
    music: music(),
    ugc: ugc(),
    ...elements(),
    images: images(),
  };
}
