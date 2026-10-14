import React from 'react';
import {F} from '../system/kit';
import {BeatVideo, Card, Poster, beatFrames} from '../system/beat';
import {Big, Box, Browser, Chips, Cue, L, LiveShot, NextCard, Pill, PromptCard, Show, StepVideo, Ticks, Title, X, W, at, pop, stepFrames, useTheme} from '../system/step';
import W04 from '../../public/ideas/insta-04/words.json';
import W23 from '../../public/ideas/insta-23/words.json';
import W49 from '../../public/ideas/insta-49/words.json';

// Рілси банку «50 ідей без зйомки» (docs/insta-50/NN-slug/idea.md). Голос — клон Вадима (StepVideo), без голосу — музика на біт (BeatVideo).
// Кінець — «напиши СЛОВО у коментарях → надішлю в Direct».
/** Поки голос каже «напиши …» — слово великим, далі end card. */
const Ask: React.FC<{t: number; a: number; word: string}> = ({t, a, word}) => (
	<Show t={t} a={a} b={Infinity}>
		<Box y={520}><span style={{fontSize: 56, fontWeight: 700}}>Напиши в коментарях</span></Box>
		<Box y={640} o={pop(t, a + 0.3)}><Big size={word.length > 5 ? 110 : 140}><L>«{word}»</L></Big></Box>
		<Box y={900} o={pop(t, a + 1.2)}><Pill style={{fontSize: 48}}>надішлю в Direct</Pill></Box>
	</Show>
);
const cta = (word: string) => (t: number, a: number) => <NextCard t={t} a={a} label="Напиши в коментарях" next={`«${word}»`} url="надішлю тобі в Direct" />;

// ---------- 04 · 5 фраз, які я пишу AI щодня (голос) ----------
const a04 = (w: string, after = 0) => at(W04, w, after);
export const INSTA_04 = stepFrames(W04);
const P04: [string, string, string][] = [
	['Перша', 'Спершу спитай мене, що тобі треба знати', 'відповідь під тебе'],
	['Друга', 'Зроби 5 варіантів', 'один майже завжди класний'],
	['Третя', 'Прочитай це очима клієнта', 'сама знайде, чого бракує'],
	['Четверта', 'Що дасть найбільший виграш за найменше часу?', 'топ-3 замість списку'],
	["П'ята", 'Поясни, ніби мені 12', 'складна тема за хвилину'],
];
const Scenes04 = (t: number) => {
	const starts = P04.map(([w]) => a04(w, 3));
	return (
		<>
			<Show t={t} a={0} b={starts[0]}><Title t={t} section="Claude · ChatGPT" size={120}>5 фраз для <L>AI</L> щодня</Title></Show>
			{P04.map(([, text, sub], i) => (
				<Show key={i} t={t} a={starts[i]} b={starts[i + 1] ?? a04('Напиши')}>
					<Box y={300}><Big size={200}><L>{i + 1}</L>/5</Big></Box>
					<PromptCard t={t} a={starts[i] + 0.4} b={starts[i] + 2.2} y={620} size={52} text={text} />
					<Box y={1080} o={pop(t, starts[i] + 2.6)}><Pill style={{fontSize: 46}}>{sub}</Pill></Box>
				</Show>
			))}
			<Ask t={t} a={a04('Напиши')} word="ПРОМПТ" />
		</>
	);
};
const SFX04: Cue[] = [[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3], ...P04.map(([w]): Cue => [a04(w, 3), 'typing/typewriter-hit-soft.mp3', 0.3])];
export const Insta04: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/insta-04" words={W04} sfx={SFX04} scenes={Scenes04} endCard={cta('ПРОМПТ')} />
);

