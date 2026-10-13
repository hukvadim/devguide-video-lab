import React from 'react';
import {Big, Box, Chips, Cue, L, Reply, Show, StepVideo, Ticks, Title, UserMsg, Win, at, pop, prompt, stepFrames} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-09/words.json';

// Sites-09 «Два чати: клієнт і помічник» (шлях websites, крок client-chat). Сценарій: public/ideas/sites-09/scenario.md.
// Репліки «клієнта» й «помічника» — приклад, як це виглядає, а не справжнє листування.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_09 = stepFrames(WORDS);

const Scenes = (t: number) => {
	const two = a('Відкриваємо'), c1 = a('У'), c2 = a('У', 12), save = a('Чати', 25), after = a('Навіть');
	return (
		<>
			<Show t={t} a={0} b={two}>
				<Title t={t} section="Імітація клієнта">Два чати: <L>клієнт і помічник</L></Title>
			</Show>
			<Show t={t} a={two} b={c1}>
				<Box y={360}><Big size={100}>Два <L>чати</L></Big></Box>
				<Win y={620} x={84} w={414} label="Чат 1" o={pop(t, a('два'))} minH={360}><Big size={52}>Клієнт</Big></Win>
				<Win y={620} x={526} w={414} label="Чат 2" o={pop(t, a('чати'))} minH={360}><Big size={52}>Помічник</Big></Win>
			</Show>
			<Show t={t} a={c1} b={c2}>
				<Box y={260}><Big size={80}>AI грає <L>клієнта</L></Big></Box>
				<Win y={420} label="Чат 1 · Клієнт" minH={700}>
					<UserMsg size={38} o={pop(t, a('першому'))}>{prompt('client-chat', 'client-role').split('\n')[0]}</UserMsg>
					<Reply o={pop(t, a('власницю'))} size={42}>Добрий день! Хочу сайт для кав'ярні, але в цьому всьому не розбираюсь.</Reply>
					<Reply o={pop(t, a('як', 11))} size={42}>Зробіть, будь ласка, <L>як у конкурентів</L></Reply>
				</Win>
			</Show>
			<Show t={t} a={c2} b={save}>
				<Chips t={t} y={250} size={42} items={[['Telegram', a('Telegram')], ['Viber', a('Viber')]]} />
				<Win y={400} label="Чат 2 · Помічник" minH={760}>
					<UserMsg size={38} o={pop(t, a('копіюєш'))}>«Хочу як у конкурентів. Скільки коштує?» — що відповісти?</UserMsg>
					<Reply o={pop(t, a('відповісти'))} />
					<UserMsg size={38} o={pop(t, a('ставку'))}>Моя ставка — 20 $/год</UserMsg>
					<Reply o={pop(t, a('рахує'))} size={40}>≈ 10 год × 20 $ = <L>200 $</L></Reply>
				</Win>
			</Show>
			<Show t={t} a={after} b={Infinity}>
				<Box y={320}><Big size={88}>Кілька повідомлень = <L>розуміння</L></Big></Box>
				<Ticks t={t} y={700} items={[[true, '«Клієнт» збережено', after + 0.3], [true, '«Помічник» збережено', after + 0.7], [true, 'знаєш, як почати', a('почати')]]} />
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('два'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('власницю'), 'notify/notification-3-398649.mp3', 0.25],
	[a('копіюєш'), 'click/mouse-click-352734.mp3', 0.35],
	[a('Telegram'), 'notify/ding-126626.mp3', 0.2],
	[a('рахує'), 'sparkle/sparkle-touch.mp3', 0.3],
];

export const Sites09: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-09" words={WORDS} next="★ tz.md: без ТЗ не починаємо" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_reacting_to_smartphone', a('Чати', 25), a('Навіть') - a('Чати', 25) - 0.1, {from: 4.5, label: <>Збережи <L>чати</L></>, labelY: 1000})]} />
);
