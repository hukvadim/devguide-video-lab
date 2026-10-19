import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {F, Sfx, clamp, ramp} from '../system/kit';
import WORDS from '../../public/ideas/screen-rec/words.json';

// Screen Studio-подібний запис: claude.ai → вхід через Google → чат. Сирий запис: public/ideas/screen-rec/raw.mp4
// (ffmpeg gdigrab 1920x1080 без системного курсора; час кліків — log.txt). Курсор і зум малюємо тут.
// Усі координати — пікселі екрана запису, час — секунди запису.
const FPS = 30;
const TOP = 121; // верх вьюпорта сторінки (вище — вкладки Chrome, їх не показуємо)
const VIEW_H = 911;

// шматки запису, які лишаються в ролику (простої між кроками вирізано)
const CLIPS: [number, number][] = [
	[60.6, 63.6], // сторінка входу → «Продовжити з Google»
	[71.0, 79.5], // вибір акаунта → «Продовжити» → домашня Claude
	[108.9, 114.0], // клік у поле, набір тексту
	[132.6, 141.6], // надіслати → відповідь
];
const starts = CLIPS.reduce<number[]>((a, [s, e], i) => [...a, i ? a[i - 1] + Math.round((CLIPS[i - 1][1] - CLIPS[i - 1][0]) * FPS) : 0], []);
const BODY = starts[starts.length - 1] + Math.round((CLIPS[CLIPS.length - 1][1] - CLIPS[CLIPS.length - 1][0]) * FPS);
// секунда запису → кадр ролика
const out = (sec: number) => {
	const i = CLIPS.findIndex(([s, e]) => sec >= s && sec <= e);
	if (i < 0) throw new Error(`${sec}s не в жодному шматку`);
	return starts[i] + Math.round((sec - CLIPS[i][0]) * FPS);
};

// камера: [сек, центр x, центр y, зум, кадрів на перехід?]
const CAM: [number, number, number, number, number?][] = [
	[60.6, 600, 540, 1.25],
	[62.6, 592, 534, 1.9],
	[63.4, 965, 560, 1.5],
	[71.6, 965, 520, 1.6],
	[73.0, 830, 480, 2.0],
	[74.6, 965, 600, 1.6],
	[75.9, 1080, 660, 2.0],
	[78.0, 1100, 540, 1.35],
	[109.7, 980, 568, 1.9],
	[111.5, 1010, 568, 2.1],
	[133.3, 1300, 600, 1.9],
	[134.6, 1062, 420, 1.65],
	[141.6, 1062, 640, 1.65, 190], // повільна панорама по відповіді
];
// курсор: [сек, x, y, клік?]
const CUR: [number, number, number, boolean][] = [
	[60.6, 860, 760, false],
	[62.67, 592, 534, true],
	[71.0, 700, 700, false],
	[73.0, 795, 480, true],
	[75.9, 1107, 672, true],
	[108.9, 1250, 760, false],
	[109.78, 920, 568, true],
	[113.4, 1180, 700, false],
	[133.38, 1400, 622, true],
	[134.8, 1560, 760, false],
];
const CLICKS = CUR.filter((c) => c[3]).map((c) => out(c[0]));

const ease = Easing.bezier(0.45, 0, 0.2, 1);
// тримаємо попереднє значення, за `dur` кадрів до наступного ключа плавно переходимо
const track = (f: number, keys: (number | boolean | undefined)[][], dur: number, n: number): number[] => {
	const k = keys.map((r) => [out(r[0] as number), ...r.slice(1, n + 1).map(Number), typeof r[n + 1] === "number" ? (r[n + 1] as number) : dur]);
	let i = k.findIndex((r) => r[0] > f);
	if (i === -1) return k[k.length - 1].slice(1, n + 1);
	if (i === 0) return k[0].slice(1, n + 1);
	const a = k[i - 1], b = k[i];
	const p = interpolate(f, [Math.max(a[0], b[0] - b[n + 1]), b[0]], [0, 1], {...clamp, easing: ease});
	return a.slice(1, n + 1).map((v, j) => v + (b[j + 1] - v) * p);
};

