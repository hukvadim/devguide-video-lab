import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../system/kit';
import {clamp01, frac, Grid, Icon, LEARN_BANNER, TAU, Tile} from './LearnBanner';

// Банер «Опануй AI крок за кроком» з Вадимом: 1920x640, 6 с, без звуку, луп.
// vadim.webm: зелений фон прибраний маскою RVM (скіл devguide-reel), стіл теж зник — руки лягають на скляну смугу.
export const AI_BANNER = LEARN_BANNER;
const N = AI_BANNER;
const W = 1920, H = 640, CELL = 64;
const LIME = '195,255,85', SKY = '143,176,255';
const rgba = (rgb: string, a: number) => `rgba(${rgb},${a})`;

// капелюх у джерелі з y≈230, руки ≈940..980 → верх капелюха ~30 px від краю, руки на смузі-столі
const VS = 0.79, VX = 1275, VY = 30 - 230 * VS;
// file/sw/sh/s/y — інше відео-джерело (вітальний банер: горизонтальне 1280x720)
// seamless: основне відео стартує з кадру XF, а в останні XF кадрів поверх наростає джерело з кадру 0 —
// на стику луп продовжується з того самого кадру XF, без відкату (потрібно, щоб поза в кінці ≈ поза на початку)
const XF = 10;
const Vadim: React.FC<{x?: number; y?: number; s?: number; file?: string; sw?: number; sh?: number; seamless?: boolean}> = ({x = VX, y = VY, s = VS, file = 'vadim.webm', sw = 720, sh = 1280, seamless = false}) => {
	const f = useCurrentFrame();
	const N = useVideoConfig().durationInFrames;
	const box: React.CSSProperties = {position: 'absolute', left: x, top: y, width: sw * s, height: sh * s};
	const src = staticFile(`ideas/ai-banner/${file}`);
	return (
		<>
			<div style={box}><OffthreadVideo src={src} transparent muted trimBefore={seamless ? XF : 0} style={{width: '100%', height: '100%'}} /></div>
			{/* луп: останні 10 кадрів перетікають у кадр 0 */}
			<Sequence from={N - XF} layout="none">
				<div style={{...box, opacity: interpolate(f, [N - XF, N - 1], [0, 1])}}><OffthreadVideo src={src} transparent muted style={{width: '100%', height: '100%'}} /></div>
			</Sequence>
		</>
	);
};

// front: матове скло ПЕРЕД руками (blur + затемнення), щоб низ кадру не різав кисті
const Desk: React.FC<{rgb: string; x?: number; w?: number; front?: boolean; top?: number}> = ({rgb, x = 1150, w = W, front = false, top = front ? 560 : 606}) => (
	<div style={{position: 'absolute', left: x, top, width: w - x, height: H - top, borderTop: `2px solid ${rgba(rgb, 0.55)}`,
		background: front ? `linear-gradient(180deg, rgba(14,36,110,0.35), rgba(8,18,54,0.85))` : `linear-gradient(180deg, ${rgba(rgb, 0.22)}, ${rgba(rgb, 0.04)})`,
		backdropFilter: front ? 'blur(14px)' : undefined, WebkitBackdropFilter: front ? 'blur(14px)' : undefined, boxShadow: `0 -6px 30px ${rgba(rgb, 0.25)}`, maskImage: 'linear-gradient(90deg, transparent, black 25%)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 25%)'}} />
);

