import React from 'react';
import {AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, type SpringConfig} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import {F, Wordmark, clamp, ramp} from '../system/kit';
import {BeatVideo, Card, beat, beatFrames} from '../system/beat';
import {Big, L, S, X, W, useTheme} from '../system/step';

// SKILL-TEST: один бриф, різні скіли анімації (план: порівняти встановлені скіли).
// Бриф: постер «3 промпти для сайту» → 3 картки-візуали (≤6 слів) → «напиши ПРОМПТ». Музика на біт, без голосу.
// Кожен варіант — свій файл-секція нижче; спільні лише трек, тексти й тривалості карток.
const TRACK = '16-edm-techno-fest-vibes.mp3';
const CTA = 'ПРОМПТ';
const ITEMS = [
	{n: 1, label: <>Hero-блок<br /><L>за 1 промпт</L></>},
	{n: 2, label: <>Палітра<br /><L>з логотипу</L></>},
	{n: 3, label: <>Мобільна версія<br /><L>без болю</L></>},
];
const SWATCH = ['#C3FF55', '#7FB52A', '#F5F7F2', '#8EDFFF', '#10161C'];

/** Локальний час картки: GSAP-таймлайн сідає від кадру Sequence. */
const At: React.FC<{a: number; children: React.ReactNode}> = ({a, children}) => <Sequence from={S(a)} layout="none">{children}</Sequence>;

// ================= gsap-animation (notedit/happy-skills) + gsap-timeline/gsap-core (greensock) =================
// Скіл радить SplitText/MorphSVG/DrawSVG, але STACK.md: адаптер @remotion/gsap не підтримує плагіни,
// тож лише core: timeline з position-параметрами, stagger (from: center / grid), back/elastic/expo.
// Літери розбиті в JSX (порада STACK.md замість SplitText).
const Chars: React.FC<{s: string; cls: string}> = ({s, cls}) => <>{[...s].map((c, i) => <span key={i} className={cls} style={{display: 'inline-block', whiteSpace: 'pre'}}>{c}</span>)}</>;

// кадр 0 = обкладинка Instagram: таймлайн там ще на нулі, тож показуємо той самий постер без GSAP
const GPoster: React.FC = () => (useCurrentFrame() === 0 ? <GPosterBody /> : <GPosterAnim />);
const GPosterAnim: React.FC = () => {
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline
			.from(selector('.k'), {y: -30, opacity: 0, duration: 0.3, ease: 'power2.out'})
			.from(selector('.ch'), {yPercent: 110, rotationX: -80, opacity: 0, duration: 0.5, stagger: {each: 0.025, from: 'start'}, ease: 'back.out(2)'}, 0.05)
			.from(selector('.bar'), {scaleX: 0, duration: 0.5, ease: 'expo.out'}, '-=0.25')
			.from(selector('.sub'), {y: 30, opacity: 0, duration: 0.4, ease: 'power3.out'}, '<0.1');
	});
	return <GPosterBody r={ref} />;
};
const GPosterBody: React.FC<{r?: React.Ref<HTMLDivElement>}> = ({r}) => {
	const T = useTheme();
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `0 ${X}px`}}>
			<div ref={r} style={{perspective: 900}}>
				<div className="k" style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 6, color: T.accent, marginBottom: 36}}>ЗБЕРЕЖИ</div>
				<Big size={128} style={{lineHeight: 1.05}}><Chars s="3 промпти" cls="ch" /><br /><span style={{color: T.accent}}><Chars s="для сайту" cls="ch" /></span></Big>
				<div className="bar" style={{width: 220, height: 10, borderRadius: 5, background: T.accent, margin: '44px auto 0', transformOrigin: 'left'}} />
				<div className="sub" style={{marginTop: 40, fontFamily: F.body, fontWeight: 700, fontSize: 48, color: T.dim}}>Claude зробить решту</div>
			</div>
		</AbsoluteFill>
	);
};

/** Номер + підпис зверху, візуал — у центрі. */
const GHead: React.FC<{n: number; children: React.ReactNode}> = ({n, children}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: X, width: W, top: 230, textAlign: 'center'}}>
			<div className="num" style={{display: 'inline-flex', width: 120, height: 120, borderRadius: 60, background: T.accent, color: T.onAccent, alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64}}>{n}</div>
			<div className="lbl" style={{marginTop: 34}}><Big size={70}>{children}</Big></div>
		</div>
	);
};
const headIn = (tl: gsap.core.Timeline, q: gsap.utils.SelectorFunc) =>
	tl.from(q('.num'), {scale: 0, rotation: -120, duration: 0.5, ease: 'back.out(2.2)'}).from(q('.lbl'), {y: 40, opacity: 0, duration: 0.4, ease: 'power3.out'}, '-=0.25');

