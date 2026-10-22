import React from 'react';
import { interpolate, spring } from 'remotion';
import { F, clamp, ramp } from '../theme';
import { Base, Glass, useLife } from '../glass';
import { Check, INK, Label, Reg, pop, useTh, tint } from './kit';

// B. Картки й вікна
// app window unfolding from its centre, macOS chrome + sidebar skeleton
const B03: React.FC<Base & { title: string; items?: string[] }> = ({ title, items = [], side, y, scale }) => {
  const th = useTh(); const { f, fps } = useLife();
  const q = spring({ frame: f, fps, config: { damping: 15, stiffness: 120 } });
  return <Glass side={side} y={y} w={470} scale={scale} tilt={0} style={{ padding: 0, overflow: 'hidden', clipPath: `inset(${(1 - q) * 45}% ${(1 - q) * 45}% round 34px)` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: th.border, background: 'rgba(255,255,255,.05)' }}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
      <span style={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 700, color: th.dim, marginRight: 60 }}>{title}</span>
    </div>
    <div style={{ display: 'flex', minHeight: 230 }}>
      <div style={{ width: 150, padding: 18, borderRight: th.border, background: 'rgba(0,0,0,.2)' }}>
        {(items.length ? items : ['', '', '', '']).map((it, i) => <div key={i} style={{ marginBottom: 14, fontSize: 21, fontWeight: 700, color: i === 0 ? th.accent : th.dim, opacity: ramp(f, 10 + i * 3, 16 + i * 3),
          height: it ? 'auto' : 14, borderRadius: 7, background: it ? 'transparent' : 'rgba(255,255,255,.12)' }}>{it}</div>)}
      </div>
      <div style={{ flex: 1, padding: 22 }}>
        {[0.9, 0.6, 0.75, 0.5].map((w, i) => <div key={i} style={{ height: i ? 14 : 26, marginBottom: 16, borderRadius: 8, background: i ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.25)', width: `${w * 100 * ramp(f, 14 + i * 3, 26 + i * 3)}%` }} />)}
      </div>
    </div>
  </Glass>;
};

// pricing card: the price counts up. Only real prices go into reels.
const B05: React.FC<Base & { plan: string; price: number; currency?: string; period?: string; items: string[] }> = ({ plan, price, currency = '$', period = '/міс', items, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const v = Math.round(interpolate(f, [6, 30], [0, price], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  return <Glass side={side} y={y} w={400} scale={scale} style={{ border: `2.5px solid ${th.accent}` }}>
    <Label>{plan}</Label>
    <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 84, color: th.text, fontVariantNumeric: 'tabular-nums' }}>{currency}{v}</span>
      <span style={{ fontSize: 26, color: th.dim, fontWeight: 700 }}>{period}</span>
    </div>
    {items.map((it, i) => <div key={i} style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', fontSize: 26, fontWeight: 700 }}><Check q={pop(f, 24 + i * 6)} size={32} />{it}</div>)}
  </Glass>;
};

const B06: React.FC<Base & { name: string; role?: string; initials?: string }> = ({ name, role, initials, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const a = pop(f, 2, 30, 10);
  return <Glass side={side} y={y} w={420} scale={scale}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <div style={{ width: 110, height: 110, borderRadius: 55, flexShrink: 0, background: `linear-gradient(135deg, ${th.accent}, #4FB286)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: F.display, fontWeight: 900, fontSize: 40, color: INK, transform: `scale(${a})`, boxShadow: `0 0 0 6px ${tint(th.accent, .2)}` }}>{initials ?? name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
      <div style={{ opacity: ramp(f, 10, 18), transform: `translateX(${(1 - ramp(f, 10, 18)) * 20}px)` }}>
        <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1 }}>{name}</div>
        {role && <div style={{ fontSize: 25, color: th.dim, marginTop: 6, fontWeight: 600 }}>{role}</div>}
      </div>
    </div>
  </Glass>;
};

// folder tree: indent with two leading spaces per level, a trailing "/" marks a folder
const B08: React.FC<Base & { items: string[] }> = ({ items, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={430} scale={scale}>
    {items.map((raw, i) => {
      const lvl = (raw.match(/^ */)?.[0].length ?? 0) / 2, name = raw.trim(), dir = name.endsWith('/');
      const q = ramp(f, 6 + i * 5, 14 + i * 5);
      return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: i ? 10 : 0, paddingLeft: lvl * 32, fontFamily: F.mono, fontSize: 26, opacity: q,
        color: dir ? th.accent : th.text, transform: `translateX(${(1 - q) * -20}px)` }}>
        {lvl > 0 && <span style={{ color: th.dim }}>└</span>}<span>{dir ? '📁' : '📄'}</span>{name}
      </div>;
    })}
  </Glass>;
};

const B10: React.FC<Base & { text: string; title?: string }> = ({ text, title = 'Лайфхак', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const glow = ramp(f, 10, 22);
  return <Glass side={side} y={y} w={420} scale={scale}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ fontSize: 50, filter: `grayscale(${1 - glow}) drop-shadow(0 0 ${glow * 18}px ${th.accent})` }}>💡</span>
      <Label>{title}</Label>
    </div>
    <div style={{ marginTop: 14, fontSize: 30, lineHeight: 1.35, fontWeight: 700, opacity: ramp(f, 14, 24) }}>{text}</div>
  </Glass>;
};

export const B: Reg = {
  B03: { C: B03, name: 'Вікно застосунку', demo: { title: 'Claude', items: ['Чати', 'Проєкти', 'Skills', 'Код'] } },
  B05: { C: B05, name: 'Тариф', demo: { plan: 'Тариф (приклад)', price: 20, items: ['пункт 1', 'пункт 2', 'пункт 3'] } },
  B06: { C: B06, name: 'Профіль', demo: { name: 'Вадим Гук', role: 'DevGuide' } },
  B08: { C: B08, name: 'Дерево файлів', demo: { items: ['my-skill/', '  SKILL.md', '  scripts/', '    run.mjs', '  assets/'] } },
  B10: { C: B10, name: 'Порада', demo: { text: 'Попроси Claude самого написати скіл з цієї розмови' } },
};
