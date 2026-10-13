// Палітри відео без React: тут же перевірка контрасту, щоб її можна було запустити просто Node-ом.
//   node scripts/palettes.mjs      → таблиця контрасту, падає, якщо нова палітра нечитабельна
// Правила (CLAUDE.md, docs/FORMAT_LAB.md): текст ≥ 4.5:1 до фону, акцентний текст ≥ 3:1, текст на акцентній заливці ≥ 4.5:1.
// Кораловий на синьому (Color Drop #14) заборонено назавжди.
export type Theme = {
	bg: string; // суцільний фон (і база для напівпрозорих плашок)
	bgImage?: string; // градієнт поверх фону (neon)
	text: string;
	dim: string;
	line: string;
	accent: string; // акцент: виділення, кнопки, рамки
	accentDeep: string;
	onAccent: string; // текст на акцентній заливці
	red: string;
	panel: string; // вікна чату/терміналу
	panel2: string; // бульбашки, поля
	card: string; // картки, неактивні кроки
	glow: string; // світло на фоні (hex без альфи)
	glow2: string;
	grid: string;
	vignette?: string; // край кадру (за замовчуванням #000000AA)
	echo?: boolean; // постерний вигляд: контурне «відлуння» великих заголовків + фон з повторених літер
	pattern?: string;
	seed?: number; // вигляд рендеру: палітра й варіанти руху (render-timed.mjs → props.seed)
};

const lum = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
	const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
};
// + акцент має відрізнятися від тексту за кольором (не яскравістю), інакше виділене слово не видно (drop07: акцент = текст)
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const apart = (a: string, b: string) => Math.hypot(...rgb(a).map((x, i) => x - rgb(b)[i])) > 80;
export const readable = (t: Theme) => contrast(t.text, t.bg) >= 4.5 && contrast(t.accent, t.bg) >= 3 && contrast(t.onAccent, t.accent) >= 4.5 && apart(t.accent, t.text);

/** Усі палітри; base — бренд з data/brand.json (його збирає theme.tsx). */
export const makePalettes = (base: Theme): Record<string, Theme> => {
	const dark = (o: Partial<Theme>): Theme => ({...base, ...o});
	return {
		brand: base,
		// drop* — «Color Drop» з дошки Pinterest Вадима (2026-10-11), neon — «Neon Pulse» звідти ж. Див. docs/FORMAT_LAB.md.
		// #07: вишня на світло-лаймовому — світла тема, текст темний
		drop07: {bg: '#E7F9A9', text: '#3D0814', dim: '#3D0814A6', line: '#3D081433', accent: '#3D0814', accentDeep: '#24040B', onAccent: '#E7F9A9', red: '#C2183B',
			panel: '#F6FDDCF2', panel2: '#FFFFFFB3', card: '#F2FBCF', glow: '#FFFFFF', glow2: '#3D0814', grid: '#3D08140D', vignette: '#3D08141F'},
		// #12: білий на бірюзовому; акцент — білий, текст — темна бірюза
		drop12: {bg: '#3FBFA2', text: '#0B2F27', dim: '#0B2F27B3', line: '#0B2F2733', accent: '#F8F8F9', accentDeep: '#D6F2EA', onAccent: '#0B2F27', red: '#B3123A',
			panel: '#2E9C83F2', panel2: '#5ACDB2', card: '#37AE93', glow: '#F8F8F9', glow2: '#0B2F27', grid: '#0B2F270F', vignette: '#0B2F2740', echo: true, pattern: 'DEVGUIDE'},
		// #01: бірюза на електрик-фіолетовому
		drop01: dark({bg: '#6E10F7', dim: '#D2C2FF', line: '#FFFFFF2E', accent: '#39D6CE', accentDeep: '#1E9A93', onAccent: '#2A0566', red: '#FF6B8A',
			panel: '#4E0AB8F2', panel2: '#5A0CD6', card: '#600DE0', glow: '#39D6CE', glow2: '#FFFFFF', grid: '#FFFFFF0D'}),
		// #02: кислотний лайм на майже чорному
		drop02: dark({bg: '#11121C', dim: '#9A9CB0', accent: '#D9FF3A', accentDeep: '#A3C21F', onAccent: '#11121C', panel: '#171826F2', panel2: '#23253A', card: '#1A1B28', glow: '#D9FF3A', glow2: '#9A6BFF'}),
		// Neon Pulse: рожево-блакитний градієнт
		neon: dark({bg: '#150722', bgImage: 'radial-gradient(1100px 1100px at 540px 820px, #FF2E7E66 0%, #7B3CFF33 45%, #00C2FF22 70%, transparent 85%)', dim: '#E3C8F5', line: '#FFFFFF33',
			accent: '#00D4FF', accentDeep: '#008DB3', onAccent: '#150722', red: '#FF2E7E', panel: '#1E0B33E6', panel2: '#2C1150', card: '#24103D', glow: '#FF2E7E', glow2: '#00D4FF', grid: '#FFFFFF0A'}),
		// 2026-10-13, для шляху «Сайти» (кожен рендер — інша палітра)
		ocean: dark({bg: '#0B1B2B', text: '#F2F6FA', dim: '#9FB3C8', accent: '#4FD1C5', accentDeep: '#2C9C92', onAccent: '#0B1B2B', panel: '#10263BF2', panel2: '#1A3550', card: '#112A40', glow: '#4FD1C5', glow2: '#5B8CFF', grid: '#FFFFFF08'}),
		amber: dark({bg: '#1A1033', text: '#F5F0FF', dim: '#B9AEDB', accent: '#F5B83D', accentDeep: '#C48A1C', onAccent: '#1A1033', panel: '#22154AF2', panel2: '#2E1F5E', card: '#21143F', glow: '#F5B83D', glow2: '#9A6BFF', grid: '#FFFFFF08'}),
		pink: dark({bg: '#0E0E14', text: '#FFFFFF', dim: '#A3A3B5', accent: '#FF5CA8', accentDeep: '#C9327B', onAccent: '#0E0E14', panel: '#16161FF2', panel2: '#22222E', card: '#181822', glow: '#FF5CA8', glow2: '#7B61FF', grid: '#FFFFFF07'}),
		paper: {bg: '#F7F7F2', text: '#111111', dim: '#111111A6', line: '#1111112E', accent: '#1D4ED8', accentDeep: '#163CA8', onAccent: '#F7F7F2', red: '#C2183B',
			panel: '#FFFFFFF2', panel2: '#ECECE4', card: '#EFEFE8', glow: '#FFFFFF', glow2: '#1D4ED8', grid: '#1111110A', vignette: '#1111111A'},
		mint: {bg: '#E8F7EF', text: '#0F2A1D', dim: '#0F2A1DA6', line: '#0F2A1D2E', accent: '#0F766E', accentDeep: '#0B5A54', onAccent: '#E8F7EF', red: '#B3123A',
			panel: '#F7FDFAF2', panel2: '#FFFFFFB3', card: '#DDF2E7', glow: '#FFFFFF', glow2: '#0F766E', grid: '#0F2A1D0A', vignette: '#0F2A1D1A'},
		sunset: {bg: '#FFF4E6', text: '#2A1A0F', dim: '#2A1A0FA6', line: '#2A1A0F2E', accent: '#C2410C', accentDeep: '#9A3409', onAccent: '#FFF4E6', red: '#B3123A',
			panel: '#FFFBF5F2', panel2: '#FFFFFFB3', card: '#FBEBD7', glow: '#FFFFFF', glow2: '#C2410C', grid: '#2A1A0F0A', vignette: '#2A1A0F1A'},
	};
};

