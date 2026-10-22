import React from 'react';
import { interpolate } from 'remotion';
import { F, clamp, ramp } from '../theme';
import { Base, Glass, useLife } from '../glass';
import { DIM_LINE, INK, Label, Reg, pop, useTh } from './kit';

// E. Цифри й дані (лише реальні числа в роликах)
const easeOut3 = (x: number) => 1 - Math.pow(1 - x, 3);

const E02: React.FC<Base & { title?: string; bars: { label: string; value: number }[]; unit?: string }> = ({ title, bars, unit = '', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const max = Math.max(...bars.map((b) => b.value));
  return <Glass side={side} y={y} w={430} scale={scale}>
    {title && <Label>{title}</Label>}
    <div style={{ marginTop: 18, display: 'flex', alignItems: 'flex-end', gap: 22, height: 260 }}>
      {bars.map((b, i) => {
        const q = ramp(f, 6 + i * 6, 26 + i * 6, 0, 1, easeOut3), top = i === bars.length - 1;
        return <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: top ? th.accent : th.dim, marginBottom: 8, opacity: q }}>{Math.round(b.value * q)}{unit}</div>
          <div style={{ width: '100%', height: `${(b.value / max) * 75 * q}%`, borderRadius: '14px 14px 4px 4px', background: top ? th.accent : 'rgba(255,255,255,.22)' }} />
          <div style={{ marginTop: 10, fontSize: 22, fontWeight: 700, color: th.dim, textAlign: 'center' }}>{b.label}</div>
        </div>;
      })}
    </div>
  </Glass>;
};

const E03: React.FC<Base & { pct: number; label?: string }> = ({ pct, label, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 6, 34, 0, pct, easeOut3);
  const R = 80, L = 2 * Math.PI * R;
  return <Glass side={side} y={y} w={380} scale={scale}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <div style={{ position: 'relative', width: 190, height: 190, flexShrink: 0 }}>
        <svg width="190" height="190" viewBox="0 0 190 190"><circle cx="95" cy="95" r={R} fill="none" stroke={DIM_LINE} strokeWidth="22" />
          <circle cx="95" cy="95" r={R} fill="none" stroke={th.accent} strokeWidth="22" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - k / 100)} transform="rotate(-90 95 95)" /></svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 42 }}>{Math.round(k)}%</div>
      </div>
      {label && <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, opacity: ramp(f, 12, 22) }}>{label}</div>}
    </div>
  </Glass>;
};

