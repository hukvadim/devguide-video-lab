import React from 'react';
import {F, ramp, easeInOut} from '../system/kit';
import {BeatVideo, Card, beat, beatFrames} from '../system/beat';
import {Box, L, pop} from '../system/step';
import {CardHead, Intro, Outro, Phone} from './ui';
import {Fit, SCREENS, SW} from './cinema';

// Vis-02 «Кінотеатр: MVP за 5 екранів»: один телефон, екрани змінюються свайпом на склейці; у фіналі — усі 5 віялом.
const TRACK = '34-cinematic-cyberpunk-city.mp3';
const B = 60 / beat(TRACK).bpm;
const NAMES = ['Афіша', 'Фільм', 'Сеанс', 'Місця', 'Квиток'];
const PW = 620, PH = 1220, PY = 410;
const nb = (s: number) => Math.round(s / B / 2) * 2;

/** Телефон з екраном i; перші 0.45 с попередній екран виїжджає вліво, новий заїжджає справа. */
const Swipe: React.FC<{t: number; a: number; i: number}> = ({t, a, i}) => {
	const s = i ? ramp(t, a, a + 0.45, 0, 1, easeInOut) : 1;
	const Cur = SCREENS[i];
	const Prev = i ? SCREENS[i - 1] : null;
	return (
		<Phone y={PY} w={PW} h={PH}>
			<Fit w={PW - 32}>
				{Prev && s < 1 ? <div style={{position: 'absolute', inset: 0, transform: `translateX(${-s * SW}px)`}}><Prev t={a - 0.01} a={a - 6} b={B} /></div> : null}
				<div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - s) * SW}px)`}}><Cur t={t} a={a + (i ? 0.3 : 0)} b={B} /></div>
			</Fit>
		</Phone>
	);
};

/** Фінал: 5 екранів віялом — «це і є MVP». */
const Fan: React.FC<{t: number; a: number}> = ({t, a}) => (
	<>
		<Box y={220} o={pop(t, a, 0.3)}><div style={{fontFamily: F.display, fontWeight: 900, fontSize: 92, lineHeight: 1.05}}>5 екранів =<br /><L>готовий MVP</L></div></Box>
		{SCREENS.map((S, k) => {
			const p = pop(t, a + 0.2 + k * 0.12, 0.4);
			const off = k - 2;
			return (
				<Phone key={k} x={540 - 170 + off * 150} y={700 + Math.abs(off) * 50} w={340} h={669} rot={off * 7 * p} o={p}>
					<Fit w={308}><S t={a + 20} a={a} b={B} /></Fit>
				</Phone>
			);
		})}
	</>
);

const CARDS: Card[] = [
	{beats: nb(3.2), el: (t, a) => <Intro t={t} a={a} kicker="Проєкт для портфоліо" l1="Кінотеатр:" l2="MVP за 5 екранів" size={100} sub="збережи як ТЗ для себе" />},
	...NAMES.map((name, i): Card => ({beats: nb(5.4), sfx: i ? 'whoosh/whoosh-fast.mp3' : undefined, vol: 0.18, el: (t, a) => (
		<>
			<CardHead t={t} a={a} n={`ЕКРАН ${i + 1}/5`} title={name} y={180} size={88} />
			<Swipe t={t} a={a} i={i} />
		</>
	)})),
	{beats: nb(4.4), el: (t, a) => <Fan t={t} a={a} />},
	{beats: nb(5.5), sfx: 'impact/impact-movie-epic.mp3', vol: 0.3, off: 0.2, el: (t, a) => <Outro t={t} a={a} ask={<>Який проєкт розкласти<br /><L>наступним?</L> Пиши в коментарях</>} />},
];
export const Vis02: React.FC = () => <BeatVideo theme="neon" track={TRACK} cards={CARDS} />;
export const VIS02_FRAMES = beatFrames(TRACK, CARDS);
