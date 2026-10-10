// Чиста логіка розкладки тексту (без React/DOM): її ганяє selftest у vid.mjs. Ширину міряє переданий measure(text, size).
export type Measure = (text: string, size: number) => number;
export type CapWord = { s: number; e: number; w: string; em?: boolean };
export type Page = { words: CapWord[]; lines: number[][]; size: number; start: number; end: number };

// жадібне перенесення: індекси слів по рядках, кожен рядок ≤ maxW
export function wrap(words: string[], size: number, maxW: number, measure: Measure): number[][] {
  const space = measure(' ', size);
  const lines: number[][] = [];
  let cur: number[] = [], width = 0;
  words.forEach((w, i) => {
    const ww = measure(w, size);
    if (cur.length && width + space + ww > maxW) { lines.push(cur); cur = []; width = 0; }
    width += (cur.length ? space : 0) + ww;
    cur.push(i);
  });
  if (cur.length) lines.push(cur);
  return lines;
}

// Розмір і рядки для заголовка: менше рядків краще (рядок «коштує» 30% розміру), а 2+ рядки балансуються за шириною,
// щоб не було «довгий рядок + одне слово».
export function fitSize(words: string[], sizes: number[], maxW: number, maxLines: number, measure: Measure) {
  let best: { size: number; lines: number[][]; score: number } | null = null;
  for (const size of sizes) {
    const lines = wrap(words, size, maxW, measure);
    const fits = lines.length <= maxLines && lines.every((l) => l.length > 1 || measure(words[l[0]], size) <= maxW);
    if (!fits) continue;
    const score = size * (1 - 0.3 * (lines.length - 1));
    if (!best || score > best.score) best = { size, lines, score };
  }
  if (!best) { const size = sizes.at(-1)!; return { size, lines: wrap(words, size, maxW, measure) }; }
  return { size: best.size, lines: balance(words, best.size, maxW, best.lines.length, measure) };
}

// найвужча ширина, за якої текст ще вміщується в n рядків — рядки виходять рівними
export function balance(words: string[], size: number, maxW: number, n: number, measure: Measure) {
  if (n < 2) return wrap(words, size, maxW, measure);
  let lo = 0, hi = maxW;
  while (hi - lo > 4) { const mid = (lo + hi) / 2; if (wrap(words, size, mid, measure).length <= n) hi = mid; else lo = mid; }
  return wrap(words, size, hi, measure);
}

export const capText = (w: string) => w.replace(/^[«"„“(\[]+|[»"”)\],.;:]+$/g, '');

// Субтитри сторінками: розрив на паузі, кінці речення, комі (від 2 слів), за довжиною (не більше maxLines при мінімальному розмірі)
// і за часом (≤ maxDur). Розмір кожної сторінки — найбільший із sizes, що вміщує її в maxLines.
export function paginate(all: CapWord[], o: { maxW: number; maxLines: number; sizes: number[]; maxDur?: number; gap?: number; tail?: number }, measure: Measure): Page[] {
  const words = all.map((w) => ({ ...w, w: capText(w.w) })).filter((w) => w.w);
  const raw = all.filter((w) => capText(w.w));
  const minSize = o.sizes.at(-1)!;
  const pages: CapWord[][] = [];
  let cur: CapWord[] = [];
  words.forEach((w, i) => {
    const prev = cur.at(-1), prevRaw = raw[i - 1];
    const tooLong = cur.length && wrap([...cur, w].map((x) => x.w), minSize, o.maxW, measure).length > o.maxLines;
    const breakHere = prev && (
      w.s - prev.e > (o.gap ?? 0.45) ||
      /[.?!…]$/.test(prevRaw.w) ||
      (/[,;:—–]$/.test(prevRaw.w) && cur.length >= 2) ||
      tooLong ||
      w.e - cur[0].s > (o.maxDur ?? 2.8));
    if (breakHere) { pages.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) pages.push(cur);
  return pages.map((p, i) => {
    const { size, lines } = fitSize(p.map((x) => x.w), o.sizes, o.maxW, o.maxLines, measure);
    const next = pages[i + 1]?.[0].s ?? Infinity;
    return { words: p, lines, size, start: p[0].s, end: Math.min(next, p.at(-1)!.e + (o.tail ?? 0.35)) };
  });
}
