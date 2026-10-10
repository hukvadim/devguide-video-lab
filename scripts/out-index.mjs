// Галерея рендерів: out/index.html — кожна папка out/<відео>/ окремим блоком, нові зверху,
// _обране першим, _sandbox останнім; плюс готові ролики з папок днів (5/, 6/ …, без work/).
// usage: node scripts/out-index.mjs   (render-timed.mjs викликає сам)
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
const media = (dir, deep) => fs.existsSync(dir) ? fs.readdirSync(dir, {withFileTypes: true}).flatMap((e) => {
	const p = path.join(dir, e.name);
	if (e.isDirectory()) return deep && !['work', 'qa'].includes(e.name) ? media(p, deep) : [];
	return /\.(mp4|png)$/i.test(e.name) ? [{p, st: fs.statSync(p)}] : [];
}) : [];

const groups = [];
for (const e of fs.readdirSync(OUT, {withFileTypes: true}).filter((x) => x.isDirectory())) {
	const files = [...media(path.join(OUT, e.name), false), ...media(path.join(OUT, e.name, 'stills'), false)];
	const qa = fs.existsSync(path.join(OUT, e.name, 'qa'));
	if (files.length || qa) groups.push({name: e.name, files, qa});
}
// у папці дня корінь — сирі записи, тож беремо лише підпапки (epic/, out/ …)
for (const day of fs.readdirSync('.').filter((d) => /^\d+$/.test(d))) {
	const subs = fs.readdirSync(day, {withFileTypes: true}).filter((e) => e.isDirectory() && e.name !== 'work');
	groups.push({name: `день ${day}`, files: subs.flatMap((e) => media(path.join(day, e.name), true)), qa: false});
}

const rank = (g) => g.name === '_обране' ? -1 : g.name === '_sandbox' ? 1 : 0;
const newest = (g) => Math.max(0, ...g.files.map((f) => f.st.mtimeMs));
groups.sort((a, b) => rank(a) - rank(b) || newest(b) - newest(a));

const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const url = (p) => path.relative(OUT, p).split(path.sep).map(encodeURIComponent).join('/');
const when = (st) => new Date(st.mtimeMs).toLocaleString('uk-UA', {dateStyle: 'short', timeStyle: 'short'});
const card = ({p, st}) => {
	const name = esc(path.basename(p)), meta = `${when(st)} · ${(st.size / 1048576).toFixed(1)} МБ`;
	const tag = p.endsWith('.mp4') ? `<video src="${url(p)}" controls preload="metadata"></video>` : `<a href="${url(p)}"><img src="${url(p)}" loading="lazy"></a>`;
	return `<figure>${tag}<figcaption>${name}<br><small>${meta}</small></figcaption></figure>`;
};
const html = `<!doctype html><meta charset="utf-8"><title>DevGuide · рендери</title>
<style>body{margin:0;padding:24px;background:#080B0E;color:#F5F7F2;font:15px system-ui}h2{color:#C3FF55;margin:32px 0 8px}
.g{display:flex;flex-wrap:wrap;gap:16px}figure{margin:0;width:220px}video,img{width:220px;aspect-ratio:9/16;object-fit:contain;background:#10161C;border-radius:8px}
figcaption{font-size:12px;word-break:break-all;margin-top:4px}small,.qa{color:#AEB8C1}</style>
<h1>DevGuide · рендери</h1><p class="qa">Сподобалось → скопіюй файл у <b>out/_обране/</b>. Оновити сторінку: <code>npm run out:index</code>.</p>
${groups.map((g) => `<h2>${esc(g.name)}</h2>${g.qa ? `<p class="qa">кадри перевірки: out/${esc(g.name)}/qa/</p>` : ''}<div class="g">${
	g.files.sort((a, b) => b.st.mtimeMs - a.st.mtimeMs).map(card).join('')}</div>`).join('\n')}`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log(`out/index.html: ${groups.length} папок`);
