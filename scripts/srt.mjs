// words.json → .srt для YouTube (та сама розбивка рядків, що й вшиті субтитри: src/ideas/captions.ts).
//   node scripts/srt.mjs public/ideas/idea-001/words.json out/idea-001/idea-001.srt
//   node scripts/srt.mjs selftest
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chunkEnd, chunkWords} from '../src/ideas/captions.ts';

const ts = (s) => {
	const ms = Math.round(s * 1000);
	const p = (n, l = 2) => String(n).padStart(l, '0');
	return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
export const toSrt = (words) => {
	const chunks = chunkWords(words);
	return chunks.map((c, i) => `${i + 1}\n${ts(c[0].s)} --> ${ts(chunkEnd(chunks, i, 0.3))}\n${c.map((w) => w.w).join(' ')}\n`).join('\n');
};

const [inp, out] = process.argv.slice(2);
if (inp === 'selftest') {
	const srt = toSrt([{w: 'Привіт.', s: 0, e: 0.5}, {w: 'Світ', s: 1.2, e: 1.6}]);
	assert.equal(srt, '1\n00:00:00,000 --> 00:00:00,800\nПривіт.\n\n2\n00:00:01,200 --> 00:00:01,900\nСвіт\n');
	console.log('selftest ok');
} else {
	fs.writeFileSync(out, toSrt(JSON.parse(fs.readFileSync(inp, 'utf8'))));
	console.log(`✓ ${out}`);
}
