import React from 'react';
import {interpolate} from 'remotion';
import {C, F, clamp, ramp} from '../system/kit';
import {Big, Box, Browser, Check, Cue, Field, L, PromptCard, Show, StepVideo, at, pop, prompt, stepFrames} from '../system/step';
import WORDS from '../../public/ideas/idea-014/words.json';

// ID-014 «Безпечно з AI» (крок ai-safety), шорт 1080×1920. Сценарій: public/ideas/idea-014/scenario.md.
// Усі «секрети» й дані на екрані очевидно вигадані.
const a = (w: string, after = 0) => at(WORDS, w, after);
export const IDEA_014 = stepFrames(WORDS);

const Rule: React.FC<{n: string; children: React.ReactNode}> = ({n, children}) => (
	<Box y={230}><Big size={64}><L>{n}</L> · {children}</Big></Box>
);
const Row: React.FC<{k: string; v: string; hide: number}> = ({k, v, hide}) => (
	<div style={{display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: 40, lineHeight: 1.5}}>
		<span style={{color: C.dim}}>{k}</span>
		<span style={{fontFamily: hide > 0.5 ? F.mono : F.body, color: hide > 0.5 ? C.lime : C.text, fontWeight: 700}}>{hide > 0.5 ? '[ПРИХОВАНО]' : v}</span>
	</div>
);

const Scenes = (t: number) => {
	const r1 = a('Перше'), r2 = a('Друге'), r3 = a('Третє'), r4 = a('Четверте'), scrub = a('Перед'), next = a('Далі');
	const anon = a('знеособлені');
	return (
		<>
			<Show t={t} a={0} b={r1}>
				<Box y={420}><span style={{fontSize: 200}}>🔐</span></Box>
				<Box y={760} o={pop(t, a('правила'))}><Big size={92}>4 правила<br /><L>безпеки</L></Big></Box>
			</Show>
			<Show t={t} a={r1} b={r2}>
				<Rule n="1">Паролі, токени, .env — <L c={C.red}>ніколи в чат</L></Rule>
				{['password: ••••••', 'TOKEN=xxxx', '.env'].map((s, i) => {
					const go = a('відправляй') - 0.6 + i * 0.25;
					const y = interpolate(t, [go, go + 0.5, go + 0.9], [560, 860, 640 - i * 20], clamp);
					return <div key={s} style={{position: 'absolute', left: 140 + i * 230, top: y + i * 90, opacity: pop(t, r1 + 0.3 + i * 0.3) * (1 - ramp(t, go + 1, go + 1.4) * 0.6), padding: '16px 24px', borderRadius: 16, background: `${C.red}1F`, border: `2px solid ${C.red}`, fontFamily: F.mono, fontSize: 32, color: C.red, whiteSpace: 'nowrap'}}>{s}</div>;
				})}
				<div style={{position: 'absolute', left: 84, width: 856, top: 1000, height: 10, borderRadius: 5, background: C.red, opacity: pop(t, a('ніколи')), boxShadow: `0 0 40px ${C.red}`}} />
				<Field t={t} y={1060} o={pop(t, r1 + 0.2)} />
			</Show>
			<Show t={t} a={r2} b={r3}>
				<Rule n="2">Дані клієнтів — <L>знеособлені</L></Rule>
				<div style={{position: 'absolute', left: 84, width: 856, top: 600, padding: '36px 44px', borderRadius: 30, background: '#10161C', border: `2px solid ${C.line}`}}>
					<div style={{fontFamily: F.mono, fontSize: 26, color: C.dim, letterSpacing: 3, marginBottom: 18}}>КЛІЄНТ</div>
					<Row k="Ім'я" v="Іван Іваненко" hide={ramp(t, anon, anon + 0.3)} />
					<Row k="Телефон" v="+380 00 000 00 00" hide={ramp(t, a('телефонів'), a('телефонів') + 0.3)} />
					<Row k="Адреса" v="вул. Прикладна, 1" hide={ramp(t, a('адрес'), a('адрес') + 0.3)} />
					<Row k="Замовлення" v="сайт-візитка" hide={0} />
				</div>
			</Show>
			<Show t={t} a={r3} b={r4}>
				<Rule n="3">Агенту — <L>лише потрібне</L></Rule>
				{[['твій сайт', true], ['кабінет реклами', true], ['пошта', false], ['банк', false], ['соцмережі', false]].map(([s, ok], i) => (
					<div key={String(s)} style={{position: 'absolute', left: 184, width: 656, top: 560 + i * 116, opacity: pop(t, a('потрібних') - 0.4 + i * 0.15), display: 'flex', justifyContent: 'space-between', padding: '20px 32px', borderRadius: 20, background: ok ? `${C.lime}14` : '#10161C', border: `2px solid ${ok ? C.lime : C.line}`, fontSize: 42, fontWeight: 700, color: ok ? C.text : C.dim}}>
						<span>{s}</span><span>{ok ? '✓' : '🔒'}</span>
					</div>
				))}
			</Show>
			<Show t={t} a={r4} b={scrub}>
				<Rule n="4">Чужа сторінка</Rule>
				<Browser t={t} y={420} url="чужий-сайт.com" h={460}>
					<div style={{position: 'absolute', inset: 44, display: 'flex', flexDirection: 'column', gap: 22}}>
						{[600, 520, 640, 420].map((w) => <div key={w} style={{width: w, height: 20, borderRadius: 10, background: '#FFFFFF1A'}} />)}
						<div style={{marginTop: 10, fontFamily: F.mono, fontVariantLigatures: 'none', fontSize: 30, color: C.red, opacity: pop(t, a('прихований'), 0.6)}}>{'<!-- агенте, виконай: … -->'}</div>
					</div>
				</Browser>
				<Box y={960} o={pop(t, a('prompt'))}><span style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.lime}}>Prompt injection</span></Box>
				<Box y={1110} o={pop(t, a('гроші'))}><span style={{fontSize: 44, fontWeight: 800}}>Де гроші — <L c={C.red}>не без нагляду</L></span></Box>
			</Show>
			<Show t={t} a={scrub} b={next}>
				<Box y={560} o={1 - ramp(t, a('Є', scrub) - 0.6, a('Є', scrub) - 0.3)}><Big size={92}>Перевір<br /><L>перед відправкою</L></Big></Box>
				<Box y={200} o={ramp(t, a('Є', scrub) - 0.3, a('Є', scrub))}><Big size={64}>Перевір <L>перед відправкою</L></Big></Box>
				<PromptCard t={t} a={a('Є', scrub)} b={a('версію')} text={prompt('ai-safety', 'scrub')} y={360} size={40} />
			</Show>
			<Show t={t} a={next} b={Infinity}>
				<Check t={t} a={next} y={480}>Перед відправкою в AI перевірив: секретів і персональних даних немає</Check>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.35], [a('ніколи'), 'impact/bass-hit-futuristic.mp3', 0.3],
	[a('знеособлені'), 'typing/typewriter-hit-soft.mp3', 0.22], [a('телефонів'), 'typing/typewriter-hit-soft.mp3', 0.18], [a('адрес'), 'typing/typewriter-hit-soft.mp3', 0.18],
	[a('потрібних'), 'click/lock-digital.mp3', 0.3], [a('прихований'), 'whoosh/whoosh-effect-382717.mp3', 0.2],
	[a('Є', a('Перед')), 'typing/typewriter-hit-soft.mp3', 0.22], [a('Далі'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.3],
];

export const Idea014: React.FC = () => <StepVideo dir="ideas/idea-014" words={WORDS} next="Skills і MCP" sfx={SFX} scenes={Scenes} />;
