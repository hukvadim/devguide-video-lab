import React from 'react';
import {interpolate} from 'remotion';
import {F, clamp} from '../system/kit';
import {BeatVideo, Card, beat, beatFrames} from '../system/beat';
import {Browser, L, useTheme} from '../system/step';
import {CardHead, Chip, Intro, MoviePoster, MOVIES, Outro, Phone, Skills, StatusBar, show} from './ui';
import {Fit, Seats, SW} from './cinema';

// Vis-01 «5 проєктів для портфоліо»: на кожній картці живий головний екран проєкту + 3 пігулки «що прокачаєш».
const TRACK = '14-edm-i-do.mp3';
const B = 60 / beat(TRACK).bpm;
const PW = 540, PH = 1060, PY = 400;
const inner = PW - 32;
const ink = '#FFFFFF';
const dim = '#FFFFFF8C';

const Catalog: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const on = t >= a + B * 4; // фільтр «Фантастика» вмикається на 4-й біт
	const f = show(t, a + B * 4, 0.35);
	return (
		<Browser t={t} y={460} url="kino-zorya.com.ua" typeAt={a + 0.1} h={860}>
			<div style={{padding: 30, background: '#0E0E14', height: '100%', boxSizing: 'border-box'}}>
				<div style={{display: 'flex', gap: 12}}>{['Усі', 'Драма', 'Комедія', 'Фантастика'].map((s) => <Chip key={s} size={28} on={on ? s === 'Фантастика' : s === 'Усі'}>{s}</Chip>)}</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 248px)', gap: 24, marginTop: 30}}>
					{MOVIES.map((m, k) => {
						const keep = m.genre === 'Фантастика';
						const p = show(t, a + 0.3 + k * 0.08);
						return <div key={k} style={{opacity: p * (keep ? 1 : 1 - 0.85 * f), transform: `scale(${keep ? 1 + 0.04 * f : 1 - 0.08 * f})`}}><MoviePoster i={k} w={248} h={340} /></div>;
					})}
				</div>
			</div>
		</Browser>
	);
};

const DISHES: [string, number, string[]][] = [['Боул з лососем', 289, ['#FF8A65', '#AED581', '#FFF59D']], ['Піца «Маргарита»', 219, ['#E53935', '#FFF8E1', '#66BB6A']], ['Сирники', 159, ['#FFE0B2', '#FFFFFF', '#E57373']]];
const Delivery: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const adds = [2, 3, 4, 6].map((k) => a + B * k); // натискання «+» на біт: боул, піца, сирники, ще боул
	const which = [0, 1, 2, 0];
	const n = adds.filter((x) => t >= x).length;
	const sum = which.slice(0, n).reduce((s, d) => s + DISHES[d][1], 0);
	const bump = adds.some((x) => t >= x && t < x + 0.2);
	return (
		<Phone y={PY} w={PW} h={PH}>
			<Fit w={inner}>
				<StatusBar />
				<div style={{position: 'absolute', left: 36, top: 90, fontFamily: F.body, fontWeight: 700, fontSize: 24, color: dim}}>Доставка за 30 хв</div>
				<div style={{position: 'absolute', left: 36, top: 124, fontFamily: F.display, fontWeight: 900, fontSize: 50, color: ink}}>Що замовимо?</div>
				<div style={{position: 'absolute', left: 36, right: 36, top: 250, display: 'flex', flexDirection: 'column', gap: 24}}>
					{DISHES.map(([name, price, col], d) => {
						const pressed = adds.some((x, k) => which[k] === d && t >= x && t < x + 0.2);
						return (
							<div key={name} style={{display: 'flex', alignItems: 'center', gap: 24, padding: 22, borderRadius: 30, background: '#FFFFFF0D', opacity: show(t, a + 0.2 + d * 0.12)}}>
								<div style={{position: 'relative', width: 130, height: 130, borderRadius: 65, background: '#F4F1EA', flex: 'none', overflow: 'hidden'}}>
									{col.map((c, k) => <div key={k} style={{position: 'absolute', left: 25 + k * 22, top: 30 + (k % 2) * 30, width: 50, height: 50, borderRadius: 25, background: c}} />)}
								</div>
								<div style={{flex: 1}}><div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, color: ink}}>{name}</div><div style={{fontFamily: F.body, fontWeight: 700, fontSize: 28, color: T.accent, marginTop: 8}}>{price} ₴</div></div>
								<div style={{width: 70, height: 70, borderRadius: 35, background: T.accent, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 900, transform: `scale(${pressed ? 0.85 : 1})`}}>+</div>
							</div>
						);
					})}
				</div>
				<div style={{position: 'absolute', left: 36, right: 36, bottom: 50, height: 110, borderRadius: 34, background: n ? T.accent : '#FFFFFF1A', color: n ? T.onAccent : dim, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', fontFamily: F.body, fontWeight: 800, fontSize: 32}}>
					<span style={{display: 'flex', alignItems: 'center', gap: 16}}>Кошик <span style={{display: 'inline-flex', width: 50, height: 50, borderRadius: 25, background: n ? T.onAccent : '#FFFFFF33', color: n ? T.accent : ink, alignItems: 'center', justifyContent: 'center', transform: `scale(${bump ? 1.3 : 1})`}}>{n}</span></span>
					<span>{sum} ₴</span>
				</div>
			</Fit>
		</Phone>
	);
};

