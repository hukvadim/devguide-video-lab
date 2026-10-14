import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F, Sfx, Stage, clamp, ramp} from '../system/kit';
import {BeatVideo, Card, M, Poster, beat, beatFrames} from '../system/beat';
import {Big, Box, Captions, L, PatternBg, Pill, Reply, S, Strike, UserMsg, Win, X, W, at, pop, useTheme} from '../system/step';
import {chunkWords} from '../system/captions';
import {ThemeProvider} from '../system/theme';
import WORDS_A from '../../public/ideas/ads-a/words.json';
import WORDS_B from '../../public/ideas/ads-b/words.json';

// devguide.com.ua/learning, 8 напрямів (знято 2026-10-12, 860×1864): упакована програма поруч із персональними заняттями
const LEARNING = {src: 'ideas/ads/learning.png', texAspect: 1864 / 860};
const learningCard = (title: React.ReactNode, beats: number): Card => ({
	beats, sfx: 'whoosh/whoosh-cinematic-376875.mp3', vol: 0.3,
	el: (t, a, z) => <Phone3D t={t} a={a} dur={z - a} {...LEARNING} kicker="devguide.com.ua/learning" title={title} sub="8 напрямів · сучасні AI-інструменти" />,
});
import {UgcInsert, ugc} from '../system/ugc';
import {Phone3D} from '../system/phone3d';

// Meta-реклама менторства (ADS/03-video). v1 без голосу: музика на біт, картка = одна картинка + ≤6 слів, Flow-вставки з Вадимом.
// Голос Вадима додамо у v2, коли буде запис. Скриншоти портфоліо: public/ideas/ads/ (знято Playwright 2026-10-12).

const TRACK_A = '20-edm-be-happy.mp3';
const TRACK_B = '14-edm-i-do.mp3';

/** Підпис картки зверху (≤6 слів). */
const Head: React.FC<{t: number; a: number; children: React.ReactNode; y?: number; size?: number}> = ({t, a, children, y = 230, size = 84}) => (
	<Box y={y} o={pop(t, a, 0.3)}><Big size={size}>{children}</Big></Box>
);

/** Телефон зі скриншотами сайту: кадри змінюються слайдом на рівні частки картки [a, z]. */
const Phone: React.FC<{t: number; a: number; z: number; srcs: string[]; y?: number}> = ({t, a, z, srcs, y = 520}) => {
	const p = pop(t, a + 0.1, 0.45);
	const seg = (z - a) / srcs.length;
	return (
		<div style={{position: 'absolute', left: 540 - 270, top: y, width: 540, height: 1080, borderRadius: 64, padding: 18, background: '#05080A', border: `3px solid ${C.line}`, boxShadow: `0 60px 140px #000000C0, 0 0 0 2px ${C.lime}33`, opacity: p, transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * -4}deg)`}}>
			<div style={{width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', position: 'relative', background: '#000'}}>
				{srcs.map((src, i) => {
					const s0 = a + i * seg;
					const x = i === 0 ? 0 : (1 - ramp(t, s0 - 0.15, s0 + 0.2)) * 100; // наступний кадр заїжджає справа
					return <Img key={src} src={staticFile(`ideas/ads/${src}`)} style={{position: 'absolute', inset: 0, width: '100%', transform: `translateX(${x}%) translateY(${-ramp(t, s0, s0 + seg, 0, 40)}px)`}} />;
				})}
			</div>
		</div>
	);
};

/** Документ ТЗ: розділи з'являються по черзі. */
const Tz: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const rows = ['Мета сайту', 'Аудиторія', 'Сторінки й блоки', 'Заявка → Telegram', 'Аналітика'];
	return (
		<Win y={560} label="tz.md" o={pop(t, a, 0.4)}>
			{rows.map((r, i) => {
				const p = pop(t, a + 0.3 + i * 0.22, 0.3);
				return (
					<div key={r} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateX(${(1 - p) * 40}px)`, fontWeight: 700, fontSize: 44, textAlign: 'left'}}>
						<span style={{display: 'inline-flex', width: 50, height: 50, borderRadius: 25, background: T.accent, color: T.onAccent, alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900}}>✓</span>
						{r}
					</div>
				);
			})}
		</Win>
	);
};