const GHero: React.FC = () => {
	const T = useTheme();
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		headIn(timeline, selector);
		timeline
			.from(selector('.win'), {y: 120, rotationX: 25, opacity: 0, duration: 0.6, ease: 'expo.out'}, 0.3)
			.from(selector('.blk'), {scaleX: 0, opacity: 0, transformOrigin: 'left center', duration: 0.45, stagger: 0.12, ease: 'power3.out'}, '-=0.2')
			.from(selector('.btn'), {scale: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)'}, '-=0.1')
			.to(selector('.btn'), {scale: 0.92, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.inOut'}, '+=0.4');
	});
	const blk = (w: number, h: number, c: string, mt = 22) => <div className="blk" style={{width: w, height: h, borderRadius: h / 2.5, background: c, marginTop: mt}} />;
	return (
		<AbsoluteFill ref={ref} style={{perspective: 1400}}>
			<GHead n={1}>{ITEMS[0].label}</GHead>
			<div className="win" style={{position: 'absolute', left: X, width: W, top: 700, height: 700, borderRadius: 32, background: T.card, border: `3px solid ${T.line}`, overflow: 'hidden', boxShadow: '0 50px 120px #00000080'}}>
				<div style={{height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px', background: T.panel2}}>{['#FF6B5E', '#FFC85E', '#7FD36B'].map((c) => <span key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />)}</div>
				<div style={{padding: '50px 56px'}}>
					{blk(260, 26, `${T.accent}55`, 0)}
					{blk(640, 64, T.text, 40)}
					{blk(520, 64, T.text)}
					{blk(560, 26, T.dim, 36)}
					{blk(420, 26, T.dim, 16)}
					<div className="btn" style={{display: 'inline-block', marginTop: 50, padding: '26px 56px', borderRadius: 999, background: T.accent, color: T.onAccent, fontWeight: 800, fontSize: 40}}>Записатися →</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const GPalette: React.FC = () => {
	const T = useTheme();
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		headIn(timeline, selector);
		timeline
			.from(selector('.logo'), {scale: 0, rotation: 200, duration: 0.7, ease: 'back.out(1.6)'}, 0.3)
			.from(selector('.ray'), {scaleY: 0, transformOrigin: 'top center', duration: 0.35, stagger: {each: 0.06, from: 'center'}, ease: 'power2.out'}, '-=0.1')
			.from(selector('.sw'), {y: -80, scale: 0, duration: 0.6, stagger: {each: 0.08, from: 'center'}, ease: 'elastic.out(1, 0.55)'}, '-=0.2')
			.from(selector('.hex'), {opacity: 0, y: 14, duration: 0.3, stagger: {each: 0.06, from: 'center'}}, '-=0.4');
	});
	return (
		<AbsoluteFill ref={ref}>
			<GHead n={2}>{ITEMS[1].label}</GHead>
			<div className="logo" style={{position: 'absolute', left: 540 - 110, top: 720, width: 220, height: 220, borderRadius: 60, background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 110, color: T.onAccent}}>D</div>
			{SWATCH.map((c, i) => {
				const x = 138 + i * 168; // ряд 804px по центру
				return (
					<React.Fragment key={c}>
						<div className="ray" style={{position: 'absolute', left: x + 64, top: 940, width: 4, height: 1100 - 940 - (i === 2 ? 0 : 40), background: T.line}} />
						<div className="sw" style={{position: 'absolute', left: x, top: 1100, width: 132, height: 200, borderRadius: 26, background: c, border: `3px solid ${T.line}`}} />
						<div className="hex" style={{position: 'absolute', left: x - 10, width: 152, top: 1320, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: T.dim}}>{c}</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};

const GMobile: React.FC = () => {
	const T = useTheme();
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		headIn(timeline, selector);
		timeline
			.from(selector('.dev'), {opacity: 0, y: 60, duration: 0.5, ease: 'power3.out'}, 0.3)
			// десктоп «стискається» в телефон: ширина/висота/радіус, блоки перестроюються в колонку
			.to(selector('.dev'), {width: 420, height: 760, left: 540 - 210, borderRadius: 64, duration: 0.8, ease: 'expo.inOut'}, '+=0.35')
			.to(selector('.col'), {width: '100%', duration: 0.8, ease: 'expo.inOut'}, '<')
			.from(selector('.ok'), {scale: 0, duration: 0.5, ease: 'back.out(2.5)'}, '-=0.05');
	});
	return (
		<AbsoluteFill ref={ref}>
			<GHead n={3}>{ITEMS[2].label}</GHead>
			<div className="dev" style={{position: 'absolute', left: X, top: 720, width: W, height: 560, borderRadius: 28, background: T.card, border: `4px solid ${T.accent}`, overflow: 'hidden', padding: 34, boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', gap: 20, alignContent: 'flex-start'}}>
				<div style={{width: '100%', height: 40, borderRadius: 12, background: T.panel2}} />
				{[0, 1, 2].map((i) => <div key={i} className="col" style={{width: 'calc(33.3% - 14px)', height: 170, borderRadius: 18, background: i === 0 ? `${T.accent}44` : T.panel2}} />)}
				<div style={{width: '60%', height: 30, borderRadius: 12, background: T.dim}} />
			</div>
			<div className="ok" style={{position: 'absolute', left: 540 + 150, top: 1380, width: 110, height: 110, borderRadius: 55, background: T.accent, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900}}>✓</div>
		</AbsoluteFill>
	);
};

const GCta: React.FC = () => {
	const T = useTheme();
	const ref = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline
			.from(selector('.w'), {y: -40, opacity: 0, duration: 0.35, ease: 'power2.out'})
			.from(selector('.pill'), {scale: 2.2, rotation: -12, opacity: 0, duration: 0.45, ease: 'expo.out'}, 0.3)
			.from(selector('.pc'), {yPercent: 120, duration: 0.4, stagger: 0.04, ease: 'back.out(3)'}, '<0.1')
			.from(selector('.sub'), {y: 30, opacity: 0, duration: 0.4, ease: 'power3.out'}, '+=0.15')
			.from(selector('.mark'), {opacity: 0, scale: 0.8, duration: 0.5, ease: 'power2.out'}, '+=0.3');
	});
	return (
		<AbsoluteFill ref={ref} style={{alignItems: 'center', textAlign: 'center'}}>
			<div className="w" style={{marginTop: 340}}><Big size={96}>Напиши</Big></div>
			<div className="pill" style={{marginTop: 40, padding: '30px 70px', borderRadius: 40, background: T.accent, overflow: 'hidden', boxShadow: `0 40px 100px ${T.accent}55`}}>
				<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 140, color: T.onAccent, letterSpacing: -2}}><Chars s={CTA} cls="pc" /></span>
			</div>
			<div className="sub" style={{marginTop: 60, fontFamily: F.body, fontWeight: 800, fontSize: 52, lineHeight: 1.3}}>у коментарях — пришлю<br /><L>3 промпти</L> у Direct</div>
			<div className="mark" style={{position: 'absolute', top: 1380}}><Wordmark size={84} /></div>
		</AbsoluteFill>
	);
};

const gsapCards: Card[] = [
	{beats: 6, el: (_, a) => <At a={a}><GPoster /></At>},
	{beats: 8, sfx: 'pop/soft-pop.wav', vol: 0.3, off: 1.6, el: (_, a) => <At a={a}><GHero /></At>},
	{beats: 8, sfx: 'sparkle/sparkle-touch.mp3', vol: 0.3, off: 1.1, el: (_, a) => <At a={a}><GPalette /></At>},
	{beats: 8, sfx: 'whoosh/whoosh-fast.mp3', vol: 0.22, off: 1.0, el: (_, a) => <At a={a}><GMobile /></At>},
	{beats: 10, sfx: 'impact/impact-movie-epic.mp3', vol: 0.3, off: 0.3, el: (_, a) => <At a={a}><GCta /></At>},
];

// ================= spring-animation (notedit/happy-skills) =================
// Лише Remotion spring(): пресети скіла, trail, center-out grid, multi-property, enter − exit.
const SP = {
	smooth: {damping: 200}, snappy: {damping: 20, stiffness: 200}, bouncy: {damping: 8}, heavy: {damping: 15, stiffness: 80, mass: 2},
	pop: {damping: 6, stiffness: 150}, stiff: {damping: 15, stiffness: 300}, gentle: {damping: 20, stiffness: 40, mass: 1.5},
} satisfies Record<string, Partial<SpringConfig>>;
const CARD = S((8 * 60) / beat(TRACK).bpm);
/** Кадр картки; на глобальному кадрі 0 (обкладинка) — «все вже приїхало». */
const useF = () => {
	const f = useCurrentFrame();
	const g = useGlobalFrame();
	return g === 0 ? 999 : f;
};
const useGlobalFrame = () => {
	const {from} = useSeq();
	return useCurrentFrame() + from;
};
const SeqCtx = React.createContext({from: 0});
const useSeq = () => React.useContext(SeqCtx);
const SAt: React.FC<{a: number; children: React.ReactNode}> = ({a, children}) => <SeqCtx.Provider value={{from: S(a)}}><At a={a}>{children}</At></SeqCtx.Provider>;
const sp = (f: number, config: Partial<SpringConfig>, delay = 0) => spring({frame: f, fps: 30, delay, config});
/** enter − exit: картка «відпружинює» за 8 кадрів до кінця. */
const out = (f: number) => sp(f, SP.stiff, CARD - 8);

const SpChars: React.FC<{s: string; f: number; delay?: number; color?: string}> = ({s, f, delay = 0, color}) => (
	<>{[...s].map((c, i) => {
		const p = sp(f, SP.pop, delay + i * 2);
		return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', color, opacity: Math.min(1, p), transform: `translateY(${interpolate(p, [0, 1], [90, 0])}px) scale(${p})`}}>{c}</span>;
	})}</>
);

const SpPoster: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const k = sp(f, SP.snappy), bar = sp(f, SP.snappy, 22), sub = sp(f, SP.gentle, 26), ring = sp(f, SP.heavy);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `0 ${X}px`}}>
			<div style={{position: 'absolute', width: 760, height: 760, borderRadius: 380, border: `3px solid ${T.accent}33`, transform: `scale(${ring})`}} />
			<div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 6, color: T.accent, marginBottom: 36, opacity: k, transform: `translateY(${(1 - k) * -40}px)`}}>ЗБЕРЕЖИ</div>
			<Big size={128} style={{lineHeight: 1.05}}><SpChars s="3 промпти" f={f} delay={4} /><br /><SpChars s="для сайту" f={f} delay={12} color={T.accent} /></Big>
			<div style={{width: 220, height: 10, borderRadius: 5, background: T.accent, margin: '44px auto 0', transform: `scaleX(${bar})`}} />
			<div style={{marginTop: 40, fontFamily: F.body, fontWeight: 700, fontSize: 48, color: T.dim, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`}}>Claude зробить решту</div>
		</AbsoluteFill>
	);
};

const SpHead: React.FC<{n: number; f: number; children: React.ReactNode}> = ({n, f, children}) => {
	const T = useTheme();
	const num = sp(f, SP.pop), lbl = sp(f, SP.bouncy, 5);
	return (
		<div style={{position: 'absolute', left: X, width: W, top: 230, textAlign: 'center'}}>
			<div style={{display: 'inline-flex', width: 120, height: 120, borderRadius: 60, background: T.accent, color: T.onAccent, alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64, transform: `scale(${num}) rotate(${(1 - num) * -90}deg)`}}>{n}</div>
			<div style={{marginTop: 34, opacity: Math.min(1, lbl), transform: `translateY(${(1 - lbl) * 50}px)`}}><Big size={70}>{children}</Big></div>
		</div>
	);
};

const SpHero: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const o = 1 - out(f);
	const win = sp(f, SP.heavy, 8);
	const blocks: [number, number, string][] = [[260, 26, `${T.accent}55`], [640, 64, T.text], [520, 64, T.text], [560, 26, T.dim], [420, 26, T.dim]];
	const btn = sp(f, SP.pop, 8 + 18 + blocks.length * 4);
	// клік по кнопці: короткий «вдавлений» spring
	const press = sp(f, SP.stiff, 70) - sp(f, SP.stiff, 76);
	return (
		<AbsoluteFill style={{opacity: o}}>
			<SpHead n={1} f={f}>{ITEMS[0].label}</SpHead>
			<div style={{position: 'absolute', left: X, width: W, top: 700, height: 700, borderRadius: 32, background: T.card, border: `3px solid ${T.line}`, overflow: 'hidden', boxShadow: '0 50px 120px #00000080', opacity: win, transform: `perspective(1000px) rotateX(${(1 - win) * 25}deg) translateY(${(1 - win) * 160}px)`}}>
				<div style={{height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px', background: T.panel2}}>{['#FF6B5E', '#FFC85E', '#7FD36B'].map((c) => <span key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />)}</div>
				<div style={{padding: '50px 56px'}}>
					{blocks.map(([w, h, c], i) => {
						const p = sp(f, SP.bouncy, 20 + i * 4);
						return <div key={i} style={{width: w, height: h, borderRadius: h / 2.5, background: c, marginTop: i === 0 ? 0 : i === 1 || i === 3 ? 38 : 18, transform: `translateX(${(1 - p) * -120}px)`, opacity: Math.min(1, p)}} />;
					})}
					<div style={{display: 'inline-block', marginTop: 50, padding: '26px 56px', borderRadius: 999, background: T.accent, color: T.onAccent, fontWeight: 800, fontSize: 40, transform: `scale(${btn * (1 - press * 0.08)})`}}>Записатися →</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const SpPalette: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const logo = sp(f, SP.bouncy, 6);
	return (
		<AbsoluteFill style={{opacity: 1 - out(f)}}>
			<SpHead n={2} f={f}>{ITEMS[1].label}</SpHead>
			<div style={{position: 'absolute', left: 540 - 110, top: 720, width: 220, height: 220, borderRadius: 60, background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 110, color: T.onAccent, transform: `scale(${logo}) rotate(${(1 - logo) * 180}deg)`}}>D</div>
			{SWATCH.map((c, i) => {
				const d = Math.abs(i - 2); // center-out, як GridStagger у скілі
				const p = sp(f, SP.pop, 26 + d * 5);
				const x = 138 + i * 168;
				return (
					<React.Fragment key={c}>
						<div style={{position: 'absolute', left: x, top: 1100, width: 132, height: 200, borderRadius: 26, background: c, border: `3px solid ${T.line}`, transform: `translateY(${(1 - p) * -300}px) scale(${p})`}} />
						<div style={{position: 'absolute', left: x - 10, width: 152, top: 1320, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: T.dim, opacity: sp(f, SP.smooth, 40 + d * 5)}}>{c}</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};

const SpMobile: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const enter = sp(f, SP.snappy, 8);
	// multi-property: розмір — heavy (вага), кут — bouncy (похитування), галочка — pop
	const m = sp(f, SP.heavy, 30), tilt = sp(f, SP.bouncy, 30) - sp(f, SP.bouncy, 44), ok = sp(f, SP.pop, 62);
	const w = interpolate(m, [0, 1], [W, 420]), h = interpolate(m, [0, 1], [560, 760]);
	return (
		<AbsoluteFill style={{opacity: 1 - out(f)}}>
			<SpHead n={3} f={f}>{ITEMS[2].label}</SpHead>
			<div style={{position: 'absolute', left: 540 - w / 2, top: 720, width: w, height: h, borderRadius: interpolate(m, [0, 1], [28, 64]), background: T.card, border: `4px solid ${T.accent}`, overflow: 'hidden', padding: 34, boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', gap: 20, alignContent: 'flex-start', opacity: enter, transform: `translateY(${(1 - enter) * 80}px) rotate(${tilt * 4}deg)`}}>
				<div style={{width: '100%', height: 40, borderRadius: 12, background: T.panel2}} />
				{[0, 1, 2].map((i) => <div key={i} style={{width: `calc(${interpolate(m, [0, 1], [33.3, 100])}% - ${interpolate(m, [0, 1], [14, 0])}px)`, height: 170, borderRadius: 18, background: i === 0 ? `${T.accent}44` : T.panel2}} />)}
				<div style={{width: '60%', height: 30, borderRadius: 12, background: T.dim}} />
			</div>
			<div style={{position: 'absolute', left: 540 + 150, top: 1380, width: 110, height: 110, borderRadius: 55, background: T.accent, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, transform: `scale(${ok})`}}>✓</div>
		</AbsoluteFill>
	);
};

const SpCta: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const w = sp(f, SP.snappy), pill = sp(f, SP.heavy, 8), sub = sp(f, SP.gentle, 30), mark = sp(f, SP.smooth, 45);
	return (
		<AbsoluteFill style={{alignItems: 'center', textAlign: 'center'}}>
			<div style={{marginTop: 340, opacity: w, transform: `translateY(${(1 - w) * -40}px)`}}><Big size={96}>Напиши</Big></div>
			<div style={{marginTop: 40, padding: '30px 70px', borderRadius: 40, background: T.accent, overflow: 'hidden', boxShadow: `0 40px 100px ${T.accent}55`, transform: `scale(${interpolate(pill, [0, 1], [2, 1])}) rotate(${(1 - pill) * -10}deg)`, opacity: Math.min(1, pill * 1.5)}}>
				<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 140, color: T.onAccent, letterSpacing: -2}}><SpChars s={CTA} f={f} delay={12} /></span>
			</div>
			<div style={{marginTop: 60, fontFamily: F.body, fontWeight: 800, fontSize: 52, lineHeight: 1.3, opacity: sub, transform: `translateY(${(1 - sub) * 30}px)`}}>у коментарях — пришлю<br /><L>3 промпти</L> у Direct</div>
			<div style={{position: 'absolute', top: 1380, opacity: mark, transform: `scale(${0.8 + mark * 0.2})`}}><Wordmark size={84} /></div>
		</AbsoluteFill>
	);
};

const springCards: Card[] = [
	{beats: 6, el: (_, a) => <SAt a={a}><SpPoster /></SAt>},
	{beats: 8, sfx: 'pop/soft-pop.wav', vol: 0.3, off: 1.4, el: (_, a) => <SAt a={a}><SpHero /></SAt>},
	{beats: 8, sfx: 'sparkle/sparkle-touch.mp3', vol: 0.3, off: 0.9, el: (_, a) => <SAt a={a}><SpPalette /></SAt>},
	{beats: 8, sfx: 'whoosh/whoosh-fast.mp3', vol: 0.22, off: 1.0, el: (_, a) => <SAt a={a}><SpMobile /></SAt>},
	{beats: 10, sfx: 'impact/impact-movie-epic.mp3', vol: 0.3, off: 0.3, el: (_, a) => <SAt a={a}><SpCta /></SAt>},
];

// ================= kinetic-typography + short-form-video (iart-ai) =================
// Типографіка веде: mask-reveal рядків (translateY 110% у overflow:hidden), blur-in, clip-path wipe, expo-out 0.4–0.6 с,
// stagger рядків 80 мс / слів 50 мс. Short-form: хук-текст з кадру 0, punch-in на біт (pattern interrupt),
// нерівні картки (5/7/9/7 бітів), петля — останній кадр = перший (повтор постера).
const kt = (f: number, at: number, len = 0.5) => ramp(f / 30, at, at + len); // ramp з kit = ease-out expo
/** Mask-reveal рядка: текст виїжджає з-під базової лінії. */
const MLine: React.FC<{f: number; at: number; children: React.ReactNode}> = ({f, at, children}) => (
	<div style={{overflow: 'hidden', paddingBottom: '0.08em'}}><div style={{transform: `translateY(${(1 - kt(f, at)) * 110}%)`}}>{children}</div></div>
);
const Blur: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => {
	const p = kt(f, at, 0.45);
	return <div style={{opacity: p, filter: `blur(${(1 - p) * 12}px)`, ...style}}>{children}</div>;
};
const Wipe: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => (
	<div style={{clipPath: `inset(0 ${(1 - kt(f, at, 0.55)) * 100}% 0 0)`, ...style}}>{children}</div>
);
/** Punch-in 100→108% на біт (скіл: найдешевший pattern interrupt без нового футажу). */
const Punch: React.FC<{f: number; at: number; children: React.ReactNode}> = ({f, at, children}) => {
	const s = spring({frame: f - S(at), fps: 30, config: {damping: 12, stiffness: 200}});
	return <AbsoluteFill style={{transform: `scale(${1 + s * 0.08})`, transformOrigin: '50% 45%'}}>{children}</AbsoluteFill>;
};

const KPosterBody: React.FC<{f: number}> = ({f}) => {
	const T = useTheme();
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `0 ${X}px`}} aria-label="3 промпти для сайту">
			<Wipe f={f} at={0} style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 6, color: T.accent, marginBottom: 36}}>ЗБЕРЕЖИ</Wipe>
			<Big size={128} style={{lineHeight: 1.05, letterSpacing: '-0.02em'}}>
				<MLine f={f} at={0.08}>3 промпти</MLine>
				<MLine f={f} at={0.16}><L>для сайту</L></MLine>
			</Big>
			<Blur f={f} at={0.5} style={{marginTop: 50, fontFamily: F.body, fontWeight: 700, fontSize: 48, color: T.dim}}>Claude зробить решту</Blur>
		</AbsoluteFill>
	);
};
const KPoster: React.FC = () => <KPosterBody f={useF()} />;

const KHead: React.FC<{n: number; f: number; a: string; b: string}> = ({n, f, a, b}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: X, width: W, top: 210, textAlign: 'center'}}>
			<Wipe f={f} at={0} style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 6, color: T.accent}}>ПРОМПТ {n}/3</Wipe>
			<Big size={72} style={{marginTop: 26, lineHeight: 1.08, letterSpacing: '-0.02em'}}>
				<MLine f={f} at={0.1}>{a}</MLine>
				<MLine f={f} at={0.18}><L>{b}</L></MLine>
			</Big>
		</div>
	);
};

const KHero: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const words = ['Сайт', 'за', 'вечір'];
	return (
		<Punch f={f} at={1.45}>
			<KHead n={1} f={f} a="Hero-блок" b="за 1 промпт" />
			<Wipe f={f} at={0.35} style={{position: 'absolute', left: X, width: W, top: 640, height: 760, borderRadius: 32, background: T.card, border: `3px solid ${T.line}`, overflow: 'hidden'}}>
				<div style={{height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px', background: T.panel2}}>{['#FF6B5E', '#FFC85E', '#7FD36B'].map((c) => <span key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />)}</div>
				<div style={{padding: '56px 56px'}}>
					{/* заголовок сайту — по словах, 50 мс */}
					<div style={{display: 'flex', flexWrap: 'wrap', gap: '0 22px', fontFamily: F.display, fontWeight: 900, fontSize: 76, lineHeight: 1.05}}>
						{words.map((w, i) => <MLine key={w} f={f} at={0.75 + i * 0.05}><span style={{color: i === 2 ? T.accent : T.text}}>{w}</span></MLine>)}
					</div>
					<Blur f={f} at={1.05} style={{marginTop: 30, fontSize: 38, color: T.dim, lineHeight: 1.4}}>Лендинг, що продає —<br />без дизайнера й верстальника</Blur>
					<Blur f={f} at={1.35} style={{display: 'inline-block', marginTop: 50, padding: '26px 56px', borderRadius: 999, background: T.accent, color: T.onAccent, fontWeight: 800, fontSize: 40}}>Записатися →</Blur>
				</div>
			</Wipe>
		</Punch>
	);
};

const KPalette: React.FC = () => {
	const T = useTheme();
	const f = useF();
	return (
		<Punch f={f} at={1.6}>
			<KHead n={2} f={f} a="Палітра" b="з логотипу" />
			<Blur f={f} at={0.3} style={{position: 'absolute', left: 540 - 110, top: 640, width: 220, height: 220, borderRadius: 60, background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 110, color: T.onAccent}}>D</Blur>
			{/* смуги-кольори з wipe зліва направо, підписи HEX — mask-reveal */}
			{SWATCH.map((c, i) => (
				<div key={c} style={{position: 'absolute', left: X, width: W, top: 940 + i * 96, display: 'flex', alignItems: 'center', gap: 30}}>
					<Wipe f={f} at={0.7 + i * 0.08} style={{flex: 1, height: 76, borderRadius: 20, background: c, border: `2px solid ${T.line}`}}><span /></Wipe>
					<div style={{width: 220, fontFamily: F.mono, fontSize: 36, color: T.dim}}><MLine f={f} at={0.9 + i * 0.08}>{c}</MLine></div>
				</div>
			))}
		</Punch>
	);
};

const KMobile: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const m = kt(f, 1.0, 0.7);
	const w = interpolate(m, [0, 1], [W, 420]);
	return (
		<Punch f={f} at={1.75}>
			<KHead n={3} f={f} a="Мобільна версія" b="без болю" />
			<Blur f={f} at={0.35} style={{position: 'absolute', left: 540 - w / 2, top: 660, width: w, height: interpolate(m, [0, 1], [560, 760]), borderRadius: interpolate(m, [0, 1], [28, 64]), background: T.card, border: `4px solid ${T.accent}`, overflow: 'hidden', padding: 34, boxSizing: 'border-box'}}>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: interpolate(m, [0, 1], [72, 52]), lineHeight: 1.05}}>Сайт<br /><L>за вечір</L></div>
				<div style={{display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 30}}>
					{[0, 1, 2].map((i) => <div key={i} style={{width: `calc(${interpolate(m, [0, 1], [33.3, 100])}% - ${interpolate(m, [0, 1], [12, 0])}px)`, height: 120, borderRadius: 18, background: i === 0 ? `${T.accent}44` : T.panel2}} />)}
				</div>
			</Blur>
			<Blur f={f} at={1.8} style={{position: 'absolute', left: X, width: W, top: 1460, textAlign: 'center', fontFamily: F.mono, fontSize: 34, letterSpacing: 4, color: T.accent}}>375px ✓</Blur>
		</Punch>
	);
};

const KCta: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const slam = kt(f, 0.35, 0.4);
	return (
		<Punch f={f} at={0.35}>
			<AbsoluteFill style={{alignItems: 'center', textAlign: 'center'}}>
				<div style={{marginTop: 340}}><Big size={96}><MLine f={f} at={0}>Напиши</MLine></Big></div>
				<div style={{marginTop: 40, padding: '30px 70px', borderRadius: 40, background: T.accent, transform: `scale(${1.4 - slam * 0.4})`, opacity: slam, boxShadow: `0 40px 100px ${T.accent}55`}}>
					<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 140, color: T.onAccent, letterSpacing: -2}}>{CTA}</span>
				</div>
				<div style={{marginTop: 60, fontFamily: F.body, fontWeight: 800, fontSize: 52, lineHeight: 1.3}}>
					<MLine f={f} at={0.8}>у коментарях — пришлю</MLine>
					<MLine f={f} at={0.88}><L>3 промпти</L> у Direct</MLine>
				</div>
				<Blur f={f} at={1.3} style={{position: 'absolute', top: 1380}}><Wordmark size={84} /></Blur>
			</AbsoluteFill>
		</Punch>
	);
};

const kineticCards: Card[] = [
	{beats: 5, el: (_, a) => <SAt a={a}><KPoster /></SAt>},
	{beats: 7, sfx: 'pop/soft-pop.wav', vol: 0.3, off: 1.45, el: (_, a) => <SAt a={a}><KHero /></SAt>},
	{beats: 9, sfx: 'sparkle/sparkle-touch.mp3', vol: 0.3, off: 1.6, el: (_, a) => <SAt a={a}><KPalette /></SAt>},
	{beats: 7, sfx: 'whoosh/whoosh-fast.mp3', vol: 0.22, off: 1.0, el: (_, a) => <SAt a={a}><KMobile /></SAt>},
	{beats: 10, sfx: 'impact/impact-movie-epic.mp3', vol: 0.3, off: 0.35, el: (_, a) => <SAt a={a}><KCta /></SAt>},
	// петля: останні 2 біти — той самий постер у фінальному стані, кадр N ≈ кадр 0
	{beats: 2, el: () => <KPosterBody f={999} />},
];

// ================= remotion-motion-graphics (haidrrrry) =================
// Правила скіла: один theme-обʼєкт, жодного linear, вхід = opacity+translateY+scale (spring), stagger 3–6 кадрів,
// вихід швидший за вхід (10 кадрів), «дихання» статичних елементів, 5 шарів: меш → асети → графіка → grade → grain+vignette,
// кожен still — Ken Burns. Асети — справжні скріни devguide.com.ua (public/assets/site).
const MG = {
	spring: {smooth: {damping: 200}, snappy: {damping: 20, stiffness: 200}, bouncy: {damping: 10, stiffness: 120}},
	stagger: 4, exit: 10,
} as const;
const mgIn = (f: number, delay: number, cfg: Partial<SpringConfig> = MG.spring.smooth) => sp(f, cfg, delay);
const mgOut = (f: number) => ramp(f, CARD - MG.exit, CARD, 0, 1, Easing.in(Easing.cubic));
const Entrance: React.FC<{f: number; delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, delay = 0, children, style}) => {
	const p = mgIn(f, delay);
	return <div style={{opacity: p, transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`, ...style}}>{children}</div>;
};
const breathe = (f: number, amp = 6, per = 50) => Math.sin(f / per) * amp;
/** Шари 1 і 4–5: меш позаду, grade + grain + vignette зверху. */
const MgLayers: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => {
	const T = useTheme();
	const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', width: 1200, height: 1200, borderRadius: '50%', top: -450, left: -300 + Math.sin(f / 55) * 50, filter: 'blur(50px)', background: `radial-gradient(circle, ${T.accent}2A, transparent 62%)`}} />
			<div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', bottom: -400, right: -250 - Math.cos(f / 70) * 40, filter: 'blur(70px)', background: `radial-gradient(circle, ${T.glow2}22, transparent 65%)`}} />
			{children}
			<AbsoluteFill style={{backgroundColor: T.accent, mixBlendMode: 'soft-light', opacity: 0.12}} />
			<AbsoluteFill style={{backgroundImage: noise, backgroundSize: '220px', backgroundPosition: `${(f * 7) % 220}px ${(f * 13) % 220}px`, opacity: 0.06, mixBlendMode: 'overlay'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 56%, rgba(0,0,0,0.35) 100%)'}} />
		</AbsoluteFill>
	);
};
const KenBurns: React.FC<{f: number; src: string; zoomTo?: number; dur?: number}> = ({f, src, zoomTo = 1.1, dur = CARD}) => (
	<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left top', transform: `scale(${interpolate(f, [0, dur], [1, zoomTo], {...clamp, easing: Easing.inOut(Easing.cubic)})}) translateX(${interpolate(f, [0, dur], [0, -25], clamp)}px)`, transformOrigin: '0% 0%'}} />
);
const MgHead: React.FC<{n: number; f: number; children: React.ReactNode}> = ({n, f, children}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: X, width: W, top: 220, textAlign: 'center'}}>
			<Entrance f={f} delay={0}><div style={{display: 'inline-flex', width: 120, height: 120, borderRadius: 60, background: T.accent, color: T.onAccent, alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 64, boxShadow: `0 0 60px ${T.accent}66`, transform: `translateY(${breathe(f, 4)}px)`}}>{n}</div></Entrance>
			<Entrance f={f} delay={MG.stagger} style={{marginTop: 34}}><Big size={70}>{children}</Big></Entrance>
		</div>
	);
};
const shot: React.CSSProperties = {borderRadius: 32, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)'};