const Arrow: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size * 1.5} viewBox="0 0 20 30" style={{filter: 'drop-shadow(0 3px 5px #0006)', display: 'block'}}>
		<path d="M1.5 1.5 L1.5 23 L6.6 18.2 L10 26.3 L13.6 24.8 L10.2 16.9 L17.3 16.9 Z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
	</svg>
);

const Rec: React.FC = () => {
	const f = useCurrentFrame();
	const [cx, cy, s] = track(f, CAM, 22, 3);
	const [mx, my] = track(f, CUR, 16, 2);
	const tx = 540 - cx * s;
	const ty = 960 - (cy - TOP) * s;
	const near = CLICKS.map((c) => f - c).filter((d) => d >= -3 && d < 18)[0];
	const press = near === undefined ? 1 : interpolate(near, [-3, 0, 6], [1, 0.82, 1], clamp);
	const ring = near === undefined || near < 0 ? 0 : near / 18;
	const sx = mx * s + tx;
	const sy = (my - TOP) * s + ty;
	return (
		<AbsoluteFill style={{background: '#ECEAE2'}}>
			<div style={{position: 'absolute', left: tx, top: ty, width: 1920 * s, height: VIEW_H * s, overflow: 'hidden', borderRadius: 28 * s, boxShadow: '0 30px 90px #0000002a', background: '#FAF9F5'}}>
				{CLIPS.map(([a, b], i) => (
					<Sequence key={i} from={starts[i]} durationInFrames={Math.round((b - a) * FPS)} layout="none">
						<OffthreadVideo src={staticFile('ideas/screen-rec/raw.mp4')} trimBefore={Math.round(a * FPS)} muted
							style={{position: 'absolute', left: 0, top: -TOP * s, width: 1920 * s, height: 1080 * s}} />
					</Sequence>
				))}
			</div>
			{ring > 0 ? (
				<div style={{position: 'absolute', left: sx - 60, top: sy - 60, width: 120, height: 120, borderRadius: 60, border: '6px solid #D97757', opacity: 1 - ring, transform: `scale(${0.3 + ring})`}} />
			) : null}
			<div style={{position: 'absolute', left: sx - 4, top: sy - 3, transform: `scale(${press})`, transformOrigin: '4px 3px'}}>
				<Arrow size={46} />
			</div>
			{CLICKS.map((c) => <Sfx key={c} at={c - 1} src="click/mouse-click-352734.mp3" vol={0.18} dur={15} />)}
		</AbsoluteFill>
	);
};

const POSTER = 90;
const END = 90;
export const SCREEN_REC = POSTER - 10 + BODY + END;
const ORANGE = '#C2410C'; // акцент Claude, темніший за #D97757 — ≥3:1 на кремовому

// кадр 0 — готовий постер: заголовок у центральній зоні 3:4, під ним розмитий перший кадр запису
const Poster: React.FC = () => {
	const f = useCurrentFrame();
	const out = ramp(f, POSTER - 10, POSTER);
	return (
		<AbsoluteFill style={{background: '#ECEAE2', opacity: 1 - out}}>
			<div style={{position: 'absolute', left: -420, top: 1100, width: 1920, height: VIEW_H, overflow: 'hidden', filter: 'blur(10px)', opacity: 0.45}}>
				<OffthreadVideo src={staticFile('ideas/screen-rec/raw.mp4')} trimBefore={Math.round(CLIPS[0][0] * FPS)} muted
					style={{position: 'absolute', left: 0, top: -TOP, width: 1920, height: 1080}} />
			</div>
			<div style={{position: 'absolute', left: 84, right: 84, top: 520, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 110, lineHeight: 1.08, letterSpacing: -3, color: '#1B1B18'}}>
				Як почати<br />з <span style={{color: ORANGE}}>Claude</span><br />за 20 секунд
			</div>
		</AbsoluteFill>
	);
};

const Outro: React.FC = () => {
	const f = useCurrentFrame();
	const a = ramp(f, 0, 14);
	const b = ramp(f, 12, 28);
	return (
		<AbsoluteFill style={{background: '#ECEAE2', opacity: a}}>
			<div style={{position: 'absolute', left: 84, right: 84, top: 760, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 96, lineHeight: 1.1, letterSpacing: -3, color: '#1B1B18', transform: `translateY(${(1 - a) * 30}px)`}}>
				Тепер<br />спробуй сам
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1080, display: 'flex', justifyContent: 'center', opacity: b, transform: `scale(${0.9 + b * 0.1})`}}>
				<div style={{padding: '22px 60px', borderRadius: 999, background: ORANGE, color: '#fff', fontFamily: F.display, fontWeight: 900, fontSize: 64}}>claude.ai</div>
			</div>
		</AbsoluteFill>
	);
};

