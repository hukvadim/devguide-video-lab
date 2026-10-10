import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import {C, F, Sfx, Stage, clamp, easeInOut, ramp} from '../kit';
import {Caret, CodeLine, EditorWindow} from '../Code';

// 270f. Hook -> typographic match cut: the giant word ІДЕЯ lands as the string 'Ідея' in real code,
// the code then builds a live preview. Ends on a push-in that hands over to the drop at f270.
export const IDEA_TO_CODE = 270;

const LINES = [
	'// мій перший проєкт',
	'export default function App() {',
	"  const [idea] = useState('Ідея');",
	'  return (',
	'    <Project name={idea}>',
	'      <Hero title="Мій сайт" />',
	'      <Button>Запустити</Button>',
	'    </Project>',
	'  );',
	'}',
];
const IDEA_LINE = 2;
const LAND = 84; // giant word lands inside the editor
const TYPE_START = 98;
const CPF = 1.6; // chars per frame: brisk but readable typing
// Line start frames (line 2 appears whole at LAND).
const starts: number[] = [];
{
	let t = TYPE_START;
	LINES.forEach((l, i) => {
		if (i === IDEA_LINE) {
			starts.push(LAND);
			return;
		}
		starts.push(t);
		t += Math.ceil(l.length / CPF) + 3;
	});
}
const lineDone = (i: number) => starts[i] + Math.ceil(LINES[i].length / CPF);

// Editor geometry (EditorWindow: header 87px, padding 28/34, mono FS * 1.55, glyph advance 0.6em).
const FS = 36;
const ED = {left: 84, top: 230, landTop: 560, width: 856};
const LH = FS * 1.55;
const TARGET = {x: ED.left + 1 + 34 + (25 + 3) * FS * 0.6, y: ED.landTop + 87 + 28 + IDEA_LINE * LH + LH / 2};

