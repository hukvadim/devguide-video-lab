import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, F} from '../system/kit';

// Банер сторінки «Навчання»: 1920x640, 6 с, без звуку, безшовний луп (усе періодичне по N кадрах).
export const LEARN_BANNER = 180;
const N = LEARN_BANNER;
const W = 1920, H = 640, CELL = 64;
export const TAU = Math.PI * 2;
export const frac = (x: number) => x - Math.floor(x);
export const lime = (a: number) => `rgba(195,255,85,${a})`;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export type Icon = 'code' | 'play' | 'star' | 'chat';
const PATHS: Record<Icon, string[]> = {
	code: ['M31 33 L15 50 L31 67', 'M69 33 L85 50 L69 67', 'M58 27 L42 73'],
	play: ['M37 29 L72 50 L37 71 Z'],
	star: ['M50 17 Q54 46 83 50 Q54 54 50 83 Q46 54 17 50 Q46 46 50 17 Z'],
	chat: ['M24 30 Q24 22 32 22 L68 22 Q76 22 76 30 L76 56 Q76 64 68 64 L46 64 L32 77 L33 64 L32 64 Q24 64 24 56 Z', 'M37 43 L39 43', 'M49 43 L51 43', 'M61 43 L63 43'],
};

export const Grid: React.FC<{alpha?: number}> = ({alpha = 0.07}) => (
	<AbsoluteFill
		style={{
			backgroundImage: `linear-gradient(rgba(255,255,255,${alpha}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${alpha}) 1px, transparent 1px)`,
			backgroundSize: `${CELL}px ${CELL}px`,
			backgroundPosition: '-1px -1px',
		}}
	/>
);

const Glow: React.FC<{g: number}> = ({g}) => (
	<>
		<AbsoluteFill style={{background: `radial-gradient(700px 520px at 1640px 260px, ${lime(0.1 + 0.06 * g)}, transparent 70%)`}} />
		<AbsoluteFill style={{background: `radial-gradient(420px 360px at 1920px 640px, ${lime(0.18 + 0.08 * g)}, transparent 70%)`}} />
		{/* затемнення зліва під текст */}
		<AbsoluteFill style={{background: `linear-gradient(90deg, ${C.bg}CC 0%, ${C.bg}66 45%, transparent 65%)`}} />
	</>
);

const Title: React.FC<{glow?: number}> = ({glow = 0.5}) => (
	<div style={{position: 'absolute', left: 104, top: 0, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 90, lineHeight: 1.12, letterSpacing: -2}}>
		<div style={{color: C.text}}>Що хочеш вивчити</div>
		<div style={{color: C.lime, textShadow: `0 0 ${18 + 22 * glow}px ${lime(0.25 + 0.2 * glow)}`}}>сьогодні?</div>
	</div>
);

/** Скляна плитка з неоновою іконкою. draw 0..1 — скільки обведено штрихом. */
export const Tile: React.FC<{rgb?: string; x: number; y: number; size: number; icon: Icon; g?: number; rot?: number; rx?: number; ry?: number; draw?: number; ghost?: boolean; z?: number; opacity?: number; blur?: number}> = ({
	rgb = '195,255,85', x, y, size, icon, g = 0.5, rot = 0, rx = 0, ry = 0, draw = 1, ghost = false, z, opacity = 1, blur = 0,
}) => {
	const lime = (a: number) => `rgba(${rgb},${a})`;
	return (
	<div
		style={{
			position: 'absolute', left: x - size / 2, top: y - size * 0.45, width: size, height: size * 0.9, zIndex: z, opacity,
			borderRadius: size * 0.17,
			transform: `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) rotate(${rot}deg)`,
			filter: blur ? `blur(${blur}px)` : undefined,
			...(ghost
				? {border: `2px solid ${lime(0.14)}`, background: `linear-gradient(150deg, ${lime(0.05)}, transparent 60%)`}
				: {
						border: `2px solid ${lime(0.45 + 0.4 * g)}`,
						background: `linear-gradient(150deg, ${lime(0.22)} 0%, rgba(24,32,22,0.92) 38%, rgba(9,12,14,0.96) 100%)`,
						boxShadow: `0 0 ${24 + 40 * g}px ${lime(0.18 + 0.3 * g)}, inset 0 0 ${18 + 20 * g}px ${lime(0.12 + 0.12 * g)}, inset 0 2px 0 rgba(255,255,255,0.18), 0 ${size * 0.12}px ${size * 0.25}px rgba(0,0,0,0.7)`,
					}),
		}}
	>
		{ghost ? null : (
			<svg viewBox="0 0 100 100" style={{position: 'absolute', left: '18%', top: '13%', width: '64%', height: '74%', overflow: 'visible', filter: `drop-shadow(0 0 ${6 + 10 * g}px ${lime(0.8)})`}}>
				{PATHS[icon].map((d, i) => (
					<path key={i} d={d} pathLength={1} fill="none" stroke={`rgb(${rgb})`} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - draw} />
				))}
			</svg>
		)}
	</div>
	);
};

