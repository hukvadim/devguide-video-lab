// Перегляд готових роликів у браузері: сітка відео з папок out/, «Копіювати шлях», «Видалити» (переносить у out/_кошик/, не стирає).
// usage: npm run review   → http://localhost:4321   (без залежностей, лише node)
import {createReadStream, existsSync, mkdirSync, readdirSync, renameSync, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {basename, join, resolve, sep} from 'node:path';

const OUT = resolve('out'), TRASH = join(OUT, '_кошик'), PORT = 4321;
const inOut = (p) => { const r = resolve(OUT, p); return r.startsWith(OUT + sep) ? r : null; };
// зібрані добірки — першими, далі папки окремих рендерів
const TOP = ['insta-50', 'sites', 'sites-full', '_шлях-claude-ai', '_ready', '_обране'];
const rank = (d) => (TOP.includes(d) ? TOP.indexOf(d) : d.startsWith('_') ? 50 : 100);
const folders = () => readdirSync(OUT).filter((d) => statSync(join(OUT, d)).isDirectory() && d !== '_кошик' && readdirSync(join(OUT, d)).some((f) => f.endsWith('.mp4'))).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

const page = `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Перегляд роликів</title>
<style>body{margin:0;font:15px system-ui;background:#111;color:#eee}header{position:sticky;top:0;background:#111e;padding:12px 16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid #333;z-index:2}
select,button{font:inherit;border-radius:8px;border:1px solid #444;background:#222;color:#eee;padding:6px 10px;cursor:pointer}button:hover{background:#333}.del{border-color:#a33;color:#f88}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;padding:16px}.card{background:#1b1b1b;border-radius:12px;padding:8px}.card video{width:100%;border-radius:8px;background:#000;aspect-ratio:9/16;object-fit:contain}
.wide video{aspect-ratio:16/9}.name{margin:6px 2px;word-break:break-all;font-size:13px}.row{display:flex;gap:6px}.row button{flex:1}#n{color:#999}#toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#2a2;color:#fff;padding:8px 14px;border-radius:8px;display:none}</style></head>
<body><header><b>Ролики</b><select id="f"></select><span id="n"></span></header><main id="g"></main><div id="toast"></div>
<script>
const $=s=>document.querySelector(s), toast=t=>{const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(e._t);e._t=setTimeout(()=>e.style.display='none',1500)};
async function load(){const d=$('#f').value;localStorage.setItem('f',d);const files=await (await fetch('/api/list?d='+encodeURIComponent(d))).json();$('#n').textContent=files.length+' відео';
$('#g').innerHTML='';for(const f of files){const c=document.createElement('div');c.className='card'+(f.wide?' wide':'');
c.innerHTML='<video controls preload="metadata" src="/v/'+encodeURIComponent(d)+'/'+encodeURIComponent(f.name)+'"></video><div class="name"></div><div class="row"><button class="cp">Копіювати шлях</button><button class="del">Видалити</button></div>';
c.querySelector('.name').textContent=f.name;c.querySelector('.cp').onclick=()=>{navigator.clipboard.writeText(f.path);toast('Скопійовано')};
c.querySelector('.del').onclick=async()=>{if(!confirm('Перенести в out/_кошик?\\n'+f.name))return;const r=await fetch('/api/del?d='+encodeURIComponent(d)+'&f='+encodeURIComponent(f.name),{method:'POST'});if(r.ok){c.remove();toast('У кошику');$('#n').textContent=(--files.length)+' відео'}else toast('Помилка')};
$('#g').append(c)}}
(async()=>{const fs=await (await fetch('/api/folders')).json();for(const x of fs){const o=document.createElement('option');o.textContent=x;$('#f').append(o)}const s=localStorage.getItem('f');if(fs.includes(s))$('#f').value=s;else if(fs.includes('insta-50'))$('#f').value='insta-50';$('#f').onchange=load;load()})();
</script></body></html>`;

createServer((req, res) => {
	const u = new URL(req.url, 'http://x');
	const json = (x, code = 200) => { res.writeHead(code, {'content-type': 'application/json; charset=utf-8'}); res.end(JSON.stringify(x)); };
	if (u.pathname === '/') { res.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); return res.end(page); }
	if (u.pathname === '/api/folders') return json(folders());
	if (u.pathname === '/api/list') {
		const d = inOut(u.searchParams.get('d') ?? ''); if (!d || !existsSync(d)) return json([], 404);
		return json(readdirSync(d).filter((f) => f.endsWith('.mp4')).sort().map((f) => ({name: f, path: join(d, f), wide: /1920x1080|-wide|sites-full/.test(f)})));
	}
	if (u.pathname === '/api/del' && req.method === 'POST') {
		const f = inOut(join(u.searchParams.get('d') ?? '', basename(u.searchParams.get('f') ?? '')));
		if (!f || !f.endsWith('.mp4') || !existsSync(f)) return json({ok: false}, 400);
		mkdirSync(TRASH, {recursive: true});
		renameSync(f, join(TRASH, `${basename(join(f, '..'))}__${basename(f)}`));
		return json({ok: true});
	}
	if (u.pathname.startsWith('/v/')) {
		const f = inOut(decodeURIComponent(u.pathname.slice(3))); if (!f || !existsSync(f)) { res.writeHead(404); return res.end(); }
		const size = statSync(f).size, range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
		if (range) {
			const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : size - 1;
			res.writeHead(206, {'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1});
			return createReadStream(f, {start, end}).pipe(res);
		}
		res.writeHead(200, {'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'content-length': size});
		return createReadStream(f).pipe(res);
	}
	res.writeHead(404); res.end();
}).listen(PORT, '127.0.0.1', () => console.log(`Перегляд роликів: http://localhost:${PORT}  (Ctrl+C — зупинити)`));
