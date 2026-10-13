import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {F, Sfx, Stage, Wordmark, brand, clamp, ramp} from './kit';
import {Caret} from './Code';
import {chunkEnd, chunkWords, Word} from './captions';
import {Theme, ThemeProvider, useTheme} from './theme';
import {Insert, UgcInsert} from './ugc';
import PATH from '../../data/learning-claude.json';
import SITES from '../../data/learning-websites.json';

/** Промпт кроку дослівно з програми (data/learning-claude.json, data/learning-websites.json). */
export const prompt = (step: string, key: string) => {
	const p = [...PATH.steps, ...SITES.steps].find((s) => s.key === step)?.prompts.find((q) => q.key === key);
	if (!p) throw new Error(`prompt(): ${step}/${key} немає в data/learning-*.json`);
	return p.body;
};

// Вертикальні шорти кроків шляху (1080×1920): спільні хелпери й блоки. t — секунда голосу (words.json).
// Safe area AGENTS.md: x 84..940, y 180..1650. Сцени тримаємо вище y≈1420: нижче субтитри.
// Кольори — з теми (src/system/theme.tsx); тема за замовчуванням = бренд DevGuide.
export const X = 84;
export const W = 856;
export const S = (s: number) => Math.round(s * 30);
export const io = (t: number, a: number, b: number, f = 0.35) => Math.min(ramp(t, a, a + f), b === Infinity ? 1 : 1 - ramp(t, b - f, b));
export const pop = (t: number, at: number, len = 0.35) => ramp(t, at, at + len);
export const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(interpolate(t, [a, b], [0, s.length], clamp)));
export {useTheme};

