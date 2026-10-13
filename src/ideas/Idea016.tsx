import React from 'react';
import {C, F, ramp} from '../system/kit';
import {Big, Box, Check, Chips, Cue, L, PromptCard, Show, StepVideo, Term, at, pop, prompt, stepFrames, Mono} from '../system/step';
import WORDS from '../../public/ideas/idea-016/words.json';

// ID-016 «Свій skill: процес в одну команду» (крок own-skill), шорт 1080×1920. Сценарій: public/ideas/idea-016/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_016 = stepFrames(WORDS);

const TOPICS = ['Бізнес', 'аудиторія', 'сторінки', 'функції', 'дизайн', 'бюджет', 'терміни'];

const Scenes = (t: number) => {
	const dg = a('Так'), ex = a('Приклад'), ask = a('Попроси'), now = a('Тепер'), done = a('Твій');
	const third = a('утретє'), pack = a('пакуй');
	const merge = ramp(t, pack, pack + 0.5);
	return (
		<>
			<Show t={t} a={0} b={dg}>
				<Box y={280}><Big size={84}>Утретє —<br /><L>пакуй у skill</L></Big></Box>
				{[0.2, 0.7, third].map((s, i) => (
					<div key={i} style={{position: 'absolute', left: 540 - 60 + (i - 1) * 200 * (1 - merge), top: 760, width: 120, height: 120, borderRadius: 60, opacity: pop(t, s) * (1 - merge), background: i === 2 && t >= third ? C.lime : '#1B2530', border: `3px solid ${C.lime}`, color: i === 2 && t >= third ? C.bg : C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 60}}>{i + 1}</div>
				))}
				<Box y={960} o={merge}><span style={{display: 'inline-block', padding: '24px 50px', borderRadius: 999, background: C.lime, color: C.bg, fontFamily: F.mono, fontSize: 48, fontWeight: 500}}>/skill</span></Box>
			</Show>
			<Show t={t} a={dg} b={ex}>
				<Box y={560}><Big size={92}>Так працюють<br />у <L>DevGuide</L></Big></Box>
			</Show>
			<Show t={t} a={ex} b={ask}>
				<Box y={280}><Big size={64}>Інтерв'ю з клієнтом:<br /><L>щоразу те саме</L></Big></Box>
				<Box y={640} o={pop(t, a('Щоразу')) * (1 - ramp(t, a('Бізнес') - 0.4, a('Бізнес')))}><Big size={84}>ті самі<br /><L>питання</L></Big></Box>
				<Chips t={t} y={620} size={44} items={TOPICS.map((w): [string, number] => [w.toLowerCase(), a(w, ex)])} />
			</Show>
			<Show t={t} a={ask} b={now}>
				<PromptCard t={t} a={ask} b={a('викликати')} text={prompt('own-skill', 'skill')} y={240} size={38} />
				<Box y={1180} o={pop(t, a("дев'яти"))}><span style={{display: 'inline-block', padding: '18px 36px', borderRadius: 999, background: `${C.lime}1F`, border: `2px solid ${C.lime}`, color: C.lime, fontFamily: F.mono, fontSize: 38}}>tz.md · 9 розділів</span></Box>
			</Show>
			<Show t={t} a={now} b={done}>
				<Box y={300}><Big size={84}>Одна <L>команда</L></Big></Box>
				<Term t={t} y={560} label="Нова сесія" lines={[
					{at: a('пишеш'), text: '/tz-interview'},
					{at: a('проводить'), text: 'Розкажіть про бізнес клієнта…', kind: 'out'},
					{at: a('зберігає', now), text: '✓ tz.md збережено', kind: 'ok'},
				]} />
			</Show>
			<Show t={t} a={done} b={Infinity}>
				<Check t={t} a={done} y={480}><Mono>/tz-interview</Mono> у новій сесії проводить інтерв'ю і зберігає tz.md</Check>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0.2, 'pop/soft-pop.wav', 0.35], [0.7, 'pop/soft-pop.wav', 0.35], [a('утретє'), 'pop/soft-pop.wav', 0.4], [a('пакуй'), 'impact/impact-cine-big.mp3', 0.25],
	...TOPICS.map((w): Cue => [a(w, a('Приклад')), 'pop/soft-pop.wav', 0.22]),
	[a('Попроси'), 'typing/typewriter-hit-soft.mp3', 0.22], [a("дев'яти"), 'click/lock-digital.mp3', 0.25],
	[a('пишеш'), 'typing/typewriter-hit-soft.mp3', 0.22], [a('зберігає', a('Тепер')), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea016: React.FC = () => <StepVideo dir="ideas/idea-016" words={WORDS} next="Йдемо до клієнта" sfx={SFX} scenes={Scenes} />;