const MgPosterBody: React.FC<{f: number}> = ({f}) => {
	const T = useTheme();
	const rays = 12, ray = (i: number) => sp(f, MG.spring.snappy, 6 + i * 1.2);
	return (
		<MgLayers f={f}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `0 ${X}px`}}>
				{/* spark-марка: 12 променів зі stagger */}
				<div style={{position: 'relative', width: 200, height: 200, marginBottom: 50, transform: `rotate(${interpolate(sp(f, MG.spring.smooth), [0, 1], [-120, 0]) + f * 0.3}deg)`, filter: `drop-shadow(0 0 40px ${T.accent})`}}>
					{Array.from({length: rays}).map((_, i) => <div key={i} style={{position: 'absolute', left: '50%', top: '50%', width: 16, height: 92 * ray(i), background: T.accent, borderRadius: 16, transformOrigin: '50% 0%', transform: `translateX(-50%) rotate(${(360 / rays) * i}deg) translateY(14px)`}} />)}
				</div>
				<Entrance f={f} delay={10}><Big size={128} style={{lineHeight: 1.05}}>3 промпти</Big></Entrance>
				<Entrance f={f} delay={14}><Big size={128} style={{lineHeight: 1.05}}><L>для сайту</L></Big></Entrance>
				<Entrance f={f} delay={22} style={{marginTop: 46, fontFamily: F.body, fontWeight: 700, fontSize: 48, color: T.dim}}>Claude зробить решту</Entrance>
			</AbsoluteFill>
		</MgLayers>
	);
};
const MgPoster: React.FC = () => <MgPosterBody f={useF()} />;

