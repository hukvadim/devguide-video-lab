import React from 'react';
import {C, F} from '../system/kit';
import {Big, Box, Check, Cue, L, PromptCard, Show, StepVideo, Win, at, pop, prompt, stepFrames} from '../system/step';
import WORDS from '../../public/ideas/idea-012/words.json';

// ID-012 «Спершу план, потім код» (крок plan-mode), шорт 1080×1920. Сценарій: public/ideas/idea-012/scenario.md.
// Статус режиму плану з реального UI не копіюємо; план у вікні — схематичний приклад.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_012 = stepFrames(WORDS);

const FILES = ['App.jsx', 'Header.jsx', 'Menu.jsx', 'Booking.jsx', 'api.js', 'style.css'];
const Key: React.FC<{children: React.ReactNode; down: boolean}> = ({children, down}) => (
	<span style={{display: 'inline-block', padding: '30px 46px', borderRadius: 24, background: down ? C.lime : '#1B2530', color: down ? C.bg : C.text, border: `3px solid ${down ? C.lime : C.line}`, boxShadow: down ? `0 4px 0 ${C.limeDeep}` : '0 12px 0 #0A0F14', transform: `translateY(${down ? 8 : 0}px)`, fontFamily: F.mono, fontWeight: 500, fontSize: 64}}>{children}</span>
);

export const Scenes = (t: number) => {
	const mode = a('Для'), keys = a('Натисни'), reads = a('режимі'), task = a('Опиши'), plan = a('Прочитай'), code = a('Тільки'), rule = a('Правило');
	const rewrite = a('переписує'), press = a('Shift');
	return (
		<>
			<Show t={t} a={0} b={mode}>
				<Box y={250}><Big size={76}>Просиш одне —<br />а він <L c={C.red}>переписує пів проєкту</L></Big></Box>
				{FILES.map((f, i) => {
					const hit = i % 2 === 0 && t >= rewrite + i * 0.08;
					return <div key={f} style={{position: 'absolute', left: 200, width: 624, top: 640 + i * 108, opacity: pop(t, 0.2 + i * 0.15), display: 'flex', justifyContent: 'space-between', padding: '18px 28px', borderRadius: 16, background: hit ? '#FFD27A1A' : '#10161C', border: `2px solid ${hit ? '#FFD27A' : C.line}`, fontFamily: F.mono, fontSize: 36}}>
						<span>{f}</span><span style={{color: '#FFD27A', opacity: hit ? 1 : 0}}>змінено</span>
					</div>;
				})}
			</Show>
			<Show t={t} a={mode} b={keys}>
				<Box y={560}><Big size={110}>Режим<br /><L>плану</L></Big></Box>
			</Show>
			<Show t={t} a={keys} b={reads}>
				<Box y={560} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
					<Key down={t >= press && t < press + 0.5}>Shift</Key>
					<span style={{fontSize: 64, fontWeight: 900}}>+</span>
					<Key down={t >= press + 0.25 && t < press + 0.75}>Tab</Key>
				</Box>
				<Box y={900} o={pop(t, press + 0.6)}><span style={{fontSize: 52, fontWeight: 800}}>режим <L>плану</L> в Claude Code</span></Box>
			</Show>
			<Show t={t} a={reads} b={task}>
				<Box y={480}><Big size={84}>Читає проєкт<br />і пише <L>план</L></Big></Box>
				<Box y={860} o={pop(t, a('нічого'))}><span style={{display: 'inline-block', padding: '24px 44px', borderRadius: 999, background: `${C.red}1F`, border: `2px solid ${C.red}`, color: C.red, fontWeight: 800, fontSize: 50}}>🔒 нічого не змінює</span></Box>
			</Show>
			<Show t={t} a={task} b={plan}>
				<PromptCard t={t} a={a('Наприклад')} b={a('ок')} text={prompt('plan-mode', 'plan')} y={300} label="Claude Code · план" />
			</Show>
			<Show t={t} a={plan} b={code}>
				<Win y={300} label="План">
					{[['Файли', 'Booking.jsx, api/telegram.js'], ['Що додам', 'форму і відправку в Telegram'], ['Ризики', 'токен бота — лише в .env']].map(([k, v], i) => (
						<div key={k} style={{opacity: pop(t, plan + 0.2 + i * 0.3), textAlign: 'left', fontSize: 40, lineHeight: 1.35}}>
							<span style={{fontFamily: F.mono, fontSize: 30, color: C.lime, letterSpacing: 2}}>{k.toUpperCase()}</span><br />{v}
						</div>
					))}
				</Win>
				<Box y={980} o={pop(t, a('подобається'))}><span style={{fontSize: 46, fontWeight: 800}}>Не так? <L>Напиши, що змінити</L></span></Box>
				<Box y={1110} o={pop(t, a('Усе'))}><span style={{display: 'inline-block', padding: '20px 50px', borderRadius: 999, background: C.lime, color: C.bg, fontWeight: 900, fontSize: 48}}>ок ✓</span></Box>
			</Show>
			<Show t={t} a={code} b={rule}>
				<Box y={540}><Big size={104}>Тільки тепер —<br /><L>код</L></Big></Box>
				<Box y={900} o={pop(t, code + 0.4)}><span style={{fontSize: 90}}>🔓</span></Box>
			</Show>
			<Show t={t} a={rule} b={Infinity}>
				<Check t={t} a={rule} y={480}>Перед великою зміною ти бачиш план і погоджуєш або правиш його</Check>
			</Show>
		</>
	);
};

export const SFX: Cue[] = [
	[0.2, 'warp-slide.mp3', 0.2], [a('переписує'), 'bass-hit-futuristic.mp3', 0.2],
	[a('Для'), 'whoosh-swirl.mp3', 0.3], [a('Shift'), 'switch-tap.mp3', 0.4], [a('Shift') + 0.25, 'switch-tap.mp3', 0.4],
	[a('нічого'), 'lock-digital.mp3', 0.3], [a('Наприклад'), 'typewriter-hit-soft.mp3', 0.22],
	[a('Прочитай'), 'soft-pop.wav', 0.35], [a('подобається'), 'switch-tap.mp3', 0.3], [a('Усе'), 'soft-pop.wav', 0.4],
	[a('Тільки'), 'lock-digital.mp3', 0.3], [a('Правило'), 'shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea012: React.FC = () => <StepVideo dir="ideas/idea-012" words={WORDS} next="AI зламав — що робити" sfx={SFX} scenes={Scenes} />;
