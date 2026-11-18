#!/usr/bin/env node
// Відео-приклади для бібліотеки: Catalog-A…J (100 елементів кадру) і CapCatalog (40 комбінацій субтитрів)
// → out/catalog/<A…J|captions>.mp4, 540×960. Готові файли пропускає; --force перерендерює все.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repo = path.resolve(import.meta.dirname, '../..');
const skill = path.join(repo, '.claude/skills/devguide-reel');
const out = path.join(repo, 'out/catalog');
const force = process.argv.includes('--force');
fs.mkdirSync(out, { recursive: true });

const jobs = [...'ABCDEFGHIJ'].map((g) => [`Catalog-${g}`, g]).concat([['CapCatalog', 'captions']]);
for (const [comp, name] of jobs) {
	const file = path.join(out, `${name}.mp4`);
	if (!force && fs.existsSync(file)) { console.log(`✓ ${name}.mp4 уже є`); continue; }
	console.log(`… ${comp} → ${name}.mp4`);
	const r = spawnSync(process.execPath, [path.join(skill, 'node_modules/@remotion/cli/remotion-cli.js'), 'render', 'motion/index.ts', comp, file, '--scale=0.5', '--log=error'], { cwd: skill, stdio: 'inherit' });
	if (r.status !== 0) { console.error(`✗ ${comp} не вдався`); process.exitCode = 1; }
}
