import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
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
  cap?: string;              // коди субтитрів з docs/ELEMENTS.md: 'S02+T04+T27+T36+T47'
  title?: TextItem | null; callouts: TextItem[]; hits: number[];
  progress?: number;         // y смужки прогресу зверху (px у 1080×1920); без поля — без смужки
  capLow?: [number, number][]; // відрізки (с), де голова на весь кадр: субтитри внизу, як у HEAD_STYLE
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

// Caption codes (docs/ELEMENTS.md): S = look (stackable), T = enter / during / exit / position.
// cap: 'S02+T04+T27+T36+T47'. Missing axis = the old default (S01 or S02 by capStyle, T01 word pop, no exit, capY).
type Ctx = { q: number; p: number; li: number; wi: number; size: number; lf: number };
type Css = React.CSSProperties;
const sp = (frame: number, damping = 14, stiffness = 180) => spring({ frame, fps: 30, config: { damping, stiffness, mass: 0.7 } });
// per-word style while the page enters; q = line progress 0→1, p = word pop from its spoken time
const ENTER: Record<string, (c: Ctx) => Css> = {
  T01: ({ p, lf }) => ({ opacity: lf >= 0 ? 1 : 0, transform: `translateY(${(1 - p) * 14}px) scale(${0.84 + 0.16 * p})` }),
  T02: ({ q }) => ({ opacity: q, transform: `translateY(${(1 - q) * 24}px)` }),
  T03: ({ q }) => ({ opacity: q }),
  T04: ({ q, lf }) => ({ opacity: Math.min(1, q * 2), transform: `scale(${0.92 + 0.08 * sp(lf, 9, 200)})` }),
  T05: ({ q }) => ({ opacity: q, filter: `blur(${(1 - q) * 12}px)` }),
  T06: ({ q, size }) => ({ transform: `translateY(${(1 - q) * size * 1.15}px)` }),
  T07: ({ q, size }) => ({ transform: `translateY(${-(1 - q) * size * 1.15}px)` }),
  T08: ({ q, li }) => ({ opacity: q, transform: `translateX(${(1 - q) * (li % 2 ? 220 : -220)}px)` }),
  T11: ({ q }) => ({ opacity: q, letterSpacing: `${(1 - q) * 0.3}em` }),
  T12: ({ q }) => ({ opacity: Math.min(1, q * 2), transform: `perspective(600px) rotateX(${(1 - q) * 90}deg)` }),
  T13: () => ({}), T14: () => ({}), T16: () => ({}),
  // T09/T10/T22 change the word's letters (see wordText), T20/T21 draw on the line
  T09: () => ({}), T10: ({ lf }) => ({ opacity: lf >= 0 ? 1 : 0 }), T22: ({ lf }) => ({ opacity: lf >= 0 ? 1 : 0 }),
  T19: ({ lf, wi }) => lf < 0 ? { opacity: 0 } : lf < 4 ? { transform: `translateX(${(random(`t19${wi}${lf}`) - 0.5) * 40}px)`, textShadow: '-5px 0 rgba(0,255,255,.8), 5px 0 rgba(255,0,200,.8)' } : {},
  T20: ({ lf }) => ({ opacity: ramp(lf, 6, 12) }),
  T21: ({ lf }) => ({ opacity: lf >= 0 ? 1 : 0 }),
  T23: ({ q, wi }) => ({ opacity: q, transform: `translateX(${(1 - q) * (wi % 2 ? 200 : -200)}px)` }),
  T45: ({ p, lf }) => ({ opacity: lf >= 0 ? 1 : 0, transform: `translateY(${(1 - p) * 14}px) scale(${0.84 + 0.16 * p})` }),
  // slogans (3–6 words), laid out by <Slogan>
  T40: () => ({}), T41: () => ({}), T42: () => ({}), T43: () => ({}), T44: () => ({}),
  T17: ({ lf }) => ({ transform: `scaleY(${sp(lf, 7, 220)})`, opacity: lf >= 0 ? 1 : 0 }),
  T18: ({ q, lf }) => ({ opacity: q, transform: `translateY(${-(1 - sp(lf, 7, 160)) * 70}px)` }),
  T24: ({ q }) => ({ opacity: q, transform: `scale(${1.4 - 0.4 * q})` }),
  T25: ({ q, lf }) => ({ opacity: q, transform: `rotate(${2 * Math.sin(lf / 3) * Math.max(0, 1 - lf / 18)}deg)` }),
};
// line wrapper clips: the masked enters
const CLIP: Record<string, (q: number) => string> = {
  T06: () => 'inset(-40% -6% -6% -6%)',
  T07: () => 'inset(-6% -6% -40% -6%)',
  T13: (q) => `inset(-40% ${(1 - q) * 106 - 3}% -40% -3%)`,
  T16: (q) => `inset(-40% ${(1 - q) * 106 - 3}% -40% -3%)`,
  T14: (q) => `inset(-40% ${(1 - q) * 52 - 3}% -40% ${(1 - q) * 52 - 3}%)`,
};
const EXIT: Record<string, (o: number) => Css> = {
  T36: (o) => ({ opacity: 1 - o }),
  T37: (o) => ({ opacity: 1 - o, transform: `translateY(${-o * 40}px)` }),
  T38: (o) => ({ transform: `scaleY(${1 - o})` }),
  T39: (o) => ({ opacity: 1 - o, filter: `blur(${o * 12}px)` }),
};
const DURING = ['T26', 'T27', 'T28', 'T29', 'T30', 'T31', 'T32', 'T33', 'T34', 'T35'];
const POS = ['T46', 'T47', 'T48', 'T49', 'T50'];
export type Cap = { s: Set<string>; enter: string; during: Set<string>; exit?: string; pos?: string; stagger: boolean };
export const parseCap = (cap = '', soft = false): Cap => {
  const c = cap.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
  const s = new Set(c.filter((x) => x[0] === 'S'));
  if (!['S01', 'S02', 'S03', 'S08'].some((x) => s.has(x))) s.add(soft ? 'S02' : 'S01');
  const enter = c.find((x) => ENTER[x]);
  return { s, enter: enter ?? (c.includes('T15') ? 'T02' : 'T01'), during: new Set(c.filter((x) => DURING.includes(x))),
    exit: c.find((x) => EXIT[x]), pos: c.find((x) => POS.includes(x)), stagger: c.includes('T15') };
};

