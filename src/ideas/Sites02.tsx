import React from 'react';
import {ramp} from '../system/kit';
import {at, Big, Box, Browser, Chips, Cue, Fit, L, LHead, LiveShot, pop, prompt, PromptCard, Show, stepFrames, Steps, StepVideo, Title, useTheme, Win} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-02/words.json';

// Sites-02 «Claude Code: VS Code, Desktop, Browser» (шлях websites, крок claude-code-setup). Сценарій: public/ideas/sites-02/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_02 = stepFrames(WORDS);

/** Результат першого промпту: сторінка «Привіт» з кнопкою, фон міняється на слові flip. */
const Hello: React.FC<{t: number; flip: number}> = ({t, flip}) => {
	const T = useTheme();
	const k = ramp(t, flip, flip + 0.4);
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34,
			background: k > 0.5 ? T.accent : '#FFFFFF', color: k > 0.5 ? T.onAccent : '#111111', transition: 'none'}}>
			<span style={{fontSize: 52, fontWeight: 800}}>Привіт, це мій перший сайт</span>
			<span style={{padding: '18px 40px', borderRadius: 14, background: '#111111', color: '#FFFFFF', fontSize: 36, fontWeight: 700, transform: `scale(${1 - 0.08 * Math.sin(Math.min(1, ramp(t, flip - 0.3, flip)) * Math.PI)})`}}>Змінити фон</span>
		</div>
	);
};

/** Калькулятор: схема результату другого промпту. */
const Calc: React.FC<{t: number; a0: number}> = ({t, a0}) => {
	const T = useTheme();
	const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];
	return (
		<div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
			<div style={{gridColumn: '1 / 5', textAlign: 'right', fontSize: 72, fontWeight: 800, padding: '10px 18px', fontFamily: 'monospace'}}>{t > a0 + 1.4 ? '42' : '6 × 7'}</div>
			{keys.map((k, i) => (
				<div key={k} style={{opacity: pop(t, a0 + i * 0.04, 0.25), height: 92, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800,
					background: k === '=' ? T.accent : T.panel2, color: k === '=' ? T.onAccent : T.text}}>{k}</div>
			))}
		</div>
	);
};

