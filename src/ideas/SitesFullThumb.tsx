import React from 'react';
import {C, F, Stage, Wordmark} from '../system/kit';

const STEPS = ['VS Code + Claude Code', 'Git і GitHub', 'ТЗ і ціна', 'Trello + MCP', 'Vercel'];

export const SitesFullThumb: React.FC = () => (
	<Stage glow={[1500, 250]} grid>
		<div style={{position: 'absolute', left: 96, top: 110, width: 1100}}>
			<div style={{fontFamily: F.mono, fontSize: 44, letterSpacing: 6, color: C.lime}}>ПОВНИЙ ШЛЯХ · 19 ХВ</div>
			<div style={{marginTop: 28, fontFamily: F.display, fontWeight: 900, fontSize: 112, lineHeight: 1.08, letterSpacing: -2.5}}>
				Сайт для<br />клієнта з<br /><span style={{color: C.lime}}>Claude Code</span>
			</div>
		</div>
		<div style={{position: 'absolute', right: 96, top: 150, display: 'flex', flexDirection: 'column', gap: 22}}>
			{STEPS.map((s, i) => (
				<div key={s} style={{padding: '20px 40px', borderRadius: 24, border: `3px solid ${C.lime}`, background: `${C.lime}18`, color: C.text, fontFamily: F.body, fontWeight: 700, fontSize: 48, whiteSpace: 'nowrap'}}>
					<span style={{color: C.lime, marginRight: 18}}>{i + 1}</span>{s}
				</div>
			))}
		</div>
		<div style={{position: 'absolute', left: 96, bottom: 70}}><Wordmark size={64} /></div>
	</Stage>
);