// letters of one word for T09 typewriter, T10 scattered letters, T22 scramble, T35 counting number
const GLYPHS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЮЯ0123456789#%&@';
const wordText = (enter: string, during: Set<string>, w: CapWord, f: number, fps: number, q: number, lf: number): React.ReactNode => {
  const since = f - w.s * fps;
  if (during.has('T35') && /^\d+([.,]\d+)?$/.test(w.w)) return String(Math.round(parseFloat(w.w.replace(',', '.')) * ramp(since, 0, 12)));
  if (enter === 'T09') {
    const n = since < 0 ? 0 : Math.ceil(w.w.length * Math.min(1, since / Math.max(3, (w.e - w.s) * fps)));
    return <>{w.w.slice(0, n)}<span style={{ opacity: 0 }}>{w.w.slice(n)}</span></>;
  }
  if (enter === 'T10') return [...w.w].map((ch, i) => {
    const r = (k: string) => random(`t10${w.w}${i}${k}`) - 0.5;
    return <span key={i} style={{ display: 'inline-block', opacity: q, transform: `translate(${r('x') * 160 * (1 - q)}px, ${r('y') * 120 * (1 - q)}px) rotate(${r('r') * 90 * (1 - q)}deg)` }}>{ch}</span>;
  });
  if (enter === 'T22') return [...w.w].map((ch, i) => lf > 2 + i * 1.5 ? ch : GLYPHS[Math.floor(random(`t22${w.w}${i}${Math.floor(f / 2)}`) * GLYPHS.length)]).join('');
  return w.w;
};
// T34: an emoji pops after key words; the map covers the DevGuide vocabulary, other *key* words get ✨
const EMOJI: [RegExp, string][] = [[/скіл/i, '🧩'], [/промпт/i, '💬'], [/код/i, '💻'], [/сайт/i, '🌐'], [/гр(о|і)ш|грн|\$/i, '💰'], [/хвилин|годин|час/i, '⏱'], [/claude|ai|нейро/i, '🤖'], [/відео|рілс/i, '🎬']];
const emojiFor = (w: CapWord) => EMOJI.find(([re]) => re.test(w.w))?.[1] ?? (w.em ? '✨' : null);

