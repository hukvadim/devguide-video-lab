import React from 'react';
import {C, F, ramp} from '../system/kit';
import {Big, Box, Browser, Check, Chips, Cue, L, PromptCard, Show, StepVideo, Strike, Term, Title, at, pop, prompt, stepFrames, Mono} from '../system/step';
import WORDS from '../../public/ideas/idea-009/words.json';

// ID-009 «Claude Code: перший проєкт» (крок claude-code), шорт 1080×1920. Сценарій: public/ideas/idea-009/scenario.md.
// Порт 5173 — типовий для Vite; підписано, що адреса може відрізнятися.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_009 = stepFrames(WORDS);

const Scenes = (t: number) => {
	const rule = a('Головне'), open = a('Відкрий'), paste = a('Встав'), plan = a('покаже'), build = a('Тепер'), browser = a('Відкрий', 41), idea = a("Кав'ярню"), next = a('Далі', 49);
	return (
		<>
			<Show t={t} a={0} b={rule}>
				<Title t={t} section="Робоче місце">Перший <L>проєкт</L></Title>
			</Show>
			<Show t={t} a={rule} b={open}>
				<Box y={560}><Big size={104}>Спершу <L>план</L>,<br />потім код</Big></Box>
			</Show>
			<Show t={t} a={open} b={paste}>
				<Box y={330}><Big size={80}>Порожня папка →<br /><L>Claude Code</L></Big></Box>
				<Term t={t} y={680} lines={[{at: a('запусти'), text: 'claude'}, {at: a('терміналі'), text: '✓ Claude Code готовий', kind: 'ok'}]} />
			</Show>
			<Show t={t} a={paste} b={plan}>
				<PromptCard t={t} a={paste + 0.2} b={a('відкрити')} text={prompt('claude-code', 'first-project')} y={260} label="Claude Code" />
				<Chips t={t} y={1240} items={[['ЩО', a('Що')], ['ЯК', a('Як')], ['В КІНЦІ', a('кінці')]]} />
			</Show>
			<Show t={t} a={plan} b={build}>
				<Box y={300}><Big size={84}>Спершу <L>план</L></Big></Box>
				<Term t={t} y={540} size={36} lines={[
					{at: plan, text: 'План:', kind: 'out'},
					{at: a('структуру'), text: '📁 src/components, src/App.jsx', kind: 'out'},
					{at: a('блоки'), text: 'Блоки: Hero · Меню · Про нас · Контакти', kind: 'out'},
					{at: a('сторінки') + 0.4, text: 'Чекаю на твоє «ок»', kind: 'ok'},
					{at: a('ок', 34), text: 'ок'},
				]} />
				<Box y={1180} o={pop(t, a('Щось'))}><span style={{fontSize: 46, fontWeight: 800}}>Не так? <L>Виправ словами</L></span></Box>
			</Show>
			<Show t={t} a={build} b={browser}>
				<Box y={330}><Big size={84}>Сайт <L>запускається</L></Big></Box>
				<Term t={t} y={600} size={36} lines={[
					{at: a('створює'), text: 'створюю файли…', kind: 'out'},
					{at: a('dev-сервер'), text: '✓ dev server running', kind: 'ok'},
					{at: a('localhost'), text: '➜ Local: http://localhost:5173/', kind: 'ok'},
				]} />
			</Show>
			<Show t={t} a={browser} b={idea}>
				<Box y={260}><Big size={72}>Твій сайт <L>на твоєму</L> комп'ютері</Big></Box>
				<Browser t={t} y={520} url="localhost:5173" h={560}>
					<div style={{position: 'absolute', inset: 0, padding: 50, display: 'flex', flexDirection: 'column', gap: 26, background: 'linear-gradient(160deg, #2A1D14, #120D09)'}}>
						<div style={{fontFamily: F.mono, fontSize: 26, color: '#E9C9A0', letterSpacing: 4}}>КАВ'ЯРНЯ</div>
						<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 110, color: '#F7E7D0', opacity: pop(t, browser + 0.4)}}>Зерно</div>
						<div style={{width: 420, height: 18, borderRadius: 9, background: '#F7E7D033'}} />
						<div style={{width: 320, height: 18, borderRadius: 9, background: '#F7E7D033'}} />
						<div style={{alignSelf: 'flex-start', padding: '18px 40px', borderRadius: 999, background: '#E9C9A0', color: '#120D09', fontWeight: 800, fontSize: 36}}>Меню</div>
					</div>
				</Browser>
				<Box y={1200}><span style={{fontFamily: F.mono, fontSize: 30, color: C.dim}}>адреса може відрізнятися</span></Box>
			</Show>
			<Show t={t} a={idea} b={next}>
				<Box y={500}><Big size={76}><Strike p={ramp(t, a('дужках'), a('дужках') + 0.5)}>[кав'ярні «Зерно»]</Strike></Big></Box>
				<Box y={760} o={pop(t, a('свою'))}><Big size={104}>→ <L>твоя ідея</L></Big></Box>
			</Show>
			<Show t={t} a={next} b={Infinity}>
				<Check t={t} a={next} y={500}>Сайт відкривається за адресою <Mono>localhost</Mono> у браузері</Check>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh-swirl.mp3', 0.35],
	[a('запусти'), 'typewriter-hit-soft.mp3', 0.22], [a('Встав'), 'typewriter-hit-soft.mp3', 0.22],
	[a('Що'), 'soft-pop.wav', 0.4], [a('Як'), 'soft-pop.wav', 0.4], [a('кінці'), 'soft-pop.wav', 0.4],
	[a('блоки'), 'soft-pop.wav', 0.3], [a('ок', 34), 'switch-tap.mp3', 0.35],
	[a('dev-сервер'), 'typewriter-digital.mp3', 0.15], [a('localhost'), 'lock-digital.mp3', 0.3],
	[a('Відкрий', 41), 'shimmer-sparkle-sweep.mp3', 0.3], [a('дужках'), 'switch-tap.mp3', 0.35],
];

export const Idea009: React.FC = () => <StepVideo dir="ideas/idea-009" words={WORDS} next="Правила проєкту в CLAUDE.md" sfx={SFX} scenes={Scenes} />;
