import React from 'react';
import { interpolate, random, spring } from 'remotion';
import { F, clamp, ramp } from '../theme';
import { Base, Glass, useLife } from '../glass';
import { Free, Full, INK, Reg, outline, pop, typed, useTh } from './kit';

// I. Соцмережі й залучення. Коментарі й опитування — лише справжні.
const WHITE = '#F5F7F2';

const I02: React.FC<Base & { from?: string; text: string }> = ({ from = 'DevGuide bot', text, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const typing = f < 26;
  return <Glass side={side} y={y} w={440} scale={scale} tilt={0} style={{ padding: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: 28, background: `linear-gradient(135deg, ${th.accent}, #4FB286)` }} />
      <div><div style={{ fontSize: 26, fontWeight: 800 }}>{from}</div><div style={{ fontSize: 20, color: th.dim, fontWeight: 600 }}>Direct · зараз</div></div>
    </div>
    <div style={{ marginTop: 16, display: 'inline-block', padding: '16px 22px', borderRadius: '24px 24px 24px 6px', background: 'rgba(255,255,255,.12)', fontSize: 28, lineHeight: 1.35, fontWeight: 600 }}>
      {typing ? [0, 1, 2].map((i) => <span key={i} style={{ display: 'inline-block', margin: '0 3px', color: th.dim, transform: `translateY(${-6 * Math.max(0, Math.sin((f - i * 4) / 4))}px)` }}>●</span>)
        : <span style={{ opacity: ramp(f, 26, 32) }}>{text}</span>}
    </div>
  </Glass>;
};

const I03: React.FC<Base & { label?: string }> = ({ label = 'Збережи, знадобиться', side = 'center', y = 1150 }) => {
  const th = useTh(); const { f } = useLife();
  const at = 18, press = interpolate(f, [at, at + 3, at + 9, at + 15], [1, 0.82, 1.08, 1], clamp);
  const on = f >= at;
  return <Free side={side} w={600} y={y} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
    <svg width="150" height="170" viewBox="0 0 24 28" style={{ transform: `scale(${press})`, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,.5))' }}>
      <path d="M4 2 H20 a1 1 0 0 1 1 1 V26 L12 20 L3 26 V3 a1 1 0 0 1 1 -1Z" fill={on ? th.accent : 'none'} stroke={on ? th.accent : WHITE} strokeWidth="2" strokeLinejoin="round" />
    </svg>
    <div style={{ fontWeight: 800, fontSize: 46, ...outline(), opacity: ramp(f, 20, 28) }}>{label}</div>
  </Free>;
};

// heart pops with seeded particles
const I04: React.FC<Base & { x?: number }> = ({ x = 800, y = 520 }) => {
  const th = useTh(); const { f, fps } = useLife();
  const q = spring({ frame: f, fps, config: { damping: 7, stiffness: 200, mass: 0.6 } });
  const burst = ramp(f, 4, 22);
  return <Full>
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + random(`i04a${i}`) * 0.5, d = 90 + random(`i04d${i}`) * 90;
      return <div key={i} style={{ position: 'absolute', left: x + Math.cos(a) * d * burst - 9, top: y + Math.sin(a) * d * burst - 9, width: 18, height: 18, borderRadius: 9,
        background: i % 2 ? th.accent : WHITE, opacity: 1 - burst, transform: `scale(${1 - burst * 0.5})` }} />;
    })}
    <div style={{ position: 'absolute', left: x - 90, top: y - 90, width: 180, height: 180, fontSize: 150, lineHeight: '180px', textAlign: 'center', transform: `scale(${q})`, filter: 'drop-shadow(0 8px 18px rgba(0,0,0,.5))' }}>💚</div>
  </Full>;
};

const I05: React.FC<Base & { user: string; text: string; likes?: number }> = ({ user, text, likes, side, y, scale }) => {
  return <Glass side={side} y={y} w={460} scale={scale} tilt={-2} style={{ background: 'rgba(250,250,250,.96)', color: INK, border: 'none', padding: 26 }}>
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: 58, height: 58, borderRadius: 29, flexShrink: 0, background: 'linear-gradient(135deg,#C9D2DA,#8E9AA6)' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{user} <span style={{ color: '#8A9097', fontWeight: 600 }}>· 2 год</span></div>
        <div style={{ marginTop: 6, fontSize: 28, lineHeight: 1.35, fontWeight: 600 }}>{text}</div>
        <div style={{ marginTop: 10, fontSize: 21, color: '#8A9097', fontWeight: 700 }}>Відповісти</div>
      </div>
      {likes != null && <div style={{ textAlign: 'center', fontSize: 22, color: '#8A9097', fontWeight: 700 }}>♡<br />{likes}</div>}
    </div>
  </Glass>;
};

