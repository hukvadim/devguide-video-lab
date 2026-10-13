#!/usr/bin/env node
// Кандидати музики з Mixkit (Mixkit License, безкоштовно, комерційно) → public/assets/music/NN-жанр-назва.mp3
// + CATALOG.md (походження) + out/_музика/index.html (переслухати підряд). Уже скачані файли пропускає.
//   node scripts/fetch-music.mjs
import fs from 'node:fs';
import path from 'node:path';

// [id, назва, автор, жанр-група, жанр Mixkit, тривалість] — популярні на сторінках жанрів mixkit.co, 2026-10-11
const TRACKS = [
	['400', 'C.B.P.D', 'Arulo', 'trap', 'Trap Sensual', '1:39'], ['262', 'Praise the Lord', 'Arulo', 'trap', 'Trap', '1:39'],
	['281', 'Complicated', 'Arulo', 'trap', 'Trap Serious', '1:49'], ['369', 'Need for speed', 'Arulo', 'trap', 'Trap Serious', '1:38'],
	['403', 'G Eazy NBA type', 'Arulo', 'trap', 'Trap', '1:44'], ['318', 'Thunder', 'Arulo', 'trap', 'Trap', '1:41'],
	['357', 'Head Bang', 'Arulo', 'trap', 'Trap', '1:37'], ['420', 'Acid Party', 'Arulo', 'trap', 'Trap', '1:41'],
	['301', 'Never Going Broke', 'Arulo', 'trap', 'Trap Serious', '2:13'], ['738', 'Hip Hop 02', 'Lily J', 'hiphop', 'Contemporary R&B', '1:55'],
	['623', 'Deep Urban', 'Eugenio Mininni', 'house', 'Tech House', '4:49'], ['471', 'Rising Forest', 'Diego Nava', 'edm', 'EDM', '1:39'],
	['474', 'What About Action', 'Diego Nava', 'dance', 'Dance-Pop', '1:57'], ['1001', 'I Do', 'Michael Ramir C.', 'edm', 'EDM Uplifting', '2:08'],
	['744', 'House 02', 'Lily J', 'house', 'Deep House', '1:53'], ['124', 'Techno Fest Vibes', 'Alejandro Magaña', 'edm', 'EDM Powerful', '2:14'],
	['113', 'House Fest', 'Alejandro Magaña', 'house', 'EDM Powerful', '2:16'], ['199', 'Loner', 'Arulo', 'edm', 'EDM Powerful', '1:45'],
	['1222', 'Flopper', 'Michael Ramir C.', 'dubstep', 'Dubstep / EDM Powerful', '1:53'], ['942', 'Be Happy', 'Michael Ramir C.', 'edm', 'EDM Positive', '1:37'],
	['282', 'Sweet September', 'Arulo', 'lofi', 'Lo-Fi / Chillout', '1:39'], ['135', 'Sleepy Cat', 'Alejandro Magaña', 'lofi', 'Lo-Fi / Downtempo', '1:59'],
	['175', 'Digital Clouds', 'Alejandro Magaña', 'chill', 'Chillout / Electronic', '1:41'], ['988', 'Day Dreamin with U', 'Michael Ramir C.', 'chill', 'Downtempo', '1:58'],
	['234', 'Thinking About You', 'Arulo', 'chill', 'Lounge', '1:58'], ['699', 'Pop 07', 'Grigoriy Nuzhny', 'chill', 'Chillout / Hip Hop', '2:11'],
	['970', 'Night Sky Hip Hop', 'Michael Ramir C.', 'lofi', 'Hip Hop Relaxed', '4:17'], ['1210', 'Cant Get You Off My Mind', 'Michael Ramir C.', 'futurebass', 'Future Bass', '1:31'],
	['614', 'Silent Descent', 'Eugenio Mininni', 'cinematic', 'Film Score', '2:40'], ['676', 'Epical Drums 01', 'Grigoriy Nuzhny', 'epic', 'Sound Elements', '1:46'],
	['680', 'Epical Drums 05', 'Grigoriy Nuzhny', 'epic', 'Orchestral Hybrid', '1:42'], ['677', 'Epical Drums 02', 'Grigoriy Nuzhny', 'epic', 'Percussion Trailer', '2:03'],
	['322', 'Lifes a Movie', 'Arulo', 'cinematic', 'Film Score', '2:01'], ['140', 'Cyberpunk City', 'Alejandro Magaña', 'cinematic', 'Ambient', '1:40'],
	['464', 'Sci-Fi Score', 'Arulo', 'cinematic', 'Electronic', '1:37'], ['134', 'Deep Techno Ambience', 'Alejandro Magaña', 'cinematic', 'Techno', '2:03'],
	['173', 'Better Times are Coming', 'Alejandro Magaña', 'synthwave', 'Synthwave', '1:40'], ['131', 'Sun in Your Eyes', 'Alejandro Magaña', 'synthwave', 'Electropop', '1:46'],
	['159', 'Lonerism', 'Alejandro Magaña', 'synthwave', 'Synthwave', '1:45'], ['555', 'South Waves', 'Eugenio Mininni', 'synthwave', 'Electropop', '3:04'],
	['179', 'Solitude', 'Alejandro Magaña', 'synthwave', 'Synthpop', '2:42'], ['549', 'Bang Johann Up', 'Eugenio Mininni', 'synthwave', 'Synthpop', '2:46'],
	['1182', 'Its Now or Never', 'Michael Ramir C.', 'synthwave', 'Synthpop', '2:06'],
	['288', 'One More Dance', 'Arulo', 'pop', 'Dance-Pop', '1:40'], ['200', 'Oh Lord', 'Arulo', 'pop', 'Dance-Pop', '2:23'],
	['837', 'Life is a Dream', 'Michael Ramir C.', 'pop', 'Disco', '1:39'], ['935', 'Disco Aint Old School', 'Michael Ramir C.', 'pop', 'Disco', '1:38'],
	['1147', 'Midnight Funk', 'Michael Ramir C.', 'funk', 'Funk', '1:47'], ['1167', 'Close Up', 'Michael Ramir C.', 'pop', 'Corporate Music', '1:35'],
	['729', 'Pop Track 03', 'Lily J', 'pop', 'Electronic', '1:37'],
];
const DIR = 'public/assets/music';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const file = ([id, t, , g], i) => `${String(i + 1).padStart(2, '0')}-${g}-${slug(t)}.mp3`;

