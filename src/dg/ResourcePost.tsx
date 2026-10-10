import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Bgm, C, F, Sfx, ramp, easeInOut} from './kit';

// Pinterest-style "5 resources" post: 1080x1920 reel (25 s) + 1080x1350 static card.
// All illustrations are React/CSS/SVG, frame-driven, no external images.

const BG = '#171B20';
const CARD = '#20262D';
const CARD2 = '#2B333C';
const LINE = '#FFFFFF1A';
const X0 = 84; // safe area left
const W = 856; // safe width (x=84..940)

export const POST_DURATION = 750;
const CARD_LEN = 90;
const CARD_START = 90;
const RECAP_START = 540;
const CTA_START = 600;

type Res = {n: string; name: string; verb: string; Ill: React.FC<{f: number}>};

const Backdrop: React.FC = () => {
	const f = useCurrentFrame();
	const gx = 300 + noise2D('px', f / 160, 0) * 90;
	const gy = 460 + noise2D('py', 0, f / 160) * 90;
	return (
		<AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: `radial-gradient(900px 900px at ${gx}px ${gy}px, #C3FF5520, transparent 70%)`}} />
			<AbsoluteFill style={{background: 'radial-gradient(1000px 800px at 940px 1750px, #C3FF5512, transparent 70%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 60%, #00000080 100%)'}} />
		</AbsoluteFill>
	);
};

// ---------- illustrations (box 760x830) ----------
const Box: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: 760, height: 830}}>{children}</div>;

const Figma: React.FC<{f: number}> = ({f}) => {
	// scattered start offsets (seeded by hand, deterministic)
	const blocks = [
		{x: 0, y: 0, w: 640, h: 90, fill: CARD2, dx: -260, dy: -120, r: -12},
		{x: 0, y: 110, w: 640, h: 300, fill: C.lime, dx: 120, dy: 200, r: 8},
		{x: 0, y: 430, w: 200, h: 170, fill: '#8EDFFF', dx: -200, dy: 160, r: -16},
		{x: 220, y: 430, w: 200, h: 170, fill: CARD2, dx: 60, dy: 300, r: 10},
		{x: 440, y: 430, w: 200, h: 170, fill: '#FF6B5E', dx: 260, dy: 140, r: 14},
		{x: 0, y: 620, w: 640, h: 120, fill: CARD2, dx: 0, dy: 340, r: -6},
	];
	const sel = ramp(f, 52, 64);
	return (
		<Box>
			<div style={{position: 'absolute', left: 60, top: 45, width: 640, height: 740}}>
				{blocks.map((b, i) => {
					const t = ramp(f, 4 + i * 6, 34 + i * 6);
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: b.x,
								top: b.y,
								width: b.w,
								height: b.h,
								borderRadius: 28,
								background: b.fill,
								opacity: Math.min(1, t * 3),
								transform: `translate(${b.dx * (1 - t)}px, ${b.dy * (1 - t)}px) rotate(${b.r * (1 - t)}deg)`,
							}}
						/>
					);
				})}
				{/* hero text bars */}
				{[{w: 360, h: 34, y: 150}, {w: 250, h: 34, y: 206}, {w: 160, h: 56, y: 292}].map((l, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 36,
							top: l.y,
							height: l.h,
							width: l.w * ramp(f, 40 + i * 4, 56 + i * 4),
							borderRadius: 999,
							background: i === 2 ? '#171B20' : '#17201088',
						}}
					/>
				))}
				{/* selection frame + handles */}
				<div style={{position: 'absolute', left: 0, top: 110, width: 640, height: 300, border: '4px solid #fff', borderRadius: 28, opacity: sel}} />
				{[[0, 110], [640, 110], [0, 410], [640, 410]].map(([x, y], i) => (
					<div key={i} style={{position: 'absolute', left: x - 14, top: y - 14, width: 28, height: 28, background: '#fff', border: `4px solid ${C.lime}`, borderRadius: 8, opacity: sel}} />
				))}
				{/* cursor */}
				<svg width="70" height="70" viewBox="0 0 24 24" style={{position: 'absolute', left: 560 + (1 - sel) * 120, top: 360 + (1 - sel) * 200, opacity: ramp(f, 46, 54)}}>
					<path d="M4 3l16 7-7 2-2 7z" fill="#fff" stroke="#171B20" strokeWidth="1.4" strokeLinejoin="round" />
				</svg>
			</div>
		</Box>
	);
};

