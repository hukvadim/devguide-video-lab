import { continueRender, delayRender, Easing, interpolate } from 'remotion';
import unbCyr900 from '../fonts/unbounded-cyrillic-900-normal.woff2';
import unbLat900 from '../fonts/unbounded-latin-900-normal.woff2';
import unbCyr700 from '../fonts/unbounded-cyrillic-700-normal.woff2';
import unbLat700 from '../fonts/unbounded-latin-700-normal.woff2';
import intCyr800 from '../fonts/inter-cyrillic-800-normal.woff2';
import intLat800 from '../fonts/inter-latin-800-normal.woff2';
import intCyr600 from '../fonts/inter-cyrillic-600-normal.woff2';
import intLat600 from '../fonts/inter-latin-600-normal.woff2';
import monoLat from '../fonts/jetbrains-mono-latin-500-normal.woff2';

// DevGuide: графіт + лайм. Шрифти локальні (OFL), без мережі під час рендеру.
export const C = { bg: '#080B0E', panel: '#10161C', text: '#F5F7F2', dim: '#AEB8C1', lime: '#C3FF55', line: '#FFFFFF1F' };
export const F = { display: 'DG Unbounded, Arial, sans-serif', body: 'DG Inter, Arial, sans-serif', mono: 'DG Mono, Consolas, monospace' };

const faces: [string, string, string][] = [
  ['DG Unbounded', unbCyr900, '900'], ['DG Unbounded', unbLat900, '900'],
  ['DG Unbounded', unbCyr700, '700'], ['DG Unbounded', unbLat700, '700'],
  ['DG Inter', intCyr800, '800'], ['DG Inter', intLat800, '800'],
  ['DG Inter', intCyr600, '600'], ['DG Inter', intLat600, '600'],
  ['DG Mono', monoLat, '500'],
];
const handle = delayRender('DevGuide fonts');
export const fontsReady = Promise.all(faces.map(([family, url, weight]) => new FontFace(family, `url(${url})`, { weight }).load()))
  .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(handle); });

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const ramp = (f: number, a: number, b: number, from = 0, to = 1, e = easeOut) => interpolate(f, [a, b], [from, to], { ...clamp, easing: e });

// "підводка *акцент* хвіст" → { top, big }; без зірочок — усе акцент
export function splitAccent(text: string) {
  const m = text.match(/^(.*?)\*([^*]+)\*(.*)$/);
  return m ? { top: (m[1] + ' ' + m[3]).replace(/\s+/g, ' ').trim(), big: m[2].trim() } : { top: '', big: text.trim() };
}
