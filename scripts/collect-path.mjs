#!/usr/bin/env node
// Готові шорти шляху «Claude / AI» в одну папку: out/_шлях-claude-ai/NN Назва кроку.mp4
// Порядок і назви — з data/learning-claude.json; крок → композиція — STEP_VIDEO нижче. Береться мастерований *-14lufs.mp4.
//   node scripts/collect-path.mjs
import fs from 'node:fs';
import path from 'node:path';

const STEP_VIDEO = {
	account: 'idea-004', plan: 'idea-005', 'first-question': 'idea-002-short1', desktop: 'idea-006', vscode: 'idea-007',
	'claude-code-install': 'idea-008', 'claude-code': 'idea-009', 'claude-md': 'idea-010', git: 'idea-011', 'plan-mode': 'idea-012',
	'ai-broke': 'idea-013', 'ai-safety': 'idea-014', 'skills-mcp': 'idea-015', 'own-skill': 'idea-016', 'next-websites': 'idea-017',
};
const DEST = 'out/_шлях-claude-ai';
const safe = (s) => s.replace(/[<>:"/\\|?*]/g, ' -').replace(/\s+/g, ' ').trim(); // «Claude Code: перший проєкт» → «Claude Code - перший проєкт»

const {steps} = JSON.parse(fs.readFileSync('data/learning-claude.json', 'utf8'));
fs.mkdirSync(DEST, {recursive: true});
const missing = [];
steps.forEach((s, i) => {
	const dir = path.join('out', STEP_VIDEO[s.key] ?? '');
	const mp4 = fs.existsSync(dir) && fs.readdirSync(dir).find((f) => f.endsWith('-14lufs.mp4'));
	const name = `${String(i + 1).padStart(2, '0')} ${safe(s.title)}.mp4`;
	if (!STEP_VIDEO[s.key] || !mp4) return missing.push(name);
	fs.copyFileSync(path.join(dir, mp4), path.join(DEST, name));
	console.log(`✓ ${name}  ←  ${dir}/${mp4}`);
});
if (missing.length) console.log(`\nЩе немає фіналу: ${missing.join(', ')}`);
