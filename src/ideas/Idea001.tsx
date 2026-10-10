import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F, Sfx, Stage, Wordmark, brand, clamp, ramp} from '../dg/kit';
import {Caret} from '../dg/Code';
import {chunkEnd, chunkWords, Word} from './captions';
import WORDS from '../../public/ideas/idea-001/words.json';

// ID-001 «Покажи AI свою ціль»: YouTube 1920×1080, голос ElevenLabs. Сценарій: public/ideas/idea-001/scenario.md.
// Усі появи прив'язані до секунд слів голосу (words.json), тож при заміні голосу досить перегенерувати words.json і числа.
export const IDEA_001 = 3300; // 110 с
const W: Word[] = WORDS;
const DIR = 'ideas/idea-001';
const X = 96; // поле YouTube по X
const COLOR = {goal: C.lime, time: C.blue, result: '#FFC857'} as const;
type Hl = keyof typeof COLOR;

const S = (s: number) => Math.round(s * 30);
// видимість вікна [a, b] з м'якими краями
const io = (t: number, a: number, b: number, f = 0.35) => Math.min(ramp(t, a, a + f), 1 - ramp(t, b - f, b));
const pop = (t: number, at: number, len = 0.35) => ramp(t, at, at + len);

const Show: React.FC<{t: number; a: number; b: number; children: React.ReactNode; style?: React.CSSProperties; rise?: number}> = ({t, a, b, children, style, rise = 24}) => {
	if (t < a || t > b) return null;
	const o = io(t, a, b);
	return <AbsoluteFill style={{opacity: o, transform: `translateY(${(1 - ramp(t, a, a + 0.5)) * rise}px)`, ...style}}>{children}</AbsoluteFill>;
};

