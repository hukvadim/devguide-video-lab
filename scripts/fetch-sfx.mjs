#!/usr/bin/env node
// Кандидати звуків з Mixkit (Mixkit License) → public/assets/audio/_кандидати/NN-група-назва.mp3
// + рядки в _кандидати/CATALOG.md + out/_звуки/index.html. Того, що вже є в бібліотеці (ATTRIBUTION.md), тут немає.
//   node scripts/fetch-sfx.mjs
import fs from 'node:fs';
import path from 'node:path';

// [id, назва, група] — сторінки категорій mixkit.co/free-sound-effects/, 2026-10-11
const SFX = [
	['1489', 'Air woosh', 'whoosh'], ['1492', 'Cinematic whoosh fast transition', 'whoosh'], ['1491', 'Arrow whoosh', 'whoosh'],
	['1714', 'Fast rocket whoosh', 'whoosh'], ['1486', 'Cinematic tunnel reverb woosh', 'whoosh'], ['3005', 'Explainer video pops whoosh light pop', 'whoosh'],
	['2350', 'Magic sparkle whoosh', 'whoosh'], ['1485', 'Metal hit woosh', 'whoosh'], ['787', 'Cinematic whoosh stutter', 'whoosh'],
	['2596', 'Electric whoosh', 'whoosh'], ['2903', 'Movie whoosh impact presentation', 'whoosh'],
	['2595', 'Small electric glitch', 'glitch'], ['1457', 'Glitch static', 'glitch'], ['679', 'Glitchy cinematic suspense hit', 'glitch'],
	['2594', 'Electric buzz glitch', 'glitch'], ['1093', 'Glitch sci fi rewind transition', 'glitch'], ['1039', 'Futuristic glitch robot', 'glitch'],
	['1143', 'Cinematic whoosh deep impact', 'impact'], ['2908', 'Movie trailer epic impact', 'impact'], ['2782', 'Epic impact afar explosion', 'impact'],
	['2902', 'Movie impact intro presentation', 'impact'], ['2909', 'Cool impact movie trailer', 'impact'], ['1687', 'Dramatic metal explosion impact', 'impact'],
	['1109', 'Select click', 'ui'], ['2574', 'Software interface start', 'ui'], ['2568', 'Cool interface click tone', 'ui'],
	['2573', 'Interface option select', 'ui'], ['2577', 'Interface device click', 'ui'], ['1107', 'Page forward single chime', 'ui'],
	['2870', 'Correct answer tone', 'notify'], ['2358', 'Long pop', 'notify'], ['2354', 'Message pop alert', 'notify'],
	['900', 'Sci fi click', 'notify'], ['951', 'Positive notification', 'notify'], ['914', 'Sci Fi confirmation', 'notify'],
	['1386', 'Keyboard typing', 'typing'], ['2533', 'Single key type', 'typing'], ['2542', 'Hard single key press in a laptop', 'typing'],
	['166', 'Fast small sweep transition', 'transition'], ['2608', 'Air zoom vacuum', 'transition'], ['2290', 'Epic orchestra transition', 'transition'],
];
const DIR = 'public/assets/audio/_кандидати';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const file = ([, t, g], i) => `${String(i + 1).padStart(2, '0')}-${g}-${slug(t)}.mp3`;
const url = (id) => `https://assets.mixkit.co/active_storage/sfx/${id}/${id}-preview.mp3`;

fs.mkdirSync(DIR, {recursive: true});
for (const [i, s] of SFX.entries()) {
	const dest = path.join(DIR, file(s, i));
	if (fs.existsSync(dest)) continue;
	const res = await fetch(url(s[0]));
	if (!res.ok) { console.error(`✗ ${s[0]} ${s[1]}: HTTP ${res.status}`); continue; }
	fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
	console.log(`✓ ${file(s, i)}`);
	await new Promise((r) => setTimeout(r, 300));
}

fs.writeFileSync(path.join(DIR, 'CATALOG.md'), `# Звуки: кандидати (Mixkit License, 2026-10-11, scripts/fetch-sfx.mjs)
Вибрані переносимо в public/assets/audio/ і додаємо рядок у ATTRIBUTION.md.

| № | Звук | Група | Файл | Джерело |
|---|---|---|---|---|
${SFX.map((s, i) => `| ${i + 1} | ${s[1]} | ${s[2]} | ${file(s, i)} | ${url(s[0])} |`).join('\n')}
`);
const groups = [...new Set(SFX.map((s) => s[2]))];
fs.mkdirSync('out/_звуки', {recursive: true});
fs.writeFileSync('out/_звуки/index.html', `<!doctype html><meta charset="utf-8"><title>Звуки · кандидати</title>
<style>body{background:#080B0E;color:#F5F7F2;font:16px Inter,system-ui,sans-serif;margin:0;padding:24px;max-width:960px}
.g{color:#C3FF55;font:600 13px monospace;letter-spacing:2px;text-transform:uppercase;margin:24px 0 8px}
.t{display:grid;grid-template-columns:44px 1fr 260px;gap:12px;align-items:center;padding:6px 0;border-bottom:1px solid #ffffff14}
.n{font:700 20px monospace;color:#C3FF55}audio{width:260px}</style>
<h1>Звуки: ${SFX.length} кандидатів</h1><p style="color:#8A97A3">Напиши в чат номери, які залишити.</p>
${groups.map((g) => `<div class="g">${g}</div>` + SFX.map((s, i) => s[2] !== g ? '' : `<div class="t"><span class="n">${i + 1}</span><span>${s[1]}</span><audio controls preload="none" src="../../public/assets/audio/_кандидати/${file(s, i)}"></audio></div>`).join('')).join('\n')}
<script>const a=[...document.querySelectorAll('audio')];a.forEach(x=>x.addEventListener('play',()=>a.forEach(y=>y!==x&&y.pause())))</script>
`);
console.log('сторінка: out/_звуки/index.html');
