import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Behavior, Particles, Spawner} from 'remotion-bits';
import {C, CtaPill, F, Sfx, Stage, Wordmark, brand, clamp, ease, ramp} from './kit';

// 240f. Lime flash -> wordmark slam -> tagline -> CTA + URL, then a calm hold (>= 4s fully readable).
export const END_CARD = 240;

export const EndCard: React.FC<{fromLime?: boolean; particles?: boolean; sfx?: boolean}> = ({fromLime = true, particles = true, sfx = true}) => {
	const f = useCurrentFrame();
	const slam = ramp(f, 0, 14, 0, 1, ease);
	const tag = ramp(f, 22, 40);
	const cta = ramp(f, 40, 58);
	const url = ramp(f, 52, 70);
	const offer = ramp(f, 64, 82);
	const limeBg = fromLime ? interpolate(f, [0, 10], [1, 0], clamp) : 0;
	return (
		<Stage glow={[540, 760]} grid>
			{particles ? (
				<AbsoluteFill style={{opacity: interpolate(f, [10, 50], [0, 0.7], clamp)}}>
					{/* remotion-bits particle primitive: slow lime dust rising behind the lockup (seeded, frame-driven) */}
					<Particles startFrame={60}>
						<Spawner rate={0.5} max={60} position={{x: 540, y: 1700}} area={{width: 1000, height: 200}} velocity={{x: 0, y: -2.2, varianceX: 0.6, varianceY: 0.8}} lifespan={260} lifespanVariance={60}>
							<div style={{width: 8, height: 8, borderRadius: 4, background: C.lime, boxShadow: '0 0 14px #C3FF55'}} />
							<div style={{width: 5, height: 5, borderRadius: 3, background: '#E9FFC4'}} />
						</Spawner>
						<Behavior opacity={[0, 0.9, 0.9, 0]} scale={{start: 0.6, end: 1.2, startVariance: 0.3}} wiggle={{magnitude: 0.4, frequency: 0.05}} />
					</Particles>
				</AbsoluteFill>
			) : null}
			<div style={{position: 'absolute', left: 84, right: 84, top: 520, textAlign: 'center'}}>
				<div style={{transform: `scale(${interpolate(slam, [0, 1], [1.9, 1])})`, opacity: slam, filter: `blur(${(1 - slam) * 16}px)`}}>
					<Wordmark size={118} />
				</div>
				<div style={{marginTop: 70, fontFamily: F.display, fontWeight: 700, fontSize: 64, lineHeight: 1.18, letterSpacing: -1, opacity: tag, transform: `translateY(${(1 - tag) * 30}px)`}}>
					Від ідеї —<br />
					<span style={{color: C.lime}}>до власного проєкту.</span>
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
				<div style={{opacity: cta, transform: `translateY(${(1 - cta) * 40}px) scale(${0.9 + cta * 0.1})`}}>
					<CtaPill scale={0.92} />
				</div>
				<div style={{fontFamily: F.mono, fontSize: 56, color: C.text, opacity: url, letterSpacing: 1}}>
					<span style={{color: C.lime}}>↗ </span>
					{brand.url}
				</div>
			</div>
			<div style={{position: 'absolute', left: 84, right: 84, top: 1450, textAlign: 'center', opacity: offer}}>
				<div style={{display: 'inline-block', padding: '16px 30px', border: `1px solid ${C.line}`, borderRadius: 999, fontSize: 36, color: '#C9D2D9'}}>{brand.site.mentorBlock.offer}</div>
			</div>
			<AbsoluteFill style={{background: C.lime, opacity: limeBg}} />
			{sfx ? (
				<>
					<Sfx at={0} src="impact/impact-movie-epic.mp3" vol={0.75} dur={150} />
					<Sfx at={0} src="impact/stomp-apocalyptic.mp3" vol={0.35} dur={80} />
					<Sfx at={40} src="sparkle/sparkle-touch.mp3" vol={0.3} dur={60} />
				</>
			) : null}
		</Stage>
	);
};