const I06: React.FC<Base & { q: string; a: string; b: string; pa: number }> = ({ q, a, b, pa, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 16, 36);
  const row = (t: string, pct: number, win: boolean) => <div style={{ position: 'relative', marginTop: 14, height: 66, borderRadius: 18, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct * k}%`, background: win ? th.accent : 'rgba(255,255,255,.2)' }} />
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', fontSize: 27, fontWeight: 800, color: win && k > 0.5 ? INK : th.text }}>
      <span>{t}</span><span style={{ color: th.text, textShadow: '0 2px 6px rgba(0,0,0,.6)' }}>{Math.round(pct * k)}%</span></div>
  </div>;
  return <Glass side={side} y={y} w={440} scale={scale} tilt={0}>
    <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.25 }}>{q}</div>
    {row(a, pa, pa >= 50)}{row(b, 100 - pa, pa < 50)}
  </Glass>;
};

const I07: React.FC<Base & { text?: string; dir?: 'down' | 'up' }> = ({ text = 'Посилання в описі', dir = 'down', y = 1300 }) => {
  const th = useTh(); const { f } = useLife();
  const bob = Math.sin(f / 5) * 14;
  return <Full><div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    <div style={{ fontWeight: 800, fontSize: 50, color: WHITE, ...outline() }}>{text}</div>
    <div style={{ fontSize: 110, lineHeight: 1, color: th.accent, transform: `translateY(${bob}px) rotate(${dir === 'up' ? 180 : 0}deg)`, ...outline(8) }}>↓</div>
  </div></Full>;
};

// "part 2" teaser card slides in like the next page
const I08: React.FC<Base & { text: string; part?: string }> = ({ text, part = 'Частина 2', y = 700 }) => {
  const th = useTh(); const { f, fps } = useLife();
  const q = spring({ frame: f, fps, config: { damping: 15, stiffness: 110 } });
  return <Full><div style={{ position: 'absolute', left: 140, width: 800, top: y, padding: '40px 44px', borderRadius: 36, background: '#141B22', border: `2.5px solid ${th.accent}`,
    boxShadow: '0 30px 70px rgba(0,0,0,.55)', transform: `translateX(${(1 - q) * 900}px) rotate(${(1 - q) * 6}deg)` }}>
    <div style={{ fontFamily: F.mono, fontSize: 30, color: th.accent }}>{part} →</div>
    <div style={{ marginTop: 14, fontFamily: F.display, fontWeight: 900, fontSize: 56, lineHeight: 1.1, color: WHITE }}>{text}</div>
  </div></Full>;
};

const I09: React.FC<Base & { label?: string; done?: string }> = ({ label = 'Підписатися', done = '✓ Підписано', side = 'center', y = 1200 }) => {
  const th = useTh(); const { f } = useLife();
  const at = 22, on = f >= at;
  const fly = ramp(f, 4, at);
  const press = interpolate(f, [at, at + 3, at + 9], [1, 0.9, 1], clamp);
  return <Free side={side} w={560} y={y} style={{ display: 'flex', justifyContent: 'center' }}>
    <div style={{ position: 'relative', padding: '28px 60px', borderRadius: 50, fontWeight: 800, fontSize: 44, background: on ? 'rgba(255,255,255,.15)' : th.accent, color: on ? WHITE : INK,
      border: on ? '2px solid rgba(255,255,255,.4)' : 'none', transform: `scale(${press})`, boxShadow: '0 20px 50px rgba(0,0,0,.45)' }}>{on ? done : label}
      <svg width="70" height="70" viewBox="0 0 24 24" style={{ position: 'absolute', right: interpolate(fly, [0, 1], [-200, -40]), top: interpolate(fly, [0, 1], [170, 64]) - Math.sin(fly * Math.PI) * 50, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.6))' }}>
        <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.8 L11.5 14 L18 14 Z" fill="#fff" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" /></svg>
    </div>
  </Free>;
};

const I10: React.FC<Base & { url?: string; label?: string }> = ({ url = 'devguide.com.ua', label, y = 820 }) => {
  const th = useTh(); const { f } = useLife();
  const t = typed(url, f, 4, 0.8), done = 4 + url.length / 0.8;
  return <Full><div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {label && <div style={{ fontWeight: 800, fontSize: 44, color: WHITE, ...outline(), marginBottom: 14, opacity: ramp(f, 0, 8) }}>{label}</div>}
    <div style={{ position: 'relative', fontFamily: F.display, fontWeight: 900, fontSize: 76, color: th.accent, ...outline(10) }}>{t}<span style={{ opacity: 0 }}>{url.slice(t.length)}</span>
      <div style={{ position: 'absolute', left: 0, bottom: -10, height: 10, borderRadius: 5, background: th.accent, width: `${ramp(f, done, done + 10) * 100}%` }} /></div>
  </div></Full>;
};

export const I: Reg = {
  I02: { C: I02, name: 'Повідомлення в Direct', demo: { text: 'Тримай гайд по скілах 👇' } },
  I03: { C: I03, name: 'Зберегти', demo: {} },
  I04: { C: I04, name: 'Лайк-вибух', demo: {} },
  I05: { C: I05, name: 'Коментар (лише реальний)', demo: { user: 'глядач', text: 'Приклад тексту коментаря' } },
  I06: { C: I06, name: 'Опитування', demo: { q: 'Ти вже пробував скіли?', a: 'Так', b: 'Ще ні', pa: 35 } },
  I07: { C: I07, name: 'Дивись опис ↓', demo: {} },
  I08: { C: I08, name: 'Частина 2', demo: { text: 'Як написати свій скіл' } },
  I09: { C: I09, name: 'Підписатися', demo: {} },
  I10: { C: I10, name: 'Адреса сайту', demo: { label: 'Весь шлях тут' } },
};
