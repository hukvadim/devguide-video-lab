import React from 'react';
import {C, F} from '../system/kit';
import {Big, Box, Check, Cue, L, Pill, Show, Steps, StepVideo, Title, at, pop, stepFrames} from '../system/step';
import WORDS from '../../public/ideas/idea-005/words.json';

// ID-005 «Обери підписку» (крок plan), шорт 1080×1920. Сценарій: public/ideas/idea-005/scenario.md.
// Цін немає: у програмі їх немає, сайт не звіряли. Тексти карток — із підпису слайда програми.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_005 = stepFrames(WORDS);

const Scenes = (t: number) => {
	const three = a('Є'), start = a('Тож'), price = a('Актуальні'), check = a('Перевір');
	return (
		<>
			<Show t={t} a={0} b={three}>
				<Title t={t} section="Старт за вечір">Обери <L>підписку</L></Title>
			</Show>
			<Show t={t} a={three} b={start}>
				<Box y={330}><Big size={84}>Три <L>варіанти</L></Big></Box>
				<Steps t={t} y={560} gap={220} nsize={64} size={44} items={[
					['Free', 'спробувати', a('Free')],
					['Pro', 'навчання і перші сайти', a('Pro')],
					['Max', 'щодня по кілька годин, коли впираєшся в ліміти', a('Max')],
				]} />
				<Box y={1250} o={pop(t, a('На', 8)) * (t < a('Max') ? 1 : 0)}><Pill>Pro: на старті вистачає</Pill></Box>
			</Show>
			<Show t={t} a={start} b={price}>
				<Box y={480}><Big size={110}>Почни з <L>Pro</L></Big></Box>
				<Box y={800} o={pop(t, a('Max', 17))}>
					<div style={{fontFamily: F.body, fontWeight: 800, fontSize: 54, lineHeight: 1.3}}>→ <L>Max</L>, коли лімітів замало</div>
				</Box>
			</Show>
			<Show t={t} a={price} b={check}>
				<Box y={480}><Big size={92}>Актуальні <L>ціни</L></Big></Box>
				<Box y={760} o={pop(t, a('офіційній'))}><span style={{fontFamily: F.mono, fontSize: 56, color: C.text}}>claude.com/pricing</span></Box>
			</Show>
			<Show t={t} a={check} b={Infinity}>
				<Check t={t} a={check} y={500}>Знаєш, чим твій тариф відрізняється від сусіднього і коли варто перейти</Check>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.35],
	[a('Free'), 'click/switch-tap.mp3', 0.35], [a('Pro'), 'sparkle/sparkle-touch.mp3', 0.35], [a('Max'), 'click/switch-tap.mp3', 0.35],
	[a('Тож'), 'pop/soft-pop.wav', 0.4], [a('Актуальні'), 'typing/typewriter-hit-soft.mp3', 0.22],
	[a('Перевір'), 'click/lock-digital.mp3', 0.3],
];

export const Idea005: React.FC = () => <StepVideo dir="ideas/idea-005" words={WORDS} next="Перше питання до AI" sfx={SFX} scenes={Scenes} />;
