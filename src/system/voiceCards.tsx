import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, Sfx, Stage, clamp} from './kit';
import {Card, M, beat} from './beat';
import {Captions, PatternBg, S} from './step';
import {chunkWords} from './captions';
import {ThemeProvider} from './theme';

// Озвучені ролики з карток (ADS, ADS-Team): межі карток — секунди слів голосу (words.json від scripts/tts.mjs).
export type Word = {w: string; s: number; e: number};
export const TAIL = 3; // фінальна картка тримається після голосу
export const voiceFrames = (words: Word[]) => S(words[words.length - 1].e + TAIL);

/** Картки BeatVideo, але межі = секунди слів (starts[i] — початок картки i); субтитри лише на картках caps. cover — секунда для кадру 0. */
export const VoiceCards: React.FC<{cards: Card[]; words: Word[]; dir: string; track: string; starts: number[]; caps: number[]; cover: number; musicVol?: number}> = ({cards, words, dir, track, starts, caps, cover, musicVol = 0.1}) => {
	const frame = useCurrentFrame();
	const t = frame === 0 ? cover : frame / 30;
	const end = words[words.length - 1].e;
	const total = end + TAIL;
	const spans = cards.map((c, i) => ({c, i, a: Math.max(0, starts[i] - 0.15), z: (starts[i + 1] ?? total + 0.15) - 0.15}));
	const chunks = React.useMemo(() => chunkWords(words, 30), [words]);
	const cur = spans.find(({a, z}) => t >= a && t < z);
	return (
		<ThemeProvider theme="brand">
			<Stage glow={[760, 420]} grid>
				<PatternBg t={t} />
				<Audio src={staticFile(`${dir}/voice.mp3`)} />
				<Audio src={staticFile(M(track))} trimBefore={S(beat(track).offset)} volume={(f) => interpolate(f, [0, 15, S(end), S(end) + 10, S(total - 1), S(total)], [0, musicVol, musicVol, 0.3, 0.3, 0], clamp)} />
				{spans.map(({c, a}, i) => (c.sfx ? <Sfx key={i} at={S(a + (c.off ?? 0))} src={c.sfx} vol={(c.vol ?? 0.22) * 0.8} dur={45} /> : null))}
				{cur ? <AbsoluteFill key={cur.i}>{cur.c.el(t, cur.a, cur.z)}</AbsoluteFill> : null}
				{frame > 0 && cur && caps.includes(cur.i) ? <Captions t={t} chunks={chunks} size={48} /> : null}
			</Stage>
		</ThemeProvider>
	);
};

// Стрічка 4:5 (1080×1350): той самий ролик ×0.85 по центру; обрізається лише поза safe area (y<166, y>1754 оригіналу)
const K45 = 0.85;
export const feed45 = (Video: React.FC): React.FC => () => (
	<AbsoluteFill style={{background: C.bg}}>
		<div style={{position: 'absolute', left: (1080 - 1080 * K45) / 2, top: (1350 - 1920 * K45) / 2, width: 1080, height: 1920, transform: `scale(${K45})`, transformOrigin: 'top left'}}>
			<Video />
		</div>
	</AbsoluteFill>
);
