import React from 'react';
import { interpolate, random, spring } from 'remotion';
import { F, clamp, ramp } from '../theme';
import { Base, useLife } from '../glass';
import { Full, INK, Reg, useTh } from './kit';

// J. Ритм і переходи: повнокадрові накладки. Шар прозорий і не бачить відео під собою, тому
// J03/J05/J06 — це накладки (смуги, спалах із рамкою, лінія розрізу), а не справжнє розмиття чи фриз кадру.
const J01: React.FC<Base> = () => {
  const th = useTh(); const { f } = useLife();
  const p = interpolate(f, [0, 3, 26], [0, 1, 0], clamp);
  return <Full fade={false}><div style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, boxShadow: `inset 0 0 0 ${p * 16}px ${th.accent}, inset 0 0 ${p * 160}px ${th.accent}88` }} /></Full>;
};

// chapter divider: a lime curtain crosses the frame, the title holds on it
const J02: React.FC<Base & { text: string; kicker?: string }> = ({ text, kicker }) => {
  const th = useTh(); const { f, N } = useLife();
  const inn = ramp(f, 0, 10), out = ramp(f, N - 10, N);
  const x = (1 - inn) * 1080 - out * 1080;
  return <Full fade={false}><div style={{ position: 'absolute', top: 0, height: 1920, width: 1080, left: x, background: th.accent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
    {kicker && <div style={{ fontFamily: F.mono, fontSize: 40, color: INK, opacity: ramp(f, 8, 14) }}>{kicker}</div>}
    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 120, color: INK, textAlign: 'center', lineHeight: 1.05, padding: '0 84px', transform: `translateX(${(1 - ramp(f, 6, 16)) * 80}px)` }}>{text}</div>
  </div></Full>;
};

const J03: React.FC<Base & { dir?: 1 | -1 }> = ({ dir = 1 }) => {
  const { f } = useLife();
  const k = ramp(f, 0, 9, 0, 1, (x) => x);
  const a = Math.sin(k * Math.PI);
  return <Full fade={false}>
    <div style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, background: `rgba(8,11,14,${0.45 * a})` }} />
    {Array.from({ length: 22 }, (_, i) => {
      const yy = random(`j03y${i}`) * 1920, len = 300 + random(`j03l${i}`) * 700, h = 4 + random(`j03h${i}`) * 26;
      const x = dir > 0 ? -len + k * (1080 + len * 2) : 1080 + len - k * (1080 + len * 2);
      return <div key={i} style={{ position: 'absolute', top: yy, left: x, width: len, height: h, borderRadius: h, opacity: a * 0.8,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent)', filter: 'blur(3px)' }} />;
    })}
  </Full>;
};

const J04: React.FC<Base> = () => {
  const { f } = useLife();
  if (f > 5) return null;
  return <Full fade={false}>
    {Array.from({ length: 9 }, (_, i) => {
      const s = `j04${f}_${i}`, yy = random(s + 'y') * 1920, h = 20 + random(s + 'h') * 140, dx = (random(s + 'x') - 0.5) * 120;
      return <div key={i} style={{ position: 'absolute', left: dx, top: yy, width: 1080, height: h, mixBlendMode: 'screen', opacity: 0.75,
        background: i % 3 === 0 ? 'rgba(0,255,255,.5)' : i % 3 === 1 ? 'rgba(255,0,200,.45)' : 'rgba(195,255,85,.45)' }} />;
    })}
  </Full>;
};

const J05: React.FC<Base & { caption?: string }> = ({ caption }) => {
  const { f, fps } = useLife();
  const flash = interpolate(f, [0, 2, 10], [0, 1, 0], clamp);
  const q = spring({ frame: f - 4, fps, config: { damping: 13, stiffness: 120 } });
  return <Full fade={false}>
    <div style={{ position: 'absolute', left: 90, top: 330, width: 900, height: 1260, border: '36px solid #F7F5EF', borderBottomWidth: caption ? 170 : 36, borderRadius: 8,
      boxShadow: '0 30px 80px rgba(0,0,0,.6)', transform: `rotate(${-4 * q}deg) scale(${1.08 - 0.08 * q})`, opacity: Math.min(1, q * 2) }}>
      {caption && <div style={{ position: 'absolute', left: 0, right: 0, bottom: -140, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 56, color: INK }}>{caption}</div>}
    </div>
    <div style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, background: '#fff', opacity: flash }} />
  </Full>;
};

