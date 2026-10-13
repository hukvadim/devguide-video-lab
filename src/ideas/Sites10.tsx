import React from 'react';
import {Big, Box, Chips, Cue, L, Mono, PromptCard, Show, StepVideo, Ticks, Title, UserMsg, Win, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-10/words.json';

// Sites-10 «★ tz.md: без ТЗ не починаємо» (шлях websites, крок tz). Сценарій: public/ideas/sites-10/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_10 = stepFrames(WORDS);

const Scenes = (t: number) => {
	const T = useTheme();
	const bad = a('результат'), take = a('Береш'), ready = a('Коли'), show = a('Показуєш');
	return (
		<>
			<Show t={t} a={0} b={a('без')}>
				<Title t={t} section="ТЗ" size={96}>★ <Mono>tz.md</Mono>: без ТЗ <L>не починаємо</L></Title>
			</Show>
			<Show t={t} a={bad} b={take}>
				<Box y={380}><Big size={100}>Без ТЗ — <span style={{color: T.red}}>жах</span></Big></Box>
				<Box y={680} o={pop(t, a('Ніхто'))}><Big size={76}>Спершу <L>зрозумій</L>, що робиш</Big></Box>
			</Show>
			<Show t={t} a={take} b={ready}>
				<Chips t={t} y={250} size={42} items={[['листування', a('листування')], ['→ AI', a('нейромережу')]]} />
				<PromptCard t={t} a={a('просиш')} b={a('tz.md') + 0.8} y={420} size={36} text={prompt('tz', 'tz').split('\n').slice(0, 4).join('\n')} />
			</Show>
			<Show t={t} a={ready} b={show}>
				<Box y={250}><Big size={84}>Коли ТЗ <L>готове</L>?</Big></Box>
				<Ticks t={t} y={470} gap={130} items={[[true, 'блоки й розділи', a('блоки')], [true, 'контакти зібрані', a('контакти')]]} />
				<Chips t={t} y={740} size={40} items={[['телефон', a('телефон')], ['Telegram', a('Telegram')], ['Viber', a('Viber')], ['адреса', a('адреса')]]} />
				<Ticks t={t} y={980} items={[[true, 'конкуренти знайдені', a('конкуренти')]]} />
			</Show>
			<Show t={t} a={show} b={Infinity}>
				<Win y={360} label="Клієнт" minH={260}>
					<UserMsg size={40} o={pop(t, show)}>Ось ТЗ на ваш сайт: tz.md</UserMsg>
					<div style={{alignSelf: 'flex-start', opacity: pop(t, a('так')), fontSize: 58, fontWeight: 800}}>Так, це <L>воно</L> ✓</div>
				</Win>
				<Box y={860} o={pop(t, a('Тільки'))}><Big size={96}>Тільки тоді <L>починаєш</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('результат'), 'impact/bass-hit-futuristic.mp3', 0.3],
	[a('листування'), 'click/mouse-click-352734.mp3', 0.35],
	[a('Коли'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('конкуренти'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('так'), 'notify/ding-101492.mp3', 0.3],
];

export const Sites10: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-10" words={WORDS} next="Скільки часу і яка ціна" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Stop', a('без'), a('результат') - a('без') - 0.05, {label: <>Без <L>ТЗ</L>?</>, labelY: 1000})]} />
);
