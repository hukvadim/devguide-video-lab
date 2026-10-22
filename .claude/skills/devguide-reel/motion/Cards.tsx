import React from 'react';
import { AbsoluteFill, interpolate, Sequence, spring, useVideoConfig } from 'remotion';
import { F, clamp } from './theme';
import { CARD_SCALE, Glass, Icon, Side, THEMES, Th, X, useLife, withAccent } from './glass';
import { ELEMENTS, ElementCard } from './Elements';

// Glass cards that pop up over the reel (above the video, under nothing): they fill static stretches with
// visuals that illustrate the speech. Times are seconds of the final reel; space is 1080×1920.
export type Card =
  | { type: 'crumbs'; t: number; dur: number; steps: string[]; active: number; marks?: number[]; y?: number; scale?: number } // marks: card-relative seconds where the next step lights up
  | { type: 'skill'; t: number; dur: number; name: string; author: string; meta: string[]; desc: string; side?: Side; y?: number; scale?: number }
  | { type: 'list'; t: number; dur: number; title: string; items: string[]; side?: Side; y?: number; scale?: number }
  | { type: 'stack'; t: number; dur: number; items: string[]; active: number; caption?: string; side?: Side; y?: number; scale?: number }
  | { type: 'chat'; t: number; dur: number; prompt: string; reply: string; side?: Side; y?: number; scale?: number }
  | ElementCard; // codes from docs/ELEMENTS.md (E01, H01…), see Elements.tsx
// catalog codes of the original five cards
const ALIAS: Record<string, string> = { A01: 'crumbs', B01: 'skill', C01: 'chat', F01: 'list', F02: 'stack' };
// accent: reel-wide accent (edit.theme.accent); a card may override it with its own `accent` and `theme`
export type CardsProps = { w: number; h: number; dur: number; theme?: 'dg' | 'glow'; accent?: string; cards: Card[] };

const Crumbs: React.FC<Extract<Card, { type: 'crumbs' }>> = ({ steps, active: a0, marks = [], y = 120 }) => {
  const th = React.useContext(Th);
  const { f, p } = useLife();
  const passed = marks.filter((m) => f >= m * 30);
  const active = a0 + passed.length;
  const since = passed.length ? f - passed[passed.length - 1] * 30 : f;
  return <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center',
    opacity: interpolate(p, [0, 0.3], [0, 1], clamp), transform: `translateY(${(1 - p) * -30}px)` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 26px', borderRadius: 40, background: th.bg, border: th.border,
      boxShadow: th.glow, fontFamily: F.body, fontWeight: 800, fontSize: 30 }}>
      {steps.map((s, i) => {
        const on = i === active, seen = i <= active;
        const pop = on ? spring({ frame: since - 2, fps: 30, config: { damping: 12, stiffness: 180 } }) : 1;
        return <React.Fragment key={i}>
          {i > 0 && <span style={{ color: th.dim, opacity: 0.6 }}>›</span>}
          <span style={{ color: on ? '#0B0F12' : seen ? th.text : th.dim, background: on ? th.accent : 'transparent',
            padding: on ? '6px 16px' : 0, borderRadius: 22, transform: `scale(${on ? 0.9 + 0.1 * pop : 1})`, display: 'inline-block' }}>{s}</span>
        </React.Fragment>;
      })}
    </div>
  </div>;
};

const Skill: React.FC<Extract<Card, { type: 'skill' }>> = ({ name, author, meta, desc, side, y, scale }) => {
  const th = React.useContext(Th);
  const { f } = useLife();
  return <Glass side={side} y={y} w={420} scale={scale}>
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Icon />
      <div>
        <div style={{ fontFamily: th.title, fontWeight: 900, fontSize: 46, lineHeight: 1.05 }}>{name}</div>
        <div style={{ color: th.dim, fontSize: 24, marginTop: 6 }}>{author}</div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
      {meta.map((m, i) => <span key={i} style={{ background: th.chip, color: th.accent, padding: '8px 16px', borderRadius: 18, fontSize: 24, fontWeight: 800,
        opacity: interpolate(f, [10 + i * 5, 16 + i * 5], [0, 1], clamp) }}>{m}</span>)}
    </div>
    <div style={{ color: th.text, fontSize: 26, lineHeight: 1.35, marginTop: 20, opacity: interpolate(f, [18, 28], [0, 0.92], clamp) }}>{desc}</div>
  </Glass>;
};

