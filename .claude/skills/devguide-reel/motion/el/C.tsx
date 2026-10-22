import React from 'react';
import { interpolate } from 'remotion';
import { F, clamp, ramp } from '../theme';
import { Base, Glass, Icon, useLife } from '../glass';
import { Check, DIM_LINE, INK, Label, Reg, Spinner, pop, useTh } from './kit';

// C. AI й чат
const C04: React.FC<Base & { bad: string; good: string }> = ({ bad, good, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const judge = ramp(f, 26, 36);
  const bubble = (txt: string, ok: boolean, at: number) => {
    const q = pop(f, at, 30, 14);
    return <div style={{ marginTop: 16, padding: '18px 22px', borderRadius: 22, fontSize: 27, lineHeight: 1.35, fontWeight: 600, opacity: q * (ok ? 1 : 1 - 0.5 * judge),
      background: ok ? th.chip : 'rgba(255,255,255,.06)', border: ok && judge > 0.5 ? `2px solid ${th.accent}` : th.border, boxShadow: ok ? `0 0 ${26 * judge}px ${th.accent}55` : 'none',
      transform: `translateY(${(1 - q) * 20}px)`, display: 'flex', gap: 12 }}><Check q={judge} size={32} bad={!ok} /><span>{txt}</span></div>;
  };
  return <Glass side={side} y={y} w={440} scale={scale}>
    <Label>дві відповіді</Label>{bubble(bad, false, 6)}{bubble(good, true, 14)}
  </Glass>;
};

const C06: React.FC<Base & { pct: number; label?: string }> = ({ pct, label = 'Контекст', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 8, 40) * pct;
  const hot = k > 80;
  return <Glass side={side} y={y} w={420} scale={scale} tilt={0}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><Label>{label}</Label>
      <span style={{ fontFamily: F.mono, fontSize: 34, color: hot ? '#FFD84D' : th.accent }}>{Math.round(k)}%</span></div>
    <div style={{ marginTop: 16, height: 24, borderRadius: 12, background: DIM_LINE, overflow: 'hidden' }}>
      <div style={{ width: `${k}%`, height: '100%', borderRadius: 12, background: hot ? '#FFD84D' : th.accent }} />
    </div>
  </Glass>;
};

const C07: React.FC<Base & { tool: string; done?: string }> = ({ tool, done, side, y, scale }) => {
  const th = useTh(); const { f, N } = useLife();
  const end = Math.round(N * 0.55);
  const ok = f >= end;
  return <Glass side={side} y={y} w={420} scale={scale} tilt={0} style={{ padding: '22px 26px', borderRadius: 40 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.mono, fontSize: 28 }}>
      <span style={{ fontSize: 30 }}>🔧</span><span style={{ flex: 1 }}>{tool}</span>{ok ? <Check q={pop(f, end)} size={36} /> : <Spinner f={f} />}
    </div>
    {done && <div style={{ marginTop: 10, color: th.dim, fontSize: 24, fontWeight: 600, opacity: ok ? ramp(f, end + 4, end + 12) : 0 }}>{done}</div>}
  </Glass>;
};

const C08: React.FC<Base & { models: string[]; pick: number; note?: string }> = ({ models, pick, note, side = 'center', y = 240, scale }) => {
  const th = useTh(); const { f } = useLife();
  const lift = pop(f, 22);
  return <Glass side={side} y={y} w={models.length * 200 + 40} scale={scale} tilt={0} style={{ padding: 24 }}>
    <div style={{ display: 'flex', gap: 14 }}>
      {models.map((m, i) => {
        const on = i === pick;
        return <div key={i} style={{ flex: 1, padding: '24px 10px', borderRadius: 22, textAlign: 'center', fontFamily: th.title, fontWeight: 900, fontSize: 32,
          background: on && lift > 0.5 ? th.accent : 'rgba(255,255,255,.07)', color: on && lift > 0.5 ? INK : i === pick ? th.text : th.dim,
          transform: `translateY(${on ? -18 * lift : 0}px)`, opacity: on ? 1 : 1 - 0.35 * lift, boxShadow: on ? `0 ${12 * lift}px 30px rgba(0,0,0,.4)` : 'none' }}>{m}</div>;
      })}
    </div>
    {note && <div style={{ marginTop: 18, textAlign: 'center', fontSize: 26, fontWeight: 700, color: th.dim, opacity: ramp(f, 28, 36) }}>{note}</div>}
  </Glass>;
};

// template with [slots]: slots fill one by one
const C09: React.FC<Base & { text: string; fills: string[]; every?: number }> = ({ text, fills, every = 12, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const parts = text.split(/(\[[^\]]*\])/);
  let k = 0;
  return <Glass side={side} y={y} w={450} scale={scale}>
    <Label>шаблон промпту</Label>
    <div style={{ marginTop: 14, fontSize: 30, lineHeight: 1.7, fontWeight: 700 }}>
      {parts.map((p, i) => {
        if (!/^\[/.test(p)) return <span key={i}>{p}</span>;
        const idx = k++, q = pop(f, 12 + idx * every, 30, 14);
        const filled = q > 0.5;
        return <span key={i} style={{ display: 'inline-block', padding: '0 12px', margin: '0 2px', borderRadius: 12, lineHeight: 1.35, transform: `scale(${0.9 + 0.1 * q})`,
          background: filled ? th.accent : 'transparent', border: filled ? '2px solid transparent' : `2px dashed ${th.dim}`, color: filled ? INK : th.dim }}>{filled ? fills[idx] ?? '' : p.slice(1, -1) || '…'}</span>;
      })}
    </div>
  </Glass>;
};

const C10: React.FC<Base & { label?: string }> = ({ label = 'Голосовий режим', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={380} scale={scale}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <Icon size={90} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 80 }}>
        {Array.from({ length: 15 }, (_, i) => {
          const h = 14 + 60 * Math.abs(Math.sin(f / 4 + i * 0.9) * Math.sin(f / 9 + i * 0.4));
          return <span key={i} style={{ width: 9, height: h * ramp(f, 6, 14), borderRadius: 5, background: th.accent, opacity: 0.55 + 0.45 * (h / 74) }} />;
        })}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: th.dim }}>{label}</div>
    </div>
  </Glass>;
};

export const C: Reg = {
  C04: { C: C04, name: 'Погана / добра відповідь', demo: { bad: 'Ось загальні поради щодо дизайну…', good: 'Кнопка губиться: зроби її лаймовою й більшою' } },
  C06: { C: C06, name: 'Контекст-бар', demo: { pct: 86, label: 'Контекст чату' } },
  C07: { C: C07, name: 'Виклик інструменту', demo: { tool: 'web_search', done: 'знайдено 8 джерел' } },
  C08: { C: C08, name: 'Вибір моделі', demo: { models: ['Haiku', 'Sonnet', 'Opus'], pick: 2, note: 'для складних задач' } },
  C09: { C: C09, name: 'Шаблон промпту', demo: { text: 'Ти [роль]. Зроби [задача] для [кого].', fills: ['дизайнер', 'лендинг', 'кав\'ярні'] } },
  C10: { C: C10, name: 'Голос AI', demo: {} },
};
