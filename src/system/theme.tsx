import React from 'react';
import brand from '../../data/brand.json';

// Палітри відео. brand = рівно ті кольори, що були в kit.tsx (C), тож старі ролики не змінюються.
// drop* — «Color Drop» з дошки Pinterest Вадима (скріншот 2026-10-11), neon — «Neon Pulse» звідти ж. Див. docs/FORMAT_LAB.md.
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
};

export const BRAND: Theme = {
	bg: brand.palette.background, text: brand.palette.text, dim: '#8A97A3', line: '#FFFFFF1F',
	accent: brand.palette.accent, accentDeep: '#7FB52A', onAccent: brand.palette.background, red: '#FF6B5E',
	panel: '#0D1318F2', panel2: '#1B2530', card: '#10161C', glow: '#C3FF55', glow2: '#8EDFFF', grid: '#ffffff07',
};

const dark = (o: Partial<Theme>): Theme => ({...BRAND, ...o});
export const PALETTES: Record<string, Theme> = {
	brand: BRAND,
	// #07: вишня на світло-лаймовому — світла тема, текст темний
	drop07: {bg: '#E7F9A9', text: '#3D0814', dim: '#3D0814A6', line: '#3D081433', accent: '#3D0814', accentDeep: '#24040B', onAccent: '#E7F9A9', red: '#C2183B',
		panel: '#F6FDDCF2', panel2: '#FFFFFFB3', card: '#F2FBCF', glow: '#FFFFFF', glow2: '#3D0814', grid: '#3D08140D', vignette: '#3D08141F'},
	// #12: білий на бірюзовому; акцент — білий, текст — темна бірюза
	drop12: {bg: '#3FBFA2', text: '#0B2F27', dim: '#0B2F27B3', line: '#0B2F2733', accent: '#F8F8F9', accentDeep: '#D6F2EA', onAccent: '#0B2F27', red: '#B3123A',
		panel: '#2E9C83F2', panel2: '#5ACDB2', card: '#37AE93', glow: '#F8F8F9', glow2: '#0B2F27', grid: '#0B2F270F', vignette: '#0B2F2740', echo: true, pattern: 'DEVGUIDE'},
	// #01: бірюза на електрик-фіолетовому
	drop01: dark({bg: '#6E10F7', dim: '#D2C2FF', line: '#FFFFFF2E', accent: '#39D6CE', accentDeep: '#1E9A93', onAccent: '#2A0566', red: '#FF6B8A',
		panel: '#4E0AB8F2', panel2: '#5A0CD6', card: '#600DE0', glow: '#39D6CE', glow2: '#FFFFFF', grid: '#FFFFFF0D'}),
	// #14 (кораловий на синьому) прибрано назавжди: контраст ≈1.7:1, текст не читається (Вадим, 2026-10-11). Акцентний текст — від 3:1 до фону.
	// #02: кислотний лайм на майже чорному
	drop02: dark({bg: '#11121C', dim: '#9A9CB0', accent: '#D9FF3A', accentDeep: '#A3C21F', onAccent: '#11121C', panel: '#171826F2', panel2: '#23253A', card: '#1A1B28', glow: '#D9FF3A', glow2: '#9A6BFF'}),
	// Neon Pulse: рожево-блакитний градієнт
	neon: dark({bg: '#150722', bgImage: 'radial-gradient(1100px 1100px at 540px 820px, #FF2E7E66 0%, #7B3CFF33 45%, #00C2FF22 70%, transparent 85%)', dim: '#E3C8F5', line: '#FFFFFF33',
		accent: '#00D4FF', accentDeep: '#008DB3', onAccent: '#150722', red: '#FF2E7E', panel: '#1E0B33E6', panel2: '#2C1150', card: '#24103D', glow: '#FF2E7E', glow2: '#00D4FF', grid: '#FFFFFF0A'}),
};

const Ctx = React.createContext<Theme>(BRAND);
export const useTheme = () => React.useContext(Ctx);
export const ThemeProvider: React.FC<{theme?: string | Theme; children: React.ReactNode}> = ({theme = 'brand', children}) => (
	<Ctx.Provider value={typeof theme === 'string' ? PALETTES[theme] ?? BRAND : theme}>{children}</Ctx.Provider>
);
