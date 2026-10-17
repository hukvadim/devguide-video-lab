import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F} from '../system/kit';
import {Card, Poster} from '../system/beat';
import {Big, Box, L, Pill, Reply, Strike, UserMsg, Win, X, W, at, pop, typed, useTheme} from '../system/step';
import {VoiceCards, Word, feed45, voiceFrames} from '../system/voiceCards';
import {AdMock, Head, Phone, ugcCard} from './Ads';
import W1 from '../../public/ideas/team-1/words.json';
import W2 from '../../public/ideas/team-2/words.json';
import W3 from '../../public/ideas/team-3/words.json';
import W4 from '../../public/ideas/team-4/words.json';
import W5 from '../../public/ideas/team-5/words.json';

// Meta-реклама під лендінг «Digital-команда в одній особі» (C:/DevGuide/helpers/ai-education/матеріали/…тексти.md, 2026-10-17).
// 5 кутів × голос-клон Вадима (scripts/tts.mjs → public/ideas/team-N/), ≥60 с. CTA: лендінг → Telegram, 30 хв безкоштовно.
// Реальних скрінів магазину / Ads Manager у репо немає: макети процедурні, сайт-приклад — babayaga (public/ideas/ads/).

const SFX = {
	impact: 'impact/impact-cine-big.mp3',
	whoosh: 'whoosh/simple-whoosh-382724.mp3',
	shutter: 'camera/camera-shutter-click-1133.wav',
	ding: 'notify/ding-101492.mp3',
	type: 'typing/typewriter-hit-soft.mp3',
	lock: 'click/lock-digital.mp3',
	shimmer: 'sparkle/shimmer-sparkle-sweep.mp3',
};
/** Обгортка, щоб хуки (useTheme) у картці викликались у власному компоненті. */
const Fn: React.FC<{f: () => React.ReactNode}> = ({f}) => <>{f()}</>;
const card = (el: Card['el'], sfx?: string, off?: number, vol?: number): Card => ({beats: 0, el, sfx, off, vol});

// ---------- картки ----------
const Person: React.FC<{size?: number; color: string}> = ({size = 90, color}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.08}}>
		<div style={{width: size * 0.5, height: size * 0.5, borderRadius: '50%', background: color}} />
		<div style={{width: size * 0.85, height: size * 0.42, borderRadius: `${size * 0.42}px ${size * 0.42}px ${size * 0.1}px ${size * 0.1}px`, background: color}} />
	</div>
);

/** 4 ролі агенції (2×2) з'являються по черзі; на merge злітаються в одну «Ти + AI». */
const ROLES = ['Дизайнер', 'Монтажер', 'Таргетолог', 'Розробник'];
const Roles: React.FC<{t: number; a: number; times?: number[]; merge?: number; head: React.ReactNode; after?: React.ReactNode}> = ({t, a, times, merge, head, after}) => {
	const T = useTheme();
	const m = merge === undefined ? 0 : pop(t, merge, 0.6);
	const one = merge === undefined ? 0 : pop(t, merge + 0.35, 0.4);
	return (
		<>
			<Box y={230} o={pop(t, a, 0.3) * (1 - one)}><Big size={84}>{head}</Big></Box>
			{after ? <Box y={230} o={one}><Big size={84}>{after}</Big></Box> : null}
			{ROLES.map((r, i) => {
				const col = i % 2, row = Math.floor(i / 2);
				const x = X + col * 456, y = 560 + row * 340;
				const p = pop(t, times?.[i] ?? a + 0.15 + i * 0.15, 0.3);
				const dx = (540 - (x + 200)) * m, dy = (900 - (y + 150)) * m;
				return (
					<div key={r} style={{position: 'absolute', left: x, top: y, width: 400, height: 300, borderRadius: 32, background: T.panel, border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: p * (1 - m), transform: `translate(${dx}px, ${dy}px) scale(${(0.85 + p * 0.15) * (1 - m * 0.6)})`}}>
						<Person size={110} color={`${T.text}CC`} />
						<div style={{fontWeight: 800, fontSize: 44}}>{r}</div>
					</div>
				);
			})}
			{merge !== undefined ? (
				<div style={{position: 'absolute', left: 540 - 220, top: 900 - 220, width: 440, height: 440, borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, ${T.accent}, ${T.accentDeep})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: one, transform: `scale(${0.6 + one * 0.4})`, boxShadow: `0 40px 120px ${T.accent}55`}}>
					<Person size={150} color={T.onAccent} />
					<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, color: T.onAccent}}>Ти + AI</div>
				</div>
			) : null}
		</>
	);
};

