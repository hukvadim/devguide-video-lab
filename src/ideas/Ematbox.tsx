import React from 'react';
import {Img, staticFile} from 'remotion';
import {F} from '../system/kit';
import {BRAND, useTheme} from '../system/theme';
import {Big, Box, Browser, Cue, L, LiveShot, Pill, Show, StepVideo, Title, at, pop, stepFrames} from '../system/step';
import WORDS from '../../public/ideas/ematbox/words.json';

// Промо для ematbox.com (спільнота модерів редактора StarCraft 2), ~30 с, англійською: голос клон Вадима (eleven_v4).
// Факти лише з сайту (2026-10-13): «Education modding and toolbox», 600 Members у Discord, безкоштовні матеріали, стріми/туторіали, GalaxyScript · XML · GUI.
// Сценарій і джерела: public/ideas/ematbox/sources.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const EMATBOX = stepFrames(WORDS);

// палітра під сайт: темно-синій фон, блакитний акцент
const THEME = {...BRAND, bg: '#14152B', accent: '#7C98FF', accentDeep: '#5570E0', onAccent: '#0B0C1E', glow: '#6C8CFF', glow2: '#8EDFFF', panel: '#0E1024F2', panel2: '#1E2140', card: '#161833'};

const Shot: React.FC<{t: number; at: number; y: number; src: string; w: number; ratio: number}> = ({t, at: a0, y, src, w, ratio}) => {
	const T = useTheme();
	const o = pop(t, a0, 0.45);
	return (
		<div style={{position: 'absolute', left: (1080 - w) / 2, top: y, width: w, height: w * ratio, opacity: o, transform: `translateY(${(1 - o) * 40}px) scale(${0.94 + o * 0.06})`, borderRadius: 24, overflow: 'hidden', border: `2px solid ${T.line}`, boxShadow: '0 40px 100px #000000A0'}}>
			<Img src={staticFile(`ideas/ematbox/shots/${src}`)} style={{width: '100%', height: '100%', display: 'block', objectFit: 'cover'}} />
		</div>
	);
};

const Scenes = (t: number) => {
	const name = a('EMaTbox'), land = a('Shape'), feat = a('Test'), cut = a('Add'), les = a('Free'), disc = a('Six'), join = a('Join');
	return (
		<>
			<Show t={t} a={0} b={name}>
				<Title t={t} section="StarCraft 2 modding" y={230} size={88}>From an idea to <L>your own game</L></Title>
				<Browser t={t} y={780} url="ematbox.com" h={470}>
					<LiveShot t={t} src="ideas/ematbox/shots/hero.png" w={1504} a={0.9} />
				</Browser>
			</Show>
			<Show t={t} a={name} b={land}>
				<Box y={300}><Big size={120}>EMa<L>Tbox</L></Big></Box>
				<Box y={500} o={pop(t, a('community'))}><Big size={46} style={{opacity: 0.9, whiteSpace: "nowrap"}}>Education · Modding · Toolbox</Big></Box>
				<Box y={760} o={pop(t, a('StarCraft'))}><Pill style={{fontSize: 56, padding: '24px 54px'}}>SC2 editor modders</Pill></Box>
			</Show>
			<Show t={t} a={land} b={feat}>
				<Box y={260}><Big size={100}>Shape your <L>landscape</L></Big></Box>
				<Shot t={t} at={land + 0.5} y={560} src="land.png" w={856} ratio={350 / 600} />
			</Show>
			<Show t={t} a={feat} b={cut}>
				<Box y={260}><Big size={92}>Test it <L>with friends</L></Big></Box>
				<Shot t={t} at={feat + 0.4} y={560} src="feat.png" w={856} ratio={350 / 600} />
				<Box y={1130} o={pop(t, a("right"))}><Pill style={{fontSize: 50}}>right out of the box</Pill></Box>
			</Show>
			<Show t={t} a={cut} b={les}>
				<Box y={260}><Big size={100}>Cutscene → <L>cinema</L></Big></Box>
				<Shot t={t} at={cut + 0.4} y={560} src="cut.png" w={856} ratio={350 / 600} />
			</Show>
			<Show t={t} a={les} b={disc}>
				<Box y={220}><Big size={100}>Free <L>lessons</L></Big></Box>
				<Shot t={t} at={les + 0.3} y={460} src="lessons.png" w={856} ratio={560 / 1260} />
				{[['Streams', a('streams')], ['Tutorials', a('tutorials')], ['GalaxyScript', a('GalaxyScript,')], ['XML', a('XML')], ['GUI', a('GUI.')]].map(([s, at0], i) => (
					<span key={s as string} style={{position: 'absolute', left: [150, 460, 150, 560, 720][i], top: [900, 900, 1020, 1020, 1020][i], opacity: pop(t, at0 as number, 0.3), transform: `scale(${0.8 + pop(t, at0 as number, 0.3) * 0.2})`}}>
						<Pill style={{fontSize: 46}}>{s}</Pill>
					</span>
				))}
			</Show>
			<Show t={t} a={disc} b={join}>
				<Box y={320}><Big size={150}><L>600</L></Big></Box>
				<Box y={540}><Big size={84}>members on <L>Discord</L></Big></Box>
				<Box y={860} o={pop(t, a('Any'))}><Big size={64} style={{opacity: 0.9}}>Any experience is your <L>starting point</L></Big></Box>
			</Show>
			<Show t={t} a={join} b={Infinity}>
				<Box y={560}><Big size={120}>Join <L>EMaTbox</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('EMaTbox'), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('Shape'), 'pop/bubble-pop-389501.mp3', 0.3],
	[a('Add'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
	[a('Free'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('Six'), 'whoosh/whoosh-end-384629.mp3', 0.3],
];

/** Фінальна картка під сайт друга: без DevGuide, лише назва, адреса й Discord. */
const End = (t: number, c: number) => (
	<Show t={t} a={c} b={Infinity}>
		<Box y={520} o={pop(t, c, 0.5)}><Big size={150}>EMa<L>Tbox</L></Big></Box>
		<Box y={760} o={pop(t, c + 0.4)}><span style={{fontFamily: F.mono, fontSize: 32, letterSpacing: 5, opacity: 0.7, textTransform: 'uppercase'}}>Education modding and toolbox</span></Box>
		<Box y={1000} o={pop(t, c + 0.8)}><Pill style={{fontSize: 52, padding: '24px 50px', background: THEME.accent, color: THEME.onAccent, borderColor: THEME.accent}}>ematbox.com →</Pill></Box>
	</Show>
);

export const Ematbox: React.FC = () => (
	<StepVideo theme={THEME} dir="ideas/ematbox" words={WORDS} sfx={SFX} scenes={Scenes} endCard={End} />
);
