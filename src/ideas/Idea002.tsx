import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, Sfx, Stage, Wordmark, brand, clamp, ramp} from '../system/kit';
import {Caret} from '../system/Code';
import {chunkEnd, chunkWords, Word} from '../system/captions';
import {Big, L, S, Show, Strike, io, pop, typed} from '../system/step';
import WORDS from '../../public/ideas/idea-002/words.json';

// ID-002 «Не бійся першого запитання до AI»: YouTube 1920×1080 з голосу (58 с) + end card.
// Сценарій: public/ideas/idea-002/scenario.md. Усі появи — у секундах голосу (words.json); t = секунда голосу.
export const IDEA_002 = 1875; // 62.5 с
const W: Word[] = WORDS;
const DIR = 'ideas/idea-002';
const X = 96;
const VOICE_END = 57.97;
const TOTAL = 62.5;

const useV = () => {
	const {width, height} = useVideoConfig();
	return height > width; // вертикаль 1080×1920: safe x 84..940, y 180..1650
};
// секунда голосу → секунда ролика (стокові вставки в шорті); у повному відео — тотожність
const ToOut = React.createContext((src: number) => src);
const Pad: React.FC<{top: number; vTop?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({top, vTop, children, style}) => {
	const v = useV();
	return <div style={{position: 'absolute', left: v ? 84 : X, right: v ? 140 : X, top: v ? vTop ?? top : top, textAlign: 'center', ...style}}>{children}</div>;
};
const Stock: React.FC<{t: number; a: number; b: number; src: string; rate?: number; dim?: number; pos?: string; children?: React.ReactNode}> = ({t, a, b, src, rate = 1, dim = 0.5, pos = '50% 50%', children}) => {
	const toOut = React.useContext(ToOut);
	if (t < a - 0.1 || t > b + 0.1) return null;
	const k = (t - a) / (b - a);
	return (
		<AbsoluteFill style={{opacity: io(t, a, b, 0.25)}}>
			<Sequence from={S(toOut(a))} durationInFrames={S(b - a) + 3} layout="none">
				<AbsoluteFill style={{transform: `scale(${1 + k * 0.08})`}}>
					<OffthreadVideo src={staticFile(`${DIR}/stock/${src}`)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
				</AbsoluteFill>
			</Sequence>
			<AbsoluteFill style={{background: `linear-gradient(180deg, #080B0E${Math.round(dim * 200).toString(16).padStart(2, '0')} 0%, #080B0E${Math.round(dim * 255).toString(16).padStart(2, '0')} 100%)`}} />
			{children}
		</AbsoluteFill>
	);
};

// ---------- нейтральне вікно чату (без чужих логотипів) ----------
const ChatWin: React.FC<{left: number; top: number; width: number; vTop?: number; children: React.ReactNode}> = ({left, top, width, vTop = 700, children}) => {
	const v = useV();
	return (
	<div style={{position: 'absolute', left: v ? 84 : left, top: v ? vTop : top, width: v ? 912 : width, background: '#0D1318F2', border: `1px solid ${C.line}`, borderRadius: 32, boxShadow: '0 50px 120px #000000B0, inset 0 1px 0 #ffffff14', overflow: 'hidden'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '22px 30px', borderBottom: `1px solid ${C.line}`}}>
			{['#FF6B5E', '#FFD27A', C.lime].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.85}} />)}
			<div style={{marginLeft: 16, fontFamily: F.mono, fontSize: 26, color: C.dim}}>Чат</div>
		</div>
		<div style={{padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 24}}>{children}</div>
	</div>
	);
};
const Field: React.FC<{text: string; t: number; hint?: string}> = ({text, t, hint}) => (
	<div style={{display: 'flex', alignItems: 'center', padding: '24px 30px', borderRadius: 999, background: '#1B2530', border: `2px solid ${text ? C.lime : C.line}`, fontFamily: F.body, fontWeight: 600, fontSize: 40, minHeight: 64}}>
		{text || !hint ? <span>{text}</span> : <span style={{color: C.dim}}>{hint}</span>}
		<Caret frame={S(t)} />
	</div>
);
const User: React.FC<{children: React.ReactNode; o?: number}> = ({children, o = 1}) => (
	<div style={{alignSelf: 'flex-end', maxWidth: 900, opacity: o, padding: '22px 28px', borderRadius: '26px 26px 6px 26px', background: '#1B2530', border: `1px solid ${C.line}`, fontFamily: F.body, fontWeight: 600, fontSize: 44, lineHeight: 1.35}}>{children}</div>
);
const Reply: React.FC<{o: number}> = ({o}) => (
	<div style={{alignSelf: 'flex-start', display: 'flex', gap: 18, opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
		<div style={{flex: 'none', width: 52, height: 52, borderRadius: 26, background: `radial-gradient(circle at 30% 30%, ${C.lime}, ${C.limeDeep})`}} />
		<div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10}}>
			{[620, 520, 340].map((w) => <div key={w} style={{width: w, height: 16, borderRadius: 8, background: '#FFFFFF22'}} />)}
		</div>
	</div>
);

