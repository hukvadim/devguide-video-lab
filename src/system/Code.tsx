import React from 'react';
import {C, F} from './kit';

// Tiny deterministic JSX highlighter: enough for the 8-10 lines shown on screen.
const RULES: [RegExp, string][] = [
	[/^\/\/.*/, C.dim],
	[/^'[^']*'?/, '#FFD27A'],
	[/^"[^"]*"?/, '#FFD27A'],
	[/^<\/?[A-ZА-Я][\wА-Яа-яІіЇїЄєҐґ]*/, C.blue],
	[/^\/?>/, C.blue],
	[/^(export|default|function|const|return|import|from)\b/, C.lime],
	[/^[a-zA-Z_]\w*(?==)/, '#C9B6FF'],
	[/^[a-zA-Z_]\w*(?=\()/, '#FFFFFF'],
	[/^[{}()[\];,=.]/, '#9AA6B2'],
	[/^\s+/, ''],
	[/^[^\s{}()[\];,=.<>'"/]+/, C.text],
	[/^./, C.text],
];
export const tokenize = (line: string) => {
	const out: {t: string; c: string}[] = [];
	let s = line;
	while (s.length) {
		for (const [re, c] of RULES) {
			const m = s.match(re);
			if (m && m[0].length) {
				out.push({t: m[0], c});
				s = s.slice(m[0].length);
				break;
			}
		}
	}
	return out;
};

/** Renders `line` truncated to `chars` visible characters, keeping highlight colours. */
export const CodeLine: React.FC<{line: string; chars?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({line, chars = Infinity, style, children}) => {
	let left = chars;
	return (
		<div style={{whiteSpace: 'pre', minHeight: '1.55em', position: 'relative', ...style}}>
			{tokenize(line).map((tok, i) => {
				if (left <= 0) return null;
				const t = tok.t.slice(0, left);
				left -= tok.t.length;
				return (
					<span key={i} style={{color: tok.c}}>
						{t}
					</span>
				);
			})}
			{children}
		</div>
	);
};

export const EditorWindow: React.FC<{title?: string; children: React.ReactNode; style?: React.CSSProperties; fontSize?: number}> = ({title = 'App.jsx', children, style, fontSize = 34}) => (
	<div
		style={{
			background: '#0D1318F2',
			border: `1px solid ${C.line}`,
			borderRadius: 34,
			boxShadow: '0 60px 140px #000000B0, inset 0 1px 0 #ffffff14',
			overflow: 'hidden',
			...style,
		}}
	>
		<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '26px 32px', borderBottom: `1px solid ${C.line}`}}>
			{['#FF6B5E', '#FFD27A', C.lime].map((c) => (
				<div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c, opacity: 0.85}} />
			))}
			<div style={{marginLeft: 18, fontFamily: F.mono, fontSize: 28, color: C.dim}}>{title}</div>
		</div>
		<div style={{padding: '28px 34px 34px', fontFamily: F.mono, fontSize, lineHeight: 1.55}}>{children}</div>
	</div>
);

export const Caret: React.FC<{frame: number; color?: string}> = ({frame, color = C.lime}) => (
	<span
		style={{
			display: 'inline-block',
			width: 4,
			height: '1.15em',
			background: color,
			verticalAlign: 'text-bottom',
			marginLeft: 2,
			opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.15,
		}}
	/>
);
