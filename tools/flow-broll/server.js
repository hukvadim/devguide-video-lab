// Локальний зберігач для розширення Flow B-roll. Пише у фіксовану папку, без вибору папок у браузері.
// Запуск: node tools/flow-broll/server.js  (автозапуск з Windows — start-hidden.vbs у папці Автозавантаження)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { parseCatalog, setChecked, formatUgc, upsertClip } = require('./lib.js');

const PORT = 5177;
const UGC = path.resolve(__dirname, '../../public/assets/ugc');
const FLOW = path.join(UGC, 'flow');
const MD = path.join(FLOW, 'FLOW_BROLL.md');
const JSONF = path.join(UGC, 'ugc.json');

function catalog() {
  const files = new Set(fs.readdirSync(FLOW));
  return parseCatalog(fs.readFileSync(MD, 'utf8')).map((it) => ({
    ...it,
    done: files.has(`br-${it.id}.mp4`) || (it.legacy && it.checked),
  }));
}

function save(id, buf) {
  const it = catalog().find((i) => i.id === id);
  if (!it) throw new Error(`нема ID ${id} у FLOW_BROLL.md`);
  if (buf.length < 50e3) throw new Error(`підозріло малий файл (${buf.length} Б)`);
  fs.writeFileSync(path.join(FLOW, `br-${id}.mp4`), buf);
  fs.writeFileSync(MD, setChecked(fs.readFileSync(MD, 'utf8'), id));
  const raw = fs.readFileSync(JSONF, 'utf8');
  fs.writeFileSync(JSONF, formatUgc(upsertClip(JSON.parse(raw), it), raw.includes('\r\n') ? '\r\n' : '\n'));
  return { file: `flow/br-${id}.mp4`, size: buf.length };
}

const send = (res, code, obj) => {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(obj));
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    try {
      if (req.method === 'GET' && url.pathname === '/catalog') return send(res, 200, catalog());
      if (req.method === 'POST' && url.pathname === '/save') {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          try {
            const r = save(url.searchParams.get('id'), Buffer.concat(chunks));
            console.log(new Date().toLocaleTimeString(), 'saved', r.file, r.size);
            send(res, 200, r);
          } catch (e) {
            send(res, 400, { error: e.message });
          }
        });
        return;
      }
      send(res, 404, { error: 'not found' });
    } catch (e) {
      send(res, 500, { error: e.message });
    }
  })
  .listen(PORT, '127.0.0.1', () => console.log(`flow-broll server :${PORT} → ${FLOW}`));