const FontsIll: React.FC<{f: number}> = ({f}) => {
	const rows: {font: string; weight: number; style?: string; size: number; ls?: number}[] = [
		{font: 'Unbounded, sans-serif', weight: 900, size: 104},
		{font: 'Georgia, "Times New Roman", serif', weight: 400, style: 'italic', size: 124},
		{font: 'Inter, sans-serif', weight: 800, size: 124, ls: -2},
		{font: "'JetBrains Mono', monospace", weight: 500, size: 112},
	];
	const pick = ramp(f, 50, 62);
	return (
		<Box>
			{rows.map((r, i) => {
				const t = ramp(f, 4 + i * 7, 26 + i * 7);
				const chosen = i === 0;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 0,
							top: 40 + i * 192,
							width: 760,
							height: 168,
							borderRadius: 40,
							background: CARD2,
							border: `4px solid ${chosen && pick > 0 ? C.lime : 'transparent'}`,
							display: 'flex',
							alignItems: 'center',
							padding: '0 48px',
							opacity: t,
							transform: `translateX(${(1 - t) * 90}px)`,
							color: C.text,
							fontFamily: r.font,
							fontWeight: r.weight,
							fontStyle: r.style,
							fontSize: r.size,
							letterSpacing: r.ls,
							whiteSpace: 'nowrap',
						}}
					>
						Привіт
						{chosen ? (
							<div
								style={{
									position: 'absolute',
									right: 36,
									width: 72,
									height: 72,
									borderRadius: 36,
									background: C.lime,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transform: `scale(${pick})`,
								}}
							>
								<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#171B20" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
									<path d="M5 12.5l4.5 4.5L19 7.5" />
								</svg>
							</div>
						) : null}
					</div>
				);
			})}
		</Box>
	);
};

const Coolors: React.FC<{f: number}> = ({f}) => {
	const cols = [C.lime, '#5CE1B3', '#8EDFFF', '#A78BFA', '#FF6B5E'];
	const sweep = ramp(f, 40, 70, -200, 900, easeInOut);
	const pick = ramp(f, 54, 66);
	return (
		<Box>
			<div style={{position: 'absolute', left: 5, top: 60, width: 750, height: 710, display: 'flex', gap: 25, overflow: 'hidden', borderRadius: 40}}>
				{cols.map((c, i) => {
					const t = ramp(f, 4 + i * 6, 30 + i * 6);
					return (
						<div key={i} style={{position: 'relative', width: 130, height: '100%', background: c, borderRadius: 36, transformOrigin: '50% 100%', transform: `scaleY(${t})`}}>
							{i === 2 ? (
								<div
									style={{
										position: 'absolute',
										left: 29,
										bottom: 40,
										width: 72,
										height: 72,
										borderRadius: 36,
										border: '6px solid #171B20',
										background: '#ffffff44',
										transform: `scale(${pick})`,
									}}
								/>
							) : null}
						</div>
					);
				})}
				<div style={{position: 'absolute', top: 0, bottom: 0, left: sweep, width: 120, background: 'linear-gradient(90deg, transparent, #ffffff55, transparent)', transform: 'skewX(-18deg)'}} />
			</div>
		</Box>
	);
};

