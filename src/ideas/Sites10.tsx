import React from 'react';
import {Big, Box, Chips, Cue, L, Mono, Pill, PromptCard, Reply, Show, StepVideo, Title, UserMsg, Win, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-10/words.json';

// Sites-10 «★ tz.md: без ТЗ не починаємо» (шлях websites, крок tz). Сценарій: public/ideas/sites-10/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_10 = stepFrames(WORDS);

const SECTIONS = ['Мета і як зрозуміти, що працює', 'Аудиторія', 'Сторінки і блоки', 'Контакти', 'Функції: що входить і що ні', 'Контент', 'Дизайн і конкуренти', 'Технічне', 'Відкриті питання'];

/** tz.md: 9 розділів з'являються по одному, активний — останній. */
const Doc: React.FC<{t: number; at: number[]}> = ({t, at: times}) => {
	const T = useTheme();
	const cur = times.filter((x) => t >= x).length - 1;
	return (
		<Win y={260} label="tz.md" mono>
			{SECTIONS.map((s, i) => (
				<div key={s} style={{display: 'flex', gap: 18, fontSize: 36, textAlign: 'left', opacity: t >= times[i] ? (i === cur ? 1 : 0.55) : 0.12, color: i === cur ? T.accent : T.text, fontWeight: i === cur ? 800 : 500}}>
					<span style={{minWidth: 40}}>{i + 1}.</span><span>{s}</span>
				</div>
			))}
		</Win>
	);
};

const Scenes = (t: number) => {
	const T = useTheme();
	const bad = a('результат'), take = a('Береш'), sec = a('Мета'), tip = a('Порада'), show = a('Показуєш');
	const st = [sec, a('Для'), a('Які'), a('Контакти'), a('Функції'), a('Контент'), a('Дизайн'), a('Технічне'), a('відкриті')];
	const detail: [string, number][] = t >= st[7] ? [['стек', a('стек')], ['хостинг', a('хостинг')], ['домен', a('домен')]]
		: t >= st[6] ? [['3–5 конкурентів з Google', a('конкурентів')]]
		: t >= st[4] ? [['форми', a('форми')], ['бронювання', a('бронювання')], ['оплата', a('оплата')], ['✗ що не входить', a('входить')]]
		: t >= st[3] ? [['телефон', a('телефон')], ['Telegram', a('Telegram')], ['Viber', a('Viber')], ['адреса', a('адреса')]]
		: [];
	return (
		<>
			<Show t={t} a={0} b={a('без')}>
				<Title t={t} section="ТЗ" size={96}>★ <Mono>tz.md</Mono>: без ТЗ <L>не починаємо</L></Title>
			</Show>
			<Show t={t} a={bad} b={take}>
				<Box y={380}><Big size={100}>Без ТЗ — <span style={{color: T.red}}>жах</span></Big></Box>
				<Box y={680} o={pop(t, a('Ніхто'))}><Big size={76}>Спершу <L>зрозумій</L>, що робиш</Big></Box>
				<Box y={960} o={pop(t, a('Ні', 10))}><Big size={60}>ні ти, ні <L>AI</L></Big></Box>
			</Show>
			<Show t={t} a={take} b={sec}>
				<Chips t={t} y={250} size={42} items={[['листування', a('листування')], ['→ AI', a('нейромережу')]]} />
				<PromptCard t={t} a={a('просиш')} b={a('tz.md') + 0.8} y={420} size={36} text={prompt('tz', 'tz').split('\n')[0]} />
				<Box y={900} o={pop(t, a('дев'))}><Pill style={{fontSize: 56, padding: '20px 44px'}}>9 розділів</Pill></Box>
			</Show>
			<Show t={t} a={sec} b={tip}>
				<Doc t={t} at={st} />
				<Chips t={t} y={1110} size={40} items={detail} />
			</Show>
			<Show t={t} a={tip} b={show}>
				<Box y={250}><Big size={84}>Порада</Big></Box>
				<Win y={440} label="Claude" minH={500}>
					<UserMsg size={36} o={pop(t, a('попроси'))}>{prompt('tz', 'client-review')}</UserMsg>
					<Reply o={pop(t, a('вистачає'))} size={40}>Як власниця: не бачу годин роботи і меню з цінами.</Reply>
				</Win>
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
	[a('Мета'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('Контакти'), 'pop/soft-pop.wav', 0.3],
	[a('Функції'), 'pop/soft-pop.wav', 0.3],
	[a('Дизайн'), 'pop/soft-pop.wav', 0.3],
	[a('Порада'), 'notify/notification-051-494246.mp3', 0.25],
	[a('так'), 'notify/ding-101492.mp3', 0.3],
];

export const Sites10: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-10" words={WORDS} next="Скільки часу і яка ціна" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Stop', a('без'), a('результат') - a('без') - 0.05, {label: <>Без <L>ТЗ</L>?</>, labelY: 1000})]} />
);
