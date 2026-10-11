import React from 'react';
import {random} from 'remotion';
import {F} from '../system/kit';
import {useTheme} from '../system/step';
import {Chip, MOVIES, MoviePoster, StatusBar, show} from './ui';

// Екрани застосунку «Кінотеатр» (Vis-01, Vis-02). Малюємо в координатах 588×1188 (екран телефона 620×1220 без рамки),
// у менший телефон — через <Fit>. t — секунда відео, a — початок картки, b — довжина біту (с).
export const SW = 588;
export const SH = 1188;
export type ScreenP = {t: number; a: number; b: number};
export const Fit: React.FC<{w: number; children: React.ReactNode}> = ({w, children}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: SW, height: SH, transform: `scale(${w / SW})`, transformOrigin: '0 0'}}>{children}</div>
);
const ink = '#FFFFFF';
const dim = '#FFFFFF8C';
const Title: React.FC<{small: string; big: string}> = ({small, big}) => (
	<div style={{position: 'absolute', left: 36, top: 90}}>
		<div style={{fontFamily: F.body, fontWeight: 700, fontSize: 24, color: dim}}>{small}</div>
		<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 50, color: ink, marginTop: 4}}>{big}</div>
	</div>
);
const TabBar: React.FC<{on: number}> = ({on}) => {
	const T = useTheme();
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: '#14141C', borderTop: '1px solid #FFFFFF14', display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
			{['Афіша', 'Квитки', 'Обране', 'Профіль'].map((s, k) => (
				<div key={s} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: F.body, fontWeight: 700, fontSize: 18, color: k === on ? T.accent : dim}}>
					<div style={{width: 30, height: 30, borderRadius: k % 2 ? 8 : 15, border: `3px solid ${k === on ? T.accent : dim}`}} />{s}
				</div>
			))}
		</div>
	);
};

export const Afisha: React.FC<ScreenP> = ({t, a}) => (
	<>
		<StatusBar />
		<Title small="Кінотеатр «Зоря»" big="Афіша" />
		<div style={{position: 'absolute', left: 36, top: 210, display: 'flex', gap: 12}}>
			<Chip on>Сьогодні</Chip><Chip>Завтра</Chip><Chip>Пт 17</Chip><Chip>Сб 18</Chip>
		</div>
		<div style={{position: 'absolute', left: 36, top: 300, display: 'grid', gridTemplateColumns: '246px 246px', gap: 24}}>
			{[4, 0, 2, 1].map((m, k) => {
				const p = show(t, a + 0.15 + k * 0.12, 0.35);
				return (
					<div key={m} style={{position: 'relative', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
						<MoviePoster i={m} w={246} h={350} />
						<div style={{position: 'absolute', right: 12, top: 12, padding: '6px 12px', borderRadius: 12, background: '#000000A6', fontFamily: F.body, fontWeight: 800, fontSize: 22, color: '#FFD54A'}}>★ {MOVIES[m].rating}</div>
					</div>
				);
			})}
		</div>
		<TabBar on={0} />
	</>
);

export const Film: React.FC<ScreenP> = ({t, a, b}) => {
	const T = useTheme();
	const m = MOVIES[4];
	const press = t > a + b * 6 && t < a + b * 6 + 0.25;
	return (
		<>
			<div style={{position: 'absolute', left: 0, top: 0}}><MoviePoster i={4} w={SW} h={600} title={false} radius={0} /></div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 220, background: 'linear-gradient(transparent, #0E0E14)'}} />
			<StatusBar />
			<div style={{position: 'absolute', left: 36, right: 36, top: 540}}>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 56, color: ink}}>{m.title}</div>
				<div style={{display: 'flex', gap: 12, marginTop: 22, opacity: show(t, a + 0.3)}}><Chip>{m.genre}</Chip><Chip>2 год 08 хв</Chip><Chip>12+</Chip><Chip c="#FFD54A" on>★ {m.rating}</Chip></div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 40, opacity: show(t, a + 0.5)}}>{[500, 470, 510, 300].map((w, k) => <div key={k} style={{width: w, height: 16, borderRadius: 8, background: '#FFFFFF22'}} />)}</div>
				<div style={{fontFamily: F.body, fontWeight: 700, fontSize: 26, color: dim, marginTop: 44}}>Сеанси сьогодні</div>
				<div style={{display: 'flex', gap: 12, marginTop: 16, opacity: show(t, a + 0.7)}}>{['13:15', '16:40', '19:20', '21:50'].map((s) => <Chip key={s}>{s}</Chip>)}</div>
			</div>
			<div style={{position: 'absolute', left: 36, right: 36, bottom: 50, height: 100, borderRadius: 30, background: T.accent, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, transform: `scale(${press ? 0.95 : 1})`}}>Обрати сеанс</div>
		</>
	);
};

