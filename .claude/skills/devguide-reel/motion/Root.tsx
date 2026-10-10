import React from 'react';
import { Composition } from 'remotion';
import { Broll, BrollProps } from './Broll';
import { Text, TextProps } from './Text';
import { Intro, IntroProps, Outro, OutroProps } from './Wrap';

const meta = ({ props }: { props: { dur: number; w: number; h: number } }) =>
  ({ durationInFrames: Math.max(1, Math.round(props.dur * 30)), width: props.w, height: props.h });

const broll: BrollProps = { layout: 'fan', images: ['example.webp'], dur: 3, w: 1080, h: 1920 };
const text: TextProps = {
  w: 1080, h: 1920, dur: 6, capY: 1490, capAnchor: 'bottom', hits: [2.2],
  words: 'Всім тим, хто любить розвиватися. Дивіться, що в мене вийшло буквально за якусь годину часу.'.split(' ')
    .map((w, i) => ({ s: 0.2 + i * 0.32, e: 0.5 + i * 0.32, w, em: /годину/.test(w) })),
  title: { t: 0, dur: 2.6, text: 'Відео, сайт, гра — *по годині*', y: 420 },
  callouts: [{ t: 3, dur: 2.6, text: 'Сайт, який *продали за 3 дні*', y: 330 }],
};
const intro: IntroProps = { w: 1080, h: 1920, dur: 4, kicker: 'DevGuide · практика', big: 'ДЕНЬ 5', sub: 'Відео, сайт і гра —\n*з нейромережею*' };
const outro: OutroProps = { w: 1080, h: 1920, dur: 7, offer: 'Перше заняття — 30 хвилин, безкоштовно' };
const outroKeyword: OutroProps = { w: 1080, h: 1920, dur: 7, keyword: 'САЙТ', cta: 'Надішлю матеріал у Direct' };

export const Root: React.FC = () => <>
  <Composition id="Broll" component={Broll} fps={30} width={1080} height={1920} durationInFrames={90} defaultProps={broll} calculateMetadata={meta} />
  <Composition id="Text" component={Text} fps={30} width={1080} height={1920} durationInFrames={180} defaultProps={text} calculateMetadata={meta} />
  <Composition id="Intro" component={Intro} fps={30} width={1080} height={1920} durationInFrames={120} defaultProps={intro} calculateMetadata={meta} />
  <Composition id="Outro" component={Outro} fps={30} width={1080} height={1920} durationInFrames={210} defaultProps={outro} calculateMetadata={meta} />
  <Composition id="OutroKeyword" component={Outro} fps={30} width={1080} height={1920} durationInFrames={210} defaultProps={outroKeyword} calculateMetadata={meta} />
</>;
