import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { measureText } from '@remotion/layout-utils';
import { C, F, clamp, fontsReady, ramp } from './theme';
import { fitSize } from './layout';

// Епічна обгортка DevGuide: хук перед роликом і end card після нього (непрозорі кліпи; звуки кладе ffmpeg).
// SLAM — кадр удару в інтро, на нього vid.mjs ставить impact і дроп музики.
export const SLAM = 30;
export type IntroProps = { w: number; h: number; dur: number; kicker?: string; big: string; sub?: string; accent?: string; bg?: string };
// keyword — Instagram-CTA «напиши СЛОВО в коментарях»: велике слово замість tagline, cta тоді пояснює, що прийде в Direct
export type OutroProps = { w: number; h: number; dur: number; tagline?: string; cta?: string; url?: string; offer?: string; keyword?: string; accent?: string; bg?: string };

const useReady = () => {
  const [st] = useState(() => ({ h: delayRender('wrap fonts') }));
  const [ready, setReady] = useState(false);
  useEffect(() => { fontsReady.then(() => setReady(true)); }, []);
  useEffect(() => { if (ready) continueRender(st.h); }, [ready, st]);
  return ready;
};

const Stage: React.FC<{ children: React.ReactNode; w: number; bg?: string; accent?: string }> = ({ children, w, bg = C.bg, accent = C.lime }) => {
  const f = useCurrentFrame();
  const gx = 540 + Math.sin(f / 50) * 60, gy = 860 + Math.cos(f / 60) * 60;
  return <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${w / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 900px at ${gx}px ${gy}px, ${accent}26, transparent 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: 'linear-gradient(#ffffff08 1px, transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px)',
        backgroundSize: '90px 90px', maskImage: 'radial-gradient(circle at 50% 45%, black 20%, transparent 75%)' }} />
      {children}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, #000000AA 100%)' }} />
    </div>
  </AbsoluteFill>;
};

// *акцент* у рядку → лаймовий фрагмент
const Accented: React.FC<{ text: string; accent: string }> = ({ text, accent }) => <>
  {text.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith('*') ? <span key={i} style={{ color: accent }}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>)}
</>;

