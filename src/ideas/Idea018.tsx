import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {RemotionRiveCanvas} from '@remotion/rive';
import {Bgm, C, F, Kicker, Sfx, Stage, Wordmark, ramp} from '../system/kit';
import {CodeLine} from '../system/Code';
import {FadeIn} from '../system/onda/fade-in/FadeIn';

// ID-018 «Відео зібране кодом» (F3, без голосу). Сценарій: public/ideas/idea-018/scenario.md.
// Сцени (кадри @30): постер 0-90 · Remotion 90-270 · Rive 270-480 · Onda 480-690 · CTA 690-900.
export const IDEA_018 = 900;
const CTA_WORD = 'REMOTION';

const Title: React.FC<{children: React.ReactNode; y?: number; size?: number}> = ({children, y = 240, size = 84}) => (
	<div style={{position: 'absolute', left: 84, right: 140, top: y, fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 1.08, letterSpacing: -2}}>{children}</div>
);

const Poster: React.FC = () => (
	<Stage glow={[540, 700]} grid>
		<div style={{position: 'absolute', left: 84, right: 140, top: 640}}>
			<Kicker style={{marginBottom: 36}}>Remotion · Rive · Onda</Kicker>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 112, lineHeight: 1.05, letterSpacing: -3}}>
				Це відео —<br /><span style={{color: C.lime}}>код</span>
			</div>
		</div>
		<div style={{position: 'absolute', left: 84, top: 1500}}><Wordmark size={64} /></div>
	</Stage>
);

const CODE = [
	"import {Sequence} from 'remotion';",
	'',
	'<Sequence from={30}>',
	'  <Card title="DevGuide" />',
	'</Sequence>',
];

const RemotionScene: React.FC = () => {
	const f = useCurrentFrame();
	const chars = Math.floor(ramp(f, 12, 110, 0, 130));
	let left = chars;
	const card = ramp(f, 118, 140);
	return (
		<Stage glow={[540, 600]} grid>
			<Title>Remotion:<br /><span style={{color: C.lime}}>відео в React</span></Title>
			<div style={{position: 'absolute', left: 84, right: 84, top: 600, padding: '40px 44px', borderRadius: 32, background: C.panel, border: `2px solid ${C.line}`, fontFamily: F.mono, fontSize: 38, color: C.text}}>
				{CODE.map((line, i) => {
					const n = Math.max(0, Math.min(line.length, left));
					left -= line.length;
					return <CodeLine key={i} line={line} chars={n} />;
				})}
			</div>
			<div style={{position: 'absolute', left: 84, right: 84, top: 1130, height: 260, borderRadius: 32, background: C.lime, color: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 84, opacity: card, transform: `translateY(${(1 - card) * 60}px) scale(${0.94 + card * 0.06})`}}>
				DevGuide
			</div>
		</Stage>
	);
};

const RiveScene: React.FC = () => {
	const f = useCurrentFrame();
	const k = ramp(f, 8, 30);
	return (
		<Stage glow={[540, 900]} grid>
			<Title>Rive:<br /><span style={{color: C.lime}}>векторна анімація</span></Title>
			<div style={{position: 'absolute', left: 84, right: 84, top: 620, height: 600, borderRadius: 36, overflow: 'hidden', background: "#EA3A5F", border: `3px solid ${C.lime}`, opacity: k, transform: `scale(${0.95 + k * 0.05})`}}>
				<RemotionRiveCanvas src={staticFile('assets/rive-smoke.riv')} fit="contain" style={{width: '100%', height: '100%', transform: 'scale(2.1)'}} />
			</div>
			<div style={{position: 'absolute', left: 84, right: 84, top: 1290, fontSize: 46, fontWeight: 600, opacity: ramp(f, 40, 60)}}>
				один файл <span style={{color: C.lime}}>57 КБ</span>
			</div>
			<div style={{position: 'absolute', left: 84, top: 1400, fontFamily: F.mono, fontSize: 32, color: C.dim, opacity: ramp(f, 50, 70)}}>зразок Rive</div>
		</Stage>
	);
};

