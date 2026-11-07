// node tools/flow-broll/lib.test.js — перевіряє на справжніх FLOW_BROLL.md і ugc.json, нічого не записує.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { parseCatalog, buildPrompt, setChecked, formatUgc, upsertClip } = require('./lib.js');

const ugcDir = path.join(__dirname, '../../public/assets/ugc');
const md = fs.readFileSync(path.join(ugcDir, 'flow/FLOW_BROLL.md'), 'utf8');
const items = parseCatalog(md);

assert.strictEqual(items.length, 150);
assert.strictEqual(items.filter((i) => i.legacy).length, 18);
const i019 = items.find((i) => i.id === '019');
assert.strictEqual(i019.title, 'Тихе вау');
assert.ok(i019.face && i019.tags.includes('wow'));
assert.ok(!items.find((i) => i.id === '030').face, 'руки на клавіатурі — без обличчя');
assert.ok(buildPrompt(i019, true, { base: 'B.', refSuffix: 'R.' }).endsWith('Tight close-up. B. R.'));

const md2 = setChecked(md, '019');
assert.ok(md2.includes('- [x] **019**') && md2.includes('- [ ] **020**'));
assert.strictEqual(md2.length, md.length);

const raw = fs.readFileSync(path.join(ugcDir, 'ugc.json'), 'utf8');
const j = JSON.parse(raw);
assert.strictEqual(formatUgc(JSON.parse(raw), raw.includes('\r\n') ? '\r\n' : '\n').trim(), raw.trim(), 'форматування ugc.json збігається з ручним');
upsertClip(j, i019);
upsertClip(j, i019);
const out = JSON.parse(formatUgc(j));
assert.strictEqual(out.clips.filter((c) => c.name === 'br-019').length, 1);
console.log('ok', items.length, 'items');