/** Секунда першого слова голосу, що починається з `word` (без регістру), не раніше `after`. Немає слова — помилка на рендері. */
export const at = (words: Word[], word: string, after = 0) => {
	const k = word.toLowerCase();
	const w = words.find((x) => x.s >= after && x.w.toLowerCase().replace(/^[«"(]+/, '').startsWith(k));
	if (!w) throw new Error(`at(): «${word}» після ${after} с не знайдено у words.json`);
	return w.s;
};

// входи сцени; без seed (старі ролики) — завжди перший, з seed — свій для кожної сцени й кожного рендеру
const ENTERS: ((p: number, rise: number) => React.CSSProperties)[] = [
	(p, rise) => ({transform: `translateY(${(1 - p) * rise}px)`}),
	(p) => ({transform: `scale(${0.9 + p * 0.1})`, filter: `blur(${(1 - p) * 12}px)`}),
	(p) => ({transform: `translateX(${(1 - p) * 90}px)`}),
	(p) => ({transform: `translateX(${-(1 - p) * 90}px)`}),
	(p) => ({clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}),
	(p) => ({transform: `perspective(1400px) rotateX(${(1 - p) * 18}deg) translateY(${(1 - p) * 40}px)`, transformOrigin: '50% 100%'}),
];
export const Show: React.FC<{t: number; a: number; b: number; children: React.ReactNode; rise?: number}> = ({t, a, b, children, rise = 24}) => {
	const {seed} = useTheme();
	if (t < a || t > b) return null;
	const v = seed == null ? 0 : Math.floor(random(`show-${seed}-${a.toFixed(2)}`) * ENTERS.length);
	return <AbsoluteFill style={{opacity: io(t, a, b), ...ENTERS[v](ramp(t, a, a + 0.5), rise)}}>{children}</AbsoluteFill>;
};
/** Великий заголовок; у постерній темі (echo) — з контурним «відлунням» позаду. */
export const Big: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 96, style}) => {
	const T = useTheme();
	const base: React.CSSProperties = {fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: -1.5, ...style};
	if (!T.echo) return <div style={base}>{children}</div>;
	const d = Math.max(6, size * 0.08);
	return (
		<div style={{...base, position: 'relative'}}>
			<div aria-hidden style={{position: 'absolute', inset: 0, transform: `translate(${d}px, ${d}px)`, WebkitTextFillColor: 'transparent', WebkitTextStroke: `${Math.max(2, size * 0.03)}px ${T.text}`, opacity: 0.55}}>{children}</div>
			<div style={{position: 'relative'}}>{children}</div>
		</div>
	);
};
export const L: React.FC<{c?: string; children: React.ReactNode}> = ({c, children}) => {
	const T = useTheme();
	return <span style={{color: c ?? T.accent}}>{children}</span>;
};
/** Код у тексті: моно, акцент, без переносу по дефісах. */
export const Mono: React.FC<{children: React.ReactNode; size?: number}> = ({children, size}) => (
	<span style={{fontFamily: F.mono, color: useTheme().accent, whiteSpace: 'nowrap', fontSize: size}}>{children}</span>
);
/** Закреслення рискою, p: 0..1 */
export const Strike: React.FC<{p: number; children: React.ReactNode; color?: string}> = ({p, children, color}) => {
	const T = useTheme();
	const c = color ?? T.red;
	return <span style={{backgroundImage: `linear-gradient(${c}, ${c})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 55%', backgroundSize: `${p * 100}% 8px`, color: p > 0.5 ? T.dim : undefined}}>{children}</span>;
};

/** Блок на ширину safe area з верхнім краєм y; o — поява 0..1 (зсув знизу). */
export const Box: React.FC<{y: number; o?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, o = 1, children, style}) => (
	<div style={{position: 'absolute', left: X, width: W, top: y, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 30}px)`, ...style}}>{children}</div>
);
export const Pill: React.FC<{children: React.ReactNode; on?: boolean; style?: React.CSSProperties}> = ({children, on = true, style}) => {
	const T = useTheme();
	return <span style={{display: 'inline-block', padding: '14px 30px', borderRadius: 999, background: on ? `${T.accent}1F` : T.panel2, border: `2px solid ${on ? T.accent : T.line}`, color: on ? T.accent : T.text, fontFamily: F.body, fontWeight: 800, fontSize: 40, ...style}}>{children}</span>;
};

/** Чип розділу шляху + великий титул. */
export const Title: React.FC<{t: number; a?: number; section: string; y?: number; size?: number; children: React.ReactNode}> = ({t, a = 0, section, y = 560, size = 104, children}) => (
	<>
		<Box y={y} o={pop(t, a + 0.1, 0.4)}>
			<span style={{fontFamily: F.mono, fontSize: 30, letterSpacing: 4, color: useTheme().accent, textTransform: 'uppercase'}}>{section}</span>
		</Box>
		<Box y={y + 80} o={pop(t, a + 0.25, 0.5)}>
			<Big size={size}>{children}</Big>
		</Box>
	</>
);

// ---------- вікна (нейтральні, без чужих логотипів) ----------
const Dots: React.FC<{size?: number}> = ({size = 16}) => {
	const T = useTheme();
	return <>{['#FF6B5E', '#FFD27A', T.accent].map((c) => <div key={c} style={{width: size, height: size, borderRadius: size / 2, background: c, opacity: 0.85}} />)}</>;
};
export const Win: React.FC<{y: number; label: string; o?: number; children: React.ReactNode; mono?: boolean; minH?: number; x?: number; w?: number}> = ({y, label, o = 1, children, mono, minH, x = X, w = W}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - o) * 40}px)`, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 32, boxShadow: '0 50px 120px #000000B0, inset 0 1px 0 #ffffff14', overflow: 'hidden'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '20px 28px', borderBottom: `1px solid ${T.line}`}}>
				<Dots />
				<div style={{marginLeft: 14, fontFamily: F.mono, fontSize: 26, color: T.dim}}>{label}</div>
			</div>
			<div style={{padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: mono ? F.mono : F.body, minHeight: minH}}>{children}</div>
		</div>
	);
};
export const UserMsg: React.FC<{children: React.ReactNode; o?: number; size?: number}> = ({children, o = 1, size = 40}) => {
	const T = useTheme();
	return <div style={{alignSelf: 'flex-end', maxWidth: 760, opacity: o, padding: '20px 26px', borderRadius: '26px 26px 6px 26px', background: T.panel2, border: `1px solid ${T.line}`, fontWeight: 600, fontSize: size, lineHeight: 1.35, whiteSpace: 'pre-wrap', textAlign: 'left'}}>{children}</div>;
};
/** Відповідь AI: аватар-крапка + текст або «скелет» рядків. */
export const Reply: React.FC<{o: number; children?: React.ReactNode; size?: number}> = ({o, children, size = 38}) => {
	const T = useTheme();
	return (
		<div style={{alignSelf: 'flex-start', display: 'flex', gap: 18, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, textAlign: 'left'}}>
			<div style={{flex: 'none', width: 48, height: 48, borderRadius: 24, background: `radial-gradient(circle at 30% 30%, ${T.accent}, ${T.accentDeep})`}} />
			{children ? <div style={{fontSize: size, fontWeight: 600, lineHeight: 1.35, paddingTop: 4, maxWidth: 700}}>{children}</div> : (
				<div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10}}>{[560, 460, 300].map((w) => <div key={w} style={{width: w, height: 16, borderRadius: 8, background: `${T.text}22`}} />)}</div>
			)}
		</div>
	);
};

/** Текст з `[підстановками]`, підсвіченими акцентом; показує перші n символів. */
export const Marked: React.FC<{text: string; n?: number}> = ({text, n = Infinity}) => {
	const T = useTheme();
	let left = n;
	return <>{text.split(/(\[[^\]]*\])/).map((seg, i) => {
		if (left <= 0) return null;
		const s = seg.slice(0, left);
		left -= seg.length;
		return seg.startsWith('[') ? <span key={i} style={{color: T.accent, background: `${T.accent}1A`, borderRadius: 8}}>{s}</span> : <span key={i}>{s}</span>;
	})}</>;
};
/** Промпт з програми друкується в чаті між a і b. */
export const PromptCard: React.FC<{t: number; a: number; b: number; text: string; y?: number; label?: string; size?: number}> = ({t, a, b, text, y = 400, label = 'Чат', size = 42}) => {
	const T = useTheme();
	const n = Math.round(interpolate(t, [a, b], [0, text.length], clamp));
	return (
		<Win y={y} label={label} o={pop(t, a - 0.4, 0.4)}>
			<div style={{fontFamily: F.mono, fontSize: 24, color: T.dim, letterSpacing: 3, textAlign: 'left'}}>ПРОМПТ</div>
			<div style={{fontWeight: 600, fontSize: size, lineHeight: 1.38, whiteSpace: 'pre-wrap', textAlign: 'left'}}>
				<Marked text={text} n={n} />
				{n < text.length ? <Caret frame={S(t)} color={T.accent} /> : null}
			</div>
		</Win>
	);
};

export type TermLine = {at: number; text: string; kind?: 'cmd' | 'out' | 'err' | 'ok'; dur?: number};
/** Термінал: команди (`> `) друкуються, вивід з'являється. */
export const Term: React.FC<{t: number; y: number; lines: TermLine[]; label?: string; o?: number; size?: number; minH?: number}> = ({t, y, lines, label = 'Термінал', o = 1, size = 38, minH}) => {
	const T = useTheme();
	return (
		<Win y={y} label={label} o={o} mono minH={minH}>
			{lines.filter((l) => t >= l.at).map((l, i, shown) => {
				const cmd = (l.kind ?? 'cmd') === 'cmd';
				const dur = l.dur ?? Math.min(1.2, l.text.length * 0.05);
				const txt = cmd ? typed(l.text, t, l.at, l.at + dur) : l.text;
				const color = {cmd: T.text, out: T.dim, err: T.red, ok: T.accent}[l.kind ?? 'cmd'];
				return (
					<div key={i} style={{fontSize: size, lineHeight: 1.4, color, opacity: cmd ? 1 : pop(t, l.at, 0.25), whiteSpace: 'pre-wrap', textAlign: 'left'}}>
						{cmd ? <span style={{color: T.accent}}>{'> '}</span> : null}{txt}
						{i === shown.length - 1 && cmd ? <Caret frame={S(t)} color={T.accent} /> : null}
					</div>
				);
			})}
		</Win>
	);
};

/** Рамка браузера з адресою (друкується з `typeAt`, якщо задано). */
export const Browser: React.FC<{t: number; y: number; url: string; typeAt?: number; o?: number; h?: number; children?: React.ReactNode}> = ({t, y, url, typeAt, o = 1, h = 520, children}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: X, top: y, width: W, opacity: o, transform: `translateY(${(1 - o) * 40}px)`, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 28, overflow: 'hidden', boxShadow: '0 50px 120px #000000B0'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px', borderBottom: `1px solid ${T.line}`}}>
				<Dots size={14} />
				<div style={{marginLeft: 12, flex: 1, padding: '10px 22px', borderRadius: 999, background: T.panel2, fontFamily: F.mono, fontSize: 32, textAlign: 'left'}}>
					{typeAt == null ? url : typed(url, t, typeAt, typeAt + Math.min(1.2, url.length * 0.06))}
					{typeAt != null && t < typeAt + 1.6 ? <Caret frame={S(t)} color={T.accent} /> : null}
				</div>
			</div>
			<div style={{position: 'relative', height: h}}>{children}</div>
		</div>
	);
};

/** Живий скрін у children Browser: справжня сторінка (public/ideas/<id>/shots/, w — ширина PNG у px), плавний скрол на scroll px
 *  між a і b, наїзд на focus (координати PNG) з рамкою акцентом у момент focus.at. */
export const LiveShot: React.FC<{t: number; src: string; w: number; a: number; b?: number; scroll?: number; focus?: {x: number; y: number; w: number; h: number; at: number; zoom?: number}}> = ({t, src, w, a, b = a + 4, scroll = 0, focus}) => {
	const T = useTheme();
	const k = W / w;
	const y = scroll * k * ramp(t, a, b);
	const z = focus ? 1 + ((focus.zoom ?? 1.6) - 1) * ramp(t, focus.at, focus.at + 0.7) : 1;
	const cx = focus ? (focus.x + focus.w / 2) * k : 0, cy = focus ? (focus.y + focus.h / 2) * k - y : 0;
	const ring = focus ? pop(t, focus.at + 0.3, 0.35) : 0;
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: pop(t, a, 0.4)}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${cx}px ${cy}px`}}>
				<Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: -y, width: W}} />
				{focus ? <div style={{position: 'absolute', left: focus.x * k - 10, top: focus.y * k - y - 10, width: focus.w * k + 20, height: focus.h * k + 20, borderRadius: 14, border: `${4 / z}px solid ${T.accent}`, boxShadow: `0 0 ${40 * ring}px ${T.accent}`, opacity: ring}} /> : null}
			</div>
		</div>
	);
};