// T40–T44: slogan layouts, display font, for 3–6 word lines only (author rule: no word-by-word on narrated explanations)
const Slogan: React.FC<{ page: Page; enter: string; y: number; anchor: 'bottom' | 'center'; accent: string }> = ({ page, enter, y, anchor, accent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const fit = (w: string, base: number) => Math.min(base, 900 / Math.max(1, w.length * 0.66));
  const base = { fontFamily: F.display, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', display: 'inline-block' } as const;
  if (enter === 'T40') {
    const i = page.words.findIndex((w, k) => t >= w.s && t < (page.words[k + 1]?.s ?? page.end));
    if (i < 0) return null;
    const w = page.words[i], since = f - w.s * fps, size = fit(w.w, 150);
    return <div style={{ position: 'absolute', left: 0, right: 0, top: y - size / 2, textAlign: 'center' }}>
      <span style={{ ...base, fontSize: size, color: w.em ? accent : C.text, ...strokeShadow(size), transform: `scale(${interpolate(since, [0, 6], [1.3, 1], clamp)})` }}>{w.w}</span>
    </div>;
  }
  const sizes = enter === 'T42' ? [1.3, 0.78, 1.12, 0.9, 1.22, 0.85] : [1, 1, 1, 1, 1, 1];
  const rows = page.words.map((w, i) => ({ w, size: fit(w.w, 108 * sizes[i % sizes.length]) }));
  const H = rows.reduce((a, r) => a + r.size * 1.05, 0);
  return <div style={{ position: 'absolute', left: 0, right: 0, top: anchor === 'bottom' ? y - H : y - H / 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {rows.map(({ w, size }, i) => {
      const since = f - w.s * fps, p = spring({ frame: since, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
      const color = w.em ? accent : C.text;
      const anim: React.CSSProperties = since < 0 ? { opacity: 0 }
        : enter === 'T41' ? { opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * -40}px)` }
        : enter === 'T42' ? { transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2) }
        : enter === 'T43' ? { transform: `scale(${interpolate(since, [0, 5], [1.8, 1], clamp)}) rotate(-6deg)`, opacity: ramp(since, 0, 3) }
        : { transform: `translateY(${(1 - p) * size * 1.1}px)` }; // T44: rises from under its line
      return <div key={i} style={{ height: size * 1.05, overflow: enter === 'T44' ? 'hidden' : 'visible', display: 'flex', alignItems: 'flex-end' }}>
        <span style={{ ...base, fontSize: size, color, ...strokeShadow(size), ...anim }}>{w.w}</span>
      </div>;
    })}
  </div>;
};

const Captions: React.FC<{ pages: Page[]; y: number; anchor: 'bottom' | 'center'; accent: string; cap: Cap; low?: [number, number][] }> = ({ pages, y: y0, anchor: a0, accent, cap, low = [] }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const isLow = low.some(([s, e]) => t >= s && t < e);
  const { s, during: d } = cap;
  const pos = isLow ? 'T46' : cap.pos;
  const y = pos === 'T46' ? 1490 : pos === 'T48' ? 380 : pos === 'T49' ? 1100 : y0;
  const anchor = pos === 'T46' ? 'bottom' : pos === 'T48' || pos === 'T49' ? 'center' : a0;
  const page = pages.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const lh = page.size * 1.12;
  const height = page.lines.length * lh;
  const top = anchor === 'bottom' ? y - height : y - height / 2;
  if (/^T4[0-4]$/.test(cap.enter)) return <Slogan page={page} enter={cap.enter} y={y} anchor={anchor} accent={accent} />;
  const activeIdx = page.words.findIndex((w, i) => t >= w.s && t < (page.words[i + 1]?.s ?? page.end));
  const pf = page.start * fps, ef = page.end * fps;
  const out = cap.exit ? ramp(f, ef - 5, ef) : 0;
  const soft = s.has('S02'), plain = s.has('S03') || s.has('S08');
  const hiOff = s.has('S03') || d.has('T30') || d.has('T33') || d.has('T31');
  const fam = s.has('S07') ? F.display : F.body;
  return <div style={{ position: 'absolute', left: pos === 'T49' ? 84 : 0, width: pos === 'T49' ? 440 : 1080, top, display: 'flex', flexDirection: 'column', alignItems: 'center',
    transform: d.has('T32') ? `translateY(${-10 * (t - page.start) / Math.max(0.1, page.end - page.start)}px)` : undefined, ...(cap.exit ? EXIT[cap.exit](out) : {}) }}>
    {page.lines.map((line, li) => {
      const lf = f - pf - (cap.stagger ? li * 6 : 0);
      const q = ramp(lf, 0, cap.enter === 'T03' ? 8 : 9);
      const e = cap.enter;
      return <div key={li} style={{ position: 'relative', display: 'flex', gap: `0 ${page.size * 0.26}px`, height: lh, alignItems: 'flex-end',
        clipPath: CLIP[e]?.(q), ...(s.has('S08') ? { background: 'rgba(8,11,14,.62)', padding: `0 ${page.size * 0.3}px`, borderRadius: page.size * 0.24, marginBottom: 6, height: lh + 6, alignItems: 'center' } : {}),
        // T20: a marker bar grows under the line first, the words fade in over it
        ...(e === 'T20' ? { backgroundImage: `linear-gradient(${accent}aa, ${accent}aa)`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 82%', backgroundSize: `${ramp(lf, 0, 8) * 100}% ${page.size * 0.28}px` } : {}) }}>
        {/* T16: lime bar at the reveal edge; T21: lime box covering the line slides off to the right */}
        {e === 'T16' && q < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${q * 100}%`, width: page.size * 0.18, marginLeft: -page.size * 0.18, background: accent, zIndex: 2 }} />}
        {e === 'T21' && <div style={{ position: 'absolute', inset: `0 -${page.size * 0.1}px`, background: accent, zIndex: 2, transformOrigin: '100% 50%', transform: `scaleX(${1 - ramp(lf, 3, 12)})`, opacity: lf >= 0 ? 1 : 0 }} />}
        {line.map((wi) => {
          const w = page.words[wi];
          const sf = w.s * fps;
          const spoken = f >= sf;
          const p = spring({ frame: f - sf, fps, config: { damping: 15, stiffness: 260, mass: 0.6 } });
          const active = wi === activeIdx;
          const since = f - sf;
          const em = w.em && !plain;
          let color: string = C.text;
          if (!hiOff && active) color = accent;
          if (em && (!soft || s.has('S09'))) color = accent;
          if (d.has('T31') && w.em && active && since < 14) color = accent;
          const pill = s.has('S04') && active;
          if (cap.enter === 'T45') color = wi === page.words.length - 1 ? accent : C.text;
          if (d.has('T35') && /^\d+([.,]\d+)?$/.test(w.w)) color = accent;
          if (pill) color = '#0B0F12';
          const scale = em ? (s.has('S09') ? 1.12 : 1.08) : 1;
          const ent = ENTER[cap.enter]({ q, p, li, wi, size: page.size, lf: cap.enter === 'T01' || cap.enter === 'T45' ? since : lf });
          const extra: string[] = [];
          if (d.has('T26') && active) extra.push(`translateY(${-6 * ramp(since, 0, 4)}px)`);
          if (d.has('T27') && active) extra.push(`scale(${interpolate(since, [0, 4, 10], [1, 1.08, 1.04], clamp)})`);
          const look: Css = s.has('S03') ? { textShadow: '0 2px 8px rgba(0,0,0,.45)' } : soft || s.has('S08') ? softShadow(page.size, active && !hiOff ? accent : undefined) : strokeShadow(page.size);
          let opacity = (ent.opacity as number) ?? 1;
          if (s.has('S05')) opacity = spoken ? Math.max(opacity, 0.4) : 0.4; // karaoke trail: the whole page is visible, future words dim
          if (d.has('T29') && spoken && !active) opacity *= 0.6;
          return <span key={wi} style={{
            fontFamily: fam, fontWeight: s.has('S10') && !w.em ? 600 : s.has('S07') ? 900 : 800, fontSize: page.size, lineHeight: 1,
            letterSpacing: s.has('S06') ? '0.04em' : '-0.01em', textTransform: s.has('S06') ? 'uppercase' : undefined, color,
            ...look, ...ent, opacity,
            ...(d.has('T33') && active ? { textShadow: `${look.textShadow ? look.textShadow + ', ' : ''}0 0 ${page.size * 0.45}px rgba(255,255,255,.6)` } : {}),
            ...(pill ? { background: accent, borderRadius: page.size * 0.18, padding: `0 ${page.size * 0.14}px`, WebkitTextStroke: '0px', textShadow: 'none' } : {}),
            ...(d.has('T28') && active ? { backgroundImage: `linear-gradient(${accent}, ${accent})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left 100%',
              backgroundSize: `${ramp(since, 0, 6) * 100}% ${Math.round(page.size * 0.1)}px`, paddingBottom: page.size * 0.12 } : {}),
            transform: [ent.transform ?? '', ...extra].join(' ') + (scale !== 1 ? ` scale(${scale})` : ''),
            // +8% акцентного слова не має з'їдати пробіл: ≈ 0.04 × ширина слова (0.6em на літеру) з кожного боку
            margin: em ? `0 ${w.w.length * page.size * 0.024}px` : 0,
            transformOrigin: cap.enter === 'T17' ? '50% 100%' : '50% 90%', display: 'inline-block',
          }}>{wordText(cap.enter, d, w, f, fps, q, lf)}{d.has('T34') && spoken && emojiFor(w) && <span style={{ display: 'inline-block', marginLeft: page.size * 0.15, fontSize: page.size * 0.8, transform: `scale(${spring({ frame: since - 2, fps, config: { damping: 9, stiffness: 200 } })})`, WebkitTextStroke: '0px' }}>{emojiFor(w)}</span>}</span>;
        })}
      </div>;
    })}
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

export const Text: React.FC<TextProps> = ({ w, words, capY, capAnchor, capStyle, cap: capCodes, title, callouts, hits, progress, capLow, accent = C.lime }) => {
  const ready = useFontsLoaded();
  const cap = useMemo(() => parseCap(capCodes, capStyle === 'soft'), [capCodes, capStyle]);
  const pages = useMemo(() => {
    if (!ready) return [];
    // T49 = narrow column beside the speaker; S06/S07 are wider than Inter 800, measure them as drawn
    const m = measureWith(cap.s.has('S07') ? F.display : F.body, cap.s.has('S07') ? '900' : '800');
    const measure: Measure = cap.s.has('S06') ? (text, size) => m(text.toUpperCase(), size) * 1.06 : m;
    return cap.pos === 'T49' ? paginate(words, { maxW: 420, maxLines: 3, sizes: [62, 58, 54, 50] }, measure) : paginate(words, { maxW: MAX_W, maxLines: 2, sizes: CAP_SIZES }, measure);
  }, [words, ready, cap]);
  if (!ready) return null;
  return <AbsoluteFill>
    <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${w / 1080})`, transformOrigin: '0 0' }}>
      <Captions pages={pages} y={capY} anchor={capAnchor} accent={accent} cap={cap} low={capLow} />
      {title && <Callout item={title} title accent={accent} />}
      {callouts.map((c, i) => <Callout key={i} item={c} title={false} accent={accent} />)}
      {hits.map((t, i) => <Hit key={i} t={t} accent={accent} />)}
      {progress != null && <Progress y={progress} accent={accent} />}
    </div>
  </AbsoluteFill>;
};