// голос (public/ideas/screen-rec/voice.txt → voice.mp3) нарізаний фразами під події запису:
// [від, до] у секундах голосу, кадр ролика, субтитр? (на постері й фіналі текст уже на екрані)
const VOICE: [number, number, number, boolean][] = [
	// межі — середини реальних пауз (ffmpeg silencedetect), не таймінги ElevenLabs: ті ріжуть звук посеред слова
	[0, 2.54, 8, false], // Як почати з Клодом за двадцять секунд
	[2.54, 6.56, 84, true], // Відкрий claude.ai і натисни «Продовжити з Google» (клік ≈142)
	[6.56, 9.31, 206, true], // Обери свій Google-акаунт і підтверди вхід (кліки ≈230, ≈317) — паузи між ними немає
	[9.31, 10.99, 380, true], // Усе, ти всередині (домашня ≈380)
	[10.99, 16.42, 436, true], // Пиши питання… Наприклад: що мені сьогодні приготувати? (надіслати ≈601)
	[16.42, 19.87, 625, true], // І за кілька секунд маєш готові варіанти…
	[19.87, 21.36, 856, false], // Тепер спробуй сам
];
const len = (a: number, b: number) => Math.round((b - a) * FPS);

// караоке-рядок: сказані слова чорні, наступні — бліді
const Caption: React.FC = () => {
	const f = useCurrentFrame();
	const v = VOICE.find(([a, b, at, cap]) => cap && f >= at - 4 && f < at + len(a, b) + 10);
	if (!v) return null;
	const [a, b, at] = v;
	// у субтитрі лише поточне речення фрази
	const all = WORDS.filter((w) => w.s >= a - 0.01 && w.e <= b + 0.05);
	const said = (w: {s: number}) => f >= at + (w.s - a) * FPS;
	const ends = all.map((w, i) => (/[.?!»]$/.test(w.w) && !/^«/.test(w.w) ? i : -1)).filter((i) => i >= 0);
	const cur = Math.max(0, all.filter(said).length - 1);
	const from = (ends.filter((i) => i < cur).pop() ?? -1) + 1;
	const words = all.slice(from, (ends.find((i) => i >= cur) ?? all.length - 1) + 1);
	const k = ramp(f, at - 4, at + 4) * (1 - ramp(f, at + len(a, b) + 2, at + len(a, b) + 10));
	return (
		<div style={{position: 'absolute', left: 84, right: 84, top: 1500, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
			<div style={{padding: '18px 32px', borderRadius: 28, background: '#FFFFFFF2', boxShadow: '0 12px 40px #0000001f', textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 52, lineHeight: 1.2, color: '#1B1B18'}}>
				{words.map((w, i) => (
					<span key={i} style={{opacity: said(w) ? 1 : 0.35}}>{w.w} </span>
				))}
			</div>
		</div>
	);
};

export const ScreenRec: React.FC = () => (
	<AbsoluteFill style={{background: '#ECEAE2'}}>
		<Sequence from={POSTER - 10} durationInFrames={BODY}><Rec /></Sequence>
		<Sequence durationInFrames={POSTER}><Poster /></Sequence>
		<Sequence from={POSTER - 10 + BODY - 8}><Outro /></Sequence>
		<Caption />
		{VOICE.map(([a, b, at]) => (
			<Sequence key={at} from={at} durationInFrames={len(a, b)} layout="none">
				<Audio src={staticFile('ideas/screen-rec/voice.mp3')} trimBefore={Math.round(a * FPS)}
					volume={(f) => interpolate(f, [0, 2, len(a, b) - 2, len(a, b)], [0, 1, 1, 0], clamp)} />
			</Sequence>
		))}
		<Audio src={staticFile('assets/music/23-chill-digital-clouds.mp3')} volume={(f) => interpolate(f, [0, 20, SCREEN_REC - 40, SCREEN_REC], [0, 0.07, 0.07, 0], clamp)} />
	</AbsoluteFill>
);