const ICONS: {paths: string[]; bars: [number, number]}[] = [
	{paths: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M21 21l-4.3-4.3'], bars: [300, 200]},
	{paths: ['M4 6h16', 'M4 12h16', 'M4 18h16'], bars: [240, 320]},
	{paths: ['M5 12h14', 'M12 5l7 7-7 7'], bars: [340, 160]},
];
const Lucide: React.FC<{f: number}> = ({f}) => (
	<Box>
		{ICONS.map((ic, i) => {
			const t = ramp(f, 4 + i * 8, 22 + i * 8);
			const draw = ramp(f, 14 + i * 10, 40 + i * 10);
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: 0,
						top: 30 + i * 270,
						width: 760,
						height: 240,
						borderRadius: 44,
						background: CARD2,
						display: 'flex',
						alignItems: 'center',
						gap: 44,
						padding: '0 28px',
						opacity: t,
						transform: `translateY(${(1 - t) * 50}px)`,
					}}
				>
					<div
						style={{
							width: 184,
							height: 184,
							borderRadius: 32,
							background: '#171B20',
							backgroundImage: 'linear-gradient(#ffffff10 2px, transparent 2px), linear-gradient(90deg, #ffffff10 2px, transparent 2px)',
							backgroundSize: '23px 23px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							{ic.paths.map((d, k) => (
								<path key={k} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
							))}
						</svg>
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
						<div style={{height: 34, width: ic.bars[0] * t, borderRadius: 17, background: C.text, opacity: 0.85}} />
						<div style={{height: 34, width: ic.bars[1] * t, borderRadius: 17, background: '#FFFFFF33'}} />
					</div>
				</div>
			);
		})}
	</Box>
);

const Squoosh: React.FC<{f: number}> = ({f}) => {
	const sq = ramp(f, 22, 56, 1, 0.56, easeInOut);
	const arrows = ramp(f, 18, 30) * (1 - ramp(f, 56, 66));
	const fill = ramp(f, 22, 56, 1, 0.46, easeInOut);
	const enter = ramp(f, 2, 18);
	return (
		<Box>
			<div style={{position: 'absolute', left: 60, top: 80, width: 640, height: 500, opacity: enter}}>
				{/* ghost of original size */}
				<div style={{position: 'absolute', inset: 0, borderRadius: 40, border: '4px dashed #FFFFFF40'}} />
				<div style={{position: 'absolute', inset: 0, transform: `scale(${sq})`, transformOrigin: '50% 50%'}}>
					<svg width="640" height="500" viewBox="0 0 640 500" style={{borderRadius: 40, overflow: 'hidden', display: 'block'}}>
						<defs>
							<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0" stopColor="#8EDFFF" />
								<stop offset="1" stopColor="#E9FBFF" />
							</linearGradient>
						</defs>
						<rect width="640" height="500" fill="url(#sky)" />
						<circle cx="480" cy="140" r="64" fill={C.lime} />
						<path d="M0 500V330l150-130 130 120 110-90 250 160v110z" fill="#2B333C" />
						<path d="M0 500V400l190-90 170 110 150-70 130 60v90z" fill="#171B20" />
					</svg>
				</div>
				{/* inward arrows */}
				{[[-16, -16, 0], [656, -16, 90], [656, 516, 180], [-16, 516, 270]].map(([x, y, r], i) => (
					<svg key={i} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{position: 'absolute', left: x - 32 + 32 * (i === 0 || i === 3 ? 0.4 : -0.4) * arrows, top: y - 32 + 32 * (i < 2 ? 0.4 : -0.4) * arrows, opacity: arrows, transform: `rotate(${r}deg)`}}>
						<path d="M5 5h9M5 5v9M5 5l7 7" />
					</svg>
				))}
			</div>
			{/* size bar, no numbers */}
			<div style={{position: 'absolute', left: 60, top: 680, width: 640, height: 44, borderRadius: 22, background: CARD2, opacity: enter}}>
				<div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 22, background: C.lime}} />
			</div>
		</Box>
	);
};

const RES: Res[] = [
	{n: '01', name: 'Figma', verb: 'Зібрати макет', Ill: Figma},
	{n: '02', name: 'Google Fonts', verb: 'Підібрати шрифти', Ill: FontsIll},
	{n: '03', name: 'Coolors', verb: 'Зібрати палітру', Ill: Coolors},
	{n: '04', name: 'Lucide', verb: 'Знайти іконки', Ill: Lucide},
	{n: '05', name: 'Squoosh', verb: 'Стиснути зображення', Ill: Squoosh},
];

