#!/usr/bin/env node
// Таймінги слів для голосу ElevenLabs: whisper дає час, voice.txt дає текст, словник показу — як писати терміни.
//   node scripts/words.mjs public/ideas/idea-008      → idea-008/words.json  [{w,s,e}]
//   node scripts/words.mjs public/ideas/idea-008 --redisplay   → лише словник показу (без whisper)
//   node scripts/words.mjs selftest
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// фонетика з voice.txt → як показуємо на екрані. Ключ з великою літерою порівнюється з урахуванням регістру
// («Про» — тариф, «про» — прийменник). Довші ключі перевіряються першими.
const DISPLAY = [
	['Гіт', 'Git'], ['гітхаб', 'GitHub'], ['гітхабі', 'GitHub'], ['гітхабу', 'GitHub'], ['версел', 'Vercel'], ['хром', 'Chrome'], ['індекс точка ейч-ті-ем-ел', 'index.html'],
	['клод точка ей-ай слеш даунлоуд', 'claude.ai/download'], ['клод точка ей-ай', 'claude.ai'], ['клод точка ем-ді', 'CLAUDE.md'],
	['клод десктоп', 'Claude Desktop'], ['клод код', 'Claude Code'], ['клод коді', 'Claude Code'], ['клод кодом', 'Claude Code'],
	['клод', 'Claude'], ['клода', 'Claude'], ['клоду', 'Claude'],
	['ві-ес код', 'VS Code'], ['ві-ес коду', 'VS Code'], ['ві-ес коді', 'VS Code'],
	['гіт', 'git'], ['гітігнор', '.gitignore'], ['ноуд-модулс', 'node_modules'], ['точка енв', '.env'],
	['слеш ініт', '/init'], ['слеш клір', '/clear'], ["слеш те-зе інтерв'ю", '/tz-interview'], ["те-зе інтерв'ю", 'tz-interview'],
	['шифт плюс таб', 'Shift+Tab'], ['ентер', 'Enter'], ['ескейп', 'Esc'], ['віндоус одинадцять', 'Windows 11'], ['windows одинадцять', 'Windows 11'], ['віндоус', 'Windows'],
	['вайт', 'Vite'], ['реакт', 'React'], ['тейлвінд', 'Tailwind'], ['локалхост', 'localhost'], ['дев-сервер', 'dev-сервер'],
	['телеграм', 'Telegram'], ['фігма', 'Figma'], ['дев-гайд', 'DevGuide'], ['дев-гайді', 'DevGuide'], ['ем-сі-пі', 'MCP'],
	['май-ферст-сайт', 'my-first-site'], ['опен фолдер', 'Open Folder'], ['меню файл', 'меню File'], ['гугл-акаунт', 'Google-акаунт'],
	["промпт-ін'єкція", 'prompt injection'], ['Фрі', 'Free'], ['Про', 'Pro'], ['Макс', 'Max'],
	['ві-пі-ес', 'VPS'], ['джі-сап', 'GSAP'], ['срі-джей-ес', 'Three.js'], ['те-зе точка ем-ді', 'tz.md'], ['ю-ай ю-ікс про макс', 'ui-ux-pro-max'],
	['вайбер', 'Viber'], ['трелло', 'Trello'], ['трелло-дошку', 'Trello-дошку'], ['плейрайт', 'Playwright'], ['хром девтулз', 'Chrome DevTools'], ['код-граф', 'CodeGraph'],
	['контекст сім', 'context7'], ['фронтенд-дизайн', 'frontend-design'], ["х'юманайзер", 'humanizer'], ['гугл пейдж-спід', 'Google PageSpeed'], ['чат джі-пі-ті', 'ChatGPT'], ['гугл', 'Google'], ['апворк', 'Upwork'], ['асана', 'Asana'], ['ей-пі-ай', 'API'], ['файвер', 'Fiverr'], ['пі-ді-еф', 'PDF'], ['рідмі', 'README'], ['постгрес', 'Postgres'], ['ейч-ті-ем-ел', 'HTML'], ['сі-ес-ес', 'CSS'], ['джаваскрипт', 'JavaScript'], ['три-д', '3D'], ['клод коду', 'Claude Code'],
].map(([k, v]) => [k.split(' '), v, /\p{Lu}/u.test(k)]).sort((a, b) => b[0].length - a[0].length);

