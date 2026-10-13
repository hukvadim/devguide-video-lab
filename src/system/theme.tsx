import React from 'react';
import brand from '../../data/brand.json';

import {makePalettes, readable, type Theme} from './palettes';
export type {Theme};

// Палітри й перевірка контрасту — src/system/palettes.ts. brand = рівно ті кольори, що були в kit.tsx (C), тож старі ролики не змінюються.
export const BRAND: Theme = {
	bg: brand.palette.background, text: brand.palette.text, dim: '#8A97A3', line: '#FFFFFF1F',
	accent: brand.palette.accent, accentDeep: '#7FB52A', onAccent: brand.palette.background, red: '#FF6B5E',
	panel: '#0D1318F2', panel2: '#1B2530', card: '#10161C', glow: '#C3FF55', glow2: '#8EDFFF', grid: '#ffffff07',
};
export const PALETTES = makePalettes(BRAND);
/** Палітри, що проходять перевірку контрасту: з них обирається вигляд рендеру за seed (по колу, без повтору підряд). */
export const LIVELY = Object.keys(PALETTES).filter((n) => readable(PALETTES[n]));
export const themeFor = (seed: number) => LIVELY[((seed % LIVELY.length) + LIVELY.length) % LIVELY.length];

const Ctx = React.createContext<Theme>(BRAND);
export const useTheme = () => React.useContext(Ctx);
/** seed (якщо є) — вигляд рендеру: без theme обирає палітру з LIVELY, а Show/фон беруть з нього варіанти руху. */
export const ThemeProvider: React.FC<{theme?: string | Theme; seed?: number; children: React.ReactNode}> = ({theme, seed, children}) => {
	const name = theme ?? (seed != null ? themeFor(seed) : 'brand');
	const base = typeof name === 'string' ? PALETTES[name] ?? BRAND : name;
	return <Ctx.Provider value={seed == null ? base : {...base, seed}}>{children}</Ctx.Provider>;
};