/** Стовпчики аналітики + UTM-рядок. */
const Chart: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const bars = [0.35, 0.5, 0.42, 0.68, 0.6, 0.85, 1];
	return (
		<Win y={540} label="Аналітика" o={pop(t, a, 0.4)}>
			<div style={{display: 'flex', alignItems: 'flex-end', gap: 26, height: 420, padding: '0 10px'}}>
				{bars.map((h, i) => (
					<div key={i} style={{flex: 1, height: `${h * 100 * ramp(t, a + 0.3 + i * 0.08, a + 0.9 + i * 0.08)}%`, borderRadius: 14, background: i === bars.length - 1 ? T.accent : `${T.accent}55`}} />
				))}
			</div>
			<div style={{marginTop: 10, fontFamily: F.mono, fontSize: 30, color: T.dim, textAlign: 'left', opacity: pop(t, a + 1, 0.3)}}>
				?utm_source=<span style={{color: T.accent}}>meta</span>&utm_campaign=<span style={{color: T.accent}}>test</span>
			</div>
			<div style={{display: 'flex', gap: 16, opacity: pop(t, a + 1.3, 0.3)}}>
				<Pill style={{fontSize: 34}}>Клік → Telegram ✓</Pill>
			</div>
		</Win>
	);
};

/** Макет рекламного оголошення (нейтральний, без логотипів платформ). */
const AdMock: React.FC<{t: number; a: number}> = ({t, a}) => {
	const T = useTheme();
	const p = pop(t, a, 0.45);
	return (
		<div style={{position: 'absolute', left: X + 60, width: W - 120, top: 540, borderRadius: 36, overflow: 'hidden', background: T.panel, border: `1px solid ${T.line}`, boxShadow: '0 50px 120px #000000B0', opacity: p, transform: `scale(${0.9 + p * 0.1})`}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '24px 28px'}}>
				<div style={{width: 64, height: 64, borderRadius: 32, background: `radial-gradient(circle at 30% 30%, ${T.accent}, ${T.accentDeep})`}} />
				<div style={{textAlign: 'left'}}>
					<div style={{fontWeight: 800, fontSize: 34}}>Твій проєкт</div>
					<div style={{fontSize: 26, color: T.dim}}>Реклама</div>
				</div>
			</div>
			<div style={{height: 470, background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep} 60%, #2A3A12)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 70, color: T.onAccent, lineHeight: 1.05, padding: '0 40px'}}>Твій<br />креатив</div>
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px'}}>
				<div style={{fontWeight: 700, fontSize: 32}}>$5 / день · тест</div>
				<div style={{padding: '14px 28px', borderRadius: 14, background: T.panel2, border: `1px solid ${T.line}`, fontWeight: 800, fontSize: 30}}>Детальніше</div>
			</div>
			<div style={{position: 'absolute', right: 26, top: 26, opacity: pop(t, a + 0.9, 0.3)}}>
				<Pill style={{fontSize: 28, padding: '10px 22px'}}>перевірено людиною</Pill>
			</div>
		</div>
	);
};

/** Повноекранна Flow-вставка з підписом на всю тривалість картки. */
const ugcCard = (file: string, from: number, label: React.ReactNode, beats: number): Card => ({
	beats, sfx: 'whoosh/whoosh-fast.mp3', vol: 0.18,
	el: (t, a, z) => <UgcInsert t={t} ins={{...ugc(file, a, z - a), from, label, labelY: 1150}} />,
});

/** Фінал: оферта + Telegram, тримається ≥3 с. */
const Offer: React.FC<{t: number; a: number; sub: string}> = ({t, a, sub}) => {
	const T = useTheme();
	const slam = pop(t, a, 0.4);
	return (
		<AbsoluteFill>
			<Box y={360} o={pop(t, a + 0.1, 0.3)}>
				<span style={{fontFamily: F.mono, fontSize: 32, letterSpacing: 5, color: T.dim, textTransform: 'uppercase'}}>Перше заняття</span>
			</Box>
			<Box y={440}>
				<div style={{transform: `scale(${interpolate(slam, [0, 1], [1.6, 1], clamp)})`, opacity: slam, filter: `blur(${(1 - slam) * 12}px)`}}>
					<Big size={210} style={{color: T.accent, lineHeight: 1}}>30 хв</Big>
					<Big size={96}>безкоштовно</Big>
				</div>
			</Box>
			<Box y={900} o={pop(t, a + 0.5, 0.4)}>
				<div style={{fontWeight: 700, fontSize: 52, lineHeight: 1.3, color: T.text}}>{sub}</div>
			</Box>
			<Box y={1130} o={pop(t, a + 0.8, 0.4)}>
				<span style={{display: 'inline-block', padding: '30px 52px', borderRadius: 999, background: T.accent, color: T.onAccent, fontWeight: 900, fontSize: 52, boxShadow: `0 30px 80px ${T.accent}40`}}>Напиши мені →</span>
			</Box>
			<Box y={1300} o={pop(t, a + 1.1, 0.4)}>
				<div style={{fontFamily: F.mono, fontSize: 40, color: T.text}}>@hukvadim</div>
				<div style={{marginTop: 22, fontSize: 34, color: T.dim}}>Вадим Гук · devguide.com.ua</div>
			</Box>
		</AbsoluteFill>
	);
};

