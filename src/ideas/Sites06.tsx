import React from 'react';
import {F, ramp} from '../system/kit';
import {at, Big, Box, Browser, Chips, Cue, Fit, L, LHead, LiveShot, Mono, Pill, pop, prompt, PromptCard, Show, stepFrames, Steps, StepVideo, Strike, Title, useTheme, W, X} from '../system/step';
import {ugc} from '../system/ugc';
import WORDS from '../../public/ideas/sites-06/words.json';

// Sites-06 «Skills: та сама сторінка без і з ui-ux-pro-max» (шлях websites, крок skills-compare). Сценарій: public/ideas/sites-06/scenario.md.
// Дві сторінки кав'ярні — намальовані макети (CafeMock), а не справжня генерація: показують різницю «шаблон / стиль під бізнес».
const a = (w: string, after = 0) => at(WORDS, w, after);
export const SITES_06 = stepFrames(WORDS);
const SKILLS = ['seo-audit', 'pdf', 'docx', 'slides', 'copywriting', 'brand', 'ui-ux-pro-max', 'remotion', 'humanizer', 'xlsx', 'frontend-design', 'charts'];

/** Сітка скілів: усі тьмяні, з моменту pick AI «бере» один під задачу. */
const SkillGrid: React.FC<{t: number; a0: number; pick: number}> = ({t, a0, pick}) => {
	const T = useTheme();
	const on = t >= pick;
	return (
		<Box y={560} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16}}>
			{SKILLS.map((s, i) => {
				const me = s === 'frontend-design';
				return <span key={s} style={{opacity: pop(t, a0 + i * 0.06) * (on && !me ? 0.3 : 1), transform: `scale(${on && me ? 1.15 : 1})`}}><Pill on={on && me} style={{fontSize: 36, fontFamily: F.mono, ...(on && me ? {boxShadow: `0 0 40px ${T.accent}80`} : {})}}>{s}</Pill></span>;
			})}
		</Box>
	);
};

