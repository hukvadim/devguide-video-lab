import React from 'react';
import {F} from '../system/kit';
import {at, Big, Box, Browser, Chips, Cue, Fit, L, LHead, Pill, pop, Reply, Show, stepFrames, StepVideo, Term, Ticks, Title, UserMsg, useTheme, Win} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-12/words.json';

// Sites-12 «Перша версія сайту з ТЗ» (шлях websites, крок generate-v1). Сценарій: public/ideas/sites-12/scenario.md.
// Питання, план і сайт кав'ярні — приклад того, як це виглядає.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_12 = stepFrames(WORDS);

const Tree: React.FC<{t: number; hi: number}> = ({t, hi}) => {
	const T = useTheme();
	const on = t >= hi;
	return (
		<Win y={300} label="my-site" mono>
			{['▸ public/', '▸ src/', '  package.json'].map((r) => <div key={r} style={{fontSize: 40, color: T.dim, textAlign: 'left'}}>{r}</div>)}
			<div style={{fontSize: 44, textAlign: 'left', color: on ? T.accent : T.text, background: on ? `${T.accent}1F` : 'transparent', borderRadius: 10, padding: '4px 10px', fontWeight: 800, transform: `scale(${on ? 1.03 : 1})`, transformOrigin: 'left'}}>★ tz.md</div>
		</Win>
	);
};

/** Сайт складається блоками: кожен з'являється в свою секунду. */
const Blocks: React.FC<{t: number; at: number[]}> = ({t, at: times}) => {
	const T = useTheme();
	const H = [220, 150, 150];
	const label = ['Перший екран', 'Меню', 'Відгуки'];
	let y = 20;
	return <>{times.map((a0, i) => {
		const p = pop(t, a0, 0.45), top = y;
		y += H[i] + 16;
		return (
			<div key={i} style={{position: 'absolute', left: 20, right: 20, top, height: H[i], borderRadius: 16, opacity: p, transform: `translateY(${(1 - p) * 40}px)`, background: i === 0 ? 'linear-gradient(150deg, #3A2418, #160D08)' : T.panel2, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: i === 0 ? 56 : 42, color: i === 0 ? '#F3E6D3' : T.text}}>{label[i]}</div>
		);
	})}</>;
};

