// Renders compositions sequentially and appends wall-clock render time to out/render-times.log.
// usage: node scripts/render-timed.mjs <draft|final> <CompositionId> [...more]
import {spawnSync} from 'node:child_process';
import {appendFileSync, mkdirSync} from 'node:fs';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const [mode, ...ids] = process.argv.slice(2);
const draft = mode === 'draft';
for (const id of ids) {
	// кожне відео — своя папка: out/<id без devguide->/  (DevGuide-Final → out/final/)
	const dir = `out/${id.toLowerCase().replace(/^devguide-/, '')}`;
	mkdirSync(dir, {recursive: true});
	const file = `${dir}/${id.toLowerCase()}${draft ? '-preview-540x960' : '-1080x1920'}.mp4`;
	const args = ['remotion', 'render', 'src/index.ts', id, file, '--codec=h264', `--crf=${draft ? 23 : 18}`, '--concurrency=4', '--log=error', ...(draft ? ['--scale=0.5'] : [])];
	const t0 = Date.now();
	const r = spawnSync(npx, args, {stdio: 'inherit', shell: process.platform === 'win32'});
	const sec = ((Date.now() - t0) / 1000).toFixed(1);
	appendFileSync('out/render-times.log', `${new Date().toISOString()}\t${id}\t${draft ? '540x960 crf23' : '1080x1920 crf18'}\t${sec}s\tstatus=${r.status}\t${file}\n`);
	if (r.status !== 0) process.exit(r.status ?? 1);
}
await import('./out-index.mjs'); // галерея out/index.html після рендеру
