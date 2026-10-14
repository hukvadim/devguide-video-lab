// Рілси банку insta-50 з docs/insta-50/reels.json: голос (ElevenLabs) → фінал → мастеринг → out/insta-50/NN-slug.mp4.
// Пропускає готові (є out/insta-50/NN-*.mp4), тож можна перезапускати скільки завгодно (вручну або заплановане завдання).
// usage: node scripts/insta-batch.mjs [NN ...] [--force]     (без номерів — усі; --force — перерендерити й готові; голос не перегенеровується, якщо текст той самий)
import {spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';

const {reels} = JSON.parse(readFileSync('docs/insta-50/reels.json', 'utf8'));
const pad = (n) => String(n).padStart(2, '0');
const force = process.argv.includes('--force');
const want = process.argv.slice(2).filter((a) => !a.startsWith('--')).map(Number);
const slugs = readdirSync('docs/insta-50').filter((d) => /^\d\d-/.test(d));
const outDir = 'out/insta-50';
mkdirSync(outDir, {recursive: true});
const run = (cmd, args) => spawnSync(cmd, args, {stdio: 'inherit', shell: process.platform === 'win32'}).status;
const done = [], failed = [];
for (const r of reels) {
	const nn = pad(r.n), slug = slugs.find((d) => d.startsWith(`${nn}-`)) ?? `${nn}-insta`;
	if (want.length && !want.includes(r.n)) continue;
	if (!force && existsSync(`${outDir}/${slug}.mp4`)) continue;
	const dir = `public/ideas/insta-${nn}`;
	if (r.voice) {
		mkdirSync(dir, {recursive: true});
		const text = r.voice.join('\n') + '\n';
		const stale = !existsSync(`${dir}/voice.txt`) || readFileSync(`${dir}/voice.txt`, 'utf8') !== text;
		if (stale) writeFileSync(`${dir}/voice.txt`, text);
		if (stale || !existsSync(`${dir}/words.json`)) if (run('node', ['scripts/tts.mjs', dir])) { failed.push(`${nn} tts`); continue; }
	}
	if (run('node', ['scripts/render-timed.mjs', 'final', `Insta-${nn}`])) { failed.push(`${nn} render`); continue; }
	const mp4 = `out/insta-${nn}/insta-${nn}-1080x1920.mp4`;
	if (run('node', ['scripts/master-audio.mjs', mp4])) { failed.push(`${nn} master`); continue; }
	copyFileSync(mp4.replace('.mp4', '-14lufs.mp4'), `${outDir}/${slug}.mp4`);
	done.push(slug);
}
console.log(`\nготово: ${done.length}${done.length ? ' — ' + done.join(', ') : ''}\nпомилки: ${failed.join(', ') || 'нема'}`);
