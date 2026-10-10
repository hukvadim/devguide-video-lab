// Contact sheet for visual QA: node scripts/qa-sheet.mjs <video.mp4> <out.png> <frame,frame,...> [cols]
// Frames are exact frame indices; tiles are 270x480, row-major in the order given (ascending).
import {spawnSync} from 'node:child_process';
const [video, out, list, colsArg] = process.argv.slice(2);
if (!video || !out || !list) throw Error('usage: qa-sheet.mjs <video> <out.png> <f1,f2,...> [cols]');
const frames = list.split(',').map(Number).sort((a, b) => a - b);
const cols = Number(colsArg || 7);
const rows = Math.ceil(frames.length / cols);
const sel = frames.map((n) => `eq(n\\,${n})`).join('+');
const vf = `select='${sel}',scale=270:480,tile=${cols}x${rows}`;
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-vf', vf, '-fps_mode', 'passthrough', '-frames:v', '1', out], {stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`${out}: ${cols}x${rows}, frames: ${frames.join(', ')}`);
