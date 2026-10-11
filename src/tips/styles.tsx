import React from 'react';
import {random} from 'remotion';
import {F, ramp} from '../system/kit';

// Процедурні «приклади» стилів картинок для Tips-08: один будиночок у різних стилях (SVG, без генерації й без мережі).
// Це схема стилю, а не результат AI — так і підписуємо в кадрі. Координати SVG: viewBox 0 0 200 200.

type V3 = [number, number, number];
// будиночок: коробка + двосхилий дах, центр моделі в (0,0,0)
const P: V3[] = [[-1, -1, -0.8], [1, -1, -0.8], [1, -1, 0.8], [-1, -1, 0.8], [-1, 0.2, -0.8], [1, 0.2, -0.8], [1, 0.2, 0.8], [-1, 0.2, 0.8], [-1, 1, 0], [1, 1, 0]];
const quad = (x0: number, y0: number, x1: number, y1: number, z = 0.81): V3[] => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];
type Face = {v: V3[]; c: string; detail?: boolean};
const WALL = '#F1D9B5';
const ROOF = '#C2553A';
const FACES: Face[] = [
	{v: [3, 2, 6, 7].map((i) => P[i]), c: WALL}, {v: [0, 1, 5, 4].map((i) => P[i]), c: WALL},
	{v: [0, 3, 7, 8, 4].map((i) => P[i]), c: WALL}, {v: [1, 2, 6, 9, 5].map((i) => P[i]), c: WALL},
	{v: [7, 6, 9, 8].map((i) => P[i]), c: ROOF}, {v: [4, 5, 9, 8].map((i) => P[i]), c: ROOF},
	{v: quad(-0.22, -1, 0.22, -0.35), c: '#6B4226', detail: true},
	{v: quad(-0.8, -0.55, -0.45, -0.2), c: '#FFE58A', detail: true}, {v: quad(0.45, -0.55, 0.8, -0.2), c: '#FFE58A', detail: true},
];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const mean = (v: V3[]): V3 => [0, 1, 2].map((k) => v.reduce((s, p) => s + p[k], 0) / v.length) as V3;
const rot = ([x, y, z]: V3, th: number, ph: number): V3 => {
	const x1 = x * Math.cos(th) + z * Math.sin(th);
	const z1 = -x * Math.sin(th) + z * Math.cos(th);
	return [x1, y * Math.cos(ph) - z1 * Math.sin(ph), y * Math.sin(ph) + z1 * Math.cos(ph)];
};
const K = 52;
const scr = (p: V3, th: number, ph: number) => { const r = rot(p, th, ph); return [100 + r[0] * K, 108 - r[1] * K, r[2]] as const; };
const pts = (v: V3[], th: number, ph: number) => v.map((p) => scr(p, th, ph).slice(0, 2).join(',')).join(' ');
const shade = (hex: string, k: number) => '#' + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k))).toString(16).padStart(2, '0')).join('');
const LIGHT: V3 = (() => { const l: V3 = [0.45, 0.75, 0.6]; const n = Math.hypot(...l); return l.map((x) => x / n) as V3; })();
/** Видимі грані (зовнішня нормаль до камери), від дальньої до ближньої, з освітленням. */
const solid = (faces: Face[], th: number, ph: number) =>
	faces.map((f) => {
		let n = cross(sub(f.v[1], f.v[0]), sub(f.v[2], f.v[0]));
		if (dot(n, mean(f.v)) < 0) n = n.map((x) => -x) as V3;
		const rn = rot(n, th, ph);
		const len = Math.hypot(...rn);
		return {f, vis: rn[2] > 0, z: rot(mean(f.v), th, ph)[2] + (f.detail ? 0.05 : 0), lit: 0.6 + 0.4 * Math.max(0, dot(rn, LIGHT) / len)};
	}).filter((x) => x.vis).sort((a, b) => a.z - b.z);