// ---------- 3–4. бульбашки страху → «це просто інструмент» ----------
const Fears: React.FC<{t: number}> = ({t}) => {
	const v = useV();
	const kill = ramp(t, 14.2, 14.8);
	const fade = 1 - ramp(t, 15.4, 16.2) * 0.8;
	const bubble = (txt: string, at: number, left: number, top: number) => {
		const p = pop(t, at, 0.45);
		return (
			<div style={{position: 'absolute', left, top, opacity: p * fade, transform: `scale(${0.85 + p * 0.15}) translateY(${(1 - p) * 30}px)`, padding: '26px 40px', borderRadius: 48, background: '#1B2530', border: `2px solid ${C.line}`, fontFamily: F.body, fontWeight: 700, fontSize: v ? 46 : 56}}>
				<Strike p={kill}>{txt}</Strike>
			</div>
		);
	};
	return (
		<>
			{v ? bubble('А що він про мене подумає?', 10.2, 84, 300) : bubble('А що він про мене подумає?', 10.2, 150, 150)}
			{v ? bubble('А раптом я запитаю дурницю?', 11.6, 100, 520) : bubble('А раптом я запитаю дурницю?', 11.6, 640, 340)}
			<Pad top={560} vTop={820} style={{opacity: pop(t, 16.2, 0.4), transform: `translateY(${(1 - pop(t, 16.2, 0.5)) * 30}px)`}}>
				<Big size={v ? 112 : 124}>Це просто <L>інструмент</L></Big>
			</Pad>
			<Pad top={780} vTop={1130} style={{opacity: pop(t, 17.9, 0.4)}}>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: v ? 56 : 64}}>Він тут, щоб <L>допомагати</L></div>
			</Pad>
		</>
	);
};