// ---------- А: українці за кордоном ----------
const CARDS_A: Card[] = [
	{beats: 6, el: (t, a) => <Poster t={t} a={a} kicker="Онлайн · українською · 1:1" size={124} sub="Навчимо його працювати">AI у тебе<br />вже <L>є.</L></Poster>},
	{beats: 5, sfx: 'pop/soft-pop.wav', vol: 0.3, off: 0.4, el: (t, a) => (
		<>
			<Head t={t} a={a}>Поки що —<br />просто <L>чат</L></Head>
			<Win y={640} label="Чат" o={pop(t, a, 0.4)}>
				<UserMsg o={pop(t, a + 0.3, 0.3)}>Зроби мені сайт</UserMsg>
				<Reply o={pop(t, a + 0.8, 0.3)} />
			</Win>
		</>
	)},
	{beats: 5, sfx: 'typing/typewriter-hit-soft.mp3', vol: 0.22, off: 0.3, el: (t, a) => <><Head t={t} a={a}>Діалог →<br /><L>чітке ТЗ</L></Head><Tz t={t} a={a + 0.2} /></>},
	{beats: 8, sfx: 'sparkle/shimmer-sparkle-sweep.mp3', vol: 0.22, off: 0.2, el: (t, a, z) => (
		<>
			<Head t={t} a={a} y={180}>Сайт <L>опубліковано</L></Head>
			<Phone t={t} a={a} z={z} srcs={['babayaga-1.png', 'babayaga-2.png', 'babayaga-3.png']} y={450} />
			<Box y={390} o={pop(t, a + 0.8, 0.3)}><span style={{fontSize: 30, color: C.dim}}>Приклад: сайт Вадима для клієнта</span></Box>
		</>
	)},
	{beats: 4, el: (t, a) => <><Head t={t} a={a}>Аналітика<br />й <L>UTM</L></Head><Chart t={t} a={a + 0.2} /></>},
	{beats: 4, sfx: 'click/lock-digital.mp3', vol: 0.22, off: 0.9, el: (t, a) => <><Head t={t} a={a} size={76}>Перша реклама —<br /><L>під наглядом</L></Head><AdMock t={t} a={a + 0.2} /></>},
	ugcCard('Man_laughs_on_sofa_with', 4.4, <>Вадим Гук<br /><span style={{fontSize: 56}}>10+ років · 300+ учнів</span></>, 6),
	{beats: 5, el: (t, a) => (
		<>
			<Head t={t} a={a}>Як <L>навчаємось</L></Head>
			{['10 годин 1:1', 'у зручний час', '1 твій проєкт'].map((s, i) => (
				<Box key={s} y={620 + i * 200} o={pop(t, a + 0.3 + i * 0.3, 0.3)}><Pill style={{fontSize: 56, padding: '26px 50px'}}>{s}</Pill></Box>
			))}
		</>
	)},
	learningCard(<>+ готовий<br /><L>шлях навчання</L></>, 6),
	{beats: 8, sfx: 'impact/impact-cine-big.mp3', vol: 0.22, el: (t, a) => <Offer t={t} a={a} sub="Розберемо, з чого почати саме тобі" />},
];

// ---------- Б: підприємці й співробітники (v2: цифри-порівняння, користь з першої секунди) ----------
/** Хук-постер: ціна підрядника (закреслюється) проти 10 годин навчання. $1000 — орієнтир ринку, не факт: підпис унизу. */
const Compare: React.FC<{t: number; a: number; strikeAt?: number; winAt?: number}> = ({t, a, strikeAt = a + 0.7, winAt = a + 0.3}) => {
	const T = useTheme();
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 84px'}}>
			<div style={{fontFamily: F.mono, fontSize: 34, letterSpacing: 5, color: T.accent, textTransform: 'uppercase', opacity: pop(t, a, 0.2)}}>Для бізнесу</div>
			<div style={{marginTop: 50, fontWeight: 700, fontSize: 48, color: T.dim, opacity: pop(t, a, 0.25)}}>Лендінг і реклама в підрядника</div>
			<div style={{opacity: pop(t, a + 0.05, 0.25)}}><Big size={124} style={{color: T.dim, whiteSpace: 'nowrap'}}><Strike p={ramp(t, strikeAt, strikeAt + 0.4)}>від $1000</Strike></Big></div>
			<div style={{marginTop: 60, fontWeight: 800, fontSize: 52, opacity: pop(t, winAt, 0.3)}}>Навчити свого співробітника</div>
			<div style={{transform: `scale(${1.3 - pop(t, winAt + 0.1, 0.3) * 0.3})`, opacity: pop(t, winAt + 0.1, 0.3)}}><Big size={200} style={{color: T.accent, lineHeight: 1}}>$300</Big></div>
			<div style={{marginTop: 50, fontSize: 30, color: T.dim, opacity: pop(t, winAt + 0.3, 0.3)}}>10 годин 1:1 · ціна підрядника — орієнтовна</div>
		</AbsoluteFill>
	);
};