const E05: React.FC<Base & { points: number[]; label?: string; value?: string }> = ({ points, label, value, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const W = 360, H = 180, max = Math.max(...points), min = Math.min(...points);
  const pts = points.map((v, i) => [i * W / (points.length - 1), H - ((v - min) / Math.max(1, max - min)) * H] as const);
  const d = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x} ${yy}`).join(' ');
  const k = ramp(f, 6, 34);
  const [ex, ey] = pts[pts.length - 1];
  return <Glass side={side} y={y} w={430} scale={scale}>
    {label && <Label>{label}</Label>}
    <svg width={W + 20} height={H + 30} viewBox={`-10 -15 ${W + 20} ${H + 30}`} style={{ marginTop: 14, overflow: 'visible' }}>
      {[0, 0.5, 1].map((g) => <line key={g} x1="0" x2={W} y1={g * H} y2={g * H} stroke={DIM_LINE} strokeWidth="2" />)}
      <path d={d} fill="none" stroke={th.accent} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
      <circle cx={ex} cy={ey} r={14 * pop(f, 34)} fill={th.accent} />
    </svg>
    {value && <div style={{ marginTop: 6, fontFamily: F.display, fontWeight: 900, fontSize: 46, color: th.accent, opacity: ramp(f, 34, 42) }}>{value}</div>}
  </Glass>;
};

const E06: React.FC<Base & { old: string; now: string; label?: string }> = ({ old, now, label, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const strike = ramp(f, 10, 20), q = pop(f, 20, 30, 9);
  return <Glass side={side} y={y} w={400} scale={scale}>
    {label && <Label>{label}</Label>}
    <div style={{ position: 'relative', display: 'inline-block', marginTop: 10, fontFamily: F.display, fontWeight: 900, fontSize: 56, color: th.dim }}>{old}
      <div style={{ position: 'absolute', left: -6, top: '52%', height: 6, borderRadius: 3, background: th.text, width: `${strike * 108}%`, transform: 'rotate(-8deg)' }} /></div>
    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 96, color: th.accent, transform: `scale(${q})`, transformOrigin: '0 50%', textShadow: `0 0 30px ${th.accent}55` }}>{now}</div>
  </Glass>;
};

const E07: React.FC<Base & { month: string; day: number; startDow?: number; days?: number; note?: string }> = ({ month, day, startDow = 2, days = 30, note, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const ring = ramp(f, 18, 32);
  const cells = Array.from({ length: startDow + days }, (_, i) => i - startDow + 1);
  return <Glass side={side} y={y} w={430} scale={scale} tilt={0}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><Label>{month}</Label>{note && <span style={{ color: th.accent, fontWeight: 800, fontSize: 24 }}>{note}</span>}</div>
    <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 18, color: th.dim, fontWeight: 700 }}>{d}</div>)}
      {cells.map((d, i) => <div key={i} style={{ position: 'relative', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 21,
        color: d === day ? INK : d > 0 ? th.text : 'transparent', opacity: ramp(f, 2 + i * 0.5, 8 + i * 0.5) }}>
        {d === day && <div style={{ position: 'absolute', inset: 2, borderRadius: 22, background: th.accent, transform: `scale(${ring})` }} />}
        <span style={{ position: 'relative' }}>{d > 0 ? d : ''}</span>
      </div>)}
    </div>
  </Glass>;
};

const E08: React.FC<Base & { n: number; of?: number; label?: string }> = ({ n, of = 5, label, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={420} scale={scale}>
    <div style={{ display: 'flex', gap: 8 }}>{Array.from({ length: of }, (_, i) => {
      const q = pop(f, 6 + i * 5, 30, 9), on = i < n;
      return <span key={i} style={{ fontSize: 60, color: on && q > 0.5 ? th.accent : 'rgba(255,255,255,.2)', transform: `scale(${on ? 0.6 + 0.4 * q : 1}) rotate(${on ? (1 - q) * 72 : 0}deg)`, display: 'inline-block',
        textShadow: on && q > 0.5 ? `0 0 18px ${th.accent}88` : 'none' }}>★</span>;
    })}</div>
    {label && <div style={{ marginTop: 12, fontSize: 28, fontWeight: 800, opacity: ramp(f, 6 + of * 5, 14 + of * 5) }}>{label}</div>}
  </Glass>;
};

const E09: React.FC<Base & { left: string; right: string; pos: number; label?: string }> = ({ left, right, pos, label, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = interpolate(f, [8, 30], [0.5, pos], { ...clamp, easing: easeOut3 });
  return <Glass side={side} y={y} w={430} scale={scale} tilt={0}>
    {label && <Label>{label}</Label>}
    <div style={{ position: 'relative', marginTop: 34, height: 14, borderRadius: 7, background: `linear-gradient(90deg, ${th.accent}, rgba(255,255,255,.25))` }}>
      <div style={{ position: 'absolute', top: -15, left: `calc(${k * 100}% - 22px)`, width: 44, height: 44, borderRadius: 22, background: '#fff', boxShadow: `0 0 0 6px rgba(195,255,85,.35), 0 4px 10px rgba(0,0,0,.5)` }} />
    </div>
    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 25, fontWeight: 800 }}><span style={{ color: th.accent }}>{left}</span><span style={{ color: th.dim }}>{right}</span></div>
  </Glass>;
};

const E10: React.FC<Base & { n: number; of: number; label?: string }> = ({ n, of, label, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={400} scale={scale} tilt={0}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 70, color: th.accent }}>{n}</span><span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 40, color: th.dim }}>/ {of}</span>
      {label && <span style={{ marginLeft: 8, fontSize: 26, fontWeight: 800 }}>{label}</span>}
    </div>
    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>{Array.from({ length: of }, (_, i) => {
      const q = i < n ? pop(f, 6 + i * 5) : 0;
      return <span key={i} style={{ flex: 1, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${q * 100}%`, background: th.accent }} /></span>;
    })}</div>
  </Glass>;
};

export const E: Reg = {
  E02: { C: E02, name: 'Стовпчики', demo: { title: 'Хвилин на задачу', bars: [{ label: 'руками', value: 40 }, { label: 'з AI', value: 15 }, { label: 'зі скілом', value: 5 }], unit: '' } },
  E03: { C: E03, name: 'Кільце %', demo: { pct: 72, label: 'задач закриває сам' } },
  E05: { C: E05, name: 'Графік росту', demo: { points: [2, 3, 3, 5, 6, 9, 12], label: 'Охоплення', value: '×6' } },
  E06: { C: E06, name: 'Ціна до / після', demo: { old: '$40', now: '$0', label: 'Приклад' } },
  E07: { C: E07, name: 'Календар', demo: { month: 'Листопад', day: 14, startDow: 5, note: 'дедлайн' } },
  E08: { C: E08, name: 'Рейтинг', demo: { n: 4, label: 'зручність' } },
  E09: { C: E09, name: 'Шкала складності', demo: { left: 'легко', right: 'складно', pos: 0.2, label: 'Рівень' } },
  E10: { C: E10, name: 'X з Y', demo: { n: 3, of: 5, label: 'кроків' } },
};
