import React from 'react';
import {F, ramp} from '../system/kit';
import {Big, Box, Browser, Chips, Cue, L, LiveShot, Pill, Show, StepVideo, Ticks, Title, X, W, at, pop, stepFrames, useTheme} from '../system/step';
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
const Variants: React.FC<{t: number; a0: number; pick: number}> = ({t, a0, pick}) => {
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
					</div>
				);
			})}
		</div>
	);
};

const Scenes = (t: number) => {
	const d3 = a('3D'), tech = a('Це'), fit = a('Для'), good = a('Хороша'), gen = a('нейромережа');
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
			<Show t={t} a={fit} b={good}>
				<Box y={280}><Big size={84}>Не <L>кожному</L> бізнесу</Big></Box>
				<Ticks t={t} y={520} items={[[true, 'портфоліо', a('портфоліо')], [true, 'бренд', a('бренду')], [false, 'важче під телефон', a('адаптувати')], [false, 'повільніше вантажиться', a('повільніше')]]} />
			</Show>
			<Show t={t} a={gen} b={Infinity}>
				<Box y={260}><Big size={84}>{t >= a('двадцять') ? '20' : '10'} <L>варіантів</L></Big></Box>
				<Variants t={t} a0={a('нагенерувати')} pick={a('обрати')} />
				<Box y={1310} o={pop(t, a('обрати'))}><Big size={64}>Обери під <L>цього клієнта</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('3D'), 'riser/riser-7-130957.mp3', 0.2],
	[a('GSAP'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('Three'), 'pop/bubble-pop-389501.mp3', 0.3],
	[a('адаптувати'), 'glitch/small-electric-glitch-2595.wav', 0.25],
	[a('нагенерувати'), 'whoosh/whoosh-effect-382717.mp3', 0.3],
	[a('обрати'), 'click/mouse-click-352734.mp3', 0.4],
];

export const Sites07: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-07" words={WORDS} next="Який сайт насправді потрібен" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_sipping_coffee_at_cafe_ending_wow', a('Хороша'), a('нейромережа') - a('Хороша') - 0.1, {from: 5.5, label: <>Хороша <L>новина</L></>, labelY: 1000})]} />
);