/** Пігулки, що з'являються в моменти at. */
export const Chips: React.FC<{t: number; y: number; items: [string, number][]; size?: number}> = ({t, y, items, size = 40}) => (
	<Box y={y} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18}}>
		{items.map(([txt, a]) => {
			const p = pop(t, a, 0.35);
			return <span key={txt} style={{opacity: p, transform: `scale(${0.8 + p * 0.2})`}}><Pill style={{fontSize: size}}>{txt}</Pill></span>;
		})}
	</Box>
);

/** Нумеровані картки кроків згори вниз; активна — та, що з'явилася останньою. */
export const Steps: React.FC<{t: number; y: number; items: [string, React.ReactNode, number][]; gap?: number; size?: number; nsize?: number}> = ({t, y, items, gap = 170, size = 46, nsize = 84}) => {
	const T = useTheme();
	const cur = items.filter(([, , a]) => t >= a).length - 1;
	return <>{items.map(([n, txt, a], i) => {
		const p = pop(t, a, 0.4);
		const on = i === cur;
		return (
			<div key={n} style={{position: 'absolute', left: X, width: W, top: y + i * gap, opacity: p * (on ? 1 : 0.55), transform: `translateX(${(1 - p) * 60}px)`, display: 'flex', alignItems: 'center', gap: 30, padding: '22px 30px', borderRadius: 28, background: on ? `${T.accent}14` : T.card, border: `2px solid ${on ? T.accent : T.line}`}}>
				<div style={{flex: 'none', minWidth: 92, fontFamily: F.display, fontWeight: 900, fontSize: nsize, color: T.accent, textAlign: 'center'}}>{n}</div>
				<div style={{fontWeight: 700, fontSize: size, lineHeight: 1.25, textAlign: 'left'}}>{txt}</div>
			</div>
		);
	})}</>;
};