const Badge: React.FC<{children: React.ReactNode}> = ({children}) => {
	const T = useTheme();
	return <div style={{flex: 'none', width: 92, height: 92, borderRadius: 26, background: `${T.accent}1F`, border: `2px solid ${T.accent}`, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontWeight: 800, fontSize: 40}}>{children}</div>;
};

/** Список з 2–4 рядків; кожен з'являється на своєму слові голосу. */
type Item = {label: React.ReactNode; at: number; sub?: React.ReactNode; icon?: React.ReactNode};
const List: React.FC<{t: number; a: number; head?: React.ReactNode; items: Item[]; foot?: {at: number; text: React.ReactNode}}> = ({t, a, head, items, foot}) => {
	const T = useTheme();
	return (
		<>
			{head ? <Head t={t} a={a} size={80}>{head}</Head> : null}
			{items.map((it, i) => {
				const p = pop(t, it.at, 0.3);
				return (
					<div key={i} style={{position: 'absolute', left: X, width: W, top: 520 + i * 180, minHeight: 150, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 30, padding: '20px 30px', borderRadius: 32, background: T.panel, border: `1px solid ${T.line}`, opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>
						{it.icon ?? <Badge>{i + 1}</Badge>}
						<div style={{textAlign: 'left'}}>
							<div style={{fontWeight: 800, fontSize: 54, lineHeight: 1.15}}>{it.label}</div>
							{it.sub ? <div style={{marginTop: 6, fontSize: 34, color: T.dim}}>{it.sub}</div> : null}
						</div>
					</div>
				);
			})}
			{foot ? <Box y={520 + items.length * 180 + 30} o={pop(t, foot.at, 0.3)}><div style={{fontWeight: 700, fontSize: 44, color: T.accent}}>{foot.text}</div></Box> : null}
		</>
	);
};
const Check = () => <Badge>✓</Badge>;

/** Звукова доріжка: детерміновані стовпчики, «живі» від кадру. */
const Wave: React.FC<{t: number; n?: number; w?: number; h?: number; color: string}> = ({t, n = 28, w = 520, h = 120, color}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: (w / n) * 0.35, width: w, height: h}}>
		{Array.from({length: n}, (_, i) => {
			const base = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + 0.3));
			const k = 0.55 + 0.45 * Math.abs(Math.sin(t * 6 + i * 0.9));
			return <div key={i} style={{flex: 1, height: `${base * k * 100}%`, borderRadius: 99, background: color}} />;
		})}
	</div>
);
const IconShot = () => {
	const T = useTheme();
	return <div style={{flex: 'none', width: 92, height: 92, borderRadius: 26, border: `4px dashed ${T.accent}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{width: 40, height: 30, borderRadius: 6, background: T.accent}} /></div>;
};
const IconVoice: React.FC<{t: number}> = ({t}) => {
	const T = useTheme();
	return <div style={{flex: 'none', width: 92, height: 92, borderRadius: 26, background: `${T.accent}1F`, border: `2px solid ${T.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Wave t={t} n={6} w={56} h={50} color={T.accent} /></div>;
};
const IconSite = () => {
	const T = useTheme();
	return (
		<div style={{flex: 'none', width: 92, height: 92, borderRadius: 26, background: `${T.accent}1F`, border: `2px solid ${T.accent}`, display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{width: 52, height: 10, borderRadius: 5, background: T.accent}} />
			<div style={{width: 52, height: 22, borderRadius: 5, background: `${T.accent}88`}} />
			<div style={{width: 52, height: 10, borderRadius: 5, background: `${T.accent}55`}} />
		</div>
	);
};

/** Ставиш задачу нейромережі — вона робить, ти перевіряєш. */
const Steer: React.FC<{t: number; a: number; head: React.ReactNode}> = ({t, a, head}) => (
	<>
		<Head t={t} a={a}>{head}</Head>
		<Win y={560} label="Нейромережа" o={pop(t, a, 0.4)}>
			<UserMsg o={pop(t, a + 0.4, 0.3)}>Зроби лендінг для кав'ярні: меню, адреса, кнопка «Забронювати»</UserMsg>
			<Reply o={pop(t, a + 1.1, 0.3)} />
			<div style={{alignSelf: 'flex-start', opacity: pop(t, a + 1.8, 0.3)}}><Pill style={{fontSize: 34}}>Ти ставиш задачу і перевіряєш</Pill></div>
		</Win>
	</>
);

/** Скелет сайту: блоки з'являються по черзі (done — одразу всі). */
const SiteSkel: React.FC<{t: number; a: number; done?: boolean}> = ({t, a, done}) => {
	const T = useTheme();
	const b = (i: number) => (done ? 1 : pop(t, a + 0.3 + i * 0.4, 0.3));
	return (
		<Win y={470} label={done ? 'сайт · готово' : 'сайт · чернетка'} o={pop(t, a, 0.35)}>
			<div style={{opacity: b(0), display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
				<div style={{width: 560, height: 42, borderRadius: 10, background: `${T.text}DD`}} />
				<div style={{width: 400, height: 26, borderRadius: 8, background: `${T.text}55`}} />
				<div style={{marginTop: 8, padding: '16px 34px', borderRadius: 999, background: T.accent, color: T.onAccent, fontWeight: 800, fontSize: 30}}>Записатися</div>
			</div>
			<div style={{opacity: b(1), height: 250, borderRadius: 20, background: `linear-gradient(135deg, ${T.accent}66, ${T.accentDeep}33)`}} />
			<div style={{opacity: b(2), display: 'flex', gap: 18}}>{[0, 1, 2].map((i) => <div key={i} style={{flex: 1, height: 150, borderRadius: 18, background: T.panel2, border: `1px solid ${T.line}`}} />)}</div>
		</Win>
	);
};

/** Курс проти «зі мною»: верх закреслюється, коли звучить «Зі мною». */
const Vs: React.FC<{t: number; a: number; left: string; right: React.ReactNode; rightAt: number}> = ({t, a, left, right, rightAt}) => {
	const T = useTheme();
	return (
		<>
			<Box y={380} o={pop(t, a, 0.3)}>
				<div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 5, color: T.dim}}>НА КУРСІ</div>
				<div style={{marginTop: 24, fontWeight: 800, fontSize: 68, lineHeight: 1.2}}><Strike p={pop(t, rightAt - 0.2, 0.4)}>{left}</Strike></div>
			</Box>
			<Box y={860} o={pop(t, rightAt, 0.35)}>
				<div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 5, color: T.accent}}>ЗІ МНОЮ</div>
				<div style={{marginTop: 24, transform: `scale(${1.15 - pop(t, rightAt, 0.35) * 0.15})`}}><Big size={96}>{right}</Big></div>
			</Box>
		</>
	);
};

/** 10 місць: заповнюються по черзі. */
const Dots10: React.FC<{t: number; a: number; head: React.ReactNode; fill: number; label: string}> = ({t, a, head, fill, label}) => {
	const T = useTheme();
	return (
		<>
			<Head t={t} a={a}>{head}</Head>
			{Array.from({length: 10}, (_, i) => {
				const p = pop(t, fill + i * 0.12, 0.25);
				return <div key={i} style={{position: 'absolute', left: 150 + (i % 5) * 160, top: 640 + Math.floor(i / 5) * 170, width: 120, height: 120, borderRadius: '50%', border: `3px solid ${T.accent}`, background: p > 0.5 ? T.accent : 'transparent', transform: `scale(${0.8 + p * 0.2})`, opacity: pop(t, a + 0.2, 0.3)}} />;
			})}
			<Box y={1020} o={pop(t, fill + 1, 0.3)}><div style={{fontWeight: 800, fontSize: 56}}>{label}</div></Box>
		</>
	);
};

/** Плашка «Листопад: вільно 8 з 10» (з лендінгу): 2 зайняті, 8 вільних. */
const Seats: React.FC = () => {
	const T = useTheme();
	return (
		<div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '22px 36px', borderRadius: 28, background: T.panel, border: `1px solid ${T.line}`}}>
			<div style={{fontWeight: 800, fontSize: 40}}>Листопад: вільно <span style={{color: T.accent}}>8 з 10</span> місць</div>
			<div style={{display: 'flex', gap: 14}}>{Array.from({length: 10}, (_, i) => <div key={i} style={{width: 30, height: 30, borderRadius: '50%', background: i < 2 ? `${T.text}33` : T.accent}} />)}</div>
		</div>
	);
};

