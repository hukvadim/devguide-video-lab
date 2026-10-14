import React from 'react';
import {F, ramp} from '../system/kit';
import {Big, Box, Browser, Chips, Cue, L, Pill, PromptCard, Show, StepVideo, Strike, Title, at, io, pop, prompt, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-15/words.json';

// Sites-15 «5 варіантів: секрет швидкого дизайну» (шлях websites, крок variants). Сценарій: public/ideas/sites-15/scenario.md.
// Тестова сторінка з перемикачем — намальований приклад.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_15 = stepFrames(WORDS);
const HUE = [200, 25, 280, 150, 340];

/** Тестова сторінка: вкладки 1–5 і перший екран, що змінює палітру й розкладку з вкладкою. */
const Switcher: React.FC<{t: number; cur: number}> = ({t, cur}) => {
	const T = useTheme();
	const h = HUE[cur];
	const right = cur % 2 === 1;
	return (
		<>
			<div style={{display: 'flex', gap: 12, padding: '18px 20px'}}>
				{[0, 1, 2, 3, 4].map((i) => <div key={i} style={{flex: 1, padding: '12px 0', borderRadius: 12, textAlign: 'center', fontFamily: F.mono, fontWeight: 800, fontSize: 32, background: i === cur ? T.accent : T.panel2, color: i === cur ? T.onAccent : T.dim}}>{i + 1}</div>)}
			</div>
			<div style={{position: 'absolute', left: 20, right: 20, top: 100, bottom: 20, borderRadius: 18, overflow: 'hidden', background: `linear-gradient(${130 + cur * 30}deg, hsl(${h} 45% ${cur === 3 ? 88 : 20}%), hsl(${h} 55% ${cur === 3 ? 72 : 8}%))`}}>
				<div style={{position: 'absolute', [right ? 'right' : 'left']: 36, top: cur === 2 ? 160 : 60, width: 420, textAlign: right ? 'right' : 'left', fontFamily: cur === 4 ? 'Georgia, serif' : F.display, fontWeight: 900, fontSize: cur === 2 ? 58 : 48, lineHeight: 1.05, color: cur === 3 ? `hsl(${h} 60% 15%)` : '#F6F2EA'}}>Зерно — кава, яку пам'ятаєш</div>
				<div style={{position: 'absolute', [right ? 'right' : 'left']: 36, bottom: 50, padding: '14px 30px', borderRadius: cur === 1 ? 8 : 999, background: `hsl(${h} 85% 60%)`, color: '#111', fontWeight: 800, fontSize: 26}}>Замовити дзвінок</div>
				<div style={{position: 'absolute', [right ? 'left' : 'right']: 30, top: 60, width: 230, height: 230, borderRadius: cur % 3 === 0 ? 115 : 24, border: `4px solid hsl(${h} 80% 70%)`, opacity: 0.8}} />
			</div>
		</>
	);
};

/** Мінікартка підходу: класичний чи кінематографічний перший екран. */
const Look: React.FC<{t: number; at0: number; x: number; title: string; sub: string; cine?: boolean}> = ({t, at0, x, title, sub, cine}) => {
	const T = useTheme();
	const o = pop(t, at0);
	const k = cine ? Math.sin((t - at0) * 2.2) * 14 : 0;
	return (
		<div style={{position: 'absolute', left: x, top: 470, width: 410, height: 520, opacity: o, transform: `translateY(${(1 - o) * 40}px)`, borderRadius: 28, overflow: 'hidden', border: `2px solid ${T.line}`, background: cine ? 'linear-gradient(160deg, #1B1030, #05060A)' : '#F4F1EA'}}>
			<div style={{position: 'absolute', left: 30, top: 40 + k, width: 340, fontFamily: F.display, fontWeight: 900, fontSize: cine ? 50 : 42, lineHeight: 1.05, color: cine ? '#F6F2EA' : '#1A1A1A'}}>Зерно — кава, яку пам'ятаєш</div>
			{cine ? <div style={{position: 'absolute', right: -60 + k * 2, bottom: 40, width: 260, height: 260, borderRadius: 130, background: 'radial-gradient(circle at 35% 35%, #B98CFF, #3B1D7A)', boxShadow: '0 0 80px #8A5CFF80'}} />
				: <div style={{position: 'absolute', left: 30, bottom: 40, padding: '14px 28px', borderRadius: 12, background: '#1A1A1A', color: '#fff', fontWeight: 800, fontSize: 26}}>Замовити</div>}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 24px', background: '#000000B0', color: '#fff', fontFamily: F.display, fontWeight: 800, fontSize: 36}}>{title}<div style={{fontSize: 26, fontWeight: 600, color: '#ffffffB0'}}>{sub}</div></div>
		</div>
	);
};

/** Кола правок: кожне ближче до цілі. */
const Rounds: React.FC<{t: number; y: number; items: [string, number, number][]}> = ({t, y, items}) => {
	const T = useTheme();
	return <>{items.map(([label, fit, at0], i) => {
		const p = pop(t, at0, 0.5);
		return (
			<Box key={label} y={y + i * 130} o={p} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '0 40px'}}>
				<span style={{width: 200, textAlign: 'left', fontSize: 44, fontWeight: 800}}>{label}</span>
				<div style={{flex: 1, height: 34, borderRadius: 17, background: T.panel2, overflow: 'hidden'}}><div style={{width: `${fit * p}%`, height: '100%', background: T.accent}} /></div>
			</Box>
		);
	})}</>;
};

