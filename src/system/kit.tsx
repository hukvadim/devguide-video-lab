import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import brand from '../../data/brand.json';
import {useTheme} from './theme';

// DevGuide production kit: tokens, background, SFX helpers. Shared by A/B/C/Final.
// @fontsource faces are plain CSS; block the first frame until the faces we use are decoded.
if (typeof document !== 'undefined') {
	const handle = delayRender('DevGuide fonts');
	Promise.all(
		['900 100px Unbounded', '700 100px Unbounded', '800 100px Inter', '600 100px Inter', '400 100px Inter', "500 100px 'JetBrains Mono'"].map((s) =>
			document.fonts.load(s, 'ІДЕЯ ідея AZ'),
		),
	).then(() => continueRender(handle), () => continueRender(handle));
}

export const C = {
	bg: brand.palette.background,
	panel: '#10161C',
	panel2: '#161E26',
	line: '#FFFFFF1F',
	text: brand.palette.text,
	dim: '#8A97A3',
	lime: brand.palette.accent,
	limeDeep: '#7FB52A',
	blue: '#8EDFFF',
	red: '#FF6B5E',
};
export const F = {
	display: 'Unbounded, Inter, Arial, sans-serif',
	body: 'Inter, Arial, sans-serif',
	mono: "'JetBrains Mono', Consolas, monospace",
};
// Working safe area from AGENTS.md: x=84..940, y=180..1650.
export const SAFE = {left: 84, right: 1080 - 940, top: 180, bottom: 1920 - 1650};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1); // expo-ish out, not frozen on frame clock
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const ramp = (f: number, a: number, b: number, from = 0, to = 1, e = ease) =>
	interpolate(f, [a, b], [from, to], {...clamp, easing: e});

// 129 BPM house bed (cat-walk.mp3). Final edit pins the drop to frame 270.
export const BEAT = 30 * (60 / 129);

/** Graphite stage: soft lime key light, film grain via seeded noise, vignette. */
export const Stage: React.FC<{children?: React.ReactNode; glow?: [number, number]; grid?: boolean}> = ({children, glow = [300, 520], grid = false}) => {
	const f = useCurrentFrame();
	const T = useTheme();
	const gx = glow[0] + noise2D('gx', f / 140, 0) * 60;
	const gy = glow[1] + noise2D('gy', 0, f / 140) * 60;
	return (
		<AbsoluteFill style={{background: T.bg, color: T.text, fontFamily: F.body, overflow: 'hidden'}}>
			{T.bgImage ? <AbsoluteFill style={{background: T.bgImage}} /> : null}
			<AbsoluteFill style={{background: `radial-gradient(900px 900px at ${gx}px ${gy}px, ${T.glow}24, transparent 70%)`}} />
			<AbsoluteFill style={{background: `radial-gradient(1200px 900px at 900px 1700px, ${T.glow2}12, transparent 70%)`}} />
			{grid ? (
				<AbsoluteFill
					style={{
						backgroundImage: `linear-gradient(${T.grid} 1px, transparent 1px),linear-gradient(90deg,${T.grid} 1px,transparent 1px)`,
						backgroundSize: '90px 90px',
						maskImage: 'radial-gradient(circle at 50% 45%, black 20%, transparent 75%)',
					}}
				/>
			) : null}
			{children}
			<AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 55%, ${T.vignette ?? '#000000AA'} 100%)`, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

/** One-shot SFX pinned to an absolute frame. `dur` trims long samples (S4). */
export const Sfx: React.FC<{at: number; src: string; vol?: number; dur?: number}> = ({at, src, vol = 0.6, dur = 90}) => (
	<Sequence from={Math.max(0, Math.round(at))} durationInFrames={dur} layout="none" name={`sfx ${src}`}>
		<Audio src={staticFile(`assets/audio/${src}`)} volume={vol} />
	</Sequence>
);

/** Background music with fade in/out and optional ducking windows. */
export const Bgm: React.FC<{offsetSec: number; total: number; vol?: number; fadeIn?: number; fadeOut?: number}> = ({offsetSec, total, vol = 0.32, fadeIn = 45, fadeOut = 75}) => (
	<Audio
		src={staticFile('assets/audio/cat-walk.mp3')}
		trimBefore={Math.round(offsetSec * 30)}
		volume={(f) => interpolate(f, [0, fadeIn, total - fadeOut, total], [0, vol, vol, 0], clamp)}
	/>
);

/** Small mono kicker label used above titles. */
export const Kicker: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: 4, color: C.lime, textTransform: 'uppercase', ...style}}>{children}</div>
);

/** DevGuide wordmark (typographic, matches the site's DEV / GUIDE stacked header). */
export const Wordmark: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 120, style}) => {
	const T = useTheme();
	return (
		<div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: -size * 0.03, ...style}}>
			<span style={{color: T.text}}>DEV</span>
			<span style={{color: T.accent}}>GUIDE</span>
		</div>
	);
};

export const CtaPill: React.FC<{scale?: number}> = ({scale = 1}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 18,
			padding: `${30 * scale}px ${44 * scale}px`,
			borderRadius: 999,
			background: C.lime,
			color: C.bg,
			fontWeight: 800,
			fontSize: 44 * scale,
			boxShadow: '0 30px 80px #C3FF5540',
		}}
	>
		{brand.cta}
		<span style={{fontSize: 46 * scale}}>→</span>
	</div>
);

export {brand};
