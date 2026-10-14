// Банк «50 ідей рілсів без зйомки»: docs/insta-50/ideas.json → docs/insta-50/NN-slug/{idea.md, props.json, cover.png} + README.md.
// Папки, які Вадим видалив (відкинув), не відновлюються, якщо передати --keep-deleted. Обкладинки — одним бандлом через @remotion/renderer.
// usage: node scripts/insta50.mjs [--no-render]
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = 'docs/insta-50';
const {ideas} = JSON.parse(readFileSync(`${root}/ideas.json`, 'utf8'));
const pad = (n) => String(n).padStart(2, '0');
const dirs = ideas.map((x, i) => `${root}/${pad(i + 1)}-${x.slug}`);
const keepDeleted = process.argv.includes('--keep-deleted');
const existing = new Set(readdirSync(root));

const md = (x, n) => `# ${pad(n)} · ${x.title}${x.sub ? ` — ${x.sub}` : ''}

- **Рубрика:** ${x.rubric} · **Акаунт:** ${x.account} · **Режим:** ${x.mode === 'голос' ? 'голос-клон ElevenLabs + музика' : 'тільки музика на біт'} · **Зйомка:** не потрібна
- **Довжина:** 30–45 с, 9:16 · **Обкладинка:** \`cover.png\` (кадр 0)
- **Хук (0–2 с):** ${x.hook}
- **Сценарій:**
${x.beats.map((b) => `  - ${b}`).join('\n')}
- **CTA:** «Напиши **${x.cta}** у коментарях — надішлю в Direct»: ${x.sends}
- **Перевірити:** ${x.check}
`;

for (const [i, x] of ideas.entries()) {
	const d = dirs[i], name = d.split('/').pop();
	if (!keepDeleted && existing.size > 3 && !existing.has(name) && existsSync(`${root}/README.md`)) continue; // відкинута Вадимом
	mkdirSync(d, {recursive: true});
	writeFileSync(`${d}/idea.md`, md(x, i + 1));
	writeFileSync(`${d}/props.json`, JSON.stringify({n: i + 1, layout: x.layout, theme: x.theme, title: x.title, sub: x.sub, num: x.num, items: x.items, cta: x.cta, account: x.account}, null, 1));
}
writeFileSync(`${root}/README.md`, `# 50 ідей рілсів без зйомки (на відсів)

Кожна папка — ідея: \`cover.png\` (як виглядатиме обкладинка) + \`idea.md\` (хук, сценарій, CTA). Не подобається — видали папку.
Схвалені переносимо в \`docs/IDEAS.md\` як ID-xxx → сценарій → ролик (скіл devguide-ideas). Дані — \`ideas.json\`, перегенерація — \`node scripts/insta50.mjs\`.

| # | Ідея | Рубрика | Режим | CTA |
|---|---|---|---|---|
${ideas.map((x, i) => `| ${pad(i + 1)} | [${x.title}](${pad(i + 1)}-${x.slug}/idea.md) | ${x.rubric} | ${x.mode} | ${x.cta} |`).join('\n')}
`);

if (!process.argv.includes('--no-render')) {
	const serveUrl = await bundle({entryPoint: 'src/index.ts'});
	for (const d of dirs.filter((x) => existsSync(x))) {
		const inputProps = JSON.parse(readFileSync(`${d}/props.json`, 'utf8'));
		const composition = await selectComposition({serveUrl, id: 'Insta50-Cover', inputProps});
		await renderStill({serveUrl, composition, inputProps, output: `${d}/cover.png`, imageFormat: 'png', scale: 0.5});
		console.log('✓', d);
	}
}