/** Поле вводу чату з кареткою (порожнє — підказка). */
export const Field: React.FC<{t: number; text?: string; hint?: string; y: number; o?: number}> = ({t, text = '', hint = 'Напиши повідомлення…', y, o = 1}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: X, width: W, top: y, opacity: o, transform: `translateY(${(1 - o) * 30}px)`, display: 'flex', alignItems: 'center', padding: '30px 36px', borderRadius: 999, background: T.panel2, border: `3px solid ${T.accent}`, fontFamily: F.body, fontWeight: 600, fontSize: 44, boxShadow: `0 30px 90px ${T.accent}22`}}>
			{text ? <span>{text}</span> : <span style={{color: T.dim}}>{hint}</span>}
			<Caret frame={S(t)} color={T.accent} />
		</div>
	);
};

/** Плашка «Перевірка» з умовою кроку з програми. */
export const Check: React.FC<{t: number; a: number; y?: number; children: React.ReactNode}> = ({t, a, y = 640, children}) => {
	const T = useTheme();
	const p = pop(t, a, 0.45);
	return (
		<div style={{position: 'absolute', left: X, width: W, top: y, opacity: p, transform: `scale(${0.92 + p * 0.08})`, padding: '40px 44px', borderRadius: 36, background: `${T.accent}12`, border: `3px solid ${T.accent}`, boxShadow: `0 30px 90px ${T.accent}26`}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 20, fontFamily: F.mono, fontSize: 32, letterSpacing: 4, color: T.accent}}>
				<span style={{display: 'inline-flex', width: 56, height: 56, borderRadius: 28, background: T.accent, color: T.onAccent, alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 900}}>✓</span>
				ПЕРЕВІРКА
			</div>
			<div style={{marginTop: 26, fontFamily: F.body, fontWeight: 800, fontSize: 54, lineHeight: 1.25, textAlign: 'left'}}>{children}</div>
		</div>
	);
};