const MgHero: React.FC = () => {
	const f = useF();
	const o = 1 - mgOut(f);
	return (
		<MgLayers f={f}>
			<AbsoluteFill style={{opacity: o, transform: `scale(${1 - mgOut(f) * 0.04})`}}>
				<MgHead n={1} f={f}>{ITEMS[0].label}</MgHead>
				<Entrance f={f} delay={10} style={{position: 'absolute', left: X, width: W, top: 660, height: 760, ...shot, transform: undefined}}>
					<div style={{width: W, height: 760, transform: `translateY(${breathe(f, 5, 60)}px)`}}><KenBurns f={f} src="assets/site/home-desktop.png" zoomTo={1.12} /></div>
				</Entrance>
			</AbsoluteFill>
		</MgLayers>
	);
};

const MgPalette: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const o = 1 - mgOut(f);
	return (
		<MgLayers f={f}>
			<AbsoluteFill style={{opacity: o}}>
				<MgHead n={2} f={f}>{ITEMS[1].label}</MgHead>
				<Entrance f={f} delay={8} style={{position: 'absolute', left: 540 - 110, top: 700}}>
					<div style={{width: 220, height: 220, borderRadius: 60, background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 110, color: T.onAccent, transform: `rotate(${breathe(f, 3, 40)}deg)`, boxShadow: `0 0 90px ${T.accent}55`}}>D</div>
				</Entrance>
				{SWATCH.map((c, i) => (
					<Entrance key={c} f={f} delay={20 + i * MG.stagger} style={{position: 'absolute', left: 138 + i * 168, top: 1060}}>
						<div style={{width: 132, height: 220, borderRadius: 26, background: c, border: `2px solid ${T.line}`, transform: `translateY(${breathe(f + i * 9, 6, 30)}px)`, boxShadow: `0 30px 60px -20px ${c}88`}} />
						<div style={{marginTop: 18, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: T.dim}}>{c}</div>
					</Entrance>
				))}
			</AbsoluteFill>
		</MgLayers>
	);
};

