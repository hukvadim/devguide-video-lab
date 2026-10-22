import React from 'react';
import { interpolate, spring } from 'remotion';
import { F, clamp, ramp } from '../theme';
import { Base, Glass, useLife } from '../glass';
import { Check, Free, INK, Label, Reg, outline, pop, useTh, tint } from './kit';

// G. Порівняння й вибір
const G02: React.FC<Base & { a: string; b: string }> = ({ a, b, y = 300 }) => {
  const th = useTh(); const { f, fps } = useLife();
  const q = spring({ frame: f, fps, config: { damping: 13, stiffness: 120 } });
  const vs = pop(f, 14, 30, 7);
  const plate = (t: string, dir: number, hot: boolean) => <div style={{ flex: 1, padding: '34px 10px', borderRadius: 28, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 46,
    background: hot ? th.accent : '#141B22', color: hot ? INK : th.text, border: hot ? 'none' : th.border, boxShadow: th.glow, transform: `translateX(${(1 - q) * dir * 500}px)` }}>{t}</div>;
  return <Free side="center" w={912} y={y}>
    <div style={{ position: 'relative', display: 'flex', gap: 120, alignItems: 'center' }}>
      {plate(a, -1, false)}{plate(b, 1, true)}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${vs}) rotate(${(1 - vs) * 30}deg)`, fontFamily: F.display, fontWeight: 900, fontSize: 80,
        color: th.text, ...outline(10) }}>VS</div>
    </div>
  </Free>;
};

const G03: React.FC<Base & { left: string; right: string; heavier?: 'left' | 'right' }> = ({ left, right, heavier = 'right', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const t = Math.max(0, f - 8);
  const ang = (heavier === 'right' ? 1 : -1) * 12 * (1 - Math.exp(-t / 14) * Math.cos(t / 3.2));
  const pan = (txt: string, s: number) => {
    const dy = Math.sin((ang * Math.PI) / 180) * 150 * s;
    return <div style={{ position: 'absolute', left: s < 0 ? 0 : 230, top: 70 + dy, width: 150, textAlign: 'center' }}>
      <div style={{ height: 40, borderLeft: '2px solid rgba(255,255,255,.4)', borderRight: '2px solid rgba(255,255,255,.4)', margin: '0 30px' }} />
      <div style={{ height: 14, borderRadius: '0 0 70px 70px', background: (s > 0) === (heavier === 'right') ? th.accent : 'rgba(255,255,255,.35)' }} />
      <div style={{ marginTop: 10, fontSize: 25, fontWeight: 800 }}>{txt}</div>
    </div>;
  };
  return <Glass side={side} y={y} w={420} scale={scale} tilt={0}>
    <div style={{ position: 'relative', height: 260, width: 380 }}>
      <div style={{ position: 'absolute', left: 188, top: 70, width: 6, height: 170, background: th.dim, borderRadius: 3 }} />
      <div style={{ position: 'absolute', left: 60, top: 64, width: 270, height: 8, borderRadius: 4, background: th.text, transform: `rotate(${ang}deg)` }} />
      {pan(left, -1)}{pan(right, 1)}
    </div>
  </Glass>;
};

const G04: React.FC<Base & { cols: string[]; rows: [string, ...boolean[]][] }> = ({ cols, rows, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={470} scale={scale} tilt={0} style={{ padding: 24 }}>
    <div style={{ display: 'grid', gridTemplateColumns: `1.6fr repeat(${cols.length}, 1fr)`, rowGap: 14, alignItems: 'center' }}>
      <span />{cols.map((c, i) => <span key={i} style={{ textAlign: 'center', fontSize: 23, fontWeight: 800, color: i === cols.length - 1 ? th.accent : th.dim }}>{c}</span>)}
      {rows.map(([label, ...vals], r) => <React.Fragment key={r}>
        <span style={{ fontSize: 25, fontWeight: 700, opacity: ramp(f, 4 + r * 6, 10 + r * 6) }}>{label}</span>
        {vals.map((v, c) => <span key={c} style={{ display: 'flex', justifyContent: 'center' }}>{v ? <Check q={pop(f, 10 + r * 6 + c * 3)} size={34} />
          : <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 28, opacity: ramp(f, 10 + r * 6, 14 + r * 6) }}>—</span>}</span>)}
      </React.Fragment>)}
    </div>
  </Glass>;
};

// before/after wipe on two labelled panels (for a real screenshot pass `before`/`after` image paths later)
const G05: React.FC<Base & { before: string; after: string }> = ({ before, after, side, y, scale }) => {
  const th = useTh(); const { f, N } = useLife();
  const k = interpolate(f, [10, Math.max(11, N * 0.45), Math.max(12, N * 0.65)], [1, 0, 0.5], clamp);
  const pane = (t: string, good: boolean) => <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: good ? 'flex-end' : 'flex-start', padding: 30, textAlign: good ? 'right' : 'left',
    fontFamily: F.display, fontWeight: 900, fontSize: 36, lineHeight: 1.15, background: good ? 'linear-gradient(160deg,#1E2A16,#10161C)' : '#20262C', color: good ? th.accent : th.dim, ...(good ? { paddingLeft: '54%' } : { paddingRight: '54%' }) }}>{t}</div>;
  return <Glass side={side} y={y} w={460} scale={scale} tilt={0} style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ position: 'relative', height: 300 }}>
      {pane(after, true)}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` }}>{pane(before, false)}</div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${k * 100}%`, width: 5, marginLeft: -2, background: '#fff' }}>
        <div style={{ position: 'absolute', top: '50%', left: -20, width: 44, height: 44, marginTop: -22, borderRadius: 22, background: '#fff', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22 }}>⇔</div>
      </div>
    </div>
  </Glass>;
};

const G06: React.FC<Base & { a: string; b: string; mid: string }> = ({ a, b, mid, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 4, 24), glow = ramp(f, 22, 32);
  return <Glass side={side} y={y} w={440} scale={scale} tilt={0}>
    <svg width="380" height="250" viewBox="0 0 380 250">
      <circle cx={190 - 60 - (1 - k) * 60} cy="125" r="105" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.45)" strokeWidth="3" />
      <circle cx={190 + 60 + (1 - k) * 60} cy="125" r="105" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.45)" strokeWidth="3" />
      <clipPath id="g06"><circle cx="130" cy="125" r="105" /></clipPath>
      <circle cx="250" cy="125" r="105" fill={th.accent} opacity={glow * 0.9} clipPath="url(#g06)" />
      <text x="70" y="132" textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize="24" fill={th.text}>{a}</text>
      <text x="310" y="132" textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize="24" fill={th.text}>{b}</text>
      <text x="190" y="132" textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize="24" fill={INK} opacity={glow}>{mid}</text>
    </svg>
  </Glass>;
};

const G07: React.FC<Base & { myth: string; truth: string }> = ({ myth, truth, side, y, scale }) => {
  const th = useTh(); const { f, fps, N } = useLife();
  const flip = spring({ frame: f - Math.round(N * 0.42), fps, config: { damping: 14, stiffness: 90 } });
  const back = flip > 0.5;
  return <Glass side={side} y={y} w={420} scale={scale} tilt={0} style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
    <div style={{ transform: `perspective(1200px) rotateY(${flip * 180}deg)`, transformStyle: 'preserve-3d' }}>
      <div style={{ padding: 32, borderRadius: 34, background: back ? 'linear-gradient(160deg,#1E2A16,#10161C)' : '#1A2027', border: back ? `2.5px solid ${th.accent}` : '1.5px solid rgba(255,255,255,.14)',
        boxShadow: th.glow, transform: back ? 'rotateY(180deg)' : 'none', minHeight: 200 }}>
        <div style={{ fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: back ? th.accent : th.dim }}>{back ? '✓ Правда' : '✗ Міф'}</div>
        <div style={{ marginTop: 14, fontSize: 32, lineHeight: 1.3, fontWeight: 800 }}>{back ? truth : myth}</div>
      </div>
    </div>
  </Glass>;
};

const G08: React.FC<Base & { x: [string, string]; y: [string, string]; point: string; at: [number, number] }> = ({ x: xl, y: yl, point, at, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 4, 18), q = pop(f, 22, 30, 9), S = 320;
  const px = at[0] * S, py = (1 - at[1]) * S;
  return <Glass side={side} y={y} w={430} scale={scale} tilt={0}>
    <div style={{ position: 'relative', width: S, height: S, margin: '20px auto 30px' }}>
      <div style={{ position: 'absolute', left: S / 2 - 2, top: 0, width: 4, height: S * k, background: th.dim, borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: S / 2 - 2, left: 0, height: 4, width: S * k, background: th.dim, borderRadius: 2 }} />
      <div style={{ position: 'absolute', left: Math.round(px / (S / 2)) ? S / 2 : 0, top: Math.round(py / (S / 2)) ? S / 2 : 0, width: S / 2, height: S / 2, background: tint(th.accent, .1), opacity: q }} />
      <div style={{ position: 'absolute', left: px - 16, top: py - 16, width: 32, height: 32, borderRadius: 16, background: th.accent, transform: `scale(${q})`, boxShadow: `0 0 20px ${th.accent}` }} />
      <div style={{ position: 'absolute', left: px + 22, top: py - 18, fontSize: 24, fontWeight: 800, color: th.accent, opacity: q, whiteSpace: 'nowrap' }}>{point}</div>
      {[[xl[0], { left: 0, top: S / 2 + 10 }], [xl[1], { right: 0, top: S / 2 + 10, textAlign: 'right' }], [yl[1], { left: 0, right: 0, top: -34, textAlign: 'center' }], [yl[0], { left: 0, right: 0, top: S + 8, textAlign: 'center' }]].map(([t, pos], i) =>
        <div key={i} style={{ position: 'absolute', ...(pos as object), fontSize: 20, fontWeight: 700, color: th.dim, opacity: k }}>{t as string}</div>)}
    </div>
  </Glass>;
};

const G09: React.FC<Base & { before: string; now: string; labels?: [string, string] }> = ({ before, now, labels = ['Раніше', 'Тепер'], side, y, scale }) => {
  const th = useTh(); const { f, N } = useLife();
  const k = pop(f, Math.round(N * 0.4), 30, 13), on = k > 0.5;
  return <Glass side={side} y={y} w={420} scale={scale}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 25, fontWeight: 800 }}>
      <span style={{ color: on ? th.dim : th.text }}>{labels[0]}</span>
      <div style={{ width: 96, height: 52, borderRadius: 26, background: on ? th.accent : 'rgba(255,255,255,.2)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 5, left: 5 + 44 * k, width: 42, height: 42, borderRadius: 21, background: '#fff' }} /></div>
      <span style={{ color: on ? th.accent : th.dim }}>{labels[1]}</span>
    </div>
    <div style={{ position: 'relative', marginTop: 22, minHeight: 90, fontSize: 31, lineHeight: 1.3, fontWeight: 800 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - k, transform: `translateY(${-k * 16}px)`, color: th.dim }}>{before}</div>
      <div style={{ position: 'absolute', inset: 0, opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>{now}</div>
    </div>
  </Glass>;
};

// leaderboard: rows start shuffled and slide into rank order
const G10: React.FC<Base & { items: string[]; from?: number[] }> = ({ items, from, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const start = from ?? items.map((_, i) => (i + 1) % items.length);
  const k = ramp(f, 16, 32);
  return <Glass side={side} y={y} w={420} scale={scale}>
    <Label>рейтинг</Label>
    <div style={{ position: 'relative', height: items.length * 70, marginTop: 14 }}>
      {items.map((it, i) => <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: interpolate(k, [0, 1], [start[i], i]) * 70, height: 60, display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 18px', borderRadius: 16, background: i === 0 && k > 0.9 ? th.accent : 'rgba(255,255,255,.07)', color: i === 0 && k > 0.9 ? INK : th.text, fontSize: 28, fontWeight: 800 }}>
        <span style={{ fontFamily: F.display, width: 34 }}>{k > 0.9 ? i + 1 : start[i] + 1}</span>{it}</div>)}
    </div>
  </Glass>;
};

export const G: Reg = {
  G02: { C: G02, name: 'VS', demo: { a: 'ChatGPT', b: 'Claude' } },
  G03: { C: G03, name: 'Ваги', demo: { left: 'швидко', right: 'якісно', heavier: 'right' } },
  G04: { C: G04, name: 'Таблиця порівняння', demo: { cols: ['Чат', 'Скіл'], rows: [['Пам\'ятає правила', false, true], ['Свої файли', false, true], ['Без налаштувань', true, false]] } },
  G05: { C: G05, name: 'Шторка до / після', demo: { before: 'Сірий шаблон', after: 'Сайт за годину' } },
  G06: { C: G06, name: 'Перетин кіл', demo: { a: 'Код', b: 'Дизайн', mid: 'AI' } },
  G07: { C: G07, name: 'Міф / Правда', demo: { myth: 'AI пише код лише для програмістів', truth: 'Сайт збирається зі звичайного опису словами' } },
  G08: { C: G08, name: 'Матриця 2×2', demo: { x: ['просто', 'складно'], y: ['мало користі', 'багато користі'], point: 'скіли', at: [0.25, 0.8] } },
  G09: { C: G09, name: 'Раніше / Тепер', demo: { before: 'Пишу той самий промпт щодня', now: 'Один скіл, і Claude пам\'ятає' } },
  G10: { C: G10, name: 'Лідерборд', demo: { items: ['Скіл', 'Промпт', 'Чат'] } },
};
