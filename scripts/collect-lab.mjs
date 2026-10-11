#!/usr/bin/env node
// 20 варіантів лабораторії форматів в одну папку: out/_варіанти/NN Тип - Назва.mp4 (docs/FORMAT_LAB.md)
//   node scripts/collect-lab.mjs
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SPLIT = (n) => (n <= 4 ? `5/epic/out/lab-0${n}_reel.mp4` : `Сирий матеріал/out/lab-0${n}_reel.mp4`);
const LAB = (n) => `out/lab-${String(n).padStart(2, '0')}/lab-${String(n).padStart(2, '0')}-1080x1920-14lufs.mp4`;
const LIST = [
	[1, 'Спліт', 'День 5 - класика', SPLIT], [2, 'Спліт', 'День 5 - фіолет, trap', SPLIT], [3, 'Спліт', 'День 5 - результат першим, неон', SPLIT],
	[4, 'Спліт', 'День 5 - тихий lo-fi', SPLIT], [5, 'Голова', 'Finish - фіолет, UGC-вставки', SPLIT], [6, 'Голова', 'Finish - лайм, картки й UGC', SPLIT],
	[7, 'Голова', 'Finish - тизер неон, UGC', SPLIT],
	[8, 'Голос', 'AI зламав - неон', LAB], [9, 'Голос', 'Git - світлий', LAB], [10, 'Голос', 'Безпечно з AI - кінетика', LAB],
	[11, 'Голос', 'Claude Code - постер', LAB], [12, 'Голос', 'Не бійся AI - неон караоке', LAB], [13, 'Голос', 'Skills і MCP - щільний звук', LAB],
	[14, 'Голос', 'Ціль - голос Anton', LAB],
	[15, 'Без голосу', '5 промптів для старту', LAB], [16, 'Без голосу', '4 правила безпеки', LAB], [17, 'Без голосу', 'Шлях Claude за 15 кроків', LAB],
	[18, 'Без голосу', 'DEVGUIDE DROP', LAB], [19, 'Без голосу', 'Shift+Tab луп', LAB], [20, 'Без голосу', 'Спершу план, потім код', LAB],
	[21, 'UGC', 'AI зламав - facepalm і стоп', LAB], [22, 'UGC', 'Встанови Claude Code - палець, друк, вау', LAB], [23, 'UGC', 'Спершу план - facepalm, стоп, усмішка', LAB],
	[24, 'UGC', '4 правила безпеки - без голосу', LAB], [25, 'UGC', 'Перший проєкт - вау першим', LAB],
];
const DEST = 'out/_варіанти';
fs.mkdirSync(path.join(DEST, 'обкладинки'), {recursive: true});
// старі назви тих самих номерів прибираємо, щоб у папці не було двох «05»
const names = new Set(LIST.map(([n, type, title]) => `${String(n).padStart(2, '0')} ${type} - ${title}.mp4`));
for (const f of fs.readdirSync(DEST)) if (f.endsWith('.mp4') && !names.has(f)) fs.rmSync(path.join(DEST, f));
const missing = [];
for (const [n, type, title, src] of LIST) {
	const from = src(n);
	const name = `${String(n).padStart(2, '0')} ${type} - ${title}.mp4`;
	if (!fs.existsSync(from)) { missing.push(name); continue; }
	fs.copyFileSync(from, path.join(DEST, name));
	// обкладинка для Instagram = кадр 0 (у роликах лабораторії це вже проявлена заставка)
	spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', from, '-frames:v', '1', '-q:v', '2', path.join(DEST, 'обкладинки', name.replace(/.mp4$/, '.jpg'))]);
	console.log(`✓ ${name}`);
}
if (missing.length) console.log(`\nЩе немає: ${missing.join(', ')}`);
