import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { F, clamp } from './theme';

// Shared pieces of the glass cards (Cards.tsx, Elements.tsx): themes, life curve, side placement, Glass panel.
export type Side = 'left' | 'right' | 'center';
export type Base = { t: number; dur: number; side?: Side; y?: number; scale?: number };

export type T = { bg: string; border: string; glow: string; accent: string; text: string; dim: string; chip: string; title: string };
export const THEMES: Record<'dg' | 'glow', T> = {
  dg: { bg: 'linear-gradient(160deg, rgba(22,30,38,.86), rgba(10,14,18,.9))', border: '1.5px solid rgba(255,255,255,.14)',
    glow: '0 30px 70px rgba(0,0,0,.55), 0 0 0 1px rgba(195,255,85,.06)', accent: '#C3FF55', text: '#F5F7F2', dim: '#AEB8C1',
    chip: 'rgba(195,255,85,.12)', title: F.display },
  glow: { bg: 'linear-gradient(160deg, rgba(150,24,110,.9), rgba(52,10,70,.92))', border: '2px solid rgba(255,110,220,.9)',
    glow: '0 0 34px rgba(255,70,210,.55), 0 30px 70px rgba(20,0,30,.6), inset 0 1px 0 rgba(255,255,255,.35)', accent: '#FFD1F4', text: '#FFFFFF',
    dim: '#F2C6EC', chip: 'rgba(255,255,255,.14)', title: F.display },
};
export const Th = React.createContext<T>(THEMES.dg);

// spring in, quick ease-in out (exit faster than entry, as in the TZ)
export const useLife = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames: N } = useVideoConfig();
  const inn = spring({ frame: f, fps, config: { damping: 14, stiffness: 130, mass: 0.8 } });
  const out = interpolate(f, [N - 10, N], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { f, fps, N, p: inn * (1 - out), out };
};

// side cards are drawn at 88%: the speaker usually sits a bit right of centre, the free strip on the left is ~400 px
export const CARD_SCALE = 0.88;
export const X = (side: Side = 'left', w: number) => (side === 'left' ? 24 : side === 'center' ? 540 - w / 2 : 1056 - w);

export const Glass: React.FC<{ side?: Side; y?: number; w: number; children: React.ReactNode; tilt?: number; scale?: number; style?: React.CSSProperties }> = ({ side = 'left', y = 260, w, children, tilt, scale = CARD_SCALE, style }) => {
  const th = React.useContext(Th);
  const { p } = useLife();
  const dir = side === 'left' ? -1 : 1;
  const rz = tilt ?? dir * 3;
  return <div style={{ position: 'absolute', left: X(side, w * scale), top: y, width: w, padding: 30, borderRadius: 34, background: th.bg,
    border: th.border, boxShadow: th.glow, backdropFilter: 'blur(18px)', color: th.text, fontFamily: F.body,
    opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
    transformOrigin: '0 0',
    transform: `translateX(${(1 - p) * dir * 120}px) translateY(${(1 - p) * 30}px) rotateZ(${rz * p}deg) scale(${scale * (0.85 + 0.15 * p)})`, ...style }}>{children}</div>;
};

export const Icon: React.FC<{ size?: number; glyph?: string }> = ({ size = 72, glyph = '✦' }) => {
  const th = React.useContext(Th);
  return <div style={{ width: size, height: size, borderRadius: size * 0.28, background: th.chip, border: th.border, display: 'flex', flexShrink: 0,
    alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, color: th.accent, fontFamily: F.display, fontWeight: 900 }}>{glyph}</div>;
};
