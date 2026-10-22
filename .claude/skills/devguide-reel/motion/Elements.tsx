import React from 'react';
import { interpolate, spring } from 'remotion';
import { F, clamp, ramp } from './theme';
import { Base, Glass, Icon, X, useLife } from './glass';
import { Caret, Check, DIM_LINE, INK, Label, Reg, Spinner, WARN, pop, typed, useTh } from './el/kit';
import { A } from './el/A';
import { B } from './el/B';
import { C } from './el/C';
import { D } from './el/D';
import { E } from './el/E';
import { Fg } from './el/F';
import { G } from './el/G';
import { H } from './el/H';
import { I } from './el/I';
import { J } from './el/J';

// Catalog elements by code (docs/ELEMENTS.md). edit.json: {"at": 12.3, "dur": 3, "type": "E01", "to": 100, "label": "…"}.
// Every element: frame-driven, enters with the shared life curve, sits in the free strip beside the speaker (side/y/scale).
type Code = `${'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'}${number}`;
export type ElementCard = Base & { type: Code } & Record<string, unknown>;

// ---------- A. навігація ----------
const A03: React.FC<Base & { label: string; sub?: string; at?: number }> = ({ label, sub, at = 14, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const q = pop(f, at);
  return <Glass side={side} y={y} w={430} scale={scale}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15 }}>{label}</div>
        {sub && <div style={{ color: th.dim, fontSize: 22, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
      </div>
      <div style={{ width: 104, height: 58, borderRadius: 29, flexShrink: 0, background: q > 0.5 ? th.accent : 'rgba(255,255,255,.18)',
        boxShadow: q > 0.5 ? `0 0 ${24 * q}px ${th.accent}88` : 'none', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 5, left: 5 + 46 * q, width: 48, height: 48, borderRadius: 24, background: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,.4)' }} />
      </div>
    </div>
  </Glass>;
};

// cursor flies on an arc to the button, presses, ripple
const A04: React.FC<Base & { label: string; at?: number }> = ({ label, at = 22, side = 'center', y = 1180, scale = 1 }) => {
  const th = useTh(); const { f, p } = useLife();
  const fly = ramp(f, 4, at);
  const press = interpolate(f, [at, at + 3, at + 9], [1, 0.9, 1], clamp);
  const ring = ramp(f, at, at + 16);
  const on = f >= at;
  const w = 440, x = X(side, w * scale);
  return <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `scale(${scale})`, transformOrigin: '0 0', opacity: interpolate(p, [0, 0.2], [0, 1], clamp) }}>
    <div style={{ position: 'relative', margin: '0 auto', width: 'fit-content', padding: '26px 54px', borderRadius: 44, fontFamily: F.body, fontWeight: 800, fontSize: 38,
      background: on ? th.accent : th.bg, color: on ? INK : th.text, border: on ? 'none' : th.border, boxShadow: th.glow, transform: `scale(${press})` }}>
      {label}
      {on && <div style={{ position: 'absolute', inset: -4, borderRadius: 48, border: `4px solid ${th.accent}`, opacity: 1 - ring, transform: `scale(${1 + ring * 0.35})` }} />}
    </div>
    <svg width="64" height="64" viewBox="0 0 24 24" style={{ position: 'absolute', left: interpolate(fly, [0, 1], [380, 250]), top: interpolate(fly, [0, 1], [190, 70]) - Math.sin(fly * Math.PI) * 60,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.6))', transform: `scale(${press})` }}>
      <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.8 L11.5 14 L18 14 Z" fill="#fff" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  </div>;
};

const A06: React.FC<Base & { query: string; hints?: string[]; placeholder?: string }> = ({ query, hints = [], placeholder = 'Пошук', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const t = typed(query, f, 8);
  const done = 8 + query.length / 0.6;
  return <Glass side={side} y={y} w={440} scale={scale} tilt={0}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 22, background: 'rgba(255,255,255,.08)', border: th.border, fontSize: 30, fontWeight: 600 }}>
      <span style={{ fontSize: 28 }}>🔍</span>
      <span style={{ color: t ? th.text : th.dim }}>{t || placeholder}</span>{f < done + 6 && <Caret f={f} />}
    </div>
    {hints.map((h, i) => {
      const q = pop(f, done + 4 + i * 4, 30, 15);
      return <div key={i} style={{ marginTop: 10, padding: '12px 20px', borderRadius: 16, fontSize: 27, fontWeight: 600, opacity: q, transform: `translateY(${(1 - q) * -14}px)`,
        background: i === 0 && q > 0.9 ? th.chip : 'transparent', color: i === 0 ? th.text : th.dim, borderLeft: i === 0 ? `4px solid ${th.accent}` : '4px solid transparent' }}>{h}</div>;
    })}
  </Glass>;
};