/** Фінал: 30 хв безкоштовно → посилання → Telegram. */
const OfferTg: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const slam = pop(t, a, 0.4);
	return (
		<AbsoluteFill>
			<Box y={300} o={pop(t, a + 0.1, 0.3)}><span style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 5, color: T.dim, textTransform: 'uppercase'}}>Перший крок</span></Box>
			<Box y={370}>
				<div style={{transform: `scale(${1.6 - slam * 0.6})`, opacity: slam, filter: `blur(${(1 - slam) * 12}px)`}}>
					<Big size={200} style={{color: T.accent, lineHeight: 1}}>30 хв</Big>
					<Big size={92}>безкоштовно</Big>
				</div>
			</Box>
			<Box y={790} o={pop(t, a + 0.4, 0.3)}><div style={{fontWeight: 700, fontSize: 46, color: T.text}}>Розмова про твою мету</div></Box>
			<Box y={900} o={pop(t, a + 0.7, 0.4)}>
				<span style={{display: 'inline-block', padding: '30px 52px', borderRadius: 999, background: T.accent, color: T.onAccent, fontWeight: 900, fontSize: 50, boxShadow: `0 30px 80px ${T.accent}40`}}>Посилання → Telegram</span>
			</Box>
			<Box y={1110} o={pop(t, a + 1, 0.4)}><Seats /></Box>
			<Box y={1360} o={pop(t, a + 1.3, 0.4)}><div style={{fontSize: 36, color: T.dim}}>Вадим Гук · devguide.com.ua</div></Box>
		</AbsoluteFill>
	);
};
const offer = card((t, a) => <OfferTg t={t} a={a} />, SFX.impact, 0, 0.2);
const vadim = (file: string, from: number) => ugcCard(file, from, <>Вадим Гук<br /><span style={{fontSize: 56}}>10+ років · 300+ учнів</span></>, 0);

