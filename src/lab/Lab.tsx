import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {F, Sfx, Stage, clamp} from '../system/kit';
import {chunkWords, Word} from '../system/captions';
import {ThemeProvider, useTheme} from '../system/theme';
import {Big, Box, Check, Cue, L, NextCard, PatternBg, PromptCard, S, StepVideo, pop, prompt, stepFrames} from '../system/step';
import PATH from '../../data/learning-claude.json';
import BEATS from '../../public/assets/music/_кандидати/beats.json';
import * as I008 from '../ideas/Idea008';
import * as I011 from '../ideas/Idea011';
import * as I013 from '../ideas/Idea013';
import * as I015 from '../ideas/Idea015';
import W001 from '../../public/ideas/idea-001/words.json';
import W002 from '../../public/ideas/idea-002/words.json';
import W008 from '../../public/ideas/idea-008/words.json';
import W011 from '../../public/ideas/idea-011/words.json';
import W013 from '../../public/ideas/idea-013/words.json';
import W014 from '../../public/ideas/idea-014/words.json';
import W015 from '../../public/ideas/idea-015/words.json';

// Лабораторія форматів (docs/FORMAT_LAB.md): варіанти 08–20. Музика поки з кандидатів (public/assets/music/_кандидати),
// після вибору Вадима шляхи міняються на public/assets/music/<файл>.
const M = (f: string) => `assets/music/_кандидати/${f}`;
const beat = (f: string) => (BEATS as Record<string, {bpm: number; offset: number}>)[f];
const chunkCues = (words: Word[], src: string, vol: number, max = 16): Cue[] => chunkWords(words, max).map((c) => [c[0].s, src, vol]);

// ---------- тип 2: тільки голос ----------
export const Lab08 = () => <StepVideo dir="ideas/idea-013" words={W013} next="Безпечно з AI" sfx={I013.SFX} scenes={I013.Scenes} theme="drop14" />;
export const Lab09 = () => <StepVideo dir="ideas/idea-011" words={W011} next="Спершу план, потім код" sfx={I011.SFX} scenes={I011.Scenes} theme="drop07" music={M('25-chill-thinking-about-you.mp3')} />;
export const Lab10 = () => <StepVideo dir="ideas/idea-014" words={W014} next="Skills і MCP" look="word" theme="drop01" music={M('12-edm-rising-forest.mp3')} musicVol={0.1}
	sfx={chunkCues(W014, '_кандидати/26-ui-cool-interface-click-tone.mp3', 0.18)} />;
export const Lab11 = () => <StepVideo dir="ideas/idea-008" words={W008} next="Claude Code: перший проєкт" sfx={I008.SFX} scenes={I008.Scenes} theme="drop12" music={M('37-synthwave-better-times-are-coming.mp3')} />;
export const Lab12 = () => <StepVideo dir="ideas/idea-002" words={W002} next="Постав перше питання" nextLabel="Твій перший крок" look="karaoke" theme="neon" music={M('28-futurebass-cant-get-you-off-my-mind.mp3')} musicVol={0.09}
	sfx={chunkCues(W002, 'sparkle-touch.mp3', 0.12, 26)} />;
const T13 = beat('15-house-house-02.mp3');
const ticks13: Cue[] = Array.from({length: Math.floor((W015[W015.length - 1].e - 1) / (120 / T13.bpm))}, (_, i) => [1 + i * (120 / T13.bpm), '_кандидати/28-ui-interface-device-click.mp3', 0.05]);
export const Lab13 = () => <StepVideo dir="ideas/idea-015" words={W015} next="Свій skill: процес в одну команду" sfx={[...I015.SFX, ...ticks13]} scenes={I015.Scenes} theme="drop02" music={M('15-house-house-02.mp3')} musicVol={0.11} />;
const W001cut = W001.filter((w) => w.e <= 36.4); // до «…реального результату.» — порівняння голосу Anton
export const Lab14 = () => <StepVideo dir="ideas/idea-001" words={W001cut} next="Покажи AI свою ціль" nextLabel="Повне відео" look="karaoke" music={M('23-chill-digital-clouds.mp3')} musicVol={0.09}
	sfx={chunkCues(W001cut, 'soft-pop.wav', 0.12, 26)} />;
export const LAB_FRAMES_2 = {8: stepFrames(W013), 9: stepFrames(W011), 10: stepFrames(W014), 11: stepFrames(W008), 12: stepFrames(W002), 13: stepFrames(W015), 14: stepFrames(W001cut)};

// ---------- тип 3: без голосу, у ритм ----------
type Card = {beats: number; sfx?: string; vol?: number; theme?: string; el: (t: number, a: number, b: number) => React.ReactNode};
const total = (cards: Card[]) => cards.reduce((s, c) => s + c.beats, 0);
export const beatFrames = (track: string, cards: Card[]) => S((total(cards) * 60) / beat(track).bpm);