// ---------- 2D ----------
const HouseLines: React.FC<{s: string; w?: number; win?: string}> = ({s, w = 1.6, win = s}) => (
	<g fill="none" stroke={s} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round">
		<polyline points="125,72 125,50 137,50 137,82" />
		<polygon points="40,95 100,40 160,95" />
		<rect x={50} y={95} width={100} height={75} />
		<g stroke={win}><rect x={88} y={125} width={24} height={45} /><rect x={60} y={108} width={20} height={20} /><rect x={120} y={108} width={20} height={20} /></g>
	</g>
);
const Flat = () => (
	<>
		<rect width={200} height={200} fill="#BFE3FF" />
		<circle cx={32} cy={34} r={13} fill="#FFD54A" />
		<rect y={168} width={200} height={32} fill="#7BC96F" />
		<rect x={125} y={50} width={12} height={32} fill="#8A3B2A" />
		<polygon points="40,95 100,40 160,95" fill={ROOF} />
		<rect x={50} y={95} width={100} height={75} fill={WALL} />
		<rect x={88} y={125} width={24} height={45} fill="#6B4226" />
		<rect x={60} y={108} width={20} height={20} fill="#FFE58A" /><rect x={120} y={108} width={20} height={20} fill="#FFE58A" />
	</>
);
const pixel = (x: number, y: number) => {
	if (y >= 17) return (x + y) % 3 ? '#4CAF50' : '#2E7D32';
	if ((x - 2) ** 2 + (y - 2) ** 2 <= 2) return '#FFE14D';
	if ((y === 3 && x >= 5 && x <= 7) || (y === 2 && x === 6)) return '#FFFFFF';
	const h = y - 4;
	if (y >= 4 && y <= 9 && x >= 9 - h && x <= 10 + h) return y === 9 ? '#7B241C' : '#C0392B';
	if (x >= 13 && x <= 14 && y >= 2 && y <= 6) return '#555555';
	if (y >= 10 && y <= 16 && x >= 5 && x <= 14) {
		if (x >= 9 && x <= 10 && y >= 13) return '#6E3B1E';
		if ((x === 6 || x === 7 || x === 12 || x === 13) && (y === 11 || y === 12)) return '#FFF176';
		return x === 14 ? '#D2B48C' : '#F5DEB3';
	}
	return '#5FCDE4';
};
const Pixel = () => <g shapeRendering="crispEdges">{Array.from({length: 400}, (_, k) => <rect key={k} x={(k % 20) * 10} y={Math.floor(k / 20) * 10} width={10.2} height={10.2} fill={pixel(k % 20, Math.floor(k / 20))} />)}</g>;
const Neon = () => (
	<>
		<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
		<rect width={200} height={200} fill="#0A0614" />
		<g stroke="#7B3CFF" strokeWidth={0.6} opacity={0.7}>
			{Array.from({length: 7}, (_, i) => <line key={i} x1={0} x2={200} y1={172 + i * i * 0.9} y2={172 + i * i * 0.9} />)}
			{Array.from({length: 11}, (_, i) => <line key={`v${i}`} x1={100} y1={172} x2={-150 + i * 50} y2={215} />)}
		</g>
		<g filter="url(#glow)"><HouseLines s="#FF2E7E" w={2.2} win="#00D4FF" /><line x1={10} x2={190} y1={171} y2={171} stroke="#00D4FF" strokeWidth={1.4} /></g>
	</>
);
const Blueprint = () => (
	<>
		<rect width={200} height={200} fill="#0D3B8C" />
		<g stroke="#FFFFFF" strokeWidth={0.3} opacity={0.25}>{Array.from({length: 21}, (_, i) => <React.Fragment key={i}><line x1={i * 10} x2={i * 10} y1={0} y2={200} /><line y1={i * 10} y2={i * 10} x1={0} x2={200} /></React.Fragment>)}</g>
		<HouseLines s="#FFFFFF" w={1} />
		<g stroke="#FFFFFF" strokeWidth={0.6} fill="#FFFFFF" fontFamily={F.mono} fontSize={7}>
			<line x1={50} x2={150} y1={182} y2={182} /><line x1={50} x2={50} y1={178} y2={186} /><line x1={150} x2={150} y1={178} y2={186} />
			<text x={100} y={192} textAnchor="middle" stroke="none">8 400</text>
			<line x1={28} x2={28} y1={40} y2={170} /><line x1={24} x2={32} y1={40} y2={40} /><line x1={24} x2={32} y1={170} y2={170} />
			<text x={20} y={108} textAnchor="middle" stroke="none" transform="rotate(-90 20 108)">6 200</text>
			<rect x={148} y={8} width={44} height={18} fill="none" /><text x={170} y={20} textAnchor="middle" stroke="none" fontSize={6}>HOUSE A-01</text>
		</g>
	</>
);
const Sketch = () => (
	<>
		<defs>
			<filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={3} /><feDisplacementMap in="SourceGraphic" scale={3.2} /></filter>
			<clipPath id="roof"><polygon points="40,95 100,40 160,95" /></clipPath>
		</defs>
		<rect width={200} height={200} fill="#F4F1EA" />
		<g filter="url(#pencil)">
			<HouseLines s="#3A3A3A" w={1.3} />
			<g transform="translate(0.9 0.6)" opacity={0.45}><HouseLines s="#3A3A3A" w={0.9} /></g>
			<g clipPath="url(#roof)" stroke="#555" strokeWidth={0.6}>{Array.from({length: 30}, (_, i) => <line key={i} x1={30 + i * 5} y1={100} x2={60 + i * 5} y2={30} />)}</g>
			<g stroke="#555" strokeWidth={0.5}>{Array.from({length: 12}, (_, i) => <line key={i} x1={150 - i * 2} y1={170} x2={150} y2={95 + i * 6} opacity={0.6} />)}</g>
			<path d="M10 171 Q 60 168 100 172 T 190 170" fill="none" stroke="#3A3A3A" strokeWidth={1} />
		</g>
	</>
);
const Tiny: React.FC<{bare?: boolean}> = ({bare}) => (
	<>
		<rect width={200} height={200} fill="#F6E7D2" />
		<rect y={160} width={200} height={40} fill="#C89B6D" />
		<ellipse cx={95} cy={162} rx={78} ry={12} fill="#EEE6DA" stroke="#D9C7B0" />
		<path d="M150 85 q 30 5 22 35 q -6 22 -26 18" fill="none" stroke="#FFFFFF" strokeWidth={9} />
		<path d="M45 62 L145 62 L140 145 Q 95 165 50 145 Z" fill="#FFFFFF" stroke="#D9C7B0" />
		<ellipse cx={95} cy={63} rx={50} ry={9} fill="#6B4226" />
		<g stroke="#C9B49A" strokeWidth={2} fill="none" opacity={0.8}><path d="M80 50 q -6 -10 0 -20 q 6 -10 0 -20" /><path d="M105 50 q -6 -10 0 -20 q 6 -10 0 -20" /></g>
		{bare ? null : <>{/* драбинка й крихітні люди */}
		<g stroke="#333" strokeWidth={0.9} strokeLinecap="round"><line x1={30} y1={158} x2={46} y2={100} /><line x1={38} y1={159} x2={52} y2={102} />{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={32 + i * 3.2} y1={150 - i * 11} x2={40 + i * 3} y2={151 - i * 11} />)}</g>
		{[[42, 124], [20, 168], [168, 170], [180, 172]].map(([x, y], i) => (
			<g key={i} stroke={['#E74C3C', '#2980B9', '#27AE60', '#8E44AD'][i]} strokeWidth={2} strokeLinecap="round"><circle cx={x} cy={y - 11} r={2.4} fill="#222" stroke="none" /><line x1={x} y1={y - 8} x2={x} y2={y - 1} /><line x1={x - 3} y1={y - 6} x2={x + 3} y2={y - 6} /><line x1={x} y1={y - 1} x2={x - 2.5} y2={y + 4} /><line x1={x} y1={y - 1} x2={x + 2.5} y2={y + 4} /></g>
		))}</>}
	</>
);