const GHOSTS = [
	{x: 1360, y: 110, s: 210, r: -10},
	{x: 1880, y: 120, s: 230, r: 12},
	{x: 1880, y: 400, s: 200, r: -8},
	{x: 1330, y: 590, s: 220, r: 8},
	{x: 1700, y: 610, s: 180, r: -14},
];

const MAIN: {x: number; y: number; size: number; icon: Icon; rot: number; k: number}[] = [
	{x: 1590, y: 220, size: 300, icon: 'code', rot: 6, k: 0},
	{x: 1400, y: 450, size: 230, icon: 'play', rot: -6, k: 2.1},
	{x: 1800, y: 450, size: 160, icon: 'star', rot: 8, k: 4.2},
];

const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

/* ── 1. Pulse Grid: діагональна хвиля підсвічених клітинок, плитки левітують ── */
export const LearnBannerPulse: React.FC = () => {
	const f = useCurrentFrame();
	const ph = (f / N) * TAU;
	const cols = W / CELL, rows = H / CELL, P = 46;
	const cells: React.ReactNode[] = [];
	for (let r = 0; r < rows; r++)
		for (let c = 0; c < cols; c++) {
			const t = frac((c + r * 0.7) / P - f / N);
			const dist = Math.min(t, 1 - t) * P;
			const v = Math.exp(-(dist * dist) / 5) * (0.35 + 0.65 * clamp01((c * CELL - 300) / 1000)) * (0.6 + 0.4 * random(`p${c}-${r}`));
			if (v < 0.03) continue;
			cells.push(<div key={`${c}-${r}`} style={{position: 'absolute', left: c * CELL, top: r * CELL, width: CELL, height: CELL, background: lime(0.13 * v), boxShadow: `inset 0 0 0 1px ${lime(0.35 * v)}`}} />);
		}
	const g = 0.5 + 0.5 * Math.sin(ph);
	return (
		<Frame>
			<Grid />
			{cells}
			<Glow g={g} />
			{GHOSTS.map((t, i) => <Tile key={i} ghost x={t.x} y={t.y + Math.sin(ph + i) * 6} size={t.s} icon="code" rot={t.r} />)}
			{MAIN.map((t) => (
				<Tile key={t.icon} x={t.x} y={t.y + Math.sin(ph + t.k) * 12} size={t.size} icon={t.icon} rot={t.rot + Math.sin(ph + t.k + 1) * 2.5} rx={8} ry={-10 + Math.cos(ph + t.k) * 4} g={0.5 + 0.5 * Math.sin(ph + t.k)} />
			))}
			<Title glow={g} />
		</Frame>
	);
};

/* ── 2. Orbit: плитки обертаються по 3D-еліпсу навколо світлового ядра, промені й іскри ── */
export const LearnBannerOrbit: React.FC = () => {
	const f = useCurrentFrame();
	const ph = (f / N) * TAU;
	const cx = 1555, cy = 320, RX = 225, RY = 95;
	const g = 0.5 + 0.5 * Math.sin(ph * 2);
	const sparks = Array.from({length: 46}, (_, i) => {
		const a = random(`a${i}`) * TAU;
		const p = frac(random(`s${i}`) + f / N);
		const r = 40 + p * (380 + random(`r${i}`) * 260);
		const x = cx + Math.cos(a) * r * 1.25, y = cy + Math.sin(a) * r * 0.7;
		const s = 2 + random(`z${i}`) * 4;
		const o = Math.sin(p * Math.PI) * clamp01((x - 1150) / 200);
		return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: C.lime, opacity: o, boxShadow: `0 0 ${s * 3}px ${C.lime}`}} />;
	});
	const tiles = MAIN.map((t, i) => {
		const th = ph + (i * TAU) / 3 + Math.PI / 2; // кадр 0: </> спереду
		const depth = Math.sin(th); // 1 = спереду
		const sc = 0.78 + 0.22 * depth;
		const base = [270, 220, 200][i];
		return (
			<Tile key={t.icon} x={cx + Math.cos(th) * RX} y={cy + Math.sin(th) * RY} size={base * sc} icon={t.icon} z={Math.round(depth * 10) + 20}
				ry={-Math.cos(th) * 28} rx={10} rot={Math.cos(th) * -4} g={0.35 + 0.65 * clamp01(depth)} opacity={0.55 + 0.45 * clamp01(depth + 0.6)} blur={depth < -0.3 ? 2 : 0} />
		);
	});
	return (
		<Frame>
			<Grid />
			{/* промені: 12 штук, за цикл повертаються на 30° (луп) */}
			<AbsoluteFill
				style={{
					background: `repeating-conic-gradient(from ${(f / N) * 30}deg at ${cx}px ${cy}px, ${lime(0.09)} 0deg, transparent 6deg, transparent 30deg)`,
					maskImage: `radial-gradient(620px 420px at ${cx}px ${cy}px, black 10%, transparent 75%)`,
					WebkitMaskImage: `radial-gradient(620px 420px at ${cx}px ${cy}px, black 10%, transparent 75%)`,
				}}
			/>
			<Glow g={g} />
			<AbsoluteFill style={{background: `radial-gradient(${150 + 40 * g}px ${110 + 30 * g}px at ${cx}px ${cy}px, ${lime(0.55)}, ${lime(0.12)} 45%, transparent 75%)`}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<ellipse cx={cx} cy={cy} rx={RX} ry={RY} fill="none" stroke={lime(0.35)} strokeWidth={2} strokeDasharray="10 14" strokeDashoffset={-(f / N) * 24 * 4} />
				<ellipse cx={cx} cy={cy} rx={RX + 90} ry={RY + 50} fill="none" stroke={lime(0.12)} strokeWidth={1.5} />
			</svg>
			{sparks}
			{tiles}
			<Title glow={g} />
		</Frame>
	);
};