/** Фінал: DevGuide → «Наступний крок» → назва → адреса шляху. */
export const NextCard: React.FC<{t: number; a: number; next: string; label?: string; url?: string}> = ({t, a, next, label = 'Наступний крок', url = brand.learningUrl.replace('https://', '')}) => {
	const T = useTheme();
	const slam = pop(t, a, 0.5);
	return (
		<Show t={t} a={a} b={Infinity}>
			<Box y={420}>
				<div style={{transform: `scale(${interpolate(slam, [0, 1], [1.5, 1])})`, filter: `blur(${(1 - slam) * 12}px)`}}><Wordmark size={118} /></div>
			</Box>
			<Box y={740} o={pop(t, a + 0.5)}>
				<span style={{fontFamily: F.mono, fontSize: 32, letterSpacing: 5, color: T.dim, textTransform: 'uppercase'}}>{label}</span>
			</Box>
			<Box y={810} o={pop(t, a + 0.7)}>
				<Big size={next.length > 22 ? 64 : 80} style={{color: T.accent}}>{next}</Big>
			</Box>
			<Box y={1180} o={pop(t, a + 1.3)}>
				<span style={{display: 'inline-block', padding: '24px 44px', borderRadius: 999, background: T.accent, color: T.onAccent, fontFamily: F.body, fontWeight: 800, fontSize: url.length > 26 ? 36 : 44, boxShadow: `0 30px 80px ${T.accent}40`}}>{url} →</span>
			</Box>
		</Show>
	);
};

/** Субтитри сторінками з підсвіченим поточним словом; place: низ (над safe-зоною) або центр кадру. */
export const Captions: React.FC<{t: number; chunks: Word[][]; place?: 'bottom' | 'center'; size?: number}> = ({t, chunks, place = 'bottom', size = 52}) => {
	const T = useTheme();
	const i = chunks.findIndex((c, k) => t >= c[0].s - 0.05 && t < chunkEnd(chunks, k));
	if (i < 0) return null;
	const c = chunks[i];
	const pos: React.CSSProperties = place === 'center' ? {top: 1060} : {bottom: 300};
	return (
		<div style={{position: 'absolute', left: X, width: W, ...pos, display: 'flex', justifyContent: 'center', opacity: io(t, c[0].s - 0.05, chunkEnd(chunks, i), 0.12)}}>
			<div style={{padding: '12px 26px', borderRadius: 18, background: `${T.bg}CC`, fontFamily: F.body, fontWeight: 800, fontSize: size, lineHeight: 1.25, textAlign: 'center'}}>
				{c.map((w, k) => (
					<span key={k} style={{color: t >= w.s && t < (c[k + 1]?.s ?? w.e + 0.3) ? T.accent : t >= w.s ? T.text : `${T.text}99`}}>{w.w}{k < c.length - 1 ? ' ' : ''}</span>
				))}
			</div>
		</div>
	);
};