const norm = (s) => s.replace(/[’ʼ`]/g, "'").replace(/[^\p{L}\p{N}'-]/gu, '').replace(/^[-']+|[-']+$/g, '');
const low = (s) => norm(s).toLowerCase();

function lev(a, b) {
	const d = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]);
	for (let j = 1; j <= b.length; j++) d[0][j] = j;
	for (let i = 1; i <= a.length; i++)
		for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
	return d[a.length][b.length];
}
const subCost = (a, b) => (a === b ? 0 : lev(a, b) / Math.max(a.length, b.length, 1));

// текст voice.txt + час whisper: глобальне вирівнювання (Нідлман–Вунш); слова без пари — інтерполяція між сусідами
export function align(text, heard) {
	const v = text.split(/\s+/).filter((x) => low(x));
	const h = heard.filter((x) => low(x.w));
	const n = v.length, m = h.length, GAP = 0.8;
	const c = Array.from({length: n + 1}, () => Array(m + 1).fill(0));
	for (let i = 1; i <= n; i++) c[i][0] = i * GAP;
	for (let j = 1; j <= m; j++) c[0][j] = j * GAP;
	for (let i = 1; i <= n; i++)
		for (let j = 1; j <= m; j++) c[i][j] = Math.min(c[i - 1][j - 1] + subCost(low(v[i - 1]), low(h[j - 1].w)), c[i - 1][j] + GAP, c[i][j - 1] + GAP);
	const t = Array(n).fill(null);
	for (let i = n, j = m; i > 0 && j > 0; ) {
		if (c[i][j] === c[i - 1][j - 1] + subCost(low(v[i - 1]), low(h[j - 1].w))) t[--i] = h[--j];
		else if (c[i][j] === c[i - 1][j] + GAP) i--;
		else j--;
	}
	const out = v.map((w, i) => ({w, s: t[i]?.s, e: t[i]?.e}));
	for (let i = 0; i < n; i++) {
		if (out[i].s != null) continue;
		let j = i;
		while (j < n && out[j].s == null) j++;
		const a = out[i - 1]?.e ?? 0, b = out[j]?.s ?? a + 0.3 * (j - i), k = (b - a) / (j - i);
		for (let q = i; q < j; q++) Object.assign(out[q], {s: a + k * (q - i), e: a + k * (q - i + 1)});
		i = j - 1;
	}
	// whisper на початку фраз дає слова нульової довжини: розтягуємо до наступного слова, максимум 0.3 с
	out.forEach((x, i) => { if (x.e - x.s < 0.05) x.e = Math.min(out[i + 1]?.s ?? x.s + 0.3, x.s + 0.3); });
	return out.map((x) => ({w: x.w, s: +x.s.toFixed(2), e: +x.e.toFixed(2)}));
}

// «Клод Код.» → «Claude Code.» — злиття: s з першого, e з останнього, розділові знаки першого/останнього слова зберігаються
export function display(words) {
	const out = [];
	for (let i = 0; i < words.length; ) {
		const hit = DISPLAY.find(([k, , cs]) => k.every((p, q) => words[i + q] && (cs ? norm(words[i + q].w) === p : low(words[i + q].w) === p)));
		if (!hit) { out.push(words[i++]); continue; }
		const run = words.slice(i, i + hit[0].length);
		const first = run[0].w, last = run.at(-1).w;
		const pre = first.match(/^[^\p{L}\p{N}]*/u)[0], post = last.match(/[^\p{L}\p{N}]*$/u)[0];
		out.push({w: pre + hit[1] + post, s: run[0].s, e: run.at(-1).e});
		i += run.length;
	}
	return out;
}

const [arg] = process.argv.slice(2);
if (arg === 'selftest') {
	const heard = [{w: 'Встановлюємо', s: 0, e: 0.8}, {w: 'клот', s: 0.9, e: 1.2}, {w: 'код', s: 1.2, e: 1.5}, {w: 'шаї', s: 1.7, e: 2}, {w: 'і', s: 2.1, e: 2.2}];
	const a = align('Встановлюємо Клод Код. Зараз з ШІ і', heard);
	assert.deepEqual(a.map((x) => x.w), ['Встановлюємо', 'Клод', 'Код.', 'Зараз', 'з', 'ШІ', 'і']);
	assert.equal(a[1].s, 0.9); // «клот» → «Клод»
	assert.ok(a[3].s >= 1.5 && a[5].e <= 2.1); // «Зараз з ШІ» без пари в whisper — між сусідами
	const d = display(a);
	assert.equal(d[1].w, 'Claude Code.');
	assert.deepEqual([d[1].s, d[1].e], [0.9, 1.5]);
	assert.deepEqual(display([{w: 'з', s: 0, e: 1}, {w: 'Про.', s: 1, e: 2}, {w: 'про', s: 2, e: 3}]).map((x) => x.w), ['з', 'Pro.', 'про']);
	assert.equal(display([{w: '«май-ферст-сайт».', s: 0, e: 1}])[0].w, '«my-first-site».');
	console.log('selftest ok');
	process.exit(0);
}
if (process.argv.includes('--redisplay')) { // словник змінився: перезастосувати без whisper
	const f = path.join(arg, 'words.json');
	fs.writeFileSync(f, JSON.stringify(display(JSON.parse(fs.readFileSync(f, 'utf8'))), null, 1));
	console.log('✓ redisplay', f);
	process.exit(0);
}
if (!arg) { console.error('usage: node scripts/words.mjs <public/ideas/idea-xxx> | selftest'); process.exit(1); }

const SKILL = '.claude/skills/devguide-reel/tools';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'words-'));
const run = (cmd, args) => { const r = spawnSync(cmd, args, {stdio: ['ignore', 'ignore', 'inherit']}); if (r.status !== 0) process.exit(r.status ?? 1); };
run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(arg, 'voice.mp3'), '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', path.join(tmp, 'a.wav')]);
run(path.join(SKILL, 'whisper/Release/whisper-cli.exe'), ['-m', path.join(SKILL, 'models/ggml-large-v3-turbo-q5_0.bin'), '-l', 'uk', '-t', String(os.availableParallelism()), '-ml', '1', '-sow', '-oj', '-of', path.join(tmp, 'w'), '-f', path.join(tmp, 'a.wav')]);
const heard = JSON.parse(fs.readFileSync(path.join(tmp, 'w.json'), 'utf8')).transcription
	.map((t) => ({w: t.text.trim(), s: t.offsets.from / 1000, e: t.offsets.to / 1000}))
	.filter((x) => x.w && !/^[[(].*[\])]$/.test(x.w));
const words = display(align(fs.readFileSync(path.join(arg, 'voice.txt'), 'utf8'), heard));
fs.writeFileSync(path.join(arg, 'words.json'), JSON.stringify(words, null, 1));
fs.rmSync(tmp, {recursive: true, force: true});
console.log(`✓ ${arg}/words.json: ${words.length} слів, ${words.at(-1).e} с; whisper почув: ${heard.map((x) => x.w).join(' ')}`);
