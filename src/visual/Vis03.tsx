import React from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {F} from '../system/kit';
import {BeatVideo, Card, beat, beatFrames} from '../system/beat';
import {Box, L, pop} from '../system/step';
import {Intro, Outro} from './ui';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/cyrillic-700.css';
import '@fontsource/oswald/latin-700.css';
import '@fontsource/oswald/cyrillic-700.css';
import '@fontsource/comfortaa/latin-700.css';
import '@fontsource/comfortaa/cyrillic-700.css';
import '@fontsource/caveat/latin-700.css';
import '@fontsource/caveat/cyrillic-700.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/montserrat/cyrillic-800.css';

// Vis-03 «5 пар: колір + шрифт»: кожна картка — палітра й шрифт одного типу проєкту на міні-лендингу.
// Шрифти локальні (@fontsource), кадр чекає, поки гарнітури завантажаться. Акцентний текст — від 3:1 до фону, без коралового на синьому.
type Pair = {kind: string; font: string; css: string; weight: number; upper?: boolean; bg: string; surface: string; text: string; accent: string; onAccent: string; accent2: string; head: string; body: string; btn: string; hs?: number};
const PAIRS: Pair[] = [
	{kind: "Кав'ярня", font: 'Playfair Display', css: "'Playfair Display', serif", weight: 700, bg: '#F3EBDD', surface: '#FFF9F0', text: '#2B1A12', accent: '#B5562F', onAccent: '#FFFFFF', accent2: '#6B8F71', head: 'Кава, що будить місто', body: 'Свіжа обсмажка щоранку. Самовивіз за 5 хвилин.', btn: 'Замовити'},
	{kind: 'Фітнес-студія', font: 'Oswald', css: "'Oswald', sans-serif", weight: 700, upper: true, bg: '#0F0F10', surface: '#1A1A1C', text: '#FFFFFF', accent: '#D7FF3A', onAccent: '#0F0F10', accent2: '#FF5A1F', head: 'Тренуйся без відмовок', body: 'Перше заняття — безкоштовно.', btn: 'Записатися'},
	{kind: 'Дитячі курси', font: 'Comfortaa', css: "'Comfortaa', sans-serif", weight: 700, bg: '#FFF4DE', surface: '#FFFFFF', text: '#283044', accent: '#3FA7D6', onAccent: '#10202E', accent2: '#FFB703', head: 'Вчимося граючись', body: 'Англійська й малювання для 5–9 років.', btn: 'Пробний урок'},
	{kind: 'Квіткова крамниця', font: 'Caveat', css: "'Caveat', cursive", weight: 700, bg: '#FCEEF1', surface: '#FFFFFF', text: '#3A1F2B', accent: '#2F7D5B', onAccent: '#FFFFFF', accent2: '#F28AA5', head: "Букети з любов'ю", body: 'Доставка по місту за 2 години.', btn: 'Обрати букет', hs: 1.35},
	{kind: 'IT-стартап', font: 'Montserrat', css: "'Montserrat', sans-serif", weight: 800, bg: '#0B1020', surface: '#121A33', text: '#EAF0FF', accent: '#7C5CFF', onAccent: '#FFFFFF', accent2: '#3DDC97', head: 'Автоматизуй рутину', body: 'AI-помічник для малого бізнесу.', btn: 'Спробувати'},
];
if (typeof document !== 'undefined') {
	const h = delayRender('Vis-03 fonts');
	Promise.all(PAIRS.map((p) => document.fonts.load(`${p.weight} 100px ${p.css.split(',')[0]}`, 'Кава AZ'))).then(() => continueRender(h), () => continueRender(h));
}

const TRACK = '47-pop-disco-aint-old-school.mp3';
const B = 60 / beat(TRACK).bpm;
const nb = (s: number) => Math.round(s / B / 2) * 2;