export const IdeaToCode: React.FC = () => {
	const f = useCurrentFrame();
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline
			.from(selector('[data-pre]'), {y: 60, opacity: 0, duration: 0.5, ease: 'power3.out'}, 0.15)
			.from(selector('[data-letter]'), {yPercent: -120, opacity: 0, scaleY: 1.6, duration: 0.55, stagger: 0.06, ease: 'expo.out'}, 0.42)
			.from(selector('[data-q]'), {y: 50, opacity: 0, duration: 0.45, ease: 'power3.out'}, 1.3)
			.to(selector('[data-pre], [data-q]'), {y: -40, opacity: 0, duration: 0.3, ease: 'power2.in'}, 2.15);
	});

	// Match cut: giant word flies into the code slot.
	const m = ramp(f, 64, LAND, 0, 1, easeInOut);
	const giantX = interpolate(m, [0, 1], [540, TARGET.x]);
	const giantY = interpolate(m, [0, 1], [900, TARGET.y]);
	const giantS = interpolate(m, [0, 1], [1, 0.165]);
	const giantO = interpolate(f, [LAND - 1, LAND], [1, 0], clamp);
	const landFlash = interpolate(f, [LAND, LAND + 4, LAND + 22], [0, 1, 0], clamp);

	const editorIn = ramp(f, 58, 80);
	const lift = ramp(f, 138, 164, 0, 1, easeInOut);
	const edTop = interpolate(lift, [0, 1], [ED.landTop, ED.top]);
	const push = ramp(f, 236, 270, 0, 1, Easing.in(Easing.cubic));
	const previewIn = ramp(f, 150, 172);
	const heroOn = ramp(f, lineDone(5), lineDone(5) + 10);
	const btnOn = ramp(f, lineDone(6), lineDone(6) + 12);
	const press = interpolate(f, [226, 230, 238], [1, 0.92, 1], clamp);
	const caption = ramp(f, 176, 196);

	const typing = (i: number) => Math.max(0, Math.floor((f - starts[i]) * CPF));
	const activeLine = LINES.findIndex((_, i) => i !== IDEA_LINE && f >= starts[i] && f < lineDone(i) + 2);

	return (
		<Stage glow={[540, 700]} grid>
			<AbsoluteFill ref={ref} style={{transform: `scale(${1 + push * 0.25})`, filter: `blur(${push * 10}px)`, opacity: 1 - push * 0.6}}>
				{/* Hook typography */}
				<div data-pre style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontSize: 64, fontWeight: 600, color: C.dim}}>
					У тебе є
				</div>
				<div data-q style={{position: 'absolute', top: 1060, width: '100%', textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 84}}>
					Що далі?
				</div>

				{/* Editor */}
				<div style={{position: 'absolute', left: ED.left, top: edTop, width: ED.width, opacity: editorIn, transform: `translateY(${(1 - editorIn) * 40}px) scale(${0.96 + editorIn * 0.04})`}}>
					<EditorWindow fontSize={FS}>
						{LINES.map((l, i) => {
							if (i === IDEA_LINE) {
								const restO = ramp(f, LAND, LAND + 10);
								const pre = "  const [idea] = useState(";
								return (
									<div key={i} style={{whiteSpace: 'pre', display: 'flex', minHeight: '1.55em', background: `rgba(195,255,85,${landFlash * 0.18})`, borderRadius: 8}}>
										<span style={{opacity: restO}}>
											<CodeLine line={pre} style={{display: 'inline'}} />
										</span>
										<span style={{opacity: f >= LAND ? 1 : 0, color: '#FFD27A', textShadow: `0 0 ${landFlash * 30}px #C3FF55`}}>'Ідея'</span>
										<span style={{opacity: restO, color: '#9AA6B2'}}>);</span>
									</div>
								);
							}
							return (
								<CodeLine key={i} line={l} chars={typing(i)}>
									{activeLine === i ? <Caret frame={f} /> : null}
								</CodeLine>
							);
						})}
					</EditorWindow>
				</div>

				<div
					style={{
						position: 'absolute',
						left: giantX,
						top: giantY,
						transform: `translate(-50%, -50%) scale(${giantS})`,
						opacity: giantO,
						fontFamily: F.display,
						fontWeight: 900,
						fontSize: 250,
						lineHeight: 1,
						color: C.lime,
						whiteSpace: 'nowrap',
						textShadow: '0 0 80px #C3FF5555',
					}}
				>
					{'ІДЕЯ'.split('').map((l, i) => (
						<span key={i} data-letter style={{display: 'inline-block'}}>
							{l}
						</span>
					))}
				</div>
				{/* Live preview */}
				<div
					style={{
						position: 'absolute',
						left: 150,
						right: 150,
						top: 985,
						height: 380,
						borderRadius: 30,
						background: '#F5F7F2',
						color: C.bg,
						overflow: 'hidden',
						opacity: previewIn,
						transform: `perspective(1600px) rotateX(${(1 - previewIn) * 25}deg) translateY(${(1 - previewIn) * 80}px)`,
						boxShadow: '0 50px 120px #000000A0',
					}}
				>
					<div style={{height: 56, background: '#E3E8E0', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12}}>
						{[0, 1, 2].map((i) => (
							<div key={i} style={{width: 14, height: 14, borderRadius: 7, background: '#B9C2B5'}} />
						))}
						<div style={{marginLeft: 16, fontFamily: F.mono, fontSize: 24, color: '#5C6670'}}>localhost:5173</div>
					</div>
					<div style={{padding: '44px 50px'}}>
						<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 76, letterSpacing: -2, opacity: heroOn, transform: `translateY(${(1 - heroOn) * 30}px)`}}>Мій сайт</div>
						<div
							style={{
								marginTop: 34,
								display: 'inline-block',
								padding: '22px 40px',
								borderRadius: 999,
								background: C.bg,
								color: C.lime,
								fontWeight: 800,
								fontSize: 40,
								opacity: btnOn,
								transform: `scale(${(0.6 + btnOn * 0.4) * press})`,
								transformOrigin: 'left center',
							}}
						>
							Запустити →
						</div>
					</div>
				</div>

				<div style={{position: 'absolute', left: 84, right: 140, top: 1420, opacity: caption, transform: `translateY(${(1 - caption) * 30}px)`}}>
					<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 76, lineHeight: 1.08, letterSpacing: -2}}>
						Пиши
						<br />
						<span style={{color: C.lime}}>справжній код.</span>
					</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: C.lime, opacity: interpolate(f, [262, 270], [0, 0.35], clamp), mixBlendMode: 'screen'}} />

			{/* Sound: hook, match cut, typing (alternating samples, stepped-down volume), click, riser into the drop */}
			<Sfx at={4} src="whoosh-fast.mp3" vol={0.35} dur={30} />
			<Sfx at={13} src="bass-hit-futuristic.mp3" vol={0.75} dur={60} />
			<Sfx at={39} src="switch-tap.mp3" vol={0.4} dur={20} />
			<Sfx at={62} src="warp-slide.mp3" vol={0.45} dur={30} />
			<Sfx at={LAND - 1} src="lock-digital.mp3" vol={0.55} dur={30} />
			{starts.flatMap((s, i) =>
				i === IDEA_LINE
					? []
					: Array.from({length: Math.ceil(LINES[i].length / CPF / 5)}, (_, k) => (
							<Sfx key={`k${i}-${k}`} at={s + k * 5} src="typewriter-hit-soft.mp3" vol={0.16 - Math.min(0.06, i * 0.006)} dur={6} />
						)),
			)}
			<Sfx at={226} src="switch-tap.mp3" vol={0.5} dur={12} />
			<Sfx at={180} src="riser-procedural.wav" vol={0.5} dur={90} />
			<Sfx at={248} src="air-whoosh-powerful.mp3" vol={0.55} dur={40} />
		</Stage>
	);
};