// ---------- збірка: [слово голосу, з якого починається картка; картка; субтитри] ----------
type B = [string, Card, boolean?];
const build = (words: Word[], dir: string, track: string, cover: number, beats: B[]) => {
	let prev = 0;
	const starts = beats.map(([k], i) => (i === 0 ? 0 : (prev = at(words, k, prev + 0.6))));
	const caps = beats.flatMap(([, , c], i) => (c ? [i] : []));
	const cards = beats.map((b) => b[1]);
	const Comp: React.FC = () => <VoiceCards cards={cards} words={words} dir={dir} track={track} starts={starts} caps={caps} cover={cover} />;
	return {Comp, frames: voiceFrames(words)};
};

// 1. Команда в одній особі
const w1 = (k: string, after = 0) => at(W1, k, after);
const T1 = build(W1, 'ideas/team-1', '37-synthwave-better-times-are-coming.mp3', 2.5, [
	['', card((t, a) => <Roles t={t} a={a} head={<>Раніше —<br /><L>4 людини</L></>} />)],
	['Тепер', ugcCard('point-up', 2.6, <>Тепер —<br />я один</>, 0)],
	['Подивись', card((t, a) => <Poster t={t} a={a} size={110}>Що потрібно<br /><L>кожному</L><br />бізнесу?</Poster>), true],
	['Сайт', card((t, a) => <List t={t} a={a} head={<>Кожному бізнесу</>} items={[
		{label: 'Сайт', sub: 'щоб приходили заявки', at: a + 0.1},
		{label: 'Відео для Instagram', sub: 'щодня, по кілька', at: w1('Відео', 12)},
		{label: 'Рекламні креативи', at: w1('Рекламні')},
		{label: 'Реклама', sub: 'Google · Facebook · Instagram', at: w1('реклама')},
	]} />), true],
	['Раніше', card((t, a) => <Roles t={t} a={a} times={[w1('дизайнер'), w1('монтажер'), w1('таргетолог'), w1('розробник')]} merge={w1('Тепер', 24)} head={<>Раніше —<br />4 ролі</>} after={<>Тепер —<br /><L>ти + AI</L></>} />, SFX.whoosh, w1('Тепер', 24) - w1('Раніше', 20)), true],
	['потрібна', card((t, a) => <Steer t={t} a={a} head={<>Людина, що<br /><L>керує AI</L></>} />), true],
	['Програмувати', card((t, a) => <List t={t} a={a} head={<>Без <L>програмування</L></>} items={[
		{label: 'Скріншот', at: w1('скріншот'), icon: <IconShot />},
		{label: 'Задача голосом', at: w1('голосом'), icon: <IconVoice t={t} />},
		{label: 'AI робить чернетку', at: w1('чернетку'), icon: <IconSite />},
		{label: 'Перевірив → клієнту', at: w1('віддаєш'), icon: <Check />},
	]} />), true],
	['цими', card((t, a) => <List t={t} a={a} head={<>Де це <L>знадобиться</L></>} items={[
		{label: 'Робота в компанії', at: w1('компанію')},
		{label: 'Замовлення у вільний час', at: w1('замовлення')},
		{label: 'Власна справа', at: w1('власної')},
	]} />), true],
	['Вадим', vadim('Man_reacting_to_smartphone', 1), true],
	['Навчаю', card((t, a) => <Dots10 t={t} a={a} head={<>Особисто,<br />під <L>твою мету</L></>} fill={w1('Беру')} label="до 10 учнів на місяць" />), true],
	['Перший', offer],
]);