const BeatVideo: React.FC<{theme: string; track: string; cards: Card[]; vol?: number}> = ({theme, track, cards, vol = 0.55}) => {
	const t = useCurrentFrame() / 30;
	const {bpm, offset} = beat(track);
	const b = 60 / bpm;
	const end = total(cards) * b;
	let acc = 0;
	const spans = cards.map((c) => { const a = acc * b; acc += c.beats; return {c, a, z: acc * b}; });
	return (
		<ThemeProvider theme={theme}>
			<Stage glow={[760, 420]} grid>
				<PatternBg t={t} />
				<Audio src={staticFile(M(track))} trimBefore={S(offset)} volume={(f) => interpolate(f, [0, 6, S(end - 1.5), S(end)], [0, vol, vol, 0], clamp)} />
				{spans.map(({c, a}, i) => <Sfx key={i} at={S(a)} src={c.sfx ?? (i ? 'whoosh-fast.mp3' : 'impact-cine-big.mp3')} vol={c.vol ?? 0.22} dur={45} />)}
				{spans.filter(({a, z}) => t >= a && t < z).map(({c, a, z}, i) => (
					<AbsoluteFill key={i}>{c.theme ? <ThemeProvider theme={c.theme}><Stage glow={[760, 420]}><PatternBg t={t} />{c.el(t, a, z)}</Stage></ThemeProvider> : c.el(t, a, z)}</AbsoluteFill>
				))}
			</Stage>
		</ThemeProvider>
	);
};