// ---------- 5. телефон і ноутбук ----------
const Devices: React.FC<{t: number}> = ({t}) => {
	const v = useV();
	const dy = v ? 250 : 0;
	const lx = v ? 380 : 800, lw = v ? 540 : 700;
	const sk = (w: number, c = '#FFFFFF22') => <div style={{width: w, height: 14, borderRadius: 7, background: c}} />;
	const phone = pop(t, 21.6, 0.5), lap = pop(t, 23.0, 0.5);
	return (
		<>
			<Pad top={110} vTop={280} style={{opacity: pop(t, 21.0, 0.4)}}>
				<span style={{display: 'inline-block', padding: '16px 40px', borderRadius: 999, background: `${C.lime}1F`, border: `2px solid ${C.lime}`, color: C.lime, fontFamily: F.body, fontWeight: 800, fontSize: 56}}>ChatGPT</span>
			</Pad>
			<div style={{position: 'absolute', left: v ? 84 : 430, top: 250 + dy, width: 270, height: 500, borderRadius: 48, background: '#0D1318', border: `3px solid ${C.line}`, padding: 30, display: 'flex', flexDirection: 'column', gap: 18, opacity: phone, transform: `translateY(${(1 - phone) * 60}px)`}}>
				<div style={{alignSelf: 'center', width: 90, height: 12, borderRadius: 6, background: '#FFFFFF33', marginBottom: 20}} />
				<div style={{alignSelf: 'flex-end', padding: 14, borderRadius: 20, background: '#1B2530', display: 'flex', flexDirection: 'column', gap: 10}}>{sk(120)}{sk(80)}</div>
				<div style={{display: 'flex', gap: 12}}><div style={{flex: 'none', width: 34, height: 34, borderRadius: 17, background: C.lime}} /><div style={{display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6}}>{sk(150)}{sk(120)}{sk(70)}</div></div>
			</div>
			<div style={{position: 'absolute', left: lx, top: 330 + dy, width: lw, opacity: lap, transform: `translateY(${(1 - lap) * 60}px)`}}>
				<div style={{height: v ? 380 : 430, borderRadius: 26, background: '#0D1318', border: `3px solid ${C.line}`, padding: 40, display: 'flex', flexDirection: 'column', gap: 24}}>
					<div style={{alignSelf: 'flex-end', padding: 20, borderRadius: 24, background: '#1B2530', display: 'flex', flexDirection: 'column', gap: 12}}>{sk(v ? 180 : 260)}{sk(v ? 130 : 180)}</div>
					<div style={{display: 'flex', gap: 18}}><div style={{flex: 'none', width: 48, height: 48, borderRadius: 24, background: C.lime}} /><div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8}}>{sk(v ? 240 : 400)}{sk(v ? 200 : 340)}{sk(v ? 140 : 220)}</div></div>
				</div>
				<div style={{height: 22, margin: '0 -50px', borderRadius: '0 0 30px 30px', background: '#1B2530', border: `2px solid ${C.line}`}} />
			</div>
			<Pad top={830} vTop={1200} style={{opacity: pop(t, 24.4, 0.4)}}>
				<Big size={88}>просто <L>почни</L></Big>
			</Pad>
		</>
	);
};

// ---------- 6. п'ять запитів ----------
const PROMPTS: [string, number, number][] = [
	['Яка завтра погода?', 26.8, 28.4],
	['Придумай вечерю з того, що є вдома', 28.5, 32.1],
	['Допоможи написати повідомлення', 32.2, 33.9],
	['Поясни складне простими словами', 34.0, 37.0],
	['Мене це турбує. Що порадиш?', 37.1, 41.2],
];
const Prompts: React.FC<{t: number}> = ({t}) => {
	const i = Math.max(0, PROMPTS.findIndex(([, a, b]) => t >= a && t < b + 0.05));
	const [txt, a, b] = PROMPTS[i];
	const done = pop(t, a + 1.3, 0.4);
	return (
		<>
			<ChatWin left={380} top={280} width={1160}>
				<User>{typed(txt, t, a, a + Math.min(1.2, b - a - 0.3))}<Caret frame={S(t)} /></User>
				<Reply o={done} />
			</ChatWin>
			<div style={{position: 'absolute', left: 380, top: 200, fontFamily: F.mono, fontSize: 30, letterSpacing: 4, color: C.lime}}>{i + 1} / {PROMPTS.length}</div>
		</>
	);
};

// ---------- 7. без команд ----------
const NoRules: React.FC<{t: number}> = ({t}) => (
	<>
		<Pad top={220}><Big size={96}>Не потрібно знати</Big></Pad>
		<Pad top={420} style={{opacity: pop(t, 41.9, 0.4)}}><Big size={104} style={{fontWeight: 800}}><Strike p={ramp(t, 42.7, 43.2)}>спеціальних команд</Strike></Big></Pad>
		<Pad top={590} style={{opacity: pop(t, 44.0, 0.4)}}><Big size={104} style={{fontWeight: 800}}><Strike p={ramp(t, 44.8, 45.3)}>ідеальних запитів</Strike></Big></Pad>
	</>
);

