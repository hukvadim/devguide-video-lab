import React from 'react';
import {random} from 'remotion';
import {ramp} from '../system/kit';
import {at, Big, Box, Chips, Cue, Fit, L, LHead, Pill, pop, prompt, PromptCard, Show, stepFrames, StepVideo, Ticks, Title} from '../system/step';
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
	const chaos = a('шукати'), one = a('Обери'), why = a('Чому'), dep = a('Від'), host = a('Переважно'), what = a('Що', 36), last = a('Спитай', 49), next = a('Новий');
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
				<Box y={260}><Big size={88}>Чому <L>так</L>?</Big></Box>
				<Ticks t={t} y={480} items={[[true, 'працюєш швидше', a('швидше')], [true, 'знаєш, де що лежить', a('знаєш')], [true, <>однакові <L>вказівки</L> для AI</>, a('однакові')], [true, 'менше помилок', a('менше')], [true, 'інструменти — один раз', a('налаштував')]]} />
			</Show>
			<Show t={t} a={host} b={what}>
				<Box y={300}><Big size={84}>Залежить від того, <L>де житиме сайт</L></Big></Box>
				<Chips t={t} y={640} size={50} items={[['Vercel', a('Vercel')], ['свій сервер', a('свій')], ['звичайний хостинг', a('звичайний')]]} />
			</Show>
			<Show t={t} a={what} b={last}>
				<Box y={250}><Big size={84}>Що <L>питати</L>?</Big></Box>
				<PromptCard t={t} a={a('Опиши')} b={a('форм')} y={420} size={36} text={prompt('stack', 'stack').split('\n').slice(0, 3).join('\n')} />
				<Chips t={t} y={1110} size={44} items={[['верстка', a('верстки')], ['адмінка', a('адмінки')], ['форми', a('форм')]]} />
				<Box y={1250} o={pop(t, a('інший'))}><Big size={56}>+ коли взяти <L>інший</L>?</Big></Box>
			</Show>
			<Show t={t} a={last} b={next}>
				<Box y={440}><Big size={100}>Спитай <L>один раз</L></Big></Box>
				<Box y={720} o={pop(t, a('працюй'))}><Big size={84}>і далі <L>просто працюй</L></Big></Box>
			</Show>
			<Show t={t} a={next} b={Infinity}>
				<Box y={380}><Big size={92}>Новий клієнт</Big></Box>
				<Box y={560} o={pop(t, a('той'))}><Big size={100}>→ <L>той самий стек</L></Big></Box>
				<Ticks t={t} y={860} items={[[true, 'вже знаєш, як робити', a('знаєш', 55)]]} />
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('шукати'), 'glitch/glitch-crackles-1044.wav', 0.2],
	[a('Обери'), 'whoosh/transition-snap.mp3', 0.35],
	[a('Чому'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('Новий'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
	[a('Vercel'), 'pop/bubble-pop-389501.mp3', 0.3],
	[a('Опиши'), 'typing/typewriter-digital.mp3', 0.2],
];

export const Sites05: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-05" words={WORDS} next="Skills: та сама сторінка без і з ui-ux-pro-max" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_holding_mug_and_laptop_', a('Від'), a('Переважно') - a('Від') - 0.1, {from: 3, label: <>Від чого <L>залежить</L>?</>, labelY: 1000})]} />
);

// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------
const ScenesWide = (t: number) => {
	const chaos = a('шукати'), one = a('Обери'), why = a('Чому'), dep = a('Від'), host = a('Переважно'), what = a('Що', 36), last = a('Спитай', 49), next = a('Новий');
	return (
		<>
			<Show t={t} a={0} b={chaos}>
				<Fit from={420} to={1100} center>
					<Title t={t} section="Організація">Один стек на <L>всі сайти</L></Title>
				</Fit>
			</Show>
			<Show t={t} a={chaos} b={why}>
				<LHead size={92}>Обери <L>один стек</L></LHead>
				<Fit from={420} to={1340}>
					<Chaos t={t} a0={chaos} join={one} />
					<Box y={610} o={pop(t, one + 0.4)} style={{transform: `scale(${0.8 + pop(t, one + 0.4) * 0.2})`}}><Pill style={{fontSize: 64, padding: '22px 50px'}}>твій стек</Pill></Box>
					<Chips t={t} y={860} size={46} items={[['лендинги', a('лендинги')], ['візитки', a('візитки')], ['сайти з адмінкою', a('адмінкою')]]} />
				</Fit>
			</Show>
			<Show t={t} a={why} b={dep}>
				<LHead size={88}>Чому <L>так</L>?</LHead>
				<Fit from={440} to={1130}>
					<Ticks t={t} y={480} items={[[true, 'працюєш швидше', a('швидше')], [true, 'знаєш, де що лежить', a('знаєш')], [true, <>однакові <L>вказівки</L> для AI</>, a('однакові')], [true, 'менше помилок', a('менше')], [true, 'інструменти — один раз', a('налаштував')]]} />
				</Fit>
			</Show>
			<Show t={t} a={host} b={what}>
				<LHead size={84}>Залежить від того, <L>де житиме сайт</L></LHead>
				<Fit from={600} to={860}>
					<Chips t={t} y={640} size={50} items={[['Vercel', a('Vercel')], ['свій сервер', a('свій')], ['звичайний хостинг', a('звичайний')]]} />
				</Fit>
			</Show>
			<Show t={t} a={what} b={last}>
				<LHead size={84}>Що <L>питати</L>?</LHead>
				<Fit from={380} to={1470}>
					<PromptCard t={t} a={a('Опиши')} b={a('форм')} y={420} size={36} text={prompt('stack', 'stack').split('\n').slice(0, 3).join('\n')} />
					<Chips t={t} y={1110} size={44} items={[['верстка', a('верстки')], ['адмінка', a('адмінки')], ['форми', a('форм')]]} />
					<Box y={1250} o={pop(t, a('інший'))}><Big size={56}>+ коли взяти <L>інший</L>?</Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={last} b={next}>
				<Fit from={400} to={940} center>
					<Box y={440}><Big size={100}>Спитай <L>один раз</L></Big></Box>
					<Box y={720} o={pop(t, a('працюй'))}><Big size={84}>і далі <L>просто працюй</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={next} b={Infinity}>
				<LHead size={92}>Новий клієнт</LHead>
				<Fit from={520} to={1080}>
					<Box y={560} o={pop(t, a('той'))}><Big size={100}>→ <L>той самий стек</L></Big></Box>
					<Ticks t={t} y={860} items={[[true, 'вже знаєш, як робити', a('знаєш', 55)]]} />
				</Fit>
			</Show>
		</>
	);
};

export const Sites05Wide: React.FC<{theme?: string; seed?: number; kicker?: React.ReactNode}> = ({theme, seed, kicker}) => (
	<StepVideo wide kicker={kicker} theme={theme} seed={seed} dir="ideas/sites-05" words={WORDS} next="Skills: та сама сторінка без і з ui-ux-pro-max" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={ScenesWide}
		inserts={[ugc('Man_holding_mug_and_laptop_', a('Від'), a('Переважно') - a('Від') - 0.1, {from: 3, label: <>Від чого <L>залежить</L>?</>, labelY: 1000})]} />
);
