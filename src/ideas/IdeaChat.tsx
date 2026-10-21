import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Bgm, F, Sfx, ramp} from '../system/kit';

// Reel «Одне фото + одне слово = результат» (чат-стиль). Фото і голос: public/ideas/idea-chat/ (voice.txt → voice.mp3).
// Старти сцен прив'язані до words.json (кадри @30): оригінал 0 · /Cinematic 99 · /Drone View 224 · /Ground Level 296 · комбо 380 · підсумок 589 · кінець 780.
const CUT = 90; // перші 3 с (постер + «Одне фото…») прибрано, сцени/голос зсунуті Sequence from={-CUT}
const END = 780;
export const IDEA_CHAT = END - CUT;
const CTA_WORD = 'КОД';

const K = {bg: '#FCFCFD', ink: '#1B1F23', dim: '#7A8590', user: '#E6F0FD', chip: '#D3E0EE', blue: '#0B57D0'};
const img = (n: string) => staticFile(`ideas/idea-chat/${n}.jpg`);

// t: [друк, думає, результат, підпис] у кадрах сцени; thumb — чи показувати появу оригіналу
type R = {parts: string[]; file: string; note: string; len: number; thumb: boolean; t: [number, number, number, number]; size?: number; intro?: string};
const ROUNDS: (R & {from: number})[] = [
	{from: 90, parts: ['/Cinematic'], file: 'cinematic', note: 'кіно-світло', len: 134, thumb: true, t: [27, 61, 83, 109]},
	{from: 224, parts: ['/Drone View'], file: 'drone', note: 'вид згори', len: 72, thumb: false, t: [4, 32, 44, 62]},
	{from: 296, parts: ['/Ground Level'], file: 'ground', note: 'вид із підлоги', len: 84, thumb: false, t: [4, 32, 44, 62]},
	{from: 380, parts: ['/Cinematic', '/Drone View'], file: 'combo', note: 'обидва ефекти разом', len: 209, thumb: false, t: [97, 147, 167, 195], size: 40, intro: 'Коди можна\nоб’єднувати'},
];

const Header: React.FC = () => (
	<div style={{position: 'absolute', left: 84, right: 84, top: 180, display: 'flex', alignItems: 'center', gap: 20, fontFamily: F.body, fontWeight: 700, fontSize: 40, color: K.ink}}>
		<div style={{width: 20, height: 20, borderRadius: 10, background: '#2BB24C'}} />
		AI-фото · чат
	</div>
);

const Round: React.FC<R> = ({parts, file, note, thumb, t, size = 52, intro}) => {
	const f = useCurrentFrame();
	const [ty, th, rs, nt] = t;
	const userIn = 1;
	const cmdIn = ramp(f, ty - 4, ty + 6);
	const total = parts.join('').length;
	let left = Math.floor(ramp(f, ty, th - 6, 0, total));
	const think = f >= th && f < rs;
	const res = ramp(f, rs, rs + 22);
	const introOp = intro ? ramp(f, 6, 20) * (1 - ramp(f, ty - 14, ty - 2)) : 0;
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Header />
			<Img src={img('original')} style={{position: 'absolute', right: 140, top: 290, width: 300, height: 300, objectFit: 'cover', borderRadius: 32, opacity: userIn, transform: `translateY(${(1 - userIn) * 40}px)`}} />
			<div style={{position: 'absolute', right: 140, top: 630, opacity: cmdIn, transform: `translateY(${(1 - cmdIn) * 30}px)`, padding: '24px 32px', borderRadius: 44, background: K.user, display: 'flex', gap: 16}}>
				{parts.map((p, i) => {
					const n = Math.max(0, Math.min(p.length, left));
					left -= p.length;
					return i === 0 || n > 0 ? (
						<span key={i} style={{fontFamily: F.mono, fontWeight: 700, fontSize: size, color: K.ink, background: K.chip, padding: '6px 22px', borderRadius: 18}}>{p.slice(0, n) || ' '}</span>
					) : null;
				})}
			</div>
			{intro ? <div style={{position: 'absolute', left: 84, right: 84, top: 900, fontFamily: F.display, fontWeight: 900, fontSize: 96, lineHeight: 1.1, letterSpacing: -2, color: K.ink, whiteSpace: 'pre-line', opacity: introOp}}>{intro}</div> : null}
			{think ? (
				<div style={{position: 'absolute', left: 84, top: 850, display: 'flex', gap: 18}}>
					{[0, 1, 2].map((i) => (
						<div key={i} style={{width: 28, height: 28, borderRadius: 14, background: K.dim, opacity: 0.35 + 0.65 * Math.abs(Math.sin((f - i * 4) / 5))}} />
					))}
				</div>
			) : null}
			<Img src={img(file)} style={{position: 'absolute', left: 84, top: 800, width: 856, height: 856, objectFit: 'cover', borderRadius: 40, boxShadow: '0 30px 80px #0002', opacity: res, filter: `blur(${(1 - res) * 40}px)`, transform: `scale(${1.05 - res * 0.05})`}} />
			<div style={{position: 'absolute', left: 84, top: 1680, fontFamily: F.body, fontWeight: 600, fontSize: 44, color: K.dim, opacity: ramp(f, nt - 14, nt)}}>{note}</div>
		</AbsoluteFill>
	);
};

