import React from 'react';
import { interpolate } from 'remotion';
import { F, clamp, ramp } from '../theme';
import { Base, Glass, useLife } from '../glass';
import { Check, DIM_LINE, Reg, pop, typed, useTh } from './kit';

// D. Код і термінал. Код — моно 24–26 px на темному склі.
const DARK = 'rgba(6,9,11,.94)';
const Code: React.FC<{ lines: string[]; f: number; hl?: number; start?: number }> = ({ lines, f, hl, start = 4 }) => {
  const th = useTh();
  return <div style={{ fontFamily: F.mono, fontSize: 24, lineHeight: 1.6 }}>
    {lines.map((l, i) => {
      const on = i === hl && f > start + lines.length * 3 + 6;
      return <div key={i} style={{ display: 'flex', opacity: ramp(f, start + i * 3, start + 6 + i * 3), background: on ? 'rgba(195,255,85,.14)' : 'transparent',
        borderLeft: `4px solid ${on ? th.accent : 'transparent'}`, paddingLeft: 10, whiteSpace: 'pre' }}>
        <span style={{ color: th.dim, opacity: 0.5, width: 36 }}>{i + 1}</span><span style={{ color: on ? th.text : '#CFD6DC' }}>{l}</span>
      </div>;
    })}
  </div>;
};

