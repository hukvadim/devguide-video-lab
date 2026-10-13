import React from 'react';
import {C, F} from '../system/kit';
import {Big, Box, Browser, Check, Chips, Cue, Field, L, Show, StepVideo, Title, at, pop, stepFrames} from '../system/step';
import WORDS from '../../public/ideas/idea-004/words.json';

// ID-004 «Створи акаунт» (крок account), шорт 1080×1920. Сценарій: public/ideas/idea-004/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_004 = stepFrames(WORDS);

const Btn: React.FC<{on: boolean; o: number; children: React.ReactNode}> = ({on, o, children}) => (
	<div style={{opacity: o, transform: `scale(${0.9 + o * 0.1})`, padding: '30px 0', borderRadius: 26, textAlign: 'center', background: on ? `${C.lime}1F` : '#1B2530', border: `3px solid ${on ? C.lime : C.line}`, fontWeight: 800, fontSize: 48}}>{children}</div>
);

const Scenes = (t: number) => {
	const site = a('Відкрий'), reg = a('Зареєструйся'), all = a('цим'), check = a('Як');
	return (
		<>
			<Show t={t} a={0} b={site}>
				<Title t={t} section="Старт за вечір">Створи <L>акаунт</L></Title>
				<Box y={900} o={pop(t, 1.2)}><span style={{fontFamily: F.mono, fontSize: 40, color: C.dim}}>≈ 5 хвилин</span></Box>
			</Show>
			<Show t={t} a={site} b={reg}>
				<Box y={380}><Big size={84}>Офіційний <L>сайт</L></Big></Box>
				<Browser t={t} y={640} url="claude.ai" typeAt={a('офіційний')} h={420}>
					<div style={{position: 'absolute', inset: 60, display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'center', justifyContent: 'center'}}>
						{[420, 300, 360].map((w) => <div key={w} style={{width: w, height: 22, borderRadius: 11, background: '#FFFFFF1A'}} />)}
					</div>
				</Browser>
			</Show>
			<Show t={t} a={reg} b={all}>
				<Box y={380}><Big size={84}>Обери<br /><L>будь-який</L> спосіб</Big></Box>
				<div style={{position: 'absolute', left: 184, width: 656, top: 720, display: 'flex', flexDirection: 'column', gap: 34}}>
					<Btn o={pop(t, reg + 0.3)} on={t >= reg + 0.4 && t < a('пошту')}>Google-акаунт</Btn>
					<Btn o={pop(t, reg + 0.5)} on={t >= a('пошту')}>Пошта</Btn>
				</div>
				<Box y={1150} o={pop(t, a('Це', 11))}><span style={{fontFamily: F.mono, fontSize: 40, color: C.dim}}>кілька хвилин</span></Box>
			</Show>
			<Show t={t} a={all} b={check}>
				<Box y={430}><Big size={92}>Один акаунт —<br />на <L>всі кроки</L></Big></Box>
				<Chips t={t} y={820} items={[['Чат', a('працюватимемо')], ['Claude Desktop', a('всіх')], ['Claude Code', a('наступних')]]} size={44} />
			</Show>
			<Show t={t} a={check} b={Infinity}>
				<Check t={t} a={check} y={420}>Бачиш поле для повідомлення на claude.ai</Check>
				<Field t={t} y={900} o={pop(t, a('поле'), 0.45)} />
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.35],
	[a('офіційний'), 'typing/typewriter-hit-soft.mp3', 0.22],
	[a('Google'), 'pop/soft-pop.wav', 0.4], [a('пошту'), 'pop/soft-pop.wav', 0.4],
	[a('працюватимемо'), 'pop/soft-pop.wav', 0.3], [a('всіх'), 'pop/soft-pop.wav', 0.3], [a('наступних'), 'pop/soft-pop.wav', 0.3],
	[a('Як'), 'click/lock-digital.mp3', 0.3], [a('Значить'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea004: React.FC = () => <StepVideo dir="ideas/idea-004" words={WORDS} next="Обери підписку" sfx={SFX} scenes={Scenes} />;