fs.mkdirSync(DIR, {recursive: true});
for (const [i, tr] of TRACKS.entries()) {
	const dest = path.join(DIR, file(tr, i));
	if (fs.existsSync(dest)) continue;
	const res = await fetch(`https://assets.mixkit.co/music/${tr[0]}/${tr[0]}.mp3`);
	if (!res.ok) { console.error(`✗ ${tr[0]} ${tr[1]}: HTTP ${res.status}`); continue; }
	fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
	console.log(`✓ ${file(tr, i)}`);
	await new Promise((r) => setTimeout(r, 400)); // ponytail: ввічлива пауза між запитами до CDN
}

const rows = TRACKS.map((tr, i) => `| ${i + 1} | ${tr[1]} | ${tr[2]} | ${tr[3]} | ${tr[4]} | ${tr[5]} | \`${file(tr, i)}\` | https://assets.mixkit.co/music/${tr[0]}/${tr[0]}.mp3 |`);
fs.writeFileSync('public/assets/music/CATALOG.md', `# Музика (Mixkit)

Завантажено 2026-10-11 скриптом \`scripts/fetch-music.mjs\`. Ліцензія: Mixkit License (безкоштовно, комерційне використання,
без атрибуції; сторінки жанрів mixkit.co: «All audio tracks are completely free … under the Mixkit License»).
Усі треки прийняті й лежать у \`public/assets/music/\` (mp3 не комітяться: на новому ПК \`node scripts/fetch-music.mjs\`).
Не сподобався трек після рендеру — видаляй файл і рядок тут.

| № | Трек | Автор | Група | Жанр Mixkit | Тривалість | Файл | Джерело |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`);

const BEATS = fs.existsSync(path.join(DIR, 'beats.json')) ? JSON.parse(fs.readFileSync(path.join(DIR, 'beats.json'), 'utf8')) : {}; // node scripts/bpm.mjs
const bpm = (tr, i) => BEATS[file(tr, i)] ? ` · ${BEATS[file(tr, i)].bpm} BPM` : '';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const groups = [...new Set(TRACKS.map((t) => t[3]))];
fs.mkdirSync('out/_музика', {recursive: true});
fs.writeFileSync('out/_музика/index.html', `<!doctype html><meta charset="utf-8"><title>Музика · кандидати</title>
<style>body{background:#080B0E;color:#F5F7F2;font:16px Inter,system-ui,sans-serif;margin:0;padding:24px;max-width:960px}
h1{font-size:28px}.g{color:#C3FF55;font:600 13px monospace;letter-spacing:2px;text-transform:uppercase;margin:28px 0 8px}
.t{display:grid;grid-template-columns:44px 1fr 330px;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid #ffffff14}
.n{font:700 22px monospace;color:#C3FF55}.m{color:#8A97A3;font-size:13px}audio{width:330px}</style>
<h1>Музика: ${TRACKS.length} кандидатів</h1><p class="m">Відтворення наступного треку починається саме. Напиши в чат номери, які залишити.</p>
${groups.map((g) => `<div class="g">${g}</div>` + TRACKS.map((tr, i) => tr[3] !== g ? '' : `<div class="t"><span class="n">${i + 1}</span><span>${esc(tr[1])} <span class="m">· ${esc(tr[2])} · ${esc(tr[4])} · ${tr[5]}${bpm(tr, i)}</span></span><audio controls preload="none" src="../../public/assets/music/${file(tr, i)}"></audio></div>`).join('')).join('\n')}
<script>const a=[...document.querySelectorAll('audio')];a.forEach((x,i)=>{x.addEventListener('play',()=>a.forEach(y=>y!==x&&y.pause()));x.addEventListener('ended',()=>a[i+1]?.play())})</script>
`);
console.log(`каталог: public/assets/music/CATALOG.md, сторінка: out/_музика/index.html`);
