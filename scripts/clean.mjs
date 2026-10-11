// Прибирання після фіналу: у кожній out/<відео>/ з фінальним MP4 видаляє qa/, *-preview-*.mp4
// і не мастерований X.mp4, якщо поряд є X-14lufs.mp4. stills/, .srt, _обране/ не чіпає.
// Потім друкує звіт асетів бібліотеки, на які не посилається жоден файл у src/ (нічого не видаляє).
// usage: npm run clean   (render-timed.mjs final і master-audio.mjs викликають сам)
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
for (const e of fs.readdirSync(OUT, {withFileTypes: true})) {
	if (!e.isDirectory() || e.name.startsWith('_')) continue;
	const dir = path.join(OUT, e.name);
	const mp4 = fs.readdirSync(dir).filter((f) => f.endsWith('.mp4'));
	if (!mp4.some((f) => !f.includes('-preview-'))) continue; // фіналу ще немає — qa і прев'ю потрібні
	// не мастерований X.mp4 — сміття лише якщо X-14lufs.mp4 НОВІШИЙ за нього; інакше це свіжий перерендер,
	// який ще чекає на master-audio (раніше clean його видаляв, і перерендер поверх старого фіналу тихо губився)
	const mtime = (f) => fs.statSync(path.join(dir, f)).mtimeMs;
	const mastered = (f) => { const m = f.replace(/\.mp4$/, '-14lufs.mp4'); return m !== f && mp4.includes(m) && mtime(m) >= mtime(f); };
	const junk = mp4.filter((f) => f.includes('-preview-') || mastered(f));
	if (fs.existsSync(path.join(dir, 'qa'))) junk.push('qa');
	for (const f of junk) fs.rmSync(path.join(dir, f), {recursive: true, force: true});
	if (junk.length) console.log(`${dir}: видалено ${junk.join(', ')}`);
}

const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, {withFileTypes: true}).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const code = walk('src').map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const media = /\.(mp3|wav|mp4|png|jpe?g|webm|mov)$/i;
const assets = [...walk('public/assets'), ...walk('public/ideas').filter((f) => /[\\/](stock|music|sfx|shots)[\\/]/.test(f))];
const unused = assets.filter((f) => media.test(f) && !code.includes(path.basename(f)));
if (unused.length) {
	console.log('\nНевикористані асети (вирішуй сам: лишити в бібліотеці чи видалити):');
	for (const f of unused) console.log(`  ${(fs.statSync(f).size / 1024).toFixed(0).padStart(6)} КБ  ${f}`);
}

await import('./out-index.mjs');
