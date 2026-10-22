import React from 'react';
import { spring } from 'remotion';
import { F, ramp } from '../theme';
import { Base, useLife } from '../glass';
import { Full, Reg, outline, pop, typed, useTh } from './kit';

// H. Акценти на кадрі й спікері. x/y — пікселі кадру 1080×1920.
// hand-drawn circle: slightly wobbly ellipse drawn in ~10 frames, overshoots its start like a real pen
const H02: React.FC<Base & { x?: number; r?: number }> = ({ x = 700, y = 760, r = 200 }) => {
  const th = useTh(); const { f } = useLife();
  const pts = Array.from({ length: 41 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2 - 2.2, w = 1 + 0.05 * Math.sin(i * 1.7);
    return `${x + Math.cos(a) * r * 1.12 * w} ${y + Math.sin(a) * r * 0.92 * w}`;
  });
  return <Full><svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 3px 8px rgba(0,0,0,.5))' }}>
    <path d={`M${pts.join(' L')}`} fill="none" stroke={th.accent} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(f, 2, 13)} />
  </svg></Full>;
};

// marker underline under a big key word
const H03: React.FC<Base & { text: string }> = ({ text, y = 330 }) => {
  const th = useTh(); const { f } = useLife();
  const k = ramp(f, 8, 20);
  return <Full><div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}>
    <div style={{ position: 'relative', fontFamily: F.display, fontWeight: 900, fontSize: 104, lineHeight: 1.1, color: '#F5F7F2', ...outline(10) }}>
      <div style={{ position: 'absolute', left: -14, bottom: 4, height: 34, width: `calc(${k * 100}% + 28px)`, background: th.accent, borderRadius: 8, transform: 'skewX(-8deg) rotate(-1deg)', zIndex: -1, opacity: 0.95 }} />
      {text}
    </div>
  </div></Full>;
};

// loupe ring: the overlay can't magnify the video under it — pair with edit.zooms on the same spot
const H04: React.FC<Base & { x?: number; r?: number; label?: string }> = ({ x = 540, y = 900, r = 180, label }) => {
  const th = useTh(); const { f } = useLife();
  const q = pop(f, 0, 30, 13);
  return <Full>
    <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `10px solid ${th.accent}`, transform: `scale(${q})`,
      boxShadow: `0 0 0 6px rgba(8,11,14,.6), 0 20px 50px rgba(0,0,0,.5), inset 0 0 40px rgba(255,255,255,.15)` }} />
    <div style={{ position: 'absolute', left: x + r * 0.62, top: y + r * 0.62, width: 30, height: r * 0.9, borderRadius: 15, background: th.accent, transform: `rotate(-45deg) scale(${q})`, transformOrigin: '50% 0' }} />
    {label && <div style={{ position: 'absolute', left: x - 300, width: 600, top: y - r - 90, textAlign: 'center', fontWeight: 800, fontSize: 48, color: '#F5F7F2', ...outline(), opacity: ramp(f, 8, 16) }}>{label}</div>}
  </Full>;
};

const H05: React.FC<Base & { x?: number; r?: number }> = ({ x = 700, y = 760, r = 260 }) => {
  const { f, p } = useLife();
  const k = ramp(f, 0, 12);
  return <Full fade={false}><div style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: p,
    background: `radial-gradient(circle at ${x}px ${y}px, transparent ${r * (1.6 - 0.6 * k)}px, rgba(4,6,8,${0.78 * k}) ${r * (1.6 - 0.6 * k) + 90}px)` }} /></Full>;
};

const H07: React.FC<Base & { text: string; x?: number }> = ({ text, x = 760, y = 380 }) => {
  const th = useTh(); const { f } = useLife();
  const dots = [0, 1, 2].map((i) => pop(f, i * 4, 30, 11));
  const cloud = pop(f, 12, 30, 11);
  return <Full>
    {[[x - 150, y + 290, 22], [x - 110, y + 240, 32], [x - 60, y + 180, 44]].map(([dx, dy, s], i) =>
      <div key={i} style={{ position: 'absolute', left: dx - s / 2, top: dy - s / 2, width: s, height: s, borderRadius: s, background: '#F5F7F2', transform: `scale(${dots[i]})`, boxShadow: '0 6px 16px rgba(0,0,0,.4)' }} />)}
    <div style={{ position: 'absolute', left: x - 260, top: y - 80, width: 440, padding: '36px 40px', borderRadius: 120, background: '#F5F7F2', color: '#0B0F12', textAlign: 'center',
      fontWeight: 800, fontSize: 38, lineHeight: 1.25, transform: `scale(${cloud})`, transformOrigin: '30% 100%', boxShadow: '0 16px 40px rgba(0,0,0,.45)' }}>{typed(text, f, 18, 1.2)}<span style={{ opacity: 0 }}>{text.slice(Math.max(0, Math.floor((f - 18) * 1.2)))}</span></div>
  </Full>;
};

