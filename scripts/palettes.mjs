#!/usr/bin/env node
// Контраст палітр (src/system/palettes.ts): які йдуть у випадковий вигляд рендеру. Node ≥ 22.18 (type stripping).
//   node scripts/palettes.mjs
import fs from 'node:fs';
import {contrast, makePalettes, readable} from '../src/system/palettes.ts';

const p = JSON.parse(fs.readFileSync('data/brand.json', 'utf8')).palette;
const all = makePalettes({bg: p.background, text: p.text, accent: p.accent, onAccent: p.background});
const NEW = ['ocean', 'amber', 'pink', 'paper', 'mint', 'sunset'];
for (const [n, t] of Object.entries(all)) {
	const r = [contrast(t.text, t.bg), contrast(t.accent, t.bg), contrast(t.onAccent, t.accent)].map((x) => x.toFixed(1)).join(' / ');
	console.log(`${n.padEnd(8)} текст/акцент/на акценті ${r}  ${readable(t) ? 'ок' : 'НЕ в рандомі'}`);
	if (NEW.includes(n) && !readable(t)) throw new Error(`нова палітра ${n} нечитабельна`);
}
console.log('selftest ok');
