import React from 'react';
import {F} from '../system/kit';
import {Big, Box, Check, Cue, L, PromptCard, Show, StepVideo, UserMsg, Win, at, pop, prompt, stepFrames, typed, useTheme} from '../system/step';
import WORDS from '../../public/ideas/idea-015/words.json';

// ID-015 «Skills і MCP» (крок skills-mcp), шорт 1080×1920. Сценарій: public/ideas/idea-015/scenario.md.
// Приклад DevGuide — симуляція: без скрінів реальної адмінки й без вигаданих назв серверів.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_015 = stepFrames(WORDS);

const Node: React.FC<{x: number; y: number; o: number; on?: boolean; children: React.ReactNode}> = ({x, y, o, on, children}) => { const T = useTheme(); return (
	<div style={{position: 'absolute', left: x - 120, top: y, width: 240, opacity: o, transform: `scale(${0.8 + o * 0.2})`, padding: '22px 0', borderRadius: 22, textAlign: 'center', background: on ? `${T.accent}22` : T.card, border: `3px solid ${on ? T.accent : T.line}`, fontWeight: 800, fontSize: 32}}>{children}</div>
); };
const Core: React.FC<{y: number; size?: number}> = ({y, size = 220}) => { const T = useTheme(); return (
	<div style={{position: 'absolute', left: 540 - size / 2, top: y, width: size, height: size, borderRadius: size / 2, background: `radial-gradient(circle at 35% 30%, ${T.accent}, ${T.accentDeep})`, boxShadow: `0 0 120px ${T.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.onAccent, fontFamily: F.display, fontWeight: 900, fontSize: size / 5}}>Claude</div>
); };

export const Scenes = (t: number) => {
	const T = useTheme();
	const what = a('Для'), dg = a('Ось'), start = a('Почни'), check = a('Підключи', a('сайтів'));
	const skill = WORDS.find((w) => w.s > a('MCP', what))!.s; // «Скіл — це інструкція» (одразу після «…скіли та MCP.»)
	const mcp = a('MCP', skill);
	const nodes: [number, string, number][] = [[204, 'Figma', a('Figma')], [540, 'Документація', a('документація')], [820, 'Адмінка', a('адмінка')]];
	return (
		<>
			<Show t={t} a={0} b={what}>
				<Core y={700} />
				<Box y={300} o={pop(t, a('навчити'))}><Big size={88}>Навчи AI<br /><L>нового</L></Big></Box>
			</Show>
			<Show t={t} a={what} b={skill}>
				<Box y={580}><Big size={110}>Skills<br />і <L>MCP</L></Big></Box>
			</Show>
			<Show t={t} a={skill} b={mcp}>
				<Box y={240}><Big size={68}>Skill — вивчив раз,<br /><L>щоразу однаково</L></Big></Box>
				<Box y={560}><div style={{display: 'inline-block', padding: '40px 60px', borderRadius: 30, background: T.card, border: `3px solid ${T.accent}`, fontSize: 100}}>📜<div style={{fontFamily: F.mono, fontSize: 40, color: T.accent}}>skill</div></div></Box>
				<Box y={990} style={{display: 'flex', justifyContent: 'center', gap: 40}}>
					{[a('один'), a('щоразу'), a('однаково')].map((s, i) => <span key={i} style={{opacity: pop(t, s), width: 110, height: 110, borderRadius: 55, background: T.accent, color: T.onAccent, fontSize: 64, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>✓</span>)}
				</Box>
			</Show>
			<Show t={t} a={mcp} b={dg}>
				<Box y={230}><Big size={68}>MCP — <L>підключення</L><br />до сервісів</Big></Box>
				<Core y={520} size={200} />
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					{nodes.map(([x, , s]) => <line key={x} x1={540} y1={720} x2={x} y2={1050} stroke={T.accent} strokeWidth={4} strokeDasharray={420} strokeDashoffset={420 * (1 - pop(t, s, 0.5))} opacity={0.7} />)}
				</svg>
				{nodes.map(([x, label, s]) => <Node key={label} x={x} y={1050} o={pop(t, s)}>{label}</Node>)}
			</Show>
			<Show t={t} a={dg} b={start}>
				<Box y={200}><Big size={60}>Як це працює<br />в <L>DevGuide</L></Big></Box>
				<Win y={540} label="Claude" o={pop(t, a('Пишеш') - 0.4)}>
					<UserMsg size={38}>{typed('Додай у крок «Git як страховка» підказку про .gitignore', t, a('Пишеш'), a('навчання'))}</UserMsg>
				</Win>
				<Box y={400} o={pop(t, a('підключено'))}><span style={{display: 'inline-block', padding: '16px 34px', borderRadius: 999, background: `${T.accent}1F`, border: `2px solid ${T.accent}`, color: T.accent, fontFamily: F.mono, fontSize: 34}}>MCP → адмінка DevGuide</span></Box>
				<div style={{position: 'absolute', left: 84, width: 856, top: 880, padding: '30px 40px', borderRadius: 26, background: T.card, border: `3px solid ${t >= a('оновлює') ? T.accent : T.line}`, opacity: pop(t, a('оновлює') - 0.3)}}>
					<div style={{fontFamily: F.mono, fontSize: 26, color: T.dim, letterSpacing: 3}}>КРОК ШЛЯХУ</div>
					<div style={{fontSize: 44, fontWeight: 800, marginTop: 10}}>Git як страховка</div>
					<div style={{fontSize: 36, marginTop: 14, color: t >= a('оновлює') + 0.4 ? T.accent : T.dim}}>{t >= a('оновлює') + 0.4 ? '✓ підказку додано' : 'підказка: —'}</div>
				</div>
				<Box y={1180} o={pop(t, a('Без'))}><span style={{fontSize: 44, fontWeight: 800}}>без ручного <L>редагування</L></span></Box>
			</Show>
			<Show t={t} a={start} b={check}>
				<Box y={200}><Big size={64}>Почни з <L>простого</L></Big></Box>
				<PromptCard t={t} a={a('Встав')} b={a('сайтів')} text={prompt('skills-mcp', 'audit')} y={360} />
			</Show>
			<Show t={t} a={check} b={Infinity}>
				<Check t={t} a={check} y={480}>Підключив хоча б один MCP або skill і виконав з ним задачу</Check>
			</Show>
		</>
	);
};

export const SFX: Cue[] = [
	[0, 'whoosh-swirl.mp3', 0.35],
	[a('один'), 'soft-pop.wav', 0.35], [a('щоразу'), 'soft-pop.wav', 0.35], [a('однаково'), 'soft-pop.wav', 0.35],
	[a('Figma'), 'sparkle-touch.mp3', 0.3], [a('документація'), 'sparkle-touch.mp3', 0.3], [a('адмінка'), 'sparkle-touch.mp3', 0.3],
	[a('Пишеш'), 'typewriter-hit-soft.mp3', 0.22], [a('оновлює'), 'lock-digital.mp3', 0.3], [a('оновлює') + 0.4, 'shimmer-sparkle-sweep.mp3', 0.25],
	[a('Встав'), 'typewriter-hit-soft.mp3', 0.22], [a('Підключи', a('сайтів')), 'shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea015: React.FC = () => <StepVideo dir="ideas/idea-015" words={WORDS} next="Свій skill: процес в одну команду" sfx={SFX} scenes={Scenes} />;
