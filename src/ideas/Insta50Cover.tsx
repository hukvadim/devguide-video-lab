import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F} from '../system/kit';

// Обкладинки банку «50 ідей рілсів без зйомки» (docs/insta-50/). Один стілл 1080×1920 на ідею, props з docs/insta-50/NN-slug/props.json.
// Заголовок у центральній зоні 3:4 (y 240…1680), без чужих логотипів: інструменти — текстом, візуал — мокапи й схеми.
export type CoverProps = {
	n: number; layout: 'number' | 'phone' | 'versus' | 'grid' | 'spec' | 'code' | 'flow'; theme: keyof typeof THEMES;
	title: string; sub: string; num?: string; items?: string[]; cta: string; account: string;
};

const THEMES = {
	light: {bg: '#ECECE8', text: '#121212', dim: '#5A5A5A', accent: '#2F5BFF', card: '#FFFFFF', line: '#D2D2CC', onAccent: '#FFFFFF'},
	dark: {bg: '#0E0F13', text: '#F4F4F2', dim: '#9A9CA3', accent: '#C8F25A', card: '#1A1C22', line: '#2C2F37', onAccent: '#0E0F13'},
	cream: {bg: '#F6EEE3', text: '#1A1A1A', dim: '#6B5F52', accent: '#C2481A', card: '#FFFFFF', line: '#E3D5C3', onAccent: '#FFFFFF'},
	violet: {bg: 'linear-gradient(160deg, #6B3DF5 0%, #2A1366 100%)', text: '#FFFFFF', dim: '#D9CCFF', accent: '#FFD34D', card: '#FFFFFF1F', line: '#FFFFFF33', onAccent: '#2A1366'},
	mint: {bg: '#E2F3EC', text: '#0F2A22', dim: '#3F6157', accent: '#0B7D5C', card: '#FFFFFF', line: '#C3E3D6', onAccent: '#FFFFFF'},
};

const Title: React.FC<{c: typeof THEMES.light; title: string; sub: string; size?: number}> = ({c, title, sub, size}) => {
	const word = Math.max(...title.split(' ').map((w) => w.length));
	const s = size ?? Math.min(title.length > 26 ? 92 : title.length > 16 ? 112 : 138, word > 11 ? 84 : word > 9 ? 100 : 999);
	return (
		<div style={{textAlign: 'center', padding: '0 70px'}}>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: s, lineHeight: 1.02, letterSpacing: -3, color: c.text}}>{title}</div>
			<div style={{marginTop: 26, fontFamily: F.body, fontWeight: 700, fontSize: 48, color: c.dim}}>{sub}</div>
		</div>
	);
};