// 2. Ти вже дивишся на товар
const w2 = (k: string, after = 0) => at(W2, k, after);
const T2 = build(W2, 'ideas/team-2', '38-synthwave-sun-in-your-eyes.mp3', 6.5, [
	['', card((t, a) => <List t={t} a={a} head={<>Це зробив<br /><L>один я + AI</L></>} items={[
		{label: 'Це відео', at: a + 0.1, icon: <Check />},
		{label: 'Ця реклама', at: w2('реклама'), icon: <Check />},
		{label: 'Сайт, куди потрапиш', at: w2('сайт'), icon: <Check />},
	]} foot={{at: w2('Без'), text: 'Без команди'}} />), true],
	['Ще', card((t, a) => <Roles t={t} a={a} times={[w2('дизайнера'), w2('монтажера'), w2('таргетолога'), w2('розробника')]} merge={w2('Сьогодні')} head={<>Раніше —<br /><L>4 людини</L></>} after={<>Сьогодні —<br /><L>1 + AI</L></>} />, SFX.whoosh, w2('Сьогодні') - w2('Ще')), true],
	['Ось', card((t, a) => <Poster t={t} a={a} size={110}>Ось що ти<br /><L>зараз бачиш</L></Poster>), true],
	['Голос', card((t, a) => <Fn f={() => {
		const T = useTheme();
		return (
			<>
				<Head t={t} a={a}>Голос — <L>AI-клон</L><br />мого голосу</Head>
				<Win y={600} label="voice.mp3" o={pop(t, a, 0.4)}>
					<div style={{display: 'flex', justifyContent: 'center', padding: '30px 0'}}><Wave t={t} n={36} w={760} h={260} color={T.accent} /></div>
				</Win>
			</>
		);
	}} />, SFX.ding, 0.3, 0.15), true],
	['Картки', card((t, a) => <Fn f={() => {
		const T = useTheme();
		const lines = ['<VoiceCards', '  words={WORDS}', '  cards={CARDS}', '  track="music.mp3" />'];
		return (
			<>
				<Head t={t} a={a}>Код написав <L>AI</L><br />за моїми задачами</Head>
				<Win y={600} label="Team.tsx" mono o={pop(t, a, 0.4)}>
					{lines.map((s, i) => <div key={i} style={{fontSize: 44, textAlign: 'left', whiteSpace: 'pre', color: i === 0 ? T.accent : T.text}}>{typed(s, t, a + 0.3 + i * 0.6, a + 0.8 + i * 0.6)}</div>)}
				</Win>
			</>
		);
	}} />, SFX.type, 0.3), true],
	['Рекламну', card((t, a) => <><Head t={t} a={a}>Рекламу<br />налаштував <L>сам</L></Head><AdMock t={t} a={a + 0.2} /></>), true],
	['сторінка', card((t, a) => <Fn f={() => {
		const T = useTheme();
		return (
			<>
				<Head t={t} a={a}>І ця <L>сторінка</L> теж</Head>
				<Win y={540} label="лендінг" o={pop(t, a, 0.4)}>
					<div style={{alignSelf: 'flex-start', opacity: pop(t, a + 0.3, 0.3)}}><Pill style={{fontSize: 28, padding: '10px 22px'}}>Листопад: вільно 8 з 10</Pill></div>
					<div style={{textAlign: 'left', opacity: pop(t, a + 0.5, 0.3)}}><Big size={72} style={{textAlign: 'left'}}>Стань digital-командою в одній особі</Big></div>
					<div style={{textAlign: 'left', fontSize: 34, color: T.dim, opacity: pop(t, a + 0.8, 0.3)}}>Сайт, відео і реклама — з AI</div>
					<div style={{alignSelf: 'flex-start', padding: '20px 36px', borderRadius: 999, background: T.accent, color: T.onAccent, fontWeight: 900, fontSize: 34, opacity: pop(t, a + 1.1, 0.3)}}>Поговорити зі мною · 30 хв</div>
				</Win>
			</>
		);
	}} />), true],
	['Тобто', card((t, a) => (
		<>
			<Head t={t} a={a} size={76}>Ти вже пройшов<br /><L>шлях клієнта</L></Head>
			{[['Реклама', w2('реклама', 35)], ['Відео', w2('відео', 36)], ['Сайт', w2('сайт', 36.9)]].map(([s, tm], i) => (
				<Box key={i} y={600 + i * 250} o={0.25 + 0.75 * pop(t, tm as number, 0.3)}>
					<Pill on={t >= (tm as number)} style={{fontSize: 70, padding: '26px 70px'}}>{s}</Pill>
					{i < 2 ? <div style={{marginTop: 20, fontSize: 50, opacity: 0.6}}>↓</div> : null}
				</Box>
			))}
		</>
	)), true],
	['Тепер', card((t, a) => <Poster t={t} a={a} size={110}>Тепер уяви:<br />це зробив <L>ти</L></Poster>), true],
	['Саме', card((t, a) => <List t={t} a={a} head={<>Цю навичку<br /><L>купують</L></>} items={[
		{label: 'Майстри', at: w2('майстри')},
		{label: 'Магазини', at: w2('магазини')},
		{label: 'Кафе', at: w2('кафе')},
	]} foot={{at: w2('українські'), text: 'зокрема українські за кордоном'}} />), true],
	['Вадим', vadim('Man_holding_mug_and_laptop_', 1), true],
	['Навчаю', card((t, a) => <Poster t={t} a={a} size={110} sub="на реальних задачах">Не курсом —<br /><L>особисто</L></Poster>), true],
	['Починаємо', offer],
]);