const Scenes = (t: number) => {
	const T = useTheme();
	const say = a('Я'), what = a('Головної'), test = a('Нейромережа'), more = a('Не', 28), loop = a('кожне'), take = a('Потім'), cmp = a('Тут'), fin = a('Так', 56);
	// до «Перемикаєш» перемикач крутиться сам, далі вкладка = назване число
	const nums = ['один', 'два', 'три', 'чотири', "п'ять"].map((w) => a(w, 22));
	const cur = t < nums[0] ? Math.floor(Math.max(0, t - test) / 0.7) % 5 : nums.filter((x) => t >= x).length - 1;
	return (
		<>
			<Show t={t} a={0} b={say}>
				<Title t={t} section="Розробка" size={96}>5 варіантів: секрет <L>швидкого дизайну</L></Title>
			</Show>
			<Show t={t} a={say} b={what}>
				<Box y={440}><Big size={88}><Strike p={ramp(t, a('Я', 4.5), a('Я', 4.5) + 0.5)}>«зроби красивіше»</Strike></Big></Box>
				<Box y={700} o={pop(t, a('зроби', 5))}><Big size={100}>«зроби <L>5 варіантів</L>»</Big></Box>
			</Show>
			<Show t={t} a={what} b={test}>
				<Box y={260}><Big size={84}>Чого <L>завгодно</L></Big></Box>
				<Chips t={t} y={480} size={46} items={[['головна', what], ['навігація', a('навігації')], ['перший екран', a('першого')], ['«замовити дзвінок»', a('спливашки')], ['каталог товарів', a('каталогу')]]} />
			</Show>
			<Show t={t} a={test} b={a('Один', 25)}>
				<Box y={230}><Big size={68}>Тестова сторінка <L>з перемикачем</L></Big></Box>
				<Browser t={t} y={420} url="localhost:3000/variants" h={640}><Switcher t={t} cur={cur} /></Browser>
				<Box y={1110} o={pop(t, a('кольорами'))}><span style={{fontSize: 42, fontWeight: 700}}>кольори · розкладки</span></Box>
				<Box y={1200} o={io(t, a('Основний'), nums[0])}><Pill style={{fontSize: 44}}>основний сайт не чіпає</Pill></Box>
			</Show>
			<Show t={t} a={more} b={loop}>
				<Box y={230}><Big size={80}>Не <span style={{color: T.red}}>подобається</span>?</Big></Box>
				<PromptCard t={t} a={a('пишеш')} b={a('сподобалось')} y={420} size={36} text={prompt('variants', 'more')} />
				<Box y={1150} o={pop(t, a('скрін'))}><Pill style={{fontSize: 44}}>+ скрін</Pill></Box>
			</Show>
			<Show t={t} a={loop} b={take}>
				<Box y={260}><Big size={84}>Кожне коло — <L>ближче</L></Big></Box>
				<Rounds t={t} y={520} items={[['коло 1', 45, loop], ['коло 2', 75, a('коло') + 0.4], ['коло 3', 96, a('ближче')]]} />
			</Show>
			<Show t={t} a={take} b={cmp}>
				<Box y={250}><Big size={72}>Беремо <L>варіант 2</L></Big></Box>
				<Browser t={t} y={440} url="localhost:3000/variants" h={560} o={1 - 0.6 * pop(t, a('видаляємо'))}><Switcher t={t} cur={1} /></Browser>
				<Box y={1120} o={pop(t, a('переноситься'))}><Big size={60}>→ в <L>основний сайт</L></Big></Box>
				<Box y={1220} o={pop(t, a('видаляємо'))}><Big size={52}><Strike p={ramp(t, a('видаляємо'), a('видаляємо') + 0.5)}>тестова сторінка</Strike></Big></Box>
			</Show>
			<Show t={t} a={cmp} b={fin}>
				<Box y={250}><Big size={76}>Класика <L>чи кіно</L>?</Big></Box>
				<Look t={t} at0={a('класичний')} x={84} title="Класичний" sub="shadcn/ui, легкий" />
				<Look t={t} at0={a('кінематографічний')} x={530} title="Кіно" sub="GSAP, анімації" cine />
				<Chips t={t} y={1080} size={42} items={[['що швидше?', a('швидше')], ['як на телефоні?', a('телефоні')], ['скільки часу на правки?', a('скільки')]]} />
			</Show>
			<Show t={t} a={fin} b={Infinity}>
				<Box y={540}><Big size={104}>Так виходять <L>шикарні сайти</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Я', 4.5), 'glitch/small-electric-glitch-2595.wav', 0.25],
	[a("п'ять"), 'impact/bass-hit-futuristic.mp3', 0.3],
	[a('Нейромережа'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('скрін'), 'camera/camera-shutter-click-1133.wav', 0.35],
	[a('беремо'), 'click/mouse-click-352734.mp3', 0.4],
	[a('кінематографічний'), 'whoosh/simple-whoosh-382724.mp3', 0.25],
	[a('Так', 56), 'sparkle/shimmer-sparkle-sweep.mp3', 0.35],
];

export const Sites15: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-15" words={WORDS} next="Правки: 3 раунди і Trello" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('wow', a('Один', 25), a('Не', 28) - a('Один', 25) - 0.1, {label: <>Один майже <L>завжди класний</L></>, labelY: 1000})]} />
);
