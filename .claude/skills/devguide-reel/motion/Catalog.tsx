import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { C, F } from './theme';
import { Cards } from './Cards';
import { ELEMENTS } from './Elements';
import { Text } from './Text';

// Visual reference for docs/ELEMENTS.md: every implemented element / caption combo in turn, labelled with its code.
// A grey silhouette stands in for the speaker so side placement reads like in a real reel.
export const STEP = 3; // seconds per item
export const CAP_COMBOS = ['S01', 'S02', 'S03+T03', 'S04+T02', 'S05+T30', 'S06+T06+T36', 'S07+T04', 'S08+T13', 'S09+T15', 'S10+T05+T29',
  'S02+T07+T26', 'S02+T08+T37', 'S01+T11+T27', 'S02+T12', 'S02+T14+T28', 'S01+T17+T38', 'S02+T18+T33', 'S01+T24+T39', 'S02+T25+T31+T32', 'S02+T49', 'S02+T48'];

const Stage: React.FC<{ label: string; name: string }> = ({ label, name }) => <AbsoluteFill style={{ background: 'radial-gradient(circle at 60% 40%, #26323C, #080B0E 70%)' }}>
  <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    <circle cx="700" cy="760" r="170" fill="#3A4550" />
    <path d="M380 1920 C380 1260 520 1020 700 1020 C880 1020 1020 1260 1020 1920 Z" fill="#3A4550" />
  </svg>
  <div style={{ position: 'absolute', left: 84, top: 1700, fontFamily: F.mono, fontSize: 40, color: C.lime }}>{label}</div>
  <div style={{ position: 'absolute', left: 84, top: 1752, fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.text }}>{name}</div>
</AbsoluteFill>;

export const Catalog: React.FC<{ w: number; h: number; dur: number }> = ({ w }) => {
  const codes = Object.keys(ELEMENTS);
  return <AbsoluteFill>
    {codes.map((code, i) => <Sequence key={code} from={i * STEP * 30} durationInFrames={STEP * 30}>
      <Stage label={code} name={ELEMENTS[code].name} />
      <Cards w={w} h={1920} dur={STEP} cards={[{ type: code as `E${number}`, t: 0, dur: STEP, ...ELEMENTS[code].demo }]} />
    </Sequence>)}
  </AbsoluteFill>;
};

const SAMPLE = 'Скіл спрацює сам, коли задача повторюється, і ти *не пишеш* промпт заново'.split(' ');
export const CapCatalog: React.FC<{ w: number; h: number; dur: number }> = ({ w }) => <AbsoluteFill>
  {CAP_COMBOS.map((cap, i) => <Sequence key={cap} from={i * STEP * 30} durationInFrames={STEP * 30}>
    <Stage label={cap} name="" />
    <Text w={w} h={1920} dur={STEP} capY={1180} capAnchor="bottom" cap={cap} callouts={[]} hits={[]}
      words={SAMPLE.map((x, k) => ({ s: 0.15 + k * 0.2, e: 0.33 + k * 0.2, w: x.replace(/\*/g, ''), em: x.startsWith('*') || x.endsWith('*') }))} />
  </Sequence>)}
</AbsoluteFill>;
