import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { C, F } from './theme';
import { Card, Cards } from './Cards';
import { ELEMENTS } from './Elements';
import { Text } from './Text';

// Visual reference for docs/ELEMENTS.md: every element / caption combo in turn, labelled with its code.
// A grey silhouette stands in for the speaker so side placement reads like in a real reel.
export const LIFE = 3.5, GAP = 1.2, STEP = LIFE + GAP; // seconds: element on screen, then an empty stage before the next
export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// the original five cards live in Cards.tsx under old names
const OLD: Record<string, { name: string; demo: Record<string, unknown> }> = {
  A01: { name: 'Хлібні крихти', demo: { steps: ['Налаштування', 'Skills', 'Огляд'], active: 0, marks: [1, 2] } },
  B01: { name: 'Картка скілу', demo: { name: 'design-critique', author: 'Anthropic', meta: ['UI', 'рев\'ю'], desc: 'Розбирає макет і каже, що виправити' } },
  C01: { name: 'Чат', demo: { prompt: '/design-critique мій макет', reply: 'Кнопка губиться: збільш контраст.' } },
  F01: { name: 'Список /пункт', demo: { title: 'Скіл спрацює, коли', items: ['ти його попросиш', 'задача повторюється'] } },
  F02: { name: 'Стек карток', demo: { items: ['Промпт', 'Скіл', 'Агент'], active: 1, caption: 'обираєш один' } },
};
const ALL = { ...ELEMENTS, ...OLD };
export const codesOf = (group?: string) => Object.keys(ALL).sort().filter((c) => !group || c[0] === group);

const Stage: React.FC<{ label: string; name: string; next?: string }> = ({ label, name }) => <AbsoluteFill style={{ background: 'radial-gradient(circle at 60% 40%, #26323C, #080B0E 70%)' }}>
  <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    <circle cx="700" cy="760" r="170" fill="#3A4550" />
    <path d="M380 1920 C380 1260 520 1020 700 1020 C880 1020 1020 1260 1020 1920 Z" fill="#3A4550" />
  </svg>
  <div style={{ position: 'absolute', left: 84, top: 1690, padding: '10px 18px', borderRadius: 14, background: 'rgba(8,11,14,.85)' }}>
    <div style={{ fontFamily: F.mono, fontSize: 44, color: C.lime }}>{label}</div>
    {name && <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 38, color: C.text }}>{name}</div>}
  </div>
</AbsoluteFill>;

export const Catalog: React.FC<{ w: number; h: number; dur: number; group?: string }> = ({ w, group }) => <AbsoluteFill>
  {codesOf(group).map((code, i) => <Sequence key={code} from={Math.round(i * STEP * 30)} durationInFrames={Math.round(STEP * 30)}>
    <Stage label={code} name={ALL[code].name} />
    <Cards w={w} h={1920} dur={LIFE} cards={[{ type: code, t: 0, dur: LIFE, ...ALL[code].demo } as Card]} />
  </Sequence>)}
</AbsoluteFill>;

// every S and T code appears at least once
export const CAP_COMBOS = ['S01', 'S02', 'S03+T03', 'S04+T02', 'S05+T30', 'S06+T06+T36', 'S07+T04', 'S08+T13', 'S09+T15', 'S10+T05+T29',
  'S02+T07+T26', 'S02+T08+T37', 'S01+T11+T27', 'S02+T12', 'S02+T14+T28', 'S01+T17+T38', 'S02+T18+T33', 'S01+T24+T39', 'S02+T25+T31+T32',
  'S02+T09', 'S01+T10', 'S02+T16', 'S01+T19', 'S02+T20', 'S02+T21', 'S01+T22', 'S02+T23', 'S02+T34', 'S02+T35',
  'S02+T40', 'S02+T41', 'S01+T42', 'S01+T43', 'S02+T44', 'S01+T45', 'S02+T46', 'S02+T47', 'S02+T48', 'S02+T49', 'S02+T50'];
const SAMPLE = 'Скіл спрацює сам, коли задача повторюється 5 разів, і ти *не пишеш* промпт заново'.split(' ');
const SLOGAN = 'Один скіл *замість* сотні промптів'.split(' ');
const words = (list: string[], gap: number) => list.map((x, k) => ({ s: 0.15 + k * gap, e: 0.15 + k * gap + gap * 0.9, w: x.replace(/\*/g, ''), em: x.includes('*') }));
const isSlogan = (cap: string) => /T4[0-5]/.test(cap);

export const CapCatalog: React.FC<{ w: number; h: number; dur: number }> = ({ w }) => <AbsoluteFill>
  {CAP_COMBOS.map((cap, i) => <Sequence key={cap} from={Math.round(i * STEP * 30)} durationInFrames={Math.round(STEP * 30)}>
    <Stage label={cap} name="" />
    <Sequence durationInFrames={Math.round(LIFE * 30)} layout="none">
      <Text w={w} h={1920} dur={LIFE} capY={1180} capAnchor="bottom" cap={cap} callouts={[]} hits={[]} words={isSlogan(cap) ? words(SLOGAN, 0.45) : words(SAMPLE, 0.2)} />
    </Sequence>
  </Sequence>)}
</AbsoluteFill>;
