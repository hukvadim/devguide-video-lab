import React from 'react';
import {AbsoluteFill, Easing, Sequence, Series, staticFile, useCurrentFrame} from 'remotion';
import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';
import {AnimatedText, TypeWriter} from 'remotion-bits';
import {EditorWindow} from './Code';
import {SnapCnUIProvider} from '@/lib/snap-cn-ui';
import {TextReveal} from '@/components/snap-cn/text-reveal';
import {PhoneFrame} from '@/components/snap-cn/phone-frame';
import {Bgm, C, F, Sfx, Stage} from './kit';
import {Mentor, MENTOR} from './scenes/Mentor';
import {EndCard} from './scenes/EndCard';

// Alternative C — 30s practical explainer built mostly from ready-made components:
// snapcn text-reveal / phone-frame (copied via shadcn, DevGuide theme), remotion-bits TypeWriter terminal,
// remotion-bits AnimatedText for caption pages + Particles in the end card, @remotion/captions paging.
export const ALT_C = 900;

const theme = {
	background: C.bg,
	foreground: C.text,
	card: C.panel,
	cardForeground: C.text,
	primary: C.lime,
	primaryForeground: C.bg,
	muted: C.panel2,
	mutedForeground: C.dim,
	accent: C.lime,
	accentForeground: C.bg,
	border: '#2A333C',
	ring: C.lime,
	fontFamily: 'Inter',
};

// Editorial timings (no voice-over): word-level ms so @remotion/captions can page them.
const words = (text: string, startMs: number, endMs: number): Caption[] => {
	const ws = text.split(' ');
	const step = (endMs - startMs) / ws.length;
	return ws.map((w, i) => ({text: (startMs === FIRST_MS && i === 0 ? '' : ' ') + w, startMs: startMs + i * step, endMs: startMs + (i + 1) * step, timestampMs: null, confidence: null}));
};
// Appended in sequence by TypeWriter (deleteBeforeNext=false); standard Vite scaffold commands.
const TERMINAL = ['$ npm create vite@latest my-project', '\n✔ Scaffolding project...', '\n$ cd my-project', '\n$ npm install', '\n$ npm run dev', '\n➜ Local: localhost:5173'];
const FIRST_MS = 3600;
const CAPTIONS: Caption[] = [
	...words('Створи свій проєкт', 3600, 5400),
	...words('і запусти його локально.', 5800, 8000),
	...words('Далі — шлях навчання:', 10600, 12400),
	...words('8 напрямів від AI до Telegram.', 12800, 15800),
];
const {pages} = createTikTokStyleCaptions({captions: CAPTIONS, combineTokensWithinMilliseconds: 3000, breakOnSilenceAfterMilliseconds: 300});

const CaptionBar: React.FC = () => {
	const f = useCurrentFrame();
	const ms = (f / 30) * 1000;
	return (
		<>
			{pages.map((p, i) => {
				const from = Math.round((p.startMs / 1000) * 30);
				const end = pages[i + 1] && pages[i + 1].startMs - (p.startMs + p.durationMs) < 400 ? Math.round((pages[i + 1].startMs / 1000) * 30) : Math.round(((p.startMs + p.durationMs) / 1000) * 30) + 24;
				return (
					<Sequence key={i} from={from} durationInFrames={end - from} layout="none">
						<div style={{position: 'absolute', left: 84, right: 140, top: 1500, padding: '22px 30px', borderRadius: 24, color: C.text, background: '#080B0ED9', border: `1px solid ${C.line}`}}>
							<AnimatedText transition={{split: 'word', splitStagger: 3, opacity: [0, 1], y: [24, 0], duration: 10, easing: Easing.out(Easing.cubic)}} style={{fontSize: 52, fontWeight: 800, lineHeight: 1.2}}>
								{p.tokens.map((t) => t.text).join('')}
							</AnimatedText>
							<div style={{position: 'absolute', left: 30, right: 30, bottom: 12, height: 6, borderRadius: 3, background: '#ffffff14'}}>
								<div style={{height: 6, borderRadius: 3, background: C.lime, width: `${Math.min(100, Math.max(0, ((ms - p.startMs) / p.durationMs) * 100))}%`}} />
							</div>
						</div>
					</Sequence>
				);
			})}
		</>
	);
};

export const AltExplainer: React.FC = () => (
	<SnapCnUIProvider theme={theme} mode="dark">
		<Series>
			<Series.Sequence name="snapcn text-reveal" durationInFrames={100}>
				<Stage glow={[540, 900]}>
					<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 84px'}}>
						<TextReveal text="Як почати?" fontSize={120} fontWeight={800} color={C.text} fontFamily={F.display} mode="dark" theme={theme} />
					</AbsoluteFill>
				</Stage>
				<Sfx at={0} src="whoosh-swirl.mp3" vol={0.35} dur={45} />
			</Series.Sequence>
			<Series.Sequence name="snapcn terminal" durationInFrames={210}>
				<Stage glow={[540, 700]}>
					{/* snapcn terminal-simulator was tried here: its camera world is fixed to 1280x720 and crops in 9:16
					    (see docs/EXPERIMENT_RESULTS.md). Replaced by remotion-bits TypeWriter inside a DevGuide terminal. */}
					<div style={{position: 'absolute', left: 84, width: 856, top: 560}}>
						<EditorWindow title="Terminal — my-project" fontSize={36}>
							<TypeWriter
								text={TERMINAL}
								deleteBeforeNext={false}
								typeSpeed={1}
								pauseAfterType={12}
								delay={12}
								cursor={<span style={{color: C.lime}}>▌</span>}
								style={{whiteSpace: 'pre-wrap', color: C.text, minHeight: 6 * 56}}
							/>
						</EditorWindow>
					</div>
					<div style={{position: 'absolute', left: 84, right: 140, top: 200, fontFamily: F.display, fontWeight: 900, fontSize: 84, lineHeight: 1.06, letterSpacing: -2}}>
						Почни з<br />
						<span style={{color: C.lime}}>першого проєкту</span>
					</div>
				</Stage>
				<Sfx at={0} src="transition-snap.mp3" vol={0.35} dur={30} />
			</Series.Sequence>
			<Series.Sequence name="snapcn phone-frame" durationInFrames={180}>
				<Stage glow={[540, 900]}>
					<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 260}}>
						<PhoneFrame screenSrc={staticFile('assets/site/learning-mobile.png')} variant="tilt" entrance="rise" mode="dark" theme={theme} scale={1.55} floatLoop={false} />
					</AbsoluteFill>
				</Stage>
				<Sfx at={0} src="impact-cine-big.mp3" vol={0.55} dur={120} />
			</Series.Sequence>
			<Series.Sequence name="ментор" durationInFrames={MENTOR}>
				<Mentor />
			</Series.Sequence>
			<Series.Sequence name="end" durationInFrames={230}>
				<EndCard fromLime={false} />
			</Series.Sequence>
		</Series>
		<CaptionBar />
		{/* drop lands on the phone-frame reveal at f310 */}
		<Bgm offsetSec={29.55 - 310 / 30} total={ALT_C} vol={0.28} />
	</SnapCnUIProvider>
);
