import React from 'react';
import {C, F} from '../system/kit';
import {Big, Box, Check, Cue, L, Show, Steps, StepVideo, Title, Win, at, pop, stepFrames, Mono} from '../system/step';
import WORDS from '../../public/ideas/idea-007/words.json';

// ID-007 «Встанови VS Code» (крок vscode), шорт 1080×1920. Сценарій: public/ideas/idea-007/scenario.md.
// Вікно редактора схематичне, без логотипу. File → Open Folder — назва пункту в англійському інтерфейсі.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_007 = stepFrames(WORDS);

const Scenes = (t: number) => {
	const what = a('Це'), three = a('Три'), open = a('Відкрий'), check = a('Перевірка'), more = a('Детальна');
	return (
		<>
			<Show t={t} a={0} b={what}>
				<Title t={t} section="Робоче місце">Встанови <L>VS Code</L></Title>
			</Show>
			<Show t={t} a={what} b={three}>
				<Box y={480}><Big size={84}>Редактор, де <L>Claude Code</L> працюватиме з проєктом</Big></Box>
			</Show>
			<Show t={t} a={three} b={open}>
				<Box y={330}><Big size={84}>Три <L>кроки</L></Big></Box>
				<Steps t={t} y={560} gap={200} items={[
					['1', <>Завантаж з <Mono size={38}>code.visualstudio.com</Mono></>, a('Перший')],
					['2', 'Встанови', a('Другий')],
					['3', <>Створи папку <Mono>my-first-site</Mono></>, a('Третій')],
				]} />
			</Show>
			<Show t={t} a={open} b={check}>
				<Box y={330}><Big size={84}>Відкрий <L>папку</L></Big></Box>
				<Win y={560} label="VS Code" mono>
					<div style={{fontSize: 38, textAlign: 'left', color: t >= a('меню') ? C.text : C.dim}}>
						File <span style={{color: C.dim}}>→</span> <span style={{color: t >= a('Open') ? C.lime : C.text}}>Open Folder…</span>
					</div>
					<div style={{height: 2, background: C.line}} />
					<div style={{fontSize: 34, textAlign: 'left', opacity: pop(t, a('Open') + 0.4), lineHeight: 1.6}}>
						<div style={{color: C.text}}>▾ MY-FIRST-SITE</div>
						<div style={{color: C.dim, paddingLeft: 40}}>(порожньо)</div>
					</div>
				</Win>
			</Show>
			<Show t={t} a={check} b={Infinity}>
				<Check t={t} a={check} y={420}>VS Code відкриває порожню папку <Mono>my-first-site</Mono></Check>
				<Box y={1000} o={pop(t, more)}><span style={{fontSize: 42, fontWeight: 700, color: '#C9D2D9'}}>Детально — у матеріалі на devguide.com.ua</span></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh-swirl.mp3', 0.35],
	[a('Перший'), 'soft-pop.wav', 0.4], [a('Другий'), 'soft-pop.wav', 0.4], [a('Третій'), 'soft-pop.wav', 0.4],
	[a('меню'), 'switch-tap.mp3', 0.35], [a('Open'), 'lock-digital.mp3', 0.3],
	[a('Перевірка'), 'shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea007: React.FC = () => <StepVideo dir="ideas/idea-007" words={WORDS} next="Встанови Claude Code" sfx={SFX} scenes={Scenes} />;