// ---------- 23 · 5 сайтів, які здаються незаконними (голос, живі скріни) ----------
const a23 = (w: string, after = 0) => at(W23, w, after);
export const INSTA_23 = stepFrames(W23);
type Site = [word: string, url: string, file: string, line: string, focus: {x: number; y: number; w: number; h: number; zoom: number}];
const S23: Site[] = [
	['Uiverse', 'uiverse.io', 'uiverse', 'тисячі готових кнопок', {x: 0, y: 440, w: 1280, h: 420, zoom: 1.25}],
	['Haikei', 'haikei.app', 'haikei', 'фони: хвилі, блоби, сітки', {x: 380, y: 560, w: 900, h: 340, zoom: 1.3}],
	['CSS', 'CSS Hero Mesher', 'mesher', 'mesh-градієнти + код', {x: 0, y: 0, w: 1100, h: 800, zoom: 1.1}],
	['Metatags', 'metatags.io', 'metatags', 'прев\'ю посилання', {x: 640, y: 260, w: 640, h: 500, zoom: 1.4}],
	['OverAPI', 'overapi.com', 'overapi-clean', 'шпаргалки з десятків мов', {x: 0, y: 150, w: 1280, h: 150, zoom: 1.2}],
];
const Scenes23 = (t: number) => {
	const starts = S23.map(([w]) => a23(w));
	return (
		<>
			<Show t={t} a={0} b={a23('І')}><Title t={t} section="Безкоштовно" size={104}>5 сайтів, які здаються <L>незаконними</L></Title></Show>
			<Show t={t} a={a23('І')} b={starts[0]}><Box y={600}><Big size={110}>і всі <L>безкоштовні</L></Big></Box></Show>
			{S23.map(([, url, file, line, focus], i) => (
				<Show key={i} t={t} a={starts[i]} b={starts[i + 1] ?? a23('Напиши')}>
					<Box y={250}><Big size={84}><L>{i + 1}</L> · {url}</Big></Box>
					<Browser t={t} y={420} url={url} h={file === 'overapi-clean' ? 360 : 640}>
						<LiveShot t={t} src={`ideas/insta-23/shots/${file}.png`} w={1280} a={starts[i] + 0.2} focus={{...focus, at: i === 4 ? starts[i] : starts[i] + 1.2}} />
					</Browser>
					<Box y={file === 'overapi-clean' ? 860 : 1130} o={pop(t, starts[i] + 0.8)}><Pill style={{fontSize: 46}}>{line}</Pill></Box>
				</Show>
			))}
			<Ask t={t} a={a23('Напиши')} word="САЙТИ" />
		</>
	);
};
const SFX23: Cue[] = [[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3], [a23('безкоштовні'), 'impact/bass-hit-futuristic.mp3', 0.25], ...S23.map(([w]): Cue => [a23(w), 'pop/bubble-pop-406640.mp3', 0.3])];
export const Insta23: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/insta-23" words={W23} sfx={SFX23} scenes={Scenes23} endCard={cta('САЙТИ')} />
);

// ---------- 49 · n8n: тригер → AI → дія (голос) ----------
const a49 = (w: string, after = 0) => at(W49, w, after);
export const INSTA_49 = stepFrames(W49);
const Node: React.FC<{t: number; at0: number; y: number; title: string; on: boolean; children?: React.ReactNode}> = ({t, at0, y, title, on, children}) => {
	const T = useTheme();
	const p = pop(t, at0);
	return (
		<div style={{position: 'absolute', left: X + 60, width: W - 120, top: y, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, padding: '26px 34px', borderRadius: 30, background: on ? T.accent : T.panel, color: on ? T.onAccent : T.text, border: `3px solid ${T.accent}`, boxShadow: on ? `0 20px 60px ${T.accent}55` : 'none'}}>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 56}}>{title}</div>
			{children ? <div style={{marginTop: 10, fontSize: 36, fontWeight: 700, opacity: 0.85}}>{children}</div> : null}
		</div>
	);
};
const Scenes49 = (t: number) => {
	const T = useTheme();
	const trig = a49('Перший'), ai = a49('Другий'), act = a49('Третій'), sum = a49('Тригер,');
	const cur = t >= act ? 2 : t >= ai ? 1 : 0;
	return (
		<>
			<Show t={t} a={0} b={trig}><Title t={t} section="n8n · автоматизації" size={88}>Будь-яка автоматизація — <L>3 блоки</L></Title></Show>
			<Show t={t} a={trig} b={sum}>
				<Box y={220}><Big size={80}>{['Тригер', 'Нейромережа', 'Дія'][cur]}</Big></Box>
				<Node t={t} at0={trig} y={400} title="1 · Тригер" on={cur === 0}>{t >= a49('нова') ? 'заявка · лист · щоранку о 9:00' : ''}</Node>
				<div style={{position: 'absolute', left: 536, top: 590, width: 8, height: 90, background: T.accent, opacity: pop(t, ai)}} />
				<Node t={t} at0={ai} y={690} title="2 · AI" on={cur === 1}>{t >= a49('сортує') ? 'терміново · звичайне · спам' : t >= a49('читає') ? 'читає і розуміє заявку' : ''}</Node>
				<div style={{position: 'absolute', left: 536, top: 880, width: 8, height: 90, background: T.accent, opacity: pop(t, act)}} />
				<Node t={t} at0={act} y={980} title="3 · Дія" on={cur === 2}>{t >= a49('Повідомлення') ? 'Telegram · таблиця · CRM' : ''}</Node>
			</Show>
			<Show t={t} a={sum} b={a49('Напиши')}>
				<Chips t={t} y={420} size={60} items={[['тригер', sum], ['AI', a49('нейромережа,', 27)], ['дія', a49('дія.', 28)]]} />
				<Box y={700} o={pop(t, a49('Зібрав'))}><Big size={96}>Зібрав раз — <L>працює саме</L></Big></Box>
				<Box y={1000} o={pop(t, a49('спиш'))}><span style={{fontSize: 54, fontWeight: 700}}>поки ти спиш</span></Box>
			</Show>
			<Ask t={t} a={a49('Напиши')} word="АВТО" />
		</>
	);
};
const SFX49: Cue[] = [[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3], [a49('Перший'), 'pop/soft-pop.wav', 0.3], [a49('Другий'), 'pop/soft-pop.wav', 0.3], [a49('Третій'), 'pop/soft-pop.wav', 0.3], [a49('Зібрав'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3]];
export const Insta49: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/insta-49" words={W49} sfx={SFX49} scenes={Scenes49} endCard={cta('АВТО')} />
);

