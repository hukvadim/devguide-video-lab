import React from 'react';
import {Img, staticFile} from 'remotion';
import {F} from '../system/kit';
import {at, Big, Box, Browser, Cue, Fit, L, LHead, LiveShot, Pill, pop, prompt, PromptCard, Show, stepFrames, Steps, StepVideo, Ticks, Title, useTheme, W, X} from '../system/step';
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
	const sad = a('Без'), pw = a('Playwright'), mcp = a('Chrome'), sk = a('Скіли'), inst = a('Ставити'), chk = a('Перевірка'), main = a('Головне');
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
				<Steps t={t} y={390} gap={150} size={40} nsize={48} items={[
					['01', <>Chrome DevTools <span style={{color: T.dim, fontSize: 32}}>· помилки, швидкість</span></>, mcp],
					['02', <>CodeGraph <span style={{color: T.dim, fontSize: 32}}>· пошук коду</span></>, a('CodeGraph')],
					['03', <>GitHub <span style={{color: T.dim, fontSize: 32}}>· версії, публікація</span></>, a('GitHub')],
					['04', <>context7 <span style={{color: T.dim, fontSize: 32}}>· свіжа документація</span></>, a('context7')],
					['05', <>Vercel <span style={{color: T.dim, fontSize: 32}}>· викладати</span></>, a('Vercel')],
					['06', <>Postgres <span style={{color: T.dim, fontSize: 32}}>· якщо є база</span></>, a('Postgres')],
				]} />
			</Show>
			<Show t={t} a={sk} b={inst}>
				<Box y={260}><Big size={84}>Skills <L>під задачу</L></Big></Box>
				<Map t={t} rows={[['Велика сторінка, варіанти', 'ui-ux-pro-max', a('ui-ux')], ['Дрібна правка кнопки', 'frontend-design', a('frontend')], ['Тексти', 'humanizer', a('humanizer')]]} />
			</Show>
			<Show t={t} a={inst} b={chk}>
				<Box y={240}><Big size={80}>Руками <L>не треба</L></Big></Box>
				<PromptCard t={t} a={a('даєш')} b={a('команди')} y={420} size={34} text={prompt('mcp-skills', 'install').split('\n')[0]} />
				<Ticks t={t} y={780} items={[[true, 'показує команди', a('показує')], [true, 'ти кажеш «ок»', a('кажеш')], [true, 'все встановлено', a('встановлено')]]} />
			</Show>
			<Show t={t} a={chk} b={main}>
				<Box y={240}><Big size={80}>Перевірка</Big></Box>
				<PromptCard t={t} a={a('попроси')} b={a('сайту')} y={400} size={36} text={prompt('mcp-skills', 'check')} />
				<Devices t={t} a0={a('скріни', 54)} y={900} />
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
	[a('Ставити'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('встановлено'), 'sparkle/sparkle-touch.mp3', 0.3],
	[a('скріни', 54), 'camera/camera-shutter-click-1133.wav', 0.35],
];

export const Sites14: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-14" words={WORDS} next="5 варіантів: секрет швидкого дизайну" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('smile', a('Головне'), a('свої') - a('Головне') - 0.05)]} />
);

// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------
const ScenesWide = (t: number) => {
	const T = useTheme();
	const sad = a('Без'), pw = a('Playwright'), mcp = a('Chrome'), sk = a('Скіли'), inst = a('Ставити'), chk = a('Перевірка'), main = a('Головне');
	return (
		<>
			<Show t={t} a={0} b={sad}>
				<Fit from={420} to={1100} center>
					<Title t={t} section="Розробка">Решта <L>MCP і skills</L></Title>
				</Fit>
			</Show>
			<Show t={t} a={sad} b={pw}>
				<Fit from={520} to={780} center>
					<Box y={560}><Big size={100}>Без них — <span style={{color: T.red}}>сумно</span></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={pw} b={mcp}>
				<LHead size={70}>Playwright = <L>очі AI</L></LHead>
				<Fit from={380} to={1340}>
					{/* справжня сторінка (shots/playwright-home.png, 1280×900) */}
					<Browser t={t} y={420} url="playwright.dev" h={420}>
						<LiveShot t={t} src="ideas/sites-14/shots/playwright-home.png" w={1280} a={pw + 0.2} />
					</Browser>
					<Devices t={t} a0={a('скріни')} y={980} />
				</Fit>
			</Show>
			<Show t={t} a={mcp} b={sk}>
				<LHead size={84}>Ще <L>MCP</L></LHead>
				<Fit from={350} to={900}>
					<Steps t={t} y={390} gap={150} size={40} nsize={48} items={[
						['01', <>Chrome DevTools <span style={{color: T.dim, fontSize: 32}}>· помилки, швидкість</span></>, mcp],
						['02', <>CodeGraph <span style={{color: T.dim, fontSize: 32}}>· пошук коду</span></>, a('CodeGraph')],
						['03', <>GitHub <span style={{color: T.dim, fontSize: 32}}>· версії, публікація</span></>, a('GitHub')],
						['04', <>context7 <span style={{color: T.dim, fontSize: 32}}>· свіжа документація</span></>, a('context7')],
						['05', <>Vercel <span style={{color: T.dim, fontSize: 32}}>· викладати</span></>, a('Vercel')],
						['06', <>Postgres <span style={{color: T.dim, fontSize: 32}}>· якщо є база</span></>, a('Postgres')],
					]} />
				</Fit>
			</Show>
			<Show t={t} a={sk} b={inst}>
				<LHead size={84}>Skills <L>під задачу</L></LHead>
				<Fit from={420} to={1340}>
					<Map t={t} rows={[['Велика сторінка, варіанти', 'ui-ux-pro-max', a('ui-ux')], ['Дрібна правка кнопки', 'frontend-design', a('frontend')], ['Тексти', 'humanizer', a('humanizer')]]} />
				</Fit>
			</Show>
			<Show t={t} a={inst} b={chk}>
				<LHead size={80}>Руками <L>не треба</L></LHead>
				<Fit from={380} to={1194}>
					<PromptCard t={t} a={a('даєш')} b={a('команди')} y={420} size={34} text={prompt('mcp-skills', 'install').split('\n')[0]} />
					<Ticks t={t} y={780} items={[[true, 'показує команди', a('показує')], [true, 'ти кажеш «ок»', a('кажеш')], [true, 'все встановлено', a('встановлено')]]} />
				</Fit>
			</Show>
			<Show t={t} a={chk} b={main}>
				<LHead size={80}>Перевірка</LHead>
				<Fit from={360} to={1120}>
					<PromptCard t={t} a={a('попроси')} b={a('сайту')} y={400} size={36} text={prompt('mcp-skills', 'check')} />
					<Devices t={t} a0={a('скріни', 54)} y={900} />
				</Fit>
			</Show>
			<Show t={t} a={a('свої')} b={Infinity}>
				<Fit from={400} to={980} center>
					<Box y={440}><Big size={100}>Знай свої <L>інструменти</L></Big></Box>
					<Box y={760} o={pop(t, a('кликати'))}><Big size={72}>і клич <L>потрібний</L></Big></Box>
				</Fit>
			</Show>
		</>
	);
};

export const Sites14Wide: React.FC<{theme?: string; seed?: number; kicker?: React.ReactNode}> = ({theme, seed, kicker}) => (
	<StepVideo wide kicker={kicker} theme={theme} seed={seed} dir="ideas/sites-14" words={WORDS} next="5 варіантів: секрет швидкого дизайну" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={ScenesWide}
		inserts={[ugc('smile', a('Головне'), a('свої') - a('Головне') - 0.05)]} />
);
