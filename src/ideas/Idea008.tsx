import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, ramp} from '../system/kit';
import {Big, Box, Check, Cue, L, Reply, Show, Steps, StepVideo, Strike, Term, Title, UserMsg, Win, at, pop, prompt, PromptCard, stepFrames, Mono, useTheme} from '../system/step';
import WORDS from '../../public/ideas/idea-008/words.json';

// ID-008 «Встанови Claude Code» (крок claude-code-install), шорт 1080×1920. Сценарій: public/ideas/idea-008/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_008 = stepFrames(WORDS);

export const Scenes = (t: number) => {
	const T = useTheme();
	const stuck = a('Саме'), noSearch = a('Тому'), lead = a('Нехай'), paste = a('Відкрий', 11), simple = a('Далі', 22), err = a('Бачиш'), shot = a('Зроби'), run = a('Коли'), check = a('Відповів');
	return (
		<>
			<Show t={t} a={0} b={stuck}>
				<Title t={t} section="Робоче місце">Встанови <L>Claude Code</L></Title>
			</Show>
			<Show t={t} a={stuck} b={lead}>
				<Box y={420}><Big size={92}>Тут застрягають <L>найчастіше</L></Big></Box>
				{['Інструкція №1', 'Відео на 40 хв', 'Форум, 2019 рік'].map((s, i) => (
					<Box key={s} y={840 + i * 150} o={pop(t, noSearch + i * 0.25)}>
						<div style={{display: 'inline-block', padding: '22px 40px', borderRadius: 22, background: T.card, border: `2px solid ${T.line}`, fontSize: 46, fontWeight: 700}}>
							<Strike p={ramp(t, noSearch + 1 + i * 0.2, noSearch + 1.4 + i * 0.2)}>{s}</Strike>
						</div>
					</Box>
				))}
			</Show>
			<Show t={t} a={lead} b={paste - 0.2}>
				<Box y={640}><Big size={100}>Тебе веде<br /><L>Claude</L> у чаті</Big></Box>
			</Show>
			<Show t={t} a={paste} b={simple}>
				<PromptCard t={t} a={a('встав') - 0.1} b={a('екрані') + 0.3} text={prompt('claude-code-install', 'install')} y={400} />
			</Show>
			<Show t={t} a={simple} b={err}>
				<Box y={380}><Big size={88}>Далі <L>просто</L></Big></Box>
				<Steps t={t} y={640} items={[['1', 'Claude дає команду', a('команду')], ['2', 'Ти виконуєш у терміналі VS Code', a('виконуєш')], ['3', 'Пишеш, що бачиш на екрані', a('терміналі') + 0.6]]} />
			</Show>
			<Show t={t} a={err} b={run}>
				<Box y={330}><Big size={84}>Помилка?<br /><L>Скрін</L> у чат</Big></Box>
				<Term t={t} y={640} lines={[{at: err, text: 'npm install …'}, {at: err + 0.5, text: '✗ помилка встановлення', kind: 'err'}]} o={1 - ramp(t, shot + 0.3, shot + 0.8) * 0.6} />
				<AbsoluteFill style={{background: '#fff', opacity: 0.5 * (1 - ramp(t, a('скрін'), a('скрін') + 0.3)) * (t >= a('скрін') ? 1 : 0)}} />
				<Show t={t} a={a('скинь')} b={run}>
					<Win y={980} label="Чат">
						<UserMsg>📷 скрін-помилки.png</UserMsg>
						<Reply o={pop(t, a('прочитає'), 0.4)}>Бачу помилку. Зроби так: …</Reply>
					</Win>
				</Show>
			</Show>
			<Show t={t} a={run} b={check}>
				<Box y={380}><Big size={84}>Перший <L>запуск</L></Big></Box>
				<Term t={t} y={600} minH={520} lines={[
					{at: a('слово'), text: 'claude'},
					{at: a('Увійди'), text: '✓ вхід в акаунт виконано', kind: 'ok'},
					{at: a('напиши', 41), text: 'привіт'},
					{at: a('напиши', 41) + 1.1, text: 'Привіт! Чим допомогти?', kind: 'out'},
				]} />
			</Show>
			<Show t={t} a={check} b={Infinity}>
				<Check t={t} a={check}>
					<Mono>claude</Mono> у терміналі відповідає на «привіт»
				</Check>
			</Show>
		</>
	);
};

export const SFX: Cue[] = [
	[0, 'whoosh-swirl.mp3', 0.35],
	[a('Саме'), 'bass-hit-futuristic.mp3', 0.2],
	[a('встав'), 'typewriter-hit-soft.mp3', 0.22],
	[a('команду'), 'soft-pop.wav', 0.4], [a('виконуєш'), 'soft-pop.wav', 0.4], [a('терміналі') + 0.6, 'soft-pop.wav', 0.4],
	[a('скрін'), 'camera-shutter-hard.mp3', 0.3], [a('скинь'), 'whoosh-fast.mp3', 0.25],
	[a('слово'), 'typewriter-hit-soft.mp3', 0.22], [a('Увійди'), 'lock-digital.mp3', 0.3],
	[a('Відповів'), 'shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea008: React.FC = () => <StepVideo dir="ideas/idea-008" words={WORDS} next="Claude Code: перший проєкт" sfx={SFX} scenes={Scenes} />;
