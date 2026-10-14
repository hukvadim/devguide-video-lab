import React from 'react';
import {Img, staticFile} from 'remotion';
import {ramp} from '../system/kit';
import {Big, Box, Cue, L, Pill, Show, StepVideo, Term, Title, UserMsg, Win, at, pop, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/voice-ai/words.json';

// «Нейромережа говорить моїм голосом»: Reel для @hukvadim, голос — клон Вадима (ElevenLabs). Сценарій: public/ideas/voice-ai/scenario.md.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const VOICE_AI = stepFrames(WORDS);

/** Справжній скрін з папки shots/ у картці; w — ширина в кадрі, ratio — висота/ширина файлу. */
const Shot: React.FC<{t: number; at: number; y: number; src: string; w: number; ratio: number}> = ({t, at: a0, y, src, w, ratio}) => {
	const T = useTheme();
	const o = pop(t, a0, 0.45);
	return (
		<div style={{position: 'absolute', left: (1080 - w) / 2, top: y, width: w, height: w * ratio, opacity: o, transform: `translateY(${(1 - o) * 40}px) scale(${0.94 + o * 0.06})`, borderRadius: 24, overflow: 'hidden', border: `2px solid ${T.line}`, boxShadow: '0 40px 100px #000000A0'}}>
			<Img src={staticFile(`ideas/voice-ai/shots/${src}`)} style={{width: '100%', height: '100%', display: 'block'}} />
		</div>
	);
};

/** Слово/фраза перекреслюється лінією, що росте зліва направо між секундами from і to. */
const CrossOut: React.FC<{t: number; y: number; from: number; to: number; w: number; children: React.ReactNode}> = ({t, y, from, to, w, children}) => {
	const T = useTheme();
	return (
		<Box y={y}>
			<div style={{position: 'relative', display: 'inline-block', opacity: 1 - 0.5 * ramp(t, from, to)}}>
				{children}
				<div style={{position: 'absolute', left: 0, top: '55%', width: w, height: 10, background: T.red, transform: `scaleX(${ramp(t, from, to)})`, transformOrigin: 'left'}} />
			</div>
		</Box>
	);
};

const Scenes = (t: number) => {
	const was = a('Раніше'), now = a('А', was), voice = a('Оцифрував'), photo = a('Даю'), cc = a('Claude Code'), ready = a('Готовий'), twin = a('Хотів');
	const month = a('За', 30), more = a('І', 43), cycle = a('Тепер', more), run = a('Запустити'), notall = a('Не', run), join = a('Хочеш');
	const crossAt = a('порахував');
	return (
		<>
			<Show t={t} a={0} b={was}>
				<Title t={t} section="Цей голос — не мій" y={330} size={92}>Нейромережа <L>говорить моїм голосом</L></Title>
				<Shot t={t} at={a('моїм')} y={1010} src="ready.png" w={760} ratio={202 / 481} />
			</Show>
			<Show t={t} a={was} b={now}>
				<Box y={300}><Big size={110}>Раніше: <L>чат</L></Big></Box>
				<Win y={560} label="чат з AI" minH={470}>
					<UserMsg o={pop(t, a('Напиши'))}>Напиши сценарій</UserMsg>
					<UserMsg o={pop(t, a('підкинь'))}>Підкинь ідею</UserMsg>
					<UserMsg o={pop(t, a('допоможи'))}>Допоможи з кодом</UserMsg>
				</Win>
			</Show>
			<Show t={t} a={now} b={voice}>
				<Box y={640}><Big size={100}>Тепер — цілий <L>робочий процес</L></Big></Box>
			</Show>
			<Show t={t} a={voice} b={photo}>
				<Box y={260}><Big size={96}>Голос <L>оцифровано</L></Big></Box>
				<Shot t={t} at={a('Пишу')} y={470} src="eleven.png" w={600} ratio={576 / 379} />
			</Show>
			<Show t={t} a={photo} b={cc}>
				<Box y={520}><Big size={92}>Фото товару</Big></Box>
				<Box y={740} o={pop(t, a('роблю'))}><Big size={120} style={{opacity: 0.9}}>↓</Big></Box>
				<Box y={940} o={pop(t, a('відео'))}><Big size={100}><L>Відео</L></Big></Box>
			</Show>
			<Show t={t} a={cc} b={ready}>
				<Box y={240}><Big size={92}><L>Claude Code</L> + Remotion</Big></Box>
				<Term t={t} y={470} minH={300} label="Claude Code" lines={[
					{at: a('монтаж'), text: '✓ монтаж', kind: 'ok'},
					{at: a('анімації'), text: '✓ анімації', kind: 'ok'},
					{at: a('субтитри'), text: '✓ субтитри', kind: 'ok'},
				]} />
				<Shot t={t} at={a('субтитри') + 0.5} y={900} src="usage.png" w={720} ratio={249 / 538} />
			</Show>
			<Show t={t} a={ready} b={twin}>
				<Box y={260}><Big size={96}>Готовий ролик <L>в Instagram</L></Big></Box>
				<Shot t={t} at={a('Інстаграм') - 0.4} y={620} src="published.png" w={800} ratio={228 / 517} />
			</Show>
			<Show t={t} a={twin} b={month}>
				<CrossOut t={t} y={300} from={crossAt} to={crossAt + 0.4} w={460}><Big size={104}>Цифровий я</Big></CrossOut>
				<Box y={560} o={pop(t, a('простіший'))}><Big size={72}>Обрав простіший формат</Big></Box>
				{['Голос', 'Скріншоти', 'Монтаж'].map((s, i) => (
					<Box key={s} y={760 + i * 170} o={pop(t, [a('Мій'), a('скріншоти'), a('монтаж', a('скріншоти'))][i])}><Pill style={{fontSize: 58, padding: '22px 56px'}}>{s}</Pill></Box>
				))}
			</Show>
			<Show t={t} a={month} b={more}>
				<Box y={220}><Big size={100}><L>15</L> сайтів за місяць</Big></Box>
				<Shot t={t} at={a('сайтів') - 0.3} y={470} src="folders.png" w={800} ratio={734 / 1733} />
				<Box y={850} o={pop(t, a('рекламу'))}><Pill style={{fontSize: 44}}>+ реклама у Facebook та Instagram</Pill></Box>
				<Shot t={t} at={a('рекламу') + 0.3} y={940} src="ads.png" w={470} ratio={793 / 802} />
			</Show>
			<Show t={t} a={more} b={cycle}>
				<Box y={640}><Big size={100}>Це вже більше, ніж <L>переписка з нейронкою</L></Big></Box>
			</Show>
			<Show t={t} a={cycle} b={run}>
				<Box y={300}><Big size={104}>Весь <L>цикл</L></Big></Box>
				{[['Сайт', 'Сайт,'], ['Контент', 'контент,'], ['Аналітика', 'аналітика,'], ['Реклама', 'реклама'], ['Супровід', 'супровід.']].map(([s, w]) => (
					<Box key={s} y={560 + ['Сайт', 'Контент', 'Аналітика', 'Реклама', 'Супровід'].indexOf(s) * 160} o={pop(t, a(w, cycle))}><Pill style={{fontSize: 58, padding: '20px 60px'}}>{s}</Pill></Box>
				))}
			</Show>
			<Show t={t} a={run} b={notall}>
				<Box y={640}><Big size={100}>Запустити → дивитись, <L>що працює</L></Big></Box>
			</Show>
			<Show t={t} a={notall} b={join}>
				<Box y={520}><Big size={96}>Не скажу, що освоїв усе</Big></Box>
				<Box y={900} o={pop(t, a('Але', notall))}><Big size={104}>Але систему <L>зібрав</L></Big></Box>
			</Show>
			<Show t={t} a={join} b={Infinity}>
				<Box y={520}><Big size={112}>Хочеш <L>так само?</L></Big></Box>
				<Box y={840} o={pop(t, a('Приходь'))}><Pill style={{fontSize: 60, padding: '24px 56px'}}>Приходь на заняття</Pill></Box>
				<Box y={1040} o={pop(t, a('Робитимемо'))}><Big size={64} style={{opacity: 0.85}}>Робитимемо разом на твоїх задачах</Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('Оцифрував'), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('Claude Code'), 'pop/bubble-pop-389501.mp3', 0.35],
	[a('Готовий'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
	[a('За', 30), 'whoosh/whoosh-end-384629.mp3', 0.3],
	[a('Тепер', 40), 'pop/bubble-pop-406640.mp3', 0.35],
	[a('Хочеш'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

// вставки Вадима (Flow, public/assets/ugc/flow): тримаємо 2–3 с на фразі, між скрінами; from — найкращий шматок кліпу (контакт-лист 2026-10-13)
const INSERTS = [
	ugc('point-up', a('І'), a('Раніше') - a('І') - 0.2, {from: 3.4, label: <>Це клон <span style={{color: '#C6FF3D'}}>голосу</span></>}),
	ugc('Man_reacting_to_smartphone', a('Даю'), a('А', a('Даю')) - a('Даю') - 0.1, {from: 3.6}),
	ugc('Man_holding_mug_and_laptop_', a('Хотів') + 0.2, 3.0, {from: 3.0}),
	ugc('Man_sipping_coffee_at_cafe_ending_wow', a('І', 43), a('Тепер', 43) - a('І', 43) - 0.15, {from: 2.0}),
	ugc('Man_rubbing_eyes_at_desk', a('Не', a('Запустити')), a('Але', a('Не', a('Запустити'))) - a('Не', a('Запустити')) - 0.1, {from: 0}),
	ugc('smile', a('Хочеш'), a('Робитимемо') - a('Хочеш') - 0.15, {from: 0}),
];

export const VoiceAi: React.FC<{theme?: string; seed?: number; withUgc?: boolean}> = ({theme, seed, withUgc}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/voice-ai" words={WORDS} next="Напиши мені" nextLabel="Заняття з Вадимом" nextUrl="@hukvadim" sfx={SFX} scenes={Scenes} inserts={withUgc ? INSERTS : []} />
);