const SLOTS: [string, string, string][] = [['10:30', 'Зал 1 · 2D', '150 ₴'], ['13:15', 'Зал 2 · 2D', '160 ₴'], ['16:40', 'Зал 3 · 3D', '180 ₴'], ['19:20', 'Зал 1 · 2D', '200 ₴'], ['21:50', 'Зал 3 · 3D', '200 ₴']];
export const Session: React.FC<ScreenP> = ({t, a, b}) => {
	const T = useTheme();
	const pick = t >= a + b * 4;
	return (
		<>
			<StatusBar />
			<Title small={MOVIES[4].title} big="Сеанс" />
			<div style={{position: 'absolute', left: 36, right: 36, top: 220, display: 'flex', justifyContent: 'space-between'}}>
				{['Пн 13', 'Вт 14', 'Ср 15', 'Чт 16', 'Пт 17', 'Сб 18', 'Нд 19'].map((d, k) => {
					const on = k === 4;
					return <div key={d} style={{width: 66, padding: '14px 0', borderRadius: 20, textAlign: 'center', background: on ? T.accent : '#FFFFFF10', color: on ? T.onAccent : ink, fontFamily: F.body, fontWeight: 800, fontSize: 22, lineHeight: 1.4}}>{d.split(' ')[0]}<br /><span style={{fontSize: 30}}>{d.split(' ')[1]}</span></div>;
				})}
			</div>
			<div style={{position: 'absolute', left: 36, right: 36, top: 380, display: 'flex', flexDirection: 'column', gap: 20}}>
				{SLOTS.map(([tm, hall, price], k) => {
					const on = pick && k === 2;
					const p = show(t, a + 0.2 + k * 0.1);
					return (
						<div key={tm} style={{opacity: p, transform: `translateX(${(1 - p) * 60}px) scale(${on ? 1.03 : 1})`, display: 'flex', alignItems: 'center', padding: '26px 30px', borderRadius: 26, background: on ? `${T.accent}26` : '#FFFFFF0D', border: `3px solid ${on ? T.accent : 'transparent'}`}}>
							<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 44, color: ink, width: 170}}>{tm}</div>
							<div style={{flex: 1, fontFamily: F.body, fontWeight: 700, fontSize: 26, color: dim}}>{hall}</div>
							<div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, color: on ? T.accent : ink}}>{on ? '✓ ' : ''}{price}</div>
						</div>
					);
				})}
			</div>
		</>
	);
};

// зал 8×7: зайняті — сидовано, вибрані — по черзі на біт
const COLS = 8, ROWS = 7;
const taken = (r: number, c: number) => random(`seat${r}-${c}`) < 0.32;
export const PICKS: [number, number][] = [[5, 3], [5, 4]];
export const Seats: React.FC<ScreenP & {picks?: [number, number][]; header?: boolean}> = ({t, a, b, picks = PICKS, header = true}) => {
	const T = useTheme();
	const at = (k: number) => a + b * (2 + k * 2);
	const chosen = picks.filter((_, k) => t >= at(k)).length;
	return (
		<>
			<StatusBar />
			{header ? <Title small={`${MOVIES[4].title} · 16:40`} big="Обери місця" /> : null}
			<svg viewBox="0 0 588 80" style={{position: 'absolute', left: 0, top: 250, width: SW, height: 80}}>
				<defs><filter id="sg"><feGaussianBlur stdDeviation="4" /></filter></defs>
				<path d="M60 60 Q294 0 528 60" stroke={T.accent} strokeWidth={8} fill="none" filter="url(#sg)" opacity={0.8} />
				<path d="M60 60 Q294 0 528 60" stroke={T.accent} strokeWidth={4} fill="none" />
				<text x={294} y={74} textAnchor="middle" fill={dim} fontFamily="Inter" fontWeight={700} fontSize={18} letterSpacing={6}>ЕКРАН</text>
			</svg>
			<div style={{position: 'absolute', left: 44, top: 370, display: 'grid', gridTemplateColumns: `repeat(${COLS}, 52px)`, gap: 12}}>
				{Array.from({length: ROWS * COLS}, (_, k) => {
					const r = Math.floor(k / COLS), c = k % COLS;
					const pk = picks.findIndex(([pr, pc]) => pr === r && pc === c);
					const sel = pk >= 0 && t >= at(pk);
					const busy = !sel && pk < 0 && taken(r, c);
					const p = sel ? show(t, at(pk), 0.25) : 0;
					return <div key={k} style={{width: 52, height: 46, borderRadius: '14px 14px 8px 8px', background: sel ? T.accent : busy ? '#FFFFFF1F' : 'transparent', border: `3px solid ${sel ? T.accent : busy ? 'transparent' : '#FFFFFF59'}`, boxSizing: 'border-box', transform: `scale(${sel ? 1 + 0.25 * (1 - p) : 1})`, boxShadow: sel ? `0 0 24px ${T.accent}` : 'none'}} />;
				})}
			</div>
			<div style={{position: 'absolute', left: 44, top: 840, display: 'flex', gap: 30, fontFamily: F.body, fontWeight: 700, fontSize: 22, color: dim}}>
				{[['transparent', '#FFFFFF59', 'Вільне'], ['#FFFFFF1F', 'transparent', 'Зайняте'], [T.accent, T.accent, 'Твоє']].map(([bg, bd, s]) => <span key={s} style={{display: 'flex', alignItems: 'center', gap: 10}}><span style={{width: 26, height: 24, borderRadius: 8, background: bg, border: `3px solid ${bd}`, boxSizing: 'border-box'}} />{s}</span>)}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 190, background: '#14141C', borderTop: '1px solid #FFFFFF14', padding: '28px 36px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
				<div style={{fontFamily: F.body, fontWeight: 700, fontSize: 24, color: dim}}>{chosen ? `Ряд 6 · ${chosen === 1 ? 'місце 4' : 'місця 4–5'}` : 'Обери місця'}<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 44, color: ink, marginTop: 6}}>{chosen * 180} ₴</div></div>
				<div style={{padding: '28px 40px', borderRadius: 28, background: chosen ? T.accent : '#FFFFFF1A', color: chosen ? T.onAccent : dim, fontFamily: F.body, fontWeight: 800, fontSize: 30}}>Оплатити</div>
			</div>
		</>
	);
};