// ---------- 3D (обертання від кадру) ----------
const Wire: React.FC<{s: number}> = ({s}) => {
	const th = 0.5 + s * 0.9;
	const ph = 0.38;
	const vis = new Set(solid(FACES, th, ph).map((x) => x.f));
	return (
		<>
			<rect width={200} height={200} fill="#05080A" />
			<g stroke="#D9FF3A" strokeWidth={0.35} opacity={0.25}>
				{Array.from({length: 9}, (_, i) => -2 + i * 0.5).flatMap((u) => [
					<polyline key={`a${u}`} fill="none" points={pts([[u, -1, -2], [u, -1, 2]], th, ph)} />,
					<polyline key={`b${u}`} fill="none" points={pts([[-2, -1, u], [2, -1, u]], th, ph)} />,
				])}
			</g>
			{FACES.map((f, i) => <polygon key={i} points={pts(f.v, th, ph)} fill="none" stroke="#D9FF3A" strokeWidth={vis.has(f) ? 1.8 : 0.8} opacity={vis.has(f) ? 1 : 0.45} strokeLinejoin="round" />)}
			{P.map((p, i) => { const [x, y] = scr(p, th, ph); return <circle key={i} cx={x} cy={y} r={2.2} fill="#FFFFFF" />; })}
		</>
	);
};
const Iso: React.FC<{s: number}> = ({s}) => {
	const th = Math.PI / 4 - 0.5 * (1 - ramp(s, 0, 1.2));
	const ph = 0.615;
	return (
		<>
			<rect width={200} height={200} fill="#EDE7F6" />
			<polygon points={pts([[-1.9, -1, -1.6], [1.9, -1, -1.6], [1.9, -1, 1.6], [-1.9, -1, 1.6]], th, ph)} fill="#9CCC65" stroke="#7CB342" />
			{solid(FACES, th, ph).map(({f, lit}, i) => <polygon key={i} points={pts(f.v, th, ph)} fill={shade(f.c, lit)} stroke={shade(f.c, 0.55)} strokeWidth={0.6} strokeLinejoin="round" />)}
		</>
	);
};
// low poly: грані розбиті на трикутники віялом, відтінок кожного — сидований
const TRIS: Face[] = FACES.filter((f) => !f.detail).flatMap((f) => f.v.slice(1, -1).map((_, k) => ({v: [f.v[0], f.v[k + 1], f.v[k + 2]], c: f.c === ROOF ? '#D9663F' : '#E9C89A'}))).map((f, i) => ({...f, c: shade(f.c, 0.88 + random(`t${i}`) * 0.24)}));
const Low: React.FC<{s: number}> = ({s}) => {
	const th = -0.6 + s * 0.45;
	const ph = 0.3;
	return (
		<>
			<defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B1B4A" /><stop offset="1" stopColor="#F28B66" /></linearGradient></defs>
			<rect width={200} height={200} fill="url(#dusk)" />
			{[[-20, 150, 40, 70, 100, 150, '#3B2A5C'], [60, 150, 130, 60, 210, 150, '#4A3570'], [120, 150, 170, 95, 230, 150, '#5A4080']].map(([a, b, c, d, e, g, col], i) => <polygon key={i} points={`${a},${b} ${c},${d} ${e},${g}`} fill={col as string} />)}
			<rect y={148} width={200} height={52} fill="#3E7D4F" />
			{Array.from({length: 10}, (_, i) => <polygon key={i} points={`${i * 22 - 10},200 ${i * 22 + 6},${150 + random(`g${i}`) * 8} ${i * 22 + 24},200`} fill={shade('#4E9A5F', 0.8 + random(`h${i}`) * 0.4)} />)}
			{solid(TRIS, th, ph).map(({f, lit}, i) => <polygon key={i} points={pts(f.v, th, ph)} fill={shade(f.c, lit)} stroke={shade(f.c, lit * 0.95)} strokeWidth={0.3} />)}
		</>
	);
};

