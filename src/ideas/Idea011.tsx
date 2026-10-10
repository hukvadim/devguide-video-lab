import React from 'react';
import {C, F, ramp} from '../system/kit';
import {Big, Box, Check, Cue, L, PromptCard, Show, StepVideo, at, pop, prompt, stepFrames, typed} from '../system/step';
import WORDS from '../../public/ideas/idea-011/words.json';

// ID-011 «Git як страховка» (крок git), шорт 1080×1920. Сценарій: public/ideas/idea-011/scenario.md.
// Команда відкату на екрані: git restore . (скасовує незакомічені зміни).
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_011 = stepFrames(WORDS);

const FILES = ['index.html', 'App.jsx', 'Header.jsx', 'Menu.jsx', 'style.css', 'main.jsx'];

const Scenes = (t: number) => {
	const ins = a('git'), ask = a('Налаштувати'), points = a('Так'), check = a('Перевір');
	const broke = a('ламає'), bad = a('Зміна'), cmd = a('Одна'), back = a('знову');
	return (
		<>
			<Show t={t} a={0} b={ins}>
				<Box y={300} o={pop(t, a('І'))}><Big size={96}>AI <L c={C.red}>ламає</L> теж</Big></Box>
				{FILES.map((f, i) => {
					const red = i === 3 && t >= broke;
					return (
						<div key={f} style={{position: 'absolute', left: 240, width: 600, top: 560 + i * 120, opacity: pop(t, 0.2 + i * 0.22), padding: '20px 30px', borderRadius: 18, background: red ? `${C.red}22` : '#10161C', border: `2px solid ${red ? C.red : C.line}`, fontFamily: F.mono, fontSize: 38, color: red ? C.red : C.text, transform: `translateX(${red ? Math.sin(t * 40) * 6 * (1 - ramp(t, broke, broke + 0.6)) : 0}px)`}}>
							{red ? '✗ ' : '~ '}{f}
						</div>
					);
				})}
			</Show>
			<Show t={t} a={ins} b={ask}>
				<Box y={480}><Big size={100}><L>git</L> — твоя<br />страховка</Big></Box>
				<Box y={860} o={pop(t, a('збереження'))}><span style={{fontSize: 52, fontWeight: 800}}>як <L>збереження в грі</L></span></Box>
				<Box y={1000} o={pop(t, a('коду'))}><span style={{display: 'inline-block', padding: '20px 40px', borderRadius: 999, background: `${C.lime}1F`, border: `2px solid ${C.lime}`, color: C.lime, fontWeight: 800, fontSize: 44}}>💾 Збережено ✓</span></Box>
			</Show>
			<Show t={t} a={ask} b={points}>
				<Box y={560} o={1 - ramp(t, a('Встав') - 0.6, a('Встав') - 0.3)}><Big size={96}>Попроси<br /><L>Claude</L></Big></Box>
				<PromptCard t={t} a={a('Встав')} b={a('коміт', 27)} text={prompt('git', 'git-init')} y={260} label="Claude Code" />
				<Show t={t} a={a('У', 18)} b={points}>
					<div style={{position: 'absolute', left: 84, width: 856, top: 1060, padding: '26px 34px', borderRadius: 26, background: '#10161C', border: `2px solid ${C.line}`, fontFamily: F.mono, fontSize: 38}}>
						<div style={{color: C.dim, fontSize: 28, marginBottom: 12}}>.gitignore — не в історію</div>
						<span style={{opacity: pop(t, a('node_modules'))}}>node_modules/</span>{'   '}<span style={{opacity: pop(t, a('.env')), color: C.lime}}>.env</span>
					</div>
				</Show>
			</Show>
			<Show t={t} a={points} b={check}>
				<Box y={330}><Big size={76}>Точки, до яких<br /><L>можна повернутися</L></Big></Box>
				<div style={{position: 'absolute', left: 140, width: 744, top: 800, height: 6, borderRadius: 3, background: C.line}} />
				{[a("з'являються"), a('точки'), a('можна'), bad].map((s, i) => {
					const red = i === 3;
					const o = pop(t, s) * (red ? 1 - ramp(t, back, back + 0.5) : 1);
					return <div key={i} style={{position: 'absolute', left: 140 + i * 220, top: 770, width: 66, height: 66, borderRadius: 33, background: red ? C.red : C.lime, opacity: o, transform: `scale(${0.6 + pop(t, s) * 0.4})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bg, fontSize: 36, fontWeight: 900}}>{red ? '✗' : '✓'}</div>;
				})}
				<Box y={960} o={pop(t, cmd)}>
					<span style={{display: 'inline-block', padding: '24px 40px', borderRadius: 22, background: '#0D1318', border: `2px solid ${C.line}`, fontFamily: F.mono, fontSize: 48}}>
						<L>{'> '}</L>{typed('git restore .', t, cmd, cmd + 0.8)}
					</span>
				</Box>
				<Box y={1150} o={pop(t, back)}><span style={{fontSize: 50, fontWeight: 800}}>↩ <L>і як було</L></span></Box>
			</Show>
			<Show t={t} a={check} b={Infinity}>
				<Check t={t} a={check} y={420}>У проєкті є перший коміт, і ти знаєш, як до нього повернутися</Check>
				<Box y={1000} o={pop(t, a('Забув'))}><span style={{fontSize: 46, fontWeight: 800}}>Забув команду?<br />Попроси <L>Claude</L> відкотити</span></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0.2, 'warp-slide.mp3', 0.2], [a('ламає'), 'bass-hit-futuristic.mp3', 0.3],
	[a('коду'), 'sparkle-touch.mp3', 0.35], [a('Встав'), 'typewriter-hit-soft.mp3', 0.22],
	[a('node_modules'), 'soft-pop.wav', 0.35], [a('.env'), 'soft-pop.wav', 0.35],
	[a("з'являються"), 'soft-pop.wav', 0.3], [a('точки'), 'soft-pop.wav', 0.3], [a('можна'), 'soft-pop.wav', 0.3],
	[a('Зміна'), 'bass-hit-futuristic.mp3', 0.2], [a('Одна'), 'typewriter-hit-soft.mp3', 0.22], [a('знову'), 'whoosh-fast.mp3', 0.25],
	[a('Перевір'), 'shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea011: React.FC = () => <StepVideo dir="ideas/idea-011" words={WORDS} next="Спершу план, потім код" sfx={SFX} scenes={Scenes} />;