// k — масштаб тексту (1 для 3:1, 0.8 для 2:1), left — відступ зліва
type Words = {l1?: string; l2?: string; sub?: string; s1?: number; s2?: number};
const Title: React.FC<{accent: string; glow: number; bar?: React.ReactNode; k?: number; left?: number; top?: number} & Words> = ({accent, glow, bar, k = 1, left = 104, top, l1 = 'Опануй AI', l2 = 'крок за кроком', sub = 'з Вадимом Гуком', s1 = 124, s2 = 80}) => (
	<div style={{position: 'absolute', left, top: top ?? 0, height: top == null ? H : undefined, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
		<div style={{fontFamily: F.display, fontWeight: 900, fontSize: s1 * k, lineHeight: 1.05, letterSpacing: -3, color: '#FFFFFF', textShadow: '0 6px 30px rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>{l1}</div>
		<div style={{fontFamily: F.display, fontWeight: 800, fontSize: s2 * k, lineHeight: 1.2, letterSpacing: -1.5, color: accent, marginTop: 6, textShadow: `0 0 ${16 + 20 * glow}px ${accent}55`, whiteSpace: 'nowrap'}}>{l2}</div>
		{bar ?? <div style={{width: 96, height: 7, borderRadius: 4, background: accent, marginTop: 34}} />}
		<div style={{fontFamily: F.body, fontWeight: 600, fontSize: 52 * Math.max(k, 0.9), color: '#E6ECF5', marginTop: 24}}>{sub}</div>
	</div>
);

/** Квадрати, що спливають угору (періодично — луп без стику). */
const Squares: React.FC<{rgb: string; count: number; x0: number; x1: number; seed: string}> = ({rgb, count, x0, x1, seed}) => {
	const f = useCurrentFrame();
	const N = useVideoConfig().durationInFrames;
	return (
		<>
			{Array.from({length: count}, (_, i) => {
				const p = frac(random(`${seed}p${i}`) + (f / N) * (random(`${seed}v${i}`) < 0.5 ? 1 : 2));
				const s = 10 + random(`${seed}s${i}`) * 26;
				const x = x0 + random(`${seed}x${i}`) * (x1 - x0) + Math.sin(p * TAU + i) * 18;
				const y = H + 40 - p * (H + 120);
				const filled = random(`${seed}f${i}`) < 0.35;
				return (
					<div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s * 0.22, transform: `rotate(${p * 180 + i * 20}deg)`, opacity: Math.sin(p * Math.PI) * 0.9,
						border: `2px solid ${rgba(rgb, 0.8)}`, background: filled ? rgba(rgb, 0.45) : 'transparent', boxShadow: `0 0 ${s * 0.8}px ${rgba(rgb, 0.45)}`}} />
				);
			})}
		</>
	);
};

const CHIPS: {x: number; y: number; s: number; icon: Icon; k: number}[] = [
	{x: 1250, y: 150, s: 120, icon: 'star', k: 0},
	{x: 1830, y: 120, s: 112, icon: 'chat', k: 2},
	{x: 1830, y: 420, s: 116, icon: 'code', k: 4},
];
const Chips: React.FC<{rgb: string}> = ({rgb}) => {
	const ph = (useCurrentFrame() / N) * TAU;
	return <>{CHIPS.map((c) => <Tile key={c.icon} rgb={rgb} x={c.x} y={c.y + Math.sin(ph + c.k) * 12} size={c.s} icon={c.icon} rot={Math.sin(ph + c.k + 1) * 6} rx={8} ry={-8} g={0.5 + 0.5 * Math.sin(ph + c.k)} />)}</>;
};

const BLUE_BG = 'linear-gradient(100deg, #081236 0%, #0F2A80 50%, #1E4FD8 100%)';

/* ── 1. Blue Grid: як GPT-референс, хвиля клітинок + скляні AI-чіпи ── */
export const AiBannerBlue: React.FC = () => {
	const f = useCurrentFrame();
	const g = 0.5 + 0.5 * Math.sin((f / N) * TAU);
	const cells: React.ReactNode[] = [];
	for (let r = 0; r < H / CELL; r++)
		for (let c = 0; c < W / CELL; c++) {
			const t = frac((c - r * 0.7) / 40 - f / N);
			const d = Math.min(t, 1 - t) * 40;
			const v = Math.exp(-(d * d) / 4) * (0.6 + 0.4 * random(`b${c}-${r}`));
			if (v > 0.04) cells.push(<div key={`${c}-${r}`} style={{position: 'absolute', left: c * CELL, top: r * CELL, width: CELL, height: CELL, background: rgba(SKY, 0.1 * v), boxShadow: `inset 0 0 0 1px ${rgba(SKY, 0.3 * v)}`}} />);
		}
	return (
		<AbsoluteFill style={{background: BLUE_BG, overflow: 'hidden'}}>
			<Grid alpha={0.07} />
			{cells}
			<AbsoluteFill style={{background: `radial-gradient(520px 460px at 1560px 330px, ${rgba(SKY, 0.32 + 0.1 * g)}, transparent 70%)`}} />
			<Squares rgb={SKY} count={16} x0={1150} x1={1900} seed="b" />
			<Desk rgb={SKY} />
			<Vadim />
			<Chips rgb={SKY} />
			<Title accent="#8FB0FF" glow={g} />
		</AbsoluteFill>
	);
};

/* ── 2. Dark Lime: бренд DevGuide, лаймове сяйво, орбіта за спиною, іскри ── */
export const AiBannerLime: React.FC = () => {
	const f = useCurrentFrame();
	const g = 0.5 + 0.5 * Math.sin((f / N) * TAU * 2);
	const cx = 1560, cy = 300;
	const sparks = Array.from({length: 40}, (_, i) => {
		const a = random(`a${i}`) * TAU, p = frac(random(`s${i}`) + f / N);
		const r = 60 + p * (300 + random(`r${i}`) * 220);
		const x = cx + Math.cos(a) * r * 1.3, y = cy + Math.sin(a) * r * 0.75, s = 2 + random(`z${i}`) * 4;
		return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: C.lime, opacity: Math.sin(p * Math.PI) * clamp01((x - 1150) / 150), boxShadow: `0 0 ${s * 3}px ${C.lime}`}} />;
	});
	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			<Grid />
			<AbsoluteFill style={{background: `repeating-conic-gradient(from ${(f / N) * 30}deg at ${cx}px ${cy}px, ${rgba(LIME, 0.07)} 0deg, transparent 6deg, transparent 30deg)`, maskImage: `radial-gradient(600px 420px at ${cx}px ${cy}px, black 10%, transparent 75%)`, WebkitMaskImage: `radial-gradient(600px 420px at ${cx}px ${cy}px, black 10%, transparent 75%)`}} />
			<AbsoluteFill style={{background: `radial-gradient(${380 + 40 * g}px ${320 + 30 * g}px at ${cx}px ${cy}px, ${rgba(LIME, 0.3)}, transparent 72%)`}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<ellipse cx={cx} cy={cy + 40} rx={330} ry={120} fill="none" stroke={rgba(LIME, 0.35)} strokeWidth={2} strokeDasharray="10 14" strokeDashoffset={-(f / N) * 96} />
				<ellipse cx={cx} cy={cy + 40} rx={420} ry={170} fill="none" stroke={rgba(LIME, 0.12)} strokeWidth={1.5} />
			</svg>
			{sparks}
			<Squares rgb={LIME} count={10} x0={1150} x1={1900} seed="l" />
			<Desk rgb={LIME} />
			<Vadim />
			<Chips rgb={LIME} />
			<Title accent={C.lime} glow={g} />
		</AbsoluteFill>
	);
};

