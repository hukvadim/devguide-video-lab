#!/usr/bin/env node
// Лабораторія форматів, тип 1 (варіанти 01–07): edit.json для скіла devguide-reel з базових монтажів
// «День 5» (5/epic/work/day5-epic) і Finish (Сирий матеріал/work/Finish). Копіює файли аналізу й кеш маски,
// щоб скіл не рахував їх заново. Див. docs/FORMAT_LAB.md.
//   node scripts/lab-split.mjs            → пише work/lab-0N/edit.json
//   node scripts/lab-split.mjs --render   → ще й рендерить кожен (vid.mjs render) у <проєкт>/out/lab-0N_reel.mp4
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BEATS = JSON.parse(fs.readFileSync('public/assets/music/_кандидати/beats.json', 'utf8'));
const DAY5 = '5/epic', FIN = 'Сирий матеріал';
const base = (p) => JSON.parse(fs.readFileSync(path.join(p, 'edit.json'), 'utf8'));
const day5 = base(`${DAY5}/work/day5-epic`), fin = base(`${FIN}/work/Finish`);
// трек з кандидатів; drop — секунда треку на удар інтро (або старт без інтро): перший біт + 8 тактів
const music = (project, file, volume, bars = 8) => ({file: path.relative(project, `public/assets/music/_кандидати/${file}`).replaceAll('\\', '/'),
	drop: +(BEATS[file].offset + (bars * 4 * 60) / BEATS[file].bpm).toFixed(3), volume});
// UGC з Flow: найкращий шматок кліпу (як UGC у src/system/ugc.tsx); шляхи відносно проєкту «Сирий матеріал»
const UGC_FROM = {Stop: 1.8, facepalm: 1.4, 'point-up': 2.6, smile: 5.0, typing: 0.3, wow: 1.8};
const ugc = (file, at, dur) => ({at, dur, file: `../public/assets/ugc/flow/${file}.mp4`, from: UGC_FROM[file], cropX: 0.5});
const sfx = (file) => `../public/assets/audio/_кандидати/${file}`;
const pick = (segs, ranges) => ranges.flatMap(([a, b]) => segs.filter((s) => s.start >= a - 0.05 && s.end <= b + 0.05));