const A09: React.FC<Base & { text: string }> = ({ text, y = 210 }) => {
  const th = useTh(); const { p } = useLife();
  return <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
    transform: `translateY(${(1 - p) * -60}px)` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 30px 18px 20px', borderRadius: 40, background: th.bg, border: th.border, boxShadow: th.glow,
      fontFamily: F.body, fontWeight: 800, fontSize: 34, color: th.text }}>
      <Check q={1} size={44} />{text}
    </div>
  </div>;
};

// ---------- B. картки й вікна ----------
const B02: React.FC<Base & { url: string; title?: string }> = ({ url, title, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const u = typed(url, f, 6, 0.9);
  const body = ramp(f, 8 + url.length / 0.9, 20 + url.length / 0.9);
  return <Glass side={side} y={y} w={460} scale={scale} tilt={0} style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 20px', background: 'rgba(255,255,255,.06)', borderBottom: th.border }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 16, height: 16, borderRadius: 8, background: 'rgba(255,255,255,.28)' }} />)}
      <div style={{ flex: 1, marginLeft: 8, padding: '8px 16px', borderRadius: 14, background: 'rgba(0,0,0,.35)', fontFamily: F.mono, fontSize: 22, color: th.dim, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <span style={{ color: th.accent }}>🔒 </span>{u}{body < 0.1 && <Caret f={f} />}
      </div>
    </div>
    <div style={{ padding: 28, opacity: body }}>
      {title && <div style={{ fontFamily: th.title, fontWeight: 900, fontSize: 38, lineHeight: 1.1 }}>{title}</div>}
      {[0.92, 0.7, 0.8].map((wd, i) => <div key={i} style={{ marginTop: 16, height: 16, borderRadius: 8, background: 'rgba(255,255,255,.14)', width: `${wd * 100 * ramp(f, 14 + url.length / 0.9 + i * 4, 30 + url.length / 0.9 + i * 4)}%` }} />)}
      <div style={{ marginTop: 22, width: 160, height: 44, borderRadius: 22, background: th.accent, opacity: ramp(f, 30 + url.length / 0.9, 38 + url.length / 0.9) }} />
    </div>
  </Glass>;
};

const B04: React.FC<Base & { term: string; def: string }> = ({ term, def, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const words = def.split(' ');
  return <Glass side={side} y={y} w={430} scale={scale}>
    <Label>це</Label>
    <div style={{ fontFamily: th.title, fontWeight: 900, fontSize: 56, lineHeight: 1.05, color: th.accent, marginTop: 8 }}>{term}</div>
    <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: th.accent, width: 120 * ramp(f, 8, 20) }} />
    <div style={{ marginTop: 20, fontSize: 30, lineHeight: 1.35, fontWeight: 600 }}>
      {words.map((w, i) => <span key={i} style={{ opacity: ramp(f, 14 + i * 2.5, 20 + i * 2.5) }}>{w} </span>)}
    </div>
  </Glass>;
};

const B07: React.FC<Base & { name: string; size?: string }> = ({ name, size, side, y, scale }) => {
  const th = useTh(); const { f, fps } = useLife();
  const drop = spring({ frame: f - 4, fps, config: { damping: 9, stiffness: 160 } });
  const ext = (name.split('.').pop() ?? '').toUpperCase();
  return <Glass side={side} y={y} w={420} scale={scale} tilt={0}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <div style={{ position: 'relative', width: 96, height: 120, flexShrink: 0, transform: `translateY(${(1 - drop) * -80}px)` }}>
        <svg width="96" height="120" viewBox="0 0 96 120"><path d="M8 4 H62 L90 32 V112 a6 6 0 0 1 -6 6 H8 a6 6 0 0 1 -6 -6 V10 a6 6 0 0 1 6 -6Z" fill="rgba(255,255,255,.1)" stroke={th.accent} strokeWidth="3" />
          <path d="M62 4 V32 H90" fill="none" stroke={th.accent} strokeWidth="3" /></svg>
        <div style={{ position: 'absolute', left: 0, right: 6, top: 62, textAlign: 'center', fontFamily: F.mono, fontWeight: 500, fontSize: ext.length > 3 ? 18 : 24, color: th.accent }}>{ext}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: F.mono, fontSize: 30, fontWeight: 500, wordBreak: 'break-all' }}>{name}</div>
        {size && <div style={{ color: th.dim, fontSize: 24, marginTop: 8, fontWeight: 600, opacity: ramp(f, 14, 22) }}>{size}</div>}
      </div>
    </div>
  </Glass>;
};