// ---------- стокова вставка: cover, повільний наїзд, затемнення ----------
const Stock: React.FC<{t: number; a: number; b: number; src: string; rate?: number; dim?: number; children?: React.ReactNode}> = ({t, a, b, src, rate = 1, dim = 0.45, children}) => {
	if (t < a - 0.1 || t > b + 0.1) return null;
	const k = (t - a) / (b - a);
	return (
		<AbsoluteFill style={{opacity: io(t, a, b, 0.25)}}>
			<Sequence from={S(a)} durationInFrames={S(b - a) + 3} layout="none">
				<AbsoluteFill style={{transform: `scale(${1 + k * 0.08})`}}>
					<OffthreadVideo src={staticFile(`${DIR}/stock/${src}`)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</AbsoluteFill>
			</Sequence>
			<AbsoluteFill style={{background: `linear-gradient(180deg, #080B0E${Math.round(dim * 200).toString(16)} 0%, #080B0E${Math.round(dim * 255).toString(16)} 100%)`}} />
			{children}
		</AbsoluteFill>
	);
};

// ---------- слова, що з'являються синхронно з голосом (посимвольно в межах слова) ----------
type Tok = {w: string; s: number; e: number; hl?: Hl};
const toks = (from: number, to: number, hl: [number, number, Hl][] = []): Tok[] =>
	W.slice(from, to + 1).map((x, i) => ({...x, w: x.w.replace(/[«»]/g, ''), hl: hl.find(([a, b]) => from + i >= a && from + i <= b)?.[2]}));

const Typed: React.FC<{t: number; items: Tok[]; caret?: boolean}> = ({t, items, caret = true}) => {
	const last = items.filter((x) => t >= x.s).length - 1;
	return (
		<>
			{items.map((x, i) => {
				if (t < x.s) return null;
				const n = Math.ceil(interpolate(t, [x.s, Math.max(x.s + 0.05, Math.min(x.e, x.s + 0.4))], [1, x.w.length], clamp));
				// фраза підсвічується цілком, коли дочитано її останнє слово; пробіл усередині фрази теж у підсвітці
				const col = x.hl ? COLOR[x.hl] : undefined;
				const first = !x.hl || items[i - 1]?.hl !== x.hl, inner = !!x.hl && items[i + 1]?.hl === x.hl;
				let g = i;
				while (x.hl && items[g + 1]?.hl === x.hl) g++;
				const p = x.hl ? pop(t, items[g].e, 0.3) : 0;
				const bg = col ? `${col}${Math.round(p * 0x30).toString(16).padStart(2, '0')}` : undefined;
				const r = `${first ? 8 : 0}px ${inner ? 0 : 8}px ${inner ? 0 : 8}px ${first ? 8 : 0}px`;
				return (
					<React.Fragment key={i}>
						<span style={{color: p > 0.5 ? col : undefined, background: bg, borderRadius: r, padding: col ? `0 ${inner ? 0 : 4}px 0 ${first ? 4 : 0}px` : undefined}}>
							{x.w.slice(0, n)}{inner && n === x.w.length ? ' ' : ''}
						</span>
						{caret && i === last ? <Caret frame={S(t)} /> : null}{inner && n === x.w.length ? '' : ' '}
					</React.Fragment>
				);
			})}
		</>
	);
};

// ---------- вікно «AI-чат» (нейтральне, без чужих логотипів) ----------
const Chat: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{position: 'absolute', left: X, top: 96, width: 1000, minHeight: 330, maxHeight: 770, background: '#0D1318F2', border: `1px solid ${C.line}`, borderRadius: 32, boxShadow: '0 50px 120px #000000B0, inset 0 1px 0 #ffffff14', overflow: 'hidden', ...style}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '22px 30px', borderBottom: `1px solid ${C.line}`}}>
			{['#FF6B5E', '#FFD27A', C.lime].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.85}} />)}
			<div style={{marginLeft: 16, fontFamily: F.mono, fontSize: 26, color: C.dim}}>AI-чат</div>
		</div>
		<div style={{padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 26}}>{children}</div>
	</div>
);
const UserMsg: React.FC<{children: React.ReactNode; o?: number}> = ({children, o = 1}) => (
	<div style={{alignSelf: 'flex-end', maxWidth: 820, opacity: o, padding: '22px 28px', borderRadius: '26px 26px 6px 26px', background: '#1B2530', border: `1px solid ${C.line}`, fontFamily: F.body, fontWeight: 600, fontSize: 38, lineHeight: 1.4}}>{children}</div>
);
const AiMsg: React.FC<{children: React.ReactNode; o?: number}> = ({children, o = 1}) => (
	<div style={{alignSelf: 'flex-start', display: 'flex', gap: 18, opacity: o, transform: `translateY(${(1 - o) * 20}px)`}}>
		<div style={{flex: 'none', width: 52, height: 52, borderRadius: 26, background: `radial-gradient(circle at 30% 30%, ${C.lime}, ${C.limeDeep})`, boxShadow: `0 0 30px ${C.lime}40`}} />
		<div style={{maxWidth: 820, fontFamily: F.body, fontSize: 38, lineHeight: 1.4}}>{children}</div>
	</div>
);

// права колонка
const RX = 1170, RW = 654;
const Right: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 150}) => (
	<div style={{position: 'absolute', left: RX, top, width: RW, display: 'flex', flexDirection: 'column', gap: 26}}>{children}</div>
);
const Kick: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.lime}) => (
	<div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', color}}>{children}</div>
);
const Big: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 76, style}) => (
	<div style={{fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 1.08, letterSpacing: -1.5, ...style}}>{children}</div>
);
const Chip: React.FC<{t: number; at: number; color: string; children: React.ReactNode; dim?: boolean}> = ({t, at, color, children, dim}) => {
	const p = pop(t, at, 0.4);
	if (p <= 0) return null;
	return (
		<div style={{alignSelf: 'flex-start', opacity: p, transform: `translateX(${(1 - p) * 60}px) scale(${0.9 + p * 0.1})`, padding: '16px 28px', borderRadius: 999,
			background: `${color}${dim ? '14' : '1F'}`, border: `2px solid ${color}`, color, fontFamily: F.body, fontWeight: 800, fontSize: 46}}>{children}</div>
	);
};
const L: React.FC<{c: string; children: React.ReactNode}> = ({c, children}) => <span style={{color: c}}>{children}</span>;

