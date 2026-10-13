import React from 'react';
import {F} from '../system/kit';
import {Big, Box, Cue, L, PromptCard, Reply, Show, StepVideo, Title, Win, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-11/words.json';

// Sites-11 «Скільки часу і яка ціна» (шлях websites, крок estimate). Сценарій: public/ideas/sites-11/scenario.md.
// Задачі й години в таблиці — приклад оцінки, а не реальний проєкт.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_11 = stepFrames(WORDS);
const TASKS: [string, string][] = [['Перший екран', '2 год'], ['Меню', '2 год'], ['Відгуки', '1,5 год'], ['Контакти і форма', '2,5 год'], ['+20% на правки', '1,6 год']];

const Formula: React.FC<{t: number; parts: [React.ReactNode, number][]}> = ({t, parts}) => (
	<Box y={620} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: '10px 22px'}}>
		{parts.map(([p, a0], i) => <span key={i} style={{opacity: pop(t, a0), transform: `translateY(${(1 - pop(t, a0)) * 30}px)`}}><Big size={92}>{p}</Big></span>)}
	</Box>
);

const Scenes = (t: number) => {
	const T = useTheme();
	const q = a('часу'), calc = a('Рахунок'), rate = a('Ставку'), split = a('Даєш'), deal = a('домовляєшся');
	return (
		<>
			<Show t={t} a={0} b={q}>
				<Title t={t} section="ТЗ">Скільки часу <L>і яка ціна</L></Title>
			</Show>
			<Show t={t} a={q} b={calc}>
				<Win y={330} label="Клієнт" minH={260}>
					<Reply o={pop(t, q)} size={44}>А скільки це буде коштувати?</Reply>
					<Reply o={pop(t, q + 0.5)} size={44}>І скільки часу?</Reply>
				</Win>
				<Box y={800} o={pop(t, a('кожен'))}><Big size={76}>Питає <L>кожен</L> клієнт</Big></Box>
				<Box y={920} o={pop(t, a('учень'))}><Big size={76}>і кожен <L>учень</L></Big></Box>
			</Show>
			<Show t={t} a={calc} b={rate}>
				<Box y={330}><Big size={80}>ставка <L>×</L> години</Big></Box>
				<Formula t={t} parts={[['20 $/год', a('Двадцять')], [<L key="x">×</L>, a('десять')], ['10 год', a('десять')], ['=', a('двісті')], [<span key="r" style={{color: T.accent}}>200 $</span>, a('двісті')]]} />
			</Show>
			<Show t={t} a={rate} b={a('Резервуєш')}>
				<PromptCard t={t} a={rate + 0.2} b={split} y={250} size={34} text={prompt('estimate', 'estimate').split('\n')[0]} />
				<Win y={760} label="Оцінка" o={pop(t, a('розбиває'))}>
					{TASKS.map(([task, h], i) => (
						<div key={task} style={{display: 'flex', justifyContent: 'space-between', fontSize: 40, fontWeight: 700, opacity: pop(t, a('задачі') + i * 0.3)}}><span>{task}</span><span style={{fontFamily: F.mono, color: T.accent}}>{h}</span></div>
					))}
					<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 46, fontWeight: 900, borderTop: `2px solid ${T.line}`, paddingTop: 16, opacity: pop(t, a('кожну'))}}><span>Разом</span><span style={{color: T.accent}}>≈ 10 год</span></div>
				</Win>
			</Show>
			<Show t={t} a={deal} b={Infinity}>
				<Box y={420}><Big size={100}>Домовляйся <L>гнучко</L></Big></Box>
				<Box y={720} o={pop(t, a('вчишся'))}><Big size={76}>і вчишся <L>оцінювати</L> себе</Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('коштувати') - 0.1, 'notify/notification-3-398649.mp3', 0.25],
	[a('Двадцять'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('двісті'), 'impact/bass-hit-futuristic.mp3', 0.3],
	[a('задачі'), 'typing/typewriter-hit-soft.mp3', 0.25],
	[a('кожну'), 'sparkle/sparkle-touch.mp3', 0.3],
];

export const Sites11: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-11" words={WORDS} next="Перша версія сайту з ТЗ" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_nodding_by_window', a('Резервуєш'), a('домовляєшся') - a('Резервуєш') - 0.1, {from: 4.5, label: <>Резервуй <L>час</L></>, labelY: 1000})]} />
);
