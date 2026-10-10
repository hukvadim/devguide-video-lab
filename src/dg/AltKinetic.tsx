import React from 'react';
import {AbsoluteFill, Series, interpolate, useCurrentFrame} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import {Bgm, C, F, Kicker, Sfx, Stage, brand, clamp} from './kit';
import {Journey} from './scenes/Journey';
import {EndCard, END_CARD} from './scenes/EndCard';

// Alternative A — 30s kinetic typography: GSAP word/letter timelines + SVG path + end card.
// No devices, no screenshots: the type is the picture.
export const ALT_A = 900;

type Line = {t: string; lime?: boolean; size?: number};
const Beat: React.FC<{kicker: string; lines: Line[]; dur: number; sfx?: string}> = ({kicker, lines, dur, sfx = 'whoosh-fast.mp3'}) => {
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline
			.from(selector('[data-k]'), {x: -40, opacity: 0, duration: 0.35, ease: 'power3.out'}, 0)
			.from(selector('[data-w]'), {yPercent: 110, rotationX: -70, opacity: 0, transformOrigin: '50% 100%', duration: 0.6, stagger: 0.09, ease: 'expo.out'}, 0.1)
			.to(selector('[data-w]'), {yPercent: -110, opacity: 0, duration: 0.3, stagger: 0.03, ease: 'power2.in'}, dur / 30 - 0.45);
	});
	return (
		<Stage glow={[300 + (lines.length % 2) * 480, 760]} grid>
			<AbsoluteFill ref={ref} style={{padding: '0 140px 0 84px', justifyContent: 'center'}}>
				<div data-k style={{marginBottom: 40}}>
					<Kicker>{kicker}</Kicker>
				</div>
				{lines.map((l, i) => (
					<div key={i} style={{overflow: 'hidden', perspective: 800, paddingBottom: 6}}>
						{l.t.split(' ').map((w, j) => (
							<span
								key={j}
								data-w
								style={{display: 'inline-block', marginRight: '0.24em', fontFamily: F.display, fontWeight: 900, fontSize: l.size ?? 104, lineHeight: 1.08, letterSpacing: -3, color: l.lime ? C.lime : C.text}}
							>
								{w}
							</span>
						))}
					</div>
				))}
			</AbsoluteFill>
			<Sfx at={0} src={sfx} vol={0.35} dur={30} />
		</Stage>
	);
};

// Track names cycle in one slot, interval shrinking (accelerating like a deck being riffled).
const Cycle: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const items = brand.site.learningTracks.items;
	const starts = [18, 36, 52, 66, 78, 88, 97, 105]; // shrinking gaps, last one holds
	const idx = Math.max(0, starts.filter((s) => f >= s).length - 1);
	const local = f - starts[idx];
	const pop = interpolate(local, [0, 5], [0.6, 1], clamp);
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline.from(selector('[data-h]'), {y: 80, opacity: 0, duration: 0.5, ease: 'expo.out'}, 0).to(selector('[data-all]'), {opacity: 0, y: -60, duration: 0.3, ease: 'power2.in'}, dur / 30 - 0.4);
	});
	return (
		<Stage glow={[540, 900]} grid>
			<AbsoluteFill ref={ref}>
				<div data-all style={{position: 'absolute', inset: 0}}>
					<div data-h style={{position: 'absolute', left: 84, top: 560, fontFamily: F.display, fontWeight: 900, fontSize: 104, letterSpacing: -3}}>
						<span style={{color: C.lime}}>8</span> напрямів:
					</div>
					<div style={{position: 'absolute', left: 84, right: 120, top: 760, height: 300}}>
						<div style={{fontFamily: F.mono, fontSize: 40, color: C.dim}}>{String(idx + 1).padStart(2, '0')} / 08</div>
						<div style={{marginTop: 18, fontFamily: F.display, fontWeight: 700, fontSize: 88, lineHeight: 1.08, color: C.lime, transform: `scale(${pop})`, transformOrigin: 'left center', opacity: f >= starts[0] ? 1 : 0}}>
							{items[idx].title}
						</div>
						<div style={{marginTop: 22, fontSize: 44, color: '#C9D2D9', opacity: f >= starts[0] ? 1 : 0}}>{items[idx].tags}</div>
					</div>
					<div style={{position: 'absolute', left: 84, right: 120, top: 1240, display: 'flex', gap: 14}}>
						{items.map((_, i) => (
							<div key={i} style={{flex: 1, height: 10, borderRadius: 5, background: i <= idx && f >= starts[0] ? C.lime : '#ffffff1A'}} />
						))}
					</div>
				</div>
			</AbsoluteFill>
			{starts.map((s, i) => (
				<Sfx key={i} at={s} src="switch-tap.mp3" vol={0.4 - i * 0.025} dur={12} />
			))}
		</Stage>
	);
};

export const AltKinetic: React.FC = () => (
	<>
		<Series>
			<Series.Sequence name="ІДЕЯ" durationInFrames={120}>
				<Beat kicker="01 · старт" lines={[{t: 'У тебе є'}, {t: 'ІДЕЯ.', lime: true, size: 200}]} dur={120} sfx="bass-hit-futuristic.mp3" />
			</Series.Sequence>
			<Series.Sequence name="практика" durationInFrames={120}>
				<Beat kicker="02 · практика" lines={[{t: 'Вчися'}, {t: 'на власному'}, {t: 'проєкті.', lime: true}]} dur={120} />
			</Series.Sequence>
			<Series.Sequence name="напрями" durationInFrames={150}>
				<Cycle dur={150} />
			</Series.Sequence>
			<Series.Sequence name="ментор" durationInFrames={120}>
				<Beat kicker="04 · ментор" lines={[{t: 'Пиши код'}, {t: 'разом із'}, {t: 'ментором.', lime: true}]} dur={120} sfx="impact-cine-big.mp3" />
			</Series.Sequence>
			<Series.Sequence name="шлях" durationInFrames={150}>
				<Journey duration={150} />
			</Series.Sequence>
			<Series.Sequence name="end" durationInFrames={END_CARD}>
				<EndCard />
			</Series.Sequence>
		</Series>
		{/* drop (29.55s in track) lands on the "ментор" beat at f390 */}
		<Bgm offsetSec={29.55 - 390 / 30} total={ALT_A} vol={0.3} />
	</>
);