// ---------- 09 · Bento-сітка (музика на біт) ----------
const Bento: React.FC<{t: number; a: number; n: number; tidy?: boolean}> = ({t, a, n, tidy}) => {
	const T = useTheme();
	const cells: [number, number, number, number, string][] = [[0, 0, 2, 2, 'фіча'], [2, 0, 1, 1, '24/7'], [2, 1, 1, 1, '★ 4.9'], [0, 2, 1, 1, 'відгук'], [1, 2, 2, 1, 'Почати →']];
	const u = 270, g = 22;
	return (
		<div style={{position: 'absolute', left: (1080 - (3 * u + 2 * g)) / 2, top: 560, width: 3 * u + 2 * g, height: 3 * u + 2 * g}}>
			{cells.slice(0, n).map(([x, y, w, h, label], i) => {
				const p = pop(t, a + i * 0.18, 0.3);
				return (
					<div key={i} style={{position: 'absolute', left: x * (u + g), top: y * (u + g), width: w * u + (w - 1) * g, height: h * u + (h - 1) * g, borderRadius: tidy ? 36 : [6, 40, 18, 60, 0][i], background: i === 0 ? T.accent : T.panel, color: i === 0 ? T.onAccent : T.text, border: `2px solid ${T.line}`, opacity: p, transform: `scale(${0.8 + 0.2 * p})`, display: 'flex', alignItems: 'flex-end', padding: 28, boxSizing: 'border-box', fontFamily: F.display, fontWeight: 900, fontSize: i === 0 ? 72 : 44}}>{label}</div>
				);
			})}
		</div>
	);
};
const TR09 = '37-synthwave-better-times-are-coming.mp3';
const C09: Card[] = [
	{beats: 6, el: (t, a) => <Poster t={t} a={a} kicker="Вебдизайн · стиль" size={150}>Bento-<L>сітка</L></Poster>},
	{beats: 6, sfx: 'whoosh/simple-whoosh-382724.mp3', vol: 0.3, el: (t, a) => <><Box y={300}><Big size={84}>Бачив на кожному <L>сайті</L></Big></Box><Bento t={t} a={a + 0.3} n={5} tidy /></>},
	{beats: 6, el: (t, a) => <><Box y={300}><Big size={90}>1 · <L>різні</L> розміри</Big></Box><Bento t={t} a={a} n={5} tidy /></>},
	{beats: 6, el: (t, a) => <><Box y={300}><Big size={90}>2 · <L>один</L> радіус</Big></Box><Bento t={t} a={a} n={5} tidy={t > a + 1.2} /></>},
	{beats: 6, el: (t, a) => <><Box y={300}><Big size={90}>3 · одна <L>ідея</L> на плитку</Big></Box><Bento t={t} a={a} n={5} tidy /></>},
	{beats: 6, sfx: 'typing/typewriter-hit-soft.mp3', vol: 0.3, el: (t, a, z) => <><Box y={300}><Big size={84}>Промпт</Big></Box><PromptCard t={t} a={a + 0.3} b={z - 0.8} y={560} size={46} text="Зроби bento-секцію переваг: 5 плиток різного розміру, один радіус, одна думка на плитку." /></>},
	{beats: 8, el: cta('БЕНТО')},
];
export const INSTA_09 = beatFrames(TR09, C09);
export const Insta09 = () => <BeatVideo theme="paper" track={TR09} cards={C09} />;