// ---------- shared pieces ----------
const NumBadge: React.FC<{n: string; size?: number}> = ({n, size = 96}) => (
	<div
		style={{
			width: size * 1.5,
			height: size,
			borderRadius: size * 0.3,
			background: C.lime,
			color: '#171B20',
			fontFamily: F.display,
			fontWeight: 900,
			fontSize: size * 0.58,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0,
		}}
	>
		{n}
	</div>
);

const Mini: React.FC<{Ill: React.FC<{f: number}>; size?: number}> = ({Ill, size = 150}) => {
	const s = (size * 0.86) / 760;
	return (
		<div style={{width: size, height: size, borderRadius: size * 0.2, background: CARD2, overflow: 'hidden', position: 'relative', flexShrink: 0}}>
			<div style={{position: 'absolute', left: (size - 760 * s) / 2, top: (size - 830 * s) / 2, width: 760, height: 830, transform: `scale(${s})`, transformOrigin: '0 0'}}>
				<Ill f={999} />
			</div>
		</div>
	);
};

const Row: React.FC<{r: Res; h: number; nameSize: number; verbSize: number; opacity?: number; x?: number}> = ({r, h, nameSize, verbSize, opacity = 1, x = 0}) => (
	<div
		style={{
			height: h,
			borderRadius: 44,
			background: CARD,
			border: `2px solid ${LINE}`,
			display: 'flex',
			alignItems: 'center',
			gap: 28,
			padding: `0 ${h * 0.14}px`,
			opacity,
			transform: `translateX(${x}px)`,
		}}
	>
		<Mini Ill={r.Ill} size={h * 0.74} />
		<div style={{flex: 1, minWidth: 0}}>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: nameSize, color: C.text, lineHeight: 1.1, whiteSpace: 'nowrap'}}>{r.name}</div>
			<div style={{fontWeight: 600, fontSize: verbSize, color: '#C9D1D8', marginTop: 6, whiteSpace: 'nowrap'}}>{r.verb}</div>
		</div>
		<NumBadge n={r.n} size={h * 0.46} />
	</div>
);

