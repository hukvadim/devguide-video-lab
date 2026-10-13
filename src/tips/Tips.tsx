import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, Wordmark, ramp} from '../system/kit';
import {BeatVideo, Card, Poster, beat, beatFrames} from '../system/beat';
import {Big, Box, L, Marked, PromptCard, Strike, Term, UserMsg, Reply, Win, X, W, pop, typed, useTheme} from '../system/step';
import {Caret} from '../system/Code';
import {StylePanel} from './styles';
import TIPS from '../../data/tips.json';

// «Секретні коди»: корисності без голосу для Instagram (docs/FORMAT_LAB.md). Контент — data/tips.json
// (той самий файл збирає набір для Direct: scripts/collect-tips.mjs). Каркас як у лаб. 15: постер (кадр 0 = обкладинка) →
// картки кодів на біт → фінал «напиши КОДИ». Кожне з 10 відео — свій «лук», щоб вибрати формат.

type Item = {code: string; what: string; prompt: string; weak?: string};
type Video = (typeof TIPS.videos)[number] & {items: Item[]};
type P = {t: number; a: number; z: number; i: number; n: number; it: Item; v: Video};
const CTA = TIPS.cta;
const NOTE = <>фрази-промпти ·<br />працюють у <span style={{whiteSpace: 'nowrap'}}>будь-якому</span> AI-чаті</>;

/** Слова не рвуться по дефісу («будь-|який»): кожне слово — nowrap. */
const Words: React.FC<{s: string}> = ({s}) => <>{s.split(' ').map((w, i) => <React.Fragment key={i}>{i ? ' ' : ''}<span style={{whiteSpace: 'nowrap'}}>{w}</span></React.Fragment>)}</>;
const codeSize = (s: string) => (s.length > 16 ? 64 : s.length > 11 ? 76 : 92);
const typeDur = (s: string) => Math.min(2, s.length * 0.024);
/** Колонка зверху safe area: кікер, код, опис. */
const Head: React.FC<{t: number; a: number; kicker: string; it: Item; y?: number}> = ({t, a, kicker, it, y = 210}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: X, width: W, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center'}}>
			<div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 5, color: T.accent, opacity: pop(t, a, 0.2)}}>{kicker}</div>
			<div style={{opacity: pop(t, a, 0.2), transform: `scale(${1.12 - pop(t, a, 0.25) * 0.12})`}}><Big size={codeSize(it.code)} style={{lineHeight: 1.05}}>{it.code}</Big></div>
			<div style={{fontFamily: F.body, fontWeight: 700, fontSize: 46, color: T.dim, opacity: pop(t, a + 0.2, 0.3)}}>{it.what}</div>
		</div>
	);
};

// ---------- 01 · класика lab 15 ----------
const Classic: React.FC<P> = ({t, a, i, n, it}) => (
	<>
		<Box y={320}><Big size={140}><L>{i + 1}/{n}</L></Big></Box>
		<Head t={t} a={a} kicker="" it={it} y={520} />
		<PromptCard t={t} a={a + 0.5} b={a + 0.5 + typeDur(it.prompt)} text={it.prompt} y={980} size={46} />
	</>
);

