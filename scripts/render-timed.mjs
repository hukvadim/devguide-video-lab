// Renders compositions sequentially and appends wall-clock render time to out/render-times.log.
// usage: node scripts/render-timed.mjs <draft|final> <CompositionId> [...more] [--wh=1920x1080]
// --wh — повний розмір композиції (типово 1080x1920); прев'ю рендериться в половину.
import {spawnSync} from 'node:child_process';
import {appendFileSync, mkdirSync} from 'node:fs';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const argv = process.argv.slice(2);
const [w, h] = (argv.find((a) => a.startsWith('--wh='))?.slice(5) ?? '1080x1920').split('x').map(Number);
const [mode, ...ids] = argv.filter((a) => !a.startsWith('--'));
const draft = mode === 'draft';
const size = draft ? `${w / 2}x${h / 2}` : `${w}x${h}`;
for (const id of ids) {
	// кожне відео — своя папка: out/<id без devguide->/  (DevGuide-Final → out/final/)
	const dir = `out/${id.toLowerCase().replace(/^devguide-/, '')}`;
	mkdirSync(dir, {recursive: true});
	const file = `${dir}/${id.toLowerCase()}${draft ? '-preview' : ''}-${size}.mp4`;
	const args = ['remotion', 'render', 'src/index.ts', id, file, '--codec=h264', `--crf=${draft ? 23 : 18}`, '--concurrency=4', '--log=error', ...(draft ? ['--scale=0.5'] : [])];
	const t0 = Date.now();
	const r = spawnSync(npx, args, {stdio: 'inherit', shell: process.platform === 'win32'});
	const sec = ((Date.now() - t0) / 1000).toFixed(1);
	appendFileSync('out/render-times.log', `${new Date().toISOString()}\t${id}\t${size} crf${draft ? 23 : 18}\t${sec}s\tstatus=${r.status}\t${file}\n`);
	if (r.status !== 0) process.exit(r.status ?? 1);
}
// після фіналу прибрати qa/ і прев'ю (clean.mjs сам оновлює галерею out/index.html)
await import(draft ? './out-index.mjs' : './clean.mjs');