const MgMobile: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const sw = ramp(f, 40, 62, 0, 1, Easing.inOut(Easing.cubic));
	return (
		<MgLayers f={f}>
			<AbsoluteFill style={{opacity: 1 - mgOut(f)}}>
				<MgHead n={3} f={f}>{ITEMS[2].label}</MgHead>
				{/* десктоп-скрін відʼїжджає й гасне, телефон-скрін виїжджає — параллакс двох шарів */}
				<Entrance f={f} delay={8} style={{position: 'absolute', left: X, width: W, top: 700, height: 520, ...shot, opacity: 1 - sw * 0.75, transform: `translateX(${-sw * 200}px) scale(${1 - sw * 0.15})`}}>
					<KenBurns f={f} src="assets/site/home-desktop.png" zoomTo={1.05} />
				</Entrance>
				<div style={{position: 'absolute', left: 540 - 190 + (1 - sw) * 500, top: 640, width: 380, height: 800, ...shot, borderRadius: 54, border: `4px solid ${T.accent}`, opacity: sw, transform: `translateY(${breathe(f, 6, 45)}px)`}}>
					<KenBurns f={f} src="assets/site/home-mobile-clean.png" zoomTo={1.08} />
				</div>
			</AbsoluteFill>
		</MgLayers>
	);
};