// ---------- 02 · шпаргалка, що складається ----------
const Sheet: React.FC<{t: number; a: number; v: Video; cur: number}> = ({t, a, v, cur}) => {
	const T = useTheme();
	const all = cur >= v.items.length;
	return (
		<>
			<Box y={190}><span style={{fontFamily: F.mono, fontSize: 32, letterSpacing: 6, color: T.accent}}>ШПАРГАЛКА</span></Box>
			<Box y={250}><Big size={72}>Стисни <L>будь-який текст</L></Big></Box>
			{v.items.slice(0, cur + 1).map((it, k) => {
				const on = k === cur;
				const o = k === cur ? pop(t, a, 0.3) : 1;
				return (
					<div key={k} style={{position: 'absolute', left: X, width: W, top: 470 + k * 195, height: 170, opacity: o, transform: `translateX(${(1 - o) * 80}px)`, display: 'flex', alignItems: 'center', gap: 28, padding: '0 30px', borderRadius: 28, boxSizing: 'border-box', background: on || all ? `${T.accent}14` : T.card, border: `2px solid ${on || all ? T.accent : T.line}`}}>
						<div style={{flex: 'none', width: 84, height: 84, borderRadius: 42, background: T.accent, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 40}}>{k + 1}</div>
						<div style={{textAlign: 'left'}}>
							<div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 40, color: T.accent}}>{it.code}</div>
							<div style={{fontFamily: F.body, fontWeight: 700, fontSize: 38, marginTop: 4}}>{it.what}</div>
						</div>
					</div>
				);
			})}
			{all ? (
				<Box y={1330} o={pop(t, a + 0.2, 0.4)}>
					<span style={{display: 'inline-block', padding: '26px 48px', borderRadius: 999, background: T.accent, color: T.onAccent, fontFamily: F.body, fontWeight: 800, fontSize: 50}}>✦ Збережи шпаргалку</span>
					<div style={{marginTop: 30, fontFamily: F.body, fontWeight: 700, fontSize: 40, color: T.dim}}>повні промпти — у Direct, пиши <L>{CTA}</L></div>
				</Box>
			) : <PromptCard t={t} a={a + 0.4} b={a + 0.4 + typeDur(v.items[cur].prompt)} text={v.items[cur].prompt} y={1290} size={42} />}
		</>
	);
};

// ---------- 03 · до → після ----------
const BeforeAfter: React.FC<P> = ({t, a, i, n, it}) => {
	const T = useTheme();
	return (
		<>
			<Head t={t} a={a} kicker={`${i + 1}/${n}`} it={it} y={330} />
			<Win y={780} label="Так собі" o={pop(t, a + 0.3, 0.3)}>
				<div style={{fontWeight: 800, fontSize: 50, textAlign: 'left'}}><Strike p={ramp(t, a + 1.1, a + 1.5)} color={T.red}>«{it.weak}»</Strike></div>
			</Win>
			<PromptCard t={t} a={a + 1.7} b={a + 1.7 + typeDur(it.prompt)} text={it.prompt} y={1040} label="Так краще ✓" size={44} />
		</>
	);
};

// ---------- 04 · телефон-чат ----------
const Phone: React.FC<P> = ({t, a, i, n, it}) => {
	const T = useTheme();
	const t0 = a + 0.3;
	const sent = t0 + typeDur(it.prompt) + 0.25;
	const field = t < sent ? typed(it.prompt, t, t0, t0 + typeDur(it.prompt)) : '';
	return (
		<>
			<Head t={t} a={a} kicker={`КОД ${i + 1}/${n}`} it={it} y={190} />
			<div style={{position: 'absolute', left: 170, top: 520, width: 740, height: 1110, borderRadius: 84, border: '14px solid #0B0B12', background: T.panel, boxShadow: `0 60px 140px #000000C0, 0 0 80px ${T.glow}33`, overflow: 'hidden', boxSizing: 'border-box'}}>
				<div style={{position: 'absolute', left: 260, top: 18, width: 192, height: 40, borderRadius: 20, background: '#0B0B12'}} />
				<div style={{position: 'absolute', left: 40, right: 40, top: 90, display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 22, borderBottom: `1px solid ${T.line}`}}>
					<div style={{width: 52, height: 52, borderRadius: 26, background: `radial-gradient(circle at 30% 30%, ${T.accent}, ${T.accentDeep})`}} />
					<div style={{fontFamily: F.body, fontWeight: 800, fontSize: 36}}>AI-чат</div>
				</div>
				<div style={{position: 'absolute', left: 36, right: 36, top: 210, display: 'flex', flexDirection: 'column', gap: 30}}>
					{t >= sent ? <div style={{alignSelf: 'flex-end', maxWidth: 600, transform: `translateY(${(1 - pop(t, sent, 0.25)) * 300}px)`}}><UserMsg size={38}><Marked text={it.prompt} /></UserMsg></div> : null}
					{t >= sent + 0.5 ? <Reply o={pop(t, sent + 0.5, 0.3)} /> : null}
				</div>
				<div style={{position: 'absolute', left: 30, right: 30, bottom: 40, minHeight: 100, padding: '22px 30px', borderRadius: 40, background: T.panel2, border: `3px solid ${T.accent}`, fontFamily: F.body, fontWeight: 600, fontSize: 34, lineHeight: 1.3, textAlign: 'left', boxSizing: 'border-box'}}>
					{field ? <Marked text={field} /> : <span style={{color: T.dim}}>Напиши повідомлення…</span>}
					{t < sent ? <Caret frame={Math.round(t * 30)} color={T.accent} /> : null}
				</div>
			</div>
		</>
	);
};

