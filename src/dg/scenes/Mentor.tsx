import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F, Kicker, Sfx, Stage, brand, easeInOut, ramp} from '../kit';
import {CodeLine, EditorWindow} from '../Code';

// 180f. Pair programming: your cursor + the mentor's cursor fix a real bug (onClik -> onClick).
// Copy is verbatim from devguide.com.ua (mentor block, checked 2026-10-09).
export const MENTOR = 180;
const m = brand.site.mentorBlock;

const FS = 36;
const LH = FS * 1.55;
const CW = FS * 0.6;
const LINES = ['export function Hero() {', '  return (', '    <Button onClik={launch}>', '      Запустити', '    </Button>', '  );', '}'];
const BUG_LINE = 2;
const BUG_COL = 12; // "onClik"
const ED = {left: 84, top: 560, width: 856};
const origin = {x: ED.left + 1 + 34, y: ED.top + 87 + 28};
const at = (line: number, col: number) => ({x: origin.x + col * CW, y: origin.y + line * LH});

const Cursor: React.FC<{x: number; y: number; label: string; color: string; ink: string}> = ({x, y, label, color, ink}) => (
	<div style={{position: 'absolute', left: x, top: y, pointerEvents: 'none'}}>
		<svg width="40" height="48" viewBox="0 0 40 48" style={{filter: 'drop-shadow(0 6px 10px #0009)'}}>
			<path d="M3 3 L3 40 L13 30 L20 46 L27 43 L20 28 L35 28 Z" fill={color} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
		</svg>
		<div style={{position: 'absolute', left: 30, top: 40, padding: '6px 16px', borderRadius: 12, background: color, color: ink, fontWeight: 800, fontSize: 30, whiteSpace: 'nowrap'}}>{label}</div>
	</div>
);

export const Mentor: React.FC = () => {
	const f = useCurrentFrame();
	const head = ramp(f, 0, 18);
	const ed = ramp(f, 8, 26);
	const travel = ramp(f, 30, 58, 0, 1, easeInOut);
	const select = ramp(f, 62, 70);
	const typed = Math.max(0, Math.min(7, Math.floor((f - 74) / 2)));
	const fixed = f >= 88;
	const ok = ramp(f, 88, 98);
	const quote = ramp(f, 104, 124);

	const bug = at(BUG_LINE, BUG_COL);
	const mentorPos = {x: interpolate(travel, [0, 1], [1000, bug.x + 40]), y: interpolate(travel, [0, 1], [1300, bug.y + 34])};
	const you = at(5, 6);
	const shown = typed > 0 ? `    <Button ${"onClick".slice(0, typed)}={launch}>` : LINES[BUG_LINE];

	return (
		<Stage glow={[760, 520]}>
			<div style={{position: 'absolute', left: 84, right: 120, top: 190, opacity: head, transform: `translateY(${(1 - head) * 30}px)`}}>
				<Kicker>{m.role}</Kicker>
				<div style={{marginTop: 22, fontFamily: F.display, fontWeight: 900, fontSize: 82, lineHeight: 1.06, letterSpacing: -2}}>
					Пиши код
					<br />
					<span style={{color: C.lime}}>разом із ментором</span>
				</div>
			</div>

			<div style={{position: 'absolute', left: ED.left, top: ED.top, width: ED.width, opacity: ed, transform: `translateY(${(1 - ed) * 50}px)`}}>
				<EditorWindow title="Hero.jsx" fontSize={FS}>
					{LINES.map((l, i) => {
						if (i !== BUG_LINE) return <CodeLine key={i} line={l} />;
						return (
							<div key={i} style={{position: 'relative'}}>
								<CodeLine line={shown} />
								{!fixed && typed === 0 ? (
									<>
										<div style={{position: 'absolute', left: BUG_COL * CW, top: 4, width: 6 * CW, height: LH - 8, background: `rgba(142,223,255,${select * 0.35})`, borderRadius: 6}} />
										<svg style={{position: 'absolute', left: BUG_COL * CW, top: LH - 12}} width={6 * CW} height={10}>
											<path d={Array.from({length: 18}, (_, k) => `${k === 0 ? 'M' : 'L'}${k * 7.2} ${k % 2 ? 2 : 8}`).join(' ')} stroke={C.red} strokeWidth={3} fill="none" />
										</svg>
									</>
								) : null}
							</div>
						);
					})}
				</EditorWindow>
				<div
					style={{
						marginTop: 18,
						display: 'inline-flex',
						alignItems: 'center',
						gap: 14,
						padding: '14px 24px',
						borderRadius: 16,
						fontFamily: F.mono,
						fontSize: 32,
						background: fixed ? '#1D2A12' : '#2A1414',
						color: fixed ? C.lime : C.red,
						border: `1px solid ${fixed ? '#C3FF5560' : '#FF6B5E60'}`,
						transform: `scale(${1 + interpolate(ok, [0, 0.5, 1], [0, 0.08, 0])})`,
					}}
				>
					{fixed ? '✓ Кнопка працює' : '✕ onClik is not a prop'}
				</div>
			</div>

			<Cursor x={you.x} y={you.y + 14} label="ти" color={C.blue} ink={C.bg} />
			<Cursor x={mentorPos.x} y={mentorPos.y} label="ментор" color={C.lime} ink={C.bg} />

			<div style={{position: 'absolute', left: 84, right: 120, top: 1330, opacity: quote, transform: `translateY(${(1 - quote) * 30}px)`}}>
				<div style={{fontSize: 46, lineHeight: 1.3, fontWeight: 600}}>«{m.text}»</div>
				<div style={{marginTop: 18, fontSize: 32, color: C.dim}}>— {m.role.split(' · ')[0]}, {brand.url}</div>
			</div>

			<Sfx at={0} src="air-woosh-deep.mp3" vol={0.35} dur={50} />
			<Sfx at={30} src="whoosh-fast.mp3" vol={0.25} dur={25} />
			<Sfx at={62} src="switch-click-quick.mp3" vol={0.4} dur={12} />
			{[74, 78, 82, 86].map((t, i) => (
				<Sfx key={t} at={t} src={i % 2 ? 'switch-click-quick.mp3' : 'typewriter-hit-soft.mp3'} vol={0.2} dur={6} />
			))}
			<Sfx at={88} src="lock-digital.mp3" vol={0.5} dur={30} />
			<Sfx at={104} src="shimmer-sparkle-sweep.mp3" vol={0.22} dur={60} />
		</Stage>
	);
};