const Booking: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const s = t >= a + B * 2 ? 14 : 0, e = t >= a + B * 4 ? 17 : 0; // заїзд 14, виїзд 17
	const first = 3; // 1 жовтня — четвер (пн = 0)
	return (
		<Phone y={PY} w={PW} h={PH}>
			<Fit w={inner}>
				<StatusBar />
				<div style={{position: 'absolute', left: 36, top: 90, fontFamily: F.body, fontWeight: 700, fontSize: 24, color: dim}}>Будиночок у Карпатах</div>
				<div style={{position: 'absolute', left: 36, top: 124, fontFamily: F.display, fontWeight: 900, fontSize: 50, color: ink}}>Жовтень</div>
				<div style={{position: 'absolute', left: 36, top: 240, display: 'grid', gridTemplateColumns: 'repeat(7, 68px)', rowGap: 14, columnGap: 6, fontFamily: F.body, fontWeight: 800, fontSize: 28, textAlign: 'center'}}>
					{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((d) => <div key={d} style={{fontSize: 20, color: dim}}>{d}</div>)}
					{Array.from({length: first}, (_, k) => <div key={`e${k}`} />)}
					{Array.from({length: 31}, (_, k) => {
						const d = k + 1;
						const edge = d === s || d === e;
						const mid = s && e && d > s && d < e;
						return <div key={d} style={{height: 68, lineHeight: '68px', borderRadius: edge ? 34 : 12, background: edge ? T.accent : mid ? `${T.accent}33` : 'transparent', color: edge ? T.onAccent : d < 10 ? '#FFFFFF4D' : ink, transform: `scale(${edge && show(t, d === s ? a + B * 2 : a + B * 4, 0.2) < 1 ? 1.2 : 1})`}}>{d}</div>;
					})}
				</div>
				<div style={{position: 'absolute', left: 36, right: 36, bottom: 50, padding: '28px 36px', borderRadius: 34, background: '#FFFFFF0D', opacity: e ? show(t, a + B * 4 + 0.2) : 0}}>
					<div style={{fontFamily: F.body, fontWeight: 700, fontSize: 26, color: dim}}>14–17 жовтня · 3 ночі</div>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12}}>
						<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 46, color: ink}}>7 200 ₴</span>
						<span style={{padding: '22px 34px', borderRadius: 26, background: T.accent, color: T.onAccent, fontFamily: F.body, fontWeight: 800, fontSize: 30}}>Забронювати</span>
					</div>
				</div>
			</Fit>
		</Phone>
	);
};

