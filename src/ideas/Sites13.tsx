import React from 'react';
import {interpolate} from 'remotion';
import {F, clamp} from '../system/kit';
import {Big, Box, Browser, Chips, Cue, L, LiveShot, Show, StepVideo, Term, Title, X, W, at, pop, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-13/words.json';

// Sites-13 «День 2: де мої задачі? Trello» (шлях websites, крок trello). Сценарій: public/ideas/sites-13/scenario.md.
// Дошка — намальована в Remotion (колонки з кроку), скрін trello.com — справжній.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_13 = stepFrames(WORDS);
const COLS = ['в роботі', 'зробити', 'від клієнта', 'баги', 'готово'];
const CARDS = [2, 3, 1, 1, 2];

/** Дошка з колонками; картка «Меню» з моменту move переїжджає з «в роботі» в «готово». */
const Board: React.FC<{t: number; cols: number[]; move: number; y: number}> = ({t, cols, move, y}) => {
	const T = useTheme();
	const cw = (W - 4 * 12) / 5;
	const k = interpolate(t, [move, move + 0.9], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
	return (
		<div style={{position: 'absolute', left: X, top: y, width: W, height: 520}}>
			{COLS.map((c, i) => (
				<div key={c} style={{position: 'absolute', left: i * (cw + 12), top: 0, width: cw, height: 520, borderRadius: 18, background: T.panel, border: `1px solid ${i === 4 && k > 0.9 ? T.accent : T.line}`, opacity: pop(t, cols[i]), transform: `translateY(${(1 - pop(t, cols[i])) * 30}px)`}}>
					<div style={{padding: '14px 10px', fontFamily: F.body, fontWeight: 800, fontSize: 26, lineHeight: 1.15, minHeight: 66, textAlign: 'center', color: i === 4 ? T.accent : T.text}}>{c}</div>
					{Array.from({length: CARDS[i]}, (_, j) => <div key={j} style={{margin: '0 10px 10px', height: 70, borderRadius: 10, background: T.panel2, border: `1px solid ${T.line}`}} />)}
				</div>
			))}
			{t >= cols[0] ? (
				<div style={{position: 'absolute', left: 10 + k * 4 * (cw + 12), top: 80 + CARDS[0] * 80 + k * (CARDS[4] * 80 - CARDS[0] * 80) - Math.sin(k * Math.PI) * 60, width: cw - 20, height: 70, borderRadius: 10, background: `${T.accent}26`, border: `3px solid ${T.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26, transform: `rotate(${Math.sin(k * Math.PI) * 6}deg)`, opacity: pop(t, cols[0])}}>{k >= 1 ? '✓ Меню' : 'Меню'}</div>
			) : null}
		</div>
	);
};

const Scenes = (t: number) => {
	const T = useTheme();
	const think = a('думаєш'), what = a('За', 4.5), trello = a('Тут'), board = a('Робиш'), easy = a('Найпростіше'), ai = a('А', 32), cl = a('Клієнт', 46), end = a('І', 51.5);
	return (
		<>
			<Show t={t} a={0} b={think}>
				<Title t={t} section="Розробка">День 2: де мої <L>задачі</L>?</Title>
			</Show>
			<Show t={t} a={what} b={trello}>
				<Box y={560}><Big size={110}>За що <span style={{color: T.red}}>братися</span>?</Big></Box>
			</Show>
			<Show t={t} a={trello} b={board}>
				<Box y={250}><Big size={88}>Рятує <L>Trello</L></Big></Box>
				{/* справжня сторінка (shots/trello-home.png, 1280×900) */}
				<Browser t={t} y={400} url="trello.com" h={560}>
					<LiveShot t={t} src="ideas/sites-13/shots/trello-home.png" w={1280} a={trello + 0.3} focus={{x: 395, y: 587, w: 164, h: 50, at: a('безкоштовний'), zoom: 1.5}} />
				</Browser>
				<Chips t={t} y={1080} size={42} items={[['безкоштовний', a('безкоштовний')], ['є мобільний додаток', a('мобільний')], ['запис з телефона', a('телефона')]]} />
			</Show>
			<Show t={t} a={board} b={Infinity}>
				<Box y={260}><Big size={76}>{t >= end ? <>Жодна задача <L>не губиться</L></> : t >= ai ? <>AI сам бере <L>задачі</L></> : t >= easy ? <>AI створює <L>дошку</L></> : <>Дошка з <L>колонками</L></>}</Big></Box>
				<Board t={t} y={510} cols={[a('роботі'), a('зробити', 12.5), a('від', 13), a('баги'), a('готово')]} move={a('переносить')} />
				{t >= easy && t < ai ? <Term t={t} y={1070} label="Claude Code" lines={[{at: a('створи'), text: 'ось tz.md, створи дошку'}, {at: a('картки'), text: '✓ ТЗ розкладено на картки', kind: 'ok'}]} /> : null}
				{t >= ai && t < cl ? <Term t={t} y={1070} label="Claude Code" lines={[{at: a('продовжуємо'), text: 'продовжуємо роботу'}, {at: a('бере'), text: '✓ взяв задачу «Меню»', kind: 'ok'}, {at: a('план'), text: '→ план готовий, чекаю «ок»', kind: 'out'}]} /> : null}
				{t >= cl ? <Chips t={t} y={1090} size={40} items={[['правка → «від клієнта»', a('правку')], ['баг → «баги»', a('баг', 50)]]} /> : null}
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Тут'), 'notify/ding-126626.mp3', 0.25],
	[a('роботі'), 'pop/soft-pop.wav', 0.3],
	[a('від', 13), 'pop/soft-pop.wav', 0.3],
	[a('готово'), 'pop/soft-pop.wav', 0.3],
	[a('продовжуємо'), 'typing/typewriter-digital.mp3', 0.2],
	[a('переносить'), 'whoosh/arrow-whoosh-1491.wav', 0.3],
	[a('переносить') + 0.9, 'sparkle/sparkle-touch.mp3', 0.3],
	[a('створи'), 'typing/typewriter-digital.mp3', 0.18],
	[a('правку'), 'pop/soft-pop.wav', 0.3],
];

export const Sites13: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-13" words={WORDS} next="Решта MCP і skills" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_rubbing_eyes_at_desk', a('думаєш'), a('За', 4.5) - a('думаєш') - 0.1, {label: <>Що я <L>вчора</L> зробив?</>, labelY: 1000})]} />
);