// 3. Скрін + голосове = сайт
const w3 = (k: string, after = 0) => at(W3, k, after);
const T3 = build(W3, 'ideas/team-3', '23-chill-digital-clouds.mp3', 1.5, [
	['', card((t, a) => <Poster t={t} a={a} size={112} kicker="Без жодного рядка коду">Скрін + голосове<br />= <L>сайт</L></Poster>, SFX.impact, 0, 0.2), true],
	['Перше', card((t, a) => <Fn f={() => {
		const T = useTheme();
		const ts = w3('скріншот', 8);
		return (
			<>
				<Head t={t} a={a} y={180}>1. <L>Скріншот</L></Head>
				<Phone t={t} a={a} z={a + 3} srcs={['babayaga-2.png']} y={450} />
				<div style={{position: 'absolute', left: 250, top: 430, width: 580, height: 1120, borderRadius: 72, border: `6px dashed ${T.accent}`, opacity: pop(t, ts, 0.2)}} />
				<AbsoluteFill style={{background: '#FFFFFF', opacity: t >= ts ? (1 - pop(t, ts, 0.35)) * 0.7 : 0}} />
			</>
		);
	}} />, SFX.shutter, w3('скріншот', 8) - w3('Перше'), 0.25)],
	['Друге', card((t, a) => <Fn f={() => {
		const T = useTheme();
		return (
			<>
				<Head t={t} a={a}>2. <L>Голосове</L></Head>
				<Win y={560} label="Повідомлення" o={pop(t, a, 0.4)}>
					<div style={{display: 'flex', alignItems: 'center', gap: 26}}>
						<div style={{flex: 'none', width: 96, height: 96, borderRadius: '50%', background: T.accent, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44}}>▶</div>
						<Wave t={t} n={22} w={520} h={110} color={T.accent} />
						<div style={{fontFamily: F.mono, fontSize: 32, color: T.dim}}>0:14</div>
					</div>
					<UserMsg o={pop(t, a + 0.8, 0.3)} size={38}>{typed('Зроби цей блок світлішим і додай кнопку «Записатися»', t, a + 0.9, a + 3)}</UserMsg>
				</Win>
			</>
		);
	}} />, SFX.ding, 0.2, 0.15), true],
	['Третє', card((t, a) => (
		<>
			<Head t={t} a={a}>3. AI робить <L>чернетку</L></Head>
			<SiteSkel t={t} a={a} />
			<Box y={1290} o={pop(t, w3('сайт', 17), 0.3)}>
				<div style={{display: 'flex', gap: 14, justifyContent: 'center'}}>{[['сайт', 'сайт'], ['відео', 'відео'], ['текст', 'текст'], ['креатив', 'креатив']].map(([s, k]) => <Pill key={s} on={t >= w3(k, 17)} style={{fontSize: 32, padding: '10px 22px'}}>{s}</Pill>)}</div>
			</Box>
		</>
	), SFX.type, 0.3)],
	['Четверте', card((t, a) => <Fn f={() => {
		const T = useTheme();
		const p = pop(t, a + 0.6, 0.35);
		return (
			<>
				<Head t={t} a={a}>4. Перевірив →<br /><L>клієнту</L></Head>
				<SiteSkel t={t} a={a - 1} done />
				<div style={{position: 'absolute', left: 540 - 110, top: 760, width: 220, height: 220, borderRadius: '50%', background: T.accent, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 130, fontWeight: 900, opacity: p, transform: `scale(${1.4 - p * 0.4})`, boxShadow: `0 30px 90px ${T.accent}66`}}>✓</div>
			</>
		);
	}} />, SFX.lock, 0.6), true],
	['Уся', card((t, a) => <Poster t={t} a={a} size={110}>Складність —<br />не в <L>коді</L></Poster>), true],
	['Вона', card((t, a) => <Steer t={t} a={a} head={<>Знати, що<br /><L>сказати AI</L></>} />), true],
	['Так', card((t, a) => <List t={t} a={a} head={<>Так роблять</>} items={[
		{label: 'Сайти й лендінги', at: w3('сайти')},
		{label: 'Відео для соцмереж', at: w3('відео', 34)},
		{label: 'Рекламні креативи', at: w3('рекламні')},
		{label: 'Реклама', sub: 'Google · Facebook · Instagram', at: w3('рекламу')},
	]} />), true],
	['Раніше', card((t, a) => <Roles t={t} a={a} merge={w3('Тепер', 42)} head={<>Раніше —<br />команда</>} after={<>Тепер —<br /><L>одна людина</L></>} />, SFX.whoosh, w3('Тепер', 42) - w3('Раніше', 40)), true],
	['Мене', vadim('Man_nodding_by_window', 2.7), true],
	['Навчання', card((t, a) => <List t={t} a={a} head={<>Як <L>навчаю</L></>} items={[
		{label: 'Особисто', at: a + 0.1, icon: <Check />},
		{label: 'Під твою мету', at: w3('під', 52), icon: <Check />},
		{label: 'Онлайн, українською', at: w3('онлайн', 53), icon: <Check />},
		{label: 'Старт — одне заняття', at: w3('Почати'), icon: <Check />},
	]} />), true],
	['Перші', offer],
]);