// ---------- scenes ----------
const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const exit = ramp(f, 80, 90, 1, 0);
	const words = ['Робиш', 'перший', 'сайт?'];
	return (
		<AbsoluteFill style={{opacity: exit}}>
			<div style={{position: 'absolute', left: X0, top: 250, width: W}}>
				{words.map((w, i) => {
					const t = ramp(f, 2 + i * 6, 22 + i * 6);
					return (
						<div key={w} style={{overflow: 'hidden', height: 130}}>
							<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 110, lineHeight: '130px', color: C.text, transform: `translateY(${(1 - t) * 130}px)`}}>
								{w === 'сайт?' ? <span style={{color: C.lime}}>{w}</span> : w}
							</div>
						</div>
					);
				})}
				<div
					style={{
						marginTop: 56,
						display: 'inline-block',
						padding: '22px 36px',
						borderRadius: 999,
						background: C.lime,
						color: '#171B20',
						fontWeight: 800,
						fontSize: 58,
						opacity: ramp(f, 30, 44),
						transform: `translateY(${(1 - ramp(f, 30, 48)) * 40}px)`,
					}}
				>
					Збережи ці 5 ресурсів
				</div>
			</div>
			{/* teaser fan */}
			{RES.map((r, i) => {
				const t = ramp(f, 36 + i * 4, 62 + i * 4);
				const a = (i - 2) * 11;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 540 - 105 + (i - 2) * 118,
							top: 1180 + Math.abs(i - 2) * 26,
							width: 210,
							height: 290,
							borderRadius: 40,
							background: CARD,
							border: `2px solid ${LINE}`,
							transformOrigin: '50% 120%',
							transform: `translateY(${(1 - t) * 160}px) rotate(${a * t}deg)`,
							opacity: t,
							display: 'flex',
							alignItems: 'flex-start',
							padding: 24,
						}}
					>
						<NumBadge n={r.n} size={64} />
						<div style={{position: "absolute", left: 30, right: 30, bottom: 30}}><Mini Ill={r.Ill} size={150} /></div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

const CardScene: React.FC<{i: number}> = ({i}) => {
	const f = useCurrentFrame();
	const r = RES[i];
	const enter = ramp(f, 0, 16);
	const out = ramp(f, CARD_LEN - 8, CARD_LEN, 1, 0);
	const tName = ramp(f, 8, 24);
	const tVerb = ramp(f, 14, 30);
	return (
		<AbsoluteFill style={{opacity: out, transform: `translateX(${(1 - out) * -70}px)`}}>
			{/* progress */}
			<div style={{position: 'absolute', left: X0, top: 230, width: W, display: 'flex', gap: 19}}>
				{RES.map((_, k) => (
					<div key={k} style={{flex: 1, height: 12, borderRadius: 6, background: '#FFFFFF22', overflow: 'hidden'}}>
						<div style={{width: `${(k < i ? 1 : k === i ? ramp(f, 0, 20) : 0) * 100}%`, height: '100%', background: C.lime}} />
					</div>
				))}
			</div>
			{/* illustration card */}
			<div
				style={{
					position: 'absolute',
					left: X0,
					top: 300,
					width: W,
					height: 1000,
					borderRadius: 64,
					background: CARD,
					border: `2px solid ${LINE}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: enter,
					transform: `translateY(${(1 - enter) * 70}px) scale(${0.97 + 0.03 * enter})`,
				}}
			>
				<r.Ill f={f} />
			</div>
			<div style={{position: 'absolute', left: X0, top: 1360, width: W, display: 'flex', alignItems: 'center', gap: 28, opacity: tName, transform: `translateY(${(1 - tName) * 30}px)`}}>
				<NumBadge n={r.n} size={92} />
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 68, color: C.text, whiteSpace: 'nowrap'}}>{r.name}</div>
			</div>
			<div style={{position: 'absolute', left: X0, top: 1490, width: W, fontWeight: 800, fontSize: 62, color: C.lime, opacity: tVerb, transform: `translateY(${(1 - tVerb) * 30}px)`}}>
				{r.verb}
			</div>
		</AbsoluteFill>
	);
};

const Recap: React.FC = () => {
	const f = useCurrentFrame();
	const out = ramp(f, 52, 60, 1, 0);
	const tTitle = ramp(f, 0, 14);
	return (
		<AbsoluteFill style={{opacity: out}}>
			<div style={{position: 'absolute', left: X0, top: 230, width: W, fontFamily: F.display, fontWeight: 900, fontSize: 84, lineHeight: 1.12, color: C.text, opacity: tTitle, transform: `translateY(${(1 - tTitle) * 40}px)`}}>
				Від макета до <span style={{color: C.lime}}>готових деталей</span>
			</div>
			<div style={{position: 'absolute', left: X0, top: 640, width: W, display: 'flex', flexDirection: 'column', gap: 22}}>
				{RES.map((r, i) => {
					const t = ramp(f, 3 + i * 2, 15 + i * 2);
					return <Row key={i} r={r} h={168} nameSize={52} verbSize={36} opacity={t} x={(1 - t) * 160} />;
				})}
			</div>
		</AbsoluteFill>
	);
};

const Bookmark: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
	</svg>
);

const Cta: React.FC = () => {
	const f = useCurrentFrame();
	const t1 = ramp(f, 0, 18);
	const t2 = ramp(f, 14, 32);
	const t3 = ramp(f, 26, 44);
	const t4 = ramp(f, 40, 58);
	const pulse = 0.5 + 0.5 * Math.sin(f / 9);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: X0, top: 400, width: W, fontFamily: F.display, fontWeight: 900, fontSize: 104, lineHeight: 1.1, color: C.text, opacity: t1, transform: `translateY(${(1 - t1) * 50}px)`}}>
				Хочеш усі <span style={{color: C.lime}}>посилання?</span>
			</div>
			<div style={{position: 'absolute', left: X0, top: 800, width: W, whiteSpace: "nowrap", opacity: t2, transform: `translateY(${(1 - t2) * 40}px)`}}>
				<div style={{fontWeight: 800, fontSize: 52, lineHeight: 1.4, color: C.text}}>
					Напиши{' '}
					<span style={{display: 'inline-block', padding: '0 18px', borderRadius: 18, background: C.lime, color: '#171B20', boxShadow: `0 0 ${30 + pulse * 40}px #C3FF5560`}}>САЙТ</span>{' '}
					у коментарях —
				</div>
				<div style={{fontWeight: 800, fontSize: 52, lineHeight: 1.4, color: C.text, opacity: t3}}>надішлю список у Direct</div>
			</div>
			<div style={{position: 'absolute', left: X0, top: 1420, width: W, display: 'flex', alignItems: 'center', gap: 24, opacity: t4, transform: `translateY(${(1 - t4) * 30 - pulse * 4}px)`}}>
				<Bookmark size={72} />
				<div style={{fontWeight: 700, fontSize: 46, color: C.text}}>
					<span style={{color: C.lime, fontFamily: F.display, fontWeight: 900}}>DevGuide</span> · Збережи на потім
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const ResourcePost: React.FC = () => (
	<AbsoluteFill style={{fontFamily: F.body}}>
		<Backdrop />
		<Sequence from={0} durationInFrames={90} name="Hook">
			<Hook />
		</Sequence>
		{RES.map((_, i) => (
			<Sequence key={i} from={CARD_START + i * CARD_LEN} durationInFrames={CARD_LEN} name={`Card ${i + 1}`}>
				<CardScene i={i} />
			</Sequence>
		))}
		<Sequence from={RECAP_START} durationInFrames={60} name="Recap">
			<Recap />
		</Sequence>
		<Sequence from={CTA_START} durationInFrames={150} name="CTA">
			<Cta />
		</Sequence>
		{/* quiet sound design; the post reads fully without audio */}
		<Bgm offsetSec={0} total={POST_DURATION} vol={0.18} fadeIn={30} fadeOut={60} />
		{RES.map((_, i) => (
			<Sfx key={i} at={CARD_START + i * CARD_LEN + 4} src="soft-pop.wav" vol={0.3} dur={10} />
		))}
		<Sfx at={RECAP_START + 4} src="soft-pop.wav" vol={0.3} dur={10} />
		<Sfx at={CTA_START + 26} src="sparkle-touch.mp3" vol={0.35} dur={45} />
	</AbsoluteFill>
);

/** Static 1080x1350 post card: same resources, final state. */
export const ResourcePostStatic: React.FC = () => (
	<AbsoluteFill style={{fontFamily: F.body}}>
		<Backdrop />
		<div style={{position: 'absolute', left: 70, top: 64, width: 940, fontFamily: F.display, fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: C.text}}>
			5 ресурсів для <span style={{color: C.lime}}>першого сайту</span>
		</div>
		<div style={{position: 'absolute', left: 70, top: 270, width: 940, display: 'flex', flexDirection: 'column', gap: 18}}>
			{RES.map((r, i) => (
				<Row key={i} r={r} h={168} nameSize={52} verbSize={38} />
			))}
		</div>
		<div style={{position: 'absolute', left: 70, top: 1250, width: 940, display: 'flex', alignItems: 'center', gap: 20}}>
			<Bookmark size={56} />
			<div style={{fontWeight: 700, fontSize: 40, color: C.text}}>
				<span style={{color: C.lime, fontFamily: F.display, fontWeight: 900}}>DevGuide</span> · Збережи на потім
			</div>
		</div>
	</AbsoluteFill>
);
