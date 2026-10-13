import React from 'react';
import {C, F, ramp} from '../system/kit';
import {Big, Box, Check, Cue, L, PromptCard, Reply, Show, StepVideo, Term, UserMsg, Win, at, pop, prompt, stepFrames, typed, Mono} from '../system/step';
import WORDS from '../../public/ideas/idea-010/words.json';

// ID-010 «Правила проєкту в CLAUDE.md» (крок claude-md), шорт 1080×1920. Сценарій: public/ideas/idea-010/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_010 = stepFrames(WORDS);

const SAME = 'Проєкт на React, запуск — npm run dev…';
const Lock: React.FC<{o: number; children: React.ReactNode}> = ({o, children}) => (
	<span style={{display: 'inline-block', opacity: o, transform: `scale(${0.8 + o * 0.2})`, padding: '14px 28px', borderRadius: 999, background: `${C.red}1F`, border: `2px solid ${C.red}`, color: C.red, fontWeight: 800, fontSize: 40}}>🔒 {children}</span>
);

const Scenes = (t: number) => {
	const file = a('Для'), init = a('Створити'), more = a('Далі'), check = a('Як', 35);
	return (
		<>
			<Show t={t} a={0} b={file}>
				<Box y={300}><Big size={88}>Пояснювати <L>щоразу</L>?</Big></Box>
				{[0.3, 1.6, 2.9].map((s, i) => (
					<Win key={i} x={84 + i * 30} w={796} y={580 + i * 250} o={pop(t, s)} label={`Чат ${i + 1}`}>
						<UserMsg size={30}>{typed(SAME, t, s + 0.2, s + 1.4)}</UserMsg>
					</Win>
				))}
			</Show>
			<Show t={t} a={file} b={init}>
				<Box y={430}>
					<div style={{display: 'inline-block', padding: '60px 70px', borderRadius: 36, background: '#10161C', border: `3px solid ${C.lime}`, boxShadow: `0 40px 120px ${C.lime}26`}}>
						<div style={{fontSize: 90}}>📄</div>
						<div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 72, color: C.lime, marginTop: 10}}>CLAUDE.md</div>
					</div>
				</Box>
				<Box y={900} o={pop(t, a('Це'))}><Big size={72}>Правила <L>проєкту</L></Big></Box>
				<Box y={1080} o={pop(t, a('читає'))}><span style={{fontSize: 44, fontWeight: 700, color: '#C9D2D9'}}>Claude читає їх на початку кожної сесії</span></Box>
			</Show>
			<Show t={t} a={init} b={more}>
				<Box y={330}><Big size={88}><Mono>/init</Mono> створює файл</Big></Box>
				<Term t={t} y={600} label="Claude Code" lines={[
					{at: a('/init') - 0.4, text: '/init'},
					{at: a('подивиться'), text: '✓ CLAUDE.md створено', kind: 'ok'},
					{at: a('запише'), text: '## Стек', kind: 'out'},
					{at: a('головне'), text: '## Як запускати', kind: 'out'},
				]} />
			</Show>
			<Show t={t} a={more} b={check}>
				<Box y={560} o={1 - ramp(t, a('Встав') - 0.6, a('Встав') - 0.3)}><Big size={88}>Доповнюємо<br /><L>своїми правилами</L></Big></Box>
				<PromptCard t={t} a={a('Встав')} b={a('дозволу')} text={prompt('claude-md', 'rules')} y={250} label="Claude Code" />
				<Box y={1000} o={pop(t, a('найважливіше'))}><span style={{fontSize: 46, fontWeight: 800}}>НЕ змінювати <L c={C.red}>без дозволу</L></span></Box>
				<Box y={1090} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16}}>
					<Lock o={pop(t, a('Оплата'))}>оплата</Lock>
					<Lock o={pop(t, a('.env'))}>.env</Lock>
					<Lock o={pop(t, a('міграції'))}>міграції бази</Lock>
				</Box>
			</Show>
			<Show t={t} a={check} b={Infinity}>
				<Win y={300} label="Нова сесія">
					<UserMsg>{typed('На чому зроблено проєкт?', t, check + 0.4, a('проєкт', 39))}</UserMsg>
					<Reply o={pop(t, a('Якщо'), 0.4)}>React + Vite. Оплату, .env і міграції без дозволу не чіпаю.</Reply>
				</Win>
				<Check t={t} a={a('називає')} y={860}>Claude сам називає стек і правила, не питаючи тебе</Check>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0.5, 'typing/typewriter-hit-soft.mp3', 0.18], [1.8, 'typing/typewriter-hit-soft.mp3', 0.18], [3.1, 'typing/typewriter-hit-soft.mp3', 0.18],
	[a('Для'), 'whoosh/whoosh-fast.mp3', 0.25], [a('Це'), 'pop/soft-pop.wav', 0.4],
	[a('/init') - 0.4, 'typing/typewriter-hit-soft.mp3', 0.22], [a('подивиться'), 'click/lock-digital.mp3', 0.3],
	[a('Встав'), 'typing/typewriter-hit-soft.mp3', 0.22],
	[a('Оплата'), 'click/lock-digital.mp3', 0.2], [a('.env'), 'click/lock-digital.mp3', 0.2], [a('міграції'), 'click/lock-digital.mp3', 0.2],
	[a('запитай'), 'pop/soft-pop.wav', 0.35], [a('називає'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea010: React.FC = () => <StepVideo dir="ideas/idea-010" words={WORDS} next="Git як страховка" sfx={SFX} scenes={Scenes} />;