// ---------- субтитри ----------
const CHUNKS = chunkWords(W);
const Captions: React.FC<{t: number}> = ({t}) => {
	const i = CHUNKS.findIndex((c, k) => t >= c[0].s - 0.05 && t < chunkEnd(CHUNKS, k));
	if (i < 0) return null;
	const c = CHUNKS[i];
	const o = io(t, c[0].s - 0.05, chunkEnd(CHUNKS, i), 0.12);
	return (
		<div style={{position: 'absolute', left: X, right: X, bottom: 54, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div style={{padding: '12px 26px', borderRadius: 18, background: '#080B0ECC', fontFamily: F.body, fontWeight: 800, fontSize: 44, lineHeight: 1.25, textAlign: 'center', maxWidth: 1500}}>
				{c.map((w, k) => (
					<span key={k} style={{color: t >= w.s && t < (c[k + 1]?.s ?? w.e + 0.3) ? C.lime : t >= w.s ? C.text : '#F5F7F299'}}>{w.w}{k < c.length - 1 ? ' ' : ''}</span>
				))}
			</div>
		</div>
	);
};

// ---------- сцени ----------
const WEAK = toks(28, 33);
const STRONG = toks(88, 114, [[90, 92, 'time'], [93, 94, 'goal'], [97, 99, 'result'], [102, 105, 'result'], [108, 111, 'time']]);
const AFTER = toks(191, 208, [[192, 197, 'time'], [198, 199, 'goal'], [201, 203, 'result'], [205, 208, 'result']]);
const LIST: [string, number][] = [['Змінні', 26.9], ['Функції', 27.46], ['Масиви', 28.18], ["Об'єкти", 28.82], ['DOM', 29.66], ['Асинхронність', 29.94]];
const ROUTE: [string, number][] = [['Що вчити спочатку', 60.24], ['На чому не застрягати', 61.38], ['Як дійти до першого проєкту', 63.1]];

const ChatScenes: React.FC<{t: number}> = ({t}) => {
	const grey = 1 - ramp(t, 31.7, 32.4) * 0.6;
	return (
		<>
			{/* A: слабкий запит і загальна відповідь */}
			<Show t={t} a={10.4} b={37.7}>
				<Chat>
					<UserMsg>{t < 12.1 ? <Caret frame={S(t)} /> : <Typed t={t} items={WEAK} caret={t < 15} />}
						{t >= 15.5 ? <span style={{marginLeft: 10, fontSize: 40, color: t < 17.8 ? C.lime : C.red, opacity: pop(t, t < 17.8 ? 15.5 : 17.8)}}>{t < 17.8 ? '✓' : '?'}</span> : null}
					</UserMsg>
					{t >= 25.3 ? (
						<AiMsg o={pop(t, 25.3, 0.4)}>
							<div style={{fontWeight: 700, marginBottom: 12}}>Загальний план вивчення JavaScript:</div>
							<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px', opacity: grey}}>
								{LIST.map(([w, at]) => (
									<div key={w} style={{opacity: pop(t, at, 0.25), textDecoration: t > 32.4 ? 'line-through' : undefined, textDecorationColor: C.red}}>• {w}</div>
								))}
							</div>
						</AiMsg>
					) : null}
				</Chat>
			</Show>
			{/* B: сильний запит */}
			<Show t={t} a={37.8} b={51.1}>
				<Chat>
					<UserMsg>{t < 40.3 ? <Caret frame={S(t)} /> : <Typed t={t} items={STRONG} caret={t < 50.6} />}</UserMsg>
				</Chat>
			</Show>
			{/* C: відповідь-маршрут */}
			<Show t={t} a={53.5} b={66.3}>
				<Chat>
					<UserMsg o={0.55}><span style={{fontSize: 30}}><Typed t={99} items={STRONG} caret={false} /></span></UserMsg>
					<AiMsg o={pop(t, 54.0, 0.4)}>
						<div style={{fontWeight: 700}}>Ось маршрут на 8 тижнів, від бази до to-do-додатка:</div>
					</AiMsg>
					<div style={{marginLeft: 70, position: 'relative', display: 'flex', flexDirection: 'column', gap: 22}}>
						<div style={{position: 'absolute', left: 21, top: 22, width: 4, height: interpolate(t, [60.24, 63.6], [0, 150], clamp), background: C.lime, borderRadius: 2}} />
						{ROUTE.map(([label, at], i) => {
							const p = pop(t, at, 0.35);
							return (
								<div key={label} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
									<div style={{width: 46, height: 46, borderRadius: 23, background: C.lime, color: C.bg, display: 'grid', placeItems: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 24}}>{i + 1}</div>
									<div style={{fontFamily: F.body, fontWeight: 700, fontSize: 40}}>{label}</div>
								</div>
							);
						})}
					</div>
				</Chat>
			</Show>

			{/* права колонка */}
			<Show t={t} a={10.6} b={19.4}><Right top={260}><Kick>Крок 1</Kick><Big>Простий<br />запит</Big></Right></Show>
			<Show t={t} a={19.4} b={24.2}>
				<Right top={200}><Kick color={C.red}>Немає головного</Kick>
					<Chip t={t} at={19.58} color={C.text}>Навіщо?</Chip>
					<Chip t={t} at={20.64} color={C.text}>За який час?</Chip>
					<Chip t={t} at={21.76} color={C.text}>Який результат?</Chip>
				</Right>
			</Show>
			<Show t={t} a={24.3} b={31.7}><Right top={260}><Kick>Що робить AI?</Kick><Big>Дає<br /><L c={C.dim}>загальний</L><br />план</Big></Right></Show>
			<Show t={t} a={31.7} b={37.7}>
				<Right top={200}><Kick color={C.red}>Ніби правильно, але</Kick>
					<Chip t={t} at={32.71} color={C.red}>без пріоритетів</Chip>
					<Chip t={t} at={33.91} color={C.red}>без фокусу</Chip>
					<Chip t={t} at={34.65} color={C.red}>без маршруту</Chip>
				</Right>
			</Show>
			<Show t={t} a={37.9} b={51.1}>
				<Right top={180}><Kick>Сильніший варіант</Kick>
					<Chip t={t} at={40.9} color={COLOR.time}>ЧАС</Chip>
					<Chip t={t} at={41.9} color={COLOR.goal}>ЦІЛЬ</Chip>
					<Chip t={t} at={44.9} color={COLOR.result}>РЕЗУЛЬТАТ</Chip>
				</Right>
			</Show>
			<Show t={t} a={56.6} b={66.3}>
				<Right top={240}><Kick>AI бачить</Kick><Big>не тему,<br />а <L c={C.lime}>конкретну<br />ціль</L></Big>
					<div style={{opacity: pop(t, 58.6), fontFamily: F.body, fontWeight: 600, fontSize: 40, color: C.dim}}>→ відповідь практичніша</div>
				</Right>
			</Show>
		</>
	);
};

const FORMULA: [string, string, Hl, number, number][] = [
	['ЦІЛЬ', 'що хочу зробити', 'goal', 70.52, 74.66],
	['ЧАС', 'за який період', 'time', 71.78, 76.22],
	['РЕЗУЛЬТАТ', 'проєкт або навичка', 'result', 73.01, 77.19],
];
const Formula: React.FC<{t: number}> = ({t}) => (
	<Show t={t} a={66.4} b={80.4}>
		<div style={{position: 'absolute', left: X, right: X, top: 120, textAlign: 'center'}}>
			<Kick>Практична дія</Kick>
			<Big size={88} style={{marginTop: 18, opacity: pop(t, 67.9)}}>Додавай у запит <L c={C.lime}>три речі</L></Big>
		</div>
		<div style={{position: 'absolute', left: X, right: X, top: 430, display: 'flex', gap: 40, justifyContent: 'center'}}>
			{FORMULA.map(([title, sub, hl, at, subAt], i) => {
				const p = pop(t, at, 0.45);
				const col = COLOR[hl];
				return (
					<div key={title} style={{width: 520, height: 350, borderRadius: 32, padding: '40px 40px', background: `${col}12`, border: `2px solid ${col}`, opacity: p,
						transform: `translateY(${(1 - p) * 80}px) scale(${0.85 + p * 0.15})`, boxShadow: `0 40px 100px ${col}22`}}>
						<div style={{fontFamily: F.mono, fontSize: 30, color: col}}>{i + 1}</div>
						<div style={{fontFamily: F.display, fontWeight: 900, fontSize: title.length > 5 ? 54 : 96, color: col, marginTop: 14, letterSpacing: -2}}>{title}</div>
						<div style={{fontFamily: F.body, fontWeight: 600, fontSize: 40, color: C.text, marginTop: 22, opacity: pop(t, subAt)}}>{sub}</div>
					</div>
				);
			})}
		</div>
	</Show>
);

const BeforeAfter: React.FC<{t: number}> = ({t}) => {
	const strike = ramp(t, 83.5, 84.1);
	return (
		<Show t={t} a={80.6} b={91.4}>
			<div style={{position: 'absolute', left: X, top: 120}}><Kick>Наприклад</Kick></div>
			<div style={{position: 'absolute', left: X, top: 210, width: 640, padding: '40px 44px', borderRadius: 32, background: C.panel, border: `1px solid ${C.line}`, opacity: 1 - strike * 0.45}}>
				<Kick color={C.dim}>Замість</Kick>
				<div style={{marginTop: 24, fontFamily: F.body, fontWeight: 700, fontSize: 52, lineHeight: 1.25}}>
					{/* закреслення по кожному рядку: фон-лінія, що росте зліва */}
					<span style={{backgroundImage: `linear-gradient(${C.red}, ${C.red})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 58%', backgroundSize: `${strike * 100}% 6px`, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
						Хочу вивчити JavaScript
					</span>
				</div>
			</div>
			<div style={{position: 'absolute', left: 820, top: 210, fontFamily: F.display, fontWeight: 900, fontSize: 90, color: C.lime, opacity: pop(t, 83.6)}}>→</div>
			<div style={{position: 'absolute', left: 960, right: X, top: 210, padding: '40px 44px', borderRadius: 32, background: '#C3FF550D', border: `2px solid ${C.lime}`, opacity: pop(t, 83.6, 0.4)}}>
				<Kick>Краще</Kick>
				<div style={{marginTop: 24, fontFamily: F.body, fontWeight: 700, fontSize: 46, lineHeight: 1.4}}>
					<Typed t={t} items={AFTER} caret={t < 91} />
				</div>
			</div>
		</Show>
	);
};

const Cta: React.FC<{t: number}> = ({t}) => {
	const word = pop(t, 98.68, 0.5);
	return (
		<Show t={t} a={96.0} b={103.5}>
			<div style={{position: 'absolute', left: X, right: X, top: 110, textAlign: 'center'}}>
				<Kick>Хочеш так само?</Kick>
				<div style={{marginTop: 30, fontFamily: F.body, fontWeight: 600, fontSize: 56, opacity: pop(t, 98.4)}}>Напиши</div>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, lineHeight: 1.05, color: C.lime, opacity: word, transform: `scale(${1.4 - word * 0.4})`,
					filter: `blur(${(1 - word) * 14}px)`, textShadow: `0 0 120px ${C.lime}70`}}>«ЦІЛЬ»</div>
				<div style={{marginTop: 16, fontFamily: F.body, fontWeight: 600, fontSize: 48, color: C.dim, opacity: pop(t, 99.7)}}>і отримай шаблон запиту для свого плану навчання</div>
				<div style={{marginTop: 40, display: 'inline-flex', gap: 16, alignItems: 'center', padding: '20px 36px', borderRadius: 999, border: `2px solid ${C.lime}`, fontFamily: F.mono, fontSize: 46, opacity: pop(t, 100.6)}}>
					<span style={{color: C.lime}}>✈</span> t.me/hukvadim
				</div>
			</div>
		</Show>
	);
};

const EndCard: React.FC<{t: number}> = ({t}) => {
	const a = 103.4;
	return (
		<Show t={t} a={a} b={110.2}>
			<div style={{position: 'absolute', left: X, right: X, top: 170, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
				<div style={{transform: `scale(${interpolate(pop(t, a, 0.5), [0, 1], [1.5, 1])})`, filter: `blur(${(1 - pop(t, a, 0.5)) * 12}px)`}}><Wordmark size={150} /></div>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 64, opacity: pop(t, a + 0.7)}}>Від ідеї — <L c={C.lime}>до власного проєкту.</L></div>
				<div style={{display: 'flex', gap: 30, alignItems: 'center', opacity: pop(t, a + 1.4)}}>
					<div style={{padding: '26px 44px', borderRadius: 999, background: C.lime, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 44, boxShadow: `0 30px 80px ${C.lime}40`}}>Програма навчання →</div>
					<div style={{fontFamily: F.mono, fontSize: 46}}>{brand.learningUrl.replace('https://', '')}</div>
				</div>
			</div>
		</Show>
	);
};

// ---------- звук ----------
const SFX: [number, string, number, number?][] = [
	[0, 'whoosh-swirl.mp3', 0.35], [9.4, 'soft-pop.wav', 0.5],
	[12.1, 'typewriter-digital.mp3', 0.18, 2.8],
	[19.58, 'switch-tap.mp3', 0.45], [20.64, 'switch-tap.mp3', 0.45], [21.76, 'switch-tap.mp3', 0.45],
	...LIST.map(([, at]): [number, string, number] => [at, 'soft-pop.wav', 0.25]),
	[32.71, 'bass-hit-futuristic.mp3', 0.4], [37.8, 'transition-snap.mp3', 0.35],
	[40.3, 'typewriter-digital.mp3', 0.15, 10.2],
	[50.75, 'shimmer-sparkle-sweep.mp3', 0.35], [53.4, 'whoosh-fast.mp3', 0.3],
	...ROUTE.map(([, at]): [number, string, number] => [at, 'soft-pop.wav', 0.35]),
	[66.3, 'transition-snap.mp3', 0.35], [70.45, 'impact-cine-big.mp3', 0.45], [71.7, 'soft-pop.wav', 0.5], [72.95, 'soft-pop.wav', 0.5],
	[80.5, 'whoosh-fast.mp3', 0.3], [83.5, 'whoosh-fast.mp3', 0.35],
	[91.3, 'warp-slide.mp3', 0.35], [95.9, 'whoosh-swirl.mp3', 0.3], [98.6, 'lock-digital.mp3', 0.45],
	[103.4, 'impact-movie-epic.mp3', 0.45],
];
const VOICE_END = 106.9;
const Sound: React.FC = () => (
	<>
		<Audio src={staticFile(`${DIR}/voice.mp3`)} />
		<Audio
			src={staticFile(`${DIR}/music/hazy-after-hours.mp3`)}
			volume={(f) => interpolate(f, [0, 30, S(VOICE_END), S(VOICE_END + 0.5), S(108.2), S(110)], [0, 0.085, 0.085, 0.2, 0.2, 0], clamp)}
		/>
		{SFX.map(([at, src, vol, dur], i) => <Sfx key={i} at={S(at)} src={src} vol={vol} dur={dur ? S(dur) : 90} />)}
	</>
);

export const Idea001: React.FC = () => {
	const t = useCurrentFrame() / 30;
	return (
		<Stage glow={[1300, 260]} grid>
			<Sound />
			{/* 1. хук */}
			<Stock t={t} a={0} b={4.05} src="frustrated.mp4" dim={0.55}>
				<div style={{position: 'absolute', left: X, right: X, top: 330, textAlign: 'center', opacity: pop(t, 0.3, 0.5), transform: `translateY(${(1 - pop(t, 0.3, 0.6)) * 40}px)`}}>
					<Big size={104}>Чому AI відповідає<br /><L c={C.lime}>загально?</L></Big>
				</div>
			</Stock>
			{/* 2. розмитий запит → ціль */}
			<Show t={t} a={4.0} b={10.45}>
				<div style={{position: 'absolute', left: X, right: X, top: 250, textAlign: 'center'}}>
					<Big size={96} style={{filter: `blur(${interpolate(t, [4.7, 5.6, 6.6, 7.2], [0, 10, 10, 0], clamp)}px)`, opacity: 1 - ramp(t, 6.6, 7.2)}}>Бо запит <L c={C.dim}>розмитий</L></Big>
				</div>
				<div style={{position: 'absolute', left: X, right: X, top: 250, textAlign: 'center', opacity: ramp(t, 6.8, 7.3)}}>
					<Big size={96}>Покажи йому свою</Big>
					<Big size={180} style={{color: C.lime, marginTop: 10, opacity: pop(t, 9.4, 0.3), transform: `scale(${1.3 - pop(t, 9.4, 0.4) * 0.3})`, textShadow: `0 0 120px ${C.lime}60`}}>ціль</Big>
				</div>
			</Show>
			<ChatScenes t={t} />
			{/* 8. зовсім інша розмова */}
			<Stock t={t} a={50.9} b={53.6} src="code-screen.mp4" dim={0.5}>
				<div style={{position: 'absolute', left: X, right: X, top: 380, textAlign: 'center', opacity: pop(t, 51.0, 0.4)}}><Big size={110}>Зовсім <L c={C.lime}>інша розмова</L></Big></div>
			</Stock>
			<Formula t={t} />
			<BeforeAfter t={t} />
			{/* 12. персональний маршрут */}
			<Stock t={t} a={91.45} b={95.6} src="laptop-typing.mp4" rate={0.7} dim={0.6}>
				<div style={{position: 'absolute', left: X, right: X, top: 300, textAlign: 'center'}}>
					<Big size={80} style={{color: C.dim, position: 'relative', display: 'inline-block', opacity: pop(t, 92.4)}}>
						абстрактна теорія
						<div style={{position: 'absolute', left: 0, top: '52%', height: 8, width: `${ramp(t, 93.3, 93.8) * 100}%`, background: C.red, borderRadius: 4}} />
					</Big>
					<Big size={110} style={{marginTop: 24, color: C.lime, opacity: pop(t, 93.8, 0.4)}}>персональний маршрут</Big>
				</div>
			</Stock>
			<Cta t={t} />
			<EndCard t={t} />
			<Captions t={t} />
		</Stage>
	);
};

// Обкладинка YouTube (рендерити стіллом, 1920×1080 → можна зменшити до 1280×720)
export const Idea001Thumb: React.FC = () => (
	<Stage glow={[1400, 200]} grid>
		<div style={{position: 'absolute', left: X, top: 110, width: 1100}}>
			<Big size={118}>AI дає<br /><L c={C.dim}>загальні</L><br />відповіді?</Big>
			<div style={{marginTop: 40, fontFamily: F.body, fontWeight: 700, fontSize: 52, color: C.text}}>Додай у запит <L c={C.lime}>3 речі</L></div>
		</div>
		<div style={{position: 'absolute', right: X, top: 150, display: 'flex', flexDirection: 'column', gap: 28}}>
			{FORMULA.map(([title, , hl]) => (
				<div key={title} style={{padding: '26px 52px', borderRadius: 28, border: `3px solid ${COLOR[hl]}`, background: `${COLOR[hl]}18`, color: COLOR[hl], fontFamily: F.display, fontWeight: 900, fontSize: 84, textAlign: 'center'}}>{title}</div>
			))}
		</div>
		<div style={{position: 'absolute', left: X, bottom: 70}}><Wordmark size={64} /></div>
	</Stage>
);