const Phone: React.FC<{c: typeof THEMES.light; items: string[]}> = ({c, items}) => (
	<div style={{width: 520, height: 760, borderRadius: 70, border: `12px solid ${c.text}`, background: c.card, padding: '70px 34px 34px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 22}}>
		<div style={{alignSelf: 'center', width: 150, height: 34, borderRadius: 17, background: c.text, marginTop: -44, marginBottom: 20}} />
		{items.map((it, i) => (
			<div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px', borderRadius: 22, background: i === 0 ? c.accent : 'transparent', border: `2px solid ${i === 0 ? c.accent : c.line}`, color: i === 0 ? c.onAccent : c.text, fontFamily: F.body, fontWeight: 700, fontSize: 34}}>
				<span style={{fontFamily: F.mono, opacity: 0.7}}>{String(i + 1).padStart(2, '0')}</span>{it}
			</div>
		))}
	</div>
);

const Visual: React.FC<{p: CoverProps; c: typeof THEMES.light}> = ({p, c}) => {
	const items = p.items ?? [];
	switch (p.layout) {
		case 'number':
			return <div style={{fontFamily: F.display, fontWeight: 900, fontSize: (p.num ?? '').length > 3 ? 230 : 380, lineHeight: 1, color: c.accent, letterSpacing: -10}}>{p.num}</div>;
		case 'phone':
			return <Phone c={c} items={items} />;
		case 'versus':
			return (
				<div style={{display: 'flex', alignItems: 'center', gap: 30}}>
					{items.map((it, i) => (
						<React.Fragment key={i}>
							{i ? <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 70, color: c.dim}}>vs</div> : null}
							<div style={{width: 360, height: 420, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20, boxSizing: 'border-box', background: i ? c.accent : c.card, color: i ? c.onAccent : c.text, border: `3px solid ${i ? c.accent : c.line}`, fontFamily: F.display, fontWeight: 900, fontSize: it.length > 6 ? 46 : 62, lineHeight: 1.1, overflowWrap: 'anywhere'}}>{it}</div>
						</React.Fragment>
					))}
				</div>
			);
		case 'grid':
			return (
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 280px)', gap: 20}}>
					{items.map((it, i) => (
						<div key={i} style={{gridColumn: i === 0 && items.length % 3 === 2 ? 'span 2' : undefined, height: items.length > 6 ? 170 : i % 4 === 0 ? 300 : 240, borderRadius: 34, background: i === 0 ? c.accent : c.card, border: `2px solid ${c.line}`, color: i === 0 ? c.onAccent : c.text, display: 'flex', alignItems: 'flex-end', padding: 26, boxSizing: 'border-box', fontFamily: F.body, fontWeight: 800, fontSize: 36}}>{it}</div>
					))}
				</div>
			);
		case 'spec':
			return (
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46}}>
					<div style={{position: 'relative', width: 720, height: 130, borderRadius: 24, border: `3px solid ${c.text}`, background: c.card, display: 'flex', alignItems: 'center', padding: '0 40px', boxSizing: 'border-box', fontFamily: F.body, fontSize: 40, color: c.dim}}>
						Password
						{[[-56, 'top'], [0, 'left']].map(([o, side]) => <div key={side as string} style={{position: 'absolute', [side as string]: o, ...(side === 'top' ? {left: 0, right: 0, height: 0, borderTop: `3px dashed ${c.accent}`} : {top: 0, bottom: 0, width: 40, background: `${c.accent}33`})}} />)}
					</div>
					<div style={{display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 860}}>
						{items.map((it, i) => <span key={i} style={{padding: '14px 28px', borderRadius: 999, background: c.accent, color: c.onAccent, fontFamily: F.mono, fontWeight: 800, fontSize: 36}}>{it}</span>)}
					</div>
				</div>
			);
		case 'code':
			return (
				<div style={{width: 860, borderRadius: 36, background: '#0B0C10', border: `2px solid ${c.line}`, padding: '34px 40px', boxSizing: 'border-box', fontFamily: F.mono, fontSize: 38, lineHeight: 1.7, color: '#E8E8E8', textAlign: 'left'}}>
					<div style={{display: 'flex', gap: 12, marginBottom: 20}}>{['#FF6B5E', '#FFD27A', '#7BE07B'].map((x) => <div key={x} style={{width: 18, height: 18, borderRadius: 9, background: x}} />)}</div>
					{items.map((it, i) => <div key={i}><span style={{color: '#6B7280'}}>{i + 1}  </span>{it}</div>)}
				</div>
			);
		case 'flow':
			return (
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0}}>
					{items.map((it, i) => (
						<React.Fragment key={i}>
							{i ? <div style={{width: 6, height: 54, background: c.accent}} /> : null}
							<div style={{padding: '24px 54px', borderRadius: 999, background: i === 0 ? c.accent : c.card, border: `4px solid ${c.accent}`, color: i === 0 ? c.onAccent : c.text, fontFamily: F.display, fontWeight: 900, fontSize: 46}}>{it}</div>
						</React.Fragment>
					))}
				</div>
			);
	}
};

export const Insta50Cover: React.FC<CoverProps> = (p) => {
	const c = THEMES[p.theme] ?? THEMES.light;
	return (
		<AbsoluteFill style={{background: c.bg, color: c.text, fontFamily: F.body}}>
			<AbsoluteFill style={{backgroundImage: `radial-gradient(${c.line} 1.5px, transparent 1.5px)`, backgroundSize: '36px 36px', opacity: 0.6}} />
			<div style={{position: 'absolute', top: 150, left: 84, right: 84, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 30, letterSpacing: 3, color: c.dim, textTransform: 'uppercase'}}>
				<span>{p.account === 'DevGuide' ? 'devguide' : '@hukvadim'}</span><span>#{String(p.n).padStart(2, '0')}</span>
			</div>
			<div style={{position: 'absolute', top: 250, left: 0, right: 0, height: 1400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 70}}>
				<Title c={c} title={p.title} sub={p.sub} />
				<Visual p={p} c={c} />
			</div>
			<div style={{position: 'absolute', bottom: 190, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<span style={{padding: '22px 44px', borderRadius: 999, border: `3px solid ${c.text}`, fontFamily: F.body, fontWeight: 800, fontSize: 38}}>напиши «{p.cta}» у коментарях</span>
			</div>
		</AbsoluteFill>
	);
};