const MgCta: React.FC = () => {
	const T = useTheme();
	const f = useF();
	const pill = sp(f, MG.spring.bouncy, 8);
	return (
		<MgLayers f={f}>
			<AbsoluteFill style={{alignItems: 'center', textAlign: 'center'}}>
				<Entrance f={f} style={{marginTop: 340}}><Big size={96}>Напиши</Big></Entrance>
				<div style={{marginTop: 40, padding: '30px 70px', borderRadius: 40, background: T.accent, opacity: Math.min(1, pill), transform: `translateY(${interpolate(pill, [0, 1], [40, 0])}px) scale(${interpolate(pill, [0, 1], [0.7, 1]) + breathe(f, 0.015, 12)})`, boxShadow: `0 40px 100px ${T.accent}55`}}>
					<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 140, color: T.onAccent, letterSpacing: -2}}>{CTA}</span>
				</div>
				<Entrance f={f} delay={24} style={{marginTop: 60, fontFamily: F.body, fontWeight: 800, fontSize: 52, lineHeight: 1.3}}>у коментарях — пришлю<br /><L>3 промпти</L> у Direct</Entrance>
				<Entrance f={f} delay={36} style={{position: 'absolute', top: 1380}}><Wordmark size={84} /></Entrance>
			</AbsoluteFill>
		</MgLayers>
	);
};