/** Шкала з 3 кроків під заголовком: заповнюється по черзі за цикл. */
const StepBar: React.FC = () => {
	const f = useCurrentFrame();
	const N = useVideoConfig().durationInFrames;
	const step = Math.floor((f / N) * 3);
	const local = frac((f / N) * 3);
	return (
		<div style={{display: 'flex', gap: 14, marginTop: 34}}>
			{[0, 1, 2].map((i) => {
				const fill = i < step ? 1 : i === step ? clamp01(local * 1.6) : 0;
				return (
					<div key={i} style={{width: 120, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
						<div style={{width: `${(i === 0 ? Math.max(fill, 1) : fill) * 100}%`, height: '100%', background: C.lime, boxShadow: `0 0 14px ${C.lime}`}} />
					</div>
				);
			})}
		</div>
	);
};

/* ── 3. Blue + Lime: синій фон, лаймові квадрати-«кроки» летять угору, крокова шкала під заголовком ── */
export const AiBannerSteps: React.FC = () => {
	const f = useCurrentFrame();
	// 2:1 (1280x640): Вадим праворуч трохи обрізаний краєм, текст менший; 3:1 — як було
	const wide = useVideoConfig().width > 1500;
	const w = wide ? W : 1280, vx = wide ? VX : 760, k = wide ? 1 : 0.8;
	const cx = vx + 285;
	const g = 0.5 + 0.5 * Math.sin((f / N) * TAU);
	const bar = <StepBar />;
	return (
		<AbsoluteFill style={{background: BLUE_BG, overflow: 'hidden'}}>
			<Grid alpha={0.08} />
			<AbsoluteFill style={{background: `radial-gradient(520px 460px at ${cx}px 330px, ${rgba(SKY, 0.35)}, transparent 70%)`}} />
			<Squares rgb={LIME} count={26} x0={vx - 150} x1={w - 20} seed="s" />
			<Squares rgb={LIME} count={10} x0={0} x1={vx - 170} seed="t" />
			<Vadim x={vx} />
			<Desk rgb={LIME} x={vx - 125} w={w} front />
			<Tile rgb={LIME} x={wide ? 1250 : 845} y={(wide ? 150 : 105) + Math.sin((f / N) * TAU) * 12} size={120 * (wide ? 1 : 0.85)} icon="star" rot={-6} rx={8} ry={-8} g={g} />
			<Tile rgb={LIME} x={wide ? 1830 : 1215} y={(wide ? 130 : 330) + Math.sin((f / N) * TAU + 2) * 12} size={112 * (wide ? 1 : 0.85)} icon="chat" rot={6} rx={8} ry={-8} g={1 - g} />
			<Title accent={C.lime} glow={g} bar={bar} k={k} left={wide ? 104 : 64} />
		</AbsoluteFill>
	);
};

/* ── Вітальний банер бота (1280x640): стиль варіанту 3, горизонтальне відео з помахом, 3 тексти ── */
// у джерелі капелюх з y≈56 → s=1.1: капелюх ~30 px від краю; ноутбук у масці закріплений прямокутником (відбивав зелений)
const WS = 1.1, WX = 1060 - 640 * WS, WY = 30 - 56 * WS;
// відео 6.0 с, останні 0.5 с відкинуто (смикання) → 5.5 с = 165 кадрів, мінус XF на стик
export const WELCOME = 165 - XF;
export const WelcomeBanner: React.FC<Words> = (words) => {
	const f = useCurrentFrame();
	const N = WELCOME;
	const g = 0.5 + 0.5 * Math.sin((f / N) * TAU);
	const w = 1280, cx = 1060;
	return (
		<AbsoluteFill style={{background: BLUE_BG, overflow: 'hidden'}}>
			<Grid alpha={0.08} />
			<AbsoluteFill style={{background: `radial-gradient(480px 420px at ${cx}px 300px, ${rgba(SKY, 0.35)}, transparent 70%)`}} />
			<Squares rgb={LIME} count={22} x0={700} x1={w - 20} seed="w" />
			<Squares rgb={LIME} count={8} x0={0} x1={620} seed="v" />
			<Vadim file="vadim-wave.webm" sw={1280} sh={720} s={WS} x={WX} y={WY} seamless />
			<Tile rgb={LIME} x={810} y={105 + Math.sin((f / N) * TAU) * 12} size={100} icon="star" rot={-6} rx={8} ry={-8} g={g} />
			<Tile rgb={LIME} x={1222} y={300 + Math.sin((f / N) * TAU + 2) * 12} size={96} icon="chat" rot={6} rx={8} ry={-8} g={1 - g} />
			<Title accent={C.lime} glow={g} k={1} left={64} s1={words.s1 ?? 88} s2={words.s2 ?? 60} {...words} />
		</AbsoluteFill>
	);
};

/* ── «Опануй AI» на темному фоні, Вадим за столом (1280x640) ── */
// джерело 1280x720: капелюх з y≈40, ноутбук x≈165..600, стіл обрізаний лівим краєм кадру (x=0).
// Луп: кадр 134 (5.58 с, після жесту кулаком) найближчий до кадру 0 → 167 кадрів @30 мінус XF на стик.
export const DESK_BANNER = 167 - XF;
const DS = 0.97, DX = 155, DY = 25 - 40 * DS;
export const DeskBanner: React.FC = () => {
	const f = useCurrentFrame();
	const N = DESK_BANNER;
	const g = 0.5 + 0.5 * Math.sin((f / N) * TAU);
	const cx = DX + 820 * DS;
	const v = <Vadim file="vadim-desk.webm" sw={1280} sh={720} s={DS} x={DX} y={DY} seamless />;
	// обрізаний край столу зліва: розмита копія розчиняється, різка копія проявляється до ноутбука (x≈315)
	const sharp = 'linear-gradient(90deg, transparent 170px, black 300px)';
	const soft = 'linear-gradient(90deg, transparent 120px, black 190px, black 250px, transparent 320px)';
	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			<Grid />
			<AbsoluteFill style={{background: `radial-gradient(520px 420px at ${cx}px 260px, ${rgba(LIME, 0.22 + 0.06 * g)}, transparent 70%)`}} />
			<AbsoluteFill style={{background: `radial-gradient(380px 300px at 1280px 640px, ${rgba(LIME, 0.14)}, transparent 70%)`}} />
			<Squares rgb={LIME} count={20} x0={720} x1={1260} seed="d" />
			<Squares rgb={LIME} count={8} x0={0} x1={640} seed="e" />
			<AbsoluteFill style={{filter: 'blur(10px)', maskImage: soft, WebkitMaskImage: soft}}>{v}</AbsoluteFill>
			<AbsoluteFill style={{maskImage: sharp, WebkitMaskImage: sharp}}>{v}</AbsoluteFill>
			<Tile rgb={LIME} x={1185} y={95 + Math.sin((f / N) * TAU) * 10} size={100} icon="star" rot={6} rx={8} ry={-8} g={g} />
			<Tile rgb={LIME} x={1222} y={360 + Math.sin((f / N) * TAU + 2) * 10} size={92} icon="chat" rot={-6} rx={8} ry={-8} g={1 - g} />
			<Title accent={C.lime} glow={g} k={0.8} left={64} top={60} bar={<StepBar />} />
		</AbsoluteFill>
	);
};
