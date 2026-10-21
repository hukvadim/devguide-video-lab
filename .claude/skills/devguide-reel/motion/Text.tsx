import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { measureText } from '@remotion/layout-utils';
import { C, F, clamp, fontsReady, ramp, splitAccent } from './theme';
import { CapWord, Measure, Page, fitSize, paginate } from './layout';

// Увесь текст ролика ОДНИМ прозорим шаром (простір 1080×1920, масштаб w/1080):
// субтитри сторінками з підсвіченим словом, титул і плашки «підводка *акцент*», удари-рамки.
// Розміри не фіксовані: усе міряється шрифтом і вписується в ширину/кількість рядків.
export type TextItem = { t: number; dur: number; text: string; y: number };
export type TextProps = {
  w: number; h: number; dur: number; accent?: string;
  words: CapWord[];
  capY: number;              // низ блоку субтитрів (голова) або центр (спліт), px у 1080×1920
  capAnchor: 'bottom' | 'center';
  capStyle?: 'stroke' | 'soft'; // soft: white + soft layered shadow, no outline; only the active word is accent
  title?: TextItem | null; callouts: TextItem[]; hits: number[];
  progress?: number;         // y смужки прогресу зверху (px у 1080×1920); без поля — без смужки
};

const MAX_W = 912; // 1080 − 2×84 safe-поля
const CAP_SIZES = [86, 82, 78, 74, 70, 66];

const measureWith = (fontFamily: string, fontWeight: string): Measure => (text, size) =>
  measureText({ text, fontFamily, fontSize: size, fontWeight, validateFontIsLoaded: false }).width;

const strokeShadow = (size: number) => ({
  WebkitTextStroke: `${Math.round(size * 0.12)}px rgba(8,11,14,.88)`,
  paintOrder: 'stroke fill' as const,
  textShadow: '0 8px 26px rgba(0,0,0,.55)',
});

// ---------- субтитри ----------
// CapCut-style clean captions: no stroke, depth from stacked shadows; the active word glows in the accent
const softShadow = (size: number, glow?: string) => ({
  textShadow: [`0 2px 3px rgba(0,0,0,.55)`, `0 6px 18px rgba(0,0,0,.45)`, `0 0 ${Math.round(size * 0.5)}px rgba(0,0,0,.35)`,
    glow ? `0 0 ${Math.round(size * 0.35)}px ${glow}66` : ''].filter(Boolean).join(', '),
});

const Captions: React.FC<{ pages: Page[]; y: number; anchor: 'bottom' | 'center'; accent: string; soft?: boolean }> = ({ pages, y, anchor, accent, soft }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const page = pages.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const lh = page.size * 1.12;
  const height = page.lines.length * lh;
  const top = anchor === 'bottom' ? y - height : y - height / 2;
  const activeIdx = page.words.findIndex((w, i) => t >= w.s && t < (page.words[i + 1]?.s ?? page.end));
  return <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {page.lines.map((line, li) => <div key={li} style={{ display: 'flex', gap: `0 ${page.size * 0.26}px`, height: lh, alignItems: 'flex-end' }}>
      {line.map((wi) => {
        const w = page.words[wi];
        const sf = w.s * fps;
        const p = spring({ frame: f - sf, fps, config: { damping: 15, stiffness: 260, mass: 0.6 } });
        const shown = f >= sf;
        const active = wi === activeIdx;
        const color = active || (!soft && w.em) ? accent : C.text;
        return <span key={wi} style={{
          fontFamily: F.body, fontWeight: 800, fontSize: page.size, lineHeight: 1, letterSpacing: '-0.01em', color,
          opacity: shown ? 1 : 0,
          // поп від базової лінії (не від центру) — без «тремтіння» гліфів
          transform: `translateY(${shown ? (1 - p) * 14 : 0}px) scale(${shown ? (w.em ? 1.08 : 1) * (0.84 + 0.16 * p) : 1})`,
          transformOrigin: '50% 90%', display: 'inline-block', ...(soft ? softShadow(page.size, active ? accent : undefined) : strokeShadow(page.size)),
        }}>{w.w}</span>;
      })}
    </div>)}
  </div>;
};

