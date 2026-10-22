import React from 'react';
import { spring } from 'remotion';
import { F, ramp } from '../theme';
import { Base, Glass, useLife } from '../glass';
import { Free, INK, Label, Reg, pop, useTh, tint } from './kit';

// F. Списки й кроки
const F04: React.FC<Base & { items: string[]; every?: number }> = ({ items, every = 12, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={430} scale={scale}>
    {items.map((it, i) => {
      const q = pop(f, 6 + i * every), line = ramp(f, 10 + i * every, 6 + (i + 1) * every);
      return <div key={i} style={{ display: 'flex', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: 25, background: th.accent, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display,
            fontWeight: 900, fontSize: 24, transform: `scale(${q})` }}>{i + 1}</div>
          {i < items.length - 1 && <div style={{ width: 4, height: 40 * line, background: th.accent, opacity: 0.5, borderRadius: 2 }} />}
        </div>
        <div style={{ paddingTop: 8, fontSize: 30, fontWeight: 800, opacity: q, minHeight: i < items.length - 1 ? 90 : 0 }}>{it}</div>
      </div>;
    })}
  </Glass>;
};

const F05: React.FC<Base & { items: string[]; active?: number }> = ({ items, active, y = 300 }) => {
  const th = useTh(); const { f } = useLife();
  const n = items.length, W = 860, draw = ramp(f, 4, 30);
  return <Free side="center" w={W + 40} y={y}>
    <div style={{ position: 'relative', height: 200, margin: '0 20px' }}>
      <div style={{ position: 'absolute', top: 120, left: 0, height: 6, borderRadius: 3, background: th.accent, width: W * draw, boxShadow: `0 0 12px ${th.accent}66` }} />
      {items.map((it, i) => {
        const x = (i / (n - 1)) * W, q = pop(f, 6 + i * 7), on = i === (active ?? n - 1);
        return <div key={i} style={{ position: 'absolute', left: x, top: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}>
          <div style={{ height: 90, display: 'flex', alignItems: 'flex-end', textAlign: 'center', fontSize: 28, fontWeight: 800, color: on ? th.accent : th.text, opacity: q, textShadow: '0 4px 14px rgba(0,0,0,.7)' }}>{it}</div>
          <div style={{ marginTop: 16, width: on ? 34 : 26, height: on ? 34 : 26, borderRadius: 17, background: on ? th.accent : '#141B22', border: `5px solid ${th.accent}`, transform: `scale(${q})` }} />
        </div>;
      })}
    </div>
  </Free>;
};

const F07: React.FC<Base & { levels: string[] }> = ({ levels, side, y, scale }) => {
  const th = useTh(); const { f, fps } = useLife();
  const n = levels.length;
  return <Glass side={side} y={y} w={430} scale={scale}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {levels.map((l, i) => {
        const q = spring({ frame: f - 4 - (n - 1 - i) * 7, fps, config: { damping: 12, stiffness: 160 } }); // stacks from the bottom
        return <div key={i} style={{ width: `${40 + (i / Math.max(1, n - 1)) * 60}%`, padding: '14px 8px', textAlign: 'center', borderRadius: 12, fontSize: 25, fontWeight: 800,
          background: i === 0 ? th.accent : `rgba(255,255,255,${0.1 + 0.05 * i})`, color: i === 0 ? INK : th.text, opacity: q, transform: `translateY(${(1 - q) * -40}px)` }}>{l}</div>;
      })}
    </div>
  </Glass>;
};

const F08: React.FC<Base & { stages: string[] }> = ({ stages, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const n = stages.length;
  return <Glass side={side} y={y} w={430} scale={scale}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {stages.map((s, i) => {
        const q = ramp(f, 4 + i * 7, 14 + i * 7), w = 100 - (i / Math.max(1, n - 1)) * 55;
        return <div key={i} style={{ width: `${w * (0.6 + 0.4 * q)}%`, padding: '16px 6px', textAlign: 'center', fontSize: 25, fontWeight: 800, opacity: q, clipPath: 'polygon(0 0, 100% 0, 94% 100%, 6% 100%)',
          background: i === n - 1 ? th.accent : `rgba(255,255,255,${0.22 - 0.03 * i})`, color: i === n - 1 ? INK : th.text }}>{s}</div>;
      })}
    </div>
  </Glass>;
};

const F09: React.FC<Base & { items: { title: string; body?: string }[]; open: number }> = ({ items, open, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 18, 30);
  return <Glass side={side} y={y} w={440} scale={scale}>
    {items.map((it, i) => {
      const on = i === open;
      return <div key={i} style={{ borderBottom: i < items.length - 1 ? '1.5px solid rgba(255,255,255,.1)' : 'none', padding: '14px 0', opacity: ramp(f, 4 + i * 3, 10 + i * 3) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 29, fontWeight: 800, color: on && k > 0.3 ? th.accent : th.text }}>
          {it.title}<span style={{ transform: `rotate(${on ? k * 45 : 0}deg)`, display: 'inline-block', color: th.dim }}>+</span></div>
        {on && it.body && <div style={{ overflow: 'hidden', height: k * 84 }}><div style={{ paddingTop: 10, fontSize: 25, lineHeight: 1.35, color: th.dim, fontWeight: 600 }}>{it.body}</div></div>}
      </div>;
    })}
  </Glass>;
};

// items fall into a box one by one
const F10: React.FC<Base & { items: string[]; label?: string }> = ({ items, label, side, y, scale }) => {
  const th = useTh(); const { f, fps } = useLife();
  return <Glass side={side} y={y} w={430} scale={scale} tilt={0}>
    <div style={{ position: 'relative', padding: '18px 16px', borderRadius: 24, border: `3px dashed ${th.accent}`, display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 120, background: tint(th.accent, .05) }}>
      {items.map((it, i) => {
        const q = spring({ frame: f - 6 - i * 7, fps, config: { damping: 10, stiffness: 140 } });
        return <span key={i} style={{ padding: '10px 18px', borderRadius: 16, background: th.chip, color: th.text, fontSize: 25, fontWeight: 800, border: '1.5px solid ${tint(th.accent, .35)}',
          transform: `translateY(${(1 - q) * -150}px) rotate(${(1 - q) * (i % 2 ? 14 : -14)}deg)`, opacity: Math.min(1, q * 3) }}>{it}</span>;
      })}
    </div>
    {label && <div style={{ marginTop: 14, textAlign: 'center', fontSize: 27, fontWeight: 800, color: th.accent, opacity: ramp(f, 8 + items.length * 7, 16 + items.length * 7) }}>{label}</div>}
  </Glass>;
};

export const Fg: Reg = {
  F04: { C: F04, name: 'Кроки 1-2-3', demo: { items: ['Відкрий налаштування', 'Завантаж скіл', 'Попроси задачу'] } },
  F05: { C: F05, name: 'Таймлайн', demo: { items: ['Ідея', 'Промпт', 'Скіл', 'Агент'] } },
  F07: { C: F07, name: 'Піраміда', demo: { levels: ['Агенти', 'Скіли', 'Промпти', 'Чат'] } },
  F08: { C: F08, name: 'Воронка', demo: { stages: ['100 ідей', '20 сценаріїв', '5 роликів', '1 хіт'] } },
  F09: { C: F09, name: 'Гармошка', demo: { items: [{ title: 'Промпт' }, { title: 'Скіл', body: 'Записаний промпт + файли, Claude бере його сам' }, { title: 'Агент' }], open: 1 } },
  F10: { C: F10, name: 'Дропзона', demo: { items: ['SKILL.md', 'приклади', 'скрипти', 'шаблон'], label: 'усе в одному скілі' } },
};
