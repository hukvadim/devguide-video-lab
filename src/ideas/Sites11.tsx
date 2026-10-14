import React from 'react';
import {F} from '../system/kit';
import {at, Big, Box, Chips, Cue, Fit, L, LHead, Pill, pop, prompt, Reply, Show, stepFrames, StepVideo, Ticks, Title, UserMsg, useTheme, Win} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-11/words.json';

// Sites-11 «Скільки часу і яка ціна» (шлях websites, крок estimate). Сценарій: public/ideas/sites-11/scenario.md.
// Задачі й години в таблиці — приклад оцінки, а не реальний проєкт.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_11 = stepFrames(WORDS);
const TASKS: [string, string, string][] = [['Перший екран', '2 год', 'перший'], ['Меню', '2 год', 'меню'], ['Відгуки', '1,5 год', 'відгуки'], ['Контакти', '1 год', 'контакти'], ['Форма', '1,5 год', 'форма']];

const Formula: React.FC<{t: number; parts: [React.ReactNode, number][]}> = ({t, parts}) => (
	<Box y={620} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: '10px 22px'}}>
		{parts.map(([p, a0], i) => <span key={i} style={{opacity: pop(t, a0), transform: `translateY(${(1 - pop(t, a0)) * 30}px)`}}><Big size={92}>{p}</Big></span>)}
	</Box>
);

const Scenes = (t: number) => {
	const T = useTheme();
	const q = a('часу'), calc = a('Рахунок'), rate = a('Ставку'), hours = a('А', 19), sum = a('Внизу'), deal = a('домовляєшся'), last = a('І', 50.5);
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
				<Formula t={t} parts={[['20 $/год', a('двадцять')], [<L key="x">×</L>, a('десять')], ['10 год', a('десять')], ['=', a('двісті')], [<span key="r" style={{color: T.accent}}>200 $</span>, a('двісті')]]} />
				<Box y={900} o={pop(t, a('Наприклад'))}><span style={{fontSize: 40, color: T.dim, fontWeight: 700}}>приклад</span></Box>
			</Show>
			<Show t={t} a={rate} b={hours}>
				<Box y={380}><Big size={92}>Ставка — <L>твоя</L></Big></Box>
				<Chips t={t} y={660} size={48} items={[['обираєш сам', a('обираєш')], ['або питаєш AI', a('питаєш')], ['на старті', a('старті')]]} />
			</Show>
			<Show t={t} a={hours} b={sum}>
				<Box y={240}><Big size={84}>Години рахує <L>AI</L></Big></Box>
				<Win y={430} label="Оцінка за ТЗ" o={pop(t, a('розбиває'))}>
					{TASKS.map(([task, h, w]) => (
						<div key={task} style={{display: 'flex', justifyContent: 'space-between', fontSize: 42, fontWeight: 700, opacity: pop(t, a(w, 25))}}><span>{task}</span><span style={{fontFamily: F.mono, color: T.accent}}>{h}</span></div>
					))}
					<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 42, fontWeight: 800, color: T.accent, opacity: pop(t, a('відсотків'))}}><span>+20% на правки</span><span style={{fontFamily: F.mono}}>1,6 год</span></div>
					<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 48, fontWeight: 900, borderTop: `2px solid ${T.line}`, paddingTop: 16, opacity: pop(t, a('завжди'))}}><span>Разом</span><span style={{color: T.accent}}>≈ 10 год</span></div>
				</Win>
				<Box y={1220} o={pop(t, a('правки'))}><Big size={56}>правки будуть <L>завжди</L></Big></Box>
			</Show>
			<Show t={t} a={sum} b={a('Резервуєш')}>
				<Box y={260}><Big size={84}>Підсумок <L>для клієнта</L></Big></Box>
				<Win y={480} label="Месенджер" minH={300}>
					<UserMsg size={44} o={pop(t, a('термін'))}>Сайт — ≈ 10 годин роботи, 200 $. Термін узгодимо.</UserMsg>
				</Win>
				<Box y={900} o={pop(t, a('месенджер'))}><Pill style={{fontSize: 48}}>майже без змін → в месенджер</Pill></Box>
			</Show>
			<Show t={t} a={deal} b={last}>
				<Box y={300}><Big size={96}>Домовляйся <L>гнучко</L></Big></Box>
				<Ticks t={t} y={620} gap={150} items={[[true, 'пішло швидше — добре', a('Пішло')], [true, 'захотів більше — видно, що це нове', a('видно')]]} />
			</Show>
			<Show t={t} a={last} b={Infinity}>
				<Box y={520}><Big size={96}>і вчишся <L>оцінювати</L> себе</Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('коштувати') - 0.1, 'notify/notification-3-398649.mp3', 0.25],
	[a('двадцять'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('Внизу'), 'notify/notification-051-494246.mp3', 0.25],
	[a('двісті'), 'impact/bass-hit-futuristic.mp3', 0.3],
	[a('задачі'), 'typing/typewriter-hit-soft.mp3', 0.25],
	[a('завжди'), 'sparkle/sparkle-touch.mp3', 0.3],
];

