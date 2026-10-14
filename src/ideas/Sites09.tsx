import React from 'react';
import {at, Big, Box, Chips, Cue, Fit, L, LHead, Pill, pop, prompt, Reply, Show, stepFrames, StepVideo, Ticks, Title, UserMsg, useTheme, Win} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-09/words.json';

// Sites-09 «Два чати: клієнт і помічник» (шлях websites, крок client-chat). Сценарій: public/ideas/sites-09/scenario.md.
// v2 (2026-10-13, за словами Вадима): спілкування будь-де → усе в текст → «ось завдання» → цикл правок → тренування на двох чатах.
// Репліки клієнта й помічника — приклад, як це виглядає, а не справжнє листування.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_09 = stepFrames(WORDS);

/** Цикл правок: вузли по колу, активний — останній; у центрі — підсумок з моменту mid. */
const Loop: React.FC<{t: number; items: [string, number][]; mid: number}> = ({t, items, mid}) => {
	const T = useTheme();
	const cur = items.filter(([, a0]) => t >= a0).length - 1;
	const R = 310, cx = 540, cy = 860;
	return (
		<>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<circle cx={cx} cy={cy} r={R} fill="none" stroke={T.line} strokeWidth={4} strokeDasharray="14 14" opacity={pop(t, items[0][1])} />
			</svg>
			{items.map(([txt, a0], i) => {
				const ang = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
				const p = pop(t, a0, 0.35), on = i === cur;
				return (
					<div key={i} style={{position: 'absolute', left: cx + Math.cos(ang) * R - 170, top: cy + Math.sin(ang) * R - 50, width: 340, textAlign: 'center', opacity: p, transform: `scale(${(0.7 + p * 0.3) * (on ? 1.1 : 1)})`}}>
						<Pill on={on} style={{fontSize: 36}}>{txt}</Pill>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: cx - 200, top: cy - 70, width: 400, textAlign: 'center', opacity: pop(t, mid)}}><Big size={60}>якісно й <L>точно</L></Big></div>
		</>
	);
};

const Scenes = (t: number) => {
	const T = useTheme();
	const where = a('Upwork'), pain = a('Важливо'), text = a('Рішення'), task = a('Потім'), loop = a('Далі', 38), learn = a('два', 51), helper = a('У', 58), save = a('Обидва');
	return (
		<>
			<Show t={t} a={0} b={where}>
				<Title t={t} section="Імітація клієнта">Два чати: <L>клієнт і помічник</L></Title>
			</Show>
			<Show t={t} a={where} b={pain}>
				<Box y={260}><Big size={84}>Спілкуєшся <L>де завгодно</L></Big></Box>
				<Chips t={t} y={520} size={50} items={[['Upwork', where], ['Fiverr', a('Fiverr')], ['Telegram', a('Telegram')], ['Viber', a('Viber')], ['телефон', a('телефону')], ['наживо', a('наживо')]]} />
				<Box y={1000} o={pop(t, a('Канал'))}><Big size={64}>канал <L>не важливий</L></Big></Box>
			</Show>
			<Show t={t} a={pain} b={text}>
				<Box y={380}><Big size={88}>Поговорив <L>наживо</L>…</Big></Box>
				<Box y={680} o={pop(t, a('не', 15))}><Big size={84}>і не знаю, <span style={{color: T.red}}>що робити</span></Big></Box>
			</Show>
			<Show t={t} a={text} b={task}>
				<Box y={240}><Big size={84}>Усе — <L>у текст</L></Big></Box>
				<Ticks t={t} y={460} gap={112} size={46} items={[[true, 'голосове собі в Telegram', a('голосове')], [true, 'скріни переписки', a('скріни')], [true, 'скопійований текст', a('скопіював')], [true, 'файл з ТЗ', a('файл')], [true, 'PDF з роботами', a('PDF')], [true, 'плейлист з відгуками', a('плейлист')]]} />
			</Show>
			<Show t={t} a={task} b={loop}>
				<Box y={240}><Big size={84}>«Ось <L>завдання</L>»</Big></Box>
				<Win y={440} label="Claude Code" minH={520}>
					<UserMsg size={38} o={pop(t, a('кажеш'))}>Ось завдання: голосове.txt, 3 скріни, tz.pdf</UserMsg>
					<Reply o={pop(t, a('робить'))} size={40}>Зрозумів. План: головна, меню, форма бронювання. Починаю.</Reply>
				</Win>
				<Box y={1080} o={pop(t, a('клієнту', 36))}><Big size={60}>саме те, що треба <L>клієнту</L></Big></Box>
			</Show>
			<Show t={t} a={loop} b={a('А', 49)}>
				<Box y={240}><Big size={80}>Далі — <L>цикл</L></Big></Box>
				<Loop t={t} mid={a('якісно')} items={[['показав', a('показав')], ['клієнт прокоментував', a('прокоментував')], ['скрін / текст → AI', a('скрін', 41)], ['виправила', a('виправила')], ['«підходить!»', a('підходить')]]} />
			</Show>
			<Show t={t} a={learn} b={helper}>
				<Box y={240}><Big size={80}>Тренування: <L>два чати</L></Big></Box>
				<Win y={440} label="Чат 1 · Клієнт" minH={640}>
					<UserMsg size={34} o={pop(t, a('першому'))}>{prompt('client-chat', 'client-role').split('\n')[0]}</UserMsg>
					<Reply o={pop(t, a('власницю'))} size={42}>Привіт! Мені вас порадили. Потрібен сайт, скільки це коштуватиме?</Reply>
				</Win>
			</Show>
			<Show t={t} a={helper} b={save}>
				<Win y={300} label="Чат 2 · Помічник" minH={820}>
					<UserMsg size={38} o={pop(t, a('вставляєш'))}>«Потрібен сайт, скільки коштуватиме?» — що відповісти?</UserMsg>
					<Reply o={pop(t, a('відповісти'))} />
					<UserMsg size={38} o={pop(t, a('ставку'))}>Моя ставка — 20 $/год</UserMsg>
					<Reply o={pop(t, a('рахує'))} size={44}>≈ 10 год × 20 $ = <L>200 $</L></Reply>
				</Win>
			</Show>
			<Show t={t} a={save} b={Infinity}>
				<Box y={380}><Big size={92}>Обидва чати <L>збережи</L></Big></Box>
				<Ticks t={t} y={700} items={[[true, '«Клієнт»', save + 0.2], [true, '«Помічник»', save + 0.5]]} />
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Upwork'), 'pop/soft-pop.wav', 0.3],
	[a('Viber'), 'pop/soft-pop.wav', 0.3],
	[a('не', 15), 'glitch/small-electric-glitch-2595.wav', 0.25],
	[a('Рішення'), 'impact/bass-hit-futuristic.mp3', 0.25],
	[a('голосове'), 'notify/notification-3-398649.mp3', 0.25],
	[a('PDF'), 'pop/bubble-pop-406640.mp3', 0.25],
	[a('завдання'), 'typing/typewriter-digital.mp3', 0.18],
	[a('показав'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('підходить'), 'notify/ding-101492.mp3', 0.3],
	[a('власницю'), 'notify/notification-051-494246.mp3', 0.25],
	[a('рахує'), 'sparkle/sparkle-touch.mp3', 0.3],
];

export const Sites09: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-09" words={WORDS} next="★ tz.md: без ТЗ не починаємо" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[
			ugc('Man_walking', a('прийшов'), a('Рішення') - a('прийшов') - 0.1, {label: <>…і що <L>робити</L>?</>, labelY: 1000}),
			ugc('Man_reacting_to_smartphone', a('А', 49), a('два', 51) - a('А', 49) - 0.1, {from: 4.5, label: <>Поки клієнтів <L>немає</L></>, labelY: 1000}),
		]} />
);

// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------
const ScenesWide = (t: number) => {
	const T = useTheme();
	const where = a('Upwork'), pain = a('Важливо'), text = a('Рішення'), task = a('Потім'), loop = a('Далі', 38), learn = a('два', 51), helper = a('У', 58), save = a('Обидва');
	return (
		<>
			<Show t={t} a={0} b={where}>
				<Fit from={420} to={1100} center>
					<Title t={t} section="Імітація клієнта">Два чати: <L>клієнт і помічник</L></Title>
				</Fit>
			</Show>
			<Show t={t} a={where} b={pain}>
				<LHead size={84}>Спілкуєшся <L>де завгодно</L></LHead>
				<Fit from={480} to={1220}>
					<Chips t={t} y={520} size={50} items={[['Upwork', where], ['Fiverr', a('Fiverr')], ['Telegram', a('Telegram')], ['Viber', a('Viber')], ['телефон', a('телефону')], ['наживо', a('наживо')]]} />
					<Box y={1000} o={pop(t, a('Канал'))}><Big size={64}>канал <L>не важливий</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={pain} b={text}>
				<Fit from={340} to={900} center>
					<Box y={380}><Big size={88}>Поговорив <L>наживо</L>…</Big></Box>
					<Box y={680} o={pop(t, a('не', 15))}><Big size={84}>і не знаю, <span style={{color: T.red}}>що робити</span></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={text} b={task}>
				<LHead size={84}>Усе — <L>у текст</L></LHead>
				<Fit from={420} to={1192}>
					<Ticks t={t} y={460} gap={112} size={46} items={[[true, 'голосове собі в Telegram', a('голосове')], [true, 'скріни переписки', a('скріни')], [true, 'скопійований текст', a('скопіював')], [true, 'файл з ТЗ', a('файл')], [true, 'PDF з роботами', a('PDF')], [true, 'плейлист з відгуками', a('плейлист')]]} />
				</Fit>
			</Show>
			<Show t={t} a={task} b={loop}>
				<LHead size={84}>«Ось <L>завдання</L>»</LHead>
				<Fit from={400} to={1340}>
					<Win y={440} label="Claude Code" minH={520}>
						<UserMsg size={38} o={pop(t, a('кажеш'))}>Ось завдання: голосове.txt, 3 скріни, tz.pdf</UserMsg>
						<Reply o={pop(t, a('робить'))} size={40}>Зрозумів. План: головна, меню, форма бронювання. Починаю.</Reply>
					</Win>
					<Box y={1080} o={pop(t, a('клієнту', 36))}><Big size={60}>саме те, що треба <L>клієнту</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={loop} b={a('А', 49)}>
				<LHead size={80}>Далі — <L>цикл</L></LHead>
				<Fit from={420} to={1340}>
					<Loop t={t} mid={a('якісно')} items={[['показав', a('показав')], ['клієнт прокоментував', a('прокоментував')], ['скрін / текст → AI', a('скрін', 41)], ['виправила', a('виправила')], ['«підходить!»', a('підходить')]]} />
				</Fit>
			</Show>
			<Show t={t} a={learn} b={helper}>
				<LHead size={80}>Тренування: <L>два чати</L></LHead>
				<Fit from={400} to={1340}>
					<Win y={440} label="Чат 1 · Клієнт" minH={640}>
						<UserMsg size={34} o={pop(t, a('першому'))}>{prompt('client-chat', 'client-role').split('\n')[0]}</UserMsg>
						<Reply o={pop(t, a('власницю'))} size={42}>Привіт! Мені вас порадили. Потрібен сайт, скільки це коштуватиме?</Reply>
					</Win>
				</Fit>
			</Show>
			<Show t={t} a={helper} b={save}>
				<Fit from={260} to={1340} center>
					<Win y={300} label="Чат 2 · Помічник" minH={820}>
						<UserMsg size={38} o={pop(t, a('вставляєш'))}>«Потрібен сайт, скільки коштуватиме?» — що відповісти?</UserMsg>
						<Reply o={pop(t, a('відповісти'))} />
						<UserMsg size={38} o={pop(t, a('ставку'))}>Моя ставка — 20 $/год</UserMsg>
						<Reply o={pop(t, a('рахує'))} size={44}>≈ 10 год × 20 $ = <L>200 $</L></Reply>
					</Win>
				</Fit>
			</Show>
			<Show t={t} a={save} b={Infinity}>
				<LHead size={92}>Обидва чати <L>збережи</L></LHead>
				<Fit from={660} to={996}>
					<Ticks t={t} y={700} items={[[true, '«Клієнт»', save + 0.2], [true, '«Помічник»', save + 0.5]]} />
				</Fit>
			</Show>
		</>
	);
};

export const Sites09Wide: React.FC<{theme?: string; seed?: number; kicker?: React.ReactNode}> = ({theme, seed, kicker}) => (
	<StepVideo wide kicker={kicker} theme={theme} seed={seed} dir="ideas/sites-09" words={WORDS} next="★ tz.md: без ТЗ не починаємо" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={ScenesWide}
		inserts={[
			ugc('Man_walking', a('прийшов'), a('Рішення') - a('прийшов') - 0.1, {label: <>…і що <L>робити</L>?</>, labelY: 1000}),
			ugc('Man_reacting_to_smartphone', a('А', 49), a('два', 51) - a('А', 49) - 0.1, {from: 4.5, label: <>Поки клієнтів <L>немає</L></>, labelY: 1000}),
		]} />
);
