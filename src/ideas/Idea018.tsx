import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Sfx, clamp, ramp} from '../system/kit';
import {S, at, io, pop} from '../system/step';
import {chunkEnd, chunkWords} from '../system/captions';
import WORDS from '../../public/ideas/idea-018/words.json';

// ID-018 «Lovim: прикраси Альони» — промо сайту lovim.devguide.com.ua для Reels Альони, 1080×1920.
// Сценарій: public/ideas/idea-018/scenario.md. Стиль сайту клієнтки, не DevGuide: крем, троянда, Cormorant Garamond.
if (typeof document !== 'undefined') {
	const handle = delayRender('Lovim fonts');
	Promise.all(
		["500 100px 'Cormorant Garamond'", "600 100px 'Cormorant Garamond'", '600 100px Manrope', '800 100px Manrope'].map((s) => document.fonts.load(s, 'Прикраса Lovim')),
	).then(() => continueRender(handle), () => continueRender(handle));
}

const K = {cream: '#FFF9F3', sand: '#F3E7DA', ink: '#211C1B', rose: '#B56364', char: '#2A2523', gold: '#C29453', dim: '#7A6C66'};
const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = 'Manrope, Inter, Arial, sans-serif';
const DIR = 'ideas/idea-018';
const shot = (f: string) => staticFile(`${DIR}/shots/${f}`);

const a = (w: string, after = 0) => at(WORDS, w, after);
const END = WORDS[WORDS.length - 1].e;
export const IDEA_018 = S(END + 3);

// музика: 90 BPM, перші 2 с треку — тиша, тож обрізаємо їх; біт у відео кожні 2/3 с від 0
const MUSIC_SKIP = 2;
const BEAT = 60 / 90;

// ---------- будівельні блоки ----------
const R: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: K.rose}}>{children}</span>;

/** Заголовок сайту: Cormorant, з'являється знизу. Текст не масштабуємо (motion-quality). */
const Head: React.FC<{t: number; a: number; b: number; y?: number; size?: number; color?: string; children: React.ReactNode}> = ({t, a: from, b, y = 200, size = 92, color = K.ink, children}) => {
	if (t < from - 0.01 || t > b) return null;
	const p = pop(t, from, 0.5);
	return (
		<div style={{position: 'absolute', left: 84, width: 912, top: y, opacity: io(t, from, b, 0.3), transform: `translateY(${(1 - p) * 28}px)`, fontFamily: SERIF, fontWeight: 500, fontSize: size, lineHeight: 1.04, letterSpacing: -0.5, color, textAlign: 'center'}}>
			{children}
		</div>
	);
};

const Kicker: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = K.rose, style}) => (
	<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 7, color, textTransform: 'uppercase', ...style}}>{children}</div>
);

/** Фото в картці 4:5 з повільним наближенням (Ken Burns) між a і b. */
const PhotoCard: React.FC<{t: number; a: number; b: number; src: string; zoom?: [number, number]; origin?: string; y?: number}> = ({t, a: from, b, src, zoom = [1, 1.08], origin = '50% 50%', y = 470}) => {
	const z = interpolate(t, [from, b], zoom, clamp);
	return (
		<div style={{position: 'absolute', left: 70, top: y, width: 940, height: 1175, borderRadius: 44, overflow: 'hidden', boxShadow: '0 40px 100px #2A252338', background: K.sand}}>
			<Img src={shot(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: origin}} />
		</div>
	);
};

/** Шар сцени: м'яка поява/зникання. */
const Layer: React.FC<{t: number; a: number; b: number; fade?: number; children: React.ReactNode}> = ({t, a: from, b, fade = 0.3, children}) => {
	if (t < from - 0.01 || t > b + 0.01) return null;
	return <AbsoluteFill style={{opacity: io(t, from, b, fade)}}>{children}</AbsoluteFill>;
};

