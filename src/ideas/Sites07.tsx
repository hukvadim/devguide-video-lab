import React from 'react';
import {interpolate} from 'remotion';
import {F, clamp, ramp} from '../system/kit';
import {at, Big, Box, Browser, Chips, Cue, Fit, L, LHead, LiveShot, Pill, pop, Show, stepFrames, StepVideo, Strike, Ticks, Title, useTheme, W, X} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-07/words.json';

// Sites-07 «Сайт за $10 000» (шлях websites, крок cinematic). Сценарій: public/ideas/sites-07/scenario.md.
// Кінематографічний перший екран — намальований у Remotion (CSS 3D), не запис чужого сайту.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_07 = stepFrames(WORDS);

/** Темний «дорогий» перший екран: обертова 3D-сфера з кілець, величезна типографіка, що їде вгору зі scroll. */
const CineHero: React.FC<{t: number; a0: number; scroll: number}> = ({t, a0, scroll}) => {
	const T = useTheme();
	const s = ramp(t, scroll, scroll + 3);
	return (
		<div style={{position: 'absolute', left: X, top: 520, width: W, height: 720, borderRadius: 30, overflow: 'hidden', background: 'radial-gradient(circle at 70% 30%, #1F2433, #07080C 70%)', opacity: pop(t, a0, 0.5), boxShadow: '0 50px 120px #000000C0'}}>
			<div style={{position: 'absolute', left: 430, top: 60 - s * 120, width: 380, height: 380, perspective: 900}}>
				{Array.from({length: 9}, (_, i) => (
					<div key={i} style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${i % 3 ? '#9FB4FF66' : T.accent}`, transform: `rotateY(${t * 40 + i * 20}deg) rotateX(${60 + Math.sin(t) * 10}deg)`}} />
				))}
			</div>
			<div style={{position: 'absolute', left: 40, top: 300 - s * 260, fontFamily: F.display, fontWeight: 900, fontSize: 150, lineHeight: 0.9, letterSpacing: -6, color: '#F4F1EA'}}>KYIV<br />LIGHT</div>
			<div style={{position: 'absolute', left: 44, top: 600 - s * 330, fontFamily: F.mono, fontSize: 24, letterSpacing: 6, color: '#F4F1EA99'}}>PHOTOGRAPHY · SINCE 2014</div>
			<div style={{position: 'absolute', left: 40, right: 40, top: 760 - s * 420, display: 'flex', gap: 18}}>{[0, 1, 2].map((i) => <div key={i} style={{flex: 1, height: 260, borderRadius: 18, background: `linear-gradient(${140 + i * 40}deg, #3A3F55, #11131A)`}} />)}</div>
		</div>
	);
};

const HUES = [210, 20, 280, 150, 45, 330, 190, 100, 0];
/** Сітка варіантів першого екрана; з pick — рамка навколо обраного. */
const NAMES = ['Hero', 'Card', 'Nav', 'Footer', 'Button', 'Modal', 'Form', 'Reviews', 'Menu'];
const Variants: React.FC<{t: number; a0: number; pick: number; tag?: number; name?: number}> = ({t, a0, pick, tag = 1e6, name = 1e6}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: X, top: 480, width: W, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
			{HUES.map((h, i) => {
				const me = i === 4 && t >= pick;
				return (
					<div key={i} style={{height: 250, borderRadius: 18, overflow: 'hidden', position: 'relative', opacity: pop(t, a0 + i * 0.12) * (t >= pick && !me ? 0.35 : 1), background: `linear-gradient(${120 + i * 25}deg, hsl(${h} 45% 22%), hsl(${h} 50% 8%))`, outline: me ? `6px solid ${T.accent}` : 'none', transform: `scale(${me ? 1.06 : 1})`, boxShadow: me ? `0 0 50px ${T.accent}90` : 'none'}}>
						<div style={{position: 'absolute', left: 16, top: 90, width: 120, height: 18, borderRadius: 9, background: '#FFFFFFCC'}} />
						<div style={{position: 'absolute', left: 16, top: 120, width: 80, height: 18, borderRadius: 9, background: '#FFFFFF66'}} />
						<div style={{position: 'absolute', right: 14, top: 30, width: 90, height: 90, borderRadius: i % 2 ? 45 : 14, border: `3px solid hsl(${h} 80% 70%)`}} />
						<div style={{position: 'absolute', left: 16, bottom: 18, width: 70, height: 24, borderRadius: 12, background: `hsl(${h} 80% 60%)`}} />
						<div style={{position: 'absolute', left: 10, top: 10, padding: '4px 10px', borderRadius: 8, background: '#000000B0', fontFamily: F.mono, fontWeight: 800, fontSize: 24, color: T.accent, opacity: pop(t, tag + i * 0.08)}}>#{i + 1}{t >= name + i * 0.08 ? ` · ${NAMES[i]}` : ''}</div>
					</div>
				);
			})}
		</div>
	);
};

/** З трьох різних варіантів підсвічуються кнопка, поле форми й блок відгуків; з fly вони злітаються в одну зібрану сторінку. */
const Assemble: React.FC<{t: number; marks: [number, number, number]; fly: number}> = ({t, marks, fly}) => {
	const T = useTheme();
	const k = interpolate(t, [fly, fly + 0.9], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
	const cw = 270, gap = 23, top = 470, pageTop = 860;
	const parts = ['картка', 'кнопка', 'блок відгуків'];
	const hue = [20, 150, 280];
	return (
		<>
			{[0, 1, 2].map((i) => {
				const x = X + i * (cw + gap);
				const on = t >= marks[i];
				return (
					<div key={i} style={{position: 'absolute', left: x, top, width: cw, height: 330, borderRadius: 18, overflow: 'hidden', background: `linear-gradient(140deg, hsl(${hue[i]} 45% 22%), hsl(${hue[i]} 50% 9%))`, opacity: pop(t, marks[0] - 0.8 + i * 0.15) * (1 - k * 0.6)}}>
						<div style={{position: 'absolute', left: 12, top: 10, fontFamily: F.mono, fontSize: 22, color: '#FFFFFFAA'}}>#{[2, 5, 7][i]}</div>
						{[0, 1, 2].map((j) => <div key={j} style={{position: 'absolute', left: 16, right: 16, top: 50 + j * 90, height: 70, borderRadius: 10, background: '#FFFFFF14'}} />)}
						<div style={{position: 'absolute', left: 16, right: 16, top: 50 + i * 90, height: 70, borderRadius: 10, border: `4px solid ${on ? T.accent : 'transparent'}`, boxShadow: on ? `0 0 30px ${T.accent}` : 'none', background: on ? `${T.accent}26` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26, color: '#FFF', opacity: on ? 1 : 0}}>{parts[i]}</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: X + 100, top: pageTop, width: W - 200, height: 420, borderRadius: 22, background: T.panel, border: `3px solid ${k > 0.95 ? T.accent : T.line}`, opacity: pop(t, fly - 0.3)}}>
				<div style={{padding: '14px 20px', fontFamily: F.mono, fontSize: 22, color: T.dim}}>твоя сторінка</div>
			</div>
			{[0, 1, 2].map((i) => {
				const sx = X + i * (cw + gap) + 16, sy = top + 50 + i * 90;
				const ex = X + 120, ey = pageTop + 60 + i * 115;
				return t >= marks[i] ? (
					<div key={`f${i}`} style={{position: 'absolute', left: sx + (ex - sx) * k, top: sy + (ey - sy) * k, width: (cw - 32) + (W - 240 - (cw - 32)) * k, height: 70 + 30 * k, borderRadius: 12, background: `hsl(${hue[i]} 60% ${30 + 15 * k}%)`, border: `3px solid ${T.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26 + 8 * k, color: '#FFF', opacity: k > 0 ? 1 : 0}}>{parts[i]}</div>
				) : null;
			})}
		</>
	);
};

/** Приховані елементи: модалка, бокова панель, dropdown — кожен у вигляді мініатюри з позначкою «×3». */
const Hidden: React.FC<{t: number; at: [number, number, number]}> = ({t, at: times}) => {
	const T = useTheme();
	const tile = (i: number, label: string, inner: React.ReactNode) => (
		<div key={label} style={{position: 'absolute', left: X, top: 440 + i * 300, width: W, height: 270, borderRadius: 22, background: T.panel, border: `1px solid ${T.line}`, overflow: 'hidden', opacity: pop(t, times[i]), transform: `translateX(${(1 - pop(t, times[i])) * 60}px)`}}>
			<div style={{position: 'absolute', left: 24, top: 18, fontFamily: F.body, fontWeight: 800, fontSize: 40}}>{label}</div>
			<div style={{position: 'absolute', right: 24, top: 18, fontFamily: F.mono, fontWeight: 800, fontSize: 34, color: T.accent}}>×3</div>
			{inner}
		</div>
	);
	const box = (x: number, y: number, w: number, h: number, extra: React.CSSProperties = {}) => <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 12, background: T.panel2, border: `2px solid ${T.accent}`, ...extra}} />;
	return (
		<>
			{tile(0, 'модалка', <>{[0, 1, 2].map((j) => box(330 + j * 160, 80, 140, 150, {borderRadius: 8 + j * 14}))}</>)}
			{tile(1, 'бокова панель', <>{[0, 1, 2].map((j) => box(330 + j * 160, 70, 60 + j * 20, 180))}</>)}
			{tile(2, 'випадаюче меню', <>{[0, 1, 2].map((j) => <div key={j} style={{position: 'absolute', left: 330 + j * 160, top: 80, width: 140}}>{[0, 1, 2].map((r) => <div key={r} style={{height: 34, marginBottom: 8, borderRadius: j === 1 ? 17 : 6, background: r === 0 ? `${T.accent}55` : T.panel2}} />)}</div>)}</>)}
		</>
	);
};

/** Скрін усього екрана: вікно браузера з варіантами, панель задач з програмами і датою — як є. */
const FullShot: React.FC<{t: number; a0: number; date: number; apps: number}> = ({t, a0, date, apps}) => {
	const T = useTheme();
	const ring = (on: boolean): React.CSSProperties => ({outline: on ? `5px solid ${T.accent}` : 'none', boxShadow: on ? `0 0 30px ${T.accent}` : 'none'});
	return (
		<div style={{position: 'absolute', left: X, top: 580, width: W, height: 560, borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(135deg, #2B3A67, #121624)', opacity: pop(t, a0, 0.4), transform: `scale(${0.92 + 0.08 * pop(t, a0, 0.4)})`, border: `3px dashed ${T.accent}`}}>
			<div style={{position: 'absolute', left: 30, top: 26, right: 30, bottom: 90, borderRadius: 12, background: '#F4F1EA', overflow: 'hidden'}}>
				<div style={{height: 36, background: '#DAD6CE', display: 'flex', alignItems: 'center', paddingLeft: 14, fontFamily: F.mono, fontSize: 20, color: '#555'}}>localhost:3000/variants</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 14}}>
					{HUES.slice(0, 6).map((h, i) => <div key={i} style={{height: 150, borderRadius: 10, background: `linear-gradient(130deg, hsl(${h} 45% 30%), hsl(${h} 50% 12%))`, position: 'relative'}}><span style={{position: 'absolute', left: 8, top: 6, fontFamily: F.mono, fontSize: 20, fontWeight: 800, color: '#fff'}}>#{i + 1}</span></div>)}
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: '#0B0D14E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px'}}>
				<div style={{display: 'flex', gap: 12, padding: 6, borderRadius: 12, ...ring(t >= apps)}}>{['#3B82F6', '#22C55E', '#F59E0B', '#A855F7', '#EF4444'].map((c) => <div key={c} style={{width: 40, height: 40, borderRadius: 10, background: c}} />)}</div>
				<div style={{padding: '6px 12px', borderRadius: 10, fontFamily: F.mono, fontSize: 24, color: '#fff', textAlign: 'right', lineHeight: 1.1, ...ring(t >= date)}}>14:05<br />14.10.2026</div>
			</div>
		</div>
	);
};

/** Тестова сторінка «20 кнопок»: сітка різних кнопок, з pick — обрана. */
const Buttons: React.FC<{t: number; a0: number; pick: number}> = ({t, a0, pick}) => {
	const T = useTheme();
	return (
		<div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: 20}}>
			{Array.from({length: 20}, (_, i) => {
				const h = (i * 47) % 360, me = i === 9 && t >= pick;
				return (
					<div key={i} style={{height: 64, borderRadius: [8, 32, 4, 18][i % 4], background: i % 3 === 1 ? 'transparent' : `hsl(${h} 70% ${i % 2 ? 55 : 45}%)`, border: `3px solid hsl(${h} 70% 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: i % 5 === 4 ? 'Georgia, serif' : F.body, fontWeight: 800, fontSize: 22, color: i % 3 === 1 ? `hsl(${h} 70% 65%)` : '#fff', opacity: pop(t, a0 + i * 0.06) * (t >= pick && !me ? 0.3 : 1), outline: me ? `5px solid ${T.accent}` : 'none', transform: `scale(${me ? 1.12 : 1})`}}>Замовити</div>
				);
			})}
		</div>
	);
};

const Scenes = (t: number) => {
	const T = useTheme();
	const d3 = a('3D'), tech = a('Це'), fit = a('Для'), gen = a('нейромережа'), hid = a('Навіть'), shot = a('Не', 27), tags = a('Нейромережа', 34), mix = a('І', 41), btn = a('Не', 50), old = a('Раніше');
	return (
		<>
			<Show t={t} a={0} b={d3}>
				<Title t={t} section="Організація" size={120}>Сайт за <L>$10 000</L></Title>
			</Show>
			<Show t={t} a={d3} b={tech}>
				<Chips t={t} y={260} size={42} items={[['3D-сцена', d3], ['плавний скрол', a('плавні')], ['велика типографіка', a('велика')]]} />
				<CineHero t={t} a0={d3} scroll={a('плавні')} />
			</Show>
			<Show t={t} a={tech} b={fit}>
				<Box y={260} style={{display: 'flex', justifyContent: 'center', gap: 24}}>
					<span style={{opacity: pop(t, a('GSAP'))}}><Pill style={{fontSize: 56}}>GSAP</Pill></span>
					<span style={{opacity: pop(t, a('Three'))}}><Pill style={{fontSize: 56}}>Three.js</Pill></span>
				</Box>
				{/* справжня сторінка (shots/threejs-home.png, 1280×900): сітка проєктів на Three.js */}
				<Browser t={t} y={460} url="threejs.org" h={700}>
					<LiveShot t={t} src="ideas/sites-07/shots/threejs-home.png" w={1280} a={a('GSAP')} focus={{x: 300, y: 0, w: 960, h: 600, at: a('Three'), zoom: 1.25}} />
				</Browser>
			</Show>
			<Show t={t} a={fit} b={a('Хороша')}>
				<Box y={280}><Big size={84}>Не <L>кожному</L> бізнесу</Big></Box>
				<Ticks t={t} y={520} items={[[true, 'портфоліо', a('портфоліо')], [true, 'бренд', a('бренду')], [false, 'не кожному бізнесу', a('кожному')]]} />
			</Show>
			<Show t={t} a={gen} b={hid}>
				<Box y={260}><Big size={84}>{t >= a('двадцять') ? '20' : '10'} <L>варіантів</L></Big></Box>
				<Variants t={t} a0={a('нагенерувати')} pick={Infinity} />
				<Chips t={t} y={1310} size={46} items={[['цілі сторінки', a('Цілих')], ['окремі елементи', a('окремих')]]} />
			</Show>
			<Show t={t} a={hid} b={a('А', 25)}>
				<Box y={240}><Big size={80}>Навіть <L>приховане</L></Big></Box>
				<Hidden t={t} at={[a('модалка'), a('бокова'), a('випадаюче')]} />
			</Show>
			<Show t={t} a={shot} b={tags}>
				<Box y={230}><Big size={76}>Скрін — <L>весь екран</L></Big></Box>
				<Box y={450} o={pop(t, a('вирізати'))}><Big size={56}><Strike p={ramp(t, a('шматочок'), a('шматочок') + 0.5)}>маленький шматочок</Strike></Big></Box>
				<FullShot t={t} a0={a('Роби')} date={a('датою')} apps={a('програмами')} />
				<Box y={1190} o={pop(t, a('як', 33))}><Big size={60}>як <L>є</L></Big></Box>
			</Show>
			<Show t={t} a={tags} b={mix}>
				<Box y={240}><Big size={80}>AI лишає <L>мітки</L></Big></Box>
				<Variants t={t} a0={tags - 0.5} pick={Infinity} tag={a('номер')} name={a('компонента')} />
				<Box y={1310} o={pop(t, a('помилиться'))}><Big size={56}>і <L>не помилиться</L></Big></Box>
			</Show>
			<Show t={t} a={mix} b={btn}>
				<Box y={250}><Big size={76}>{t >= a('Береш') ? <>Збираєш <L>основну</L></> : <>Тут мені <L>подобається</L></>}</Big></Box>
				<Assemble t={t} marks={[a('картка'), a('кнопка'), a('блок')]} fly={a('збираєш')} />
			</Show>
			<Show t={t} a={btn} b={old}>
				<Box y={240}><Big size={80}>Не <span style={{color: T.red}}>сподобалось</span>?</Big></Box>
				<Box y={460} o={pop(t, a('зроби'))}><Pill style={{fontSize: 44}}>«зроби 20 варіантів кнопок»</Pill></Box>
				<Browser t={t} y={600} url="localhost:3000/buttons" h={560} o={pop(t, a('тестову') - 0.3)}><Buttons t={t} a0={a('тестову')} pick={a('обираєш')} /></Browser>
			</Show>
			<Show t={t} a={old} b={Infinity}>
				<Box y={300}><Big size={76}>Робота <Strike p={ramp(t, a('без'), a('без') + 0.5)}>дизайнера</Strike></Big></Box>
				<Chips t={t} y={530} size={42} items={[['варіанти', a('придумати')], ['показати клієнту', a('показати')], ['клієнт обрав', a('обрав')]]} />
				<Box y={760} o={pop(t, a('Тепер'))}><Big size={84}>Тепер — <L>без дизайнера</L></Big></Box>
				<Box y={1000} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
					<span style={{opacity: pop(t, a('голосом'))}}><Pill style={{fontSize: 52}}>голос</Pill></span>
					<span style={{opacity: pop(t, a('скріни', 67)), fontFamily: F.display, fontWeight: 900, fontSize: 70}}>+</span>
					<span style={{opacity: pop(t, a('скріни', 67))}}><Pill style={{fontSize: 52}}>скріни</Pill></span>
				</Box>
				<Box y={1170} o={pop(t, a('гарний'))}><Big size={68}>= гарний <L>результат</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('3D'), 'riser/riser-7-130957.mp3', 0.2],
	[a('GSAP'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('Three'), 'pop/bubble-pop-389501.mp3', 0.3],
	[a('нагенерувати'), 'whoosh/whoosh-effect-382717.mp3', 0.3],
	[a('модалка'), 'pop/bubble-pop-389501.mp3', 0.25],
	[a('Роби'), 'camera/camera-shutter-click-1133.wav', 0.35],
	[a('номер'), 'click/lock-digital.mp3', 0.25],
	[a('картка'), 'pop/soft-pop.wav', 0.3],
	[a('кнопка'), 'pop/soft-pop.wav', 0.3],
	[a('блок'), 'pop/soft-pop.wav', 0.3],
	[a('збираєш'), 'whoosh/arrow-whoosh-1491.wav', 0.3],
	[a('тестову'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('обираєш'), 'click/mouse-click-352734.mp3', 0.4],
	[a('без'), 'glitch/small-electric-glitch-2595.wav', 0.25],
	[a('результат'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Sites07: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-07" words={WORDS} next="Який сайт насправді потрібен" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[
			ugc('Man_sipping_coffee_at_cafe_ending_wow', a('Хороша'), a('нейромережа') - a('Хороша') - 0.1, {from: 5.5, label: <>Хороша <L>новина</L></>, labelY: 1000}),
			ugc('wow', a('А', 25), a('Не', 27) - a('А', 25) - 0.1, {label: <>Головне — <L>скріни</L></>, labelY: 1000}),
		]} />
);

// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------
const ScenesWide = (t: number) => {
	const T = useTheme();
	const d3 = a('3D'), tech = a('Це'), fit = a('Для'), gen = a('нейромережа'), hid = a('Навіть'), shot = a('Не', 27), tags = a('Нейромережа', 34), mix = a('І', 41), btn = a('Не', 50), old = a('Раніше');
	return (
		<>
			<Show t={t} a={0} b={d3}>
				<Fit from={420} to={1100} center>
					<Title t={t} section="Організація" size={120}>Сайт за <L>$10 000</L></Title>
				</Fit>
			</Show>
			<Show t={t} a={d3} b={tech}>
				<Fit from={220} to={1340} center>
					<Chips t={t} y={260} size={42} items={[['3D-сцена', d3], ['плавний скрол', a('плавні')], ['велика типографіка', a('велика')]]} />
					<CineHero t={t} a0={d3} scroll={a('плавні')} />
				</Fit>
			</Show>
			<Show t={t} a={tech} b={fit}>
				<Fit from={220} to={1340} center>
					<Box y={260} style={{display: 'flex', justifyContent: 'center', gap: 24}}>
						<span style={{opacity: pop(t, a('GSAP'))}}><Pill style={{fontSize: 56}}>GSAP</Pill></span>
						<span style={{opacity: pop(t, a('Three'))}}><Pill style={{fontSize: 56}}>Three.js</Pill></span>
					</Box>
					{/* справжня сторінка (shots/threejs-home.png, 1280×900): сітка проєктів на Three.js */}
					<Browser t={t} y={460} url="threejs.org" h={700}>
						<LiveShot t={t} src="ideas/sites-07/shots/threejs-home.png" w={1280} a={a('GSAP')} focus={{x: 300, y: 0, w: 960, h: 600, at: a('Three'), zoom: 1.25}} />
					</Browser>
				</Fit>
			</Show>
			<Show t={t} a={fit} b={a('Хороша')}>
				<LHead size={84}>Не <L>кожному</L> бізнесу</LHead>
				<Fit from={480} to={934}>
					<Ticks t={t} y={520} items={[[true, 'портфоліо', a('портфоліо')], [true, 'бренд', a('бренду')], [false, 'не кожному бізнесу', a('кожному')]]} />
				</Fit>
			</Show>
			<Show t={t} a={gen} b={hid}>
				<LHead size={84}>{t >= a('двадцять') ? '20' : '10'} <L>варіантів</L></LHead>
				<Fit from={420} to={1530}>
					<Variants t={t} a0={a('нагенерувати')} pick={Infinity} />
					<Chips t={t} y={1310} size={46} items={[['цілі сторінки', a('Цілих')], ['окремі елементи', a('окремих')]]} />
				</Fit>
			</Show>
			<Show t={t} a={hid} b={a('А', 25)}>
				<LHead size={80}>Навіть <L>приховане</L></LHead>
				<Fit from={420} to={1340}>
					<Hidden t={t} at={[a('модалка'), a('бокова'), a('випадаюче')]} />
				</Fit>
			</Show>
			<Show t={t} a={shot} b={tags}>
				<LHead size={76}>Скрін — <L>весь екран</L></LHead>
				<Fit from={410} to={1410}>
					<Box y={450} o={pop(t, a('вирізати'))}><Big size={56}><Strike p={ramp(t, a('шматочок'), a('шматочок') + 0.5)}>маленький шматочок</Strike></Big></Box>
					<FullShot t={t} a0={a('Роби')} date={a('датою')} apps={a('програмами')} />
					<Box y={1190} o={pop(t, a('як', 33))}><Big size={60}>як <L>є</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={tags} b={mix}>
				<LHead size={80}>AI лишає <L>мітки</L></LHead>
				<Fit from={420} to={1530}>
					<Variants t={t} a0={tags - 0.5} pick={Infinity} tag={a('номер')} name={a('компонента')} />
					<Box y={1310} o={pop(t, a('помилиться'))}><Big size={56}>і <L>не помилиться</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={mix} b={btn}>
				<LHead size={76}>{t >= a('Береш') ? <>Збираєш <L>основну</L></> : <>Тут мені <L>подобається</L></>}</LHead>
				<Fit from={420} to={1340}>
					<Assemble t={t} marks={[a('картка'), a('кнопка'), a('блок')]} fly={a('збираєш')} />
				</Fit>
			</Show>
			<Show t={t} a={btn} b={old}>
				<LHead size={80}>Не <span style={{color: T.red}}>сподобалось</span>?</LHead>
				<Fit from={420} to={820}>
					<Box y={460} o={pop(t, a('зроби'))}><Pill style={{fontSize: 44}}>«зроби 20 варіантів кнопок»</Pill></Box>
					<Browser t={t} y={600} url="localhost:3000/buttons" h={560} o={pop(t, a('тестову') - 0.3)}><Buttons t={t} a0={a('тестову')} pick={a('обираєш')} /></Browser>
				</Fit>
			</Show>
			<Show t={t} a={old} b={Infinity}>
				<LHead size={76}>Робота <Strike p={ramp(t, a('без'), a('без') + 0.5)}>дизайнера</Strike></LHead>
				<Fit from={420} to={1390}>
					<Chips t={t} y={530} size={42} items={[['варіанти', a('придумати')], ['показати клієнту', a('показати')], ['клієнт обрав', a('обрав')]]} />
					<Box y={760} o={pop(t, a('Тепер'))}><Big size={84}>Тепер — <L>без дизайнера</L></Big></Box>
					<Box y={1000} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
						<span style={{opacity: pop(t, a('голосом'))}}><Pill style={{fontSize: 52}}>голос</Pill></span>
						<span style={{opacity: pop(t, a('скріни', 67)), fontFamily: F.display, fontWeight: 900, fontSize: 70}}>+</span>
						<span style={{opacity: pop(t, a('скріни', 67))}}><Pill style={{fontSize: 52}}>скріни</Pill></span>
					</Box>
					<Box y={1170} o={pop(t, a('гарний'))}><Big size={68}>= гарний <L>результат</L></Big></Box>
				</Fit>
			</Show>
		</>
	);
};

export const Sites07Wide: React.FC<{theme?: string; seed?: number; kicker?: React.ReactNode}> = ({theme, seed, kicker}) => (
	<StepVideo wide kicker={kicker} theme={theme} seed={seed} dir="ideas/sites-07" words={WORDS} next="Який сайт насправді потрібен" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={ScenesWide}
		inserts={[
			ugc('Man_sipping_coffee_at_cafe_ending_wow', a('Хороша'), a('нейромережа') - a('Хороша') - 0.1, {from: 5.5, label: <>Хороша <L>новина</L></>, labelY: 1000}),
			ugc('wow', a('А', 25), a('Не', 27) - a('А', 25) - 0.1, {label: <>Головне — <L>скріни</L></>, labelY: 1000}),
		]} />
);