const CATS: [string, number, string][] = [['Їжа', 4200, '#D9FF3A'], ['Житло', 3800, '#9A6BFF'], ['Транспорт', 1900, '#39D6CE'], ['Розваги', 2580, '#FFB74D']];
const Budget: React.FC<{t: number; a: number}> = ({t, a}) => {
	const total = CATS.reduce((s, c) => s + c[1], 0);
	const g = show(t, a + 0.4, 1.6);
	const R = 150, Cc = 2 * Math.PI * R;
	let acc = 0;
	return (
		<Phone y={PY} w={PW} h={PH}>
			<Fit w={inner}>
				<StatusBar />
				<div style={{position: 'absolute', left: 36, top: 90, fontFamily: F.body, fontWeight: 700, fontSize: 24, color: dim}}>Витрати · жовтень</div>
				<div style={{position: 'absolute', left: 36, top: 124, fontFamily: F.display, fontWeight: 900, fontSize: 56, color: ink}}>{Math.round(total * g).toLocaleString('uk-UA')} ₴</div>
				<svg viewBox="0 0 400 400" style={{position: 'absolute', left: (SW - 400) / 2, top: 240, width: 400, height: 400}}>
					<circle cx={200} cy={200} r={R} stroke="#FFFFFF14" strokeWidth={56} fill="none" />
					{CATS.map(([n, v, c]) => {
						const len = (v / total) * Cc * g;
						const el = <circle key={n} cx={200} cy={200} r={R} stroke={c} strokeWidth={56} fill="none" strokeDasharray={`${Math.max(0, len - 6)} ${Cc}`} strokeDashoffset={-acc * g} transform="rotate(-90 200 200)" />;
						acc += (v / total) * Cc;
						return el;
					})}
				</svg>
				<div style={{position: 'absolute', left: 36, right: 36, top: 690, display: 'flex', flexDirection: 'column', gap: 26}}>
					{CATS.map(([n, v, c], k) => (
						<div key={n} style={{opacity: show(t, a + 1 + k * 0.15)}}>
							<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.body, fontWeight: 800, fontSize: 28, color: ink}}><span>{n}</span><span>{v.toLocaleString('uk-UA')} ₴</span></div>
							<div style={{height: 14, borderRadius: 7, background: '#FFFFFF14', marginTop: 10}}><div style={{width: `${interpolate(t, [a + 1 + k * 0.15, a + 1.8 + k * 0.15], [0, (v / 4200) * 100], clamp)}%`, height: '100%', borderRadius: 7, background: c}} /></div>
						</div>
					))}
				</div>
			</Fit>
		</Phone>
	);
};

const CinemaApp: React.FC<{t: number; a: number}> = ({t, a}) => <Phone y={PY} w={PW} h={PH}><Fit w={inner}><Seats t={t} a={a} b={B} /></Fit></Phone>;

const P: [string, React.FC<{t: number; a: number}>, string[]][] = [
	['Кінотеатр', CinemaApp, ['вибір місць', 'стан', 'оплата']],
	['Сайт кіно', Catalog, ['API', 'фільтри', 'пошук']],
	['Доставка їжі', Delivery, ['кошик', 'лічильник', 'форма']],
	['Бронювання', Booking, ['календар', 'дати', 'валідація']],
	['Трекер витрат', Budget, ['графіки', 'категорії', 'дані']],
];
const nb = (s: number) => Math.round(s / B / 2) * 2;
const CARDS: Card[] = [
	{beats: nb(3.2), el: (t, a) => <Intro t={t} a={a} kicker="Портфоліо джуна" l1="5 проєктів" l2="для портфоліо" sub="роби по одному — і є що показати" />},
	...P.map(([name, Screen, skills], i): Card => ({beats: nb(6), el: (t, a) => (
		<>
			<CardHead t={t} a={a} n={`${String(i + 1).padStart(2, '0')} / 05`} title={name} />
			<Screen t={t} a={a} />
			<Skills t={t} a={a} y={1500} items={skills} />
		</>
	)})),
	{beats: nb(5.5), sfx: 'impact-movie-epic.mp3', vol: 0.3, off: 0.2, el: (t, a) => <Outro t={t} a={a} ask={<>Який зробиш першим?<br /><L>Напиши номер у коментарях</L></>} />},
];
export const Vis01: React.FC = () => <BeatVideo theme="drop02" track={TRACK} cards={CARDS} />;
export const VIS01_FRAMES = beatFrames(TRACK, CARDS);
