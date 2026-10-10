import React from 'react';
import {interpolate} from 'remotion';
import {C, F, clamp} from '../system/kit';
import {Big, Box, Browser, Cue, L, Show, StepVideo, Title, at, pop, stepFrames} from '../system/step';
import WORDS from '../../public/ideas/idea-006/words.json';

// ID-006 «Встанови Claude Desktop» (крок desktop), шорт 1080×1920. Сценарій: public/ideas/idea-006/scenario.md.
// Вікна схематичні, без логотипів і копії реального інтерфейсу.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_006 = stepFrames(WORDS);

const Bars: React.FC<{w: number[]}> = ({w}) => <>{w.map((x, i) => <div key={i} style={{width: x, height: 18, borderRadius: 9, background: '#FFFFFF1A', marginBottom: 22}} />)}</>;

const Scenes = (t: number) => {
	const tabs = a('Щоразу'), dl = a('Відкрий'), press = a('Завантаж', 10), done = a('програму'), near = a('Тепер');
	const hunt = Math.floor((t - tabs) * 5) % 8;
	const prog = interpolate(t, [press + 0.2, done], [0, 1], clamp);
	return (
		<>
			<Show t={t} a={0} b={tabs}>
				<Title t={t} section="Робоче місце" size={92}>Встанови <L>Claude Desktop</L></Title>
			</Show>
			<Show t={t} a={tabs} b={dl}>
				<Box y={380}><Big size={84}>Шукати вкладку <L>щоразу</L>?</Big></Box>
				<div style={{position: 'absolute', left: 84, width: 856, top: 720, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
					{Array.from({length: 8}, (_, i) => (
						<div key={i} style={{height: 90, borderRadius: 16, background: i === hunt ? `${C.lime}22` : '#10161C', border: `2px solid ${i === hunt ? C.lime : C.line}`, opacity: pop(t, tabs + i * 0.08)}} />
					))}
				</div>
			</Show>
			<Show t={t} a={dl} b={near}>
				<Box y={330}><Big size={80}>Завантаж і <L>встанови</L></Big></Box>
				<Browser t={t} y={600} url="claude.ai/download" typeAt={a('завантаження')} h={460}>
					<div style={{position: 'absolute', inset: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
						<div style={{padding: '26px 56px', borderRadius: 999, background: C.lime, color: C.bg, fontWeight: 800, fontSize: 46, transform: `scale(${t >= press && t < press + 0.2 ? 0.94 : 1})`}}>{t >= done ? '✓ Встановлено' : 'Завантажити'}</div>
						<div style={{width: 560, height: 16, borderRadius: 8, background: '#FFFFFF14', overflow: 'hidden', opacity: t >= press ? 1 : 0}}>
							<div style={{width: `${prog * 100}%`, height: '100%', background: C.lime}} />
						</div>
					</div>
				</Browser>
			</Show>
			<Show t={t} a={near} b={Infinity}>
				<Box y={330}><Big size={80}><L>Claude</L> поруч<br />із будь-яким вікном</Big></Box>
				<div style={{position: 'absolute', left: 84, top: 680, width: 520, height: 600, borderRadius: 26, background: '#0D1318', border: `2px solid ${C.line}`, padding: 40, opacity: pop(t, near + 0.3)}}>
					<div style={{fontFamily: F.mono, fontSize: 26, color: C.dim, marginBottom: 30}}>будь-яке вікно</div>
					<Bars w={[380, 300, 420, 260, 340, 200]} />
				</div>
				<div style={{position: 'absolute', left: 630, top: 680, width: 310, height: 600, borderRadius: 26, background: '#10161C', border: `3px solid ${C.lime}`, padding: 30, boxShadow: `0 30px 90px ${C.lime}26`, opacity: pop(t, a('поруч')), transform: `translateX(${(1 - pop(t, a('поруч'), 0.5)) * 120}px)`}}>
					<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 40, color: C.lime, marginBottom: 30}}>Claude</div>
					<Bars w={[220, 180, 240, 140]} />
				</div>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh-swirl.mp3', 0.35],
	[a('Щоразу'), 'switch-tap.mp3', 0.25], [a('вкладку'), 'switch-tap.mp3', 0.25],
	[a('завантаження'), 'typewriter-hit-soft.mp3', 0.22], [a('Завантаж', 10), 'soft-pop.wav', 0.4], [a('програму'), 'lock-digital.mp3', 0.3],
	[a('поруч'), 'whoosh-fast.mp3', 0.25], [a('Без'), 'shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea006: React.FC = () => <StepVideo dir="ideas/idea-006" words={WORDS} next="Встанови VS Code" sfx={SFX} scenes={Scenes} />;