const H08: React.FC<Base & { glyph?: string; x?: number }> = ({ glyph = '?', x = 860, y = 400 }) => {
  const th = useTh(); const { f, fps } = useLife();
  const drop = spring({ frame: f, fps, config: { damping: 6, stiffness: 140, mass: 0.8 } });
  return <Full><div style={{ position: 'absolute', left: x - 90, top: y - 120, width: 180, textAlign: 'center', fontFamily: F.display, fontWeight: 900, fontSize: 220, lineHeight: 1,
    color: th.accent, ...outline(12), transform: `translateY(${(1 - drop) * -500}px) rotate(${Math.sin(f / 6) * 6}deg)` }}>{glyph}</div></Full>;
};

// camera viewfinder: corners slide in, blinking REC
const H09: React.FC<Base & { inset?: number }> = ({ inset = 110 }) => {
  const { f } = useLife();
  const k = 1 - ramp(f, 0, 14);
  const L = 120, T = 10, off = inset + k * 160;
  const corner = (sx: number, sy: number) => <div style={{ position: 'absolute', [sx ? 'right' : 'left']: off, [sy ? 'bottom' : 'top']: off + (sy ? 180 : 130), width: L, height: L,
    [sx ? 'borderRight' : 'borderLeft']: `${T}px solid #F5F7F2`, [sy ? 'borderBottom' : 'borderTop']: `${T}px solid #F5F7F2`, borderRadius: 6, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.6))' }} />;
  return <Full>
    {corner(0, 0)}{corner(1, 0)}{corner(0, 1)}{corner(1, 1)}
    <div style={{ position: 'absolute', left: off + 30, top: off + 160, display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.mono, fontSize: 36, color: '#F5F7F2', ...outline(6) }}>
      <span style={{ width: 24, height: 24, borderRadius: 12, background: '#FF4D4D', opacity: Math.floor(f / 12) % 2 ? 0.25 : 1 }} />REC</div>
  </Full>;
};

const H10: React.FC<Base & { name: string; role?: string }> = ({ name, role, y = 1330 }) => {
  const th = useTh(); const { f } = useLife();
  const bar = ramp(f, 0, 12);
  return <Full><div style={{ position: 'absolute', left: 84, top: y }}>
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      <div style={{ width: 12, background: th.accent, borderRadius: 6, transform: `scaleY(${bar})` }} />
      <div style={{ marginLeft: 18, padding: '18px 28px', borderRadius: 18, background: 'rgba(10,14,18,.86)', clipPath: `inset(0 ${(1 - ramp(f, 4, 16)) * 100}% 0 0)` }}>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 52, color: '#F5F7F2' }}>{typed(name, f, 8, 1.2)}</div>
        {role && <div style={{ marginTop: 6, fontSize: 30, fontWeight: 700, color: th.accent, opacity: ramp(f, 14, 22) }}>{role}</div>}
      </div>
    </div>
  </div></Full>;
};

export const H: Reg = {
  H02: { C: H02, name: 'Обведення від руки', demo: { x: 700, y: 760, r: 190 } },
  H03: { C: H03, name: 'Маркер під словом', demo: { text: 'Скіли' } },
  H04: { C: H04, name: 'Лупа (рамка)', demo: { x: 300, y: 1000, r: 170, label: 'дрібний текст' } },
  H05: { C: H05, name: 'Прожектор', demo: { x: 700, y: 760, r: 240 } },
  H07: { C: H07, name: 'Думка-бульбашка', demo: { text: 'а що як це автоматизувати?' } },
  H08: { C: H08, name: 'Знак питання', demo: { glyph: '?' } },
  H09: { C: H09, name: 'Видошукач REC', demo: {} },
  H10: { C: H10, name: 'Ім\'я-плашка', demo: { name: 'Вадим Гук', role: 'DevGuide' } },
};

