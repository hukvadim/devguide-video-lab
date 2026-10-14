// GET/PUT шляху на adm.devguide.com.ua тим самим токеном, що й MCP devguide (з ~/.claude.json); токен не друкується.
import {readFileSync, writeFileSync} from 'node:fs';
const cfg = JSON.parse(readFileSync(process.env.USERPROFILE + '/.claude.json', 'utf8'));
let env; const walk = (o) => { if (!o || typeof o !== 'object') return; for (const [k, v] of Object.entries(o)) { if (k === 'devguide' && v?.command) env = v.env; else walk(v); } }; walk(cfg);
const base = env.DEVGUIDE_MCP_ADMIN_URL, h = {'X-Admin-Token': env.DEVGUIDE_MCP_ADMIN_TOKEN, 'Content-Type': 'application/json'};
const [cmd, slug, file] = process.argv.slice(2);
if (cmd === 'get') { const r = await fetch(`${base}/admin/learning/${slug}`, {headers: h}); const j = await r.json(); writeFileSync(file, JSON.stringify(j, null, 1)); console.log(r.status, j.title, j.steps?.length); }
if (cmd === 'put') { const body = readFileSync(file, 'utf8'); const r = await fetch(`${base}/admin/learning/${slug}`, {method: 'PUT', headers: h, body}); console.log(r.status, (await r.text()).slice(0, 300)); }
if (cmd === 'import') { const markdown = readFileSync(file, 'utf8'); const r = await fetch(`${base}/admin/learning/${slug}/import-md`, {method: 'POST', headers: h, body: JSON.stringify({markdown})}); console.log(r.status, (await r.text()).slice(0, 300)); }
