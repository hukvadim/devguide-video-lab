// Alternate two renders of the SAME edit (identical segments): "head" (face full frame) and "split" (screen + face).
//   node splice.mjs <head.mp4> <split.mp4> <out.mp4> <t1> [t2 ...] [--transition wipeup] [--dur 0.35] [--overlay cards.mov] [--pop 1.6,32.5]
// --overlay: transparent layer (Remotion Cards, ProRes 4444) on top of everything; --pop: soft «pop» when a card appears.
// Starts on head, switches at every t (seconds of the rendered reel): head → split → head …
// Audio stays from the head render (identical in both), plus a soft whoosh on every switch. Timing is preserved:
// each xfade starts at t and the incoming stream is trimmed at t, so lips and captions stay in sync.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const transition = opt('--transition', 'wipeup');
const dur = Number(opt('--dur', '0.35'));
const overlay = opt('--overlay', null);
const pops = (opt('--pop', '') || '').split(',').filter(Boolean).map(Number);
const pop = path.join(SKILL, 'media', 'sparkle-touch.mp3');
const [head, split, out, ...ts] = args;
if (!head || !split || !out || !ts.length) { console.error('usage: splice.mjs <head.mp4> <split.mp4> <out.mp4> <t1> [t2 ...]'); process.exit(1); }
const times = ts.map(Number).sort((a, b) => a - b);
const whoosh = [path.join(SKILL, 'media', 'whoosh-fast.mp3'), path.join(SKILL, 'tools', 'sfx', 'whoosh.mp3')].find((f) => fs.existsSync(f));

const f = [];
let last = '[0:v]';
times.forEach((t, i) => {
  const src = i % 2 === 0 ? 1 : 0; // switch to split, back to head, …
  f.push(`[${src}:v]trim=start=${t},setpts=PTS-STARTPTS[in${i}]`);
  f.push(`${last}[in${i}]xfade=transition=${transition}:duration=${dur}:offset=${t}[v${i}]`);
  last = `[v${i}]`;
});
const inputs = ['-i', head, '-i', split];
const mix = [];
if (whoosh) {
  const k = inputs.push('-i', whoosh) / 2 - 1;
  times.forEach((t, i) => { f.push(`[${k}:a]adelay=${Math.max(0, Math.round((t - 0.15) * 1000))}:all=1,volume=0.35[w${i}]`); mix.push(`[w${i}]`); });
}
if (pops.length && fs.existsSync(pop)) {
  const k = inputs.push('-i', pop) / 2 - 1;
  f.push(`[${k}:a]asplit=${pops.length}${pops.map((_, i) => `[ps${i}]`).join('')}`);
  pops.forEach((t, i) => { f.push(`[ps${i}]adelay=${Math.max(0, Math.round(t * 1000))}:all=1,volume=0.15[p${i}]`); mix.push(`[p${i}]`); });
}
f.push(mix.length ? `[0:a]${mix.join('')}amix=inputs=${mix.length + 1}:normalize=0:duration=first[a]` : '[0:a]anull[a]');
if (overlay) {
  const k = inputs.push('-i', overlay) / 2 - 1;
  f.push(`${last}[${k}:v]overlay=0:0:format=auto:eof_action=pass[vo]`);
  last = '[vo]';
}

const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', f.join(';'), '-map', last, '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log('spliced', out, 'switches at', times.join(', '));
