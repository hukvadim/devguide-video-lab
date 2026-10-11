import React from 'react';
import {F, ramp} from '../system/kit';
import {Big, Box, Browser, Check, Cue, L, PromptCard, Show, StepVideo, Term, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import WORDS from '../../public/ideas/idea-013/words.json';

// ID-013 «AI зламав — що робити» (крок ai-broke), шорт 1080×1920. Сценарій: public/ideas/idea-013/scenario.md.
// Симуляція замість живого запису (рішення Вадима); тривалість виправлення не називаємо.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_013 = stepFrames(WORDS);

/** Сторінка «Зерно»: broken 0..1 — блоки розʼїжджаються й червоніють. */
const Page: React.FC<{broken: number}> = ({broken}) => { const T = useTheme(); return (
	<div style={{position: 'absolute', inset: 0, padding: 44, display: 'flex', flexDirection: 'column', gap: 24, background: 'linear-gradient(160deg, #2A1D14, #120D09)'}}>
		{[[620, 90, -14, 40], [460, 24, 22, -60], [380, 24, -8, 90], [260, 70, 30, 30]].map(([w, h, r, dx], i) => (
			<div key={i} style={{width: w, height: h, borderRadius: 12, background: i === 0 ? '#F7E7D0' : i === 3 ? '#E9C9A0' : '#F7E7D044', transform: `translateX(${dx * broken}px) rotate(${r * broken}deg)`, outline: broken > 0.1 ? `3px solid ${T.red}` : 'none'}} />
		))}
	</div>
); };
const Num: React.FC<{n: string; children: React.ReactNode}> = ({n, children}) => (
	<Box y={200}><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 64}}><L>{n}</L> · {children}</span></Box>
);

export const Scenes = (t: number) => {
	const T = useTheme();
	const four = a('Чотири'), s1 = a('Перший'), s2 = a('Другий'), s3 = a('Третій'), s4 = a('Четвертий'), calm = a('Головне');
	const esc = a('Esc'), back = a('Сторінка');
	return (
		<>
			<Show t={t} a={0} b={four}>
				<Box y={260}><Big size={88}>AI <L c={T.red}>зламав</L><br />сторінку</Big></Box>
				<Browser t={t} y={620} url="localhost:5173" h={480}><Page broken={ramp(t, 0.8, 1.6)} /></Browser>
			</Show>
			<Show t={t} a={four} b={s1}>
				<Box y={560}><Big size={200}><L>4</L></Big></Box>
				<Box y={830}><Big size={88}>кроки</Big></Box>
			</Show>
			<Show t={t} a={s1} b={s2}>
				<Num n="1">Зупини AI</Num>
				<Box y={480} o={pop(t, a('Натисни'))}>
					<span style={{display: 'inline-block', padding: '30px 56px', borderRadius: 24, background: t >= esc ? T.accent : T.panel2, color: t >= esc ? T.onAccent : T.text, border: `3px solid ${t >= esc ? T.accent : T.line}`, fontFamily: F.mono, fontSize: 72}}>Esc</span>
				</Box>
				<Term t={t} y={780} lines={[{at: s1, text: 'переписую Header.jsx…', kind: 'out'}, {at: esc, text: '⏹ зупинено', kind: 'err'}]} />
			</Show>
			<Show t={t} a={s2} b={s3}>
				<Num n="2">Відкоти через git</Num>
				<Term t={t} y={330} lines={[{at: a('відкоти'), text: 'git restore .'}, {at: back, text: '✓ сторінка як була', kind: 'ok'}]} />
				<Browser t={t} y={700} url="localhost:5173" h={420}><Page broken={1 - ramp(t, back - 0.3, back + 0.5)} /></Browser>
			</Show>
			<Show t={t} a={s3} b={s4}>
				<Num n="3">Опиши баг</Num>
				<PromptCard t={t} a={a('Що', s3)} b={a('виправляти')} text={prompt('ai-broke', 'bug')} y={320} size={38} label="Шаблон бага" />
			</Show>
			<Show t={t} a={s4} b={calm}>
				<Num n="4">Новий чат</Num>
				<Box y={330} o={pop(t, a('колу'))} style={{opacity: pop(t, a('колу')) * (1 - ramp(t, a('Попроси', s4) - 0.3, a('Попроси', s4)))}}>
					<span style={{display: 'inline-block', fontSize: 150, transform: `rotate(${(t - a('колу')) * 360}deg)`}}>↻</span>
					<div style={{fontSize: 46, fontWeight: 800, color: T.red}}>по колу втретє</div>
				</Box>
				<Show t={t} a={a('Попроси', s4)} b={calm}>
					<PromptCard t={t} a={a('Попроси', s4)} b={a('чату')} text={prompt('ai-broke', 'handoff')} y={320} size={38} />
					<Term t={t} y={900} o={pop(t, a('команда', s4) - 0.3)} lines={[{at: a('команда', s4), text: '/clear'}, {at: a('Встав', s4), text: '✓ новий чат: підсумок + опис бага', kind: 'ok'}]} />
				</Show>
			</Show>
			<Show t={t} a={calm} b={Infinity}>
				<Box y={300}><Big size={76}>Поки є git —<br /><L>нічого не втрачено</L></Big></Box>
				<Check t={t} a={a('Поки')} y={720}>Відкотив невдалу зміну через git і вирішив задачу в новому чаті</Check>
			</Show>
		</>
	);
};

export const SFX: Cue[] = [
	[0.8, 'stomp-apocalyptic.mp3', 0.2], [a('Чотири'), 'impact-cine-big.mp3', 0.3],
	[a('Esc'), 'switch-tap.mp3', 0.45], [a('відкоти'), 'typewriter-hit-soft.mp3', 0.22], [a('Сторінка'), 'whoosh-fast.mp3', 0.25],
	[a('Що', a('Третій')), 'typewriter-hit-soft.mp3', 0.2], [a('колу'), 'warp-slide.mp3', 0.2],
	[a('Попроси', a('Четвертий')), 'soft-pop.wav', 0.35], [a('команда', a('Четвертий')), 'transition-snap.mp3', 0.3],
	[a('Поки'), 'shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea013: React.FC = () => <StepVideo dir="ideas/idea-013" words={WORDS} next="Безпечно з AI" sfx={SFX} scenes={Scenes} />;
