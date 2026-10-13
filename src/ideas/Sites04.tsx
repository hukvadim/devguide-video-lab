import React from 'react';
import {Big, Box, Browser, Chips, Cue, L, LiveShot, Pill, Show, StepVideo, Steps, Term, Ticks, Title, at, pop, stepFrames} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-04/words.json';

// Sites-04 «Домен, хостинг і де житиме сайт» (шлях websites, крок domain-hosting). Сценарій: public/ideas/sites-04/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_04 = stepFrames(WORDS);

const Opt: React.FC<{t: number; n: string; at: number; children: React.ReactNode}> = ({t, n, at: a0, children}) => <Steps t={t} y={300} items={[[n, children, a0]]} size={56} />;

const Scenes = (t: number) => {
	const host = a('Хостинг'), both = a('Це', 4.5), where = a('Де', 8), o1 = a('Варіант'), o2 = a('Варіант', 16), o3 = a('Варіант', 22), setup = a('Його', 29);
	return (
		<>
			<Show t={t} a={0} b={a('сайту')}>
				<Title t={t} section="Організація" size={96}>Домен, хостинг і де <L>житиме сайт</L></Title>
			</Show>
			<Show t={t} a={a('сайту')} b={both}>
				<Box y={300}><Big size={84}>Домен = <L>адреса</L></Big></Box>
				<Browser t={t} y={500} url="zerno.com.ua" typeAt={a('сайту') + 0.2} h={0} />
				<Box y={740} o={pop(t, host)}><Big size={80}>Хостинг = <L>де лежать файли</L></Big></Box>
				<Chips t={t} y={1060} items={[['index.html', a('лежать')], ['style.css', a('його')], ['фото', a('файли')]]} />
			</Show>
			<Show t={t} a={both} b={where}>
				<Box y={420}><Big size={100}>Дві різні речі</Big></Box>
				<Box y={640} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
					<span style={{opacity: pop(t, a('дві'))}}><Pill style={{fontSize: 52}}>домен</Pill></span>
					<span style={{fontSize: 64, opacity: pop(t, a('різні'))}}>+</span>
					<span style={{opacity: pop(t, a('різні'))}}><Pill style={{fontSize: 52}}>хостинг</Pill></span>
				</Box>
				<Box y={860} o={pop(t, a('платить'))}><Big size={72}>Клієнт платить <L>за обидва</L></Big></Box>
			</Show>
			<Show t={t} a={o1} b={o2}>
				<Opt t={t} n="1" at={o1}>Звичайний хостинг</Opt>
				<Ticks t={t} y={560} items={[[true, 'дешево', a('Дешево')], [false, 'ліміт на кількість сайтів', a('кількість')], [false, 'ліміт на запити', a('запити')]]} />
			</Show>
			<Show t={t} a={o2} b={o3}>
				<Opt t={t} n="2" at={o2}>Vercel</Opt>
				{/* справжня сторінка (shots/vercel-home.png, 1280×900), рамка на «Deploy now» */}
				<Browser t={t} y={540} url="vercel.com" h={560}>
					<LiveShot t={t} src="ideas/sites-04/shots/vercel-home.png" w={1280} a={o2 + 0.4} focus={{x: 24, y: 488, w: 124, h: 40, at: a('Підключив'), zoom: 1.7}} />
				</Browser>
				<Box y={1240} o={pop(t, a('працює'))}><Big size={64}>Підключив домен — <L>працює</L></Big></Box>
			</Show>
			<Show t={t} a={o3} b={setup}>
				<Opt t={t} n="3" at={o3}>Свій VPS-сервер</Opt>
				<Ticks t={t} y={560} items={[[true, 'дешевше, коли сайтів багато', a('дешевший')], [true, 'руки розв\'язані', a('руки')], [false, 'треба налаштувати', setup - 0.3]]} />
			</Show>
			<Show t={t} a={setup} b={Infinity}>
				<Box y={300}><Big size={88}>Налаштує <L>Claude Code</L></Big></Box>
				<Term t={t} y={540} minH={420} label="Claude Code → VPS" lines={[
					{at: a('зайти'), text: 'ssh root@my-vps'},
					{at: a('сервер', a('зайти')), text: '✓ nginx встановлено', kind: 'ok'},
					{at: a('зробити'), text: '✓ SSL-сертифікат', kind: 'ok'},
					{at: a('сам'), text: '✓ сайт працює', kind: 'ok'},
				]} />
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Хостинг'), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('Варіант'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('Варіант', 16), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('Підключив') + 0.3, 'click/mouse-click-352734.mp3', 0.4],
	[a('Варіант', 22), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('сам'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Sites04: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-04" words={WORDS} next="Один стек на всі сайти" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_drawing_diagram_on_whiteboard', a('Де', 8), a('Варіант') - a('Де', 8) - 0.1, {label: <>Де житиме <L>сайт</L>?</>, labelY: 1000})]} />
);