/** Постерний фон: рядки повторених літер (pattern теми), повільно дрейфують. */
export const PatternBg: React.FC<{t: number}> = ({t}) => {
	const T = useTheme();
	if (!T.pattern) return null;
	return (
		<AbsoluteFill style={{overflow: 'hidden', transform: 'rotate(-8deg) scale(1.3)'}}>
			{Array.from({length: 9}, (_, r) => (
				<div key={r} style={{position: 'absolute', top: r * 240 - 120, left: -600 + ((t * 30 * (r % 2 ? 1 : -1)) % 600), whiteSpace: 'nowrap', fontFamily: F.display, fontWeight: 900, fontSize: 230, letterSpacing: -6, color: `${T.text}14`}}>
					{`${T.pattern} `.repeat(6)}
				</div>
			))}
		</AbsoluteFill>
	);
};

/** Кінетична типографіка під голос: «karaoke» — фраза по центру з підсвіченим словом (для пояснень).
 * «word» — одне слово на весь екран з інверсією фону: для пояснень НЕ годиться (скаче, нема контексту — Вадим, 2026-10-11, варіант 10); лише короткі гасла. */
export const Kinetic: React.FC<{t: number; words: Word[]; mode: 'word' | 'karaoke'}> = ({t, words, mode}) => {
	const T = useTheme();
	const chunks = React.useMemo(() => chunkWords(words, mode === 'word' ? 16 : 26), [words, mode]);
	const ci = chunks.findIndex((c, k) => t >= c[0].s - 0.05 && t < chunkEnd(chunks, k, 1.2));
	if (ci < 0) return null;
	const c = chunks[ci];
	const inv = mode === 'word' && ci % 2 === 1;
	if (mode === 'word') {
		let wi = 0;
		c.forEach((w, k) => { if (t >= w.s - 0.03) wi = k; });
		const w = c[wi].w.replace(/[.,:;!?…«»"]+/g, '');
		const p = pop(t, c[wi].s - 0.03, 0.18);
		const size = Math.min(230, Math.floor(1000 / Math.max(4, w.length)));
		return (
			<AbsoluteFill style={{background: inv ? T.accent : 'transparent', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{transform: `scale(${0.85 + p * 0.15})`, opacity: p}}>
					<Big size={size} style={{color: inv ? T.onAccent : wi === c.length - 1 ? T.accent : T.text, textAlign: 'center', textTransform: 'uppercase', letterSpacing: -4}}>{w}</Big>
				</div>
			</AbsoluteFill>
		);
	}
	const p = pop(t, c[0].s - 0.05, 0.25);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 84px'}}>
			<div style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, textAlign: 'center'}}>
				<Big size={96}>
					{c.map((w, k) => <span key={k} style={{color: t >= w.s && t < (c[k + 1]?.s ?? w.e + 0.3) ? T.accent : t >= w.s ? T.text : `${T.text}55`}}>{w.w}{k < c.length - 1 ? ' ' : ''}</span>)}
				</Big>
			</div>
		</AbsoluteFill>
	);
};

export type Cue = [at: number, src: string, vol: number];
export const TAIL = 4.5; // фінальна картка після голосу
export const stepFrames = (words: Word[]) => S(words[words.length - 1].e + TAIL);
const MUSIC = 'ideas/idea-001/music/hazy-after-hours.mp3';

