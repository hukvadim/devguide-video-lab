import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile} from 'remotion';
import {F, clamp, ramp} from './kit';
import {useTheme} from './theme';

// UGC-вставки з Вадимом (docs/UGC_SHOTS.md): повноекранний кліп 2–4 с між сценами, звук кліпу вимкнено.
// Кліпи Google Flow лежать у public/assets/ugc/flow/ (720×1280, 24 fps); from — найкращий шматок (с).
export type Insert = {at: number; dur: number; file: string; from: number; label?: React.ReactNode; labelY?: number; tint?: boolean};
export const UGC: Record<string, number> = {Stop: 1.8, facepalm: 1.4, 'point-up': 2.6, smile: 5.0, typing: 0.3, wow: 1.8}; // найкращий шматок кожного кліпу
export const ugc = (file: string, at: number, dur: number, extra: Partial<Insert> = {}): Insert => ({at, dur, file, from: UGC[file] ?? 0, ...extra});

/** Вставка: удар-поява (масштаб 1.1→1, спалах), м'який вихід; tint — тонування під акцент палітри. */
export const UgcInsert: React.FC<{t: number; ins: Insert}> = ({t, ins}) => {
	const T = useTheme();
	const {at, dur, file, from, label, labelY = 1180, tint} = ins;
	if (t < at - 0.05 || t > at + dur + 0.05) return null;
	const k = (t - at) / dur;
	const o = Math.min(ramp(t, at, at + 0.12), 1 - ramp(t, at + dur - 0.18, at + dur));
	const flash = 1 - ramp(t, at, at + 0.2);
	return (
		<AbsoluteFill style={{opacity: o}}>
			<Sequence from={Math.round(at * 30)} durationInFrames={Math.round(dur * 30) + 3} layout="none">
				<AbsoluteFill style={{transform: `scale(${interpolate(k, [0, 0.12, 1], [1.12, 1.02, 1.06], clamp)})`}}>
					<OffthreadVideo src={staticFile(`assets/ugc/flow/${file}.mp4`)} trimBefore={Math.round(from * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</AbsoluteFill>
			</Sequence>
			{tint ? <AbsoluteFill style={{background: T.accent, mixBlendMode: 'color', opacity: 0.32}} /> : null}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #00000000 55%, #000000AA 100%)'}} />
			<AbsoluteFill style={{background: '#FFFFFF', opacity: flash * 0.5}} />
			<AbsoluteFill style={{boxShadow: `inset 0 0 0 ${ramp(t, at, at + 0.25) * 14}px ${T.accent}`}} />
			{label ? (
				<div style={{position: 'absolute', left: 84, width: 856, top: labelY, textAlign: 'center', opacity: ramp(t, at + 0.15, at + 0.4), transform: `translateY(${(1 - ramp(t, at + 0.15, at + 0.45)) * 30}px)`}}>
					<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: '#FFFFFF', textShadow: '0 6px 30px #000000CC'}}>{label}</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};