// ---------- 9. перше завдання ----------
const FIRST = 'Привіт! Чим ти можеш мені допомогти?';
const First: React.FC<{t: number}> = ({t}) => {
	const v = useV();
	const sent = t >= 57.8;
	const flash = 1 - ramp(t, 57.8, 58.2);
	return (
		<>
			<Pad top={120} vTop={300}><Big size={v ? 100 : 96}>Твоє{v ? <br /> : ' '}<L>перше завдання</L></Big></Pad>
			<ChatWin left={330} top={440} width={1260} vTop={760}>
				{sent ? <User>{FIRST}</User> : <div style={{height: 0}} />}
				<Field text={sent ? '' : typed(FIRST, t, 55.0, 57.4)} t={t} hint="Напиши щось…" />
			</ChatWin>
			<AbsoluteFill style={{boxShadow: `inset 0 0 0 ${flash * 14}px ${C.lime}`, opacity: sent ? 1 : 0}} />
		</>
	);
};

// ---------- 10. end card 16:9 ----------
const End: React.FC<{t: number}> = ({t}) => {
	const v = useV();
	const a = 58.0;
	return (
		<Show t={t} a={a} b={TOTAL + 1}>
			<Pad top={170} vTop={420} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44}}>
				<div style={{transform: `scale(${interpolate(pop(t, a, 0.5), [0, 1], [1.5, 1])})`, filter: `blur(${(1 - pop(t, a, 0.5)) * 12}px)`}}><Wordmark size={150} /></div>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: v ? 56 : 64, opacity: pop(t, a + 0.7)}}>Від ідеї — <L>до власного проєкту.</L></div>
				<div style={{display: 'flex', flexDirection: v ? 'column' : 'row', gap: v ? 36 : 30, alignItems: 'center', opacity: pop(t, a + 1.4)}}>
					<div style={{padding: '26px 44px', borderRadius: 999, background: C.lime, color: C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 44, boxShadow: `0 30px 80px ${C.lime}40`}}>Програма навчання →</div>
					<div style={{fontFamily: F.mono, fontSize: 46}}>{brand.learningUrl.replace('https://', '')}</div>
				</div>
			</Pad>
		</Show>
	);
};