// ---------- титул і плашки ----------
const Callout: React.FC<{ item: TextItem; title: boolean; accent: string }> = ({ item, title, accent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { top, big } = splitAccent(item.text);
  const bigWords = big.split(/\s+/);
  const topWords = top ? top.split(/\s+/) : [];
  const fitBig = useMemo(() => fitSize(bigWords, (title ? [132, 120, 110, 100] : [116, 106, 96]).concat([88, 80, 72, 64]),
    MAX_W, 2, measureWith(F.display, '900')), [big, title]);
  const fitTop = useMemo(() => topWords.length ? fitSize(topWords, [56, 52, 48, 44], MAX_W, 2, measureWith(F.body, '800')) : null, [top]);
  const start = Math.round(item.t * fps), end = Math.round((item.t + item.dur) * fps);
  if (f < start - 1 || f > end) return null;
  const lf = f - start;
  const out = ramp(f, end - 7, end);
  const word = (i: number) => spring({ frame: lf - i * 2, fps, config: { damping: 14, stiffness: 190, mass: 0.7 } });
  const bigColor = title ? C.text : accent;
  const blockH = (fitTop ? fitTop.lines.length * fitTop.size * 1.15 + 14 : 0) + fitBig.lines.length * fitBig.size * 1.05 + (title ? 34 : 0);
  let k = 0;
  const renderLines = (fit: { size: number; lines: number[][] }, words: string[], style: React.CSSProperties, lh: number) =>
    fit.lines.map((line, li) => <div key={li} style={{ display: 'flex', justifyContent: 'center', gap: `0 ${fit.size * 0.28}px`, height: fit.size * lh, alignItems: 'flex-end' }}>
      {line.map((wi) => {
        const p = word(k++);
        return <span key={wi} style={{ display: 'inline-block', fontSize: fit.size, lineHeight: 1, opacity: Math.min(1, p * 1.5),
          transform: `translateY(${(1 - p) * 46}px) scale(${0.9 + 0.1 * p})`, transformOrigin: '50% 90%', ...style }}>{words[wi]}</span>;
      })}
    </div>);
  return <div style={{ position: 'absolute', left: 0, right: 0, top: item.y - blockH / 2, opacity: 1 - out, transform: `translateY(${-out * 24}px)` }}>
    {/* без темної підкладки (Вадим: «віньєтка» виглядає погано) — читабельність дає обводка тексту */}
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {fitTop && renderLines(fitTop, topWords, { fontFamily: F.body, fontWeight: 800, color: C.text, ...strokeShadow(fitTop.size) }, 1.15)}
      {fitTop && <div style={{ height: 14 }} />}
      {renderLines(fitBig, bigWords, { fontFamily: F.display, fontWeight: 900, letterSpacing: '-0.02em', color: bigColor, ...strokeShadow(fitBig.size) }, 1.05)}
      {title && <div style={{ marginTop: 20, height: 12, borderRadius: 6, background: accent, width: 280 * ramp(lf, 8, 22), boxShadow: `0 0 24px ${accent}88` }} />}
    </div>
  </div>;
};

// ---------- удари ----------
const Hit: React.FC<{ t: number; accent: string }> = ({ t, accent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = Math.round(t * fps);
  const p = interpolate(f, [s, s + 3, s + 26], [0, 1, 0], clamp);
  if (p <= 0) return null;
  return <AbsoluteFill style={{ boxShadow: `inset 0 0 0 ${p * 16}px ${accent}, inset 0 0 ${p * 160}px ${accent}88` }} />;
};

// ---------- прогрес ----------
// тонка смужка в ширину safe-поля: глядач бачить, скільки лишилось
const Progress: React.FC<{ y: number; accent: string }> = ({ y, accent }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = f / Math.max(1, durationInFrames - 1);
  return <div style={{ position: 'absolute', left: 84, width: MAX_W, top: y, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.22)', boxShadow: '0 2px 10px rgba(0,0,0,.35)' }}>
    <div style={{ width: `${p * 100}%`, height: '100%', borderRadius: 4, background: accent, boxShadow: `0 0 12px ${accent}88` }} />
  </div>;
};

// виміри робимо лише після завантаження шрифтів, інакше ширини будуть від запасного шрифту
const useFontsLoaded = () => {
  const [state] = useState(() => ({ handle: delayRender('measure after fonts') }));
  const [ready, setReady] = useState(false);
  useEffect(() => { fontsReady.then(() => setReady(true)); }, []);
  useEffect(() => { if (ready) continueRender(state.handle); }, [ready, state]);
  return ready;
};

export const Text: React.FC<TextProps> = ({ w, words, capY, capAnchor, capStyle, title, callouts, hits, progress, accent = C.lime }) => {
  const ready = useFontsLoaded();
  const pages = useMemo(() => ready ? paginate(words, { maxW: MAX_W, maxLines: 2, sizes: CAP_SIZES }, measureWith(F.body, '800')) : [], [words, ready]);
  if (!ready) return null;
  return <AbsoluteFill>
    <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${w / 1080})`, transformOrigin: '0 0' }}>
      <Captions pages={pages} y={capY} anchor={capAnchor} accent={accent} soft={capStyle === 'soft'} />
      {title && <Callout item={title} title accent={accent} />}
      {callouts.map((c, i) => <Callout key={i} item={c} title={false} accent={accent} />)}
      {hits.map((t, i) => <Hit key={i} t={t} accent={accent} />)}
      {progress != null && <Progress y={progress} accent={accent} />}
    </div>
  </AbsoluteFill>;
};