const Scenes = (t: number) => {
	const go = a('Заходиш'), ext = a('Розширення'), desk = a('Десктопна'), chrome = a('Chrome'), main = a('Головне'), check = a('Встановили'), write = a('пишеш'), file = a('Файл', a('фону')), more = a('калькулятор') - 0.1, fin = a('Ось', 56);
	return (
		<>
			<Show t={t} a={0} b={go}>
				<Title t={t} section="Організація">Де взяти <L>Claude Code</L>?</Title>
			</Show>
			<Show t={t} a={go} b={desk}>
				<Box y={260}><Big size={80}>{t >= ext ? <>1 · <L>VS Code</L></> : <>Усе на <L>одній сторінці</L></>}</Big></Box>
				<Browser t={t} y={460} url="claude.ai/download" typeAt={go + 0.2} h={560}>
					{/* справжня сторінка (shots/claude-download.png, 1265×2200): скрол до «Claude Code environments», рамка на VS Code */}
					<LiveShot t={t} src="ideas/sites-02/shots/claude-download.png" w={1265} a={go + 1} b={ext} scroll={1440} focus={{x: 878, y: 1877, w: 295, h: 69, at: a('VS Code'), zoom: 1.4}} />
				</Browser>
				<Chips t={t} y={1170} items={[['файли', a('файли')], ['код', a('код')], ['чат поруч', a('чат')]]} />
			</Show>
			<Show t={t} a={desk} b={chrome}>
				<Box y={380}><Big size={100}>2 · <L>Десктоп</L></Big></Box>
				<Chips t={t} y={680} size={46} items={[['швидко спитати', a('спитати')], ['запустити задачу', a('задачу')], ['без редактора', a('редактора')]]} />
			</Show>
			<Show t={t} a={chrome} b={main}>
				<Box y={380}><Big size={100}>3 · <L>Chrome</L></Big></Box>
				<Box y={640} o={pop(t, a('браузері'))}><span style={{fontSize: 54, fontWeight: 700}}>нейромережа прямо <L>в браузері</L></span></Box>
			</Show>
			<Show t={t} a={main} b={check}>
				<Box y={520}><Big size={110}>Головне — <L>VS Code</L></Big></Box>
			</Show>
			<Show t={t} a={check} b={write}>
				<Box y={260}><Big size={88}>Одразу <L>перевіряємо</L></Big></Box>
				<Steps t={t} y={500} items={[['1', 'порожня папка', a('Створюєш')], ['2', 'відкрити у VS Code', a('відкриваєш')]]} />
			</Show>
			<Show t={t} a={write} b={file}>
				<PromptCard t={t} a={a('створи')} b={a('фону') + 0.3} text={prompt('claude-code-setup', 'first-file')} y={420} label="Claude Code" />
			</Show>
			<Show t={t} a={file} b={more}>
				<Box y={260}><Big size={88}>Файл <L>з'явився</L></Big></Box>
				<Browser t={t} y={470} url="index.html" o={pop(t, file)} h={560}>
					<Hello t={t} flip={a('змінюється') - 0.2} />
				</Browser>
				<Box y={1150} o={pop(t, a('працює', 43))}><Big size={72}>Все <L>працює ✓</L></Big></Box>
			</Show>
			<Show t={t} a={more} b={fin}>
				<Box y={240}><Big size={84}>Хочеш <L>цікавіше</L>?</Big></Box>
				<Win y={440} label="калькулятор" o={pop(t, a('калькулятор'))}>
					<Calc t={t} a0={a('калькулятор') + 0.2} />
				</Win>
				<Chips t={t} y={1240} size={38} items={[['index.html', a('три')], ['style.css', a('три') + 0.2], ['script.js', a('три') + 0.4]]} />
			</Show>
			<Show t={t} a={fin} b={Infinity}>
				<Box y={420}><Big size={92}>Описуєш <L>словами</L></Big></Box>
				<Box y={680} o={pop(t, a('файли', 59))}><Big size={84}>файли з'являються <L>самі</L></Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Заходиш') + 0.2, 'typing/typewriter-hit-soft.mp3', 0.22],
	[a('VS Code'), 'click/mouse-click-352734.mp3', 0.4],
	[a('Головне'), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('створи'), 'typing/typewriter-digital.mp3', 0.18],
	[a("з'явився"), 'notify/ding-101492.mp3', 0.3],
	[a('калькулятор'), 'pop/bubble-pop-389501.mp3', 0.35],
	[a('Десктопна'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('Chrome'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('змінюється') - 0.2, 'click/mouse-click-352734.mp3', 0.4],
];

export const Sites02: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-02" words={WORDS} next="Git і GitHub" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('typing', a('А', 44), a('калькулятор') - a('А', 44) - 0.1, {label: <>Ще <L>цікавіше</L></>, labelY: 1000})]} />
);

// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------
const ScenesWide = (t: number) => {
	const go = a('Заходиш'), ext = a('Розширення'), desk = a('Десктопна'), chrome = a('Chrome'), main = a('Головне'), check = a('Встановили'), write = a('пишеш'), file = a('Файл', a('фону')), more = a('калькулятор') - 0.1, fin = a('Ось', 56);
	return (
		<>
			<Show t={t} a={0} b={go}>
				<Fit from={420} to={1100} center>
					<Title t={t} section="Організація">Де взяти <L>Claude Code</L>?</Title>
				</Fit>
			</Show>
			<Show t={t} a={go} b={desk}>
				<LHead size={80}>{t >= ext ? <>1 · <L>VS Code</L></> : <>Усе на <L>одній сторінці</L></>}</LHead>
				<Fit from={420} to={1390}>
					<Browser t={t} y={460} url="claude.ai/download" typeAt={go + 0.2} h={560}>
						{/* справжня сторінка (shots/claude-download.png, 1265×2200): скрол до «Claude Code environments», рамка на VS Code */}
						<LiveShot t={t} src="ideas/sites-02/shots/claude-download.png" w={1265} a={go + 1} b={ext} scroll={1440} focus={{x: 878, y: 1877, w: 295, h: 69, at: a('VS Code'), zoom: 1.4}} />
					</Browser>
					<Chips t={t} y={1170} items={[['файли', a('файли')], ['код', a('код')], ['чат поруч', a('чат')]]} />
				</Fit>
			</Show>
			<Show t={t} a={desk} b={chrome}>
				<LHead size={92}>2 · <L>Десктоп</L></LHead>
				<Fit from={640} to={900}>
					<Chips t={t} y={680} size={46} items={[['швидко спитати', a('спитати')], ['запустити задачу', a('задачу')], ['без редактора', a('редактора')]]} />
				</Fit>
			</Show>
			<Show t={t} a={chrome} b={main}>
				<LHead size={92}>3 · <L>Chrome</L></LHead>
				<Fit from={600} to={860}>
					<Box y={640} o={pop(t, a('браузері'))}><span style={{fontSize: 54, fontWeight: 700}}>нейромережа прямо <L>в браузері</L></span></Box>
				</Fit>
			</Show>
			<Show t={t} a={main} b={check}>
				<Fit from={480} to={740} center>
					<Box y={520}><Big size={110}>Головне — <L>VS Code</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={check} b={write}>
				<LHead size={88}>Одразу <L>перевіряємо</L></LHead>
				<Fit from={460} to={900}>
					<Steps t={t} y={500} items={[['1', 'порожня папка', a('Створюєш')], ['2', 'відкрити у VS Code', a('відкриваєш')]]} />
				</Fit>
			</Show>
			<Show t={t} a={write} b={file}>
				<Fit from={380} to={640} center>
					<PromptCard t={t} a={a('створи')} b={a('фону') + 0.3} text={prompt('claude-code-setup', 'first-file')} y={420} label="Claude Code" />
				</Fit>
			</Show>
			<Show t={t} a={file} b={more}>
				<LHead size={88}>Файл <L>з'явився</L></LHead>
				<Fit from={420} to={1370}>
					<Browser t={t} y={470} url="index.html" o={pop(t, file)} h={560}>
						<Hello t={t} flip={a('змінюється') - 0.2} />
					</Browser>
					<Box y={1150} o={pop(t, a('працює', 43))}><Big size={72}>Все <L>працює ✓</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={more} b={fin}>
				<LHead size={84}>Хочеш <L>цікавіше</L>?</LHead>
				<Fit from={400} to={1460}>
					<Win y={440} label="калькулятор" o={pop(t, a('калькулятор'))}>
						<Calc t={t} a0={a('калькулятор') + 0.2} />
					</Win>
					<Chips t={t} y={1240} size={38} items={[['index.html', a('три')], ['style.css', a('три') + 0.2], ['script.js', a('три') + 0.4]]} />
				</Fit>
			</Show>
			<Show t={t} a={fin} b={Infinity}>
				<Fit from={380} to={900} center>
					<Box y={420}><Big size={92}>Описуєш <L>словами</L></Big></Box>
					<Box y={680} o={pop(t, a('файли', 59))}><Big size={84}>файли з'являються <L>самі</L></Big></Box>
				</Fit>
			</Show>
		</>
	);
};

export const Sites02Wide: React.FC<{theme?: string; seed?: number; kicker?: React.ReactNode}> = ({theme, seed, kicker}) => (
	<StepVideo wide kicker={kicker} theme={theme} seed={seed} dir="ideas/sites-02" words={WORDS} next="Git і GitHub" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={ScenesWide}
		inserts={[ugc('typing', a('А', 44), a('калькулятор') - a('А', 44) - 0.1, {label: <>Ще <L>цікавіше</L></>, labelY: 1000})]} />
);