export const Intro: React.FC<IntroProps> = ({ w, kicker = 'DevGuide · практика', big, sub, accent = C.lime, bg }) => {
  const ready = useReady();
  const f = useCurrentFrame();
  const { fps, durationInFrames: N } = useVideoConfig();
  const fit = useMemo(() => ready ? fitSize(big.split(/\s+/), [230, 200, 180, 160, 140, 124, 110, 96], 912, 2,
    (t, s) => measureText({ text: t, fontFamily: F.display, fontSize: s, fontWeight: '900', validateFontIsLoaded: false }).width) : null, [big, ready]);
  if (!ready || !fit) return null;
  const words = big.split(/\s+/);
  let li = 0;
  const kick = ramp(f, 3, 15);
  const subIn = spring({ frame: f - SLAM - 10, fps, config: { damping: 16, stiffness: 140 } });
  const flash = interpolate(f, [SLAM - 3, SLAM, SLAM + 14], [0, 0.7, 0], clamp);
  const push = ramp(f, N - 18, N);
  return <Stage w={w} bg={bg} accent={accent}>
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `scale(${1 + push * 0.3})`, filter: `blur(${push * 12}px)`, opacity: 1 - push * 0.7 }}>
      <div style={{ fontFamily: F.mono, fontSize: 34, letterSpacing: 6, color: accent, textTransform: 'uppercase', opacity: kick, transform: `translateY(${(1 - kick) * 30}px)` }}>{kicker}</div>
      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', textShadow: `0 0 90px ${accent}60` }}>
        {fit.lines.map((line, l) => <div key={l} style={{ display: 'flex', gap: `0 ${fit.size * 0.25}px`, lineHeight: 1 }}>
          {line.map((wi) => <span key={wi} style={{ display: 'flex' }}>{words[wi].split('').map((ch, ci) => {
            // літери падають і лягають до кадру SLAM (останні — рівно на удар)
            const d = SLAM - 14 + Math.min(14, li++ * 2);
            const p = spring({ frame: f - d, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
            return <span key={ci} style={{ display: 'inline-block', fontFamily: F.display, fontWeight: 900, fontSize: fit.size, color: accent,
              opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * -fit.size * 1.3}px) scaleY(${1 + (1 - Math.min(p, 1)) * 0.7})`, transformOrigin: '50% 100%' }}>{ch}</span>;
          })}</span>)}
        </div>)}
      </div>
      {sub && <div style={{ marginTop: 40, padding: '0 84px', textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 62, lineHeight: 1.15, whiteSpace: 'pre-line',
        color: C.text, opacity: subIn, transform: `translateY(${(1 - subIn) * 40}px)` }}><Accented text={sub} accent={accent} /></div>}
    </AbsoluteFill>
    <AbsoluteFill style={{ background: accent, opacity: flash, mixBlendMode: 'screen' }} />
  </Stage>;
};

const Dust: React.FC<{ accent: string }> = ({ accent }) => {
  const f = useCurrentFrame();
  return <>{Array.from({ length: 46 }, (_, i) => {
    const x = random(`x${i}`) * 1080, speed = 1.2 + random(`v${i}`) * 2.2, phase = random(`p${i}`) * 1900;
    const y = 1900 - ((f * speed + phase) % 1900), s = 3 + random(`s${i}`) * 6;
    return <div key={i} style={{ position: 'absolute', left: x + Math.sin((f + i * 20) / 30) * 10, top: y, width: s, height: s, borderRadius: s,
      background: i % 3 ? accent : '#E9FFC4', opacity: 0.35 + random(`o${i}`) * 0.5, boxShadow: `0 0 12px ${accent}` }} />;
  })}</>;
};

export const Outro: React.FC<OutroProps> = ({ w, tagline = 'Від ідеї —\n*до власного проєкту.*', cta = 'Почни свій шлях із DevGuide', url = 'devguide.com.ua', offer, keyword, accent = C.lime, bg }) => {
  const ready = useReady();
  const f = useCurrentFrame();
  if (!ready) return null;
  const slam = ramp(f, 0, 14);
  const tag = ramp(f, 22, 40), ctaIn = ramp(f, 40, 58), urlIn = ramp(f, 52, 70), offIn = ramp(f, 64, 82);
  return <Stage w={w} bg={bg} accent={accent}>
    <AbsoluteFill style={{ opacity: interpolate(f, [10, 50], [0, 0.7], clamp) }}><Dust accent={accent} /></AbsoluteFill>
    <div style={{ position: 'absolute', left: 84, right: 84, top: 520, textAlign: 'center' }}>
      <div style={{ transform: `scale(${interpolate(slam, [0, 1], [1.9, 1])})`, opacity: slam, filter: `blur(${(1 - slam) * 16}px)`,
        fontFamily: F.display, fontWeight: 900, fontSize: 118, lineHeight: 0.92, letterSpacing: -3 }}>
        <span style={{ color: C.text }}>DEV</span><span style={{ color: accent }}>GUIDE</span>
      </div>
      {keyword ? <div style={{ marginTop: 60, opacity: tag, transform: `translateY(${(1 - tag) * 30}px)` }}>
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 48, color: C.dim }}>Напиши в коментарях</div>
        <div style={{ marginTop: 10, fontFamily: F.display, fontWeight: 900, color: accent, lineHeight: 1.1, textShadow: `0 0 80px ${accent}60`,
          fontSize: Math.min(150, 150 * 912 / measureText({ text: `«${keyword}»`, fontFamily: F.display, fontSize: 150, fontWeight: '900', validateFontIsLoaded: false }).width) }}>
          «{keyword}»
        </div>
      </div> : <div style={{ marginTop: 70, fontFamily: F.display, fontWeight: 700, fontSize: 64, lineHeight: 1.18, letterSpacing: -1, color: C.text,
        opacity: tag, transform: `translateY(${(1 - tag) * 30}px)`, whiteSpace: 'pre-line' }}>
        <Accented text={tagline} accent={accent} />
      </div>}
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
      <div style={{ opacity: ctaIn, transform: `translateY(${(1 - ctaIn) * 40}px) scale(${0.9 + ctaIn * 0.1})`, display: 'inline-flex', alignItems: 'center', gap: 18,
        padding: '28px 42px', borderRadius: 999, background: accent, color: bg ?? C.bg, fontFamily: F.body, fontWeight: 800, fontSize: 42, boxShadow: `0 30px 80px ${accent}40` }}>
        {cta} <span style={{ fontSize: 44 }}>→</span>
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 56, color: C.text, opacity: urlIn }}><span style={{ color: accent }}>↗ </span>{url}</div>
    </div>
    {offer && <div style={{ position: 'absolute', left: 84, right: 84, top: 1450, textAlign: 'center', opacity: offIn }}>
      <div style={{ display: 'inline-block', padding: '16px 30px', border: `1px solid ${C.line}`, borderRadius: 999, fontFamily: F.body, fontWeight: 600, fontSize: 36, color: '#C9D2D9' }}>{offer}</div>
    </div>}
    <AbsoluteFill style={{ background: accent, opacity: interpolate(f, [0, 10], [1, 0], clamp) }} />
  </Stage>;
};