const J06: React.FC<Base & { left?: string; right?: string }> = ({ left, right }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 0, 12);
  return <Full>
    <div style={{ position: 'absolute', left: 537, top: 960 - 960 * k, width: 6, height: 1920 * k, background: th.accent, boxShadow: `0 0 20px ${th.accent}` }} />
    {[left, right].map((t, i) => t && <div key={i} style={{ position: 'absolute', top: 240, [i ? 'right' : 'left']: 60, padding: '12px 22px', borderRadius: 16, background: 'rgba(10,14,18,.8)',
      color: i ? th.accent : '#F5F7F2', fontWeight: 800, fontSize: 36, opacity: ramp(f, 8, 16) }}>{t}</div>)}
  </Full>;
};

const J07: React.FC<Base> = () => {
  const th = useTh(); const { f, N } = useLife();
  const k = ramp(f, 0, Math.min(N, 30), 0, 1, (x) => x);
  return <Full fade={false}><svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    {Array.from({ length: 10 }, (_, i) => <line key={`v${i}`} x1={i * 120 + 60} x2={i * 120 + 60} y1={-200 + k * 2320 - 600} y2={-200 + k * 2320} stroke={th.accent} strokeOpacity={0.35} strokeWidth="2" />)}
    {Array.from({ length: 16 }, (_, i) => <line key={`h${i}`} y1={i * 120 + 60} y2={i * 120 + 60} x1={1080 - k * 1680} x2={1080 - k * 1680 + 500} stroke={th.accent} strokeOpacity={0.35} strokeWidth="2" />)}
  </svg></Full>;
};

const J08: React.FC<Base & { y?: number }> = ({ y = 420 }) => {
  const th = useTh(); const { f } = useLife();
  const t = f / 30;
  const cols = [th.accent, '#F5F7F2', '#5FD38D', '#FFD84D'];
  return <Full fade={false}>
    {Array.from({ length: 70 }, (_, i) => {
      const s = `j08${i}`, a = random(s + 'a') * Math.PI * 2, v = 700 + random(s + 'v') * 900;
      const x = 540 + Math.cos(a) * v * t, yy = y + Math.sin(a) * v * t * 0.8 + 1400 * t * t;
      return <div key={i} style={{ position: 'absolute', left: x, top: yy, width: 14 + random(s + 'w') * 12, height: 8 + random(s + 'h') * 10, background: cols[i % 4],
        transform: `rotate(${t * 720 * (random(s + 'r') - 0.5)}deg)`, opacity: interpolate(t, [0.9, 1.6], [1, 0], clamp), borderRadius: 2 }} />;
    })}
  </Full>;
};

const J09: React.FC<Base> = () => {
  const { f, p } = useLife();
  const k = ramp(f, 0, 10) * p;
  return <Full fade={false}><div style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, background: `radial-gradient(ellipse 70% 55% at 50% 45%, transparent 55%, rgba(0,0,0,${0.7 * k}) 100%)` }} /></Full>;
};

const J10: React.FC<Base & { y?: number }> = ({ y = 172 }) => {
  const th = useTh(); const { f, N } = useLife();
  return <Full><div style={{ position: 'absolute', left: 84, width: 912, top: y, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.22)' }}>
    <div style={{ width: `${(f / Math.max(1, N - 1)) * 100}%`, height: '100%', borderRadius: 4, background: th.accent, boxShadow: `0 0 12px ${th.accent}88` }} /></div></Full>;
};

export const J: Reg = {
  J01: { C: J01, name: 'Удар-рамка', demo: {} },
  J02: { C: J02, name: 'Розділ «Крок 2»', demo: { kicker: 'КРОК 2', text: 'Встанови скіл' } },
  J03: { C: J03, name: 'Whip-pan (накладка)', demo: {} },
  J04: { C: J04, name: 'Глітч', demo: {} },
  J05: { C: J05, name: 'Полароїд-фриз (накладка)', demo: { caption: 'запам\'ятай' } },
  J06: { C: J06, name: 'Split-лінія', demo: { left: 'Раніше', right: 'Тепер' } },
  J07: { C: J07, name: 'Сітка ліній', demo: {} },
  J08: { C: J08, name: 'Конфеті', demo: {} },
  J09: { C: J09, name: 'Віньєтка', demo: {} },
  J10: { C: J10, name: 'Прогрес-смуга', demo: {} },
};
