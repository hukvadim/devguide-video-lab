import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {F, Wordmark, ramp} from '../system/kit';
import {Big, Box, L, pop, useTheme} from '../system/step';
import {Poster} from '../system/beat';

// «Візуальні корисності» (Vis-01…04, docs/FORMAT_LAB.md): правило — одна картинка на картку + до 6 слів.
// Тут спільні мокапи: телефон, вигаданий постер фільму, пігулки, інтро й фінал.

/** Рамка телефона; screen — фон екрана. Вміст позиціонується всередині екрана (0,0 — лівий верх). */
export const Phone: React.FC<{x?: number; y: number; w?: number; h?: number; screen?: string; o?: number; rot?: number; scale?: number; children?: React.ReactNode}> = ({x, y, w = 600, h = 1180, screen = '#0E0E14', o = 1, rot = 0, scale = 1, children}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: x ?? (1080 - w) / 2, top: y, width: w, height: h, opacity: o, transform: `rotate(${rot}deg) scale(${scale})`, borderRadius: w * 0.15, background: '#07070B', padding: 16, boxSizing: 'border-box', boxShadow: `0 70px 140px #000000B0, 0 0 0 3px #FFFFFF1A, 0 0 120px ${T.glow}26`}}>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.13, overflow: 'hidden', background: screen}}>
				{children}
				<div style={{position: 'absolute', left: '50%', top: 16, width: 150, height: 40, marginLeft: -75, borderRadius: 20, background: '#000'}} />
			</div>
		</div>
	);
};
/** Рядок статусу телефона (9:41 + індикатори). */
export const StatusBar: React.FC<{c?: string}> = ({c = '#FFFFFF'}) => (
	<div style={{position: 'absolute', left: 40, right: 40, top: 22, display: 'flex', justifyContent: 'space-between', fontFamily: F.body, fontWeight: 700, fontSize: 26, color: c}}>
		<span>9:41</span>
		<span style={{display: 'flex', gap: 8, alignItems: 'center'}}><span style={{width: 30, height: 14, borderRadius: 4, border: `2px solid ${c}`, boxSizing: 'border-box', padding: 2}}><span style={{display: 'block', width: '70%', height: '100%', background: c, borderRadius: 1}} /></span></span>
	</div>
);

// вигадані фільми (жодних реальних назв і постерів)
export const MOVIES = [
	{title: 'Неон над Дніпром', genre: 'Фантастика', rating: '8.4', hue: [280, 330]},
	{title: 'Тиха гавань', genre: 'Драма', rating: '7.9', hue: [190, 220]},
	{title: 'Кіт у космосі', genre: 'Комедія', rating: '8.1', hue: [30, 50]},
	{title: 'Остання хвиля', genre: 'Пригоди', rating: '7.6', hue: [170, 200]},
	{title: 'Код зорі', genre: 'Фантастика', rating: '8.8', hue: [240, 290]},
	{title: 'Пісок і сіль', genre: 'Драма', rating: '7.2', hue: [10, 40]},
];
/** Процедурний постер: градієнт, «сонце», силует гір/міста, назва. */
export const MoviePoster: React.FC<{i: number; w: number; h: number; title?: boolean; radius?: number}> = ({i, w, h, title = true, radius = 20}) => {
	const m = MOVIES[i % MOVIES.length];
	const [h1, h2] = m.hue;
	const sun = 0.3 + random(`sun${i}`) * 0.3;
	return (
		<div style={{position: 'relative', width: w, height: h, borderRadius: radius, overflow: 'hidden', background: `linear-gradient(170deg, hsl(${h1} 70% 22%), hsl(${h2} 80% 55%))`, flex: 'none'}}>
			<div style={{position: 'absolute', left: w * sun, top: h * 0.28, width: w * 0.42, height: w * 0.42, marginLeft: -w * 0.21, borderRadius: '50%', background: `hsl(${h2 + 20} 95% 72%)`, boxShadow: `0 0 ${w * 0.3}px hsl(${h2} 95% 65%)`}} />
			<svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: '45%'}}>
				<polygon points={`0,60 0,${30 + random(`a${i}`) * 15} 20,${20 + random(`b${i}`) * 15} 38,${35 + random(`c${i}`) * 10} 60,${15 + random(`d${i}`) * 15} 80,${30 + random(`e${i}`) * 10} 100,${22 + random(`f${i}`) * 15} 100,60`} fill={`hsl(${h1} 60% 10%)`} />
			</svg>
			{title ? <div style={{position: 'absolute', left: w * 0.08, right: w * 0.08, bottom: h * 0.07, fontFamily: F.display, fontWeight: 900, fontSize: Math.max(16, w * 0.11), lineHeight: 1.05, color: '#FFFFFF', textShadow: '0 4px 20px #00000080'}}>{m.title}</div> : null}
		</div>
	);
};