const STYLE: Record<string, React.FC<{s: number}>> = {
	'/TINYHUMANS': () => <Tiny />, '/PIXELART': Pixel, '/BLUEPRINT': Blueprint, '/NEON': Neon, '/WIREFRAME': Wire, '/ISOMETRIC': Iso, '/SKETCH': Sketch, '/LOWPOLY': Low,
};

/** Панель 760×760: «звичайна» картинка, яку скан-лінія (a+0.5…a+1.2) перефарбовує у стиль коду. */
export const StylePanel: React.FC<{t: number; a: number; code: string; y: number; accent: string}> = ({t, a, code, y, accent}) => {
	const Styled = STYLE[code];
	if (!Styled) throw new Error(`StylePanel: немає стилю ${code}`);
	const w = ramp(t, a + 0.5, a + 1.2) * 100;
	const size = 760;
	const svg = (el: React.ReactNode) => <svg viewBox="0 0 200 200" width={size} height={size} style={{position: 'absolute', inset: 0}}>{el}</svg>;
	return (
		<div style={{position: 'absolute', left: (1080 - size) / 2, top: y, width: size, height: size, borderRadius: 40, overflow: 'hidden', boxShadow: '0 50px 120px #000000B0', border: '3px solid #FFFFFF26'}}>
			{svg(code === '/TINYHUMANS' ? <Tiny bare /> : <Flat />)}
			<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - w}% 0 0)`}}>{svg(<Styled s={Math.max(0, t - a)} />)}</div>
			{w > 0 && w < 100 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${w}%`, width: 6, marginLeft: -3, background: '#FFFFFF', boxShadow: `0 0 30px 10px ${accent}`}} /> : null}
			<div style={{position: 'absolute', left: 24, top: 24, padding: '10px 20px', borderRadius: 999, background: '#000000A6', color: '#FFFFFF', fontFamily: F.mono, fontSize: 28}}>{w >= 100 ? 'схема стилю' : 'звичайна картинка'}</div>
		</div>
	);
};