const Captions: React.FC<{t: number; chunks: Word[][]}> = ({t, chunks}) => {
	const v = useV();
	const i = chunks.findIndex((c, k) => t >= c[0].s - 0.05 && t < chunkEnd(chunks, k));
	if (i < 0) return null;
	const c = chunks[i];
	const o = io(t, c[0].s - 0.05, chunkEnd(chunks, i), 0.12);
	return (
		<div style={{position: 'absolute', left: v ? 84 : X, right: v ? 140 : X, bottom: v ? 290 : 54, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div style={{padding: '12px 26px', borderRadius: 18, background: '#080B0ECC', fontFamily: F.body, fontWeight: 800, fontSize: v ? 50 : 44, lineHeight: 1.25, textAlign: 'center', maxWidth: v ? 856 : 1500}}>
				{c.map((w, k) => (
					<span key={k} style={{color: t >= w.s && t < (c[k + 1]?.s ?? w.e + 0.3) ? C.lime : t >= w.s ? C.text : '#F5F7F299'}}>{w.w}{k < c.length - 1 ? ' ' : ''}</span>
				))}
			</div>
		</div>
	);
};

const Scenes: React.FC<{t: number}> = ({t}) => {
	const v = useV();
	return (
	<>
		{/* 1. хук */}
		<Stock t={t} a={0} b={5.9} src="frustrated.mp4" dim={0.55} pos="38% 50%">
			<Pad top={300} vTop={420} style={{opacity: pop(t, 0.3, 0.5), transform: `translateY(${(1 - pop(t, 0.3, 0.6)) * 40}px)`}}>
				<Big size={v ? 100 : 110}>Найбільша{v ? <br /> : ' '}помилка<br />з <L>AI</L></Big>
			</Pad>
		</Stock>
		{/* 2. «як правильно запитати» */}
		<Show t={t} a={6.1} b={10.1}>
			<Pad top={110} vTop={400}><Big size={v ? 72 : 80}>думати, як{v ? <br /> : ' '}<L>правильно</L></Big></Pad>
			<ChatWin left={380} top={380} width={1160}>
				<div style={{height: 40}} />
				<Field text={typed('Як правильно запитати?…', t, 7.4, 8.7).slice(0, Math.round(interpolate(t, [9.2, 9.9], [100, 0], clamp)))} t={t} />
			</ChatWin>
		</Show>
		{/* 3–4. страх → інструмент */}
		<Show t={t} a={10.2} b={20.3}><Fears t={t} /></Show>
		{/* 5. пристрої */}
		<Show t={t} a={20.8} b={26.7}><Devices t={t} /></Show>
		{/* 6. запити */}
		<Show t={t} a={26.6} b={41.3}><Prompts t={t} /></Show>
		{/* 7. без команд */}
		<Show t={t} a={41.4} b={45.8}><NoRules t={t} /></Show>
		{/* 8. помічник */}
		<Stock t={t} a={45.9} b={51.7} src="laptop-typing.mp4" rate={0.7} dim={0.6} pos="62% 50%">
			<Pad top={270} style={{opacity: pop(t, 46.9, 0.4)}}><Big size={104}>розумний <L>помічник</L></Big></Pad>
			<Pad top={470} style={{opacity: pop(t, 49.9, 0.4)}}><Big size={84}>будь-які <L>запитання</L></Big></Pad>
		</Stock>
		{/* 9. перше завдання */}
		<Show t={t} a={51.8} b={58.3}><First t={t} /></Show>
		{/* 10. end card */}
		<End t={t} />
	</>
	);
};

const SFX: [number, string, number, number?][] = [
	[0, 'whoosh-swirl.mp3', 0.35],
	[7.4, 'typewriter-hit-soft.mp3', 0.25], [10.2, 'soft-pop.wav', 0.4], [11.6, 'soft-pop.wav', 0.4],
	[14.2, 'switch-tap.mp3', 0.4], [16.9, 'shimmer-sparkle-sweep.mp3', 0.3],
	[21.6, 'soft-pop.wav', 0.4], [23.0, 'soft-pop.wav', 0.4], [24.6, 'lock-digital.mp3', 0.35],
	...PROMPTS.map(([, a]): [number, string, number] => [a, 'typewriter-hit-soft.mp3', 0.22]),
	[42.7, 'switch-tap.mp3', 0.4], [44.8, 'switch-tap.mp3', 0.4],
	[45.9, 'warp-slide.mp3', 0.2], [55.0, 'typewriter-hit-soft.mp3', 0.25], [57.8, 'soft-pop.wav', 0.5],
	[58.1, 'impact-movie-epic.mp3', 0.45],
];
const MUSIC = `${DIR}/music/hazy-after-hours.mp3`;
const musicVol = (f: number, end = VOICE_END, total = TOTAL) => interpolate(f, [0, 30, S(end), S(end) + 15, S(total - 1.5), S(total)], [0, 0.085, 0.085, 0.2, 0.2, 0], clamp);

const CHUNKS = chunkWords(W);
export const Idea002: React.FC = () => {
	const t = useCurrentFrame() / 30;
	return (
		<Stage glow={[1300, 260]} grid>
			<Audio src={staticFile(`${DIR}/voice.mp3`)} />
			<Audio src={staticFile(MUSIC)} volume={musicVol} />
			{SFX.map(([at, src, vol, dur], i) => <Sfx key={i} at={S(at)} src={src} vol={vol} dur={dur ? S(dur) : 90} />)}
			<Scenes t={t} />
			{t < VOICE_END + 0.5 ? <Captions t={t} chunks={CHUNKS} /> : null}
		</Stage>
	);
};

// Обкладинка YouTube (стілл 1920×1080 → 1280×720)
export const Idea002Thumb: React.FC = () => (
	<Stage glow={[1400, 200]} grid>
		<div style={{position: 'absolute', left: X, top: 150, width: 1500}}>
			<Big size={150}>Не <L>бійся</L><br />питати AI</Big>
		</div>
		<div style={{position: 'absolute', left: X, right: X, top: 640}}>
			<div style={{display: 'inline-block', padding: '34px 54px', borderRadius: 999, background: '#1B2530', border: `3px solid ${C.lime}`, fontFamily: F.body, fontWeight: 700, fontSize: 64}}>{FIRST}</div>
		</div>
		<div style={{position: 'absolute', left: X, bottom: 70}}><Wordmark size={64} /></div>
	</Stage>
);

// ---------- шорт 1080×1920 (Shorts / Reels): ті самі сцени, шматки голосу [від, до] ----------
type Seg = [number, number];
const SHORT: Seg[] = [[0, 26.5], [51.8, VOICE_END]]; // хук → страх → «це інструмент» → пристрої → «перше завдання»
const GAP = 0.1; // пауза між шматками
const TAIL = 4.5; // end card після голосу
const plan = (() => {
	let o = 0;
	const m = SHORT.map(([a, b]) => {
		const r = {a, b, o};
		o += b - a + GAP;
		return r;
	});
	return {m, total: o - GAP + TAIL};
})();
export const SHORT_FRAMES = S(plan.total);

export const Idea002Short: React.FC = () => {
	const frame = useCurrentFrame();
	const f = frame === 0 ? 36 : frame; // кадр 0 = обкладинка Instagram: титул хука вже проявлений (1.2 с)
	const {m, total} = plan;
	const tOut = f / 30;
	const last = m[m.length - 1];
	const seg = m.find((x) => tOut < x.o + (x.b - x.a) + GAP) ?? last;
	// секунда голосу; між шматками тримає кінець попереднього, після голосу тече далі (end card на t ≥ 58)
	const t = seg === last ? last.a + Math.max(0, tOut - last.o) : Math.min(seg.a + Math.max(0, tOut - seg.o), seg.b);
	const toOut = (src: number) => {
		const x = m.find((q) => src <= q.b) ?? last;
		return x.o + Math.max(0, src - x.a);
	};
	const inSeg = (src: number) => m.some((x) => src >= x.a && src < x.b) || src >= VOICE_END;
	const words = W.filter((w) => m.some((x) => w.s >= x.a && w.s < x.b)).map((w) => {
		const x = m.find((q) => w.s < q.b)!;
		return {...w, s: toOut(w.s), e: toOut(Math.min(w.e, x.b))};
	});
	const chunks = chunkWords(words);
	const voiceEnd = toOut(VOICE_END);
	return (
		<ToOut.Provider value={toOut}>
			<Stage glow={[760, 420]} grid>
				{m.map((x, i) => (
					<Sequence key={i} from={S(x.o)} durationInFrames={S(x.b - x.a)} layout="none">
						<Audio src={staticFile(`${DIR}/voice.mp3`)} trimBefore={S(x.a)} volume={(q) => interpolate(q, [0, 3, S(x.b - x.a) - 3, S(x.b - x.a)], [0, 1, 1, 0], clamp)} />
					</Sequence>
				))}
				<Audio src={staticFile(MUSIC)} volume={(q) => musicVol(q, voiceEnd, total)} />
				{SFX.filter(([at]) => inSeg(at)).map(([at, src, vol, dur], i) => <Sfx key={i} at={S(toOut(at))} src={src} vol={vol} dur={dur ? S(dur) : 90} />)}
				<Sfx at={S(m[1].o) - 2} src="transition-snap.mp3" vol={0.25} dur={20} />
				<Scenes t={t} />
				{tOut < voiceEnd + 0.5 ? <Captions t={tOut} chunks={chunks} /> : null}
			</Stage>
		</ToOut.Provider>
	);
};
