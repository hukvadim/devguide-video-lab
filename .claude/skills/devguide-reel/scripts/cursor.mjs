// Трекінг системного курсора Windows у записі екрана: node cursor.mjs <screen.mp4> <cursor.json> [fps]
// Вихід: {fps, w, h, pts: [[t, x, y, shape] | [t, null]], clicks: [{t, x, y}]}, x/y — гаряча точка (пікселі запису), shape: arrow | hand.
// Шукаємо шаблон (темний контур + біла заливка) біля місць, що змінилися між кадрами, і біля останньої позиції.
// ponytail: шаблони — стандартні курсори Windows при 100% масштабі; інший масштаб/тема курсора → перезняти шаблони з кадру.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { findBin } from './bins.mjs';
const ffmpeg = () => findBin('ffmpeg'), ffprobe = () => findBin('ffprobe');
import { execFileSync } from 'node:child_process';

// '#' контур (темний), 'o' заливка (біла), '.' фон — не враховується. [0,0] рядка = гаряча точка + off
const ARROW = { name: 'arrow', hot: [0, 0], rows: [
  '#', '##', '#o#', '#oo#', '#ooo#', '#ooo.#', '#oooo.#', '#oooooo#', '#ooooooo#', '#oooooooo#',
  '#oooooooo.#', '#ooooooooo.#', '#oooooo#####', '#ooo#.o#', '#oo#.#o.#', '#o#..#.o#', '##....#o.#',
  '......#.o#', '.......##',
] };
// рука: лише вказівний палець і кісточки, гаряча точка — верх пальця
const HAND = { name: 'hand', hot: [8, 0], rows: [
  '........##', '.......#..#', '.......#oo#', '.......#oo#', '.......#oo#', '.......#oo###',
  '.......#oo#..###', '.......#oo#oo#o.###', '.......#oo#oo#oo#o.#', '.......#oo#oo#oo#oo#', '.......#oo#oo#oo#oo#',
] };

function compile(tpl) {
  const dark = [], fill = [];
  tpl.rows.forEach((r, y) => [...r].forEach((c, x) => {
    const p = [x - tpl.hot[0], y - tpl.hot[1]];
    if (c === '#') dark.push(p); else if (c === 'o') fill.push(p);
  }));
  return { name: tpl.name, dark, fill };
}
const TPLS = [compile(ARROW), compile(HAND)];

// середня похибка: контур має бути темним (<110), заливка світлою і світлішою за контур
function score(g, W, H, x, y, t) {
  let s = 0, n = 0, dk = 0;
  for (const [dx, dy] of t.dark) {
    const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) return 1e9;
    const v = g[Y * W + X]; if (v > 150) return 1e9; s += v; dk += v; n++;
  }
  dk /= t.dark.length;
  for (const [dx, dy] of t.fill) {
    const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) return 1e9;
    const v = g[Y * W + X]; s += 255 - v; n++;
    if (v < dk + 60) return 1e9;
  }
  return s / n;
}

function search(g, W, H, x0, y0, x1, y1, best) {
  x0 = Math.max(0, x0 | 0); y0 = Math.max(0, y0 | 0); x1 = Math.min(W - 1, x1 | 0); y1 = Math.min(H - 1, y1 | 0);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (g[y * W + x] > 150 && g[(y + 3) * W + x] > 150) continue; // гаряча точка обох шаблонів біля темного пікселя
    for (const t of TPLS) {
      const s = score(g, W, H, x, y, t);
      if (s < best.s) Object.assign(best, { s, x, y, shape: t.name });
    }
  }
  return best;
}

export async function trackCursor(file, fps = 20) {
  const st = JSON.parse(execFileSync(ffprobe(), ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', file])).streams[0];
  const W = st.width, H = st.height, FS = W * H, B = 16, BW = Math.ceil(W / B), BH = Math.ceil(H / B);
  const p = spawn(ffmpeg(), ['-v', 'error', '-i', file, '-vf', `fps=${fps},format=gray`, '-f', 'rawvideo', '-']);
  const pts = [], changes = [];
  let buf = Buffer.alloc(0), prev = null, last = null, lost = 0, i = 0;
  const TH = 45;
  const step = (g) => {
    const best = { s: TH, x: 0, y: 0, shape: null };
    if (last) search(g, W, H, last[0] - 40, last[1] - 40, last[0] + 40, last[1] + 40, best);
    if (prev) {
      // блоки 16×16, що змінилися; якщо їх мало — шукаємо в них (курсор рухався)
      const ch = [];
      for (let by = 0; by < BH; by++) for (let bx = 0; bx < BW; bx++) {
        let d = 0;
        for (let y = by * B; y < Math.min(H, by * B + B); y += 2) for (let x = bx * B; x < Math.min(W, bx * B + B); x += 2) d += Math.abs(g[y * W + x] - prev[y * W + x]);
        if (d > 400) ch.push([bx, by]);
      }
      changes[i] = ch.length;
      if (ch.length && ch.length < 400) for (const [bx, by] of ch) search(g, W, H, bx * B - 20, by * B - 24, bx * B + B + 4, by * B + B, best);
    }
    if (!best.shape && (!last || lost % 10 === 0)) search(g, W, H, 0, 0, W - 1, H - 1, best);
    const t = +(i / fps).toFixed(3);
    if (best.shape) { last = [best.x, best.y]; lost = 0; pts.push([t, best.x, best.y, best.shape]); }
    else { lost++; pts.push([t, null]); }
    prev = g; i++;
  };
  for await (const chunk of p.stdout) {
    buf = Buffer.concat([buf, chunk]);
    while (buf.length >= FS) { step(new Uint8Array(buf.subarray(0, FS))); buf = buf.subarray(FS); }
    process.stdout.write(`\rкурсор: ${(i / fps).toFixed(0)} с`);
  }
  process.stdout.write('\n');
  return { fps, w: W, h: H, pts, clicks: findClicks(pts, changes, fps) };
}

// клік = курсор стоїть (зсув < 8 px за 0.3 с), і протягом 1.2 с після цього великий шматок екрана змінюється
// (≥ 60 блоків 16×16). ponytail: евристика без звуку миші; хибні/пропущені кліки правляться в edit.json → clicks
export function findClicks(pts, changes, fps) {
  const clicks = [];
  let lastT = -9;
  changes.forEach((n, i) => {
    const t = i / fps;
    if (!(n >= 60) || t - lastT < 0.8) return;
    lastT = t;
    const prev = pts.slice(Math.max(0, i - Math.round(1.2 * fps)), i).filter((p) => p[1] != null);
    const p = prev.at(-1);
    if (!p) return;
    if (prev.some((x) => x[0] >= p[0] - 0.3 && Math.hypot(x[1] - p[1], x[2] - p[2]) > 8)) return;
    clicks.push({ t: +Math.max(p[0], t - 0.15).toFixed(2), x: p[1], y: p[2] });
  });
  return clicks;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const [file, out, fps] = process.argv.slice(2);
  const r = await trackCursor(file, Number(fps) || 20);
  fs.writeFileSync(out, JSON.stringify(r));
  const found = r.pts.filter((p) => p[1] != null).length;
  console.log(`знайдено в ${found}/${r.pts.length} кадрах, кліки: ${r.clicks.map((c) => c.t).join(', ')} → ${out}`);
}
