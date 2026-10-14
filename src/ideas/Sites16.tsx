import React from 'react';
import {F} from '../system/kit';
import {Big, Box, Chips, Cue, L, Pill, PromptCard, Reply, Show, StepVideo, Steps, Title, Win, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-16/words.json';

// Sites-16 «Правки: 3 раунди і Trello» (шлях websites, крок client-edits). Сценарій: public/ideas/sites-16/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_16 = stepFrames(WORDS);

/** Цикл правок: вузли по колу з'являються по черзі, активний — останній. */
const Cycle: React.FC<{t: number; items: [string, number][]}> = ({t, items}) => {
	const T = useTheme();
	const cur = items.filter(([, a0]) => t >= a0).length - 1;
	const R = 300, cx = 540, cy = 860;
	return (
		<>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<circle cx={cx} cy={cy} r={R} fill="none" stroke={T.line} strokeWidth={4} strokeDasharray="14 14" opacity={pop(t, items[0][1])} />
			</svg>
			{items.map(([txt, a0], i) => {
				const ang = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
				const p = pop(t, a0, 0.35), on = i === cur;
				return (
					<div key={i} style={{position: 'absolute', left: cx + Math.cos(ang) * R - 150, top: cy + Math.sin(ang) * R - 50, width: 300, textAlign: 'center', opacity: p, transform: `scale(${(0.7 + p * 0.3) * (on ? 1.12 : 1)})`}}>
						<Pill on={on} style={{fontSize: 40}}>{txt}</Pill>
					</div>
				);
			})}
		</>
	);
};

/** Картка правки в колонці «від клієнта»; flag — поза ТЗ, з оцінкою в годинах. */
const Card: React.FC<{t: number; at0: number; text: string; flag?: number; hours?: number}> = ({t, at0, text, flag, hours}) => {
	const T = useTheme();
	const p = pop(t, at0), bad = flag != null && t >= flag;
	return (
		<div style={{opacity: p, transform: `translateY(${(1 - p) * 24}px)`, padding: '20px 24px', borderRadius: 16, background: T.panel2, border: `3px solid ${bad ? T.red : T.line}`, fontSize: 40, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
			<span>{text}</span>
			{bad ? <span style={{fontSize: 30, color: T.red, fontWeight: 800}}>не в ТЗ{hours != null && t >= hours ? ' · +6 год' : ''}</span> : null}
		</div>
	);
};

const Scenes = (t: number) => {
	const T = useTheme();
	const story = a('безкоштовно'), deal = a('Тому'), wait = a('І', 17), loop = a('Цикл'), msg = a('Правки', 32), ai = a('Кидаєш'), talk = a('Спірне'), fin = a('Так', 54);
	return (
		<>
			<Show t={t} a={0} b={a('Я')}>
				<Title t={t} section="Правки">Правки: <L>3 раунди</L> і Trello</Title>
			</Show>
			<Show t={t} a={story} b={deal}>
				<Box y={240}><Big size={76}>Безкоштовно… <span style={{color: T.red}}>і ще, і ще</span></Big></Box>
				<Steps t={t} y={470} gap={180} items={[['1', 'поправив кнопку', a('поправив')], ['2', '«а давайте в базу»', a('давайте')], ['3', 'форма', a('форма')], ['4', 'пошта…', a('пошта')]]} />
			</Show>
			<Show t={t} a={deal} b={wait}>
				<Box y={280}><Big size={88}>Домовляйся <L>одразу</L></Big></Box>
				<Box y={540} style={{display: 'flex', justifyContent: 'center', gap: 22}}>
					{['1', '2', '3'].map((n, i) => <span key={n} style={{opacity: pop(t, a('три') + i * 0.2)}}><Pill style={{fontSize: 64, padding: '18px 40px'}}>{n}</Pill></span>)}
				</Box>
				<Box y={700} o={pop(t, a('безкоштовно', 14))}><Big size={62}>раунди <L>безкоштовно</L></Big></Box>
				<Box y={900} o={pop(t, a('далі'))}><Big size={62}>далі — <L>за твою ставку</L></Big></Box>
			</Show>
			<Show t={t} a={wait} b={loop}>
				<Box y={420}><Big size={92}>Не <span style={{color: T.red}}>того ж дня</span></Big></Box>
				<Box y={680} o={pop(t, a('Чекаєш'))}><Big size={76}>Чекаєш, поки клієнт <L>збере все</L></Big></Box>
			</Show>
			<Show t={t} a={loop} b={msg}>
				<Box y={240}><Big size={84}>Цикл <L>простий</L></Big></Box>
				<Cycle t={t} items={[['показав', a('показав')], ['правки', a('написав')], ['Trello', a('Trello')], ['зробив', a('зробив')], ['показав знову', a('показав', 27)]]} />
			</Show>
			<Show t={t} a={msg} b={ai}>
				<Chips t={t} y={250} size={42} items={[['Telegram', a('Telegram')], ['Viber', a('Viber')]]} />
				<Win y={400} label="Месенджер · клієнт" minH={420}>
					<div style={{alignSelf: 'flex-start', width: 420, height: 200, borderRadius: 18, background: T.panel2, border: `2px dashed ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 30, color: T.dim, opacity: pop(t, a('скріни'))}}>скрін сайту</div>
					<Reply o={pop(t, a('копіюєш'))} size={42}>Кнопку зробіть зеленою, і телефон у контактах інший. І ще онлайн-оплату</Reply>
				</Win>
			</Show>
			<Show t={t} a={ai} b={talk}>
				<PromptCard t={t} a={ai + 0.2} b={a('трьох')} y={220} size={34} text={prompt('client-edits', 'apply').split('\n')[0]} />
				<Win y={640} label="Trello · від клієнта" minH={560} o={pop(t, a('кладе'))}>
					<Card t={t} at0={a('розбиває')} text="Кнопка — зелена" />
					<Card t={t} at0={a('розбиває') + 0.3} text="Новий телефон у контактах" />
					<Card t={t} at0={a('розбиває') + 0.6} text="Онлайн-оплата" flag={a('суперечить')} hours={a('оцінкою')} />
				</Win>
			</Show>
			<Show t={t} a={talk} b={fin}>
				<Box y={380}><Big size={84}>Спірне — <L>обговорюєш</L></Big></Box>
				<Box y={640} o={pop(t, a('решту'))}><Big size={84}>решту — <L>робиш</L></Big></Box>
			</Show>
			<Show t={t} a={fin} b={Infinity}>
				<Box y={420}><Big size={96}>Не пів року <span style={{color: T.red}}>безкоштовно</span></Big></Box>
				<Box y={760} o={pop(t, a('пів', 55))}><Big size={84}>3 раунди — <L>і крапка</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('поправив'), 'pop/soft-pop.wav', 0.3],
	[a('давайте'), 'pop/soft-pop.wav', 0.3],
	[a('форма'), 'pop/soft-pop.wav', 0.3],
	[a('пошта'), 'glitch/small-electric-glitch-2595.wav', 0.3],
	[a('три'), 'impact/bass-hit-futuristic.mp3', 0.3],
	[a('Цикл'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('Telegram'), 'notify/notification-3-398649.mp3', 0.25],
	[a('кладе'), 'pop/soft-pop.wav', 0.3],
	[a('суперечить'), 'glitch/small-electric-glitch-2595.wav', 0.25],
	[a('Так', 54), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Sites16: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-16" words={WORDS} next="Сайт працює" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('facepalm', a('Я'), a('безкоштовно') - a('Я') - 0.1, {label: <>6 місяців <L>на правки</L></>, labelY: 1000})]} />
);