const CARDS_B: Card[] = [
	{beats: 6, el: (t, a) => <Compare t={t} a={a} />},
	{beats: 6, sfx: 'pop/soft-pop.wav', vol: 0.25, off: 0.4, el: (t, a) => (
		<>
			<Head t={t} a={a} size={76}>10 годин — і він<br /><L>робить сам:</L></Head>
			{['Сайт', 'Аналітику', 'Рекламу'].map((s, i) => (
				<Box key={s} y={660 + i * 220} o={pop(t, a + 0.35 + i * 0.3, 0.3)}><Pill style={{fontSize: 64, padding: '28px 60px'}}>✓ {s}</Pill></Box>
			))}
		</>
	)},
	learningCard(<>Персонально +<br /><L>готова програма</L></>, 8),
	ugcCard('Man_nodding_by_window', 5.0, <>Вадим Гук<br /><span style={{fontSize: 46, whiteSpace: "nowrap"}}>10+ років · 5.0 на Superprof</span></>, 6),
	{beats: 9, sfx: 'impact/impact-cine-big.mp3', vol: 0.22, el: (t, a) => <Offer t={t} a={a} sub="Розберемо задачу вашого бізнесу" />},
];

export const ADS_A = beatFrames(TRACK_A, CARDS_A);
export const ADS_B = beatFrames(TRACK_B, CARDS_B);
export const AdsA: React.FC = () => <BeatVideo theme="brand" track={TRACK_A} cards={CARDS_A} />;
export const AdsB: React.FC = () => <BeatVideo theme="brand" track={TRACK_B} cards={CARDS_B} />;

// ---------- Версії з голосом (А: клон голосу Вадима, 2026-10-13; Б: Yevhen, 2026-10-12): ті самі картки, межі — за словами озвучки ----------
type Word = {w: string; s: number; e: number};
const TAIL = 3; // фінальна картка тримається після голосу
const voiceFrames = (words: Word[]) => S(words[words.length - 1].e + TAIL);

/** Картки BeatVideo, але межі = секунди слів (starts[i] — початок картки i); субтитри лише на картках caps. cover — секунда для кадру 0. */
const VoiceCards: React.FC<{cards: Card[]; words: Word[]; dir: string; track: string; starts: number[]; caps: number[]; cover: number}> = ({cards, words, dir, track, starts, caps, cover}) => {
	const frame = useCurrentFrame();
	const t = frame === 0 ? cover : frame / 30;
	const end = words[words.length - 1].e;
	const total = end + TAIL;
	const spans = cards.map((c, i) => ({c, i, a: Math.max(0, starts[i] - 0.15), z: (starts[i + 1] ?? total + 0.15) - 0.15}));
	const chunks = React.useMemo(() => chunkWords(words, 30), [words]);
	const cur = spans.find(({a, z}) => t >= a && t < z);
	return (
		<ThemeProvider theme="brand">
			<Stage glow={[760, 420]} grid>
				<PatternBg t={t} />
				<Audio src={staticFile(`${dir}/voice.mp3`)} />
				<Audio src={staticFile(M(track))} trimBefore={S(beat(track).offset)} volume={(f) => interpolate(f, [0, 15, S(end), S(end) + 10, S(total - 1), S(total)], [0, 0.1, 0.1, 0.3, 0.3, 0], clamp)} />
				{spans.map(({c, a}, i) => (c.sfx ? <Sfx key={i} at={S(a + (c.off ?? 0))} src={c.sfx} vol={(c.vol ?? 0.22) * 0.8} dur={45} /> : null))}
				{cur ? <AbsoluteFill>{cur.c.el(t, cur.a, cur.z)}</AbsoluteFill> : null}
				{frame > 0 && cur && caps.includes(cur.i) ? <Captions t={t} chunks={chunks} size={48} /> : null}
			</Stage>
		</ThemeProvider>
	);
};