const mgCards: Card[] = [
	{beats: 6, el: (_, a) => <SAt a={a}><MgPoster /></SAt>},
	{beats: 8, sfx: 'whoosh/whoosh-fast.mp3', vol: 0.2, off: 0.3, el: (_, a) => <SAt a={a}><MgHero /></SAt>},
	{beats: 8, sfx: 'sparkle/sparkle-touch.mp3', vol: 0.3, off: 0.7, el: (_, a) => <SAt a={a}><MgPalette /></SAt>},
	{beats: 8, sfx: 'whoosh/whoosh-fast.mp3', vol: 0.22, off: 1.35, el: (_, a) => <SAt a={a}><MgMobile /></SAt>},
	{beats: 10, sfx: 'impact/impact-movie-epic.mp3', vol: 0.3, off: 0.3, el: (_, a) => <SAt a={a}><MgCta /></SAt>},
];

export const SKILL_TESTS: {id: string; C: React.FC; frames: number}[] = [
	{id: 'MotionGfx', C: () => <BeatVideo theme="brand" track={TRACK} cards={mgCards} />, frames: beatFrames(TRACK, mgCards)},
	{id: 'Kinetic', C: () => <BeatVideo theme="brand" track={TRACK} cards={kineticCards} />, frames: beatFrames(TRACK, kineticCards)},
	{id: 'Spring', C: () => <BeatVideo theme="brand" track={TRACK} cards={springCards} />, frames: beatFrames(TRACK, springCards)},
	{id: 'Gsap', C: () => <BeatVideo theme="brand" track={TRACK} cards={gsapCards} />, frames: beatFrames(TRACK, gsapCards)},
];