const Scenes = (t: number) => {
	const put = a('Кладемо'), stack = a('Стек'), q = a('Він'), build = a('перший'), ctl = a('Не', 39), mob = a('Контент'), end = a('Наприкінці'), done = a('Усі');
	return (
		<>
			<Show t={t} a={0} b={put}>
				<Title t={t} section="Розробка">Перша версія <L>сайту з ТЗ</L></Title>
			</Show>
			<Show t={t} a={put} b={stack}>
				<Tree t={t} hi={a('tz.md')} />
				<Term t={t} y={800} label="Claude Code" lines={[{at: a('зроби'), text: 'зроби по ТЗ'}]} />
			</Show>
			<Show t={t} a={stack} b={q}>
				<Box y={420}><Big size={92}>Стек уже <L>в ТЗ</L></Big></Box>
				<Chips t={t} y={700} size={44} items={[['той, що ти обрав раніше', a('той')]]} />
				<Box y={900} o={pop(t, a('Додаткові'))}><Big size={60}>MCP поки <L>не потрібні</L></Big></Box>
			</Show>
			<Show t={t} a={q} b={a('І', 21)}>
				<Win y={300} label="Claude Code" minH={900}>
					<Reply o={pop(t, a('питання'))} size={36}>Є кілька питань: чи є фото закладу? Потрібне онлайн-бронювання?</Reply>
					<UserMsg size={34} o={pop(t, a('відповідаєш'))}>Фото є, бронювання — так</UserMsg>
					<Reply o={pop(t, a('план'))} size={36}>План: Головна → Меню → Відгуки → Контакти</Reply>
					<UserMsg size={40} o={pop(t, a('Кажеш'))}>ок</UserMsg>
				</Win>
			</Show>
			<Show t={t} a={build} b={ctl}>
				<Box y={250}><Big size={84}>Блок за <L>блоком</L></Big></Box>
				<Browser t={t} y={480} url="localhost:3000" h={600}><Blocks t={t} at={[build, a('меню'), a('відгуки')]} /></Browser>
				<Box y={1210} o={pop(t, a("сказав"))}><Big size={72}>подивився → <L>«ок»</L></Big></Box>
			</Show>
			<Show t={t} a={ctl} b={mob}>
				<Box y={320}><Big size={88}>Не все <L>одним махом</L></Big></Box>
				<Ticks t={t} y={640} gap={130} items={[[true, 'легше контролювати', a('контролювати')], [true, 'простіше виправляти', a('виправляти')]]} />
			</Show>
			<Show t={t} a={mob} b={end}>
				<Box y={360}><Big size={88}>Одразу — <L>по-справжньому</L></Big></Box>
				<Chips t={t} y={640} size={50} items={[['реалістичний контент', a('реалістичний')], ['мобільна версія', a('мобільна')]]} />
			</Show>
			<Show t={t} a={end} b={done}>
				<Box y={280}><Big size={84}>AI сам каже, <L>що лишилось</L></Big></Box>
				<Ticks t={t} y={600} items={[[false, 'форма бронювання', a('каже') + 0.3], [false, 'сторінка 404', a('не', a('каже'))]]} />
				<Box y={900} o={pop(t, a('список'))}><Pill style={{fontSize: 50}}>твій список на завтра</Pill></Box>
			</Show>
			<Show t={t} a={done} b={Infinity}>
				<Box y={420}><Big size={92}>Усі сторінки з ТЗ <L>відкриваються</L></Big></Box>
				<Box y={760} o={pop(t, a('перша'))}><Big size={84}>перша версія <L>готова ✓</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('tz.md'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('питання'), 'notify/notification-051-494246.mp3', 0.25],
	[a('Кажеш'), 'click/mouse-click-352734.mp3', 0.35],
	[a('перший'), 'pop/soft-pop.wav', 0.35],
	[a('меню'), 'pop/soft-pop.wav', 0.35],
	[a('відгуки'), 'pop/soft-pop.wav', 0.35],
	[a('Наприкінці'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('Не', 39), 'whoosh/simple-whoosh-382724.mp3', 0.25],
	[a('перша'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Sites12: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-12" words={WORDS} next="День 2: де мої задачі? Trello" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('typing', a('І', 21), a('перший') - a('І', 21) - 0.1, {label: <>Блок за <L>блоком</L></>, labelY: 1000})]} />
);

// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------
const ScenesWide = (t: number) => {
	const put = a('Кладемо'), stack = a('Стек'), q = a('Він'), build = a('перший'), ctl = a('Не', 39), mob = a('Контент'), end = a('Наприкінці'), done = a('Усі');
	return (
		<>
			<Show t={t} a={0} b={put}>
				<Fit from={420} to={1100} center>
					<Title t={t} section="Розробка">Перша версія <L>сайту з ТЗ</L></Title>
				</Fit>
			</Show>
			<Show t={t} a={put} b={stack}>
				<Fit from={420} to={1340} center>
					<Tree t={t} hi={a('tz.md')} />
					<Term t={t} y={800} label="Claude Code" lines={[{at: a('зроби'), text: 'зроби по ТЗ'}]} />
				</Fit>
			</Show>
			<Show t={t} a={stack} b={q}>
				<LHead size={92}>Стек уже <L>в ТЗ</L></LHead>
				<Fit from={660} to={1120}>
					<Chips t={t} y={700} size={44} items={[['той, що ти обрав раніше', a('той')]]} />
					<Box y={900} o={pop(t, a('Додаткові'))}><Big size={60}>MCP поки <L>не потрібні</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={q} b={a('І', 21)}>
				<Fit from={260} to={1340} center>
					<Win y={300} label="Claude Code" minH={900}>
						<Reply o={pop(t, a('питання'))} size={36}>Є кілька питань: чи є фото закладу? Потрібне онлайн-бронювання?</Reply>
						<UserMsg size={34} o={pop(t, a('відповідаєш'))}>Фото є, бронювання — так</UserMsg>
						<Reply o={pop(t, a('план'))} size={36}>План: Головна → Меню → Відгуки → Контакти</Reply>
						<UserMsg size={40} o={pop(t, a('Кажеш'))}>ок</UserMsg>
					</Win>
				</Fit>
			</Show>
			<Show t={t} a={build} b={ctl}>
				<LHead size={84}>Блок за <L>блоком</L></LHead>
				<Fit from={440} to={1430}>
					<Browser t={t} y={480} url="localhost:3000" h={600}><Blocks t={t} at={[build, a('меню'), a('відгуки')]} /></Browser>
					<Box y={1210} o={pop(t, a("сказав"))}><Big size={72}>подивився → <L>«ок»</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={ctl} b={mob}>
				<LHead size={88}>Не все <L>одним махом</L></LHead>
				<Fit from={600} to={960}>
					<Ticks t={t} y={640} gap={130} items={[[true, 'легше контролювати', a('контролювати')], [true, 'простіше виправляти', a('виправляти')]]} />
				</Fit>
			</Show>
			<Show t={t} a={mob} b={end}>
				<LHead size={88}>Одразу — <L>по-справжньому</L></LHead>
				<Fit from={600} to={860}>
					<Chips t={t} y={640} size={50} items={[['реалістичний контент', a('реалістичний')], ['мобільна версія', a('мобільна')]]} />
				</Fit>
			</Show>
			<Show t={t} a={end} b={done}>
				<LHead size={84}>AI сам каже, <L>що лишилось</L></LHead>
				<Fit from={560} to={1120}>
					<Ticks t={t} y={600} items={[[false, 'форма бронювання', a('каже') + 0.3], [false, 'сторінка 404', a('не', a('каже'))]]} />
					<Box y={900} o={pop(t, a('список'))}><Pill style={{fontSize: 50}}>твій список на завтра</Pill></Box>
				</Fit>
			</Show>
			<Show t={t} a={done} b={Infinity}>
				<Fit from={380} to={980} center>
					<Box y={420}><Big size={92}>Усі сторінки з ТЗ <L>відкриваються</L></Big></Box>
					<Box y={760} o={pop(t, a('перша'))}><Big size={84}>перша версія <L>готова ✓</L></Big></Box>
				</Fit>
			</Show>
		</>
	);
};

export const Sites12Wide: React.FC<{theme?: string; seed?: number; kicker?: React.ReactNode}> = ({theme, seed, kicker}) => (
	<StepVideo wide kicker={kicker} theme={theme} seed={seed} dir="ideas/sites-12" words={WORDS} next="День 2: де мої задачі? Trello" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={ScenesWide}
		inserts={[ugc('typing', a('І', 21), a('перший') - a('І', 21) - 0.1, {label: <>Блок за <L>блоком</L></>, labelY: 1000})]} />
);
