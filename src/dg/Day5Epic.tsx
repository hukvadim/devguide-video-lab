import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Series, staticFile, useCurrentFrame} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import {C, F, Kicker, Sfx, Stage, clamp, ramp} from './kit';
import {EndCard, END_CARD} from './scenes/EndCard';

// "День 5" lesson reel (edited by the edit-video skill -> public/assets/day5/reel.mp4) wrapped in a
// trailer-style DevGuide intro and the brand end card. Three full-frame hits only: intro slam, game reveal, logo.
const INTRO = 120;
const REEL = 1482; // exact frame count of reel.mp4
const GAME_HIT = 650; // reel frame where "Гра — з нейромережею" lands (source 32.0 s after cuts)
export const DAY5_DURATION = INTRO + REEL + END_CARD;

const Intro: React.FC = () => {
	const f = useCurrentFrame();
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline
			.from(selector('[data-k]'), {y: 30, opacity: 0, duration: 0.4, ease: 'power3.out'}, 0.1)
			.from(selector('[data-l]'), {yPercent: -140, opacity: 0, scaleY: 1.7, duration: 0.5, stagger: 0.07, ease: 'expo.out'}, 0.55)
			.from(selector('[data-s]'), {y: 40, opacity: 0, duration: 0.45, ease: 'power3.out'}, 1.5);
	});
	const push = ramp(f, 100, INTRO);
	const flash = interpolate(f, [27, 30, 44], [0, 0.7, 0], clamp);
	return (
		<Stage glow={[540, 900]} grid>
			<AbsoluteFill ref={ref} style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${1 + push * 0.3})`, filter: `blur(${push * 12}px)`, opacity: 1 - push * 0.7}}>
				<div data-k>
					<Kicker style={{fontSize: 34}}>DevGuide · практика</Kicker>
				</div>
				<div style={{marginTop: 30, fontFamily: F.display, fontWeight: 900, fontSize: 180, lineHeight: 1, color: C.lime, textShadow: '0 0 90px #C3FF5560', whiteSpace: 'nowrap'}}>
					{'ДЕНЬ 5'.split('').map((l, i) => (
						<span key={i} data-l style={{display: 'inline-block', minWidth: l === ' ' ? 50 : undefined}}>
							{l}
						</span>
					))}
				</div>
				<div data-s style={{marginTop: 40, padding: '0 84px', textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 64, lineHeight: 1.15}}>
					Відео, сайт і гра —<br />
					<span style={{color: C.lime}}>з нейромережею</span>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: C.lime, opacity: flash, mixBlendMode: 'screen'}} />
			<Sfx at={0} src="riser-procedural.wav" vol={0.45} dur={30} />
			<Sfx at={27} src="impact-cine-big.mp3" vol={0.75} dur={150} />
			<Sfx at={45} src="switch-tap.mp3" vol={0.35} dur={15} />
			<Sfx at={98} src="air-whoosh-powerful.mp3" vol={0.5} dur={40} />
		</Stage>
	);
};

const Reel: React.FC = () => {
	const f = useCurrentFrame();
	const enter = ramp(f, 0, 12);
	const ring = interpolate(f, [GAME_HIT, GAME_HIT + 4, GAME_HIT + 30], [0, 1, 0], clamp);
	const out = ramp(f, REEL - 12, REEL);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{transform: `scale(${1.08 - enter * 0.08})`, opacity: 1 - out * 0.6}}>
				<OffthreadVideo src={staticFile('assets/day5/reel.mp4')} />
			</AbsoluteFill>
			{/* lime frame pulse on the game reveal (hit 2) */}
			<AbsoluteFill style={{boxShadow: `inset 0 0 0 ${ring * 14}px ${C.lime}, inset 0 0 ${ring * 140}px #C3FF5590`}} />
			<Sfx at={GAME_HIT - 2} src="impact-movie-epic.mp3" vol={0.35} dur={90} />
			<Sfx at={REEL - 14} src="whoosh-fast.mp3" vol={0.4} dur={25} />
		</AbsoluteFill>
	);
};

export const Day5Epic: React.FC = () => (
	<>
		<Series>
			<Series.Sequence name="Хук: ДЕНЬ 5" durationInFrames={INTRO}>
				<Intro />
			</Series.Sequence>
			<Series.Sequence name="Урок (edit-video)" durationInFrames={REEL} premountFor={30}>
				<Reel />
			</Series.Sequence>
			<Series.Sequence name="End card" durationInFrames={END_CARD}>
				<EndCard />
			</Series.Sequence>
		</Series>
		{/* cat-walk.mp3: drop (29.55 s) on the intro slam at f30; ducked ~-13 dB under the voice */}
		<Audio
			src={staticFile('assets/audio/cat-walk.mp3')}
			trimBefore={Math.round((29.55 - 1) * 30)}
			volume={(f) =>
				interpolate(
					f,
					[0, 10, INTRO - 10, INTRO + 15, INTRO + REEL - 20, INTRO + REEL + 10, DAY5_DURATION - 90, DAY5_DURATION],
					[0, 0.38, 0.38, 0.08, 0.08, 0.34, 0.34, 0],
					clamp,
				)
			}
		/>
	</>
);
