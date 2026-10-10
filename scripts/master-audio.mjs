// Two-pass EBU R128 loudnorm of the audio track to -14 LUFS / -1.5 dBTP (social platforms); video stream is copied.
// usage: node scripts/master-audio.mjs <in.mp4>   -> writes <in>-14lufs.mp4 next to it
import {spawnSync} from 'node:child_process';
const input = process.argv[2];
if (!input) throw Error('usage: master-audio.mjs <in.mp4>');
const target = 'I=-14:TP=-1.5:LRA=11';
const pass1 = spawnSync('ffmpeg', ['-hide_banner', '-i', input, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8'});
const json = JSON.parse(pass1.stderr.slice(pass1.stderr.lastIndexOf('{'), pass1.stderr.lastIndexOf('}') + 1));
const m = `measured_I=${json.input_i}:measured_TP=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}:offset=${json.target_offset}:linear=true`;
const out = input.replace(/\.mp4$/, '-14lufs.mp4');
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-c:v', 'copy', '-af', `loudnorm=${target}:${m}`, '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out], {stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`input ${json.input_i} LUFS / ${json.input_tp} dBTP -> ${out}`);
if (input.startsWith('out')) await import('./clean.mjs'); // не мастерований дубль більше не потрібен
