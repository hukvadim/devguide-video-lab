// Матеріали для бота з docs/insta-50/leads.md → docs/insta-50/NN-*/lead.md + матеріали DevGuide (стаття, безкоштовно) ЧЕРНЕТКАМИ.
// Публікує Вадим сам в адмінці (або --publish). Повторний запуск оновлює ті самі матеріали (пошук за slug), нових не плодить.
// Токен адмінки — з ~/.claude.json (MCP devguide), у вивід не потрапляє.
// usage: node scripts/insta-leads.mjs [--dry] [--publish]
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';

const dry = process.argv.includes('--dry'), publish = process.argv.includes('--publish');
const src = readFileSync('docs/insta-50/leads.md', 'utf8');
const dirs = readdirSync('docs/insta-50').filter((d) => /^\d\d-/.test(d));
// теги за рубрикою (slug → id з /admin/materials/meta)
const TAGS = {'03': ['ai'], '05': ['ai'], '07': ['ai'], '09': ['design', 'ui-ux'], '10': ['design', 'css'], '11': ['design'], '12': ['design', 'css'], '16': ['design', 'ui-ux'], '17': ['ui-ux', 'forms'], '19': ['ui-ux', 'design'], '21': ['ui-ux', 'design'], '22': ['ai', 'ui-ux'], '39': ['ai'], '41': ['ai'], '45': ['ai']};

const sections = src.split(/^## /m).slice(1).map((s) => {
	const [head, ...body] = s.split('\n');
	const [nn, word, title] = head.split(' · ');
	return {nn: nn.trim(), word: word.trim(), title: title.trim(), md: body.join('\n').trim()};
});

let env;
const walk = (o) => { if (!o || typeof o !== 'object') return; for (const [k, v] of Object.entries(o)) { if (k === 'devguide' && v?.command) env = v.env; else walk(v); } };
walk(JSON.parse(readFileSync(process.env.USERPROFILE + '/.claude.json', 'utf8')));
const base = env.DEVGUIDE_MCP_ADMIN_URL, h = {'X-Admin-Token': env.DEVGUIDE_MCP_ADMIN_TOKEN, 'Content-Type': 'application/json'};
const api = async (method, path, body) => {
	const r = await fetch(base + path, {method, headers: h, body: body ? JSON.stringify(body) : undefined});
	const t = await r.text();
	if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${t.slice(0, 200)}`);
	return t ? JSON.parse(t) : null;
};
const meta = await api('GET', '/admin/materials/meta');
const tagId = Object.fromEntries(meta.tags.map((t) => [t.slug, t.id]));
const guides = meta.contentTypes.find((c) => c.slug === 'material')?.id;

for (const s of sections) {
	const dir = dirs.find((d) => d.startsWith(`${s.nn}-`));
	const slug = `insta-${dir.slice(3)}`;
	const articleMarkdown = `${s.md}\n\n---\n\nБільше покроково — у [шляхах навчання DevGuide](https://devguide.com.ua/learning).\n`;
	if (dir) writeFileSync(`docs/insta-50/${dir}/lead.md`, `# ${s.title}\n\nСлово: **${s.word}** · матеріал: https://devguide.com.ua/materials/${slug}\n\n${articleMarkdown}`);
	const material = {
		title: s.title, slug, kind: 'article', access: 'free', level: 'beginner',
		shortDescription: s.md.split('\n').find((l) => l && !l.startsWith('`') && !l.startsWith('-'))?.replace(/\*\*/g, '').slice(0, 200) ?? s.title,
		articleMarkdown, contentTypeId: guides, tagIds: (TAGS[s.nn] ?? ['ai']).map((t) => tagId[t]).filter(Boolean),
	};
	if (dry) { console.log('dry', s.nn, s.word, slug); continue; }
	const hit = (await api('GET', `/admin/materials?search=${encodeURIComponent(slug)}`)).find((m) => m.slug === slug);
	const res = hit ? await api('PATCH', `/admin/materials/${hit.id}`, material) : await api('POST', '/admin/materials', {...material, status: 'draft'});
	const id = hit?.id ?? res.id;
	if (publish) await api('PATCH', `/admin/materials/${id}/status`, {status: 'published'});
	console.log(`${hit ? 'оновлено' : 'створено'}${publish ? ' + опубліковано' : ' (чернетка)'}`, s.nn, s.word, slug);
}
