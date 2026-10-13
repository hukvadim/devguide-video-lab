import React from 'react';
import {F} from '../system/kit';
import {Big, Box, Browser, Cue, L, LiveShot, Pill, Reply, Show, StepVideo, Title, UserMsg, Win, at, pop, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-01/words.json';

// Sites-01 «Що потрібно: VS Code і Claude Code» (шлях websites, крок setup-tools). Сценарій: public/ideas/sites-01/scenario.md.
// theme — конкретна палітра; seed — вигляд рендеру (палітра з LIVELY + варіанти руху), його дає render-timed.mjs.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_01 = stepFrames(WORDS);

const Tree: React.FC<{t: number}> = ({t}) => {
	const T = useTheme();
	const all = pop(t, a('бачить'), 0.4);
	const row = (name: string, at0: number, note: string, edit?: number) => {
		const edited = edit != null && t >= edit;
		return (
			<div key={name} style={{display: 'flex', justifyContent: 'space-between', opacity: pop(t, at0), paddingLeft: 44, fontSize: 40}}>
				<span>{name}</span>
				<span style={{color: edited ? T.accent : T.dim, fontSize: 32}}>{edited ? '✎ змінено' : note}</span>
			</div>
		);
	};
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 18, padding: 18, borderRadius: 20, border: `3px solid ${all > 0 ? T.accent : 'transparent'}`, background: `${T.accent}${all > 0 ? '14' : '00'}`, textAlign: 'left'}}>
			<div style={{fontSize: 40, color: T.text}}>▾ my-first-site</div>
			{row('index.html', a('створює'), '+ створено')}
			{row('style.css', a('створює') + 0.35, '+ створено', a('змінює'))}
			{row('script.js', a('створює') + 0.7, '+ створено')}
		</div>
	);
};

const Scenes = (t: number) => {
	const first = a('Перше'), second = a('Друге'), mix = a('ось'), chat = a('Claude', a('плутати')), agent = a('А', chat), so = a('Тобто'), fin = a('VS Code', a('зробить'));
	return (
		<>
			<Show t={t} a={0} b={first}>
				<Title t={t} section="Організація">Що потрібно для <L>сайтів</L></Title>
			</Show>
			<Show t={t} a={first} b={second}>
				<Box y={300}><Big size={110}>1 · <L>VS Code</L></Big></Box>
				<Box y={450} o={pop(t, a('редактор'))}><span style={{fontSize: 48, fontWeight: 700}}>редактор коду</span></Box>
				<Browser t={t} y={600} url="code.visualstudio.com" typeAt={a('Ставимо')} o={pop(t, a('Ставимо') - 0.3)} h={520}>
					{/* справжня сторінка (shots/vscode-home.png, 1280×900): наїзд на «Download for Windows» */}
					<LiveShot t={t} src="ideas/sites-01/shots/vscode-home.png" w={1280} a={a('Ставимо') + 0.7} focus={{x: 465, y: 335, w: 335, h: 52, at: a('офіційного'), zoom: 1.5}} />
				</Browser>
				<Box y={1262} o={pop(t, a('версію'))}><Pill>остання версія</Pill></Box>
			</Show>
			<Show t={t} a={second} b={mix}>
				<Box y={440}><Big size={110}>2 · <L>Claude Code</L></Big></Box>
				<Box y={760} o={pop(t, a('підписці'))}><Pill style={{fontSize: 52}}>підписка Pro</Pill></Box>
			</Show>
			<Show t={t} a={mix} b={chat}>
				<Box y={620}><Big size={150}>Не <L>плутай</L></Big></Box>
			</Show>
			<Show t={t} a={chat} b={agent}>
				<Box y={330}><Big size={96}>Claude = <L>чат</L></Big></Box>
				<Win y={580} label="Claude · чат" minH={420}>
					<UserMsg o={pop(t, a('питаєш'))}>Як зробити сайт?</UserMsg>
					<Reply o={pop(t, a('відповідає'))}>Ось 5 кроків. Спершу…</Reply>
				</Win>
			</Show>
			<Show t={t} a={agent} b={so}>
				<Box y={330}><Big size={96}>Claude Code = <L>агент</L></Big></Box>
				<Win y={580} label="Claude Code" mono minH={420}>
					<Tree t={t} />
				</Win>
			</Show>
			<Show t={t} a={so} b={fin}>
				<Box y={380}><Big size={100}>Чат <L>порадить</L></Big></Box>
				<Box y={720} o={pop(t, a('зробить') - 0.9)}><Big size={100}>Claude Code <L>зробить</L></Big></Box>
			</Show>
			<Show t={t} a={fin} b={Infinity}>
				<Box y={480} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24}}>
					<span style={{opacity: pop(t, fin)}}><Pill style={{fontSize: 56}}>VS Code</Pill></span>
					<span style={{opacity: pop(t, a('плюс')), fontFamily: F.display, fontWeight: 900, fontSize: 80}}>+</span>
					<span style={{opacity: pop(t, a('плюс') + 0.3)}}><Pill style={{fontSize: 56}}>Claude Code</Pill></span>
				</Box>
				<Box y={700} o={pop(t, a('перший') - 0.3)}><Big size={110}>= перший <L>сайт</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Перше'), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('офіційного'), 'click/mouse-click-352734.mp3', 0.4],
	[a('Друге'), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('важливо'), 'impact/bass-hit-futuristic.mp3', 0.2],
	[a('А', a('текстом')), 'click/lock-digital.mp3', 0.3],
	[a('VS Code', a('зробить')), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Sites01: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-01" words={WORDS} next={'Claude Code: VS Code, Desktop, Browser'} nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_typing_at_desk', a('потрібен'), a('Перше') - a('потрібен') - 0.15, {label: <>Дуже простий <L>набір</L></>, labelY: 960})]} />
);
