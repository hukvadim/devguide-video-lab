import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F, Sfx, Stage, Wordmark, brand, clamp, ramp} from './kit';
import {Caret} from './Code';
import {chunkEnd, chunkWords, Word} from './captions';
import PATH from '../../data/learning-claude.json';

/** Промпт кроку дослівно з програми (data/learning-claude.json). */
export const prompt = (step: string, key: string) => {
	const p = PATH.steps.find((s) => s.key === step)?.prompts.find((q) => q.key === key);
	if (!p) throw new Error(`prompt(): ${step}/${key} немає в learning-claude.json`);
	return p.body;
};

// Вертикальні шорти кроків шляху (1080×1920): спільні хелпери й блоки. t — секунда голосу (words.json).
// Safe area AGENTS.md: x 84..940, y 180..1650. Сцени тримаємо вище y≈1420: нижче субтитри.
export const X = 84;
export const W = 856;
export const S = (s: number) => Math.round(s * 30);
export const io = (t: number, a: number, b: number, f = 0.35) => Math.min(ramp(t, a, a + f), b === Infinity ? 1 : 1 - ramp(t, b - f, b));
export const pop = (t: number, at: number, len = 0.35) => ramp(t, at, at + len);
export const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(interpolate(t, [a, b], [0, s.length], clamp)));

/** Секунда першого слова голосу, що починається з `word` (без регістру), не раніше `after`. Немає слова — помилка на рендері. */
export const at = (words: Word[], word: string, after = 0) => {
	const k = word.toLowerCase();
	const w = words.find((x) => x.s >= after && x.w.toLowerCase().replace(/^[«"(]+/, '').startsWith(k));
	if (!w) throw new Error(`at(): «${word}» після ${after} с не знайдено у words.json`);
	return w.s;
};

export const Show: React.FC<{t: number; a: number; b: number; children: React.ReactNode; rise?: number}> = ({t, a, b, children, rise = 24}) => {
	if (t < a || t > b) return null;
	return <AbsoluteFill style={{opacity: io(t, a, b), transform: `translateY(${(1 - ramp(t, a, a + 0.5)) * rise}px)`}}>{children}</AbsoluteFill>;
};
export const Big: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 96, style}) => (
	<div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: -1.5, ...style}}>{children}</div>
);
export const L: React.FC<{c?: string; children: React.ReactNode}> = ({c = C.lime, children}) => <span style={{color: c}}>{children}</span>;
/** Код у тексті: моно, лайм, без переносу по дефісах. */
export const Mono: React.FC<{children: React.ReactNode; size?: number}> = ({children, size}) => (
	<span style={{fontFamily: F.mono, color: C.lime, whiteSpace: 'nowrap', fontSize: size}}>{children}</span>
);
/** Закреслення рискою, p: 0..1 */
export const Strike: React.FC<{p: number; children: React.ReactNode; color?: string}> = ({p, children, color = C.red}) => (
	<span style={{backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 55%', backgroundSize: `${p * 100}% 8px`, color: p > 0.5 ? C.dim : undefined}}>{children}</span>
);

/** Блок на ширину safe area з верхнім краєм y; o — поява 0..1 (зсув знизу). */
export const Box: React.FC<{y: number; o?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, o = 1, children, style}) => (
	<div style={{position: 'absolute', left: X, width: W, top: y, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 30}px)`, ...style}}>{children}</div>
);
export const Pill: React.FC<{children: React.ReactNode; on?: boolean; style?: React.CSSProperties}> = ({children, on = true, style}) => (
	<span style={{display: 'inline-block', padding: '14px 30px', borderRadius: 999, background: on ? `${C.lime}1F` : '#1B2530', border: `2px solid ${on ? C.lime : C.line}`, color: on ? C.lime : C.text, fontFamily: F.body, fontWeight: 800, fontSize: 40, ...style}}>{children}</span>
);

/** Чип розділу шляху + великий титул. */
export const Title: React.FC<{t: number; a?: number; section: string; y?: number; size?: number; children: React.ReactNode}> = ({t, a = 0, section, y = 560, size = 104, children}) => (
	<>
		<Box y={y} o={pop(t, a + 0.1, 0.4)}>
			<span style={{fontFamily: F.mono, fontSize: 30, letterSpacing: 4, color: C.lime, textTransform: 'uppercase'}}>{section}</span>
		</Box>
		<Box y={y + 80} o={pop(t, a + 0.25, 0.5)}>
			<Big size={size}>{children}</Big>
		</Box>
	</>
);

// ---------- вікна (нейтральні, без чужих логотипів) ----------
export const Win: React.FC<{y: number; label: string; o?: number; children: React.ReactNode; mono?: boolean; minH?: number; x?: number; w?: number}> = ({y, label, o = 1, children, mono, minH, x = X, w = W}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - o) * 40}px)`, background: '#0D1318F2', border: `1px solid ${C.line}`, borderRadius: 32, boxShadow: '0 50px 120px #000000B0, inset 0 1px 0 #ffffff14', overflow: 'hidden'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '20px 28px', borderBottom: `1px solid ${C.line}`}}>
			{['#FF6B5E', '#FFD27A', C.lime].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.85}} />)}
			<div style={{marginLeft: 14, fontFamily: F.mono, fontSize: 26, color: C.dim}}>{label}</div>
		</div>
		<div style={{padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: mono ? F.mono : F.body, minHeight: minH}}>{children}</div>
	</div>
);
export const UserMsg: React.FC<{children: React.ReactNode; o?: number; size?: number}> = ({children, o = 1, size = 40}) => (
	<div style={{alignSelf: 'flex-end', maxWidth: 760, opacity: o, padding: '20px 26px', borderRadius: '26px 26px 6px 26px', background: '#1B2530', border: `1px solid ${C.line}`, fontWeight: 600, fontSize: size, lineHeight: 1.35, whiteSpace: 'pre-wrap', textAlign: 'left'}}>{children}</div>
);
/** Відповідь AI: аватар-крапка + текст або «скелет» рядків. */
export const Reply: React.FC<{o: number; children?: React.ReactNode; size?: number}> = ({o, children, size = 38}) => (
	<div style={{alignSelf: 'flex-start', display: 'flex', gap: 18, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, textAlign: 'left'}}>
		<div style={{flex: 'none', width: 48, height: 48, borderRadius: 24, background: `radial-gradient(circle at 30% 30%, ${C.lime}, ${C.limeDeep})`}} />
		{children ? <div style={{fontSize: size, fontWeight: 600, lineHeight: 1.35, paddingTop: 4, maxWidth: 700}}>{children}</div> : (
			<div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10}}>{[560, 460, 300].map((w) => <div key={w} style={{width: w, height: 16, borderRadius: 8, background: '#FFFFFF22'}} />)}</div>
		)}
	</div>
);

