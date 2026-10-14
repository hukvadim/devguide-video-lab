import React from 'react';
import {CalculateMetadataFunction, staticFile} from 'remotion';
import {F} from '../system/kit';
import {BeatVideo, Card, Poster, beatFrames} from '../system/beat';
import {Big, Box, Chips, Cue, L, NextCard, Pill, PromptCard, Show, StepVideo, Term, Ticks, Title, X, W, pop, stepFrames, useTheme} from '../system/step';
import {Word} from '../system/captions';
import REELS from '../../docs/insta-50/reels.json';

// Рілси банку docs/insta-50 з даних (docs/insta-50/reels.json), без ручного коду на кожен.
// Голос: рядок voice ↔ сцена (рядок 0 — титул, останній — «напиши СЛОВО»), старт сцени — перше слово рядка в words.json.
// Музика: cards по бітах треку. Збірка всіх: node scripts/insta-batch.mjs.
export type Scene = {k: 'big' | 'num' | 'prompt' | 'list' | 'chips' | 'code' | 'flow' | 'versus' | 'phone'; t?: string; items?: string[]; sub?: string; ok?: boolean[]; beats?: number};
export type Reel = {n: number; title: string; kicker: string; cta: string; voice?: string[]; scenes?: Scene[]; cards?: Scene[]; track?: string; theme?: string};
export const REEL_LIST = (REELS as {reels: Reel[]}).reels;
const pad = (n: number) => String(n).padStart(2, '0');