/** Телефон зі скріном сайту, прокрутка scroll (px скріна). */
const Phone: React.FC<{src: string; x: number; y: number; w: number; h: number; scroll: number; o?: number}> = ({src, x, y, w, h, scroll, o = 1}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: 16, borderRadius: w * 0.13, background: '#1C1817', opacity: o, boxShadow: '0 50px 120px #2A25235C, inset 0 0 0 2px #ffffff18'}}>
		<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.11, overflow: 'hidden', background: K.cream}}>
			<Img src={shot(src)} style={{position: 'absolute', left: 0, top: 0, width: '100%', transform: `translateY(${-scroll}px)`}} />
			<div style={{position: 'absolute', left: '50%', top: 14, width: w * 0.3, height: 34, marginLeft: -w * 0.15, borderRadius: 20, background: '#1C1817'}} />
		</div>
	</div>
);

const StoneBadge: React.FC<{src: string; p: number}> = ({src, p}) => (
	<div style={{width: 132, height: 132, borderRadius: 66, padding: 10, background: K.cream, boxShadow: '0 16px 40px #2A252340', opacity: p, transform: `translateX(${(1 - p) * -60}px) rotate(${(1 - p) * -40}deg)`}}>
		<Img src={shot(src)} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
	</div>
);

/** Паперовий літачок по дузі, p 0..1. */
const Plane: React.FC<{p: number}> = ({p}) => {
	const x = interpolate(p, [0, 1], [-120, 1180]);
	const y = 1350 - Math.sin(p * Math.PI) * 520 - p * 380;
	const ang = -Math.atan2(Math.cos(p * Math.PI) * 520 * Math.PI + 380, 1300) * (180 / Math.PI);
	return (
		<svg width={150} height={150} viewBox="0 0 24 24" style={{position: 'absolute', left: x - 75, top: y - 75, transform: `rotate(${ang + 45}deg)`, filter: 'drop-shadow(0 12px 18px #2A252350)'}}>
			<path d="M22 2 11 13" stroke={K.cream} strokeWidth={1.6} fill="none" strokeLinecap="round" />
			<path d="M22 2 15 22l-4-9-9-4 20-7z" fill={K.cream} stroke={K.rose} strokeWidth={1.2} strokeLinejoin="round" />
		</svg>
	);
};

const CHUNKS = chunkWords(WORDS, 30);
const Captions: React.FC<{t: number; from: number; until: number}> = ({t, from, until}) => {
	const i = CHUNKS.findIndex((c, k) => t >= c[0].s - 0.05 && t < chunkEnd(CHUNKS, k));
	if (i < 0) return null;
	const c = CHUNKS[i];
	if (c[0].s < from || c[0].s >= until) return null;
	return (
		<div style={{position: 'absolute', left: 84, width: 912, bottom: 330, display: 'flex', justifyContent: 'center', opacity: io(t, c[0].s - 0.05, chunkEnd(CHUNKS, i), 0.12)}}>
			<div style={{padding: '14px 30px', borderRadius: 22, background: `${K.cream}EB`, boxShadow: '0 14px 40px #2A252326', fontFamily: SANS, fontWeight: 800, fontSize: 48, lineHeight: 1.25, textAlign: 'center', color: K.ink}}>
				{c.map((w, k) => (
					<span key={k} style={{color: t >= w.s && t < (c[k + 1]?.s ?? w.e + 0.3) ? K.rose : t >= w.s ? K.ink : `${K.ink}80`}}>{w.w}{k < c.length - 1 ? ' ' : ''}</span>
				))}
			</div>
		</div>
	);
};

// ---------- сцени ----------
const MONTAGE = ['p-malakhit.jpg', 'p-morganit.jpg', 'p-yashma.jpg', 'p-zolotyi-pisok.jpg'];

