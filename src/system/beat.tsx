import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {F, Sfx, Stage, clamp} from './kit';
import {ThemeProvider, useTheme} from './theme';
import {Big, PatternBg, S, pop} from './step';
import BEATS from '../../public/assets/music/beats.json';

// Ролики без голосу в ритм музики (лаб. 15–20, 24; серія «Секретні коди» src/tips). Картка триває N бітів треку.
// Музика поки з кандидатів (public/assets/music/_кандидати); після вибору Вадима шляхи міняються на public/assets/music/<файл>.
export const M = (f: string) => `assets/music/${f}`;
export const beat = (f: string) => (BEATS as Record<string, {bpm: number; offset: number}>)[f];

// off — зсув звуку картки від її початку, с (звук на подію всередині картки, а не на склейку)
export type Card = {beats: number; sfx?: string; vol?: number; off?: number; theme?: string; el: (t: number, a: number, b: number) => React.ReactNode};
const total = (cards: Card[]) => cards.reduce((s, c) => s + c.beats, 0);
export const beatFrames = (track: string, cards: Card[]) => S((total(cards) * 60) / beat(track).bpm);

/** cover — секунда, яку показати на кадрі 0 (обкладинка Instagram); типово — проявлена перша картка. */
export const BeatVideo: React.FC<{theme: string; track: string; cards: Card[]; vol?: number; cover?: number}> = ({theme, track, cards, vol = 0.55, cover}) => {
	const frame = useCurrentFrame();
	const {bpm, offset} = beat(track);
	const b = 60 / bpm;
	// кадр 0 = обкладинка (Instagram): перша картка вже проявлена, а не порожній фон
	const t = frame === 0 ? cover ?? Math.min(1, cards[0].beats * b - 0.05) : frame / 30;
	const end = total(cards) * b;
	let acc = 0;
	const spans = cards.map((c) => { const a = acc * b; acc += c.beats; return {c, a, z: acc * b}; });
	return (
		<ThemeProvider theme={theme}>
			<Stage glow={[760, 420]} grid>
				<PatternBg t={t} />
				<Audio src={staticFile(M(track))} trimBefore={S(offset)} volume={(f) => interpolate(f, [0, 6, S(end - 1.5), S(end)], [0, vol, vol, 0], clamp)} />
				{/* звук лише там, де картка його явно просить (+ удар на старті); без whoosh на кожну склейку — повтор дратує */}
				{spans.map(({c, a}, i) => (c.sfx || !i ? <Sfx key={i} at={S(a + (c.off ?? 0))} src={c.sfx ?? 'impact/impact-cine-big.mp3'} vol={c.vol ?? 0.22} dur={45} /> : null))}
				{spans.filter(({a, z}) => t >= a && t < z).map(({c, a, z}, i) => (
					<AbsoluteFill key={i}>{c.theme ? <ThemeProvider theme={c.theme}><Stage glow={[760, 420]}><PatternBg t={t} />{c.el(t, a, z)}</Stage></ThemeProvider> : c.el(t, a, z)}</AbsoluteFill>
				))}
			</Stage>
		</ThemeProvider>
	);
};

/** Постер: малий надпис + великий заголовок по центру, удар-поява на біт. */
export const Poster: React.FC<{t: number; a: number; kicker?: string; size?: number; children: React.ReactNode; sub?: React.ReactNode}> = ({t, a, kicker, size = 120, children, sub}) => {
	const T = useTheme();
	const p = pop(t, a, 0.22);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 84px', textAlign: 'center'}}>
			{kicker ? <div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 5, color: T.accent, textTransform: 'uppercase', marginBottom: 40, opacity: p}}>{kicker}</div> : null}
			<div style={{transform: `scale(${1.25 - p * 0.25})`, opacity: p}}><Big size={size}>{children}</Big></div>
			{sub ? <div style={{marginTop: 50, fontFamily: F.body, fontWeight: 700, fontSize: 48, lineHeight: 1.3, color: T.dim, opacity: pop(t, a + 0.25, 0.3)}}>{sub}</div> : null}
		</AbsoluteFill>
	);
};

/** Одне слово на весь екран; inv — акцентна заливка. Лише для коротких гасел (див. пам'ять kinetic-word-look). */
export const Word1: React.FC<{t: number; a: number; w: string; inv?: boolean}> = ({t, a, w, inv}) => {
	const T = useTheme();
	const p = pop(t, a, 0.15);
	return (
		<AbsoluteFill style={{background: inv ? T.accent : 'transparent', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{transform: `scale(${0.85 + p * 0.15})`}}><Big size={Math.min(230, Math.floor(1000 / Math.max(4, w.length)))} style={{color: inv ? T.onAccent : T.text, textTransform: 'uppercase', letterSpacing: -4, textAlign: 'center'}}>{w}</Big></div>
		</AbsoluteFill>
	);
};
