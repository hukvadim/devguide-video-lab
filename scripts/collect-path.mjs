#!/usr/bin/env node
// Готові шорти шляху в одну папку: <папка>/NN Назва кроку.mp4 (+ обкладинки/NN Назва.jpg = кадр 0)
// Порядок і назви — з data/learning-<slug>.json; крок → композиція — PATHS нижче. Береться мастерований *-14lufs.mp4.
//   node scripts/collect-path.mjs [claude|websites] [папка]   (типово claude → out/_шлях-claude-ai, websites → out/sites)
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CLAUDE = {
	account: 'idea-004', plan: 'idea-005', 'first-question': 'idea-002-short1', desktop: 'idea-006', vscode: 'idea-007',
	'claude-code-install': 'idea-008', 'claude-code': 'idea-009', 'claude-md': 'idea-010', git: 'idea-011', 'plan-mode': 'idea-012',
	'ai-broke': 'idea-013', 'ai-safety': 'idea-014', 'skills-mcp': 'idea-015', 'own-skill': 'idea-016', 'next-websites': 'idea-017',
};
const PATHS = {
	claude: {dest: 'out/_шлях-claude-ai', video: (s) => CLAUDE[s.key]},
	// «Сайти»: номер кроку = номер папки в C:/DevGuide/helpers/websites-videos, композиція Sites-NN → out/sites-NN
	websites: {dest: 'out/sites', video: (s, i) => `sites-${String(i + 1).padStart(2, '0')}`},
};
const slug = process.argv[2] ?? 'claude';
if (!PATHS[slug]) { console.error(`usage: node scripts/collect-path.mjs [${Object.keys(PATHS).join('|')}] [папка]`); process.exit(1); }
const DEST = process.argv[3] ?? PATHS[slug].dest;
const safe = (s) => s.replace(/[<>:"/\\|?*]/g, ' -').replace(/\s+/g, ' ').trim(); // «Claude Code: перший проєкт» → «Claude Code - перший проєкт»

const {steps} = JSON.parse(fs.readFileSync(`data/learning-${slug}.json`, 'utf8'));
fs.mkdirSync(path.join(DEST, 'обкладинки'), {recursive: true});
const missing = [];
steps.forEach((s, i) => {
	const id = PATHS[slug].video(s, i);
	const dir = path.join('out', id ?? '');
	const mp4 = fs.existsSync(dir) && fs.readdirSync(dir).find((f) => f.endsWith('-14lufs.mp4'));
	const name = `${String(i + 1).padStart(2, '0')} ${safe(s.title)}.mp4`;
	if (!id || !mp4) return missing.push(name);
	fs.copyFileSync(path.join(dir, mp4), path.join(DEST, name));
	// обкладинка для Instagram: кадр 0 (у StepVideo це вже проявлена заставка)
	spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(dir, mp4), '-frames:v', '1', '-q:v', '2', path.join(DEST, 'обкладинки', name.replace(/.mp4$/, '.jpg'))]);
	console.log(`✓ ${name}  ←  ${dir}/${mp4}`);
});
if (missing.length) console.log(`\nЩе немає фіналу: ${missing.join(', ')}`);
