import React from 'react';
import {ramp} from '../system/kit';
import {Big, Box, Browser, Chips, Cue, L, LiveShot, Mono, Pill, PromptCard, Reply, Show, StepVideo, Strike, Term, Ticks, Title, UserMsg, Win, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-20/words.json';

// Sites-20 «Викладаємо на Vercel» (шлях websites, крок deploy-vercel). Сценарій: public/ideas/sites-20/scenario.md.
// Адреса zerno.vercel.app — приклад.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_20 = stepFrames(WORDS);

const Scenes = (t: number) => {
	const T = useTheme();
	const has = a('GitHub'), ask = a('Просто'), sec = a('Важливий'), near = a('Якщо'), link = a('В', 33), auto = a('А', 37), chat = a('І', 45);
	return (
		<>
			<Show t={t} a={0} b={has}>
				<Title t={t} section="Запуск">Викладаємо <L>на Vercel</L></Title>
			</Show>
			<Show t={t} a={has} b={ask}>
				<Box y={320}><Big size={88}>Уже <L>є</L></Big></Box>
				<Ticks t={t} y={560} items={[[true, 'GitHub', has], [true, 'Vercel MCP', a('Vercel')]]} />
			</Show>
			<Show t={t} a={ask} b={sec}>
				<PromptCard t={t} a={a('пишеш')} b={a('Нейромережа')} y={240} size={34} text={prompt('deploy-vercel', 'vercel')} />
				<Term t={t} y={830} label="Claude Code" lines={[
					{at: a('перевірить'), text: '✓ build пройшов', kind: 'ok'},
					{at: a('доставить'), text: '✓ бракувало пакета — додано', kind: 'ok'},
					{at: a('викладе'), text: '✓ deploy: Ready', kind: 'ok'},
				]} />
			</Show>
			<Show t={t} a={sec} b={near}>
				<Box y={250}><Big size={96}><L>Секрети</L></Big></Box>
				<Chips t={t} y={430} size={46} items={[['ключі', a('Ключі')], ['паролі', a('паролі')], ['токени', a('токени')]]} />
				<Box y={560} o={pop(t, a('репозиторій'))}><Big size={60}>✗ <span style={{color: T.red}}>не в репозиторій</span></Big></Box>
				<Term t={t} y={760} label="Claude Code" lines={[
					{at: a('перевір', 20), text: 'перевір env-змінні', kind: 'cmd'},
					{at: a('секрети', 22), text: '✓ .env у .gitignore', kind: 'ok'},
					{at: a('GitHub', 23), text: '✓ ключі — у Vercel, не в коді', kind: 'ok'},
				]} />
			</Show>
			<Show t={t} a={near} b={link}>
				<Box y={250}><Big size={84}>Сиди <L>поруч</L></Big></Box>
				{/* справжня сторінка (shots/vercel-home.png з Sites-04, 1280×900), рамка на «Log In» */}
				<Browser t={t} y={420} url="vercel.com/login" h={560}>
					<LiveShot t={t} src="ideas/sites-04/shots/vercel-home.png" w={1280} a={near + 0.3} focus={{x: 1090, y: 16, w: 64, h: 32, at: a('кнопку'), zoom: 1.5}} />
				</Browser>
				<Box y={1080} o={pop(t, a('натиснути'))}><Big size={64}>інколи натиснеш <L>ти</L></Big></Box>
			</Show>
			<Show t={t} a={link} b={auto}>
				<Box y={360}><Big size={84}>Отримуєш <L>посилання</L></Big></Box>
				<Box y={620} o={pop(t, a('посилання'))}><Pill style={{fontSize: 54, padding: '22px 44px'}}>zerno.vercel.app ↗</Pill></Box>
				<Box y={820} o={pop(t, a('інтернеті'))}><Big size={64}>сайт уже <L>в інтернеті</L></Big></Box>
			</Show>
			<Show t={t} a={auto} b={chat}>
				<Box y={250}><Big size={80}>Далі — <L>само</L></Big></Box>
				<Term t={t} y={460} label="Термінал" lines={[
					{at: a('відправив'), text: 'git push', kind: 'cmd'},
					{at: a('оновлює'), text: 'Vercel: building…', kind: 'out'},
					{at: a('сама', 42), text: '✓ сайт оновлено', kind: 'ok'},
				]} />
				<Box y={1000} o={pop(t, a('вручну'))}><Big size={60}><Strike p={ramp(t, a('вручну'), a('вручну') + 0.5)}>викладати вручну</Strike></Big></Box>
			</Show>
			<Show t={t} a={chat} b={Infinity}>
				<Box y={300}><Big size={84}>Просто <L>спитай</L></Big></Box>
				<Win y={540} label="Claude Code" minH={300}>
					<UserMsg size={40} o={pop(t, a('яке'))}>яке посилання на сайт?</UserMsg>
					<Reply o={pop(t, a('сайт', 48))} size={40}><Mono>zerno.vercel.app</Mono></Reply>
				</Win>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('GitHub'), 'pop/soft-pop.wav', 0.3],
	[a('Vercel'), 'pop/soft-pop.wav', 0.3],
	[a('викладе'), 'sparkle/sparkle-touch.mp3', 0.3],
	[a('кнопку') + 0.3, 'click/mouse-click-352734.mp3', 0.4],
	[a('Важливий'), 'impact/bass-hit-futuristic.mp3', 0.2],
	[a('посилання'), 'notify/ding-101492.mp3', 0.3],
	[a('сама', 42), 'sparkle/sparkle-touch.mp3', 0.3],
];

export const Sites20: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-20" words={WORDS} next="Швидкість і доступність" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('point-up', a('сиди'), a('кнопку') - a('сиди') - 0.1, {label: <>Сиди <L>поруч</L></>, labelY: 1000})]} />
);