export const Idea018: React.FC = () => {
	const frame = useCurrentFrame();
	// кадр 0 = обкладинка для сітки Instagram: показуємо вже проявлений постер
	const t = frame === 0 ? 1.2 : frame / 30;

	const tAlona = a('Мене') - 0.15;
	const tMont = a('Кожен') - 0.12;
	const tTiger = a('Тигрове') - 0.08;
	const tAmet = a('Аметист') - 0.08;
	const tRose = a('Рожевий') - 0.08;
	const tPhone = a('Оберіть') - 0.1;
	const tGift = a('Кожна') - 0.1;
	const tSend = a('А', tGift + 2) - 0.05;
	const tEnd = a('Каталог') - 0.12;
	const total = IDEA_018 / 30;

	// склейки монтажу на біт (кожні 2 біти після першого)
	const cut0 = Math.ceil(tMont / BEAT + 1) * BEAT;
	const cuts = [tMont, cut0, cut0 + 2 * BEAT, cut0 + 4 * BEAT, tTiger];
	const mi = Math.max(0, cuts.findIndex((c, i) => t >= c && t < cuts[i + 1]));

	const alonaIn = spring({frame: frame - S(tAlona), fps: 30, config: {damping: 16, stiffness: 90}});
	const phoneIn = spring({frame: frame - S(tPhone), fps: 30, config: {damping: 18, stiffness: 80}});
	const endPhone = spring({frame: frame - S(tEnd + 0.2), fps: 30, config: {damping: 18, stiffness: 80}});

	const music = (f: number) => {
		const s = f / 30;
		const base = interpolate(s, [0, 7.5, 9.5], [0.9, 0.9, 0.3], clamp);
		const outro = interpolate(s, [END, END + 0.6], [0, 0.06], clamp);
		return (base + outro) * interpolate(s, [0, 0.4, total - 1.6, total], [0, 1, 1, 0], clamp);
	};

	return (
		<AbsoluteFill style={{background: K.cream, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: `radial-gradient(900px 700px at 80% 8%, ${K.rose}1C, transparent 70%), radial-gradient(900px 800px at 10% 95%, ${K.gold}22, transparent 70%)`}} />

			<Audio src={staticFile(`${DIR}/voice.mp3`)} />
			<Audio src={staticFile(`${DIR}/music/thinking-about-you.mp3`)} trimBefore={S(MUSIC_SKIP)} volume={music} />
			<Sfx at={0} src="shimmer-sparkle-sweep.mp3" vol={0.22} />
			<Sfx at={S(tAlona)} src="air-woosh-deep.mp3" vol={0.22} dur={45} />
			<Sfx at={S(tTiger)} src="soft-pop.wav" vol={0.3} dur={20} />
			<Sfx at={S(tPhone)} src="air-woosh-deep.mp3" vol={0.2} dur={45} />
			<Sfx at={S(a('карткою'))} src="sparkle-touch.mp3" vol={0.3} dur={60} />
			<Sfx at={S(a('напряму') - 0.3)} src="whoosh-swirl.mp3" vol={0.22} dur={50} />
			<Sfx at={S(tEnd)} src="shimmer-sparkle-sweep.mp3" vol={0.25} />

			{/* 1. Обкладинка: фото на весь кадр, титул у центральній зоні 3:4 */}
			<Layer t={t} a={-1} b={tAlona}>
				<div style={{position: 'absolute', left: 0, top: -170, width: 1080, height: 1350, overflow: 'hidden'}}>
					<Img src={shot('p-akvamaryn.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(t, [0, tAlona], [1.02, 1.1], clamp)})`, transformOrigin: '40% 35%'}} />
				</div>
				<AbsoluteFill style={{background: `linear-gradient(180deg, transparent 30%, ${K.cream}E6 44%, ${K.cream} 52%)`}} />
				<div style={{position: 'absolute', left: 84, width: 912, top: 1040, textAlign: 'center'}}>
					<Kicker>Lovim · ручна робота · Львів</Kicker>
				</div>
				<div style={{position: 'absolute', left: 84, width: 912, top: 1110, textAlign: 'center', fontFamily: SERIF, fontWeight: 500, fontSize: 112, lineHeight: 1.02, color: K.ink, letterSpacing: -1}}>
					Шукаєте прикрасу,<br /><R>яка щось означає?</R>
				</div>
			</Layer>

			{/* 2. Альона */}
			<Layer t={t} a={tAlona} b={tMont}>
				<div style={{position: 'absolute', left: 0, width: 1080, top: 200, textAlign: 'center'}}><Kicker>Майстриня · Львівщина</Kicker></div>
				<Head t={t} a={tAlona + 0.1} b={tMont} y={262} size={104}>Мене звати <R>Альона</R></Head>
				<div style={{position: 'absolute', left: 170, top: 480 + (1 - alonaIn) * 260, width: 740, height: 815, borderRadius: 44, overflow: 'hidden', transform: `rotate(${(1 - alonaIn) * -6 - 1.5}deg)`, boxShadow: '0 40px 100px #2A252340', border: `10px solid ${K.cream}`}}>
					<Img src={shot('alona.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(t, [tAlona, tMont], [1.02, 1.1], clamp)})`}} />
				</div>
				<div style={{position: 'absolute', left: 84, width: 912, top: 1320, display: 'flex', justifyContent: 'center', gap: 16}}>
					{(['браслети', 'кулони', 'обереги'] as const).map((w) => {
						const p = pop(t, a(w, tAlona), 0.35);
						return <span key={w} style={{opacity: p, transform: `translateY(${(1 - p) * 20}px)`, padding: '14px 30px', borderRadius: 999, background: K.rose, color: K.cream, fontFamily: SANS, fontWeight: 800, fontSize: 38}}>{w}</span>;
					})}
				</div>
			</Layer>

			{/* 3. Монтаж: двох однакових не буває (склейки на біт) */}
			<Layer t={t} a={tMont} b={tTiger} fade={0.2}>
				<Head t={t} a={tMont + 0.05} b={a('двох') - 0.1} size={96}>Кожен виріб —<br /><R>власноруч</R></Head>
				<Head t={t} a={a('двох') - 0.1} b={tTiger} size={96}>Двох однакових<br /><R>не буває</R></Head>
				<div style={{position: 'absolute', inset: 0, transform: `scale(${1 + (1 - pop(t, cuts[mi], 0.3)) * 0.035})`}}>
					<PhotoCard t={t} a={cuts[mi]} b={cuts[mi + 1]} src={MONTAGE[mi]} zoom={[1.02, 1.08]} />
				</div>
			</Layer>

			{/* 4. Три камені */}
			{([
				[tTiger, tAmet, 'p-tyhrove-oko.jpg', 'stone-tyhrove-oko.webp', 'Тигрове око', 'камінь впевненості'],
				[tAmet, tRose, 'p-ametyst.jpg', 'stone-ametyst.webp', 'Аметист', 'камінь спокою'],
				[tRose, tPhone, 'p-rozh-kvarts.jpg', 'stone-rozhevyi-kvarts.webp', 'Рожевий кварц', 'камінь любові'],
			] as const).map(([from, to, photo, stone, name, mean]) => (
				<Layer key={name} t={t} a={from} b={to} fade={0.25}>
					<PhotoCard t={t} a={from} b={to} src={photo} />
					<div style={{position: 'absolute', left: 84, top: 196, width: 912, display: 'flex', alignItems: 'center', gap: 34}}>
						<StoneBadge src={stone} p={pop(t, from + 0.05, 0.45)} />
						<div style={{opacity: pop(t, from + 0.12, 0.4), transform: `translateX(${(1 - pop(t, from + 0.12, 0.4)) * 30}px)`, fontFamily: SERIF, fontWeight: 500, fontSize: 92, lineHeight: 1.02, color: K.ink}}>
							{name}
							<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: K.rose, textTransform: 'uppercase', marginTop: 10}}>{mean}</div>
						</div>
					</div>
				</Layer>
			))}

			{/* 5. Сайт: оберіть свій камінь */}
			<Layer t={t} a={tPhone} b={tGift}>
				<Head t={t} a={tPhone + 0.05} b={tGift} size={84}>Оберіть камінь,<br /><R>який звучить як ви</R></Head>
				<Phone src="site-stones.png" x={255} y={470 + (1 - phoneIn) * 420} w={570} h={1150} scroll={interpolate(t, [tPhone + 0.5, tGift], [40, 820], clamp)} o={phoneIn} />
			</Layer>

			{/* 6. Подарунок: коробочка + картка зі значенням каменю */}
			<Layer t={t} a={tGift} b={tSend}>
				<Head t={t} a={tGift + 0.05} b={a('карткою') - 0.1} size={96}>Подарункова<br /><R>коробочка</R></Head>
				<Head t={t} a={a('карткою') - 0.1} b={tSend} size={84}>+ картка<br /><R>зі значенням каменю</R></Head>
				<PhotoCard t={t} a={a('карткою') - 0.4} b={tSend} src="p-akvamaryn-2.jpg" zoom={[1, 1.38]} origin="72% 82%" />
			</Layer>

			{/* 7. Надішлю напряму */}
			<Layer t={t} a={tSend} b={tEnd}>
				<Head t={t} a={tSend + 0.05} b={a('тому', tSend) - 0.1} size={96}>Можу надіслати<br /><R>напряму</R></Head>
				<Head t={t} a={a('тому', tSend) - 0.1} b={tEnd} size={88}>тому, кого хочете<br /><R>порадувати</R></Head>
				<PhotoCard t={t} a={tSend} b={tEnd} src="p-lazuryt-set.jpg" />
				{t > a('напряму') - 0.4 && t < a('напряму') + 1.8 ? <Plane p={ramp(t, a('напряму') - 0.4, a('напряму') + 1.6, 0, 1, (x) => x)} /> : null}
			</Layer>

			{/* 8. End card */}
			<Layer t={t} a={tEnd} b={total + 1} fade={0.4}>
				<AbsoluteFill style={{background: K.char}} />
				<AbsoluteFill style={{background: `radial-gradient(800px 700px at 50% 45%, ${K.rose}30, transparent 70%)`}} />
				<div style={{position: 'absolute', left: 0, width: 1080, top: 205, textAlign: 'center', opacity: pop(t, tEnd + 0.1, 0.6), fontFamily: SERIF, fontWeight: 600, fontSize: 168, lineHeight: 1, color: K.cream, letterSpacing: 2}}>
					L<span style={{color: K.rose}}>o</span>vim
				</div>
				<div style={{position: 'absolute', left: 540 - 160, top: 395, width: 320 * ramp(t, tEnd + 0.4, tEnd + 1.2), height: 3, background: K.gold, marginLeft: 0, transformOrigin: 'left'}} />
				<div style={{position: 'absolute', left: 0, width: 1080, top: 428, textAlign: 'center', opacity: pop(t, tEnd + 0.6, 0.5)}}>
					<Kicker color={`${K.cream}B3`}>прикраси ручної роботи · Львів</Kicker>
				</div>
				<Phone src="site-hero.png" x={300} y={520 + (1 - endPhone) * 380} w={480} h={850} scroll={interpolate(t, [tEnd + 1, total], [0, 140], clamp)} o={endPhone} />
				<div style={{position: 'absolute', left: 0, width: 1080, top: 1418, textAlign: 'center', opacity: pop(t, a('сайті') , 0.45), fontFamily: SANS, fontWeight: 800, fontSize: 46, color: K.cream}}>
					lovim.devguide.com.ua
				</div>
				<div style={{position: 'absolute', left: 0, width: 1080, top: 1500, display: 'flex', justifyContent: 'center'}}>
					{(() => {
						const p = pop(t, a('Посилання'), 0.45);
						const pulse = 1 + Math.sin(ramp(t, a('Посилання') + 0.5, a('Посилання') + 1.1) * Math.PI) * 0.04;
						return <span style={{opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${pulse})`, padding: '24px 52px', borderRadius: 999, background: K.rose, color: K.cream, fontFamily: SANS, fontWeight: 800, fontSize: 44, boxShadow: `0 24px 70px ${K.rose}66`}}>Посилання в профілі →</span>;
					})()}
				</div>
			</Layer>

			{frame > 0 ? <Captions t={t} from={tAlona - 0.3} until={tEnd} /> : null}
		</AbsoluteFill>
	);
};
