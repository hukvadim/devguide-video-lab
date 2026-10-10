#!/usr/bin/env node
// Конвеєр монтажу: prep <video> | preview <edit.json> | render <edit.json> | selftest
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { TOOL, IS_WIN, WHISPER_MODEL, WHOOSH, findBin, findWhisper, need } from './bins.mjs';

// TOOL — папка скіла (моделі, node_modules, motion). Проєкт — папка з відео: work/, out/, assets/.
const FPS = 30;
// позиції тексту в просторі 1080×1920: capY — низ субтитрів (голова) або центр (спліт, стик половин)
const HEAD_STYLE = { capY: 1490, titleY: 380, calloutY: 340 };
const SPLIT_STYLE = { capY: 960, titleY: 760, calloutY: 250 };
const MEDIA = path.join(TOOL, 'media'); // звуки й музика обгортки (setup качає з Mixkit, генерує riser)
const SLAM = 1.0; // секунда удару в Intro (motion/Wrap.tsx: SLAM = 30 кадрів)

// ---------- утиліти ----------
let _ff, _fp;
const ffmpeg = () => (_ff ??= need('ffmpeg', findBin('ffmpeg')));
const ffprobe = () => (_fp ??= need('ffprobe', findBin('ffprobe')));

function run(bin, args, opts = {}) {
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 1 << 30, ...opts });
  if (r.status !== 0) throw new Error(`${path.basename(bin)} впав:\n${String(r.stderr || '').slice(-3000)}`);
  return r;
}

const r2 = (x) => Math.round(x * 100) / 100;
const even = (x) => Math.max(2, Math.round(x / 2) * 2); // розміри
const evenPos = (x) => Math.max(0, Math.round(x / 2) * 2); // координати (можуть бути 0)
const workDir = (video) => path.join(path.dirname(video), 'work', path.parse(video).name);