export const Chip: React.FC<{on?: boolean; children: React.ReactNode; size?: number; c?: string}> = ({on, children, size = 26, c}) => {
	const T = useTheme();
	const ac = c ?? T.accent;
	return <span style={{display: 'inline-block', padding: `${size * 0.4}px ${size * 0.8}px`, borderRadius: 999, background: on ? ac : '#FFFFFF14', color: on ? '#0A0A0F' : '#FFFFFFCC', fontFamily: F.body, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap'}}>{children}</span>;
};

/** Ряд пігулок «що прокачаєш» під мокапом. */
export const Skills: React.FC<{t: number; a: number; y: number; items: string[]}> = ({t, a, y, items}) => {
	const T = useTheme();
	return (
		<Box y={y} style={{display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap'}}>
			{items.map((s, k) => {
				const p = pop(t, a + 0.6 + k * 0.15, 0.3);
				return <span key={s} style={{opacity: p, transform: `translateY(${(1 - p) * 20}px)`, display: 'inline-block', padding: '14px 26px', borderRadius: 999, border: `2px solid ${T.accent}`, color: T.accent, background: `${T.bg}CC`, fontFamily: F.body, fontWeight: 800, fontSize: 36}}>{s}</span>;
			})}
		</Box>
	);
};

/** Заголовок картки: номер + назва (до 3 слів). */
export const CardHead: React.FC<{t: number; a: number; n?: string; title: React.ReactNode; y?: number; size?: number}> = ({t, a, n, title, y = 190, size = 92}) => {
	const T = useTheme();
	const p = pop(t, a, 0.25);
	return (
		<Box y={y} o={p}>
			{n ? <div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 5, color: T.accent, marginBottom: 10}}>{n}</div> : null}
			<div style={{transform: `scale(${1.1 - 0.1 * p})`}}><Big size={size} style={{lineHeight: 1.05}}>{title}</Big></div>
		</Box>
	);
};

/** Постер-інтро (кадр 0 = обкладинка) з наліпкою «збережи». */
export const Intro: React.FC<{t: number; a: number; kicker: string; l1: string; l2: string; sub?: React.ReactNode; size?: number; children?: React.ReactNode}> = ({t, a, kicker, l1, l2, sub, size = 112, children}) => {
	const T = useTheme();
	return (
		<>
			{children}
			<Poster t={t} a={a} kicker={kicker} size={size} sub={sub}>{l1}<br /><L>{l2}</L></Poster>
			<div style={{position: 'absolute', left: 660, top: 300, opacity: pop(t, a + 0.3, 0.3), transform: `rotate(${8 + (1 - pop(t, a + 0.3, 0.3)) * 20}deg)`}}>
				<span style={{display: 'inline-block', padding: '16px 30px', borderRadius: 999, background: T.accent, color: T.onAccent, fontFamily: F.body, fontWeight: 800, fontSize: 38}}>✦ збережи</span>
			</div>
		</>
	);
};

/** Фінал: велике «Збережи» + питання в коментарі + DevGuide. */
export const Outro: React.FC<{t: number; a: number; ask: React.ReactNode}> = ({t, a, ask}) => {
	const T = useTheme();
	const slam = pop(t, a + 0.2, 0.45);
	return (
		<AbsoluteFill>
			<Box y={420}>
				<span style={{display: 'inline-block', padding: '34px 70px', borderRadius: 44, background: T.accent, transform: `scale(${1.5 - 0.5 * slam}) rotate(${-3 * slam}deg)`, opacity: slam, boxShadow: `0 40px 100px ${T.accent}55`}}>
					<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 120, color: T.onAccent}}>Збережи</span>
				</span>
			</Box>
			<Box y={760} o={pop(t, a + 0.7, 0.35)}><div style={{fontFamily: F.body, fontWeight: 800, fontSize: 56, lineHeight: 1.3}}>{ask}</div></Box>
			<Box y={1300} o={pop(t, a + 1.2, 0.4)}><Wordmark size={88} /></Box>
		</AbsoluteFill>
	);
};

/** Поява 0..1 від a за len, з виходом до b (для елементів усередині екранів). */
export const show = (t: number, a: number, len = 0.3) => ramp(t, a, a + len);
