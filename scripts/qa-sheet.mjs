// Contact sheet for visual QA: node scripts/qa-sheet.mjs <video.mp4> <out.png> <frame,frame,...> [cols]
// Frames are exact frame indices; tiles keep the video's aspect (270 px wide vertical, 480 px wide horizontal), row-major ascending.
import {spawnSync} from 'node:child_process';
const [video, out, list, colsArg] = process.argv.slice(2);
if (!video || !out || !list) throw Error('usage: qa-sheet.mjs <video> <out.png> <f1,f2,...> [cols]');
const frames = list.split(',').map(Number).sort((a, b) => a - b);
const cols = Number(colsArg || 7);
const rows = Math.ceil(frames.length / cols);
const sel = frames.map((n) => `eq(n\\,${n})`).join('+');
const vf = `select='${sel}',scale='if(gt(iw,ih),480,270)':-2,tile=${cols}x${rows}`;
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-vf', vf, '-fps_mode', 'passthrough', '-frames:v', '1', out], {stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`${out}: ${cols}x${rows}, frames: ${frames.join(', ')}`);
