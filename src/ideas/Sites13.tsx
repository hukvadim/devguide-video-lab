import React from 'react';
import {interpolate} from 'remotion';
import {F, clamp} from '../system/kit';
import {Big, Box, Browser, Chips, Cue, L, LiveShot, Pill, Show, StepVideo, Term, Ticks, Title, Win, X, W, at, pop, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-13/words.json';

// Sites-13 «День 2: де мої задачі? Trello» (шлях websites, крок trello). Сценарій: public/ideas/sites-13/scenario.md.
// Дошка — намальована в Remotion (колонки з кроку), скрін trello.com — справжній.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_13 = stepFrames(WORDS);
const COLS = ['в роботі', 'зробити', 'від клієнта', 'баги', 'готово'];
const CARDS = [2, 3, 1, 1, 2];

/** Дошка з колонками; картка «Меню» з моменту move переїжджає з «в роботі» в «готово». */
const Board: React.FC<{t: number; cols: number[]; move: number; y: number}> = ({t, cols, move, y}) => {
	const T = useTheme();
	const cw = (W - 4 * 12) / 5;
	const k = interpolate(t, [move, move + 0.9], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
	return (
		<div style={{position: 'absolute', left: X, top: y, width: W, height: 520}}>
			{COLS.map((c, i) => (
				<div key={c} style={{position: 'absolute', left: i * (cw + 12), top: 0, width: cw, height: 520, borderRadius: 18, background: T.panel, border: `1px solid ${i === 4 && k > 0.9 ? T.accent : T.line}`, opacity: pop(t, cols[i]), transform: `translateY(${(1 - pop(t, cols[i])) * 30}px)`}}>
					<div style={{padding: '14px 10px', fontFamily: F.body, fontWeight: 800, fontSize: 26, lineHeight: 1.15, minHeight: 66, textAlign: 'center', color: i === 4 ? T.accent : T.text}}>{c}</div>
					{Array.from({length: CARDS[i]}, (_, j) => <div key={j} style={{margin: '0 10px 10px', height: 70, borderRadius: 10, background: T.panel2, border: `1px solid ${T.line}`}} />)}
				</div>
			))}
			{t >= cols[0] ? (
				<div style={{position: 'absolute', left: 10 + k * 4 * (cw + 12), top: 80 + CARDS[0] * 80 + k * (CARDS[4] * 80 - CARDS[0] * 80) - Math.sin(k * Math.PI) * 60, width: cw - 20, height: 70, borderRadius: 10, background: `${T.accent}26`, border: `3px solid ${T.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26, transform: `rotate(${Math.sin(k * Math.PI) * 6}deg)`, opacity: pop(t, cols[0])}}>{k >= 1 ? '✓ Меню' : 'Меню'}</div>
			) : null}
		</div>
	);
};

/** Claude → Налаштування → Конектори: рядок Trello переходить у «Підключено». */
const Connectors: React.FC<{t: number; a0: number; on: number}> = ({t, a0, on}) => {
	const T = useTheme();
	const done = t >= on;
	return (
		<Win y={480} label="Claude · Налаштування → Конектори" o={pop(t, a0)} minH={420}>
			{['Gmail', 'Google Drive', 'Trello', 'GitHub'].map((n, i) => {
				const me = n === 'Trello';
				return (
					<div key={n} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderRadius: 16, background: T.panel2, border: `3px solid ${me ? T.accent : 'transparent'}`, fontSize: 40, fontWeight: 700, opacity: pop(t, a0 + 0.2 + i * 0.15)}}>
						<span>{n}</span>
						{me ? <span style={{padding: '8px 22px', borderRadius: 999, fontSize: 32, fontWeight: 800, background: done ? T.accent : 'transparent', color: done ? T.onAccent : T.accent, border: `2px solid ${T.accent}`}}>{done ? '✓ Підключено' : 'Підключити'}</span> : <span style={{fontSize: 30, color: T.dim}}>—</span>}
					</div>
				);
			})}
		</Win>
	);
};

/** Сайт клієнта з курсом валют, вписаним руками (приклад). */
const Rates: React.FC<{t: number; a0: number; hand: number}> = ({t, a0, hand}) => {
	const T = useTheme();
	return (
		<Browser t={t} y={470} url="zerno.com.ua" h={330} o={pop(t, a0)}>
			<div style={{padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 16}}>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 40}}>Курс валют</div>
				{[['USD', '41,20'], ['EUR', '44,90']].map(([c, v]) => <div key={c} style={{display: 'flex', justifyContent: 'space-between', fontSize: 40, fontWeight: 700, padding: '10px 18px', borderRadius: 12, background: T.panel2}}><span>{c}</span><span>{v}</span></div>)}
				<div style={{fontFamily: F.mono, fontSize: 28, color: T.red, opacity: pop(t, hand)}}>✎ вписано руками</div>
			</div>
		</Browser>
	);
};

const Scenes = (t: number) => {
	const T = useTheme();
	const think = a('думаєш'), what = a('За', 4.5), trello = a('Тут'), alt = a('Є', 14), board = a('Робиш'), conn = a('Далі'), why = a('Навіщо'), ex = a('Приклад'), next = a('Тому'), fin = a('Скільки');
	return (
		<>
			<Show t={t} a={0} b={think}>
				<Title t={t} section="Розробка">День 2: де мої <L>задачі</L>?</Title>
			</Show>
			<Show t={t} a={what} b={trello}>
				<Box y={560}><Big size={110}>За що <span style={{color: T.red}}>братися</span>?</Big></Box>
			</Show>
			<Show t={t} a={trello} b={alt}>
				<Box y={250}><Big size={88}>Рятує <L>Trello</L></Big></Box>
				{/* справжня сторінка (shots/trello-home.png, 1280×900) */}
				<Browser t={t} y={400} url="trello.com" h={560}>
					<LiveShot t={t} src="ideas/sites-13/shots/trello-home.png" w={1280} a={trello + 0.3} focus={{x: 395, y: 587, w: 164, h: 50, at: a('реєструєшся'), zoom: 1.5}} />
				</Browser>
				<Chips t={t} y={1080} size={42} items={[['безкоштовний', a('безкоштовний')], ['є мобільний додаток', a('мобільний')], ['запис з телефона', a('телефона')]]} />
			</Show>
			<Show t={t} a={alt} b={board}>
				<Box y={420} style={{display: 'flex', justifyContent: 'center', gap: 24}}>
					<span><Pill style={{fontSize: 56}}>Trello</Pill></span>
					<span style={{opacity: pop(t, a('Asana'))}}><Pill style={{fontSize: 56}}>Asana</Pill></span>
				</Box>
				<Box y={640} o={pop(t, a('Головне'))}><Big size={88}>Одне місце для <L>всіх задач</L></Big></Box>
			</Show>
			<Show t={t} a={board} b={conn}>
				<Box y={260}><Big size={76}>Дошка з <L>колонками</L></Big></Box>
				<Board t={t} y={510} cols={[a('роботі'), a('зробити', 21), a('від', 22), a('баги'), a('готово')]} move={1e6} />
			</Show>
			<Show t={t} a={conn} b={why}>
				<Box y={240}><Big size={80}>Підключи <L>Trello</L></Big></Box>
				<Box y={370} o={pop(t, a('Сама'))}><span style={{fontSize: 44, fontWeight: 700, color: T.red}}>сама не підключиться</span></Box>
				<Connectors t={t} a0={a('заходиш')} on={a('додаєш')} />
				<Box y={1120} o={pop(t, a('Тепер'))}><Big size={60}>бачить дошку, <L>як ти</L></Big></Box>
			</Show>
			<Show t={t} a={why} b={ex}>
				<Box y={240}><Big size={84}>Навіщо?</Big></Box>
				<Ticks t={t} y={440} items={[[false, 'закінчились ліміти', a('ліміти')], [false, 'щось зависло', a('зависло')], [false, 'вимкнув комп\'ютер', a('вимкнув')]]} />
				<Box y={960} o={pop(t, a('А', 43))}><Big size={64}>а в <L>Trello</L> видно</Big></Box>
				<Chips t={t} y={1010} size={42} items={[['взяли в роботу', a('взяли')], ['зроблено', a('зроблено')], ['не зроблено', a('ні', 47)]]} />
			</Show>
			<Show t={t} a={ex} b={next}>
				<Box y={240}><Big size={80}>Приклад: <L>курс валют</L></Big></Box>
				<Rates t={t} a0={a('курс')} hand={a('руками')} />
				<Win y={960} label="Trello · в роботі" o={pop(t, a('картки'))} minH={200}>
					<div style={{padding: '18px 22px', borderRadius: 14, background: T.panel2, border: `3px solid ${T.accent}`, fontSize: 38, fontWeight: 700}}>
						Курс валют → <L>API ПриватБанку</L>
						<div style={{marginTop: 10, fontSize: 30, color: T.red, fontWeight: 800}}>не доробили: цифри руками</div>
					</div>
				</Win>
				<Box y={960} o={pop(t, a('API')) * (1 - pop(t, a('картки')))}><Pill style={{fontSize: 44}}>потрібне API банку</Pill></Box>
				<Box y={1300} o={pop(t, a('вилізе'))}><Big size={56}>без картки — <span style={{color: T.red}}>вилізе після запуску</span></Big></Box>
			</Show>
			<Show t={t} a={next} b={fin}>
				<Box y={260}><Big size={76}>Наступного <L>дня</L></Big></Box>
				<Board t={t} y={420} cols={[next, next, next, next, next]} move={1e6} />
				<Term t={t} y={990} label="Claude Code" lines={[{at: a('зайди'), text: 'зайди в Trello, продовжуємо'}, {at: a('бере'), text: '✓ взяв задачу «Курс валют»', kind: 'ok'}, {at: a('план'), text: '→ план готовий, чекаю «ок»', kind: 'out'}]} />
			</Show>
			<Show t={t} a={fin} b={Infinity}>
				<Box y={420}><Big size={96}>Нічого <L>не губиться</L></Big></Box>
				<Box y={700} o={pop(t, a('платять'))}><Big size={64}>клієнти платять за задачі, <L>доведені до кінця</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Тут'), 'notify/ding-126626.mp3', 0.25],
	[a('роботі'), 'pop/soft-pop.wav', 0.3],
	[a('готово'), 'pop/soft-pop.wav', 0.3],
	[a('заходиш'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('додаєш'), 'click/lock-digital.mp3', 0.35],
	[a('ліміти'), 'glitch/small-electric-glitch-2595.wav', 0.25],
	[a('картки'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('зайди'), 'typing/typewriter-digital.mp3', 0.2],
	[a('платять'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Sites13: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-13" words={WORDS} next="Решта MCP і skills" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_rubbing_eyes_at_desk', a('думаєш'), a('За', 4.5) - a('думаєш') - 0.1, {label: <>Що я <L>вчора</L> зробив?</>, labelY: 1000})]} />
);