/** Текст з `[підстановками]`, підсвіченими лаймом; показує перші n символів. */
const Marked: React.FC<{text: string; n?: number}> = ({text, n = Infinity}) => {
	let left = n;
	return <>{text.split(/(\[[^\]]*\])/).map((seg, i) => {
		if (left <= 0) return null;
		const s = seg.slice(0, left);
		left -= seg.length;
		return seg.startsWith('[') ? <span key={i} style={{color: C.lime, background: `${C.lime}1A`, borderRadius: 8}}>{s}</span> : <span key={i}>{s}</span>;
	})}</>;
};
/** Промпт з програми друкується в чаті між a і b. */
export const PromptCard: React.FC<{t: number; a: number; b: number; text: string; y?: number; label?: string; size?: number}> = ({t, a, b, text, y = 400, label = 'Чат', size = 42}) => {
	const n = Math.round(interpolate(t, [a, b], [0, text.length], clamp));
	return (
		<Win y={y} label={label} o={pop(t, a - 0.4, 0.4)}>
			<div style={{fontFamily: F.mono, fontSize: 24, color: C.dim, letterSpacing: 3, textAlign: 'left'}}>ПРОМПТ</div>
			<div style={{fontWeight: 600, fontSize: size, lineHeight: 1.38, whiteSpace: 'pre-wrap', textAlign: 'left'}}>
				<Marked text={text} n={n} />
				{n < text.length ? <Caret frame={S(t)} /> : null}
			</div>
		</Win>
	);
};

export type TermLine = {at: number; text: string; kind?: 'cmd' | 'out' | 'err' | 'ok'; dur?: number};
/** Термінал: команди (`> `) друкуються, вивід з'являється. */
export const Term: React.FC<{t: number; y: number; lines: TermLine[]; label?: string; o?: number; size?: number; minH?: number}> = ({t, y, lines, label = 'Термінал', o = 1, size = 38, minH}) => (
	<Win y={y} label={label} o={o} mono minH={minH}>
		{lines.filter((l) => t >= l.at).map((l, i, shown) => {
			const cmd = (l.kind ?? 'cmd') === 'cmd';
			const dur = l.dur ?? Math.min(1.2, l.text.length * 0.05);
			const txt = cmd ? typed(l.text, t, l.at, l.at + dur) : l.text;
			const color = {cmd: C.text, out: C.dim, err: C.red, ok: C.lime}[l.kind ?? 'cmd'];
			return (
				<div key={i} style={{fontSize: size, lineHeight: 1.4, color, opacity: cmd ? 1 : pop(t, l.at, 0.25), whiteSpace: 'pre-wrap', textAlign: 'left'}}>
					{cmd ? <span style={{color: C.lime}}>{'> '}</span> : null}{txt}
					{i === shown.length - 1 && cmd ? <Caret frame={S(t)} /> : null}
				</div>
			);
		})}
	</Win>
);