// ---------- prep ----------
function probe(video) {
  const j = JSON.parse(run(ffprobe(), ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', video]).stdout);
  const v = j.streams.find((s) => s.codec_type === 'video');
  const rot = Number(v.side_data_list?.find((d) => d.rotation != null)?.rotation ?? v.tags?.rotate ?? 0);
  const swap = Math.abs(rot) % 180 === 90;
  const [n, d] = v.r_frame_rate.split('/').map(Number);
  return {
    width: swap ? v.height : v.width,
    height: swap ? v.width : v.height,
    fps: n / d,
    duration: Number(j.format.duration),
    hasAudio: j.streams.some((s) => s.codec_type === 'audio'),
  };
}

// Формат 2: у папці лежать камера, запис екрана й окремий мікрофон — шукаємо їх за назвою
function findSources(dir) {
  const files = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile());
  const pick = (re, ext) => { const f = files.find((x) => re.test(x) && ext.test(x)); return f && path.join(dir, f); };
  const vid = /\.(mp4|mov|mkv|webm)$/i;
  const src = {
    head: pick(/head|голов|cam|камер/i, vid),
    screen: pick(/screen|екран/i, vid),
    audio: pick(/sound|audio|mic|звук|мікро/i, /\.(wav|mp3|m4a|aac|flac)$/i),
  };
  if (!src.head) throw new Error(`у ${dir} не знайдено відео камери (назва має містити Head / голова / cam)`);
  return src;
}

// огинаюча гучності з частотою `rate` Гц (середнє |x| у вікні), без постійної складової
function envelope(file, rate) {
  const step = 16;
  const buf = run(ffmpeg(), ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', String(rate * step), '-f', 's16le', '-'], { encoding: 'buffer' }).stdout;
  const o = new Float32Array(Math.floor(buf.length / 2 / step));
  for (let i = 0; i < o.length; i++) { let s = 0; for (let j = 0; j < step; j++) s += Math.abs(buf.readInt16LE((i * step + j) * 2)); o[i] = s / step; }
  const m = o.reduce((a, x) => a + x, 0) / o.length;
  return o.map((x) => x - m);
}

// зсув (у відліках), за якого b найкраще лягає на a: b[i] ≈ a[i + lag]
function xcorrLag(a, b, from, to) {
  let best = -Infinity, lag = 0;
  for (let l = from; l <= to; l++) {
    let s = 0;
    for (let i = Math.max(0, -l); i < b.length && i + l < a.length; i++) s += a[i + l] * b[i];
    if (s > best) { best = s; lag = l; }
  }
  return lag;
}

// де в `ref` (секунди) починається `other`: грубо на 100 Гц у межах ±60 с, далі точно на 1 кГц ±0.1 с
function syncOffset(ref, other) {
  const coarse = xcorrLag(envelope(ref, 100), envelope(other, 100), -6000, 6000) / 100;
  const c = Math.round(coarse * 1000);
  return xcorrLag(envelope(ref, 1000), envelope(other, 1000), c - 100, c + 100) / 1000;
}

function prep(input, lang = 'auto', opts = {}) {
  input = path.resolve(input);
  const src = fs.statSync(input).isDirectory() ? findSources(input)
    : { head: input, audio: opts.audio && path.resolve(opts.audio), screen: opts.screen && path.resolve(opts.screen) };
  const video = src.head;
  const name = path.parse(video).name.replace(/[\s_-]*(head|голова|cam|camera|камера)$/i, '') || path.parse(video).name;
  const dir = path.join(path.dirname(video), 'work', name);
  fs.mkdirSync(dir, { recursive: true });
  const info = probe(video);
  fs.writeFileSync(path.join(dir, 'probe.json'), JSON.stringify(info, null, 2));
  console.log('probe:', info);

  // головна шкала часу — окремий мікрофон, якщо він є; зсуви: час_у_файлі = t_мікрофона + зсув
  const voice = src.audio ?? video;
  if (src.audio || src.screen) {
    const rel = (f) => f && path.relative(path.dirname(video), f).replaceAll('\\', '/');
    const sync = { source: rel(video), audio: rel(src.audio), screen: rel(src.screen),
      head: src.audio ? syncOffset(video, src.audio) : 0 };
    if (src.screen) sync.screenOffset = src.audio ? syncOffset(src.screen, src.audio) : syncOffset(src.screen, video);
    fs.writeFileSync(path.join(dir, 'sync.json'), JSON.stringify(sync, null, 2));
    console.log('синхронізація (час_у_файлі = t + зсув):', sync);
  }

  const wav = path.join(dir, 'audio16k.wav');
  run(ffmpeg(), ['-y', '-v', 'error', '-i', voice, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wav]);

  console.log('whisper… (на слабкому CPU це кілька хвилин)');
  run(need('whisper-cli', findWhisper()), ['-m', WHISPER_MODEL, '-l', lang, '-t', String(os.availableParallelism()),
    '-ml', '1', '-sow', '-oj', '-of', path.join(dir, 'whisper'), '-f', wav]);
  const wj = JSON.parse(fs.readFileSync(path.join(dir, 'whisper.json'), 'utf8'));
  const words = wj.transcription
    .map((t) => ({ s: t.offsets.from / 1000, e: t.offsets.to / 1000, w: t.text.trim() }))
    .filter((x) => x.w && !/^[[(].*[\])]$/.test(x.w));
  fs.writeFileSync(path.join(dir, 'transcript.json'), JSON.stringify({ lang: wj.result?.language, words }, null, 1));

  const sd = run(ffmpeg(), ['-v', 'info', '-i', wav, '-af', 'silencedetect=n=-30dB:d=0.2', '-f', 'null', '-']).stderr;
  const starts = [...sd.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...sd.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const silences = starts.map((s, i) => ({ s, e: ends[i] ?? info.duration }));
  fs.writeFileSync(path.join(dir, 'silences.json'), JSON.stringify(silences, null, 1));

  // фрази для читання: розрив на паузі > 0.6 с або кінці речення
  let line = [];
  const flush = () => line.length && console.log(`[${line[0].s.toFixed(2)}–${line.at(-1).e.toFixed(2)}] ${line.map((x) => x.w).join(' ')}`);
  for (const [i, w] of words.entries()) {
    if (line.length && (w.s - line.at(-1).e > 0.6 || /[.?!…]$/.test(line.at(-1).w))) { flush(); line = []; }
    line.push(w);
    if (i === words.length - 1) flush();
  }
  console.log(`\nпауз: ${silences.length}. Файли в ${dir}`);
}

// ---------- перерахунок часу ----------
function snapSegments(segments, fps) {
  let off = 0;
  return segments.map((g) => {
    const start = Math.round(g.start * fps) / fps;
    const end = Math.round(g.end * fps) / fps;
    const seg = { ...g, start, end, off };
    off += end - start;
    return seg;
  });
}

function mapTime(segs, t) {
  const g = segs.find((x) => t >= x.start && t < x.end);
  return g ? g.off + t - g.start : null;
}

function mapWords(segs, words) {
  const out = [];
  for (const g of segs)
    for (const w of words) {
      const mid = (w.s + w.e) / 2;
      if (mid >= g.start && mid < g.end)
        out.push({ s: g.off + Math.max(w.s, g.start) - g.start, e: g.off + Math.min(w.e, g.end) - g.start, w: w.w });
    }
  return out;
}

// whisper на початку фраз часто дає слова нульової довжини, ще й у паузі.
// Зсуваємо старт із паузи на її кінець і розтягуємо «злиплі» слова пропорційно довжині.
function retime(words, silences) {
  const w = words.map((x) => {
    const sil = silences.find((s) => x.s >= s.s && x.s < s.e);
    const s = sil ? sil.e : x.s;
    return { ...x, s, e: Math.max(x.e, s) };
  });
  for (let i = 0; i < w.length; i++) {
    let j = i;
    while (j < w.length - 1 && w[j].e - w[j].s < 0.06) j++;
    if (j === i) continue;
    const run = w.slice(i, j + 1), a = run[0].s, b = run.at(-1).e;
    const total = run.reduce((n, x) => n + x.w.length, 0);
    let t = a;
    for (const x of run) { x.s = t; t += ((b - a) * x.w.length) / total; x.e = t; }
    i = j;
  }
  return w;
}

// ---------- граф ffmpeg ----------
// кроп під аспект a (w/h): повна висота або ширина, зсув cropX, наближення zoom до верхньої частини (обличчя)
function cropBox(src, cropX = 0.5, zoom = 1, a = 9 / 16) {
  let bw = src.width, bh = src.height, bx = 0, by = 0;
  if (src.width / src.height > a) { bw = src.height * a; bx = (src.width - bw) * cropX; }
  else { bh = src.width / a; by = (src.height - bh) * 0.5; }
  const w = bw / zoom, h = bh / zoom;
  const W2 = Math.min(even(w), src.width), H2 = Math.min(even(h), src.height);
  return { w: W2, h: H2, x: Math.min(evenPos(bx + (bw - w) / 2), src.width - W2), y: Math.min(evenPos(by + (bh - h) * 0.4), src.height - H2) };
}

// кадр голови під аспект a: face = [x, y] центру обличчя (частки кадру камери) — обличчя стає по центру по X
// і на ~38% висоти; zoom > 1 відрізає краї (1.25 ≈ по 10% з кожного боку від повновисотного кропу)
function headBox(src, face = [0.5, 0.35], zoom = 1.25, a = 9 / 16) {
  const bw = Math.min(src.width, src.height * a);
  const w = Math.min(even(bw / zoom), src.width), h = Math.min(even(w / a), src.height);
  const clampTo = (v, max) => Math.max(0, Math.min(v, max));
  return { w, h, x: evenPos(clampTo(face[0] * src.width - w / 2, src.width - w)), y: evenPos(clampTo(face[1] * src.height - h * 0.38, src.height - h)) };
}

// координати в просторі 1080×1920 (S — розмір іконки там же)
const ICON_POS = {
  'top-right': (S) => [1080 - S - 60, 250],
  'top-left': () => [60, 250],
  'top-center': (S) => [(1080 - S) / 2, 230],
  'mid-right': (S) => [1080 - S - 50, 760],
  'mid-left': () => [50, 760],
};

// ділянка екрана focus = [x, y, w] (лівий верхній кут і ширина в пікселях запису) під аспект a; без focus — повна висота по центру
function focusBox(scr, focus, a) {
  const maxW = Math.min(scr.width, scr.height * a);
  const [fx, fy, fw] = focus ?? [(scr.width - maxW) / 2, 0, maxW];
  const w = Math.min(even(Math.min(fw, maxW)), scr.width), h = Math.min(even(w / a), scr.height);
  const clampTo = (v, max) => Math.max(0, Math.min(v, max));
  return { w, h, x: evenPos(clampTo(fx, scr.width - w)), y: evenPos(clampTo(fy, scr.height - h)) };
}

const trimAt = (g, off = 0) => off
  ? `trim=start=${(g.start + off).toFixed(3)}:end=${(g.end + off).toFixed(3)},setpts=PTS-STARTPTS`
  : `trim=start=${g.start}:end=${g.end},setpts=PTS-STARTPTS`;

// sync: { head, screenOffset } — зсуви файлів відносно шкали мікрофона; scr — розміри запису екрана (формат 2, спліт)
const segVideo = (g, i, src, edit, W, H, sync = {}, scr) => {
  if (!scr) {
    const c = cropBox(src, edit.cropX ?? 0.5, g.zoom ?? 1);
    return `[v${i}]${trimAt(g, sync.head)},crop=${c.w}:${c.h}:${c.x}:${c.y},scale=${W}:${H}:flags=lanczos,setsar=1,fps=${FPS}[sv${i}]`;
  }
  // спліт: екран зверху [tv], голова знизу [hv] — склеюються окремими потоками (голові потім розмиваємо фон)
  const sh = even(H / 2), hh = H - sh;
  const f = focusBox(scr, g.focus ?? edit.focus, W / sh);
  return [headSeg(g, i, src, edit, sync, W, hh, FPS),
    `[s${i}]${trimAt(g, sync.screenOffset)},crop=${f.w}:${f.h}:${f.x}:${f.y},scale=${W}:${sh}:flags=lanczos,setsar=1,fps=${FPS}[tv${i}]`,
  ].join(';\n');
};

// кадр голови для нижньої половини спліту: обличчя по центру, базове наближення headZoom × чергування zoom
const headSeg = (g, i, src, edit, sync, w, h, fps) => {
  const c = headBox(src, g.face ?? edit.face, (edit.headZoom ?? 1.25) * (g.zoom ?? 1), w / h);
  return `[v${i}]${trimAt(g, sync.head)},crop=${c.w}:${c.h}:${c.x}:${c.y},scale=${w}:${h}:flags=lanczos,setsar=1,fps=${fps}[hv${i}]`;
};

// лише склейки + zoom, без звуку й накладань — вхід для маски людини
function baseGraph({ edit, segs, src, W, H, sync = {} }) {
  return [`[0:v]split=${segs.length}${segs.map((_, i) => `[v${i}]`).join('')}`,
    ...segs.map((g, i) => segVideo(g, i, src, edit, W, H, sync)),
    `${segs.map((_, i) => `[sv${i}]`).join('')}concat=n=${segs.length}:v=1:a=0,format=rgb24[vb]`].join(';\n');
}

// спліт: лише нижня половина (голова) у малій роздільності й 15 fps — вхід для маски розмиття фону
function headBaseGraph({ edit, segs, src, w, h, sync = {} }) {
  return [`[0:v]split=${segs.length}${segs.map((_, i) => `[v${i}]`).join('')}`,
    ...segs.map((g, i) => headSeg(g, i, src, edit, sync, w, h, 15)),
    `${segs.map((_, i) => `[hv${i}]`).join('')}concat=n=${segs.length}:v=1:a=0,format=rgb24[vb]`].join(';\n');
}

// aIdx — вхід зі звуком голосу (окремий мікрофон або сам source); scrIdx/scr — запис екрана для спліту
function buildGraph({ edit, segs, src, total, W, H, audioOnly, voiceGainDb = 0, icons = [], musicIdx, brolls = [], matteIdx, cutaways = [],
  aIdx = 0, sync = {}, scrIdx, scr, headMatteIdx, textIdx, wrap }) {
  const N = segs.length;
  const f = [];
  const k = W / 1080;
  f.push(`[${aIdx}:a]asplit=${N}${segs.map((_, i) => `[a${i}]`).join('')}`);
  if (!audioOnly) f.push(`[0:v]split=${N}${segs.map((_, i) => `[v${i}]`).join('')}`);
  // екран коротший за мовлення → тримаємо останній кадр, щоб vstack не зупинився
  if (!audioOnly && scr) f.push(`[${scrIdx}:v]tpad=stop_mode=clone:stop_duration=30,split=${N}${segs.map((_, i) => `[s${i}]`).join('')}`);
  segs.forEach((g, i) => {
    const d = g.end - g.start;
    f.push(`[a${i}]atrim=start=${g.start}:end=${g.end},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, d - 0.02).toFixed(3)}:d=0.02[sa${i}]`);
    if (!audioOnly) f.push(segVideo(g, i, src, edit, W, H, sync, scr));
  });
  if (audioOnly) f.push(`${segs.map((_, i) => `[sa${i}]`).join('')}concat=n=${N}:v=0:a=1[ac]`);
  else if (!scr) f.push(`${segs.map((_, i) => `[sv${i}][sa${i}]`).join('')}concat=n=${N}:v=1:a=1[vc][ac]`);
  else {
    const sh = even(H / 2), hh = H - sh, line = Math.max(2, even(H / 480));
    f.push(`${segs.map((_, i) => `[tv${i}][hv${i}][sa${i}]`).join('')}concat=n=${N}:v=2:a=1[vtop][vhead][ac]`);
    let head = 'vhead';
    if (headMatteIdx != null) {
      // розмитий фон за людиною: різка людина (маска RVM) поверх розмитої копії кадру
      f.push(`[vhead]split[hs][hb]`);
      f.push(`[hb]gblur=sigma=${(16 * k).toFixed(1)},eq=brightness=-0.04:saturation=0.85[hbl]`);
      f.push(`[${headMatteIdx}:v]fps=${FPS},scale=${W}:${hh},format=gray[hm]`);
      f.push(`[hs][hm]alphamerge[hp]`);
      f.push(`[hbl][hp]overlay=format=auto[hfx]`);
      head = 'hfx';
    }
    // жовта лінія на стику — лише за бажанням (seamLine: true): без неї субтитри на стику виглядають чистіше
    f.push(`[vtop][${head}]vstack${edit.seamLine ? `,drawbox=x=0:y=${sh - line / 2}:w=${W}:h=${line}:color=0xFFD200:t=fill` : ''}[vc]`);
  }

  const voice = `highpass=f=80,afftdn=nf=-25,equalizer=f=3000:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2`;
  if (audioOnly) { f.push(`[ac]${voice},loudnorm=print_format=json[aout]`); return f.join(';\n'); }

  const fadeA = `afade=t=in:d=0.15,afade=t=out:st=${(total - 0.4).toFixed(3)}:d=0.4`;
  const extras = [];
  const mainMusic = musicIdx != null && !wrap;
  f.push(`[ac]${voice},volume=${voiceGainDb.toFixed(2)}dB${mainMusic ? ',asplit[vo][vsc]' : '[vo]'}`);
  if (mainMusic) {
    // м'яке приглушення: пауз після монтажу майже немає, тож музика має жити й під голосом (~−14 дБ від нього)
    f.push(`[${musicIdx}:a]atrim=0:${total.toFixed(3)},volume=${edit.music.volume ?? 0.3},afade=t=in:d=1,afade=t=out:st=${(total - 1.5).toFixed(3)}:d=1.5[mus]`);
    f.push(`[mus][vsc]sidechaincompress=threshold=0.05:ratio=3:attack=30:release=500[duck]`);
    extras.push('[duck]');
  }
  cutaways.forEach((c, i) => {
    if (c.sfxIdx == null) return;
    const ms = Math.round(Math.max(0, c.t - 0.2) * 1000);
    f.push(`[${c.sfxIdx}:a]adelay=delays=${ms}:all=1,volume=0.5[sfx${i}]`);
    extras.push(`[sfx${i}]`);
  });
  // з обгорткою голос іде далі в concat без лімітера/фейдів — їх ставимо на фінальний мікс
  const aMain = wrap ? 'amain' : 'aout';
  const aTail = wrap ? 'aresample=48000,aformat=channel_layouts=stereo' : `alimiter=limit=0.84:level=disabled,${fadeA}`;
  f.push(extras.length
    ? `[vo]${extras.join('')}amix=inputs=${1 + extras.length}:duration=first:normalize=0,${aTail}[${aMain}]`
    : `[vo]${aTail}[${aMain}]`);

  f.push(`[vc]eq=contrast=1.05:saturation=1.12:brightness=0.01[ve]`);
  let last = 've';
  if (brolls.length) {
    // фон → картки b-roll → людина (те саме відео з маскою RVM) поверх
    f.push(`[ve]split[bg0][fg]`);
    brolls.forEach((b, i) => {
      f.push(`[${b.idx}:v]setpts=PTS-STARTPTS+${b.t.toFixed(3)}/TB[br${i}]`);
      f.push(`[bg${i}][br${i}]overlay=eof_action=pass:format=auto[bg${i + 1}]`);
    });
    f.push(`[${matteIdx}:v]scale=${W}:${H},format=gray[mt]`);
    f.push(`[fg][mt]alphamerge[person]`);
    f.push(`[bg${brolls.length}][person]overlay=format=auto[vp]`);
    last = 'vp';
  }
  // повноекранні стокові вставки: cover-кроп у 9:16, повільна панорама, перехід через прозорість 0.25 с
  cutaways.forEach((c, i) => {
    const fit = c.width / c.height > W / H ? `scale=-2:${even(H * 1.08)}` : `scale=${even(W * 1.08)}:-2`;
    const d = c.dur.toFixed(3);
    f.push(`[${c.idx}:v]fps=${FPS},${fit},crop=${W}:${H}:x='(iw-ow)*${c.cropX ?? 0.5}':y='(ih-oh)*(0.2+0.6*t/${d})',setsar=1,` +
      `eq=contrast=1.04:saturation=1.08,format=yuva420p,fade=t=in:d=0.25:alpha=1,fade=t=out:st=${(c.dur - 0.25).toFixed(3)}:d=0.25:alpha=1,` +
      `setpts=PTS-STARTPTS+${c.t.toFixed(3)}/TB[cw${i}]`);
    f.push(`[${last}][cw${i}]overlay=eof_action=pass:format=auto[cut${i}]`);
    last = `cut${i}`;
  });
  icons.forEach((ic, i) => {
    const S0 = ic.size ?? 240;
    const S = Math.round(S0 * k);
    const [x, y] = (ICON_POS[ic.pos] ?? ICON_POS['top-right'])(S0).map((v) => Math.round(v * k));
    const fo = Math.max(0, ic.dur - 0.25).toFixed(2);
    f.push(`[${ic.idx}:v]format=rgba,scale=${S}:-1,fade=t=in:d=0.25:alpha=1,fade=t=out:st=${fo}:d=0.25:alpha=1,setpts=PTS-STARTPTS+${ic.t.toFixed(3)}/TB[ic${i}]`);
    f.push(`[${last}][ic${i}]overlay=x=${x}:y='${y}+40*max(0,1-(t-${ic.t.toFixed(3)})/0.3)':enable='between(t,${ic.t.toFixed(3)},${(ic.t + ic.dur).toFixed(3)})':eof_action=pass[vi${i}]`);
    last = `vi${i}`;
  });
  // увесь текст (субтитри, титул, плашки, удари) — один прозорий шар Remotion на весь ролик
  if (textIdx != null) {
    f.push(`[${textIdx}:v]setpts=PTS-STARTPTS[tx]`);
    f.push(`[${last}][tx]overlay=eof_action=pass:format=auto[vt]`);
    last = 'vt';
  }
  if (!wrap) {
    f.push(`[${last}]fade=t=in:d=0.3,fade=t=out:st=${(total - 0.4).toFixed(3)}:d=0.4,format=yuv420p[vout]`);
    return f.join(';\n');
  }
  // обгортка: інтро → ролик → end card; музика з дропом на слам інтро, приглушена під голосом; удари й переходи
  const norm = `fps=${FPS},scale=${W}:${H},setsar=1,format=yuv420p`;
  f.push(`[${last}]${norm}[vmain]`);
  const parts = [];
  if (wrap.intro) { f.push(`[${wrap.intro.idx}:v]${norm}[vin]`, `anullsrc=r=48000:cl=stereo,atrim=0:${wrap.intro.dur.toFixed(3)}[ain]`); parts.push('[vin][ain]'); }
  parts.push('[vmain][amain]');
  if (wrap.outro) { f.push(`[${wrap.outro.idx}:v]${norm}[vou]`, `anullsrc=r=48000:cl=stereo,atrim=0:${wrap.outro.dur.toFixed(3)}[aou]`); parts.push('[vou][aou]'); }
  f.push(`${parts.join('')}concat=n=${parts.length}:v=1:a=1[vout][acat]`);
  const all = wrap.total;
  const mix = ['[acv]'];
  if (wrap.music) {
    f.push('[acat]asplit[acv][akey]');
    f.push(`[${wrap.music.idx}:a]atrim=0:${all.toFixed(3)},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume=${wrap.music.volume},afade=t=in:d=0.6,afade=t=out:st=${(all - 2.5).toFixed(3)}:d=2.5[mraw]`);
    f.push('[mraw][akey]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=450[mduck]');
    mix.push('[mduck]');
  } else f.push('[acat]anull[acv]');
  wrap.sfx.forEach((x, i) => {
    f.push(`[${x.idx}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=delays=${Math.round(Math.max(0, x.t) * 1000)}:all=1,volume=${x.vol}[wx${i}]`);
    mix.push(`[wx${i}]`);
  });
  f.push(`${mix.join('')}amix=inputs=${mix.length}:duration=first:normalize=0,alimiter=limit=0.84:level=disabled,afade=t=in:d=0.05,afade=t=out:st=${(all - 0.5).toFixed(3)}:d=0.5[aout]`);
  return f.join(';\n');
}

// ---------- render ----------
let _qsv;
function hasQsv() {
  if (_qsv != null) return _qsv;
  if (!IS_WIN) return (_qsv = false);
  const r = spawnSync(ffmpeg(), ['-v', 'error', '-f', 'lavfi', '-i', 'color=s=256x256:d=0.2', '-c:v', 'h264_qsv', '-f', 'null', '-']);
  return (_qsv = r.status === 0);
}

const sha = (x) => createHash('sha1').update(x).digest('hex').slice(0, 10);

// прозорий кліп Remotion (ProRes 4444); картинки беруться з <проєкт>/assets/covers; кеш за props + кодом композиції
const renderBroll = (dir, project, props) => renderMotion(dir, project, 'Broll', props);

// весь код motion/ (компоненти тягнуть theme/layout) — частина ключа кешу
const motionCode = () => fs.readdirSync(path.join(TOOL, 'motion')).sort().map((f) => fs.readFileSync(path.join(TOOL, 'motion', f), 'utf8')).join('\n');

// opaque: H.264 без альфи (інтро, end card); інакше прозорий ProRes 4444
function renderMotion(dir, project, comp, props, opaque = false) {
  const file = path.join(dir, `${comp.toLowerCase()}_${sha(JSON.stringify(props) + motionCode())}.${opaque ? 'mp4' : 'mov'}`);
  if (fs.existsSync(file)) return file;
  const propsFile = file.slice(0, file.lastIndexOf('.')) + '.json';
  fs.writeFileSync(propsFile, JSON.stringify(props));
  console.log(`${comp} ${props.layout ?? ''} (${props.dur} с)…`);
  run(process.execPath, [path.join(TOOL, 'node_modules/@remotion/cli/remotion-cli.js'), 'render', 'motion/index.ts', comp, file,
    `--props=${propsFile}`, ...(opaque ? ['--codec=h264', '--crf=16'] : ['--codec=prores', '--prores-profile=4444', '--image-format=png', '--pixel-format=yuva444p10le']),
    `--public-dir=${path.join(project, 'assets')}`, '--log=error'], { cwd: TOOL });
  return file;
}

// маска людини 432×768 лише на відрізках b-roll (+0.5 с розгону RVM); кеш за склейками й відрізками
async function ensureMatte(dir, source, edit, segs, src, brolls, sync = {}) {
  const ranges = brolls.map((b) => [Math.max(0, Math.floor((b.t - 0.5) * FPS)), Math.ceil((b.t + b.dur) * FPS)]);
  const key = sync.head ? [edit.source, edit.cropX, segs, ranges, sync.head] : [edit.source, edit.cropX, segs, ranges];
  const file = path.join(dir, `matte_${sha(JSON.stringify(key))}.mkv`);
  if (fs.existsSync(file)) return file;
  const [w, h] = [432, 768];
  fs.writeFileSync(path.join(dir, 'graph_base.txt'), baseGraph({ edit, segs, src, W: w, H: h, sync }));
  const { makeMatte } = await import('./matte.mjs');
  await makeMatte(ffmpeg(), ['-v', 'error', '-i', source, '-/filter_complex', 'graph_base.txt', '-map', '[vb]', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
    file + '.tmp.mkv', { w, h, fps: FPS, cwd: dir, ranges });
  fs.renameSync(file + '.tmp.mkv', file);
  return file;
}

// маска голови для спліту: 384×342, 15 fps, на весь ролик (RVM на CPU ~1–3 кадри/с) — кеш за склейками й кадруванням
async function ensureHeadMatte(dir, source, edit, segs, src, sync) {
  const key = [edit.source, segs, edit.face, edit.headZoom, sync.head];
  const file = path.join(dir, `headmatte_${sha(JSON.stringify(key))}.mkv`);
  if (fs.existsSync(file)) return file;
  const [w, h] = [384, 342];
  fs.writeFileSync(path.join(dir, 'graph_head.txt'), headBaseGraph({ edit, segs, src, w, h, sync }));
  const { makeMatte } = await import('./matte.mjs');
  console.log('маска голови для розмиття фону (один раз, далі з кешу)…');
  await makeMatte(ffmpeg(), ['-v', 'error', '-i', source, '-/filter_complex', 'graph_head.txt', '-map', '[vb]', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
    file + '.tmp.mkv', { w, h, fps: 15, cwd: dir, ratio: 0.6 });
  fs.renameSync(file + '.tmp.mkv', file);
  return file;
}

async function render(editPath, preview) {
  editPath = path.resolve(editPath);
  const dir = path.dirname(editPath);
  const edit = JSON.parse(fs.readFileSync(editPath, 'utf8'));
  const project = path.resolve(dir, '..', '..'); // <проєкт>/work/<назва>/edit.json
  const source = path.resolve(project, edit.source);
  const src = JSON.parse(fs.readFileSync(path.join(dir, 'probe.json'), 'utf8'));
  const words = retime(JSON.parse(fs.readFileSync(path.join(dir, 'transcript.json'), 'utf8')).words,
    JSON.parse(fs.readFileSync(path.join(dir, 'silences.json'), 'utf8')));
  const segs = snapSegments(edit.segments, src.fps);
  const total = segs.at(-1).off + segs.at(-1).end - segs.at(-1).start;
  const [W, H] = preview ? [540, 960] : [1080, 1920];

  // формат 2: окремий мікрофон (головна шкала часу) і запис екрана; зсуви — з sync.json від prep, edit.sync їх перекриває
  const syncFile = path.join(dir, 'sync.json');
  const sync = { ...(fs.existsSync(syncFile) ? JSON.parse(fs.readFileSync(syncFile, 'utf8')) : {}), ...edit.sync };
  if (!edit.audio) sync.head = 0; // без мікрофона шкала = сама камера
  const audioFile = edit.audio && path.resolve(project, edit.audio);
  const screenFile = edit.screen && edit.layout !== 'head' ? path.resolve(project, edit.screen) : null;
  const scr = screenFile ? probe(screenFile) : undefined;
  if (scr) console.log(`спліт: екран зверху, камера знизу; зсуви камера ${sync.head ?? 0} с, екран ${sync.screenOffset ?? 0} с`);

  // прохід 1: міряємо гучність голосу після обробки → підганяємо до -14 LUFS
  fs.writeFileSync(path.join(dir, 'graph_audio.txt'), buildGraph({ edit, segs, src, total, W, H, audioOnly: true }));
  const m = run(ffmpeg(), ['-hide_banner', '-i', audioFile ?? source, '-/filter_complex', 'graph_audio.txt', '-map', '[aout]', '-f', 'null', '-'], { cwd: dir }).stderr;
  const meas = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
  const voiceGainDb = -14 - Number(meas.input_i);
  console.log(`голос: ${meas.input_i} LUFS → підсилення ${voiceGainDb.toFixed(1)} дБ`);

  const inputs = ['-i', source];
  let idx = 1, aIdx = 0, scrIdx;
  if (audioFile) { inputs.push('-i', audioFile); aIdx = idx++; }
  if (scr) { inputs.push('-i', screenFile); scrIdx = idx++; }
  const icons = [];
  for (const ic of edit.icons ?? []) {
    const t = mapTime(segs, ic.at);
    const file = path.resolve(project, ic.file);
    if (t == null || !fs.existsSync(file)) { console.warn('іконку пропущено:', ic.file); continue; }
    const dur = Math.min(ic.dur ?? 1.5, total - t);
    inputs.push('-loop', '1', '-framerate', String(FPS), '-t', dur.toFixed(3), '-i', file);
    icons.push({ ...ic, t, dur, idx: idx++ });
  }
  const brolls = [];
  let matteIdx;
  if (scr && edit.broll?.length) console.warn('у спліті b-roll «за спиною» вимкнено (людина лише в нижній половині)');
  for (const b of scr ? [] : edit.broll ?? []) {
    const t = mapTime(segs, b.at);
    if (t == null) { console.warn('b-roll у вирізаному шматку, пропускаю:', b.at); continue; }
    const dur = r2(Math.min(b.dur ?? 3, total - t));
    inputs.push('-i', renderBroll(dir, project, { layout: b.layout, images: b.images, site: edit.site ?? '', avoid: edit.avoid, dur, w: W, h: H }));
    brolls.push({ t, dur, idx: idx++ });
  }
  if (brolls.length) {
    inputs.push('-i', await ensureMatte(dir, source, edit, segs, src, brolls, sync));
    matteIdx = idx++;
  }
  const cutaways = [];
  const whoosh = edit.whoosh ? path.resolve(project, edit.whoosh)
    : [path.join(project, 'assets/sfx/whoosh.mp3'), WHOOSH].find((p) => fs.existsSync(p)) ?? '';
  for (const c of edit.cutaways ?? []) {
    const t = mapTime(segs, c.at);
    const file = path.resolve(project, c.file);
    if (t == null || !fs.existsSync(file)) { console.warn('вставку пропущено:', c.file); continue; }
    const dur = Math.min(c.dur ?? 3, total - t);
    const { width, height } = probe(file);
    inputs.push('-ss', String(c.from ?? 0), '-t', dur.toFixed(3), '-i', file);
    const cut = { ...c, t, dur, width, height, idx: idx++ };
    if (fs.existsSync(whoosh)) { inputs.push('-i', whoosh); cut.sfxIdx = idx++; }
    cutaways.push(cut);
  }
  // спліт: маска людини на нижній половині → розмитий фон за головою (bgBlur: false — вимкнути)
  let headMatteIdx;
  if (scr && edit.bgBlur !== false) {
    inputs.push('-i', await ensureHeadMatte(dir, source, edit, segs, src, sync));
    headMatteIdx = idx++;
  }
  // текст: один прозорий шар Remotion на весь ролик (motion/Text.tsx) — субтитри, титул, плашки, удари
  const split = !!scr;
  const st = { ...(split ? SPLIT_STYLE : HEAD_STYLE), ...edit.style };
  const accent = edit.captions?.accent ?? '#C3FF55';
  const emph = (edit.captions?.emphasis ?? []).map((x) => x.toLowerCase());
  const at = (x, what) => { const t = mapTime(segs, x); if (t == null) console.warn(`${what} у вирізаному шматку, пропускаю:`, x); return t; };
  const callouts = (edit.callouts ?? []).map((c) => ({ c, t: at(c.at, 'плашка') })).filter((x) => x.t != null)
    .map(({ c, t }) => ({ t: r2(t), dur: r2(Math.min(c.dur ?? 2.6, total - t)), text: c.text, y: c.y ?? st.calloutY }));
  const hits = (edit.hits ?? []).map((h) => at(h.at ?? h, 'удар')).filter((t) => t != null).map(r2);
  const textProps = {
    w: W, h: H, dur: r2(total), accent,
    words: edit.captions === false ? [] : mapWords(segs, words).map((x) => ({ s: r2(x.s), e: r2(x.e), w: x.w, em: emph.some((p) => x.w.toLowerCase().replace(/^[^\p{L}]+/u, '').startsWith(p)) || undefined })),
    capY: st.capY, capAnchor: split ? 'center' : 'bottom',
    title: edit.title?.text ? { t: 0.05, dur: r2(edit.title.dur ?? 2.6), text: edit.title.text, y: st.titleY } : null,
    callouts, hits,
  };
  inputs.push('-i', renderMotion(dir, project, 'Text', textProps));
  const textIdx = idx++;

  // музика: з обгорткою за замовчуванням трек скіла з дропом на слам інтро
  const music = edit.music === false ? null : {
    file: edit.music?.file ? path.resolve(project, edit.music.file) : path.join(MEDIA, 'cat-walk.mp3'),
    drop: edit.music?.file ? edit.music?.drop : (edit.music?.drop ?? 29.55),
    volume: edit.music?.volume ?? 0.32,
  };
  if (music && !fs.existsSync(music.file)) { console.warn('музику не знайдено, рендер без неї:', music.file); }
  const hasMusic = music && fs.existsSync(music.file);

  // обгортка DevGuide: інтро (якщо задано edit.intro) і end card (outro, вимикається "outro": false)
  let wrap, musicIdx = null;
  const introDur = edit.intro ? edit.intro.dur ?? 4 : 0;
  const outroDur = edit.outro === false ? 0 : edit.outro?.dur ?? 7;
  if (introDur || outroDur) {
    wrap = { total: introDur + total + outroDur, sfx: [] };
    if (introDur) {
      inputs.push('-i', renderMotion(dir, project, 'Intro', { w: W, h: H, dur: introDur, accent, kicker: edit.intro.kicker, big: edit.intro.big, sub: edit.intro.sub }, true));
      wrap.intro = { idx: idx++, dur: introDur };
    }
    if (outroDur) {
      const o = edit.outro ?? {};
      inputs.push('-i', renderMotion(dir, project, 'Outro', { w: W, h: H, dur: outroDur, accent, tagline: o.tagline, cta: o.cta, url: o.url ?? edit.site ?? 'devguide.com.ua', offer: o.offer, keyword: o.keyword }, true));
      wrap.outro = { idx: idx++, dur: outroDur };
    }
    if (hasMusic) {
      const startAt = music.drop != null ? Math.max(0, music.drop - (introDur ? SLAM : 0)) : 0;
      inputs.push('-stream_loop', '-1', '-ss', startAt.toFixed(3), '-i', music.file);
      wrap.music = { idx: idx++, volume: music.volume };
    }
    const sfx = (file, t, vol) => { const p = path.join(MEDIA, file); if (fs.existsSync(p)) { inputs.push('-i', p); wrap.sfx.push({ idx: idx++, t, vol }); } };
    if (introDur) { sfx('riser-1s.wav', SLAM - 1, 0.5); sfx('impact-cine-big.mp3', SLAM - 0.05, 0.7); sfx('air-whoosh-powerful.mp3', introDur - 0.4, 0.45); }
    hits.forEach((t) => sfx('impact-movie-epic.mp3', introDur + t - 0.05, 0.35));
    if (outroDur) {
      const o0 = introDur + total;
      sfx('whoosh-fast.mp3', o0 - 0.3, 0.4); sfx('impact-movie-epic.mp3', o0, 0.6); sfx('stomp-apocalyptic.mp3', o0, 0.3); sfx('sparkle-touch.mp3', o0 + 1.35, 0.25);
    }
  } else if (hasMusic) {
    inputs.push('-stream_loop', '-1', '-i', music.file);
    musicIdx = idx++;
    edit.music = { ...edit.music, volume: music.volume };
  }

  fs.writeFileSync(path.join(dir, 'graph.txt'), buildGraph({ edit, segs, src, total, W, H, voiceGainDb, icons, musicIdx, brolls, matteIdx, cutaways, aIdx, sync, scrIdx, scr, headMatteIdx, textIdx, wrap }));
  const name = path.basename(dir); // назва роботи: для формату 2 — без « Head»
  const out = preview ? path.join(dir, 'preview.mp4') : path.join(project, 'out', `${name}_reel.mp4`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const venc = preview ? ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28']
    : hasQsv() ? ['-c:v', 'h264_qsv', '-global_quality', '22', '-preset', 'slow']
    : ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20'];
  console.log(`рендер ${W}x${H}, ${(wrap?.total ?? total).toFixed(1)} с (ролик ${total.toFixed(1)} с), ${venc[1]}…`);
  run(ffmpeg(), ['-y', '-hide_banner', '-v', 'error', '-stats', ...inputs, '-/filter_complex', 'graph.txt',
    '-map', '[vout]', '-map', '[aout]', ...venc, '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart', out], { cwd: dir, stdio: ['ignore', 'inherit', 'pipe'] });

  if (preview) {
    // тестові кадри: титул, плашки, іконки + рівномірно по таймлайну
    const off = introDur;
    const times0 = [...brolls.map((b) => Math.min(b.t + 0.8, total - 0.1)), ...cutaways.map((c) => c.t + c.dur / 2), Math.min(1, total / 2), ...(edit.callouts ?? []).map((c) => mapTime(segs, c.at)).filter((t) => t != null).map((t) => t + 0.6),
      ...icons.map((i) => i.t + 0.5), ...hits.map((t) => t + 0.1), ...[0.3, 0.55, 0.8].map((p) => p * total)].slice(0, 12);
    const times = [...(introDur ? [SLAM + 0.8] : []), ...times0.map((t) => t + off), ...(outroDur ? [off + total + 3] : [])];
    for (const f of fs.readdirSync(dir)) if (/^frame_\d+\.png$/.test(f)) fs.rmSync(path.join(dir, f));
    times.forEach((t, i) => run(ffmpeg(), ['-y', '-v', 'error', '-ss', t.toFixed(2), '-i', out, '-frames:v', '1', path.join(dir, `frame_${String(i).padStart(2, '0')}.png`)]));
    console.log('кадри:', times.map((t) => t.toFixed(1)).join(', '));
  } else {
    masterAudio(out);
    const e = run(ffmpeg(), ['-hide_banner', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr;
    const I = e.match(/I:\s+(-?[\d.]+) LUFS(?![\s\S]*I:\s)/)?.[1], P = e.match(/Peak:\s+(-?[\d.]+) dBFS(?![\s\S]*Peak:)/)?.[1];
    console.log(`готово: ${out}\nгучність ${I} LUFS, true peak ${P} dBFS`);
  }
}

// фінальна гучність: два проходи loudnorm (−14 LUFS, TP −1.5), відео копіюється без перекодування
function masterAudio(file) {
  const target = 'I=-14:TP=-1.5:LRA=11';
  const e = run(ffmpeg(), ['-hide_banner', '-i', file, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']).stderr;
  const j = JSON.parse(e.slice(e.lastIndexOf('{'), e.lastIndexOf('}') + 1));
  const tmp = file.replace(/\.mp4$/, '.master.mp4');
  run(ffmpeg(), ['-y', '-v', 'error', '-i', file, '-c:v', 'copy', '-af',
    `loudnorm=${target}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`,
    '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', tmp]);
  fs.renameSync(tmp, file);
}

// ---------- selftest ----------
function selftest() {
  const segs = snapSegments([{ start: 1, end: 3 }, { start: 5, end: 6 }], 30);
  assert.equal(mapTime(segs, 2), 1);
  assert.equal(mapTime(segs, 5.5), 2.5);
  assert.equal(mapTime(segs, 4), null);
  const w = mapWords(segs, [{ s: 0.9, e: 1.4, w: 'а' }, { s: 3.5, e: 4, w: 'вирізано' }, { s: 5.8, e: 6.3, w: 'кінець' }]);
  assert.deepEqual(w.map((x) => [r2(x.s), r2(x.e), x.w]), [[0, 0.4, 'а']]); // середина 6.05 > кінця сегмента
  assert.equal(workDir(path.resolve('/videos/VID_1.mp4')), path.resolve('/videos/work/VID_1')); // work/ поруч із відео
  const rt = retime([['ab', 27.9, 27.9], ['abcd', 27.9, 27.9], ['xy', 27.99, 29.36], ['z', 29.8, 30]].map(([w, s, e]) => ({ w, s, e })), [{ s: 27, e: 28.2 }]);
  assert.deepEqual(rt.map((x) => r2(x.s)), [28.2, 28.49, 29.07, 29.8]);
  assert.equal(r2(rt[2].e), 29.36);
  const c = cropBox({ width: 1920, height: 1080 }, 0.5, 1);
  assert.deepEqual([c.w, c.h, c.x], [608, 1080, 656]);
  const g = buildGraph({ edit: {}, segs, src: { width: 1080, height: 1920 }, total: 3, W: 540, H: 960, brolls: [{ t: 1.5, idx: 1 }], matteIdx: 2 });
  assert.match(g, /\[1:v\]setpts=PTS-STARTPTS\+1\.500\/TB\[br0\]/);
  assert.match(g, /\[2:v\]scale=540:960,format=gray\[mt\];\n\[fg\]\[mt\]alphamerge\[person\];\n\[bg1\]\[person\]overlay/);
  const gc = buildGraph({ edit: { music: {} }, segs, src: { width: 1080, height: 1920 }, total: 3, W: 540, H: 960, musicIdx: 3,
    cutaways: [{ t: 1, dur: 1.5, width: 1280, height: 720, idx: 1, sfxIdx: 2, cropX: 0.6 }] });
  assert.match(gc, /\[1:v\]fps=30,scale=-2:1036,crop=540:960:x='\(iw-ow\)\*0\.6'/);
  assert.match(gc, /\[ve\]\[cw0\]overlay=eof_action=pass:format=auto\[cut0\];\n\[cut0\]fade=t=in/);
  assert.match(gc, /\[2:a\]adelay=delays=800:all=1/);
  assert.match(gc, /\[vo\]\[duck\]\[sfx0\]amix=inputs=3/);
  // синхронізація: b — шматок a, що починається з 123-го відліку
  const sig = Float32Array.from({ length: 2000 }, (_, i) => Math.sin(i * 0.37) * Math.sin(i * 0.011) + (i % 97 === 0 ? 3 : 0));
  assert.equal(xcorrLag(sig, sig.slice(123, 1500), -300, 300), 123);
  // спліт: зсуви у trim, екран з tpad, vstack, звук з окремого входу мікрофона
  const gs = buildGraph({ edit: { screen: 's.mp4' }, segs, src: { width: 1920, height: 1080 }, total: 3, W: 1080, H: 1920,
    aIdx: 1, scrIdx: 2, scr: { width: 1920, height: 1080 }, sync: { head: 22.1, screenOffset: 2.03 }, headMatteIdx: 3,
    textIdx: 4 });
  assert.match(gs, /^\[1:a\]asplit=2/);
  assert.match(gs, /\[2:v\]tpad=stop_mode=clone:stop_duration=30,split=2\[s0\]\[s1\]/);
  // голова: обличчя по центру, наближення 1.25 (по ~10% з боків), кроп 972×864 замість 1216×1080
  assert.match(gs, /\[v0\]trim=start=23\.100:end=25\.100,setpts=PTS-STARTPTS,crop=972:864:474:50,scale=1080:960/);
  assert.match(gs, /\[s0\]trim=start=3\.030:end=5\.030,setpts=PTS-STARTPTS,crop=1216:1080:352:0,scale=1080:960/);
  assert.match(gs, /concat=n=2:v=2:a=1\[vtop\]\[vhead\]\[ac\]/);
  assert.match(gs, /\[3:v\]fps=30,scale=1080:960,format=gray\[hm\];\n\[hs\]\[hm\]alphamerge\[hp\];\n\[hbl\]\[hp\]overlay/);
  assert.match(gs, /\[vtop\]\[hfx\]vstack\[vc\]/);
  assert.match(buildGraph({ edit: { screen: 's', seamLine: true }, segs, src: { width: 1920, height: 1080 }, total: 3, W: 1080, H: 1920,
    scrIdx: 1, scr: { width: 1920, height: 1080 } }), /\[vtop\]\[vhead\]vstack,drawbox=x=0:y=958:w=1080:h=4/);
  assert.match(gs, /\[4:v\]setpts=PTS-STARTPTS\[tx\];\n\[ve\]\[tx\]overlay=eof_action=pass:format=auto\[vt\]/);
  assert.match(gs, /\[a0\]atrim=start=1:end=3/);
  assert.deepEqual(focusBox({ width: 1920, height: 1080 }, [1500, 900, 800], 1.125), { w: 800, h: 712, x: 1120, y: 368 });
  assert.match(baseGraph({ edit: {}, segs, src: { width: 1080, height: 1920 }, W: 720, H: 1280 }), /concat=n=2:v=1:a=0,format=rgb24\[vb\]$/);
  // обгортка: інтро + ролик + end card, музика приглушується всім міксом, SFX з затримкою
  const gw = buildGraph({ edit: {}, segs, src: { width: 1080, height: 1920 }, total: 3, W: 540, H: 960, textIdx: 1,
    wrap: { total: 14, intro: { idx: 2, dur: 4 }, outro: { idx: 3, dur: 7 }, music: { idx: 4, volume: 0.3 }, sfx: [{ idx: 5, t: 0.95, vol: 0.7 }] } });
  assert.match(gw, /\[vo\]aresample=48000,aformat=channel_layouts=stereo\[amain\]/);
  assert.match(gw, /\[vin\]\[ain\]\[vmain\]\[amain\]\[vou\]\[aou\]concat=n=3:v=1:a=1\[vout\]\[acat\]/);
  assert.match(gw, /\[mraw\]\[akey\]sidechaincompress/);
  assert.match(gw, /\[5:a\].*adelay=delays=950:all=1,volume=0\.7\[wx0\]/);
  assert.match(gw, /\[acv\]\[mduck\]\[wx0\]amix=inputs=3/);
  return import('../motion/layout.ts').then(({ wrap, fitSize, paginate, capText }) => {
    const m = (t, size) => t.length * size * 0.5; // моноширинна модель: символ = 0.5 × розмір
    assert.deepEqual(wrap(['aaaa', 'bb', 'cccc'], 10, 50, m), [[0, 1], [2]]);
    // менше рядків краще; «ДЕНЬ 5» лишається в один рядок
    assert.equal(fitSize(['ДЕНЬ', '5'], [230, 180, 140], 912, 2, m).lines.length, 1);
    // два рядки балансуються: не «три слова + одне»
    const bal = fitSize(['aaaa', 'bbbb', 'cccc', 'dddd'], [100], 900, 2, m);
    assert.deepEqual(bal.lines, [[0, 1], [2, 3]]);
    assert.equal(capText('«привіт,'), 'привіт');
    assert.equal(capText('так?'), 'так?');
    const ws = 'Перше слово, друге слово третє. Нове речення тут'.split(' ').map((w, i) => ({ s: i * 0.4, e: i * 0.4 + 0.3, w }));
    const pages = paginate(ws, { maxW: 912, maxLines: 2, sizes: [86, 66] }, m);
    assert.deepEqual(pages.map((p) => p.words.map((x) => x.w).join(' ')), ['Перше слово', 'друге слово третє', 'Нове речення тут']);
    assert.ok(pages.every((p) => p.end <= (pages[pages.indexOf(p) + 1]?.start ?? Infinity)));
    console.log('selftest ok');
  });
}

const [cmd, arg, ...rest] = process.argv.slice(2);
const flag = (n) => { const i = rest.indexOf(n); return i >= 0 ? rest.splice(i, 2)[1] : undefined; };
if (cmd === 'prep' && arg) { const audio = flag('--audio'), screen = flag('--screen'); prep(arg, rest[0], { audio, screen }); }
else if (cmd === 'preview' && arg) await render(arg, true);
else if (cmd === 'render' && arg) await render(arg, false);
else if (cmd === 'selftest') await selftest();
else console.log('usage: node pipeline/vid.mjs prep <video> [lang] | preview <edit.json> | render <edit.json> | selftest');