type StepProps = {
	dir: string; words: Word[]; next: string; nextLabel?: string; nextUrl?: string; sfx: Cue[]; scenes?: (t: number) => React.ReactNode;
	theme?: string | Theme; seed?: number; music?: string; musicVol?: number; look?: 'scenes' | 'word' | 'karaoke'; captions?: 'bottom' | 'center' | false; inserts?: Insert[];
};
/** Шорт кроку: голос, музика, SFX, субтитри, сцени (render-функція від t) і фінальна картка «Наступний крок». */
export const StepVideo: React.FC<StepProps> = ({theme, seed, ...p}) => <ThemeProvider theme={theme} seed={seed}><StepInner {...p} /></ThemeProvider>;
const StepInner: React.FC<Omit<StepProps, 'theme' | 'seed'>> = ({dir, words, next, nextLabel, nextUrl, sfx, scenes, music = MUSIC, musicVol = 0.085, look = 'scenes', captions = 'bottom', inserts = []}) => {
	const frame = useCurrentFrame();
	// кадр 0 = обкладинка: Instagram бере його за cover, тож показуємо вже проявлену заставку (t = 1.2 с), а не порожній фон
	const t = frame === 0 ? 1.2 : frame / 30;
	const end = words[words.length - 1].e;
	const total = end + TAIL;
	const card = end + 0.3;
	const chunks = React.useMemo(() => chunkWords(words, 30), [words]);
	const vol = (f: number) => interpolate(f, [0, 30, S(end), S(end) + 15, S(total - 1.5), S(total)], [0, musicVol, musicVol, 0.2, 0.2, 0], clamp);
	const body = look === 'scenes' ? scenes?.(t) : <Kinetic t={t} words={words} mode={look} />;
	// фон: без seed — як було; з seed — світло в іншому місці, сітка не завжди
	const {seed} = useTheme();
	const glow: [number, number] = seed == null ? [760, 420] : [180 + random(`gx${seed}`) * 720, 280 + random(`gy${seed}`) * 1200];
	const grid = seed == null || random(`grid${seed}`) > 0.4;
	return (
		<Stage glow={glow} grid={grid}>
			<PatternBg t={t} />
			<Audio src={staticFile(`${dir}/voice.mp3`)} volume={(f) => (f < S(end) + 6 ? 1 : 0)} />
			<Audio src={staticFile(music)} volume={vol} />
			{sfx.map(([a, src, vol], i) => <Sfx key={i} at={S(a)} src={src} vol={vol} />)}
			<Sfx at={S(card)} src="impact/impact-movie-epic.mp3" vol={0.4} dur={150} />
			{t < card + 0.4 ? <AbsoluteFill style={{opacity: 1 - ramp(t, card, card + 0.4)}}>{body}</AbsoluteFill> : null}
			{inserts.map((ins, i) => <UgcInsert key={i} t={t} ins={ins} />)}
			{inserts.map((ins, i) => <Sfx key={`u${i}`} at={S(ins.at)} src="whoosh/whoosh-fast.mp3" vol={0.3} dur={30} />)}
			<NextCard t={t} a={card} next={next} label={nextLabel} url={nextUrl} />
			{frame > 0 && captions && look === 'scenes' && t < end + 0.5 ? <Captions t={t} chunks={chunks} place={captions} /> : null}
		</Stage>
	);
};

/** Прев'ю блоків у Studio (System-Step): титул → промпт → термінал → перевірка → фінальна картка, без голосу. */
export const StepPreview: React.FC<{theme?: string}> = ({theme}) => {
	const t = useCurrentFrame() / 30;
	return (
		<ThemeProvider theme={theme}>
			<Stage glow={[760, 420]} grid>
				<PatternBg t={t} />
				<Show t={t} a={0} b={2}><Title t={t} section="Розділ шляху">Назва <L>кроку</L></Title></Show>
				<Show t={t} a={2} b={5}><PromptCard t={t} a={2.3} b={4.5} text={prompt('claude-code-install', 'install')} /></Show>
				<Show t={t} a={5} b={7.5}><Term t={t} y={600} lines={[{at: 5.3, text: 'claude'}, {at: 6.3, text: '✓ готово', kind: 'ok'}]} /></Show>
				<Show t={t} a={7.5} b={10}><Check t={t} a={7.6}>Умова перевірки з програми</Check></Show>
				<NextCard t={t} a={10} next="Наступний крок" />
			</Stage>
		</ThemeProvider>
	);
};