const PairCard: React.FC<{t: number; a: number; i: number}> = ({t, a, i}) => {
	const p = PAIRS[i];
	const hf: React.CSSProperties = {fontFamily: p.css, fontWeight: p.weight, textTransform: p.upper ? 'uppercase' : undefined};
	const land = pop(t, a + 0.3, 0.45);
	return (
		<AbsoluteFill style={{background: p.bg, color: p.text}}>
			<Box y={190} o={pop(t, a, 0.25)}><span style={{fontFamily: F.mono, fontSize: 32, letterSpacing: 5, color: p.text, opacity: 0.7}}>ПАРА {i + 1}/5 · {p.kind.toUpperCase()}</span></Box>
			<Box y={260} o={pop(t, a, 0.3)}>
				<div style={{...hf, fontSize: 104 * (p.hs ?? 1), lineHeight: 1.05}}>{p.font}</div>
				<div style={{fontFamily: F.body, fontWeight: 600, fontSize: 44, marginTop: 10, opacity: 0.75}}>+ Inter для тексту</div>
			</Box>
			{/* міні-лендинг у цій парі */}
			<div style={{position: 'absolute', left: 84, top: 560, width: 912, height: 660, borderRadius: 40, background: p.surface, overflow: 'hidden', boxShadow: '0 40px 100px #00000033', opacity: land, transform: `translateY(${(1 - land) * 80}px)`}}>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 44px'}}>
					<span style={{...hf, fontSize: 40 * (p.hs ?? 1)}}>{p.kind}</span>
					<span style={{display: 'flex', gap: 26, fontFamily: F.body, fontWeight: 600, fontSize: 24, opacity: 0.65}}><span>Меню</span><span>Про нас</span><span>Контакти</span></span>
				</div>
				<div style={{position: 'absolute', right: -60, top: 140, width: 380, height: 380, borderRadius: '50%', background: p.accent2, opacity: 0.9}} />
				<div style={{position: 'absolute', right: 120, top: 360, width: 160, height: 160, borderRadius: '50%', background: p.accent, opacity: 0.85}} />
				<div style={{position: 'absolute', left: 44, top: 150, width: 540}}>
					<div style={{...hf, fontSize: 76 * (p.hs ?? 1), lineHeight: 1.05}}>{p.head}</div>
					<div style={{fontFamily: F.body, fontWeight: 600, fontSize: 32, lineHeight: 1.4, marginTop: 26, opacity: 0.75}}>{p.body}</div>
					<div style={{display: 'inline-block', marginTop: 40, padding: '24px 44px', borderRadius: 999, background: p.accent, color: p.onAccent, fontFamily: F.body, fontWeight: 800, fontSize: 32, transform: `scale(${t > a + B * 6 && t < a + B * 6 + 0.25 ? 0.94 : 1})`}}>{p.btn}</div>
				</div>
			</div>
			{/* палітра */}
			<Box y={1290} style={{display: 'flex', justifyContent: 'center', gap: 40}}>
				{[p.bg, p.text, p.accent, p.accent2].map((c, k) => {
					const q = pop(t, a + B * (2 + k), 0.3);
					return (
						<div key={k} style={{opacity: q, transform: `scale(${0.7 + 0.3 * q})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
							<div style={{width: 150, height: 150, borderRadius: 75, background: c, border: `4px solid ${p.text}33`}} />
							<span style={{fontFamily: F.mono, fontSize: 28, fontWeight: 500}}>{c}</span>
						</div>
					);
				})}
			</Box>
		</AbsoluteFill>
	);
};

const CARDS: Card[] = [
	{beats: nb(3.2), el: (t, a) => <Intro t={t} a={a} kicker="Дизайн для проєкту" l1="Колір + шрифт:" l2="5 готових пар" size={100} sub="бери для свого сайту" />},
	...PAIRS.map((_, i): Card => ({beats: nb(6), el: (t, a) => <PairCard t={t} a={a} i={i} />})),
	{beats: nb(5.5), sfx: 'impact/impact-movie-epic.mp3', vol: 0.3, off: 0.2, el: (t, a) => <Outro t={t} a={a} ask={<>Яка пара твоя?<br /><L>Напиши номер у коментарях</L></>} />},
];
export const Vis03: React.FC = () => <BeatVideo theme="drop07" track={TRACK} cards={CARDS} />;
export const VIS03_FRAMES = beatFrames(TRACK, CARDS);
