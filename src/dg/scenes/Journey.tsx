import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {evolvePath, getPointAtLength, getLength} from '@remotion/paths';
import {C, F, Sfx, Stage, clamp, easeInOut, ramp} from '../kit';

// 90f (stretchable). SVG path ІДЕЯ -> КОД -> ПРОЄКТ drawn with @remotion/paths;
// the last node blooms into a lime iris that hands over to the end card.
export const JOURNEY = 90;
const PATH = 'M 200 1450 C 200 1150, 880 1260, 860 1000 S 220 820, 260 560';
const NODES = [
	{label: 'ІДЕЯ', t: 0, x: 200, y: 1450, dx: 70, align: 'left' as const},
	{label: 'КОД', t: 0.5, x: 860, y: 1000, dx: -70, align: 'right' as const},
	{label: 'ПРОЄКТ', t: 1, x: 260, y: 560, dx: 70, align: 'left' as const},
];

export const Journey: React.FC<{duration?: number; sfx?: boolean}> = ({duration = JOURNEY, sfx = true}) => {
	const f = useCurrentFrame();
	const k = duration / JOURNEY;
	const draw = ramp(f, 4 * k, 52 * k, 0, 1, easeInOut);
	const ev = evolvePath(draw, PATH);
	const len = getLength(PATH);
	const head = getPointAtLength(PATH, Math.max(0.01, draw * len));
	const iris = ramp(f, 62 * k, duration, 0, 1, easeInOut);
	const last = NODES[2];
	return (
		<Stage glow={[540, 1000]}>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d={PATH} fill="none" stroke="#ffffff14" strokeWidth={16} strokeLinecap="round" />
				<path d={PATH} fill="none" stroke={C.lime} strokeWidth={16} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} style={{filter: 'drop-shadow(0 0 18px #C3FF5590)'}} />
				{head && draw > 0 && draw < 1 ? <circle cx={head.x} cy={head.y} r={20} fill={C.text} /> : null}
				{NODES.map((n) => {
					const on = interpolate(draw, [n.t - 0.08, n.t], [0, 1], clamp);
					return <circle key={n.label} cx={n.x} cy={n.y} r={14 + on * 18} fill={on > 0.5 ? C.lime : C.panel2} stroke={C.lime} strokeWidth={4} />;
				})}
				<circle cx={last.x} cy={last.y} r={iris * 2300} fill={C.lime} />
			</svg>
			{NODES.map((n) => {
				const on = interpolate(draw, [n.t - 0.1, n.t], [0, 1], clamp);
				return (
					<div
						key={n.label}
						style={{
							position: 'absolute',
							top: n.y - 50,
							...(n.align === 'left' ? {left: n.x + n.dx} : {right: 1080 - n.x - n.dx}),
							fontFamily: F.display,
							fontWeight: 900,
							fontSize: 92,
							lineHeight: 1.1,
							opacity: on * (1 - iris),
							transform: `translateY(${(1 - on) * 30}px)`,
							color: n.label === 'ПРОЄКТ' ? C.lime : C.text,
						}}
					>
						{n.label}
					</div>
				);
			})}
			<AbsoluteFill style={{background: C.lime, opacity: interpolate(iris, [0.85, 1], [0, 1], clamp)}} />
			{sfx ? (
				<>
					<Sfx at={2} src="warp-slide.mp3" vol={0.35} dur={45} />
					<Sfx at={Math.round(28 * k)} src="switch-tap.mp3" vol={0.35} dur={14} />
					<Sfx at={Math.round(52 * k)} src="switch-tap.mp3" vol={0.4} dur={14} />
					<Sfx at={Math.round(60 * k)} src="air-whoosh-powerful.mp3" vol={0.5} dur={40} />
				</>
			) : null}
		</Stage>
	);
};