// ---------- 17 · UI за 30 с: розміри інпута (музика на біт) ----------
const Input: React.FC<{t: number; a: number; marks: number}> = ({t, a, marks}) => {
	const T = useTheme();
	const m = (i: number) => pop(t, a + 0.3 + i * 0.5) * (marks > i ? 1 : 0);
	const tag = (x: number, y: number, s: string, i: number) => <div style={{position: 'absolute', left: x, top: y, padding: '6px 14px', borderRadius: 10, background: i % 2 ? '#2F6BFF' : '#E8457A', color: '#fff', fontFamily: F.mono, fontWeight: 800, fontSize: 30, opacity: m(i)}}>{s}</div>;
	return (
		<div style={{position: 'absolute', left: 140, top: 760, width: 800, height: 300}}>
			<div style={{position: 'absolute', left: 0, top: 40, fontSize: 32, color: T.dim, fontWeight: 600, opacity: pop(t, a)}}>Пароль</div>
			<div style={{position: 'absolute', left: 0, top: 90, width: 800, height: 120, borderRadius: 24, border: `3px solid ${T.line}`, background: T.panel, display: 'flex', alignItems: 'center', paddingLeft: 40, boxSizing: 'border-box', fontSize: 40, color: T.dim, opacity: pop(t, a)}}>••••••••</div>
			<div style={{position: 'absolute', left: 0, top: 90, width: 40, height: 120, background: '#E8457A33', opacity: m(1)}} />
			{tag(820, 120, '48', 0)}{tag(-10, 230, '16 px', 1)}{tag(110, 34, '12 · 8', 2)}{tag(690, 0, 'r 12', 3)}
		</div>
	);
};
const Kicker: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => <Box y={y}><span style={{fontFamily: F.mono, fontSize: 40, letterSpacing: 4, color: useTheme().dim, textTransform: 'uppercase'}}>{children}</span></Box>;
const TR17 = '38-synthwave-sun-in-your-eyes.mp3';
const ROWS17: [string, React.ReactNode][] = [['висота', <>48 px — <L>зручно пальцем</L></>], ['відступ', <>16 px <L>зліва</L></>], ['label', <>12 px і 8 px <L>до поля</L></>], ['радіус', <>12 — як у <L>кнопок</L></>]];
const C17: Card[] = [
	{beats: 6, el: (t, a) => <Poster t={t} a={a} kicker="UI за 30 с · серія" size={140}>Розміри <L>інпута</L></Poster>},
	...ROWS17.map(([k, v], i): Card => ({beats: 6, sfx: 'pop/bubble-pop-406640.mp3', vol: 0.3, el: (t, a) => (
		<>
			<Kicker y={300}>{i + 1}/4 · {k}</Kicker>
			<Box y={380} o={pop(t, a + 0.2)}><Big size={80}>{v}</Big></Box>
			<Input t={t} a={a} marks={i + 1} />
		</>
	)})),
	{beats: 6, el: (t, a) => <><Box y={300}><Big size={90}>Style 1 → <L>Style 2</L></Big></Box><Ticks t={t} y={600} items={[[true, 'однакова висота всіх полів', a + 0.3], [true, 'помилка — під полем', a + 0.8], [true, 'label не зникає', a + 1.3]]} /></>},
	{beats: 8, el: cta('ФОРМА')},
];
export const INSTA_17 = beatFrames(TR17, C17);
export const Insta17 = () => <BeatVideo theme="paper" track={TR17} cards={C17} />;