/* ── 3. Code Scan: символи коду спалахують у клітинках, лазер сканує банер і перемальовує іконки ── */
const GLYPHS = ['<', '>', '/', '{', '}', ';', '=', '(', ')', '*'];
export const LearnBannerCode: React.FC = () => {
	const f = useCurrentFrame();
	const ph = (f / N) * TAU;
	const beam = frac(f / N) * (W + 500) - 250; // кадр 0: промінь за кадром, постер чистий
	const cols = W / CELL, rows = H / CELL;
	const glyphs: React.ReactNode[] = [];
	for (let r = 0; r < rows; r++)
		for (let c = 0; c < cols; c++) {
			if (random(`g${c}-${r}`) > 0.42) continue;
			const x = c * CELL + CELL / 2;
			const t = frac(f / N - random(`t${c}-${r}`));
			const d = Math.min(t, 1 - t) * N; // кадрів до спалаху
			const near = Math.exp(-(((x - beam) / 90) ** 2));
			const v = Math.max(Math.exp(-((d / 7) ** 2)), near) * (x < 1250 ? 0.35 : 1);
			glyphs.push(
				<div key={`${c}-${r}`} style={{position: 'absolute', left: c * CELL, top: r * CELL, width: CELL, height: CELL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontWeight: 500, fontSize: 24, color: lime(0.05 + 0.65 * v), textShadow: v > 0.2 ? `0 0 ${10 * v}px ${C.lime}` : undefined}}>
					{GLYPHS[Math.floor(random(`c${c}-${r}`) * GLYPHS.length)]}
				</div>,
			);
		}
	const mask = `linear-gradient(90deg, transparent ${beam - 220}px, black ${beam}px, transparent ${beam + 120}px)`;
	return (
		<Frame>
			<Grid />
			{glyphs}
			{/* сітка підсвічується слідом за променем */}
			<AbsoluteFill style={{maskImage: mask, WebkitMaskImage: mask}}>
				<Grid alpha={0.35} />
				<AbsoluteFill style={{background: lime(0.05)}} />
			</AbsoluteFill>
			<Glow g={0.5 + 0.5 * Math.sin(ph)} />
			{GHOSTS.map((t, i) => <Tile key={i} ghost x={t.x} y={t.y} size={t.s} icon="code" rot={t.r} />)}
			{MAIN.map((t) => {
				const left = t.x - t.size / 2;
				const hit = Math.exp(-(((t.x - beam) / 140) ** 2));
				const draw = beam < left ? 1 : clamp01((beam - left) / t.size);
				return <Tile key={t.icon} x={t.x} y={t.y + Math.sin(ph + t.k) * 8} size={t.size} icon={t.icon} rot={t.rot} rx={8} ry={-10} g={0.4 + 0.6 * hit} draw={draw} />;
			})}
			{/* лазер */}
			<div style={{position: 'absolute', left: beam - 90, top: 0, width: 180, height: H, background: `linear-gradient(90deg, transparent, ${lime(0.14)} 50%, transparent)`, opacity: beam > 1150 ? 1 : clamp01((beam - 900) / 250) * 0.6 + 0.4}} />
			<div style={{position: 'absolute', left: beam - 1.5, top: 0, width: 3, height: H, background: C.lime, boxShadow: `0 0 18px ${C.lime}, 0 0 50px ${lime(0.6)}`}} />
			<Title glow={0.5 + 0.5 * Math.sin(ph)} />
		</Frame>
	);
};
