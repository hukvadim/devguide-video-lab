import React from 'react';
import {F, ramp} from '../system/kit';
import {Big, Box, Browser, Cue, L, LiveShot, Pill, Show, StepVideo, Strike, Term, Ticks, Title, Win, at, pop, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-03/words.json';

// Sites-03 «Git і GitHub» (шлях websites, крок git-github). Сценарій: public/ideas/sites-03/scenario.md.
// github.com/signup віддає автоматичному браузеру 403 — показуємо головну github.com з кнопкою «Sign up for GitHub».
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_03 = stepFrames(WORDS);

/** Версії v1 → v2 → v3; v3 «зламано» закреслюється, стрілка повертає на v2. */
const Versions: React.FC<{t: number; broke: number; back: number}> = ({t, broke, back}) => {
	const T = useTheme();
	const v = (n: string, at0: number, cur: boolean, bad = false) => (
		<span style={{opacity: pop(t, at0), transform: `scale(${cur ? 1.08 : 1})`}}>
			<Pill on={cur} style={{fontSize: 52, ...(bad ? {borderColor: T.red, color: T.red, background: `${T.red}1F`} : {})}}>{bad ? <Strike p={ramp(t, broke, broke + 0.5)}>{n}</Strike> : n}</Pill>
		</span>
	);
	const onBack = t >= back;
	return (
		<Box y={760} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
			{v('v1', broke - 1.2, false)}
			<span style={{fontSize: 48, opacity: pop(t, broke - 0.9)}}>→</span>
			{v('v2', broke - 0.8, onBack)}
			<span style={{fontSize: 48, opacity: pop(t, broke - 0.5)}}>→</span>
			{v('v3', broke - 0.4, false, t >= broke)}
			<div style={{position: 'absolute', left: 0, right: 0, top: 120, fontFamily: F.display, fontWeight: 900, fontSize: 56, color: T.accent, opacity: pop(t, back)}}>↩ назад до v2</div>
		</Box>
	);
};

const Scenes = (t: number) => {
	const git = a('Git', 2), hub = a('GitHub', 6), why = a('Навіщо'), second = a('Друге'), third = a('Третє'), now = a('Налаштовуємо'), reg = a('Реєструєшся'), rest = a('все', reg), fin = a('Відкриваєш');
	return (
		<>
			<Show t={t} a={0} b={git}>
				<Title t={t} section="Організація"><L>Git</L> і GitHub</Title>
			</Show>
			<Show t={t} a={git} b={why}>
				<Box y={440}><Big size={104}>Git = <L>версії</L></Big></Box>
				<Box y={700} o={pop(t, hub)}><Big size={104}>GitHub = <L>де вони лежать</L></Big></Box>
			</Show>
			<Show t={t} a={why} b={second}>
				<Box y={420}><Big size={110}>AI <L>зламав</L>?</Big></Box>
				<Versions t={t} broke={a('ламає')} back={a('повертаєшся')} />
			</Show>
			<Show t={t} a={second} b={third}>
				<Box y={380}><Big size={96}>Звідти сайт <L>їде в інтернет</L></Big></Box>
				<Box y={640} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
					<span style={{opacity: pop(t, a('GitHub', second))}}><Pill style={{fontSize: 48}}>GitHub</Pill></span>
					<span style={{fontSize: 56, opacity: pop(t, a('Vercel') - 0.2)}}>↓</span>
					<span style={{opacity: pop(t, a('Vercel'))}}><Pill style={{fontSize: 48}}>Vercel</Pill></span>
					<span style={{fontSize: 56, opacity: pop(t, a('інтернет') - 0.2)}}>↓</span>
					<span style={{opacity: pop(t, a('інтернет'))}}><Pill style={{fontSize: 48}}>сайт в інтернеті</Pill></span>
				</Box>
				<Box y={1210} o={pop(t, a('оновився'))}><Big size={56}>зміна → <L>сайт оновився сам</L></Big></Box>
			</Show>
			<Show t={t} a={third} b={now}>
				<Box y={300}><Big size={88}>Проєкт <L>не загубиться</L></Big></Box>
				<Ticks t={t} y={600} gap={160} items={[[true, "щось з комп'ютером — проєкт цілий", a('комп')], [true, 'працюєш з будь-якого ПК', a('будь')]]} />
			</Show>
			<Show t={t} a={now} b={reg}>
				<Box y={560}><Big size={104}>Одразу, <L>до першого клієнта</L></Big></Box>
			</Show>
			<Show t={t} a={reg} b={rest}>
				<Box y={280}><Big size={80}>Реєструєшся на <L>GitHub</L></Big></Box>
				<Box y={1250} o={pop(t, a('безкоштовно'))}><Pill style={{fontSize: 46}}>безкоштовно</Pill></Box>
				{/* справжня сторінка (shots/github-home.png, 1280×900), рамка на «Sign up for GitHub» */}
				<Browser t={t} y={560} url="github.com" typeAt={reg} h={560}>
					<LiveShot t={t} src="ideas/sites-03/shots/github-home.png" w={1280} a={reg + 0.6} focus={{x: 529, y: 484, w: 186, h: 48, at: reg + 1, zoom: 1.5}} />
				</Browser>
			</Show>
			<Show t={t} a={rest} b={fin}>
				<Box y={300}><Big size={88}>Решту робить <L>Claude Code</L></Big></Box>
				<Term t={t} y={540} minH={420} label="Claude Code" lines={[
					{at: a('перевірить'), text: '✓ Git встановлено', kind: 'ok'},
					{at: a('створить'), text: '✓ репозиторій створено', kind: 'ok'},
					{at: a('коміт'), text: '✓ перший коміт', kind: 'ok'},
					{at: a('опублікує'), text: '✓ опубліковано на GitHub', kind: 'ok'},
					{at: a('Якщо', 50), text: '→ увійди в GitHub: натисни «Authorize»', kind: 'out'},
				]} />
			</Show>
			<Show t={t} a={fin} b={Infinity}>
				<Box y={300}><Big size={88}>Твій проєкт <L>на GitHub</L></Big></Box>
				<Win y={560} label="github.com/you/my-first-site" mono o={pop(t, a('бачиш'))}>
					{['index.html', 'style.css', 'script.js'].map((f, i) => <div key={f} style={{fontSize: 40, textAlign: 'left', opacity: pop(t, a('бачиш') + 0.2 + i * 0.2)}}>▸ {f}</div>)}
				</Win>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Git', 2), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('ламає'), 'glitch/small-electric-glitch-2595.wav', 0.3],
	[a('повертаєшся'), 'whoosh/whoosh-end-384629.mp3', 0.3],
	[a('Vercel'), 'pop/bubble-pop-389501.mp3', 0.35],
	[a('Реєструєшся') + 1, 'click/mouse-click-352734.mp3', 0.4],
	[a('опублікує'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Sites03: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-03" words={WORDS} next="Домен, хостинг і де житиме сайт" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('facepalm', a('Навіщо'), a('Перше') + 0.5 - a('Навіщо'), {label: <><L>Навіщо</L>?</>, labelY: 1000})]} />
);
