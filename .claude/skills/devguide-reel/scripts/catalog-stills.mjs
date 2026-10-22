// Screenshots of the element / caption catalog with codes burned in (motion/Catalog.tsx).
//   node scripts/catalog-stills.mjs [outDir]
// stills → <outDir>/stills/<CODE>.jpg (default out dir: ../../../out/elements-catalog),
// contact sheets per group → docs/elements/<A…J>.jpg and docs/elements/captions.jpg (these go to git).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';

const TOOL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] ?? path.join(TOOL, '../../../out/elements-catalog'));
const STILLS = path.join(OUT, 'stills'), SHEETS = path.join(TOOL, 'docs/elements');
fs.mkdirSync(STILLS, { recursive: true }); fs.mkdirSync(SHEETS, { recursive: true });

const STEP = 141; // frames per item = (LIFE 3.5 + GAP 1.2) × 30, keep in sync with Catalog.tsx
const HOLD = 80;  // frame inside an item where most elements are fully built
const SHOT = { J01: 3, J03: 5, J04: 2, J05: 14, J07: 16, J08: 18 }; // short-lived overlays
const GROUPS = 'ABCDEFGHIJ'.split('');

const serveUrl = await bundle({ entryPoint: path.join(TOOL, 'motion/index.ts'), publicDir: path.join(TOOL, 'media') });
const browser = await openBrowser('chrome');
const still = async (id, inputProps, frame, output) => {
  const composition = await selectComposition({ serveUrl, id, inputProps, puppeteerInstance: browser });
  await renderStill({ composition, serveUrl, inputProps, frame, output, imageFormat: 'jpeg', jpegQuality: 88, scale: 0.4, puppeteerInstance: browser });
};
// codes per group come from the same source as the composition: read them back from the bundle is overkill,
// so mirror the catalog order — sorted codes of ELEMENTS + the five old cards
const src = fs.readdirSync(path.join(TOOL, 'motion/el')).map((f) => fs.readFileSync(path.join(TOOL, 'motion/el', f), 'utf8')).join('\n') + fs.readFileSync(path.join(TOOL, 'motion/Elements.tsx'), 'utf8');
const codes = [...new Set([...src.matchAll(/^\s+([A-J]\d\d): \{ C: /gm)].map((m) => m[1]).concat(['A01', 'B01', 'C01', 'F01', 'F02']))].sort();

const sheet = (files, out, cols) => {
  const list = path.join(OUT, 'sheet.txt');
  fs.writeFileSync(list, files.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=288:512,tile=${cols}x${Math.ceil(files.length / cols)}:padding=6:color=0x080B0E`, '-frames:v', '1', '-q:v', '4', out]);
};

for (const g of GROUPS) {
  const own = codes.filter((c) => c[0] === g);
  const files = [];
  for (const [i, c] of own.entries()) {
    const file = path.join(STILLS, `${c}.jpg`);
    await still(`Catalog-${g}`, { w: 1080, h: 1920, dur: 0, group: g }, i * STEP + (SHOT[c] ?? HOLD), file);
    files.push(file);
  }
  sheet(files, path.join(SHEETS, `${g}.jpg`), 5);
  console.log(g, own.join(' '));
}

const caps = [...fs.readFileSync(path.join(TOOL, 'motion/Catalog.tsx'), 'utf8').match(/CAP_COMBOS = \[([^\]]+)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
const capFiles = [];
for (const [i, c] of caps.entries()) {
  const file = path.join(STILLS, `cap-${c.replace(/\+/g, '_')}.jpg`);
  await still('CapCatalog', { w: 1080, h: 1920, dur: 0 }, i * STEP + (/T4[0-5]/.test(c) ? 75 : 34), file);
  capFiles.push(file);
}
sheet(capFiles, path.join(SHEETS, 'captions.jpg'), 8);
await browser.close({ silent: true });
console.log('stills:', STILLS, '\nsheets:', SHEETS);