const OndaScene: React.FC = () => {
	const f = useCurrentFrame();
	const items = [['fade-in', 40], ['70 компонентів', 70], ['18 переходів', 100]] as const;
	return (
		<Stage glow={[540, 800]} grid>
			<Title>Onda:<br /><span style={{color: C.lime}}>готові блоки</span></Title>
			{items.map(([text, delay], i) => (
				<div key={text} style={{position: 'absolute', left: 84, right: 84, top: 640 + i * 230, height: 170, borderRadius: 28, background: C.panel, border: `2px solid ${i === 0 ? C.lime : C.line}`, display: 'flex', alignItems: 'center', padding: '0 48px', opacity: ramp(f, delay - 6, delay)}}>
					<FadeIn kind="fade-in" delay={delay} text={text} duration={18} align="left" fontFamily="Unbounded, Inter, sans-serif" fontSize={64} color={C.text} />
				</div>
			))}
			<div style={{position: 'absolute', left: 84, top: 1420, fontFamily: F.mono, fontSize: 40, color: C.lime, opacity: ramp(f, 130, 150)}}>npx ondajs add fade-in</div>
		</Stage>
	);
};

const CtaScene: React.FC = () => {
	const f = useCurrentFrame();
	const slam = ramp(f, 0, 16);
	const pill = ramp(f, 40, 62);
	return (
		<Stage glow={[540, 760]} grid>
			<div style={{position: 'absolute', left: 84, right: 84, top: 560, textAlign: 'center', opacity: slam, transform: `scale(${1.5 - slam * 0.5})`}}>
				<Wordmark size={118} />
			</div>
			<div style={{position: 'absolute', left: 84, right: 84, top: 960, textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 60, lineHeight: 1.2, opacity: ramp(f, 24, 44)}}>
				Хочеш так само?<br /><span style={{color: C.lime}}>Напиши в коментарях</span>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1280, display: 'flex', justifyContent: 'center', opacity: pill, transform: `translateY(${(1 - pill) * 40}px)`}}>
				<div style={{padding: '30px 60px', borderRadius: 999, background: C.lime, color: C.bg, fontFamily: F.display, fontWeight: 900, fontSize: 72, boxShadow: '0 30px 80px #C3FF5540'}}>{CTA_WORD}</div>
			</div>
		</Stage>
	);
};

export const Idea018: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<Sequence from={0} durationInFrames={90} name="Poster"><Poster /></Sequence>
		<Sequence from={90} durationInFrames={180} name="Remotion"><RemotionScene /></Sequence>
		<Sequence from={270} durationInFrames={210} name="Rive"><RiveScene /></Sequence>
		<Sequence from={480} durationInFrames={210} name="Onda"><OndaScene /></Sequence>
		<Sequence from={690} durationInFrames={210} name="CTA"><CtaScene /></Sequence>
		<Bgm offsetSec={0} total={IDEA_018} vol={0.3} />
		<Sfx at={9} src="impact/impact-cine-big.mp3" vol={0.25} dur={60} />
		<Sfx at={102} src="typing/typewriter-hit-soft.mp3" vol={0.22} dur={60} />
		<Sfx at={90 + 118} src="pop/soft-pop.wav" vol={0.4} dur={30} />
		<Sfx at={266} src="whoosh/whoosh-fast.mp3" vol={0.35} dur={45} />
		<Sfx at={480 + 40} src="pop/soft-pop.wav" vol={0.35} dur={30} />
		<Sfx at={480 + 70} src="pop/soft-pop.wav" vol={0.35} dur={30} />
		<Sfx at={480 + 100} src="pop/soft-pop.wav" vol={0.35} dur={30} />
		<Sfx at={650} src="riser/riser-7-130957.mp3" vol={0.3} dur={45} />
		<Sfx at={690} src="impact/impact-movie-epic.mp3" vol={0.5} dur={90} />
	</AbsoluteFill>
);