// 4. Не за фахом у Польщі / Німеччині
const w4 = (k: string, after = 0) => at(W4, k, after);
const T4 = build(W4, 'ideas/team-4', '24-chill-day-dreamin-with-u.mp3', 1.5, [
	['', card((t, a) => <Poster t={t} a={a} size={120} kicker="Польща · Німеччина">Працюєш<br />не за <L>фахом?</L></Poster>, SFX.impact, 0, 0.2), true],
	['Є', card((t, a) => <Poster t={t} a={a} size={104} kicker="Є професія">Мова країни —<br /><L>не потрібна</L></Poster>), true],
	['Кожному', card((t, a) => <List t={t} a={a} head={<>Кожному бізнесу<br /><L>потрібні</L></>} items={[
		{label: 'Сайт', at: w4('сайт')},
		{label: 'Instagram', sub: 'кілька відео щодня', at: w4('Instagram')},
		{label: 'Реклама', sub: 'яка приводить клієнтів', at: w4('реклама')},
	]} />), true],
	['Раніше', card((t, a) => <Roles t={t} a={a} merge={w4('Тепер')} head={<>Раніше —<br />команда</>} after={<>Тепер —<br /><L>ти + AI</L></>} />, SFX.whoosh, w4('Тепер') - w4('Раніше')), true],
	['Працювати', card((t, a) => <Poster t={t} a={a} size={104} kicker="Онлайн · з дому">Клієнти з<br /><L>будь-якої</L><br />країни</Poster>), true],
	['зокрема', card((t, a) => <List t={t} a={a} head={<>Українські бізнеси<br /><L>за кордоном</L></>} items={[
		{label: 'Майстри', at: w4('майстри')},
		{label: 'Магазини', at: w4('магазини')},
		{label: 'Кафе', at: w4('кафе')},
	]} />), true],
	['Програмувати', card((t, a) => <List t={t} a={a} head={<>Без <L>програмування</L></>} items={[
		{label: 'Скріншот', at: w4('скріншот'), icon: <IconShot />},
		{label: 'Голосове', at: w4('голосове'), icon: <IconVoice t={t} />},
		{label: 'AI робить', at: w4('нейромережі', 34), icon: <IconSite />},
	]} />), true],
	['Є', card((t, a) => <List t={t} a={a} head={<>Три <L>шляхи</L></>} items={[
		{label: 'Робота в компанії', at: w4('робота')},
		{label: 'Підробіток', sub: 'замовлення у вільний час', at: w4('підробіток')},
		{label: 'Власний проєкт', at: w4('власний')},
	]} />), true],
	['Вадим', vadim('Man_laughs_on_sofa_with', 3), true],
	['Навчаю', card((t, a) => <List t={t} a={a} head={<>Як <L>навчаю</L></>} items={[
		{label: 'Українською', at: w4('українською'), icon: <Check />},
		{label: 'Онлайн', at: w4('онлайн', 48), icon: <Check />},
		{label: 'Особисто', at: w4('особисто'), icon: <Check />},
		{label: 'Під твій графік', at: w4('графік'), icon: <Check />},
	]} />), true],
	['Не', card((t, a) => <Fn f={() => {
		const T = useTheme();
		const k = w4('один-два');
		return (
			<>
				<Box y={420} o={pop(t, a, 0.3)}><div style={{fontWeight: 800, fontSize: 84, color: T.dim}}><Strike p={pop(t, k - 0.3, 0.4)}>Рік навчання</Strike></div></Box>
				<Box y={640} o={pop(t, k, 0.35)}>
					<Big size={170} style={{color: T.accent, lineHeight: 1}}>1–2 міс</Big>
					<div style={{marginTop: 30, fontWeight: 700, fontSize: 56}}>регулярних занять</div>
				</Box>
			</>
		);
	}} />), true],
	['Перший', offer],
]);

