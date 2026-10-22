import React from 'react';
import { interpolate, spring } from 'remotion';
import { F, clamp } from '../theme';
import { Th, X, useLife, Side } from '../glass';

// Small shared bits of the catalog elements (Elements.tsx, el/*.tsx).
export type Reg = Record<string, { C: React.FC<any>; name: string; demo: Record<string, unknown> }>;
export const INK = '#0B0F12', WARN = '#FFD84D', DIM_LINE = 'rgba(255,255,255,.1)';
export const useTh = () => React.useContext(Th);
export const pop = (f: number, at: number, fps = 30, damping = 12) => spring({ frame: f - at, fps, config: { damping, stiffness: 170, mass: 0.7 } });
export const typed = (s: string, f: number, at: number, cps = 0.6) => s.slice(0, Math.max(0, Math.floor((f - at) * cps)));
export const Caret: React.FC<{ f: number }> = ({ f }) => { const th = useTh(); return <span style={{ color: th.accent, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }}>▍</span>; };
export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const th = useTh();
  return <div style={{ color: th.dim, fontSize: 24, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>{children}</div>;
};
export const Check: React.FC<{ q: number; size?: number; bad?: boolean }> = ({ q, size = 40, bad }) => {
  const th = useTh();
  return <span style={{ width: size, height: size, borderRadius: size * 0.3, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: q > 0.5 ? (bad ? 'rgba(255,255,255,.16)' : th.accent) : 'transparent', border: `2.5px solid ${q > 0.5 ? 'transparent' : th.dim}`,
    color: bad ? th.text : INK, fontSize: size * 0.62, fontWeight: 900, transform: `scale(${0.7 + 0.3 * q})` }}>{q > 0.5 ? (bad ? '✗' : '✓') : ''}</span>;
};
export const Spinner: React.FC<{ f: number; size?: number }> = ({ f, size = 34 }) => {
  const th = useTh();
  return <svg width={size} height={size} viewBox="0 0 34 34" style={{ transform: `rotate(${f * 14}deg)`, flexShrink: 0 }}>
    <circle cx="17" cy="17" r="13" fill="none" stroke={DIM_LINE} strokeWidth="4" />
    <circle cx="17" cy="17" r="13" fill="none" stroke={th.accent} strokeWidth="4" strokeDasharray="22 60" strokeLinecap="round" />
  </svg>;
};


// free-placed block (no glass): fades with the life curve, scaled from its top-left like Glass
export const Free: React.FC<{ side?: Side; y?: number; w: number; scale?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ side = 'center', y = 260, w, scale = 1, children, style }) => {
  const { p } = useLife();
  return <div style={{ position: 'absolute', left: X(side, w * scale), top: y, width: w, fontFamily: F.body, color: '#F5F7F2', transform: `scale(${scale}) translateY(${(1 - p) * 30}px)`,
    transformOrigin: '0 0', opacity: interpolate(p, [0, 0.2], [0, 1], clamp), ...style }}>{children}</div>;
};
// full-frame layer 1080×1920 (accents on the speaker, transitions)
export const Full: React.FC<{ children: React.ReactNode; fade?: boolean; style?: React.CSSProperties }> = ({ children, fade = true, style }) => {
  const { p } = useLife();
  return <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, fontFamily: F.body, opacity: fade ? interpolate(p, [0, 0.12], [0, 1], clamp) : 1, ...style }}>{children}</div>;
};
export const outline = (px = 8) => ({ WebkitTextStroke: `${px}px rgba(8,11,14,.85)`, paintOrder: 'stroke fill' as const, textShadow: '0 6px 22px rgba(0,0,0,.6)' });
// accent colour at a given alpha: '#C3FF55' → 'rgba(195,255,85,.12)'
export const tint = (hex: string, a: number) => {
  const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
};
