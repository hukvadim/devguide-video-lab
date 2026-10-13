import React from 'react';
import {random} from 'remotion';
import {ramp} from '../system/kit';
import {Big, Box, Chips, Cue, L, Pill, PromptCard, Show, StepVideo, Ticks, Title, at, pop, prompt, stepFrames} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-05/words.json';

// Sites-05 «Один стек на всі сайти» (шлях websites, крок stack). Сценарій: public/ideas/sites-05/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_05 = stepFrames(WORDS);
const TECH = ['React', 'Vue', 'WordPress', 'Svelte', 'Angular', 'Laravel', 'Astro', 'Tilda', 'Django', 'Next.js', 'Nuxt', 'Webflow'];

/** Хаос технологій, що з моменту join злітається в одну пігулку «твій стек». */
const Chaos: React.FC<{t: number; a0: number; join: number}> = ({t, a0, join}) => {
	const k = ramp(t, join, join + 0.6);
	return <>{TECH.map((name, i) => {
		const x = 120 + random(`x${i}`) * 700, y = 300 + random(`y${i}`) * 900, r = (random(`r${i}`) - 0.5) * 30;
		const jit = Math.sin(t * 6 + i) * 8 * (1 - k);
		return (
			<div key={name} style={{position: 'absolute', left: x + (540 - x - 120) * k, top: y + jit + (640 - y) * k, opacity: pop(t, a0 + i * 0.08) * (1 - k), transform: `rotate(${r * (1 - k)}deg) scale(${1 - k * 0.5})`}}>
				<Pill on={false} style={{fontSize: 44}}>{name}</Pill>
			</div>
		);
	})}</>;
};

const Scenes = (t: number) => {
	const chaos = a('шукати'), one = a('Обери'), why = a('Так'), dep = a('Від'), host = a('Переважно'), ask = a('Спитай');
	return (
		<>
			<Show t={t} a={0} b={chaos}>
				<Title t={t} section="Організація">Один стек на <L>всі сайти</L></Title>
			</Show>
			<Show t={t} a={chaos} b={why}>
				<Chaos t={t} a0={chaos} join={one} />
				<Box y={300} o={pop(t, one)}><Big size={96}>Обери <L>один стек</L></Big></Box>
				<Box y={610} o={pop(t, one + 0.4)} style={{transform: `scale(${0.8 + pop(t, one + 0.4) * 0.2})`}}><Pill style={{fontSize: 64, padding: '22px 50px'}}>твій стек</Pill></Box>
				<Chips t={t} y={860} size={46} items={[['лендинги', a('лендинги')], ['візитки', a('візитки')], ['сайти з адмінкою', a('адмінкою')]]} />
			</Show>
			<Show t={t} a={why} b={dep}>
				<Box y={300}><Big size={92}>Так <L>швидше</L></Big></Box>
				<Ticks t={t} y={560} items={[[true, 'працюєш швидше', a('швидше')], [true, 'знаєш, де що лежить', a('знаєш')], [true, <>однакові <L>вказівки</L></>, a('однакові')], [true, 'менше помилок', a('менше')]]} />
			</Show>
			<Show t={t} a={host} b={ask}>
				<Box y={300}><Big size={88}>Залежить від того, <L>де житиме сайт</L></Big></Box>
				<Chips t={t} y={640} size={50} items={[['Vercel', a('Vercel')], ['свій сервер', a('свій')], ['звичайний хостинг', a('звичайний')]]} />
			</Show>
			<Show t={t} a={ask} b={Infinity}>
				<Box y={250}><Big size={76}>Спитай <L>один раз</L></Big></Box>
				<PromptCard t={t} a={ask + 0.3} b={ask + 2.6} y={420} size={38} text={prompt('stack', 'stack').split('\n').slice(0, 2).join('\n')} />
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('шукати'), 'glitch/glitch-crackles-1044.wav', 0.2],
	[a('Обери'), 'whoosh/transition-snap.mp3', 0.35],
	[a('Так'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('Vercel'), 'pop/bubble-pop-389501.mp3', 0.3],
	[a('Спитай'), 'typing/typewriter-digital.mp3', 0.2],
];

export const Sites05: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-05" words={WORDS} next="Skills: та сама сторінка без і з ui-ux-pro-max" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_holding_mug_and_laptop_', a('Від'), a('Переважно') - a('Від') - 0.1, {from: 3, label: <>Від чого <L>залежить</L>?</>, labelY: 1000})]} />
);