// 5. Не курс
const w5 = (k: string, after = 0) => at(W5, k, after);
const T5 = build(W5, 'ideas/team-5', '49-pop-close-up.mp3', 2, [
	['', card((t, a) => <Poster t={t} a={a} size={124} kicker="Навчаю особисто" sub="під твою мету">Я не продаю<br /><L>курси</L></Poster>, SFX.impact, 0, 0.2), true],
	['курсі', card((t, a) => <Vs t={t} a={a} left="Однакові уроки" right={<>План <L>під тебе</L></>} rightAt={w5('Зі')} />), true],
	['курсі', card((t, a) => <Vs t={t} a={a} left="Навчальні вправи" right={<>Реальні <L>задачі</L></>} rightAt={w5('Зі', 11)} />), true],
	['курсі', card((t, a) => <Vs t={t} a={a} left="Перевірили домашку — і все" right={<>Робимо разом,<br /><L>поки не вийде</L></>} rightAt={w5('Зі', 16.5)} />), true],
	['Курс', card((t, a) => <Vs t={t} a={a} left="Закінчився — далі сам" right={<>Допомагаю знайти<br /><L>першого клієнта</L></>} rightAt={w5('допомагаю')} />), true],
	['Чого', card((t, a) => <List t={t} a={a} head={<>Чого <L>навчаю</L></>} items={[
		{label: 'Сайти', at: w5('сайти')},
		{label: 'Відео для соцмереж', at: w5('відео')},
		{label: 'Рекламні креативи', at: w5('креативи')},
		{label: 'Запуск реклами', at: w5('рекламу')},
	]} />), true],
	['Раніше', card((t, a) => <Roles t={t} a={a} merge={w5('тепер')} head={<>Раніше —<br />команда</>} after={<>Тепер —<br /><L>одна людина</L></>} />, SFX.whoosh, w5('тепер') - w5('Раніше')), true],
	['Як', card((t, a) => <List t={t} a={a} head={<>Як це <L>працює</L></>} items={[
		{label: 'Пишеш мені', at: w5('Пишеш')},
		{label: '30 хв безкоштовно', sub: 'чесно скажу, чи допоможу', at: w5('Тридцять')},
		{label: 'Перше заняття', sub: 'одразу твій проєкт', at: w5('Далі')},
		{label: 'Записи всіх занять', at: w5('Усі')},
	]} />), true],
	['Вадим', vadim('smile', 0.3), true],
	['Беру', card((t, a) => <Dots10 t={t} a={a} head={<>Беру до<br /><L>10 учнів</L> на місяць</>} fill={a + 0.3} label="щоб кожному приділити увагу" />), true],
	['Переходь', offer],
]);

export const [Team1, Team2, Team3, Team4, Team5] = [T1, T2, T3, T4, T5].map((v) => v.Comp);
export const TEAM_FRAMES = [T1, T2, T3, T4, T5].map((v) => v.frames);
export const TEAM_45 = [Team1, Team2, Team3, Team4, Team5].map(feed45);