const B09: React.FC<Base & { text: string; title?: string }> = ({ text, title = 'Увага', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const shake = Math.sin(f * 1.6) * 10 * interpolate(f, [10, 26], [1, 0], clamp) * (f > 10 ? 1 : 0);
  return <Glass side={side} y={y} w={430} scale={scale} tilt={0} style={{ border: `2.5px solid ${WARN}`, boxShadow: `0 0 30px ${WARN}44, ${th.glow}`, marginLeft: shake }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: WARN, fontWeight: 800, fontSize: 30, textTransform: 'uppercase', letterSpacing: '.04em' }}>
      <span style={{ fontSize: 40 }}>⚠</span>{title}
    </div>
    <div style={{ marginTop: 16, fontSize: 30, lineHeight: 1.35, fontWeight: 600 }}>{text}</div>
  </Glass>;
};

// ---------- C. AI ----------
const C02: React.FC<Base & { text?: string; done?: string; at?: number }> = ({ text = 'Claude думає', done = 'Готово', at, side, y, scale }) => {
  const th = useTh(); const { f, N } = useLife();
  const end = at ?? Math.round(N * 0.6);
  const ok = pop(f, end);
  return <Glass side={side} y={y} w={400} scale={scale}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <Icon size={60} />
      {f < end
        ? <div style={{ fontSize: 30, fontWeight: 700 }}>{text}<span style={{ marginLeft: 8 }}>{[0, 1, 2].map((i) =>
          <span key={i} style={{ display: 'inline-block', color: th.accent, transform: `translateY(${-8 * Math.max(0, Math.sin((f - i * 4) / 5))}px)` }}>•</span>)}</span></div>
        : <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 800 }}><Check q={ok} />{done}</div>}
    </div>
  </Glass>;
};

const C03: React.FC<Base & { steps: string[]; every?: number }> = ({ steps, every = 18, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={440} scale={scale}>
    <Label>агент працює</Label>
    {steps.map((s, i) => {
      const start = 8 + i * every, q = pop(f, start, 30, 15);
      const done = f >= start + every;
      return <div key={i} style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.mono, fontSize: 27, opacity: q,
        transform: `translateX(${(1 - q) * 30}px)`, color: done ? th.dim : th.text }}>
        {done ? <Check q={pop(f, start + every)} size={34} /> : <Spinner f={f} />}{s}
      </div>;
    })}
  </Glass>;
};

