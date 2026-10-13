import React from 'react';
import {ramp} from '../system/kit';
import {Big, Box, Browser, Chips, Cue, L, LiveShot, PromptCard, Show, StepVideo, Title, Win, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import WORDS from '../../public/ideas/sites-02/words.json';

// Sites-02 «Claude Code: VS Code, Desktop, Browser» (шлях websites, крок claude-code-setup). Сценарій: public/ideas/sites-02/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_02 = stepFrames(WORDS);

/** Результат першого промпту: сторінка «Привіт» з кнопкою, фон міняється на слові flip. */
const Hello: React.FC<{t: number; flip: number}> = ({t, flip}) => {
	const T = useTheme();
	const k = ramp(t, flip, flip + 0.4);
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34,
			background: k > 0.5 ? T.accent : '#FFFFFF', color: k > 0.5 ? T.onAccent : '#111111', transition: 'none'}}>
			<span style={{fontSize: 52, fontWeight: 800}}>Привіт, це мій перший сайт</span>
			<span style={{padding: '18px 40px', borderRadius: 14, background: '#111111', color: '#FFFFFF', fontSize: 36, fontWeight: 700, transform: `scale(${1 - 0.08 * Math.sin(Math.min(1, ramp(t, flip - 0.3, flip)) * Math.PI)})`}}>Змінити фон</span>
		</div>
	);
};

/** Калькулятор: схема результату другого промпту. */
const Calc: React.FC<{t: number; a0: number}> = ({t, a0}) => {
	const T = useTheme();
	const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];
	return (
		<div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
			<div style={{gridColumn: '1 / 5', textAlign: 'right', fontSize: 72, fontWeight: 800, padding: '10px 18px', fontFamily: 'monospace'}}>{t > a0 + 1.4 ? '42' : '6 × 7'}</div>
			{keys.map((k, i) => (
				<div key={k} style={{opacity: pop(t, a0 + i * 0.04, 0.25), height: 92, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800,
					background: k === '=' ? T.accent : T.panel2, color: k === '=' ? T.onAccent : T.text}}>{k}</div>
			))}
		</div>
	);
};

const Scenes = (t: number) => {
	const go = a('Заходиш'), main = a('Головне'), check = a('Встановили'), file = a('Файл', a('фону')), more = a('А', file);
	return (
		<>
			<Show t={t} a={0} b={go}>
				<Title t={t} section="Організація">Де взяти <L>Claude Code</L>?</Title>
			</Show>
			<Show t={t} a={go} b={main}>
				<Box y={280}><Big size={84}>Усе на <L>одній сторінці</L></Big></Box>
				<Browser t={t} y={560} url="claude.ai/download" typeAt={go + 0.2} h={520}>
					{/* справжня сторінка (shots/claude-download.png, 1265×2200): скрол до «Claude Code environments», рамка на VS Code */}
					<LiveShot t={t} src="ideas/sites-02/shots/claude-download.png" w={1265} a={go + 1} b={a('розширення')} scroll={1440} focus={{x: 878, y: 1877, w: 295, h: 69, at: a('VS Code'), zoom: 1.4}} />
				</Browser>
				<Chips t={t} y={1230} items={[['VS Code', a('VS Code')], ['Desktop', a('десктопна')], ['Chrome', a('Chrome')]]} />
			</Show>
			<Show t={t} a={main} b={check}>
				<Box y={520}><Big size={110}>Головне — <L>VS Code</L></Big></Box>
				<Box y={800} o={pop(t, a('тут'))}><span style={{fontSize: 52, fontWeight: 700}}>тут ми працюємо над сайтом</span></Box>
			</Show>
			<Show t={t} a={check} b={file}>
				<Box y={300}><Big size={88}>Одразу <L>перевіряємо</L></Big></Box>
				<PromptCard t={t} a={a('створи')} b={a('фону') + 0.3} text={prompt('claude-code-setup', 'first-file')} y={500} label="Claude Code" />
			</Show>
			<Show t={t} a={file} b={more}>
				<Box y={300}><Big size={88}>Файл <L>з'явився</L></Big></Box>
				<Browser t={t} y={500} url="index.html" o={pop(t, a("з'явився"))} h={560}>
					<Hello t={t} flip={a('працює', a('браузері'))} />
				</Browser>
			</Show>
			<Show t={t} a={more} b={Infinity}>
				<Box y={280}><Big size={96}>Хочеш <L>цікавіше</L>?</Big></Box>
				<Win y={520} label="калькулятор" o={pop(t, a('калькулятор'))}>
					<Calc t={t} a0={a('калькулятор') + 0.2} />
				</Win>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Заходиш') + 0.2, 'typing/typewriter-hit-soft.mp3', 0.22],
	[a('VS Code'), 'click/mouse-click-352734.mp3', 0.4],
	[a('Головне'), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('створи'), 'typing/typewriter-digital.mp3', 0.18],
	[a("з'явився"), 'notify/ding-101492.mp3', 0.3],
	[a('калькулятор'), 'pop/bubble-pop-389501.mp3', 0.35],
];

export const Sites02: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-02" words={WORDS} next="Git і GitHub" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes} />
);