// ---------- 05 · колода карток ----------
const Deck: React.FC<P> = ({t, a, z, i, n, it}) => {
	const T = useTheme();
	const p = pop(t, a, 0.3);
	const q = ramp(t, z - 0.35, z);
	const card = (k: number, body?: React.ReactNode) => (
		<div style={{position: 'absolute', left: X, top: 380, width: W, height: 1000, borderRadius: 48, padding: '60px 56px', boxSizing: 'border-box', background: k ? T.card : T.panel, border: `2px solid ${k ? T.line : T.accent}`, boxShadow: '0 50px 120px #00000090',
			transform: k ? `translateY(${k * 40}px) scale(${1 - k * 0.05}) rotate(${(k % 2 ? 2.5 : -2.5)}deg)` : `translate(${-1300 * q}px, ${40 * (1 - p)}px) rotate(${-14 * q}deg) scale(${0.95 + 0.05 * p})`, opacity: k ? 1 - k * 0.25 : 1, display: 'flex', flexDirection: 'column', gap: 34, textAlign: 'left'}}>{body}</div>
	);
	return (
		<>
			<Box y={210}><span style={{fontFamily: F.mono, fontSize: 40, letterSpacing: 6, color: T.accent}}>{i + 1} / {n}</span></Box>
			{[2, 1].filter((k) => n - i - 1 >= k).map((k) => <React.Fragment key={k}>{card(k)}</React.Fragment>)}
			{card(0, <>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 130, lineHeight: 1, color: T.accent}}>{String(i + 1).padStart(2, '0')}</div>
				<Big size={codeSize(it.code)} style={{lineHeight: 1.05}}>{it.code}</Big>
				<div style={{height: 3, background: T.line}} />
				<div style={{fontFamily: F.body, fontWeight: 700, fontSize: 46, color: T.dim}}>{it.what}</div>
				<div style={{marginTop: 'auto', padding: '28px 32px', borderRadius: 28, background: T.panel2, fontWeight: 600, fontSize: 42, lineHeight: 1.38, opacity: pop(t, a + 0.4, 0.3)}}><Marked text={it.prompt} /></div>
			</>)}
		</>
	);
};

// ---------- 06 · термінал ----------
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const Terminal: React.FC<P> = ({t, a, i, n, it}) => (
	<>
		<Head t={t} a={a} kicker={`КОД ${i + 1}/${n}`} it={it} y={330} />
		<Term t={t} y={760} size={40} minH={560} label="AI-чат" lines={[
			{at: a + 0.3, text: `/${slug(it.code)}`, dur: 0.6},
			{at: a + 1.1, text: `# ${it.what}`, kind: 'ok'},
			{at: a + 1.4, text: it.prompt, dur: typeDur(it.prompt)},
		]} />
	</>
);

