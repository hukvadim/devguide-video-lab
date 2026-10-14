// Велике 16:9-відео шляху «Сайти»: склеює готові частини out/sites-NN-wide/*-14lufs.mp4 без перерендеру (ffmpeg concat, -c copy)
// і пише розділи для опису YouTube. Змінив крок → render-timed final Sites-NN-Wide --wh=1920x1080 → master-audio → цей скрипт.
// usage: node scripts/join-sites-wide.mjs   → out/sites-full/sites-full-1920x1080.mp4 + chapters.txt
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import SITES from '../data/learning-websites.json' with {type: 'json'};

const STEPS = ['01', '02', '03', '04', '05', '06', '07', '09', '10', '11', '12', '13', '14', '15', '16', '20', '21', '22'];
const dir = 'out/sites-full';
mkdirSync(dir, {recursive: true});
const parts = STEPS.map((n) => `out/sites-${n}-wide/sites-${n}-wide-1920x1080-14lufs.mp4`);
const missing = parts.filter((f) => !existsSync(f));
if (missing.length) { console.error('Немає частин:\n' + missing.join('\n')); process.exit(1); }

const dur = (f) => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], {encoding: 'utf8'}).stdout.trim());
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
let t = 0;
const chapters = STEPS.map((n, i) => { const line = `${mmss(t)} Крок ${Number(n)} · ${SITES.steps[Number(n) - 1].title}`; t += dur(parts[i]); return line; });

writeFileSync(`${dir}/list.txt`, parts.map((f) => `file '../../${f}'`).join('\n'));
const out = `${dir}/sites-full-1920x1080.mp4`;
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-c', 'copy', '-movflags', '+faststart', out], {stdio: 'inherit'});
if (r.status) process.exit(r.status);
writeFileSync(`${dir}/chapters.txt`, chapters.join('\n') + '\n');
console.log(`${out}  ${mmss(t)}\n` + chapters.join('\n'));