const List: React.FC<Extract<Card, { type: 'list' }>> = ({ title, items, side, y, scale }) => {
  const th = React.useContext(Th);
  const { f, fps } = useLife();
  return <Glass side={side} y={y} w={430} scale={scale}>
    <div style={{ color: th.dim, fontSize: 24, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>{title}</div>
    {items.map((it, i) => {
      const q = spring({ frame: f - 8 - i * 7, fps, config: { damping: 14, stiffness: 160 } });
      return <div key={i} style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.mono, fontSize: 28, fontWeight: 500,
        opacity: q, transform: `translateX(${(1 - q) * 40}px)` }}>
        <span style={{ color: th.accent }}>/</span>{it.replace(/^\//, '')}
      </div>;
    })}
  </Glass>;
};

const Stack: React.FC<Extract<Card, { type: 'stack' }>> = ({ items, active, caption, side, y = 260, scale = CARD_SCALE }) => {
  const th = React.useContext(Th);
  const { f, fps, p } = useLife();
  const w = 420, x = X(side, w * scale);
  const lit = spring({ frame: f - 8 - items.length * 4, fps, config: { damping: 12, stiffness: 140 } });
  return <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: interpolate(p, [0, 0.2], [0, 1], clamp), transform: `scale(${scale})`, transformOrigin: '0 0' }}>
    {items.map((it, i) => {
      const q = spring({ frame: f - i * 4, fps, config: { damping: 14, stiffness: 150 } }) * p;
      const on = i === active;
      return <div key={i} style={{ position: 'relative', marginTop: i ? -6 : 0, padding: '18px 24px', borderRadius: 24, background: th.bg,
        border: on && lit > 0.5 ? `2.5px solid ${th.accent}` : th.border, boxShadow: on ? `0 0 ${30 * lit}px ${th.accent}66, ${th.glow}` : th.glow,
        display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.body, fontWeight: 800, fontSize: 30,
        color: on ? th.text : th.dim, opacity: on ? 1 : 1 - 0.45 * lit,
        transform: `translateY(${(1 - q) * 60}px) scale(${on ? 1 + 0.06 * lit : 1 - 0.03 * lit})`, zIndex: on ? 2 : 1 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: on ? th.accent : th.chip, color: '#0B0F12', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{on && lit > 0.5 ? '✓' : ''}</span>{it}
      </div>;
    })}
    {caption && <div style={{ marginTop: 18, color: th.accent, fontFamily: F.body, fontWeight: 800, fontSize: 30, textAlign: 'center',
      opacity: lit, textShadow: '0 4px 16px rgba(0,0,0,.6)' }}>{caption}</div>}
  </div>;
};

const Chat: React.FC<Extract<Card, { type: 'chat' }>> = ({ prompt, reply, side = 'left', y = 260, scale }) => {
  const th = React.useContext(Th);
  const { f, fps } = useLife();
  const typed = Math.floor(interpolate(f, [8, 8 + prompt.length * 1.6], [0, prompt.length], clamp));
  const sent = 8 + prompt.length * 1.6 + 8;
  const r = spring({ frame: f - sent - 10, fps, config: { damping: 14, stiffness: 140 } });
  const shownReply = reply.slice(0, Math.floor(interpolate(f, [sent + 14, sent + 14 + reply.length * 0.9], [0, reply.length], clamp)));
  return <Glass side={side} y={y} w={440} tilt={-2} scale={scale}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: th.dim, fontSize: 24, fontWeight: 800 }}><Icon size={44} />Claude</div>
    <div style={{ marginTop: 20, padding: '18px 22px', borderRadius: 22, background: 'rgba(255,255,255,.08)', border: th.border,
      fontFamily: F.mono, fontSize: 26, lineHeight: 1.35, minHeight: 44 }}>
      <span style={{ color: th.accent }}>{prompt.slice(0, typed).match(/^\/\S+/)?.[0] ?? ''}</span>{prompt.slice(0, typed).replace(/^\/\S+/, '')}
      {f < sent && <span style={{ opacity: Math.floor(f / 8) % 2 ? 0 : 1, color: th.accent }}>▍</span>}
    </div>
    {f > sent && <div style={{ marginTop: 18, padding: '18px 22px', borderRadius: 22, background: th.chip, fontSize: 28, lineHeight: 1.35,
      opacity: r, transform: `translateY(${(1 - r) * 20}px)` }}>{shownReply || '• • •'}</div>}
  </Glass>;
};

export const Cards: React.FC<CardsProps> = ({ w, theme = 'dg', accent, cards }) => {
  const { fps } = useVideoConfig();
  return <>
    <AbsoluteFill>
      <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${w / 1080})`, transformOrigin: '0 0' }}>
        {cards.map((c0, i) => {
          const c = { ...c0, type: ALIAS[c0.type] ?? c0.type } as Card;
          const El = ELEMENTS[c.type]?.C;
          const own = c as { theme?: 'dg' | 'glow'; accent?: string };
          return <Sequence key={i} from={Math.round(c.t * fps)} durationInFrames={Math.max(1, Math.round(c.dur * fps))} layout="none"><Th.Provider value={withAccent(THEMES[own.theme ?? theme], own.accent ?? accent)}>
            {c.type === 'crumbs' && <Crumbs {...c} />}
            {c.type === 'skill' && <Skill {...c} />}
            {c.type === 'list' && <List {...c} />}
            {c.type === 'stack' && <Stack {...c} />}
            {c.type === 'chat' && <Chat {...c} />}
            {El && <El {...c} />}
          </Th.Provider></Sequence>;
        })}
      </div>
    </AbsoluteFill>
  </>;
};
