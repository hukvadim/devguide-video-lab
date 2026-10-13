import React from 'react';
import {Img, staticFile} from 'remotion';
import {F} from '../system/kit';
import {Big, Box, Browser, Cue, L, LiveShot, Pill, Show, StepVideo, Steps, Title, X, W, at, pop, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-14/words.json';

// Sites-14 «Решта MCP і skills» (шлях websites, крок mcp-skills). Сценарій: public/ideas/sites-14/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_14 = stepFrames(WORDS);

/** Скріни сайту DevGuide на телефоні (390) і ПК (1280) — те, що робить Playwright. */
const Devices: React.FC<{t: number; a0: number; y: number}> = ({t, a0, y}) => {
	const T = useTheme();
	const f = (o: number): React.CSSProperties => ({position: 'absolute', top: y, overflow: 'hidden', borderRadius: 18, border: `3px solid ${T.line}`, opacity: pop(t, a0 + o), transform: `translateY(${(1 - pop(t, a0 + o)) * 40}px)`, boxShadow: '0 30px 80px #000000A0'});
	const tag = (s: string) => <div style={{position: 'absolute', left: 10, bottom: 10, padding: '4px 14px', borderRadius: 999, background: T.accent, color: T.onAccent, fontFamily: F.mono, fontSize: 24, fontWeight: 800}}>{s}</div>;
	return (
		<>
			<div style={{...f(0), left: X, width: 200, height: 380}}><Img src={staticFile('assets/site/home-mobile-clean.png')} style={{width: 200}} />{tag('390')}</div>
			<div style={{...f(0.3), left: X + 230, width: W - 230, height: 380}}><Img src={staticFile('assets/site/home-desktop.png')} style={{width: W - 230}} />{tag('1280')}</div>
		</>
	);
};

const Map: React.FC<{t: number; rows: [string, string, number][]}> = ({t, rows}) => {
	const T = useTheme();
	return <>{rows.map(([task, skill, a0], i) => {
		const p = pop(t, a0, 0.4);
		return (
			<div key={skill} style={{position: 'absolute', left: X, width: W, top: 500 + i * 230, opacity: p, transform: `translateX(${(1 - p) * 60}px)`, padding: '24px 30px', borderRadius: 28, background: T.card, border: `2px solid ${T.line}`, textAlign: 'left'}}>
				<div style={{fontFamily: F.body, fontWeight: 800, fontSize: 46}}>{task}</div>
				<div style={{marginTop: 10}}><span style={{fontSize: 40, color: T.accent}}>→ </span><Pill style={{fontSize: 38, fontFamily: F.mono}}>{skill}</Pill></div>
			</div>
		);
	})}</>;
};

const Scenes = (t: number) => {
	const T = useTheme();
	const sad = a('Без'), pw = a('Playwright'), mcp = a('Chrome'), sk = a('Скіли'), main = a('Головне');
	return (
		<>
			<Show t={t} a={0} b={sad}>
				<Title t={t} section="Розробка">Решта <L>MCP і skills</L></Title>
			</Show>
			<Show t={t} a={sad} b={pw}>
				<Box y={560}><Big size={100}>Без них — <span style={{color: T.red}}>сумно</span></Big></Box>
			</Show>
			<Show t={t} a={pw} b={mcp}>
				<Box y={240}><Big size={70}>Playwright = <L>очі AI</L></Big></Box>
				{/* справжня сторінка (shots/playwright-home.png, 1280×900) */}
				<Browser t={t} y={420} url="playwright.dev" h={420}>
					<LiveShot t={t} src="ideas/sites-14/shots/playwright-home.png" w={1280} a={pw + 0.2} />
				</Browser>
				<Devices t={t} a0={a('скріни')} y={980} />
			</Show>
			<Show t={t} a={mcp} b={sk}>
				<Box y={240}><Big size={84}>Ще <L>MCP</L></Big></Box>
				<Steps t={t} y={400} gap={200} size={44} nsize={60} items={[
					['01', <>Chrome DevTools, CodeGraph<br /><span style={{color: T.dim, fontSize: 36}}>швидко шукати код</span></>, mcp],
					['02', 'GitHub', a('GitHub')],
					['03', <>context7<br /><span style={{color: T.dim, fontSize: 36}}>свіжа документація</span></>, a('context7')],
					['04', <>Vercel<br /><span style={{color: T.dim, fontSize: 36}}>викладати сайт</span></>, a('Vercel')],
				]} />
			</Show>
			<Show t={t} a={sk} b={main}>
				<Box y={260}><Big size={84}>Skills <L>під задачу</L></Big></Box>
				<Map t={t} rows={[['Велика сторінка, варіанти', 'ui-ux-pro-max', a('ui-ux')], ['Дрібна правка кнопки', 'frontend-design', a('frontend')], ['Тексти', 'humanizer', a('humanizer')]]} />
			</Show>
			<Show t={t} a={a('свої')} b={Infinity}>
				<Box y={440}><Big size={100}>Знай свої <L>інструменти</L></Big></Box>
				<Box y={760} o={pop(t, a('кликати'))}><Big size={72}>і клич <L>потрібний</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Playwright'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('скріни'), 'camera/camera-shutter-click-1133.wav', 0.35],
	[a('Chrome'), 'pop/soft-pop.wav', 0.3],
	[a('context7'), 'pop/soft-pop.wav', 0.3],
	[a('Скіли'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('humanizer'), 'pop/bubble-pop-406640.mp3', 0.3],
];

export const Sites14: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-14" words={WORDS} next="5 варіантів: секрет швидкого дизайну" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('smile', a('Головне'), a('свої') - a('Головне') - 0.05)]} />
);