const V = {
	'lab-01': [DAY5, {...day5, theme: {accent: '#C3FF55'},
		intro: {kicker: 'DevGuide · практика', big: 'ДЕНЬ 5', sub: 'Відео, сайт і гра —\n*з нейромережею*', dur: 4},
		music: music(DAY5, '14-edm-i-do.mp3', 0.3), hits: [{at: 52.95}]}],
	'lab-02': [DAY5, {...day5, theme: {accent: '#39D6CE', bg: '#6E10F7'}, captions: {...day5.captions, accent: '#39D6CE'},
		intro: {kicker: 'DevGuide · практика', big: 'ГОДИНА', sub: 'відео, сайт і гра —\n*з нейромережею*', dur: 4},
		music: music(DAY5, '04-trap-need-for-speed.mp3', 0.32), hits: [{at: 13.5}, {at: 32.0}, {at: 52.95}]}],
	'lab-03': [DAY5, {...day5, theme: {accent: '#00D4FF', bg: '#150722'}, captions: {...day5.captions, accent: '#00D4FF'},
		segments: pick(day5.segments, [[52.95, 62.12], [2.52, 9.3], [12.1, 20.7], [31.68, 41.62]]), // результат першим
		title: {text: 'Це щось *неймовірне*', dur: 2.4}, callouts: day5.callouts.filter((c) => c.at !== 55.0),
		music: music(DAY5, '11-house-deep-urban.mp3', 0.28, 4)}],
	'lab-04': [DAY5, {...day5, theme: {accent: '#D9FF3A', bg: '#11121C'}, captions: {...day5.captions, accent: '#D9FF3A'},
		callouts: [], music: music(DAY5, '27-lofi-night-sky-hip-hop.mp3', 0.18, 0)}],
	// 05–07: голова + UGC-вставки з Google Flow (public/assets/ugc/flow) — кліп на весь екран 2–3 с, звук кліпу не береться
	'lab-05': [FIN, {...fin, theme: {accent: '#39D6CE', bg: '#6E10F7'}, captions: {...fin.captions, accent: '#39D6CE'},
		cutaways: [ugc('typing', 8.0, 2.6), ugc('smile', 17.6, 2.4), ugc('wow', 25.0, 2.4), ugc('point-up', 37.9, 2.8)],
		whoosh: sfx('02-whoosh-cinematic-whoosh-fast-transition.mp3'), music: music(FIN, '41-synthwave-solitude.mp3', 0.16, 0),
		outro: {cta: 'Напиши мені в Telegram', url: 't.me/hukvadim', tagline: 'Почнемо зі знайомства —\n*30 хвилин*'}}],
	'lab-06': [FIN, {...fin, theme: {accent: '#D9FF3A', bg: '#11121C'}, captions: {...fin.captions, accent: '#D9FF3A'},
		broll: [{at: 6.0, dur: 3.2, layout: 'fan', images: ['06.jpg', '07.jpg', '11.jpg']}],
		cutaways: [ugc('wow', 25.0, 2.4), ugc('point-up', 37.9, 2.8)], hits: [{at: 15.0}],
		whoosh: sfx('12-glitch-small-electric-glitch.mp3'), music: music(FIN, '15-house-house-02.mp3', 0.16, 0), outro: false}],
	'lab-07': [FIN, {...fin, theme: {accent: '#00D4FF', bg: '#150722'}, captions: {...fin.captions, accent: '#00D4FF'},
		segments: [{start: 0, end: 3.74, zoom: 1}, {start: 12.78, end: 20.6, zoom: 1.1}, {start: 41.66, end: 44.2, zoom: 1.15}],
		title: {text: 'Нейромережі — *для твоїх задач*', dur: 2.4}, callouts: fin.callouts.filter((c) => [12.8, 15.6, 41.7].includes(c.at)),
		cutaways: [ugc('smile', 16.6, 2.2)], whoosh: sfx('07-whoosh-magic-sparkle-whoosh.mp3'),
		intro: {kicker: 'DevGuide', big: 'ШІ', sub: 'для *твоїх* задач', dur: 3}, music: music(FIN, '09-trap-never-going-broke.mp3', 0.3),
		outro: {cta: 'Напиши в Telegram', url: 't.me/hukvadim', tagline: 'Знайомство —\n*30 хвилин*'}}],
};

// картки за спиною (06) беруть обкладинки з assets/covers/ проєкту
fs.mkdirSync(`${FIN}/assets/covers`, {recursive: true});
for (const f of ['06', '07', '11', '01', '09', '13']) fs.copyFileSync(`public/lab/covers/${f}.jpg`, `${FIN}/assets/covers/${f}.jpg`);

for (const [name, [project, edit]] of Object.entries(V)) {
	const src = project === DAY5 ? `${DAY5}/work/day5-epic` : `${FIN}/work/Finish`;
	const dir = `${project}/work/${name}`;
	fs.mkdirSync(dir, {recursive: true});
	for (const f of fs.readdirSync(src)) if (/^(probe|transcript|silences|sync|whisper)\.json$|^audio16k\.wav$|^headmatte_.*\.mkv$/.test(f) && !fs.existsSync(path.join(dir, f))) fs.copyFileSync(path.join(src, f), path.join(dir, f));
	fs.writeFileSync(path.join(dir, 'edit.json'), JSON.stringify(edit, null, 2));
	console.log(`✓ ${dir}/edit.json (${edit.segments.length} склейок)`);
	if (process.argv.includes('--render')) {
		const r = spawnSync(process.execPath, ['.claude/skills/devguide-reel/scripts/vid.mjs', 'render', path.join(dir, 'edit.json')], {stdio: 'inherit'});
		if (r.status !== 0) console.error(`✗ ${name}: vid.mjs ${r.status}`);
	}
}