/** Акцент у тексті: *слово* → <L>слово</L>. */
const Rich: React.FC<{s?: string}> = ({s = ''}) => <>{s.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith('*') ? <L key={i}>{p.slice(1, -1)}</L> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;

const Node: React.FC<{t: number; at0: number; y: number; on: boolean; children: React.ReactNode}> = ({t, at0, y, on, children}) => {
	const T = useTheme();
	const p = pop(t, at0);
	return <div style={{position: 'absolute', left: X + 80, width: W - 160, top: y, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, padding: '22px 30px', borderRadius: 999, textAlign: 'center', background: on ? T.accent : T.panel, color: on ? T.onAccent : T.text, border: `3px solid ${T.accent}`, fontFamily: F.display, fontWeight: 900, fontSize: 46}}>{children}</div>;
};

/** Одна сцена: заголовок t угорі, візуал k, пункти items з'являються рівномірно між a і b. */
export const SceneView: React.FC<{t: number; a: number; b: number; s: Scene}> = ({t, a, b, s}) => {
	const T = useTheme();
	const items = s.items ?? [];
	const step = Math.max(0.35, Math.min(1.6, (b - a - 1) / Math.max(1, items.length)));
	const ia = (i: number) => a + 0.5 + i * step;
	const fit = (txt = '', max: number) => { const word = Math.max(...txt.replace(/\*/g, '').split(/\s+/).map((w) => w.length)); return Math.min(max, word > 12 ? 76 : word > 9 ? 92 : max); };
	const head = s.t ? <Box y={340}><Big size={fit(s.t, s.t.length > 16 ? 76 : 92)}><Rich s={s.t} /></Big></Box> : null;
	const sub = s.sub ? <Box y={1240} o={pop(t, a + 1)}><Pill style={{fontSize: 44}}>{s.sub}</Pill></Box> : null;
	switch (s.k) {
		case 'big':
			return <><Box y={620}><Big size={fit(s.t, (s.t ?? '').length > 24 ? 96 : 130)}><Rich s={s.t} /></Big></Box>{s.sub ? <Box y={1000} o={pop(t, a + 0.8)}><Pill style={{fontSize: 48}}>{s.sub}</Pill></Box> : null}</>;
		case 'num':
			return <><Box y={360}><Big size={220}><L>{items[0]}</L></Big></Box><Box y={720} o={pop(t, a + 0.3)}><Big size={84}><Rich s={s.t} /></Big></Box>{s.sub ? <Box y={1080} o={pop(t, a + 1)}><Pill style={{fontSize: 46}}>{s.sub}</Pill></Box> : null}</>;
		case 'prompt':
			return <>{head}<PromptCard t={t} a={a + 0.4} b={Math.min(b - 0.5, a + 3.5)} y={640} size={44} text={items[0] ?? ''} />{sub}</>;
		case 'list':
			return <>{head}<Ticks t={t} y={660} gap={130} items={items.map((x, i) => [s.ok?.[i] ?? true, x, ia(i)] as [boolean, React.ReactNode, number])} />{sub}</>;
		case 'chips':
			return <>{head}<Chips t={t} y={680} size={52} items={items.map((x, i) => [x, ia(i)] as [string, number])} />{sub}</>;
		case 'code':
			return <>{head}<Term t={t} y={640} label="Термінал" size={40} lines={items.map((x, i) => ({at: ia(i), text: x.replace(/^>\s*/, ''), kind: x.startsWith('✓') ? 'ok' : i === 0 ? 'cmd' : 'out'}))} />{sub}</>;
		case 'flow': {
			const cur = items.filter((_, i) => t >= ia(i)).length - 1;
			return <>{head}{items.map((x, i) => <React.Fragment key={i}>{i ? <div style={{position: 'absolute', left: 536, top: 600 + i * 170 - 46, width: 8, height: 46, background: T.accent, opacity: pop(t, ia(i))}} /> : null}<Node t={t} at0={ia(i)} y={600 + i * 170} on={i === cur}>{x}</Node></React.Fragment>)}{sub}</>;
		}
		case 'versus':
			return (
				<>{head}
					<Box y={680} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
						{items.slice(0, 2).map((x, i) => (
							<React.Fragment key={i}>
								{i ? <span style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, color: T.dim}}>vs</span> : null}
								<div style={{width: 360, minHeight: 360, borderRadius: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, boxSizing: 'border-box', opacity: pop(t, a + 0.3 + i * 0.6), background: i ? T.accent : T.panel, color: i ? T.onAccent : T.text, border: `3px solid ${i ? T.accent : T.line}`, fontFamily: F.display, fontWeight: 900, fontSize: x.length > 10 ? 40 : 54, lineHeight: 1.15}}>{x}</div>
							</React.Fragment>
						))}
					</Box>
					{sub}
				</>
			);
		case 'phone':
			return (
				<>{head}
					<div style={{position: 'absolute', left: 290, top: 620, width: 500, minHeight: 640, borderRadius: 64, border: `10px solid ${T.text}`, background: T.panel, padding: '64px 30px 30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18}}>
						{items.map((x, i) => <div key={i} style={{opacity: pop(t, ia(i)), padding: '18px 22px', borderRadius: 20, background: i === items.filter((_, j) => t >= ia(j)).length - 1 ? T.accent : 'transparent', color: i === items.filter((_, j) => t >= ia(j)).length - 1 ? T.onAccent : T.text, border: `2px solid ${T.line}`, fontWeight: 700, fontSize: 34}}><span style={{fontFamily: F.mono, opacity: 0.6}}>{pad(i + 1)} </span>{x}</div>)}
					</div>
					{s.sub ? <Box y={1320} o={pop(t, a + 1)}><Pill style={{fontSize: 44}}>{s.sub}</Pill></Box> : null}
				</>
			);
	}
};

const Ask: React.FC<{t: number; a: number; word: string}> = ({t, a, word}) => (
	<Show t={t} a={a} b={Infinity}>
		<Box y={520}><span style={{fontSize: 56, fontWeight: 700}}>Напиши в коментарях</span></Box>
		<Box y={640} o={pop(t, a + 0.3)}><Big size={word.length > 5 ? 110 : 140}><L>«{word}»</L></Big></Box>
		<Box y={900} o={pop(t, a + 1.2)}><Pill style={{fontSize: 48}}>надішлю в Direct</Pill></Box>
	</Show>
);
const cta = (word: string) => (t: number, a: number) => <NextCard t={t} a={a} label="Напиши в коментарях" next={`«${word}»`} url="надішлю тобі в Direct" />;

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');
/** Старт кожного рядка voice у words.json: шукаємо перше слово рядка після попереднього старту; не знайшли — оцінка за часткою слів. */
export const lineStarts = (lines: string[], words: Word[]) => {
	const count = lines.map((l) => l.split(/\s+/).length);
	const total = count.reduce((s, c) => s + c, 0), end = words[words.length - 1].e;
	let prev = 0;
	return lines.map((line, i) => {
		if (i === 0) return 0;
		const est = (count.slice(0, i).reduce((s, c) => s + c, 0) / total) * end;
		const first = norm(line.split(/\s+/)[0]).slice(0, 4);
		const w = words.find((x) => x.s > prev + 0.3 && norm(x.w).startsWith(first));
		prev = w && Math.abs(w.s - est) < 5 ? w.s : Math.max(prev + 0.5, est);
		return prev;
	});
};

type Props = {n: number; words?: Word[]; theme?: string; seed?: number};
export const InstaAuto: React.FC<Props> = ({n, words, theme, seed}) => {
	const r = REEL_LIST.find((x) => x.n === n)!;
	if (r.cards) {
		const cards: Card[] = [
			{beats: 6, el: (t, a) => <Poster t={t} a={a} kicker={r.kicker} size={r.title.length > 18 ? 100 : 130}><Rich s={r.title} /></Poster>},
			...r.cards.map((s): Card => ({beats: s.beats ?? 6, sfx: 'pop/bubble-pop-406640.mp3', vol: 0.25, el: (t, a, b) => <SceneView t={t} a={a} b={b} s={s} />})),
			{beats: 8, el: cta(r.cta)},
		];
		return <BeatVideo theme={r.theme ?? 'paper'} track={r.track ?? '37-synthwave-better-times-are-coming.mp3'} cards={cards} />;
	}
	const W2 = words!;
	const lines = r.voice!;
	const st = lineStarts(lines, W2);
	const scenes = (t: number) => (
		<>
			<Show t={t} a={0} b={st[1]}><Title t={t} section={r.kicker} size={r.title.length > 22 ? 96 : 116}><Rich s={r.title} /></Title></Show>
			{r.scenes!.map((s, i) => <Show key={i} t={t} a={st[i + 1]} b={st[i + 2]}><SceneView t={t} a={st[i + 1]} b={st[i + 2]} s={s} /></Show>)}
			<Ask t={t} a={st[lines.length - 1]} word={r.cta} />
		</>
	);
	const sfx: Cue[] = [[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3], ...st.slice(1, -1).map((x): Cue => [x, 'pop/soft-pop.wav', 0.25])];
	return <StepVideo theme={theme} seed={seed} dir={`ideas/insta-${pad(n)}`} words={W2} sfx={sfx} scenes={scenes} endCard={cta(r.cta)} />;
};

/** Тривалість: голос — з words.json (fetch staticFile), музика — з бітів. */
export const instaMeta: CalculateMetadataFunction<Props> = async ({props}) => {
	const r = REEL_LIST.find((x) => x.n === props.n)!;
	if (r.cards) {
		const cards = [{beats: 6}, ...r.cards.map((s) => ({beats: s.beats ?? 6})), {beats: 8}] as Card[];
		return {durationInFrames: beatFrames(r.track ?? '37-synthwave-better-times-are-coming.mp3', cards)};
	}
	const words: Word[] = await fetch(staticFile(`ideas/insta-${pad(props.n)}/words.json`)).then((x) => x.json());
	return {durationInFrames: stepFrames(words), props: {...props, words}};
};