/** Головна кав'ярні: styled=false — сірий шаблон, true — стиль під бізнес (палітра кави, серифний титул). */
const CafeMock: React.FC<{t: number; a0: number; styled?: boolean; y?: number}> = ({t, a0, styled, y = 780}) => {
	const p = pop(t, a0, 0.5);
	const box: React.CSSProperties = {position: 'absolute', left: X, top: y, width: W, height: 540, borderRadius: 28, overflow: 'hidden', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, boxShadow: '0 40px 100px #000000A0'};
	if (!styled) return (
		<div style={{...box, background: '#FFFFFF', fontFamily: 'Arial, sans-serif', color: '#222'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', padding: '22px 30px', background: '#F1F1F1', fontSize: 26}}><b>Кав'ярня Зерно</b><span style={{color: '#666'}}>Меню · Відгуки · Контакти</span></div>
			<div style={{padding: '40px 30px', textAlign: 'center'}}>
				<div style={{fontSize: 48, fontWeight: 700}}>Ласкаво просимо!</div>
				<div style={{fontSize: 26, color: '#777', marginTop: 12}}>Найкраща кава у Львові</div>
				<div style={{display: 'inline-block', marginTop: 26, padding: '14px 34px', background: '#2F6FED', color: '#fff', borderRadius: 6, fontSize: 26}}>Детальніше</div>
			</div>
			<div style={{display: 'flex', gap: 20, padding: '0 30px'}}>{[0, 1, 2].map((i) => <div key={i} style={{flex: 1, height: 150, background: '#DDDDDD', borderRadius: 6}} />)}</div>
		</div>
	);
	return (
		<div style={{...box, background: 'linear-gradient(160deg, #2A1A12, #120B08)', color: '#F3E6D3'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 34px', fontSize: 24, letterSpacing: 3}}><span style={{fontFamily: 'Georgia, serif', fontSize: 34, letterSpacing: 1}}>Зерно</span><span style={{opacity: 0.7}}>МЕНЮ · ВІДГУКИ · КОНТАКТИ</span></div>
			<div style={{position: 'absolute', right: -40, top: 90, width: 380, height: 380, borderRadius: 190, background: 'radial-gradient(circle at 50% 45%, #6B3E22 0 38%, #3A2214 39% 46%, #E9D7BE 47% 52%, transparent 53%)', boxShadow: '0 0 120px #C8894B55'}} />
			<div style={{padding: '50px 34px 0', maxWidth: 520}}>
				<div style={{fontSize: 22, letterSpacing: 6, color: '#C8894B'}}>ЛЬВІВ · З 7:30</div>
				<div style={{fontFamily: 'Georgia, serif', fontSize: 58, lineHeight: 1.02, marginTop: 14}}>Кава, заради якої варто прокинутись</div>
				<div style={{display: 'inline-block', marginTop: 28, padding: '16px 34px', background: '#C8894B', color: '#1A0F09', borderRadius: 999, fontSize: 26, fontWeight: 800}}>Забронювати столик</div>
			</div>
			<div style={{position: 'absolute', left: 34, right: 34, bottom: 26, display: 'flex', gap: 16}}>{['Еспресо', 'Флет вайт', 'Круасан'].map((m) => <div key={m} style={{flex: 1, padding: '14px 0', border: '1px solid #C8894B66', borderRadius: 14, textAlign: 'center', fontSize: 24}}>{m}</div>)}</div>
		</div>
	);
};

const Tag: React.FC<{t: number; a0: number; children: React.ReactNode; y?: number}> = ({t, a0, children, y = 1340}) => <Box y={y} o={pop(t, a0)}><Big size={60}>{children}</Big></Box>;

const Scenes = (t: number) => {
	const def = a('для'), nn = a('Нейромережа'), one = a('Є'), test = a('Перевір'), w2 = a('Другий'), cmp = a('Поклади'), mine = a('Свої'), last = a('Головне');
	return (
		<>
			<Show t={t} a={0} b={def}>
				<Title t={t} section="Організація" size={92}>Skills: без і з <L>ui-ux-pro-max</L></Title>
			</Show>
			<Show t={t} a={def} b={nn}>
				<Box y={360}><Big size={84}>Skill = <L>інструкція</L> для AI</Big></Box>
				<Box y={800} o={pop(t, a('більше'))}><Big size={110}>більше <span style={{color: useTheme().red}}>≠</span> краще</Big></Box>
			</Show>
			<Show t={t} a={nn} b={one}>
				<Box y={300}><Big size={84}>AI бере скіл <L>під задачу</L></Big></Box>
				<SkillGrid t={t} a0={nn} pick={a('задачу')} />
				<Box y={1150} o={pop(t, a('Ставити'))}><Big size={56}><Strike p={ramp(t, a('сенсу'), a('сенсу') + 0.5)}>сотня «про запас»</Strike></Big></Box>
			</Show>
			<Show t={t} a={one} b={test}>
				<Box y={260}><Big size={84}>Став першим</Big></Box>
				<Box y={370} o={pop(t, a('ui-ux'))}><Big size={76}><Mono>ui-ux-pro-max</Mono></Big></Box>
				{/* справжня сторінка (shots/uiux-repo.png, 1280×900), рамка на назві репозиторію */}
				<Browser t={t} y={520} url="github.com/nextlevelbuilder" h={600}>
					<LiveShot t={t} src="ideas/sites-06/shots/uiux-repo.png" w={1280} a={a('ui-ux')} focus={{x: 30, y: 190, w: 272, h: 36, at: a('ui-ux') + 0.5, zoom: 1.8}} />
				</Browser>
				<Tag t={t} a0={a('дизайном')} y={1250}>Дизайн — <L>помітна різниця</L></Tag>
			</Show>
			<Show t={t} a={test} b={w2}>
				<PromptCard t={t} a={a('Той')} b={a('Перший', 30)} y={260} size={36} label="Без skills" text={prompt('skills-compare', 'without')} />
				<CafeMock t={t} a0={a('працює')} />
				<Tag t={t} a0={a('шаблон')}>виглядає як <span style={{color: useTheme().red}}>шаблон</span></Tag>
			</Show>
			<Show t={t} a={w2} b={cmp}>
				<PromptCard t={t} a={a('пишеш')} b={a('ui-ux', w2) + 0.8} y={260} size={36} label="З ui-ux-pro-max" text={prompt('skills-compare', 'with')} />
				<CafeMock t={t} a0={a('бачиш')} styled />
				<Tag t={t} a0={a('палітра')}>стиль · <L>шрифти</L></Tag>
			</Show>
			<Show t={t} a={cmp} b={mine}>
				<Box y={260}><Big size={84}>Назви <L>3 відмінності</L></Big></Box>
				<Steps t={t} y={520} items={[['1', 'стиль під бізнес', a('три')], ['2', 'продумана палітра', a('три') + 0.4], ['3', 'шрифти', a('відмінності') + 0.5]]} />
				<Box y={1080} o={pop(t, a('скіл', 52))}><Big size={60}>так видно, що дає <L>скіл</L></Big></Box>
			</Show>
			<Show t={t} a={mine} b={last}>
				<Box y={260}><Big size={84}>Свої скіли — <L>у Claude</L></Big></Box>
				<Chips t={t} y={520} size={46} items={[['скіли', mine + 0.2], ['конектори', a('конектори')], ['плагіни', a('плагіни')]]} />
				<Box y={760} o={pop(t, a('профіль'))}><Pill style={{fontSize: 50, padding: '20px 40px'}}>профіль → налаштування</Pill></Box>
			</Show>
			<Show t={t} a={last} b={Infinity}>
				<Box y={440}><Big size={96}>Кажи <L>прямо</L></Big></Box>
				<Box y={680} o={pop(t, a('кажи'))}><Pill style={{fontSize: 46, fontFamily: F.mono}}>використай ui-ux-pro-max</Pill></Box>
			</Show>
		</>
	);
};

const SFX: Cue[] = [
	[0, 'whoosh/whoosh-cinematic-376875.mp3', 0.3],
	[a('більше'), 'pop/bubble-pop-406640.mp3', 0.3],
	[a('задачу'), 'notify/ding-101492.mp3', 0.25],
	[a('ui-ux') + 0.5, 'click/mouse-click-352734.mp3', 0.4],
	[a('працює'), 'whoosh/simple-whoosh-382724.mp3', 0.3],
	[a('шаблон'), 'glitch/small-electric-glitch-2595.wav', 0.25],
	[a('бачиш'), 'sparkle/shimmer-sparkle-sweep.mp3', 0.35],
];

export const Sites06: React.FC<{theme?: string; seed?: number}> = ({theme, seed}) => (
	<StepVideo theme={theme} seed={seed} dir="ideas/sites-06" words={WORDS} next="Сайт за $10 000" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={Scenes}
		inserts={[ugc('point-up', a('Є'), 1.3, {label: <>Один <L>скіл</L> першим</>, labelY: 1000})]} />
);

// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------
const ScenesWide = (t: number) => {
	const def = a('для'), nn = a('Нейромережа'), one = a('Є'), test = a('Перевір'), w2 = a('Другий'), cmp = a('Поклади'), mine = a('Свої'), last = a('Головне');
	return (
		<>
			<Show t={t} a={0} b={def}>
				<Fit from={420} to={1100} center>
					<Title t={t} section="Організація" size={92}>Skills: без і з <L>ui-ux-pro-max</L></Title>
				</Fit>
			</Show>
			<Show t={t} a={def} b={nn}>
				<Fit from={320} to={1020} center>
					<Box y={360}><Big size={84}>Skill = <L>інструкція</L> для AI</Big></Box>
					<Box y={800} o={pop(t, a('більше'))}><Big size={110}>більше <span style={{color: useTheme().red}}>≠</span> краще</Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={nn} b={one}>
				<LHead size={84}>AI бере скіл <L>під задачу</L></LHead>
				<Fit from={420} to={1370}>
					<SkillGrid t={t} a0={nn} pick={a('задачу')} />
					<Box y={1150} o={pop(t, a('Ставити'))}><Big size={56}><Strike p={ramp(t, a('сенсу'), a('сенсу') + 0.5)}>сотня «про запас»</Strike></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={one} b={test}>
				<LHead size={84}>Став першим</LHead>
				<Fit from={330} to={1470}>
					<Box y={370} o={pop(t, a('ui-ux'))}><Big size={76}><Mono>ui-ux-pro-max</Mono></Big></Box>
					{/* справжня сторінка (shots/uiux-repo.png, 1280×900), рамка на назві репозиторію */}
					<Browser t={t} y={520} url="github.com/nextlevelbuilder" h={600}>
						<LiveShot t={t} src="ideas/sites-06/shots/uiux-repo.png" w={1280} a={a('ui-ux')} focus={{x: 30, y: 190, w: 272, h: 36, at: a('ui-ux') + 0.5, zoom: 1.8}} />
					</Browser>
					<Tag t={t} a0={a('дизайном')} y={1250}>Дизайн — <L>помітна різниця</L></Tag>
				</Fit>
			</Show>
			<Show t={t} a={test} b={w2}>
				<Fit from={220} to={1340} center>
					<PromptCard t={t} a={a('Той')} b={a('Перший', 30)} y={260} size={36} label="Без skills" text={prompt('skills-compare', 'without')} />
					<CafeMock t={t} a0={a('працює')} />
					<Tag t={t} a0={a('шаблон')}>виглядає як <span style={{color: useTheme().red}}>шаблон</span></Tag>
				</Fit>
			</Show>
			<Show t={t} a={w2} b={cmp}>
				<Fit from={220} to={1340} center>
					<PromptCard t={t} a={a('пишеш')} b={a('ui-ux', w2) + 0.8} y={260} size={36} label="З ui-ux-pro-max" text={prompt('skills-compare', 'with')} />
					<CafeMock t={t} a0={a('бачиш')} styled />
					<Tag t={t} a0={a('палітра')}>стиль · <L>шрифти</L></Tag>
				</Fit>
			</Show>
			<Show t={t} a={cmp} b={mine}>
				<LHead size={84}>Назви <L>3 відмінності</L></LHead>
				<Fit from={480} to={1300}>
					<Steps t={t} y={520} items={[['1', 'стиль під бізнес', a('три')], ['2', 'продумана палітра', a('три') + 0.4], ['3', 'шрифти', a('відмінності') + 0.5]]} />
					<Box y={1080} o={pop(t, a('скіл', 52))}><Big size={60}>так видно, що дає <L>скіл</L></Big></Box>
				</Fit>
			</Show>
			<Show t={t} a={mine} b={last}>
				<LHead size={84}>Свої скіли — <L>у Claude</L></LHead>
				<Fit from={480} to={980}>
					<Chips t={t} y={520} size={46} items={[['скіли', mine + 0.2], ['конектори', a('конектори')], ['плагіни', a('плагіни')]]} />
					<Box y={760} o={pop(t, a('профіль'))}><Pill style={{fontSize: 50, padding: '20px 40px'}}>профіль → налаштування</Pill></Box>
				</Fit>
			</Show>
			<Show t={t} a={last} b={Infinity}>
				<LHead size={92}>Кажи <L>прямо</L></LHead>
				<Fit from={640} to={900}>
					<Box y={680} o={pop(t, a('кажи'))}><Pill style={{fontSize: 46, fontFamily: F.mono}}>використай ui-ux-pro-max</Pill></Box>
				</Fit>
			</Show>
		</>
	);
};

export const Sites06Wide: React.FC<{theme?: string; seed?: number; kicker?: React.ReactNode}> = ({theme, seed, kicker}) => (
	<StepVideo wide kicker={kicker} theme={theme} seed={seed} dir="ideas/sites-06" words={WORDS} next="Сайт за $10 000" nextUrl="devguide.com.ua/learning/websites" sfx={SFX} scenes={ScenesWide}
		inserts={[ugc('point-up', a('Є'), 1.3, {label: <>Один <L>скіл</L> першим</>, labelY: 1000})]} />
);