/** Рамка браузера з адресою (друкується з `typeAt`, якщо задано). */
export const Browser: React.FC<{t: number; y: number; url: string; typeAt?: number; o?: number; h?: number; children?: React.ReactNode}> = ({t, y, url, typeAt, o = 1, h = 520, children}) => (
	<div style={{position: 'absolute', left: X, top: y, width: W, opacity: o, transform: `translateY(${(1 - o) * 40}px)`, background: '#0D1318F2', border: `1px solid ${C.line}`, borderRadius: 28, overflow: 'hidden', boxShadow: '0 50px 120px #000000B0'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px', borderBottom: `1px solid ${C.line}`}}>
			{['#FF6B5E', '#FFD27A', C.lime].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.85}} />)}
			<div style={{marginLeft: 12, flex: 1, padding: '10px 22px', borderRadius: 999, background: '#1B2530', fontFamily: F.mono, fontSize: 32, textAlign: 'left'}}>
				{typeAt == null ? url : typed(url, t, typeAt, typeAt + Math.min(1.2, url.length * 0.06))}
				{typeAt != null && t < typeAt + 1.6 ? <Caret frame={S(t)} /> : null}
			</div>
		</div>
		<div style={{position: 'relative', height: h}}>{children}</div>
	</div>
);

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
	const cur = items.filter(([, , a]) => t >= a).length - 1;
	return <>{items.map(([n, txt, a], i) => {
		const p = pop(t, a, 0.4);
		const on = i === cur;
		return (
			<div key={n} style={{position: 'absolute', left: X, width: W, top: y + i * gap, opacity: p * (on ? 1 : 0.55), transform: `translateX(${(1 - p) * 60}px)`, display: 'flex', alignItems: 'center', gap: 30, padding: '22px 30px', borderRadius: 28, background: on ? `${C.lime}14` : '#10161C', border: `2px solid ${on ? C.lime : C.line}`}}>
				<div style={{flex: 'none', minWidth: 92, fontFamily: F.display, fontWeight: 900, fontSize: nsize, color: C.lime, textAlign: 'center'}}>{n}</div>
				<div style={{fontWeight: 700, fontSize: size, lineHeight: 1.25, textAlign: 'left'}}>{txt}</div>
			</div>
		);
	})}</>;
};

/** Поле вводу чату з кареткою (порожнє — підказка). */
export const Field: React.FC<{t: number; text?: string; hint?: string; y: number; o?: number}> = ({t, text = '', hint = 'Напиши повідомлення…', y, o = 1}) => (
	<div style={{position: 'absolute', left: X, width: W, top: y, opacity: o, transform: `translateY(${(1 - o) * 30}px)`, display: 'flex', alignItems: 'center', padding: '30px 36px', borderRadius: 999, background: '#1B2530', border: `3px solid ${C.lime}`, fontFamily: F.body, fontWeight: 600, fontSize: 44, boxShadow: `0 30px 90px ${C.lime}22`}}>
		{text ? <span>{text}</span> : <span style={{color: C.dim}}>{hint}</span>}
		<Caret frame={S(t)} />
	</div>
);

/** Плашка «Перевірка» з умовою кроку з програми. */
export const Check: React.FC<{t: number; a: number; y?: number; children: React.ReactNode}> = ({t, a, y = 640, children}) => {
	const p = pop(t, a, 0.45);
	return (
		<div style={{position: 'absolute', left: X, width: W, top: y, opacity: p, transform: `scale(${0.92 + p * 0.08})`, padding: '40px 44px', borderRadius: 36, background: `${C.lime}12`, border: `3px solid ${C.lime}`, boxShadow: `0 30px 90px ${C.lime}26`}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 20, fontFamily: F.mono, fontSize: 32, letterSpacing: 4, color: C.lime}}>
				<span style={{display: 'inline-flex', width: 56, height: 56, borderRadius: 28, background: C.lime, color: C.bg, alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 900}}>✓</span>
				ПЕРЕВІРКА
			</div>
			<div style={{marginTop: 26, fontFamily: F.body, fontWeight: 800, fontSize: 54, lineHeight: 1.25, textAlign: 'left'}}>{children}</div>
		</div>
	);
};