const C05: React.FC<Base & { cmd: string; items: string[]; pick?: number }> = ({ cmd, items, pick = 0, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const t = typed(cmd, f, 6, 0.5);
  const open = pop(f, 10, 30, 16);
  const sel = interpolate(f, [26, 26 + pick * 6], [0, pick], clamp);
  return <Glass side={side} y={y} w={440} scale={scale} tilt={0}>
    <div style={{ padding: '14px 20px', borderRadius: 18, background: 'rgba(255,255,255,.08)', border: th.border, fontFamily: F.mono, fontSize: 30 }}>
      <span style={{ color: th.accent }}>{t}</span><Caret f={f} />
    </div>
    <div style={{ position: 'relative', marginTop: 12, opacity: open, transform: `translateY(${(1 - open) * -12}px)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: sel * 58, height: 54, borderRadius: 14, background: th.chip, borderLeft: `4px solid ${th.accent}` }} />
      {items.map((it, i) => <div key={i} style={{ position: 'relative', height: 58, display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: F.mono, fontSize: 26,
        color: Math.round(sel) === i ? th.text : th.dim }}>{it}</div>)}
    </div>
  </Glass>;
};

// ---------- D. термінал ----------
const D01: React.FC<Base & { cmd: string; out?: string[] }> = ({ cmd, out = [], side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const t = typed(cmd, f, 6, 0.8);
  const run = 6 + cmd.length / 0.8 + 6;
  return <Glass side={side} y={y} w={470} scale={scale} tilt={0} style={{ padding: 0, overflow: 'hidden', background: 'rgba(6,9,11,.94)' }}>
    <div style={{ display: 'flex', gap: 10, padding: '14px 18px', borderBottom: th.border }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.25)' }} />)}
    </div>
    <div style={{ padding: '20px 24px 26px', fontFamily: F.mono, fontSize: 25, lineHeight: 1.5 }}>
      <div><span style={{ color: th.accent }}>$ </span>{t}{f < run && <Caret f={f} />}</div>
      {out.map((l, i) => <div key={i} style={{ opacity: f >= run + i * 5 ? 1 : 0, color: i === out.length - 1 ? th.accent : th.dim, whiteSpace: 'pre-wrap' }}>{l}</div>)}
    </div>
  </Glass>;
};

// ---------- E. цифри ----------
const E01: React.FC<Base & { to: number; from?: number; prefix?: string; suffix?: string; label?: string; at?: number }> = ({ to, from = 0, prefix = '', suffix = '', label, at = 4, side = 'center', y = 300, scale = 1 }) => {
  const th = useTh(); const { f, p, N } = useLife();
  const end = Math.min(at + 30, N - 14);
  const v = interpolate(f, [at, end], [from, to], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const kick = interpolate(f, [end, end + 4, end + 12], [1, 1.12, 1], clamp);
  const w = 900;
  return <div style={{ position: 'absolute', left: X(side, w * scale), top: y, width: w, textAlign: 'center', transform: `scale(${scale})`, transformOrigin: '0 0',
    opacity: interpolate(p, [0, 0.2], [0, 1], clamp) }}>
    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 190, lineHeight: 1, color: th.accent, transform: `scale(${kick})`, letterSpacing: '-0.03em',
      textShadow: `0 10px 40px rgba(0,0,0,.6), 0 0 40px ${th.accent}55`, fontVariantNumeric: 'tabular-nums' }}>{prefix}{Math.round(v).toLocaleString('uk-UA')}{suffix}</div>
    {label && <div style={{ marginTop: 14, fontFamily: F.body, fontWeight: 800, fontSize: 44, color: th.text, textShadow: '0 4px 18px rgba(0,0,0,.7)', opacity: ramp(f, 10, 20) }}>{label}</div>}
  </div>;
};

const E04: React.FC<Base & { sec: number; label?: string }> = ({ sec, label, side, y, scale }) => {
  const th = useTh(); const { f, N } = useLife();
  const k = ramp(f, 6, Math.max(12, N * 0.7), 0, 1, (x) => x);
  const s = Math.round(sec * k);
  const R = 74, L = 2 * Math.PI * R;
  return <Glass side={side} y={y} w={380} scale={scale}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width="170" height="170" viewBox="0 0 170 170" style={{ flexShrink: 0 }}>
        <circle cx="85" cy="85" r={R} fill="none" stroke={DIM_LINE} strokeWidth="12" />
        <circle cx="85" cy="85" r={R} fill="none" stroke={th.accent} strokeWidth="12" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - k)} transform="rotate(-90 85 85)" />
        <line x1="85" y1="85" x2="85" y2="30" stroke="#fff" strokeWidth="5" strokeLinecap="round" transform={`rotate(${k * 360} 85 85)`} />
        <circle cx="85" cy="85" r="7" fill="#fff" />
      </svg>
      <div>
        <div style={{ fontFamily: F.mono, fontSize: 52, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{String(Math.floor(s / 60)).padStart(2, '0')}:{String(s % 60).padStart(2, '0')}</div>
        {label && <div style={{ color: th.dim, fontSize: 26, fontWeight: 700, marginTop: 6 }}>{label}</div>}
      </div>
    </div>
  </Glass>;
};

// ---------- F. списки ----------
const F03: React.FC<Base & { title?: string; items: string[]; every?: number }> = ({ title, items, every = 14, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={430} scale={scale}>
    {title && <Label>{title}</Label>}
    {items.map((it, i) => {
      const q = pop(f, 16 + i * every);
      return <div key={i} style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 700, opacity: interpolate(q, [0, 1], [1, 0.62]) }}>
        <Check q={q} />
        <span style={{ position: 'relative' }}>{it}<span style={{ position: 'absolute', left: 0, top: '55%', height: 3, background: th.dim, width: `${q * 100}%` }} /></span>
      </div>;
    })}
  </Glass>;
};

const F06: React.FC<Base & { n: string; title: string }> = ({ n, title, y = 260 }) => {
  const th = useTh(); const { f, fps, p } = useLife();
  const q = spring({ frame: f, fps, config: { damping: 11, stiffness: 120 } });
  return <div style={{ position: 'absolute', left: 84, right: 140, top: y, opacity: interpolate(p, [0, 0.2], [0, 1], clamp) }}>
    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 240, lineHeight: 0.9, color: 'transparent', WebkitTextStroke: `5px ${th.accent}`,
      transform: `translateX(${(1 - q) * -200}px)`, textShadow: `0 0 40px ${th.accent}33` }}>{n}</div>
    <div style={{ marginTop: 18, fontFamily: F.display, fontWeight: 900, fontSize: 64, lineHeight: 1.08, color: th.text, textShadow: '0 6px 24px rgba(0,0,0,.7)',
      opacity: ramp(f, 8, 18), transform: `translateY(${(1 - ramp(f, 8, 18)) * 20}px)` }}>{title}</div>
  </div>;
};

// ---------- G. порівняння ----------
const G01: React.FC<Base & { bad: string; good: string; badLabel?: string; goodLabel?: string }> = ({ bad, good, badLabel = 'Не так', goodLabel = 'Так', y = 260 }) => {
  const th = useTh(); const { f, p } = useLife();
  const judge = pop(f, 22);
  const col = (txt: string, lbl: string, ok: boolean, i: number) => {
    const q = pop(f, 4 + i * 5, 30, 14);
    return <div style={{ flex: 1, padding: 26, borderRadius: 28, background: th.bg, border: ok && judge > 0.5 ? `2.5px solid ${th.accent}` : th.border,
      boxShadow: ok ? `0 0 ${34 * judge}px ${th.accent}55, ${th.glow}` : th.glow, opacity: q * (ok ? 1 : 1 - 0.4 * judge), transform: `translateY(${(1 - q) * 40}px) scale(${ok ? 1 + 0.04 * judge : 1 - 0.03 * judge})` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: ok ? th.accent : th.dim, fontWeight: 800, fontSize: 26, textTransform: 'uppercase' }}><Check q={judge} size={36} bad={!ok} />{lbl}</div>
      <div style={{ marginTop: 16, fontSize: 30, lineHeight: 1.3, fontWeight: 700, color: th.text, textDecoration: !ok && judge > 0.5 ? 'line-through' : 'none' }}>{txt}</div>
    </div>;
  };
  return <div style={{ position: 'absolute', left: 84, right: 84, top: y, display: 'flex', gap: 22, fontFamily: F.body, opacity: interpolate(p, [0, 0.2], [0, 1], clamp) }}>
    {col(bad, badLabel, false, 0)}{col(good, goodLabel, true, 1)}
  </div>;
};

// ---------- H. акценти на кадрі (координати 1080×1920) ----------
// hand-drawn arrow from [x,y] to `to`, optional label at the tail
const H01: React.FC<Base & { x?: number; to?: [number, number]; label?: string; bend?: number }> = ({ x = 260, y = 520, to = [560, 820], label, bend = 0.35 }) => {
  const th = useTh(); const { f, p } = useLife();
  const [x2, y2] = to;
  const mx = (x + x2) / 2 - (y2 - y) * bend, my = (y + y2) / 2 + (x2 - x) * bend;
  const d = `M${x} ${y} Q${mx} ${my} ${x2} ${y2}`;
  const draw = ramp(f, 2, 14);
  const ang = Math.atan2(y2 - my, x2 - mx);
  const head = (a: number) => `${x2 - 44 * Math.cos(ang + a)} ${y2 - 44 * Math.sin(ang + a)}`;
  const hp = ramp(f, 12, 18);
  return <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: interpolate(p, [0, 0.1], [0, 1], clamp), filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.55))' }}>
    <path d={d} fill="none" stroke={th.accent} strokeWidth="11" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
    <path d={`M${head(0.5)} L${x2} ${y2} L${head(-0.5)}`} fill="none" stroke={th.accent} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity={hp} />
    {label && <text x={x} y={y - 30} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={46} fill="#F5F7F2" stroke="rgba(8,11,14,.85)" strokeWidth={8}
      paintOrder="stroke" opacity={ramp(f, 0, 8)}>{label}</text>}
  </svg>;
};

const H06: React.FC<Base & { emoji: string; x?: number; size?: number }> = ({ emoji, x = 760, y = 420, size = 150 }) => {
  const { f, fps, p } = useLife();
  const q = spring({ frame: f, fps, config: { damping: 8, stiffness: 180, mass: 0.6 } });
  const wob = Math.sin(f / 7) * 4;
  return <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, fontSize: size * 0.82, lineHeight: `${size}px`, textAlign: 'center',
    opacity: interpolate(p, [0, 0.15], [0, 1], clamp), transform: `scale(${q}) rotate(${(1 - q) * -40 + wob}deg)`, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,.5))' }}>{emoji}</div>;
};

// ---------- I. соцмережі ----------
// Instagram CTA: the keyword types itself into a comment field, send lights up
const I01: React.FC<Base & { word: string; cta?: string }> = ({ word, cta = 'Напиши в коментарях', y = 1200 }) => {
  const th = useTh(); const { f, p } = useLife();
  const t = typed(word, f, 12, 0.4);
  const sent = 12 + word.length / 0.4 + 6;
  const go = pop(f, sent);
  return <div style={{ position: 'absolute', left: 84, right: 84, top: y, fontFamily: F.body, opacity: interpolate(p, [0, 0.2], [0, 1], clamp), transform: `translateY(${(1 - p) * 60}px)` }}>
    <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 44, color: th.text, textShadow: '0 4px 18px rgba(0,0,0,.7)', marginBottom: 22 }}>{cta}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 20px', borderRadius: 50, background: 'rgba(255,255,255,.96)', boxShadow: '0 20px 50px rgba(0,0,0,.5)' }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, flexShrink: 0, background: `linear-gradient(135deg, ${th.accent}, #5FD38D)` }} />
      <div style={{ flex: 1, fontSize: 44, fontWeight: 800, color: t ? INK : '#8A9097', letterSpacing: '.04em' }}>{t || 'Додайте коментар…'}{f < sent && <span style={{ color: INK, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }}>▍</span>}</div>
      <div style={{ width: 72, height: 72, borderRadius: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
        background: go > 0.5 ? INK : '#D9DDE1', color: go > 0.5 ? th.accent : '#fff', transform: `scale(${1 + 0.15 * Math.sin(Math.min(1, go) * Math.PI)})` }}>➤</div>
    </div>
  </div>;
};

// demo props double as the reference for edit.json fields and drive the Catalog composition
const WAVE1: Reg = {
  A03: { C: A03, name: 'Перемикач', demo: { label: 'Пам\'ять чату', sub: 'Налаштування › Функції' } },
  A04: { C: A04, name: 'Кнопка + курсор', demo: { label: 'Встановити' } },
  A06: { C: A06, name: 'Пошук', demo: { query: 'design skill', hints: ['design-critique', 'design-system', 'ux-writing'] } },
  A09: { C: A09, name: 'Toast', demo: { text: 'Скіл встановлено' } },
  B02: { C: B02, name: 'Браузер', demo: { url: 'devguide.com.ua', title: 'DevGuide' } },
  B04: { C: B04, name: 'Визначення', demo: { term: 'Скіл', def: 'інструкція, яку Claude бере сам, коли бачить схожу задачу' } },
  B07: { C: B07, name: 'Файл', demo: { name: 'SKILL.md', size: '2 КБ' } },
  B09: { C: B09, name: 'Попередження', demo: { text: 'Не вставляй API-ключ прямо в промпт' } },
  C02: { C: C02, name: 'Думає…', demo: {} },
  C03: { C: C03, name: 'Кроки агента', demo: { steps: ['read SKILL.md', 'edit index.html', 'run build'] } },
  C05: { C: C05, name: 'Слеш-команда', demo: { cmd: '/des', items: ['/design-critique', '/design-system', '/deploy'], pick: 1 } },
  D01: { C: D01, name: 'Термінал', demo: { cmd: 'npm i remotion', out: ['added 214 packages', '✓ done in 8s'] } },
  E01: { C: E01, name: 'Лічильник', demo: { to: 100, suffix: '%', label: 'робить сам' } },
  E04: { C: E04, name: 'Таймер', demo: { sec: 300, label: 'на налаштування' } },
  F03: { C: F03, name: 'Чекліст', demo: { title: 'Зроби по черзі', items: ['Відкрий Skills', 'Знайди скіл', 'Увімкни'] } },
  F06: { C: F06, name: 'Номер кроку', demo: { n: '02', title: 'Встанови скіл' } },
  G01: { C: G01, name: '✗ / ✓', demo: { bad: 'Пояснювати щоразу заново', good: 'Один раз записати в скіл' } },
  H01: { C: H01, name: 'Стрілка', demo: { x: 280, y: 560, to: [600, 860], label: 'ось тут' } },
  H06: { C: H06, name: 'Стікер', demo: { emoji: '🤯' } },
  I01: { C: I01, name: 'CTA коментар', demo: { word: 'СКІЛ' } },
};

// all codes, sorted A01…J10 (A01/B01/C01/F01/F02 are the original cards in Cards.tsx, reached by alias)
const ALL: Reg = { ...WAVE1, ...A, ...B, ...C, ...D, ...E, ...Fg, ...G, ...H, ...I, ...J };
export const ELEMENTS: Reg = Object.fromEntries(Object.keys(ALL).sort().map((k) => [k, ALL[k]]));