/** Постер: малий надпис + великий заголовок по центру, удар-поява на біт. */
const Poster: React.FC<{t: number; a: number; kicker?: string; size?: number; children: React.ReactNode; sub?: React.ReactNode}> = ({t, a, kicker, size = 120, children, sub}) => {
	const T = useTheme();
	const p = pop(t, a, 0.22);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 84px', textAlign: 'center'}}>
			{kicker ? <div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 5, color: T.accent, textTransform: 'uppercase', marginBottom: 40, opacity: p}}>{kicker}</div> : null}
			<div style={{transform: `scale(${1.25 - p * 0.25})`, opacity: p}}><Big size={size}>{children}</Big></div>
			{sub ? <div style={{marginTop: 50, fontFamily: F.body, fontWeight: 700, fontSize: 48, lineHeight: 1.3, color: T.dim, opacity: pop(t, a + 0.25, 0.3)}}>{sub}</div> : null}
		</AbsoluteFill>
	);
};
/** Одне слово на весь екран; inv — акцентна заливка. */
const Word1: React.FC<{t: number; a: number; w: string; inv?: boolean}> = ({t, a, w, inv}) => {
	const T = useTheme();
	const p = pop(t, a, 0.15);
	return (
		<AbsoluteFill style={{background: inv ? T.accent : 'transparent', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{transform: `scale(${0.85 + p * 0.15})`}}><Big size={Math.min(230, Math.floor(1000 / Math.max(4, w.length)))} style={{color: inv ? T.onAccent : T.text, textTransform: 'uppercase', letterSpacing: -4, textAlign: 'center'}}>{w}</Big></div>
		</AbsoluteFill>
	);
};
const Outro: React.FC<{t: number; a: number; next: string; label?: string; url?: string}> = (p) => <NextCard {...p} />;

// 15 · «5 промптів для старту»: назви й початки промптів дослівно з програми
const P5: [string, string][] = [['first-question', 'first-question'], ['claude-code-install', 'install'], ['claude-code', 'first-project'], ['claude-md', 'rules'], ['plan-mode', 'plan']];
const label = (s: string, k: string) => PATH.steps.find((x) => x.key === s)!.prompts.find((p) => p.key === k)!.label;
const TR15 = '06-trap-thunder.mp3';
const C15: Card[] = [
	{beats: 6, el: (t, a) => <Poster t={t} a={a} kicker="DevGuide · Claude / AI" size={130}>5 промптів<br /><L>для старту</L></Poster>},
	...P5.map(([s, k], i): Card => ({beats: 10, sfx: '_кандидати/37-typing-single-key-type.mp3', vol: 0.35, el: (t, a, z) => (
		<>
			<Box y={240}><Big size={150}><L>{i + 1}/5</L></Big></Box>
			<Box y={470} o={pop(t, a, 0.2)}><Big size={76}>{label(s, k)}</Big></Box>
			<PromptCard t={t} a={a + 0.3} b={z - 0.6} text={prompt(s, k).split('\n')[0]} y={720} size={40} />
		</>
	)})),
	{beats: 10, el: (t, a) => <Outro t={t} a={a} next="Шлях Claude / AI" label="Усі промпти — у програмі" />},
];
export const Lab15 = () => <BeatVideo theme="drop12" track={TR15} cards={C15} />;

// 16 · «4 правила безпеки з AI»: формулювання з опису кроку ai-safety
const TR16 = '17-house-house-fest.mp3';
const RULES: [string, React.ReactNode][] = [
	['Паролі, токени, .env', <>ніколи <L>в чат</L></>],
	['Дані клієнтів', <>лише <L>знеособлені</L></>],
	['Агенту в браузері', <>тільки <L>потрібні сайти</L> й акаунти</>],
	['Чужа сторінка', <>може мати <L>приховані інструкції</L></>],
];
const C16: Card[] = [
	{beats: 4, el: (t, a) => <Word1 t={t} a={a} w="Стоп" inv />},
	{beats: 4, el: (t, a) => <Poster t={t} a={a} size={110}>4 правила<br /><L>безпеки з AI</L></Poster>},
	...RULES.flatMap(([h, body], i): Card[] => [
		{beats: 2, sfx: '_кандидати/12-glitch-small-electric-glitch.mp3', vol: 0.3, el: (t, a) => <Word1 t={t} a={a} w={String(i + 1)} inv />},
		{beats: 6, el: (t, a) => <Poster t={t} a={a} kicker={h} size={92}>{body}</Poster>},
	]),
	{beats: 6, el: (t, a) => <Check t={t} a={a} y={640}>Перед відправкою в AI — без секретів і персональних даних</Check>},
	{beats: 8, el: (t, a) => <Outro t={t} a={a} next="Безпечно з AI" label="Крок шляху Claude / AI" />},
];
export const Lab16 = () => <BeatVideo theme="drop14" track={TR16} cards={C16} />;

// 17 · «Шлях Claude за 15 кроків»: обкладинки наших шортів по біту
const TR17 = '08-trap-acid-party.mp3';
const Cover: React.FC<{t: number; a: number; n: number; title: string}> = ({t, a, n, title}) => {
	const T = useTheme();
	const p = pop(t, a, 0.18);
	return (
		<>
			<div style={{position: 'absolute', left: 230, top: 330, width: 620, height: 1102, borderRadius: 40, overflow: 'hidden', boxShadow: '0 60px 140px #000000C0', transform: `scale(${1.08 - p * 0.08}) rotate(${(n % 2 ? 1 : -1) * (1 - p) * 4}deg)`, opacity: p}}>
				{n <= 14 ? <Img src={staticFile(`lab/covers/${String(n).padStart(2, '0')}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <AbsoluteFill style={{background: T.accent}} />}
			</div>
			<Box y={190}><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 96, color: T.accent}}>{String(n).padStart(2, '0')}</span></Box>
			<Box y={1470}><span style={{display: 'inline-block', padding: '14px 30px', borderRadius: 18, background: `${T.bg}E6`, fontFamily: F.body, fontWeight: 800, fontSize: 46}}>{title}</span></Box>
		</>
	);
};
const C17: Card[] = [
	{beats: 4, el: (t, a) => <Poster t={t} a={a} kicker="DevGuide" size={130}>Claude / AI<br /><L>15 кроків</L></Poster>},
	...PATH.steps.map((s, i): Card => ({beats: 3, vol: 0.14, el: (t, a) => <Cover t={t} a={a} n={i + 1} title={s.title} />})),
	{beats: 12, el: (t, a) => <Outro t={t} a={a} next="Шлях Claude / AI" label="Пройди всі 15" />},
];
export const Lab17 = () => <BeatVideo theme="brand" track={TR17} cards={C17} />;

// 18 · «DEVGUIDE DROP»: палітри Color Drop як постери
const TR18 = '39-synthwave-lonerism.mp3';
const DROPS: [string, string][] = [['drop01', '#01'], ['drop02', '#02'], ['drop07', '#07'], ['drop12', '#12'], ['drop14', '#14'], ['neon', 'NEON']];
const Drop: React.FC<{t: number; a: number; no: string}> = ({t, a, no}) => {
	const T = useTheme();
	const p = pop(t, a, 0.25);
	const star = interpolate(t - a, [0, 2], [0, 40], clamp);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 120, color: T.accent, opacity: p}}>{no}</div>
			<div style={{transform: `scale(${1.2 - p * 0.2})`, opacity: p, marginTop: 10}}><Big size={150} style={{lineHeight: 0.95}}>DEV<br /><span style={{color: T.accent}}>GUIDE</span></Big></div>
			<div style={{display: 'flex', gap: 60, marginTop: 70, opacity: pop(t, a + 0.3, 0.3)}}>
				{[T.accent, T.bg].map((c) => <div key={c} style={{display: 'flex', alignItems: 'center', gap: 18}}><div style={{width: 64, height: 64, borderRadius: 32, background: c, border: `4px solid ${T.text}`}} /><span style={{fontFamily: F.mono, fontSize: 34}}>{c.slice(0, 7).toUpperCase()}</span></div>)}
			</div>
			<div style={{marginTop: 70, fontSize: 150, color: T.accent, transform: `rotate(${star}deg) scale(${pop(t, a + 0.15, 0.3)})`}}>✦</div>
		</AbsoluteFill>
	);
};
const C18: Card[] = [
	{beats: 4, el: (t, a) => <Word1 t={t} a={a} w="Drop" inv />},
	...DROPS.map(([th, no]): Card => ({beats: 4, theme: th, sfx: 'air-whoosh-powerful.mp3', vol: 0.2, el: (t, a) => <Drop t={t} a={a} no={no} />})),
	{beats: 8, el: (t, a) => <Outro t={t} a={a} next="Який колір твій?" label="Напиши номер у коментарях" url="devguide.com.ua" />},
];
export const Lab18 = () => <BeatVideo theme="brand" track={TR18} cards={C18} />;

// 19 · «Shift+Tab» — один трюк, 12 с, кінець римується з початком (луп)
const TR19 = '22-lofi-sleepy-cat.mp3';
const Keys: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const k = (d: number, label: string) => {
		const down = t >= a + d && t < a + d + 0.35;
		return <span style={{display: 'inline-block', padding: '34px 54px', borderRadius: 26, background: down ? T.accent : T.panel2, color: down ? T.onAccent : T.text, border: `3px solid ${down ? T.accent : T.line}`, boxShadow: down ? `0 4px 0 ${T.accentDeep}` : '0 14px 0 #00000066', transform: `translateY(${down ? 10 : 0}px)`, fontFamily: F.mono, fontSize: 80}}>{label}</span>;
	};
	return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50, flexDirection: 'row'}}>{k(0.3, 'Shift')}<span style={{fontSize: 80, fontWeight: 900}}>+</span>{k(0.55, 'Tab')}</AbsoluteFill>;
};
const C19: Card[] = [
	{beats: 6, el: (t, a) => <Poster t={t} a={a} size={96}>AI переписав<br /><L>пів проєкту?</L></Poster>},
	{beats: 6, sfx: 'switch-tap.mp3', vol: 0.4, el: (t, a) => <Keys t={t} a={a} />},
	{beats: 8, el: (t, a) => <Poster t={t} a={a} kicker="Режим плану" size={92} sub="Claude читає проєкт і пише план, нічого не змінюючи">Спершу <L>план</L></Poster>},
	{beats: 6, el: (t, a) => <Poster t={t} a={a} size={96}>AI переписав<br /><L>пів проєкту?</L></Poster>},
];
export const Lab19 = () => <BeatVideo theme="drop02" track={TR19} cards={C19} />;

// 20 · «Спершу план, потім код»: кінетична цитата з дропом на «код»
const TR20 = '30-epic-epical-drums-01.mp3';
const Q = ['Головне', 'правило', 'спершу', 'план'];
const C20: Card[] = [
	...Q.map((w, i): Card => ({beats: 2, vol: 0.12, el: (t, a) => <Word1 t={t} a={a} w={w} inv={i % 2 === 1} />})),
	{beats: 2, vol: 0.12, el: (t, a) => <Word1 t={t} a={a} w="потім" />},
	{beats: 6, sfx: 'impact-movie-epic.mp3', vol: 0.5, el: (t, a) => <Word1 t={t} a={a} w="код" inv />},
	{beats: 8, el: (t, a) => <Poster t={t} a={a} kicker="Claude Code" size={88} sub="Попроси план, прочитай, скажи «ок» — і лише тоді код">Спершу <L>план</L>,<br />потім код</Poster>},
	{beats: 10, el: (t, a) => <Outro t={t} a={a} next="Claude Code: перший проєкт" />},
];
export const Lab20 = () => <BeatVideo theme="drop01" track={TR20} cards={C20} />;

export const LAB_FRAMES_3 = {15: beatFrames(TR15, C15), 16: beatFrames(TR16, C16), 17: beatFrames(TR17, C17), 18: beatFrames(TR18, C18), 19: beatFrames(TR19, C19), 20: beatFrames(TR20, C20)};
export const LAB: Record<number, React.FC> = {8: Lab08, 9: Lab09, 10: Lab10, 11: Lab11, 12: Lab12, 13: Lab13, 14: Lab14, 15: Lab15, 16: Lab16, 17: Lab17, 18: Lab18, 19: Lab19, 20: Lab20};
export const LAB_FRAMES: Record<number, number> = {...LAB_FRAMES_2, ...LAB_FRAMES_3};