export const Ticket: React.FC<ScreenP> = ({t, a, b}) => {
	const T = useTheme();
	const ok = show(t, a + b * 3, 0.3);
	const row = (k: string, v: string) => <div><div style={{fontSize: 20, color: '#00000080', fontWeight: 700}}>{k}</div><div style={{fontSize: 32, fontWeight: 800, color: '#111'}}>{v}</div></div>;
	return (
		<>
			<StatusBar />
			<Title small="Готово" big="Твій квиток" />
			<div style={{position: 'absolute', left: 44, top: 230, width: 500, height: 860, borderRadius: 36, background: '#F5F5F7', overflow: 'hidden', fontFamily: F.body, opacity: show(t, a + 0.1, 0.4), transform: `translateY(${(1 - show(t, a + 0.1, 0.4)) * 80}px)`}}>
				<div style={{display: 'flex', gap: 22, padding: 28}}>
					<MoviePoster i={4} w={130} h={186} title={false} radius={16} />
					<div><div style={{fontFamily: F.display, fontWeight: 900, fontSize: 34, color: '#111', lineHeight: 1.1}}>{MOVIES[4].title}</div><div style={{fontSize: 22, color: '#00000080', fontWeight: 700, marginTop: 10}}>Кінотеатр «Зоря»</div></div>
				</div>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, padding: '6px 28px 28px'}}>{row('Дата', '17.10')}{row('Час', '16:40')}{row('Зал', '3')}{row('Ряд', '6')}{row('Місця', '4–5')}{row('Сума', '360 ₴')}</div>
				<div style={{position: 'relative', height: 40}}>
					<div style={{position: 'absolute', left: 30, right: 30, top: 19, borderTop: '3px dashed #00000026'}} />
					<div style={{position: 'absolute', left: -20, top: 0, width: 40, height: 40, borderRadius: 20, background: '#0E0E14'}} />
					<div style={{position: 'absolute', right: -20, top: 0, width: 40, height: 40, borderRadius: 20, background: '#0E0E14'}} />
				</div>
				{/* код для входу: декоративна сітка, не справжній QR */}
				<div style={{margin: '24px auto 0', width: 300, display: 'grid', gridTemplateColumns: 'repeat(15, 20px)'}}>
					{Array.from({length: 225}, (_, k) => {
						const r = Math.floor(k / 15), c = k % 15;
						// три «вічка» 5×5 по кутах: рамка + центр
						const i = r % 10, j = c % 10;
						const eye = (r < 5 || r >= 10) && (c < 5 || c >= 10) && !(r >= 10 && c >= 10);
						const on = eye ? i === 0 || i === 4 || j === 0 || j === 4 || (i === 2 && j === 2) : random(`qr${k}`) > 0.5;
						return <div key={k} style={{width: 20, height: 20, background: on ? '#111' : 'transparent'}} />;
					})}
				</div>
			</div>
			<div style={{position: 'absolute', left: '50%', top: 1110, transform: `translateX(-50%) scale(${0.6 + 0.4 * ok})`, opacity: ok, padding: '14px 30px', borderRadius: 999, background: T.accent, color: T.onAccent, fontFamily: F.body, fontWeight: 800, fontSize: 28, whiteSpace: 'nowrap'}}>✓ Оплачено</div>
		</>
	);
};

export const SCREENS = [Afisha, Film, Session, Seats, Ticket];