const Finale: React.FC = () => {
	const f = useCurrentFrame();
	const tiles = [['cinematic', '/Cinematic'], ['drone', '/Drone View'], ['ground', '/Ground Level'], ['combo', '/Cinematic /Drone View']] as const;
	const txt = ramp(f, 50, 70);
	const pill = ramp(f, 80, 100);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<div style={{position: 'absolute', left: 84, right: 84, top: 200, fontFamily: F.display, fontWeight: 900, fontSize: 80, lineHeight: 1.1, letterSpacing: -2, color: K.ink}}>Список <span style={{color: K.blue}}>кодів</span></div>
			{tiles.map(([file, label], i) => {
				const k = ramp(f, 8 + i * 8, 30 + i * 8);
				return (
					<div key={file} style={{position: 'absolute', left: 84 + (i % 2) * 436, top: 400 + Math.floor(i / 2) * 520, width: 420, opacity: k, transform: `scale(${0.92 + k * 0.08})`}}>
						<Img src={img(file)} style={{width: 420, height: 420, objectFit: 'cover', borderRadius: 28, display: 'block'}} />
						<div style={{marginTop: 14, fontFamily: F.mono, fontWeight: 700, fontSize: 28, color: K.ink}}>{label}</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: 84, right: 140, top: 1470, textAlign: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 48, color: K.ink, opacity: txt}}>
				Напиши в коментарях
			</div>
			<div style={{position: 'absolute', left: 0, right: 56, top: 1540, display: 'flex', justifyContent: 'center', opacity: pill, transform: `translateY(${(1 - pill) * 30}px)`}}>
				<div style={{padding: '20px 56px', borderRadius: 999, background: K.blue, color: '#fff', fontFamily: F.display, fontWeight: 900, fontSize: 64}}>{CTA_WORD}</div>
			</div>
		</AbsoluteFill>
	);
};

export const IdeaChat: React.FC = () => (
	<AbsoluteFill style={{background: K.bg}}>
	<Sequence from={-CUT}>
		{ROUNDS.map((r) => (
			<Sequence key={r.file} from={r.from} durationInFrames={r.len} name={r.parts.join(' ')}><Round {...r} /></Sequence>
		))}
		<Sequence from={589} durationInFrames={END - 589} name="Finale"><Finale /></Sequence>
		<Audio src={staticFile('ideas/idea-chat/voice.mp3')} volume={1} />
		{ROUNDS.map((r) => (
			<React.Fragment key={r.file}>
				
				<Sfx at={r.from + r.t[0]} src="typing/typewriter-hit-soft.mp3" vol={0.12} dur={40} />
				<Sfx at={r.from + r.t[2]} src="whoosh/whoosh-fast.mp3" vol={0.2} dur={40} />
			</React.Fragment>
		))}
		<Sfx at={589 + 80} src="pop/soft-pop.wav" vol={0.3} dur={30} />
		</Sequence>
		<Bgm offsetSec={0} total={IDEA_CHAT} vol={0.1} />
	</AbsoluteFill>
);