const aw = (w: string, after = 0) => at(WORDS_A, w, after);
export const ADS_A_VOICE = voiceFrames(WORDS_A);
export const AdsAVoice: React.FC = () => (
	<VoiceCards cards={CARDS_A.filter((_, i) => i !== 2)} words={WORDS_A} dir="ideas/ads-a" track={TRACK_A} cover={1.2} caps={[1, 2, 3, 4, 5, 6]}
		starts={[0, aw('Поки'), aw('кілька'), aw('підключити'), aw('запустити'), aw('Я', aw('запустити')), aw('Десять'), aw('плюс'), aw('Перші')]} />
);

// Б: «від $1000» закреслюється після «доларів», «$300» з'являється на «Навчити»
const bw = (w: string, after = 0) => at(WORDS_B, w, after);
const CARDS_B_VOICE: Card[] = [{...CARDS_B[0], el: (t, a) => <Compare t={t} a={a} strikeAt={bw('Навчити') - 0.6} winAt={bw('Навчити')} />}, ...CARDS_B.slice(1)];
export const ADS_B_VOICE = voiceFrames(WORDS_B);
export const AdsBVoice: React.FC = () => (
	<VoiceCards cards={CARDS_B_VOICE} words={WORDS_B} dir="ideas/ads-b" track={TRACK_B} cover={6.5} caps={[1, 3]}
		starts={[0, bw('За'), bw('Персональні'), bw('Я'), bw('Перші')]} />
);

// ---------- Стрічка 4:5 (1080×1350): той самий ролик ×0.85 по центру; обрізається лише поза safe area (y<166, y>1754 оригіналу) ----------
const K45 = 0.85;
const feed45 = (Video: React.FC): React.FC => () => (
	<AbsoluteFill style={{background: C.bg}}>
		<div style={{position: 'absolute', left: (1080 - 1080 * K45) / 2, top: (1350 - 1920 * K45) / 2, width: 1080, height: 1920, transform: `scale(${K45})`, transformOrigin: 'top left'}}>
			<Video />
		</div>
	</AbsoluteFill>
);
export const AdsAVoice45 = feed45(AdsAVoice);
export const AdsBVoice45 = feed45(AdsBVoice);

// ---------- Банер (кампанія А): 1080×1350 стрічка, 1080×1920 Stories. Кирилиця рендериться шрифтом бренду, без GPT ----------
export const AdsBanner: React.FC<{h?: number}> = ({h = 1350}) => {
	const story = h === 1920;
	const top = story ? 300 : 110; // Stories: верхні ~270 px перекриває інтерфейс
	return (
		<ThemeProvider theme="brand">
			<Stage glow={[260, top + 200]} grid>
				<div style={{position: 'absolute', left: 84, right: 84, top}}>
					<div style={{fontFamily: F.mono, fontSize: 32, letterSpacing: 5, color: C.lime, textTransform: 'uppercase'}}>Онлайн · українською · 1:1</div>
					<div style={{marginTop: 30}}><Big size={story ? 96 : 84}>AI у тебе<br />вже є.<br /><L>Навчимо його<br />працювати.</L></Big></div>
				</div>
				{/* дві сторінки віялом: шлях навчання DevGuide попереду, сайт клієнта позаду */}
				<div style={{position: 'absolute', left: 0, top: story ? 900 : 600, width: 1080, height: 1080, transform: `scale(${story ? 0.62 : 0.52}) translate(${story ? 520 : 640}px, 0) rotate(8deg)`, transformOrigin: 'top center', opacity: 0.85}}>
					<Phone t={10} a={0} z={1} srcs={['babayaga-1.png']} y={0} />
				</div>
				<div style={{position: 'absolute', left: 0, top: story ? 850 : 560, width: 1080, height: 1080, transform: `scale(${story ? 0.66 : 0.56}) translate(${story ? 180 : 300}px, 0) rotate(-6deg)`, transformOrigin: 'top center'}}>
					<Phone t={10} a={0} z={1} srcs={['learning.png']} y={0} />
				</div>
				<div style={{position: 'absolute', left: 84, right: 84, bottom: story ? 400 : 90, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22}}>
					<span style={{padding: '24px 40px', borderRadius: 999, background: C.lime, color: C.bg, fontWeight: 900, fontSize: 46, boxShadow: '0 30px 80px #C3FF5540'}}>Перші 30 хв — безкоштовно</span>
					<span style={{fontSize: 32, color: C.dim, background: `${C.bg}CC`, padding: '6px 12px', borderRadius: 10}}>Вадим Гук · 10+ років у веброзробці · пиши в Direct</span>
				</div>
			</Stage>
		</ThemeProvider>
	);
};