/** Фінал: DevGuide → «Наступний крок» → назва → адреса шляху. */
export const NextCard: React.FC<{t: number; a: number; next: string; label?: string; url?: string}> = ({t, a, next, label = 'Наступний крок', url = brand.learningUrl.replace('https://', '')}) => {
	const slam = pop(t, a, 0.5);
	return (
		<Show t={t} a={a} b={Infinity}>
			<Box y={420}>
				<div style={{transform: `scale(${interpolate(slam, [0, 1], [1.5, 1])})`, filter: `blur(${(1 - slam) * 12}px)`}}><Wordmark size={118} /></div>
			</Box>
			<Box y={740} o={pop(t, a + 0.5)}>
				<span style={{fontFamily: F.mono, fontSize: 32, letterSpacing: 5, color: C.dim, textTransform: 'uppercase'}}>{label}</span>
			</Box>
			<Box y={810} o={pop(t, a + 0.7)}>
				<Big size={next.length > 22 ? 64 : 80} style={{color: C.lime}}>{next}</Big>
			</Box>
			<Box y={1180} o={pop(t, a + 1.3)}>
				<span style={{display: 'inline-block', padding: '24px 44px', borderRadius: 999, background: C.lime, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 44, boxShadow: `0 30px 80px ${C.lime}40`}}>{url} →</span>
			</Box>
		</Show>
	);
};

const Captions: React.FC<{t: number; chunks: Word[][]}> = ({t, chunks}) => {
	const i = chunks.findIndex((c, k) => t >= c[0].s - 0.05 && t < chunkEnd(chunks, k));
	if (i < 0) return null;
	const c = chunks[i];
	return (
		<div style={{position: 'absolute', left: X, width: W, bottom: 300, display: 'flex', justifyContent: 'center', opacity: io(t, c[0].s - 0.05, chunkEnd(chunks, i), 0.12)}}>
			<div style={{padding: '12px 26px', borderRadius: 18, background: '#080B0ECC', fontFamily: F.body, fontWeight: 800, fontSize: 52, lineHeight: 1.25, textAlign: 'center'}}>
				{c.map((w, k) => (
					<span key={k} style={{color: t >= w.s && t < (c[k + 1]?.s ?? w.e + 0.3) ? C.lime : t >= w.s ? C.text : '#F5F7F299'}}>{w.w}{k < c.length - 1 ? ' ' : ''}</span>
				))}
			</div>
		</div>
	);
};

export type Cue = [at: number, src: string, vol: number];
export const TAIL = 4.5; // фінальна картка після голосу
export const stepFrames = (words: Word[]) => S(words[words.length - 1].e + TAIL);
const MUSIC = 'ideas/idea-001/music/hazy-after-hours.mp3';

/** Шорт кроку: голос, музика, SFX, субтитри, сцени (render-функція від t) і фінальна картка «Наступний крок». */
export const StepVideo: React.FC<{dir: string; words: Word[]; next: string; nextLabel?: string; nextUrl?: string; sfx: Cue[]; scenes: (t: number) => React.ReactNode}> = ({dir, words, next, nextLabel, nextUrl, sfx, scenes}) => {
	const t = useCurrentFrame() / 30;
	const end = words[words.length - 1].e;
	const total = end + TAIL;
	const card = end + 0.3;
	const chunks = React.useMemo(() => chunkWords(words, 30), [words]);
	const music = (f: number) => interpolate(f, [0, 30, S(end), S(end) + 15, S(total - 1.5), S(total)], [0, 0.085, 0.085, 0.2, 0.2, 0], clamp);
	return (
		<Stage glow={[760, 420]} grid>
			<Audio src={staticFile(`${dir}/voice.mp3`)} />
			<Audio src={staticFile(MUSIC)} volume={music} />
			{sfx.map(([a, src, vol], i) => <Sfx key={i} at={S(a)} src={src} vol={vol} />)}
			<Sfx at={S(card)} src="impact-movie-epic.mp3" vol={0.4} dur={150} />
			{t < card + 0.4 ? <AbsoluteFill style={{opacity: 1 - ramp(t, card, card + 0.4)}}>{scenes(t)}</AbsoluteFill> : null}
			<NextCard t={t} a={card} next={next} label={nextLabel} url={nextUrl} />
			{t < end + 0.5 ? <Captions t={t} chunks={chunks} /> : null}
		</Stage>
	);
};

/** Прев'ю блоків у Studio (System-Step): титул → промпт → термінал → перевірка → фінальна картка, без голосу. */
export const StepPreview: React.FC = () => {
	const t = useCurrentFrame() / 30;
	return (
		<Stage glow={[760, 420]} grid>
			<Show t={t} a={0} b={2}><Title t={t} section="Розділ шляху">Назва <L>кроку</L></Title></Show>
			<Show t={t} a={2} b={5}><PromptCard t={t} a={2.3} b={4.5} text={prompt('claude-code-install', 'install')} /></Show>
			<Show t={t} a={5} b={7.5}><Term t={t} y={600} lines={[{at: 5.3, text: 'claude'}, {at: 6.3, text: '✓ готово', kind: 'ok'}]} /></Show>
			<Show t={t} a={7.5} b={10}><Check t={t} a={7.6}>Умова перевірки з програми</Check></Show>
			<NextCard t={t} a={10} next="Наступний крок" />
		</Stage>
	);
};