const D02: React.FC<Base & { code: string[]; line: number; file?: string }> = ({ code, line, file, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={480} scale={scale} tilt={0} style={{ background: DARK, padding: 24 }}>
    {file && <div style={{ fontFamily: F.mono, fontSize: 20, color: th.dim, marginBottom: 12 }}>{file}</div>}
    <Code lines={code} f={f} hl={line} />
  </Glass>;
};

// "-" lines get struck and dim, "+" lines slide in
const D03: React.FC<Base & { lines: string[] }> = ({ lines, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  return <Glass side={side} y={y} w={480} scale={scale} tilt={0} style={{ background: DARK, padding: 24, fontFamily: F.mono, fontSize: 24, lineHeight: 1.6 }}>
    {lines.map((l, i) => {
      const kind = l[0], body = l.slice(1).trimStart(), at = 6 + i * 6;
      const q = ramp(f, at, at + 8);
      const style: React.CSSProperties = kind === '-' ? { color: th.dim, background: 'rgba(255,255,255,.05)', textDecoration: q > 0.5 ? 'line-through' : 'none', opacity: 1 - 0.4 * q }
        : kind === '+' ? { color: th.accent, background: 'rgba(195,255,85,.1)', opacity: q, transform: `translateX(${(1 - q) * 40}px)` } : { color: '#CFD6DC' };
      return <div key={i} style={{ whiteSpace: 'pre', padding: '0 10px', borderRadius: 6, ...style }}>{kind === '-' || kind === '+' ? kind : ' '} {body}</div>;
    })}
  </Glass>;
};

// error on a dark terminal (red only on dark, never on blue) → replaced by the fix
const D04: React.FC<Base & { cmd?: string; err: string; fix: string }> = ({ cmd, err, fix, side, y, scale }) => {
  const th = useTh(); const { f, N } = useLife();
  const swap = Math.round(N * 0.5);
  const q = ramp(f, swap, swap + 8);
  return <Glass side={side} y={y} w={480} scale={scale} tilt={0} style={{ background: DARK, padding: 26, fontFamily: F.mono, fontSize: 24, lineHeight: 1.6 }}>
    {cmd && <div><span style={{ color: th.accent }}>$ </span>{cmd}</div>}
    <div style={{ position: 'relative', marginTop: 8, minHeight: 80 }}>
      <div style={{ position: 'absolute', inset: 0, color: '#FF7A7A', opacity: ramp(f, 6, 10) * (1 - q), transform: `translateX(${f < swap ? Math.sin(f * 2) * 3 * ramp(f, 6, 10) * (f < 16 ? 1 : 0) : 0}px)` }}>✗ {err}</div>
      <div style={{ position: 'absolute', inset: 0, color: th.accent, opacity: q, transform: `translateY(${(1 - q) * 12}px)`, display: 'flex', gap: 10 }}><Check q={q} size={30} /> {fix}</div>
    </div>
  </Glass>;
};

const D05: React.FC<Base & { label: string; pct?: number }> = ({ label, pct = 100, side, y, scale }) => {
  const th = useTh(); const { f, N } = useLife();
  const k = Math.round(ramp(f, 6, Math.max(7, N * 0.75), 0, pct, (x) => x));
  const cells = 16, full = Math.round(cells * k / 100);
  return <Glass side={side} y={y} w={460} scale={scale} tilt={0} style={{ background: DARK, fontFamily: F.mono, fontSize: 26 }}>
    <div style={{ color: th.dim }}>{label}</div>
    <div style={{ marginTop: 12, whiteSpace: 'pre' }}><span style={{ color: th.text }}>[</span><span style={{ color: th.accent }}>{'█'.repeat(full)}</span>
      <span style={{ color: 'rgba(255,255,255,.2)' }}>{'░'.repeat(cells - full)}</span><span style={{ color: th.text }}>] {String(k).padStart(3)}%</span></div>
  </Glass>;
};

// JSON config: braces open, one key lights up
const D06: React.FC<Base & { json: string[]; hl?: string }> = ({ json, hl, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const idx = json.findIndex((l) => hl && l.includes(`"${hl}"`));
  const open = ramp(f, 4, 14);
  return <Glass side={side} y={y} w={470} scale={scale} tilt={0} style={{ background: DARK, padding: 26, fontFamily: F.mono, fontSize: 25, lineHeight: 1.6 }}>
    <div style={{ color: th.accent }}>{'{'}</div>
    <div style={{ overflow: 'hidden', height: open * json.length * 40 }}>
      {json.map((l, i) => {
        const on = i === idx && f > 24;
        return <div key={i} style={{ whiteSpace: 'pre', paddingLeft: 26, borderRadius: 6, background: on ? 'rgba(195,255,85,.14)' : 'transparent', color: on ? th.text : '#CFD6DC' }}>
          {l.replace(/("[^"]+")(\s*:)/, '$1$2').split(/("[^"]+"\s*:)/).map((s, k) => <span key={k} style={{ color: /:\s*$/.test(s) ? (on ? th.accent : '#9BC3FF') : undefined }}>{s}</span>)}
        </div>;
      })}
    </div>
    <div style={{ color: th.accent }}>{'}'}</div>
  </Glass>;
};

// git graph: main line + one branch, commit dots pop in order
const D07: React.FC<Base & { commits: string[]; branch?: string }> = ({ commits, branch = 'feature', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const n = commits.length, dx = 380 / Math.max(1, n - 1);
  const draw = ramp(f, 4, 30);
  const bx0 = dx, bx1 = dx * (n - 2);
  return <Glass side={side} y={y} w={460} scale={scale} tilt={0}>
    <svg width="400" height="170" viewBox="-10 -10 400 170" style={{ overflow: 'visible' }}>
      <line x1="0" y1="120" x2={380 * draw} y2="120" stroke={th.dim} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${bx0} 120 C${bx0 + 30} 40 ${bx0 + 40} 40 ${bx0 + 70} 40 L${bx1 - 60} 40 C${bx1 - 30} 40 ${bx1 - 20} 120 ${bx1} 120`} fill="none" stroke={th.accent} strokeWidth="6"
        pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(f, 12, 40)} />
      {commits.map((c, i) => { const q = pop(f, 6 + i * 6); return <g key={i} transform={`translate(${i * dx} 120) scale(${q})`}>
        <circle r="14" fill="#141B22" stroke={th.text} strokeWidth="5" /><text y="50" textAnchor="middle" fontFamily={F.mono} fontSize="20" fill={th.dim}>{c}</text></g>; })}
      <text x={(bx0 + bx1) / 2} y="22" textAnchor="middle" fontFamily={F.mono} fontSize="22" fill={th.accent} opacity={ramp(f, 24, 32)}>{branch}</text>
    </svg>
  </Glass>;
};

const D08: React.FC<Base & { code: string[]; line: number; comment: string; who?: string }> = ({ code, line, comment, who = 'Claude', side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const q = pop(f, 22, 30, 13);
  return <Glass side={side} y={y} w={480} scale={scale} tilt={0} style={{ background: DARK, padding: 24 }}>
    <Code lines={code} f={f} hl={line} />
    <div style={{ marginTop: 14, marginLeft: 36, padding: '16px 20px', borderRadius: 18, background: '#1B242C', border: `2px solid ${th.accent}`, fontSize: 25, lineHeight: 1.35, fontWeight: 600,
      opacity: q, transform: `translateY(${(1 - q) * -16}px) scale(${0.95 + 0.05 * q})`, transformOrigin: '10% 0' }}>
      <div style={{ color: th.accent, fontSize: 21, fontWeight: 800, marginBottom: 6 }}>💬 {who}</div>{comment}
    </div>
  </Glass>;
};

// two code panes with a wipe slider moving across
const D09: React.FC<Base & { before: string[]; after: string[] }> = ({ before, after, side, y, scale }) => {
  const th = useTh(); const { f, N } = useLife();
  const k = interpolate(f, [12, Math.max(13, N * 0.45), Math.max(14, N * 0.65)], [0, 1, 0.55], clamp); // slides over, settles midway so both halves read
  const pane = (lines: string[], col: string) => <div style={{ fontFamily: F.mono, fontSize: 23, lineHeight: 1.6, color: col, whiteSpace: 'pre', padding: 24 }}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>;
  return <Glass side={side} y={y} w={480} scale={scale} tilt={0} style={{ background: DARK, padding: 0, overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px 0', fontSize: 20, fontWeight: 800, textTransform: 'uppercase' }}>
      <span style={{ color: th.dim }}>до</span><span style={{ color: th.accent }}>після</span></div>
    <div style={{ position: 'relative' }}>
      {pane(before, th.dim)}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`, background: '#0B1410' }}>{pane(after, th.accent)}</div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${k * 100}%`, width: 4, marginLeft: -2, background: th.accent, boxShadow: `0 0 16px ${th.accent}` }} />
    </div>
  </Glass>;
};

// ghost-text autocomplete: grey suggestion turns white as if accepted
const D10: React.FC<Base & { typed: string; ghost: string }> = ({ typed: t0, ghost, side, y, scale }) => {
  const th = useTh(); const { f } = useLife();
  const t = typed(t0, f, 4, 0.7), shown = f > 4 + t0.length / 0.7 + 4;
  const T = 4 + t0.length / 0.7, acc = ramp(f, T + 22, T + 30); // ghost appears, then gets accepted
  return <Glass side={side} y={y} w={480} scale={scale} tilt={0} style={{ background: DARK, fontFamily: F.mono, fontSize: 25, lineHeight: 1.6 }}>
    <div style={{ whiteSpace: 'pre-wrap' }}>{t}<span style={{ color: acc > 0.5 ? '#CFD6DC' : 'rgba(255,255,255,.32)', opacity: shown ? 1 : 0 }}>{ghost}</span></div>
    <div style={{ marginTop: 14, fontSize: 20, color: th.dim, opacity: shown ? 1 : 0 }}><span style={{ padding: '2px 10px', border: `1.5px solid ${DIM_LINE}`, borderRadius: 6, color: acc > 0.5 ? th.accent : th.dim }}>Tab</span> прийняти</div>
  </Glass>;
};

export const D: Reg = {
  D02: { C: D02, name: 'Код з підсвіткою', demo: { file: 'index.html', code: ['<header>', '  <h1>DevGuide</h1>', '  <button class="cta">', '    Почати', '  </button>'], line: 2 } },
  D03: { C: D03, name: 'Diff', demo: { lines: ['  color: white;', '- background: blue;', '+ background: #10161C;', '+ border: 2px solid lime;'] } },
  D04: { C: D04, name: 'Помилка → виправлення', demo: { cmd: 'npm run build', err: 'Module not found: ./Hero', fix: 'Build ok in 3.2s' } },
  D05: { C: D05, name: 'Прогрес встановлення', demo: { label: 'installing skills…', pct: 100 } },
  D06: { C: D06, name: 'JSON-конфіг', demo: { json: ['"name": "my-skill",', '"model": "opus",', '"tools": ["web"]'], hl: 'model' } },
  D07: { C: D07, name: 'Git-граф', demo: { commits: ['init', 'hero', 'cta', 'merge'], branch: 'feature/cta' } },
  D08: { C: D08, name: 'Коментар рев\'ю', demo: { code: ['const total = items', '  .map(i => i.price)', '  .reduce((a, b) => a + b)'], line: 2, comment: 'Без початкового 0 впаде на порожньому кошику' } },
  D09: { C: D09, name: 'Код до / після', demo: { before: ['if (a == null) {', '  return 0;', '}', 'return a;'], after: ['return a ?? 0;'] } },
  D10: { C: D10, name: 'Ghost text', demo: { typed: 'function sum(', ghost: 'a, b) {\n  return a + b;\n}' } },
};
