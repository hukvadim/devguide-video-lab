import React from 'react';
import {F} from '../system/kit';
import {Big, Box, Browser, Chips, Cue, L, Mono, Pill, PromptCard, Reply, Show, StepVideo, Ticks, Title, UserMsg, Win, X, at, pop, prompt, stepFrames, useTheme} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-22/words.json';

// Sites-22 «Керування після запуску» (шлях websites, крок admin-docs). Сценарій: public/ideas/sites-22/scenario.md.
// Чат, посилання й замовлення — приклад.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_22 = stepFrames(WORDS);
const ORDERS: [string, string, string][] = [['#1024', 'Флет вайт ×2', 'нове'], ['#1023', 'Столик на 4, 19:00', 'нове'], ['#1022', 'Круасан ×3', 'видано']];

const Road: React.FC<{t: number; a0: number; x: number; title: string; children?: React.ReactNode}> = ({t, a0, x, title, children}) => {
	const T = useTheme();
	const p = pop(t, a0, 0.4);
	return (
		<div style={{position: 'absolute', left: x, top: 440, width: 414, minHeight: 560, opacity: p, transform: `translateY(${(1 - p) * 40}px)`, padding: '30px 26px', borderRadius: 30, background: T.card, border: `2px solid ${T.line}`, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center'}}>
			<Big size={64}>{title}</Big>
			{children}
		</div>
	);
};

const Scenes = (t: number) => {
	const T = useTheme();
	const how = a('А'), two = a('Можна'), both = a('Найкраще'), forgot = a('Забув'), plan = a('Як', 27), docs = a('І', 39), fin = a('Клієнт', 51);
	return (
		<>
			<Show t={t} a={0} b={how}>
				<Title t={t} section="Запуск">Керування <L>після запуску</L></Title>
			</Show>
			<Show t={t} a={how} b={two}>
				<Box y={320}><Big size={88}>Як клієнт <L>змінить</L>…</Big></Box>
				<Chips t={t} y={600} size={50} items={[['товари', a('товари')], ['статті', a('статті')], ['ціни', a('ціни')], ['замовлення', a('замовлення')]]} />
			</Show>
			<Show t={t} a={two} b={both}>
				<Box y={260}><Big size={84}>Дві <L>дороги</L></Big></Box>
				<Road t={t} a0={a('адмінку')} x={X} title="Адмінка"><span style={{fontSize: 40, color: T.dim, textAlign: 'center'}}>невелика, під цей сайт</span></Road>
				<Road t={t} a0={a('MCP')} x={526} title="MCP">
					<span style={{opacity: pop(t, a('ChatGPT'))}}><Pill style={{fontSize: 34}}>ChatGPT</Pill></span>
					<span style={{opacity: pop(t, a('Claude'))}}><Pill style={{fontSize: 34}}>Claude</Pill></span>
					<span style={{opacity: pop(t, a('додай')), fontSize: 36, fontWeight: 700}}>«додай товар»</span>
					<span style={{opacity: pop(t, a('покажи')), fontSize: 36, fontWeight: 700}}>«покажи замовлення»</span>
				</Road>
			</Show>
			<Show t={t} a={both} b={forgot}>
				<Win y={260} label="Claude · клієнт">
					<UserMsg size={44} o={pop(t, a('Клієнт', 17))}>Покажи замовлення</UserMsg>
					<Reply o={pop(t, a('посилання'))} size={40}>Ось адмінка: <Mono size={30}>zerno.com.ua/admin?token=•••</Mono></Reply>
				</Win>
				<Browser t={t} y={720} url="zerno.com.ua/admin" h={380} o={pop(t, a('вхід'))}>
					<div style={{padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 16}}>
						{ORDERS.map(([n, what, st], i) => (
							<div key={n} style={{display: 'flex', gap: 20, alignItems: 'center', fontSize: 34, fontWeight: 700, padding: '14px 18px', borderRadius: 14, background: T.panel2, opacity: pop(t, a('вхід') + 0.2 + i * 0.2)}}>
								<span style={{fontFamily: F.mono, color: T.dim}}>{n}</span><span style={{flex: 1, textAlign: 'left'}}>{what}</span><span style={{color: st === 'нове' ? T.accent : T.dim}}>{st}</span>
							</div>
						))}
					</div>
				</Browser>
				<Box y={1170} o={pop(t, a('без'))}><Big size={56}>без логіну й <L>пароля</L></Big></Box>
			</Show>
			<Show t={t} a={forgot} b={plan}>
				<Win y={420} label="Claude · клієнт" minH={360}>
					<UserMsg size={44} o={pop(t, forgot)}>Я забув посилання в адмінку</UserMsg>
					<Reply o={pop(t, a('нагадає'))} size={42}>Ось воно ще раз: <Mono size={32}>zerno.com.ua/admin?token=•••</Mono></Reply>
				</Win>
			</Show>
			<Show t={t} a={plan} b={docs}>
				<Box y={230}><Big size={80}>Як це <L>зробити</L>?</Big></Box>
				<PromptCard t={t} a={a('Описуєш')} b={a('діями')} y={400} size={34} text={prompt('admin-docs', 'admin').split('\n')[0]} />
				<Ticks t={t} y={900} items={[[true, 'спершу план', a('Спершу')], [true, 'скільки це часу', a('скільки')], [true, 'потім «ок»', a('потім')]]} />
			</Show>
			<Show t={t} a={docs} b={fin}>
				<Box y={230}><Big size={80}>Дві <L>інструкції</L></Big></Box>
				<Road t={t} a0={a('README')} x={X} title="README"><span style={{fontSize: 34, color: T.dim}}>для розробника</span>
					{[['запустити', a('запустити')], ['викласти', a('викласти')], ['бекап', a('бекап')]].map(([w, at0]) => <span key={w as string} style={{opacity: pop(t, at0 as number), fontSize: 40, fontWeight: 700}}>✓ {w}</span>)}
				</Road>
				<Road t={t} a0={a('коротка')} x={526} title="Клієнту"><span style={{fontSize: 34, color: T.dim}}>простими словами</span>
					{[['меню', a('меню')], ['ціни', a('ціни', 50)], ['фото', a('фото')]].map(([w, at0]) => <span key={w as string} style={{opacity: pop(t, at0 as number), fontSize: 40, fontWeight: 700}}>✓ {w}</span>)}
				</Road>
			</Show>
			<Show t={t} a={fin} b={Infinity}>
				<Box y={520}><Big size={100}>Клієнт <L>сам</L> усе змінює</Big></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('товари'), 'pop/soft-pop.wav', 0.3],
	[a('адмінку'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('MCP'), 'pop/bubble-pop-389501.mp3', 0.3],
	[a('посилання'), 'notify/notification-051-494246.mp3', 0.25],
	[a('вхід'), 'click/lock-digital.mp3', 0.35],
	[a('нагадає'), 'notify/ding-126626.mp3', 0.25],
	[a('Описуєш'), 'typing/typewriter-digital.mp3', 0.18],
	[a('README'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('коротка'), 'pop/bubble-pop-389501.mp3', 0.3],
];

export const Sites22: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-22" words={WORDS} next="Домен клієнта" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('Man_laughs_on_sofa_with', a('ніяких'), WORDS[WORDS.length - 1].e - a('ніяких') + 0.2, {from: 2, label: <>Без дзвінків <L>о 23:00</L></>, labelY: 1000})]} />
);
