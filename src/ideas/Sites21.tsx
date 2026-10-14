import React from 'react';
import {F, ramp} from '../system/kit';
import {Big, Box, Browser, Chips, Cue, L, LiveShot, PromptCard, Show, StepVideo, Strike, Title, X, W, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import WORDS from '../../public/ideas/sites-21/words.json';

// Sites-21 «Швидкість і доступність» (шлях websites, крок performance). Сценарій: public/ideas/sites-21/scenario.md.
// Скріни — справжній звіт PageSpeed для devguide.com.ua від 2026-10-13 (телефон 69, ПК 97).
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_21 = stepFrames(WORDS);
const MOB = 'ideas/sites-21/shots/pagespeed-mobile.png', PC = 'ideas/sites-21/shots/pagespeed-desktop.png';

/** Шкала 0–100: червона половина до 50 і зелена після, підписи з моментів bad/good. */
const Scale: React.FC<{t: number; bad: number; good: number}> = ({t, bad, good}) => {
	const T = useTheme();
	const g = '#2FBF71';
	return (
		<div style={{position: 'absolute', left: X, top: 640, width: W}}>
			<div style={{display: 'flex', height: 70, borderRadius: 35, overflow: 'hidden', border: `2px solid ${T.line}`}}>
				<div style={{flex: 1, background: T.red, opacity: 0.25 + 0.75 * pop(t, bad)}} />
				<div style={{flex: 1, background: g, opacity: 0.25 + 0.75 * pop(t, good)}} />
			</div>
			<div style={{position: 'absolute', left: W / 2 - 3, top: -20, width: 6, height: 110, background: T.text}} />
			<div style={{position: 'absolute', left: W / 2 - 60, top: 100, width: 120, textAlign: 'center', fontFamily: F.mono, fontWeight: 800, fontSize: 40}}>50</div>
			<div style={{position: 'absolute', left: 0, top: 180, width: W / 2 - 20, textAlign: 'center', opacity: pop(t, bad)}}><Big size={60} style={{color: T.red}}>погано</Big></div>
			<div style={{position: 'absolute', right: 0, top: 180, width: W / 2 - 20, textAlign: 'center', opacity: pop(t, good)}}><Big size={60} style={{color: g}}>добре</Big></div>
		</div>
	);
};

const Scenes = (t: number) => {
	const T = useTheme();
	const check = a('перевіряємо'), rec = a('Важливо'), scale = a('Менше'), real = a('Ось'), low = a('Якщо'), usual = a('Зазвичай'), share = a('І', 39);
	const pc = a('комп', 20), mob = a('телефоні', 22);
	return (
		<>
			<Show t={t} a={0} b={check}>
				<Title t={t} section="Запуск">Швидкість <L>і доступність</L></Title>
			</Show>
			<Show t={t} a={check} b={rec}>
				<Box y={240}><Big size={70}><L>Google</L> PageSpeed</Big></Box>
				<Browser t={t} y={440} url="pagespeed.web.dev" h={620}>
					<LiveShot t={t} src={MOB} w={1280} a={check + 0.2} focus={{x: 153, y: 127, w: 813, h: 48, at: a('Google'), zoom: 1.3}} />
				</Browser>
			</Show>
			<Show t={t} a={rec} b={scale}>
				<Box y={400}><Big size={96}>Рекомендація, <L>не іспит</L></Big></Box>
				<Box y={700} o={pop(t, a('сто'))}><Big size={88}><Strike p={ramp(t, a('балів'), a('балів') + 0.5)}>100 балів</Strike> не обов'язково</Big></Box>
			</Show>
			<Show t={t} a={scale} b={real}>
				<Box y={300}><Big size={84}>Межа — <L>50</L></Big></Box>
				<Scale t={t} bad={a('погано')} good={a('Вище')} />
			</Show>
			<Show t={t} a={real} b={low}>
				<Box y={230}><Big size={64}>Наш <L>DevGuide</L></Big></Box>
				<Browser t={t} y={360} url="Комп'ютер · 97" h={360} o={pop(t, pc)}>
					<LiveShot t={t} src={PC} w={1280} a={pc} b={pc + 0.01} scroll={480} focus={{x: 322, y: 622, w: 124, h: 124, at: pc + 0.2, zoom: 1.5}} />
				</Browser>
				<Browser t={t} y={830} url="Мобільний · 69" h={360} o={pop(t, mob)}>
					<LiveShot t={t} src={MOB} w={1280} a={mob} b={mob + 0.01} scroll={480} focus={{x: 322, y: 622, w: 124, h: 124, at: mob + 0.2, zoom: 1.5}} />
				</Browser>
				<Box y={1250} o={pop(t, a('Нормально'))}><Big size={60}><L>Нормально</L> ✓</Big></Box>
			</Show>
			<Show t={t} a={low} b={usual}>
				<Box y={230}><Big size={76}>Не все <span style={{color: T.red}}>підряд</span></Big></Box>
				<PromptCard t={t} a={a('Кидаєш')} b={a('після')} y={420} size={36} text={prompt('performance', 'speed')} />
				<Box y={1050} o={pop(t, a('топ'))}><Big size={60}>топ-3 · <L>до і після</L></Big></Box>
			</Show>
			<Show t={t} a={usual} b={share}>
				<Box y={300}><Big size={80}>Зазвичай <L>це</L></Big></Box>
				<Chips t={t} y={560} size={54} items={[['картинки', a('картинки')], ['шрифти', a('шрифти')], ['зайвий код', a('зайвий')]]} />
			</Show>
			<Show t={t} a={share} b={Infinity}>
				<Box y={250}><Big size={80}>Звіт — <L>клієнту</L></Big></Box>
				<Browser t={t} y={420} url="pagespeed.web.dev" h={560}>
					<LiveShot t={t} src={PC} w={1280} a={share + 0.2} focus={{x: 969, y: 14, w: 196, h: 36, at: a('поділитися'), zoom: 1.5}} />
				</Browser>
				<Box y={1120} o={pop(t, a('Ось', 43))}><Big size={64}>Google каже: <span style={{color: '#2FBF71'}}>все добре ✓</span></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Google'), 'typing/typewriter-digital.mp3', 0.2],
	[a('балів'), 'glitch/small-electric-glitch-2595.wav', 0.25],
	[a('погано'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('Вище'), 'pop/bubble-pop-389501.mp3', 0.3],
	[a('комп', 20), 'pop/soft-pop.wav', 0.3],
	[a('Кидаєш'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('поділитися') + 0.3, 'click/mouse-click-352734.mp3', 0.4],
	[a('Ось', 43), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Sites21: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-21" words={WORDS} next="Керування після запуску" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes} />
);