export const Sites11: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-11" words={WORDS} next="Перша версія сайту з ТЗ" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_nodding_by_window', a('Резервуєш'), a('домовляєшся') - a('Резервуєш') - 0.1, {from: 4.5, label: <>Резервуй <L>час</L></>, labelY: 1000})]} />
);

// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------
const ScenesWide = (t: number) => {
	const T = useTheme();
	const q = a('часу'), calc = a('Рахунок'), rate = a('Ставку'), hours = a('А', 19), sum = a('Внизу'), deal = a('домовляєшся'), last = a('І', 50.5);
	return (
		<>
			<Show t={t} a={0} b={q}>
				<Fit from={420} to={1100} center>
					<Title t={t} section="ТЗ">Скільки часу <L>і яка ціна</L></Title>
				</Fit>
			</Show>
			<Show t={t} a={q} b={calc}>
				<Fit from={290} to={1340} center>
					<Win y={330} label="Клієнт" minH={260}>
						<Reply o={pop(t, q)} size={44}>А скільки це буде коштувати?</Reply>
						<Reply o={pop(t, q + 0.5)} size={44}>І скільки часу?</Reply>
					</Win>
					<Box y={800} o={pop(t, a('кожен'))}><Big size={76}>Питає <L>кожен</L> клієнт</Big></Box>
					<Box y={920} o={pop(t, a('учень'))}><Big size={76}>і кожен <L>учень</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={calc} b={rate}>
				<LHead size={80}>ставка <L>×</L> години</LHead>
				<Fit from={420} to={1340}>
					<Formula t={t} parts={[['20 $/год', a('двадцять')], [<L key="x">×</L>, a('десять')], ['10 год', a('десять')], ['=', a('двісті')], [<span key="r" style={{color: T.accent}}>200 $</span>, a('двісті')]]} />
					<Box y={900} o={pop(t, a('Наприклад'))}><span style={{fontSize: 40, color: T.dim, fontWeight: 700}}>приклад</span></Box>
				</Fit>
			</Show>
			<Show t={t} a={rate} b={hours}>
				<LHead size={92}>Ставка — <L>твоя</L></LHead>
				<Fit from={620} to={880}>
					<Chips t={t} y={660} size={48} items={[['обираєш сам', a('обираєш')], ['або питаєш AI', a('питаєш')], ['на старті', a('старті')]]} />
				</Fit>
			</Show>
			<Show t={t} a={hours} b={sum}>
				<LHead size={84}>Години рахує <L>AI</L></LHead>
				<Fit from={390} to={1440}>
					<Win y={430} label="Оцінка за ТЗ" o={pop(t, a('розбиває'))}>
						{TASKS.map(([task, h, w]) => (
							<div key={task} style={{display: 'flex', justifyContent: 'space-between', fontSize: 42, fontWeight: 700, opacity: pop(t, a(w, 25))}}><span>{task}</span><span style={{fontFamily: F.mono, color: T.accent}}>{h}</span></div>
						))}
						<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 42, fontWeight: 800, color: T.accent, opacity: pop(t, a('відсотків'))}}><span>+20% на правки</span><span style={{fontFamily: F.mono}}>1,6 год</span></div>
						<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 48, fontWeight: 900, borderTop: `2px solid ${T.line}`, paddingTop: 16, opacity: pop(t, a('завжди'))}}><span>Разом</span><span style={{color: T.accent}}>≈ 10 год</span></div>
					</Win>
					<Box y={1220} o={pop(t, a('правки'))}><Big size={56}>правки будуть <L>завжди</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={sum} b={a('Резервуєш')}>
				<LHead size={84}>Підсумок <L>для клієнта</L></LHead>
				<Fit from={420} to={1340}>
					<Win y={480} label="Месенджер" minH={300}>
						<UserMsg size={44} o={pop(t, a('термін'))}>Сайт — ≈ 10 годин роботи, 200 $. Термін узгодимо.</UserMsg>
					</Win>
					<Box y={900} o={pop(t, a('месенджер'))}><Pill style={{fontSize: 48}}>майже без змін → в месенджер</Pill></Box>
				</Fit>
			</Show>
			<Show t={t} a={deal} b={last}>
				<LHead size={92}>Домовляйся <L>гнучко</L></LHead>
				<Fit from={580} to={980}>
					<Ticks t={t} y={620} gap={150} items={[[true, 'пішло швидше — добре', a('Пішло')], [true, 'захотів більше — видно, що це нове', a('видно')]]} />
				</Fit>
			</Show>
			<Show t={t} a={last} b={Infinity}>
				<Fit from={480} to={740} center>
					<Box y={520}><Big size={96}>і вчишся <L>оцінювати</L> себе</Big></Box>
				</Fit>
			</Show>
		</>
	);
};

export const Sites11Wide: React.FC<{theme?: string; seed?: number; kicker?: React.ReactNode}> = ({theme, seed, kicker}) => (
	<StepVideo wide kicker={kicker} theme={theme} seed={seed} dir="ideas/sites-11" words={WORDS} next="Перша версія сайту з ТЗ" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={ScenesWide}
		inserts={[ugc('Man_nodding_by_window', a('Резервуєш'), a('домовляєшся') - a('Резервуєш') - 0.1, {from: 4.5, label: <>Резервуй <L>час</L></>, labelY: 1000})]} />
);
