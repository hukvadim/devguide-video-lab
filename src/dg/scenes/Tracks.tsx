import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F, Sfx, Stage, brand, clamp, ease, ramp} from '../kit';

// 180f. The 8 learning tracks from devguide.com.ua/learning (checked 2026-10-09), dealt like cards
// with accelerating rhythm (R2), 0.5s+ rest, one accent card, quick exit.
export const TRACKS = 180;
const items = brand.site.learningTracks.items;
const stepsWord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'крок' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'кроки' : 'кроків');

const GAPS = [0, 13, 24, 33, 41, 48, 54, 59];
const LAUNCH = 22;
const FLIGHT = 16;
const ACCENT = 1; // "Сайти": клієнт, ТЗ, генерація, запуск — the "own project" track
const COL_W = 418;
const ROW_H = 238;

export const Tracks: React.FC<{tilt?: boolean}> = ({tilt = false}) => {
	const f = useCurrentFrame();
	const head = ramp(f, 0, 18);
	const accent = ramp(f, 118, 132);
	const exit = ramp(f, 166, 180, 0, 1);
	return (
		<Stage glow={[540, 1000]} grid>
			<AbsoluteFill style={{transform: `translateY(${-exit * 140}px)`, opacity: 1 - exit}}>
				<div style={{position: 'absolute', left: 84, top: 180, display: 'flex', alignItems: 'flex-end', gap: 26, opacity: head, transform: `translateX(${(1 - head) * -60}px)`}}>
					<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 230, lineHeight: 0.82, color: C.lime}}>8</div>
					<div style={{paddingBottom: 4}}>
						<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 80, lineHeight: 1, letterSpacing: -2}}>напрямів</div>
						<div style={{fontSize: 42, color: C.dim, marginTop: 10}}>одного шляху навчання</div>
					</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 84,
						top: 520,
						width: 856,
						height: 4 * ROW_H + 60,
						transform: tilt ? `perspective(1800px) rotateX(${interpolate(f, [0, 180], [26, 14])}deg) rotateZ(-4deg)` : undefined,
						transformStyle: 'preserve-3d',
					}}
				>
					{items.map((it, i) => {
						const t0 = LAUNCH + GAPS[i];
						const p = ramp(f, t0, t0 + FLIGHT, 0, 1, ease);
						const col = i % 2;
						const row = Math.floor(i / 2);
						const x = col * (COL_W + 20);
						const y = row * (ROW_H + 20);
						const fromX = 428 - COL_W / 2 + (i % 2 ? 60 : -60);
						const fromY = 1500;
						const isAccent = i === ACCENT;
						const lift = isAccent ? accent : 0;
						return (
							<div
								key={it.title}
								style={{
									position: 'absolute',
									width: COL_W,
									height: ROW_H,
									left: interpolate(p, [0, 1], [fromX, x]),
									top: interpolate(p, [0, 1], [fromY, y]),
									opacity: interpolate(p, [0, 0.15], [0, 1], clamp),
									transform: `rotate(${interpolate(p, [0, 1], [i % 2 ? 14 : -14, 0])}deg) scale(${1 + lift * 0.05}) translateZ(${lift * 60}px)`,
									background: `linear-gradient(160deg, rgba(195,255,85,${lift * 0.16}), transparent 70%), ${C.panel}`,
									border: `2px solid ${isAccent ? `rgba(195,255,85,${0.12 + lift * 0.88})` : C.line}`,
									borderRadius: 28,
									padding: '24px 26px',
									boxShadow: `0 30px 70px #00000090${isAccent ? `, 0 0 ${lift * 60}px #C3FF5540` : ''}`,
									zIndex: isAccent ? 10 : i,
								}}
							>
								<div style={{fontFamily: F.mono, fontSize: 30, color: isAccent && lift > 0.5 ? C.lime : C.dim}}>
									{String(i + 1).padStart(2, '0')} · {it.steps} {stepsWord(it.steps)}
								</div>
								<div style={{fontWeight: 800, fontSize: 38, lineHeight: 1.12, marginTop: 10}}>{it.title}</div>
								<div style={{fontSize: 32, lineHeight: 1.22, color: '#B7C1CA', marginTop: 8}}>{it.tags}</div>
							</div>
						);
					})}
				</div>
			</AbsoluteFill>
			<Sfx at={0} src="transition-snap.mp3" vol={0.4} dur={30} />
			{GAPS.map((g, i) => (
				<Sfx key={i} at={LAUNCH + g + FLIGHT - 3} src="switch-tap.mp3" vol={0.42 - i * 0.025} dur={14} />
			))}
			<Sfx at={118} src="sparkle-touch.mp3" vol={0.45} dur={60} />
			<Sfx at={164} src="whoosh-fast.mp3" vol={0.4} dur={25} />
		</Stage>
	);
};
