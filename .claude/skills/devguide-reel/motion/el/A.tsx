import React from 'react';
import { interpolate } from 'remotion';
import { F, clamp, ramp } from '../theme';
import { Base, Glass, useLife } from '../glass';
import { Check, INK, Label, Reg, pop, useTh, tint } from './kit';

// A. Навігація й інтерфейс
const A02: React.FC<Base & { title?: string; items: string[]; pick: number }> = ({ title, items, pick, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 16, 30) * pick;
  return <Glass side={side} y={y} w={400} scale={scale}>
    {title && <Label>{title}</Label>}
    <div style={{ position: 'relative', marginTop: title ? 14 : 0 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: k * 62, height: 56, borderRadius: 16, background: th.accent, opacity: ramp(f, 8, 14) }} />
      {items.map((it, i) => {
        const on = Math.abs(k - i) < 0.5;
        return <div key={i} style={{ position: 'relative', height: 62, display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 30, fontWeight: 800,
          color: on && f > 10 ? INK : i === pick ? th.text : th.dim, opacity: ramp(f, 4 + i * 2, 10 + i * 2) }}>{it}</div>;
      })}
    </div>
  </Glass>;
};

const A05: React.FC<Base & { tabs: string[]; pick: number }> = ({ tabs, pick, side = 'center', y = 220, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 14, 28) * pick;
  const W = 140;
  return <Glass side={side} y={y} w={tabs.length * W + 60} scale={scale} tilt={0} style={{ padding: '22px 30px 18px' }}>
    <div style={{ position: 'relative', display: 'flex' }}>
      {tabs.map((t, i) => <div key={i} style={{ width: W, textAlign: 'center', fontSize: 28, fontWeight: 800, paddingBottom: 14, color: Math.round(k) === i ? th.text : th.dim }}>{t}</div>)}
      <div style={{ position: 'absolute', bottom: 0, left: k * W + 20, width: W - 40, height: 6, borderRadius: 3, background: th.accent, boxShadow: `0 0 14px ${th.accent}88` }} />
    </div>
  </Glass>;
};

const A07: React.FC<Base & { label: string; items: string[]; pick: number }> = ({ label, items, pick, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const open = ramp(f, 10, 20);
  const chosen = f > 34;
  const blink = chosen ? 0.5 + 0.5 * Math.cos((f - 34) / 2) : 0;
  return <Glass side={side} y={y} w={420} scale={scale} tilt={0}>
    <Label>{label}</Label>
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 18, background: 'rgba(255,255,255,.08)', border: th.border, fontSize: 30, fontWeight: 800 }}>
      {chosen ? items[pick] : items[0]}<span style={{ color: th.accent, transform: `rotate(${open * 180}deg)`, display: 'inline-block' }}>▾</span>
    </div>
    <div style={{ overflow: 'hidden', height: open * items.length * 56 + (open > 0 ? 12 : 0) }}>
      <div style={{ marginTop: 12 }}>{items.map((it, i) => <div key={i} style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', borderRadius: 14, fontSize: 27, fontWeight: 700,
        background: i === pick && f > 26 ? tint(th.accent, 0.12 + 0.25 * blink) : 'transparent', color: i === pick && f > 26 ? th.text : th.dim }}>{it}</div>)}</div>
    </div>
  </Glass>;
};

// confirm dialog over a dimmed frame
const A08: React.FC<Base & { title: string; text?: string; ok?: string; cancel?: string }> = ({ title, text, ok = 'Підтвердити', cancel = 'Скасувати', y = 700 }) => {
  const th = useTh(); const { f, p } = useLife();
  const q = pop(f, 2, 30, 14);
  const press = f > 34 ? interpolate(f, [34, 37, 42], [1, 0.92, 1], clamp) : 1;
  return <>
    <div style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, background: `rgba(4,6,8,${0.55 * p})` }} />
    <div style={{ position: 'absolute', left: 140, width: 800, top: y, padding: 44, borderRadius: 36, background: '#141B22', border: th.border, boxShadow: th.glow, fontFamily: F.body, color: th.text,
      opacity: interpolate(p, [0, 0.2], [0, 1], clamp), transform: `scale(${0.9 + 0.1 * q})` }}>
      <div style={{ fontFamily: th.title, fontWeight: 900, fontSize: 48, lineHeight: 1.1 }}>{title}</div>
      {text && <div style={{ marginTop: 16, fontSize: 32, lineHeight: 1.35, color: th.dim, fontWeight: 600 }}>{text}</div>}
      <div style={{ marginTop: 34, display: 'flex', gap: 18, justifyContent: 'flex-end' }}>
        <div style={{ padding: '18px 30px', borderRadius: 22, fontSize: 30, fontWeight: 800, color: th.dim, border: th.border }}>{cancel}</div>
        <div style={{ padding: '18px 34px', borderRadius: 22, fontSize: 30, fontWeight: 800, background: th.accent, color: INK, transform: `scale(${press})` }}>{ok}</div>
      </div>
    </div>
  </>;
};

const A10: React.FC<Base & { title?: string; items: string[]; every?: number }> = ({ title, items, every = 10, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={420} scale={scale}>
    {title && <Label>{title}</Label>}
    {items.map((it, i) => <div key={i} style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 700, color: th.text }}>
      <Check q={pop(f, 14 + i * every)} />{it}
    </div>)}
  </Glass>;
};

export const A: Reg = {
  A02: { C: A02, name: 'Меню з повзунком', demo: { title: 'Налаштування', items: ['Загальні', 'Профіль', 'Skills', 'Конектори'], pick: 2 } },
  A05: { C: A05, name: 'Вкладки', demo: { tabs: ['Чат', 'Проєкти', 'Код'], pick: 2 } },
  A07: { C: A07, name: 'Випадний список', demo: { label: 'Модель', items: ['Sonnet', 'Opus', 'Haiku'], pick: 1 } },
  A08: { C: A08, name: 'Модальне вікно', demo: { title: 'Надати доступ?', text: 'Claude зможе читати файли в цій папці' } },
  A10: { C: A10, name: 'Чекбокси', demo: { title: 'Увімкни', items: ['Пам\'ять', 'Пошук у вебі', 'Артефакти'] } },
};