// ---------- 07 · сітка з зумом ----------
const TW = 413, TH = 300, GAP = 30, GY = 330, ZOOM = 1.8;
const Grid: React.FC<{t: number; a: number; v: Video; cur: number}> = ({t, a, v, cur}) => {
	const T = useTheme();
	const all = cur >= v.items.length;
	const p = all ? 0 : ramp(t, a + 0.05, a + 0.5);
	const col = cur % 2, row = Math.floor(cur / 2);
	const cx = col * (TW + GAP) + TW / 2, cy = row * (TH + GAP) + TH / 2;
	const s = 1 + (ZOOM - 1) * p;
	const tx = p * (540 - X - cx * ZOOM), ty = p * (600 - GY - cy * ZOOM);
	return (
		<>
			<div style={{position: 'absolute', left: X, top: GY, width: W, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})`}}>
				{v.items.map((it, k) => {
					const on = all || k === cur;
					return (
						<div key={k} style={{position: 'absolute', left: (k % 2) * (TW + GAP), top: Math.floor(k / 2) * (TH + GAP), width: TW, height: TH, boxSizing: 'border-box', padding: '30px 28px', borderRadius: 30, background: on ? T.panel : T.card, border: `2px solid ${on ? T.accent : T.line}`, opacity: on ? 1 : 0.4 * (1 - 0.85 * p), display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left'}}>
							<div style={{fontFamily: F.mono, fontSize: 26, color: T.accent}}>{String(k + 1).padStart(2, '0')}</div>
							<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 31, lineHeight: 1.15}}>{it.code}</div>
							<div style={{marginTop: 'auto', fontFamily: F.body, fontWeight: 700, fontSize: 27, color: T.dim}}>{it.what}</div>
						</div>
					);
				})}
			</div>
			{all ? (
				<>
					<Box y={190} o={pop(t, a, 0.3)}><Big size={64}>Усі 6 — <L>збережи</L></Big></Box>
					<Box y={1360} o={pop(t, a + 0.3, 0.3)}><span style={{fontFamily: F.body, fontWeight: 700, fontSize: 42, color: T.dim}}>повні промпти — у Direct, пиши <L>{CTA}</L></span></Box>
				</>
			) : <PromptCard t={t} a={a + 0.6} b={a + 0.6 + typeDur(v.items[cur].prompt)} text={v.items[cur].prompt} y={1000} size={42} />}
		</>
	);
};

// ---------- 08 · стилі картинок ----------
const Styles: React.FC<P> = ({t, a, i, n, it}) => {
	const T = useTheme();
	return (
		<>
			<Head t={t} a={a} kicker={`${i + 1}/${n}`} it={it} y={190} />
			<StylePanel t={t} a={a} code={it.code} y={500} accent={T.accent} />
			<PromptCard t={t} a={a + 1.3} b={a + 1.3 + typeDur(it.prompt)} text={it.prompt} y={1300} size={38} />
		</>
	);
};

// ---------- 09 · відлік 5 → 1 ----------
const Countdown: React.FC<P> = ({t, a, i, n, it}) => {
	const T = useTheme();
	const p = pop(t, a, 0.3);
	return (
		<>
			<Box y={230}>
				<div style={{transform: `scale(${1.4 - 0.4 * p})`, opacity: p}}><Big size={360} style={{lineHeight: 1}}>{n - i}</Big></div>
			</Box>
			{n - i === 1 ? <Box y={220} o={pop(t, a + 0.3, 0.3)} style={{left: 640, width: 300}}><span style={{display: 'inline-block', padding: '14px 28px', borderRadius: 999, background: T.accent, color: T.onAccent, fontFamily: F.body, fontWeight: 800, fontSize: 40, transform: 'rotate(8deg)'}}>★ ТОП-1</span></Box> : null}
			<Head t={t} a={a + 0.15} kicker="" it={it} y={650} />
			<PromptCard t={t} a={a + 0.6} b={a + 0.6 + typeDur(it.prompt)} text={it.prompt} y={1060} size={44} />
		</>
	);
};

// ---------- 10 · комбо-конструктор ----------
const Block: React.FC<{t: number; a: number; it: Item; y: number; on: boolean; o?: number}> = ({t, a, it, y, on, o = 1}) => {
	const T = useTheme();
	const p = pop(t, a, 0.35) * o;
	return (
		<div style={{position: 'absolute', left: X, width: W, top: y, opacity: on ? p : 0.5 * o, transform: `translateX(${(1 - pop(t, a, 0.35)) * 90}px)`, padding: '28px 34px', boxSizing: 'border-box', borderRadius: 30, background: T.panel, border: `3px solid ${on ? T.accent : T.line}`, textAlign: 'left'}}>
			<div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: T.accent}}>{it.code}</div>
			<div style={{marginTop: 12, fontFamily: F.body, fontWeight: 700, fontSize: 44, lineHeight: 1.3}}>{it.prompt}</div>
		</div>
	);
};
const Combo: React.FC<P> = ({t, a, i, v}) => (
	<>
		<Box y={300} o={pop(t, a, 0.25)}><Big size={92}>{i ? <L>+ </L> : null}{v.items[i].what}</Big></Box>
		{v.items.slice(0, i + 1).map((it, k) => <Block key={k} t={t} a={k === i ? a : -9} it={it} y={520 + k * 300} on={k === i} />)}
	</>
);
const ComboResult: React.FC<{t: number; a: number; v: Video}> = ({t, a, v}) => {
	const text = v.items.map((it) => it.prompt).join(' ');
	const m = ramp(t, a, a + 0.5);
	return (
		<>
			{v.items.map((it, k) => <Block key={k} t={t} a={-9} it={it} y={520 + k * 300 + (780 - 520 - k * 300) * m} on={false} o={1 - m} />)}
			<Box y={300} o={pop(t, a + 0.3, 0.3)}><Big size={88}>= сильний <L>промпт</L></Big></Box>
			<PromptCard t={t} a={a + 0.6} b={a + 0.6 + typeDur(text) * 1.2} text={text} y={640} label="Скопіюй" size={46} />
		</>
	);
};

// ---------- інтро й фінал ----------
const Intro: React.FC<{t: number; a: number; v: Video}> = ({t, a, v}) => {
	const T = useTheme();
	const long = Math.max(...v.title.map((s) => s.length));
	return (
		<>
			<Poster t={t} a={a} kicker={v.kicker} size={long > 18 ? 84 : long > 14 ? 96 : 116} sub={v.look === 'countdown' ? <>№1 — найкорисніший<br />дочекайся кінця</> : v.look === 'styles' ? 'фрази-промпти для генерації картинок' : NOTE}>
				<Words s={v.title[0]} /><br /><L><Words s={v.title[1]} /></L>
			</Poster>
			<div style={{position: 'absolute', left: 660, top: 330, opacity: pop(t, a + 0.3, 0.3), transform: `rotate(${8 + (1 - pop(t, a + 0.3, 0.3)) * 20}deg)`}}>
				<span style={{display: 'inline-block', padding: '16px 30px', borderRadius: 999, border: `4px solid ${T.accent}`, color: T.accent, fontFamily: F.body, fontWeight: 800, fontSize: 38}}>✦ збережи</span>
			</div>
		</>
	);
};
const Cta: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const slam = pop(t, a + 0.35, 0.45);
	return (
		<AbsoluteFill>
			<Box y={300} o={pop(t, a, 0.3)}><Big size={92}>Напиши</Big></Box>
			<Box y={470}>
				<span style={{display: 'inline-block', padding: '30px 70px', borderRadius: 40, background: T.accent, transform: `scale(${1.5 - 0.5 * slam}) rotate(${-3 * slam}deg)`, opacity: slam, boxShadow: `0 40px 100px ${T.accent}55`}}>
					<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, color: T.onAccent, letterSpacing: -2}}>{CTA}</span>
				</span>
			</Box>
			<Box y={790} o={pop(t, a + 0.8, 0.35)}><div style={{fontFamily: F.body, fontWeight: 800, fontSize: 54, lineHeight: 1.3}}>у коментарях — пришлю<br /><L>набір секретних кодів</L> у Direct</div></Box>
			<Box y={1100} o={pop(t, a + 1.3, 0.35)}><span style={{display: 'inline-block', padding: '20px 40px', borderRadius: 999, border: `3px solid ${T.line}`, fontFamily: F.body, fontWeight: 700, fontSize: 42, color: T.dim}}>✦ Збережи, щоб не загубити</span></Box>
			<Box y={1380} o={pop(t, a + 1.6, 0.4)}><Wordmark size={84} /></Box>
		</AbsoluteFill>
	);
};

// ---------- збирання відео з data/tips.json ----------
const PER: Record<string, number> = {classic: 4.8, sheet: 4.6, beforeAfter: 5.6, phone: 5.6, deck: 4.8, terminal: 4.8, grid: 5, styles: 5.2, countdown: 4.8, combo: 3.8};
const SFX: Record<string, Partial<Card>> = {
	classic: {sfx: 'typing/typewriter-hit-soft.mp3', vol: 0.3, off: 0.5},
	phone: {sfx: 'notify/ding-101492.mp3', vol: 0.3},
	deck: {sfx: 'whoosh/whoosh-fast.mp3', vol: 0.22},
};
const LOOK: Record<string, React.FC<P>> = {classic: Classic, beforeAfter: BeforeAfter, phone: Phone, deck: Deck, terminal: Terminal, styles: Styles, countdown: Countdown, combo: Combo};

const build = (v: Video): {cards: Card[]; cover?: number} => {
	const {bpm} = beat(v.track);
	const nb = (sec: number) => Math.max(2, Math.round((sec * bpm) / 60 / 2) * 2);
	const sec = (beats: number) => (beats * 60) / bpm;
	const n = v.items.length;
	const per = nb(PER[v.look]);
	const sfx = SFX[v.look] ?? {};
	const item = (i: number): Card => {
		const s = {...sfx};
		if (v.look === 'phone') s.off = 0.3 + typeDur(v.items[i].prompt) + 0.25; // звук — на «надіслати»
		if (v.look === 'deck') s.off = sec(per) - 0.35; // звук — на виліт картки
		return {beats: per, ...s, el: (t, a, z) => {
			if (v.look === 'sheet') return <Sheet t={t} a={a} v={v} cur={i} />;
			if (v.look === 'grid') return <Grid t={t} a={a} v={v} cur={i} />;
			const Look = LOOK[v.look];
			return <Look t={t} a={a} z={z} i={i} n={n} it={v.items[i]} v={v} />;
		}};
	};
	const intro: Card = {beats: nb(3.2), el: (t, a) => <Intro t={t} a={a} v={v} />};
	const extra: Card[] = v.look === 'sheet' ? [{beats: nb(3.6), el: (t, a) => <Sheet t={t} a={a} v={v} cur={n} />}]
		: v.look === 'grid' ? [{beats: nb(3.2), el: (t, a) => <Grid t={t} a={a} v={v} cur={n} />}]
		: v.look === 'combo' ? [{beats: nb(7), sfx: 'impact/impact-movie-epic.mp3', vol: 0.3, el: (t, a) => <ComboResult t={t} a={a} v={v} />}] : [];
	const outro: Card = {beats: nb(5.5), sfx: 'impact/impact-movie-epic.mp3', vol: 0.3, off: 0.35, el: (t, a) => <Cta t={t} a={a} />};
	const cards = [intro, ...v.items.map((_, i) => item(i)), ...extra, outro];
	// шпаргалка: обкладинка = вся таблиця (її й зберігають), решта — постер-інтро
	const cover = v.look === 'sheet' ? sec(cards.slice(0, n + 1).reduce((s, c) => s + c.beats, 0)) + 1.5 : undefined;
	return {cards, cover};
};

const VIDEOS = TIPS.videos as Video[];
const BUILT = Object.fromEntries(VIDEOS.map((v) => [v.id, build(v)]));
export const TIPS_LIST = VIDEOS.map((v) => {
	const {cards, cover} = BUILT[v.id];
	const C: React.FC = () => <BeatVideo theme={v.theme} track={v.track} cards={cards} cover={cover} />;
	return {id: v.id, C, frames: beatFrames(v.track, cards)};
});
