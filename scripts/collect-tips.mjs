#!/usr/bin/env node
// «Секретні коди» (src/tips) в одну папку: out/_корисності/NN - Назва.mp4 + обкладинки (кадр 0),
// набір-кодів.md (усі коди з повними промптами — його шлемо в Direct тим, хто написав слово) і опис-NN.txt для посту.
//   node scripts/collect-tips.mjs
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TIPS = JSON.parse(fs.readFileSync('data/tips.json', 'utf8'));
const DEST = 'out/_корисності';
fs.mkdirSync(path.join(DEST, 'обкладинки'), {recursive: true});
const name = (v) => `${v.id} - ${v.title.join(' ')}`.replace(/[:/\\?*"<>|]/g, '').replace(/\s+/g, ' ');

const missing = [];
for (const v of TIPS.videos) {
	const from = `out/tips-${v.id}/tips-${v.id}-1080x1920-14lufs.mp4`;
	if (!fs.existsSync(from)) { missing.push(v.id); continue; }
	fs.copyFileSync(from, path.join(DEST, `${name(v)}.mp4`));
	spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', from, '-frames:v', '1', '-q:v', '2', path.join(DEST, 'обкладинки', `${v.id}.jpg`)]);
	const post = [
		`${v.title.join(' ')} 🔐`, '',
		...v.items.map((it, i) => `${i + 1}. ${it.code} — ${it.what}`), '',
		`Напиши «${TIPS.cta}» у коментарях — пришлю набір секретних кодів з готовими промптами в Direct.`,
		'Збережи, щоб не загубити ✦', '',
		'#chatgpt #claude #ai #промпти #нейромережі #devguide',
	].join('\n');
	fs.writeFileSync(path.join(DEST, `опис-${v.id}.txt`), post + '\n');
	console.log(`✓ ${name(v)}`);
}

const pack = [
	'# Набір секретних кодів DevGuide', '',
	'Це фрази-промпти: скопіюй, підстав своє замість [дужок] і надішли в ChatGPT, Claude чи будь-який інший AI-чат.', '',
	...TIPS.videos.flatMap((v) => [
		`## ${v.title.join(' ')}`, '',
		...v.items.flatMap((it) => [`**${it.code}** — ${it.what}`, `> ${it.prompt}`, '']),
		...(v.look === 'combo' ? ['**Усе разом:**', `> ${v.items.map((it) => it.prompt).join(' ')}`, ''] : []),
	]),
	'---', 'DevGuide · devguide.com.ua',
].join('\n');
fs.writeFileSync(path.join(DEST, 'набір-кодів.md'), pack + '\n');
console.log(`✓ набір-кодів.md`);
if (missing.length) console.log(`\nЩе немає фіналів: ${missing.join(', ')}`);
