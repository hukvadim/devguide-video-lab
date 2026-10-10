// Розбивка слів озвучки на рядки субтитрів. Спільна для вшитих субтитрів (Remotion) і .srt (scripts/srt.mjs),
// тому лише стираний TypeScript: Node запускає цей файл напряму.
export type Word = {w: string; s: number; e: number};

export function chunkWords(words: Word[], maxChars = 44): Word[][] {
	const out: Word[][] = [];
	let cur: Word[] = [];
	for (const w of words) {
		const prev = cur[cur.length - 1];
		const len = cur.reduce((n, x) => n + x.w.length + 1, 0);
		if (prev && (len + w.w.length > maxChars || w.s - prev.e > 0.5 || /[.?!…]$/.test(prev.w))) {
			out.push(cur);
			cur = [];
		}
		cur.push(w);
	}
	if (cur.length) out.push(cur);
	return out;
}

// Коли рядок зникає: трохи після останнього слова, але не пізніше за наступний рядок.
export const chunkEnd = (chunks: Word[][], i: number, tail = 0.6) =>
	Math.min(chunks[i][chunks[i].length - 1].e + tail, chunks[i + 1]?.[0].s ?? Infinity);
