#!/usr/bin/env node
// Темп і перший біт треків, щоб різати ролики без голосу в ритм.
//   node scripts/bpm.mjs <файл.mp3|папка>   → друкує й дописує <папка>/beats.json {файл: {bpm, offset}}
//   node scripts/bpm.mjs selftest
// ponytail: енергетичні онсети + автокореляція; для трапу з half-time може дати 2× або ½ — тоді правиться вручну в beats.json.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SR = 11025, HOP = 256;

export function estimate(pcm) {
	const n = Math.floor(pcm.length / HOP);
	const env = new Float64Array(n);
	let prev = 0;
	for (let i = 0; i < n; i++) {
		let e = 0;
		for (let k = 0; k < HOP; k++) e += pcm[i * HOP + k] ** 2;
		e = Math.sqrt(e / HOP);
		env[i] = Math.max(0, e - prev); // лише зростання енергії = удари
		prev = e;
	}
	const fps = SR / HOP;
	let best = 0, lagBest = 0;
	for (let bpm = 70; bpm <= 180; bpm += 0.5) {
		const lag = (60 / bpm) * fps;
		let s = 0;
		for (let i = 0; i + lag * 4 < n; i += 1) s += env[i] * (env[Math.round(i + lag)] + env[Math.round(i + lag * 2)] + env[Math.round(i + lag * 4)]);
		if (s > best) { best = s; lagBest = lag; }
	}
	// уточнення: темп ±1.5 BPM кроком 0.05 і фаза кроком ¼ кадру — за сумою онсетів на сітці ударів
	const grid = (lag) => {
		let off = 0, score = 0;
		for (let o = 0; o < lag; o += 0.25) {
			let s = 0;
			for (let x = o; x < n; x += lag) s += env[Math.round(x)];
			if (s > score) { score = s; off = o; }
		}
		return {off, score};
	};
	const coarse = 60 / (lagBest / fps);
	let res = {bpm: coarse, off: 0, score: -1};
	for (let bpm = coarse - 1.5; bpm <= coarse + 1.5; bpm += 0.05) {
		const g = grid((60 / bpm) * fps);
		if (g.score > res.score) res = {bpm, ...g};
	}
	return {bpm: Math.round(res.bpm * 10) / 10, offset: Math.round((res.off / fps) * 1000) / 1000};
}

const decode = (file) => {
	const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-t', '60', '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], {maxBuffer: 64 << 20});
	if (r.status !== 0) throw new Error(`ffmpeg: ${file}`);
	const b = r.stdout;
	const pcm = new Float32Array(b.length / 2);
	for (let i = 0; i < pcm.length; i++) pcm[i] = b.readInt16LE(i * 2) / 32768;
	return pcm;
};

const arg = process.argv[2];
if (arg === 'selftest') {
	const pcm = new Float32Array(SR * 20); // клік-трек 120 BPM з першим ударом на 0.25 с
	for (let t = 0.25; t < 20; t += 0.5) for (let k = 0; k < 200; k++) pcm[Math.round(t * SR) + k] = Math.sin(k / 3) * (1 - k / 200);
	const r = estimate(pcm);
	assert.ok(Math.abs(r.bpm - 120) < 1.5, `bpm ${r.bpm}`);
	assert.ok(Math.abs(r.offset - 0.25) < 0.05, `offset ${r.offset}`);
	console.log('selftest ok', r);
	process.exit(0);
}
if (!arg) { console.error('usage: node scripts/bpm.mjs <файл|папка> | selftest'); process.exit(1); }
const files = fs.statSync(arg).isDirectory() ? fs.readdirSync(arg).filter((f) => f.endsWith('.mp3')).map((f) => path.join(arg, f)) : [arg];
const out = path.join(fs.statSync(arg).isDirectory() ? arg : path.dirname(arg), 'beats.json');
const beats = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
for (const f of files) {
	const r = estimate(decode(f));
	beats[path.basename(f)] = r;
	console.log(`${path.basename(f)}: ${r.bpm} BPM, перший біт ${r.offset} с`);
}
fs.writeFileSync(out, JSON.stringify(beats, null, 1));
