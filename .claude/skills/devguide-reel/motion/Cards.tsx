import React from 'react';
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { F, clamp } from './theme';

// Glass cards that pop up over the reel (above the video, under nothing): they fill static stretches with
// visuals that illustrate the speech. Times are seconds of the final reel; space is 1080×1920.
export type Card =
  | { type: 'crumbs'; t: number; dur: number; steps: string[]; active: number; marks?: number[]; y?: number; scale?: number } // marks: card-relative seconds where the next step lights up
  | { type: 'skill'; t: number; dur: number; name: string; author: string; meta: string[]; desc: string; side?: Side; y?: number; scale?: number }
  | { type: 'list'; t: number; dur: number; title: string; items: string[]; side?: Side; y?: number; scale?: number }
  | { type: 'stack'; t: number; dur: number; items: string[]; active: number; caption?: string; side?: Side; y?: number; scale?: number }
  | { type: 'chat'; t: number; dur: number; prompt: string; reply: string; side?: Side; y?: number; scale?: number };
type Side = 'left' | 'right' | 'center';
export type CardsProps = { w: number; h: number; dur: number; theme?: 'dg' | 'glow'; cards: Card[] };

type T = { bg: string; border: string; glow: string; accent: string; text: string; dim: string; chip: string; title: string };
const THEMES: Record<'dg' | 'glow', T> = {
  dg: { bg: 'linear-gradient(160deg, rgba(22,30,38,.86), rgba(10,14,18,.9))', border: '1.5px solid rgba(255,255,255,.14)',
    glow: '0 30px 70px rgba(0,0,0,.55), 0 0 0 1px rgba(195,255,85,.06)', accent: '#C3FF55', text: '#F5F7F2', dim: '#AEB8C1',
    chip: 'rgba(195,255,85,.12)', title: F.display },
  glow: { bg: 'linear-gradient(160deg, rgba(150,24,110,.9), rgba(52,10,70,.92))', border: '2px solid rgba(255,110,220,.9)',
    glow: '0 0 34px rgba(255,70,210,.55), 0 30px 70px rgba(20,0,30,.6), inset 0 1px 0 rgba(255,255,255,.35)', accent: '#FFD1F4', text: '#FFFFFF',
    dim: '#F2C6EC', chip: 'rgba(255,255,255,.14)', title: F.display },
};
const Th = React.createContext<T>(THEMES.dg);

// spring in, quick ease-in out (exit faster than entry, as in the TZ)
const useLife = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames: N } = useVideoConfig();
  const inn = spring({ frame: f, fps, config: { damping: 14, stiffness: 130, mass: 0.8 } });
  const out = interpolate(f, [N - 10, N], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { f, fps, N, p: inn * (1 - out), out };
};

// side cards are drawn at 88%: the speaker usually sits a bit right of centre, the free strip on the left is ~400 px
const CARD_SCALE = 0.88;
const X = (side: Side = 'left', w: number) => (side === 'left' ? 24 : side === 'center' ? 540 - w / 2 : 1056 - w);

const Glass: React.FC<{ side?: Side; y?: number; w: number; children: React.ReactNode; tilt?: number; scale?: number }> = ({ side = 'left', y = 260, w, children, tilt, scale = CARD_SCALE }) => {
  const th = React.useContext(Th);
  const { p } = useLife();
  const dir = side === 'left' ? -1 : 1;
  const rz = tilt ?? dir * 3;
  return <div style={{ position: 'absolute', left: X(side, w * scale), top: y, width: w, padding: 30, borderRadius: 34, background: th.bg,
    border: th.border, boxShadow: th.glow, backdropFilter: 'blur(18px)', color: th.text, fontFamily: F.body,
    opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
    transformOrigin: '0 0',
    transform: `translateX(${(1 - p) * dir * 120}px) translateY(${(1 - p) * 30}px) rotateZ(${rz * p}deg) scale(${scale * (0.85 + 0.15 * p)})` }}>{children}</div>;
};

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

const Icon: React.FC<{ size?: number }> = ({ size = 72 }) => {
  const th = React.useContext(Th);
  return <div style={{ width: size, height: size, borderRadius: size * 0.28, background: th.chip, border: th.border, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, color: th.accent, fontFamily: F.display, fontWeight: 900 }}>✦</div>;
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

export const Cards: React.FC<CardsProps> = ({ w, theme = 'dg', cards }) => {
  const { fps } = useVideoConfig();
  return <Th.Provider value={THEMES[theme]}>
    <AbsoluteFill>
      <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${w / 1080})`, transformOrigin: '0 0' }}>
        {cards.map((c, i) => <Sequence key={i} from={Math.round(c.t * fps)} durationInFrames={Math.max(1, Math.round(c.dur * fps))} layout="none">
          {c.type === 'crumbs' && <Crumbs {...c} />}
          {c.type === 'skill' && <Skill {...c} />}
          {c.type === 'list' && <List {...c} />}
          {c.type === 'stack' && <Stack {...c} />}
          {c.type === 'chat' && <Chat {...c} />}
        </Sequence>)}
      </div>
    </AbsoluteFill>
  </Th.Provider>;
};
