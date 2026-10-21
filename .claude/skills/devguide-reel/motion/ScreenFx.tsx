import React from 'react';
import { AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, clamp } from './theme';

// Панель екрана для спліту в стилі Screen Studio: запис екрана (час 0 = from секунда запису), поверх — великий
// курсор за трекінгом (scripts/cursor.mjs), хвиля на кліках, камера плавно наближається до кліку й відходить.
// Усі координати — пікселі запису екрана, час — секунди запису.
export type CursorPt = [number, number | null, number?, string?]; // [t, x, y, shape] | [t, null] — прихований
export type ScreenFxProps = {
  w: number; h: number; dur: number; from: number; src: string;
  sw: number; sh: number;             // розмір запису
  bounds?: [number, number, number, number]; // корисна ділянка [x, y, w, h] (без панелі задач)
  pts: CursorPt[]; clicks: { t: number; x: number; y: number }[];
  zooms?: { t: number; dur: number; x: number; y: number; w?: number }[];
  zoomW?: number;                     // ширина кадру при наближенні (пікселі запису)
  accent?: string;
};

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// позиція курсора в момент t: лінійно між точками трекінгу, згладжено середнім ±0.1 с; null — прихований
function cursorAt(pts: CursorPt[], t: number) {
  const at = (u: number) => {
    let i = pts.findIndex((p) => p[0] > u);
    if (i < 0) i = pts.length;
    const a = pts[i - 1], b = pts[i];
    if (!a || a[1] == null) return null;
    if (!b || b[1] == null) return { x: a[1], y: a[2]!, shape: a[3] };
    const k = (u - a[0]) / (b[0] - a[0]);
    return { x: lerp(a[1], b[1], k), y: lerp(a[2]!, b[2]!, k), shape: k < 0.5 ? a[3] : b[3] };
  };
  const c = at(t);
  if (!c) return null;
  const n = [-0.1, -0.05, 0.05, 0.1].map((d) => at(t + d)).filter(Boolean) as { x: number; y: number }[];
  return { ...c, x: (c.x + n.reduce((s, p) => s + p.x, 0)) / (1 + n.length), y: (c.y + n.reduce((s, p) => s + p.y, 0)) / (1 + n.length) };
}

// сила наближення на spring: вхід за `lead` с до start (snappy, ледь помітний перелiт), вихід після end (smooth)
function zoomK(t: number, start: number, end: number, lead: number, fps: number) {
  if (t < start - lead) return 0;
  const enter = spring({ frame: (t - start + lead) * fps, fps, config: { damping: 20, stiffness: 140 } });
  const exit = t > end ? spring({ frame: (t - end) * fps, fps, config: { damping: 200 } }) : 0;
  return enter * (1 - exit);
}

// камера: повний кадр (по висоті bounds), центр стежить за курсором; на кліку — наближення zoomW
function camAt(p: ScreenFxProps, t: number, aspect: number, fps: number) {
  const [bx, by, bw, bh] = p.bounds ?? [0, 0, p.sw, p.sh];
  const fullW = Math.min(bw, bh * aspect);
  const zW = p.zoomW ?? fullW * 0.62;
  // ручні наближення zooms: [t, t+dur] на точку x,y (набір тексту, відповідь); клік у вікні ручного зуму
  // своєї камери не має — інакше дві цілі змагаються й кадр смикається
  const zooms = p.zooms ?? [];
  const free = p.clicks.filter((c) => !zooms.some((z) => c.t > z.t - 1.5 && c.t < z.t + z.dur + 0.7));
  let k = 0, fx = 0, fy = 0, tw = zW;
  for (const c of free) {
    const v = zoomK(t, c.t - 0.1, c.t + 1.4, 0.6, fps);
    if (v > k) { k = v; fx = c.x; fy = c.y; tw = zW; }
  }
  for (const z of zooms) {
    const v = zoomK(t, z.t, z.t + z.dur, 0.6, fps);
    if (v > k) { k = v; fx = z.x; fy = z.y; tw = z.w ?? zW; }
  }
  // центр без зуму їде від кліку до кліку (spring, старт за 0.8 с до кліку), а не за трекером:
  // шумний/прихований курсор давав тремтіння кадру
  let px = bx + bw / 2;
  for (const c of p.clicks) {
    if (t < c.t - 0.8) break;
    px = lerp(px, c.x, spring({ frame: (t - c.t + 0.8) * fps, fps, config: { damping: 200 } }));
  }
  const w = lerp(fullW, tw, k), h = w / aspect;
  const cx = lerp(px, fx, k), cy = lerp(by + bh / 2, fy, k);
  return {
    w, h,
    x: Math.max(bx, Math.min(cx - w / 2, bx + bw - w)),
    y: Math.max(by, Math.min(cy - h / 2, by + bh - h)),
  };
}

// стрілка: біла з темною обводкою, гаряча точка в (2, 2); 24×36 у власних одиницях
const Arrow: React.FC = () => (
  <path d="M2 2 L2 30 L9.5 23 L14.5 34 L19.5 31.8 L14.6 21 L24.5 21 Z" fill="#fff" stroke="#0B0F14" strokeWidth={2.2} strokeLinejoin="round" />
);
// рука-вказівник: гаряча точка — кінчик пальця (10, 2)
const Hand: React.FC = () => (
  <path d="M10 2 C12.2 2 13.4 3.4 13.4 5.4 L13.4 15 C13.4 13.2 17.6 13 17.6 15.4 L17.6 16.6 C17.6 14.6 21.8 14.4 21.8 16.8 L21.8 18 C21.8 16 26 15.8 26 18.4 L26 27 C26 32.5 22.6 36 17.4 36 L13.6 36 C10.4 36 8.6 34.6 6.8 32.2 L1.8 25.4 C0.6 23.8 1.4 21.8 3.2 21.8 C4.2 21.8 5 22.4 5.8 23.4 L6.6 24.6 L6.6 5.4 C6.6 3.4 7.8 2 10 2 Z"
    fill="#fff" stroke="#0B0F14" strokeWidth={2.2} strokeLinejoin="round" />
);

export const ScreenFx: React.FC<ScreenFxProps> = (p) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = p.from + f / fps;
  const aspect = width / height;
  const cur = cursorAt(p.pts, t);
  const cam = camAt(p, t, aspect, fps);
  const s = width / cam.w; // масштаб запис → панель
  const accent = p.accent ?? C.lime;
  // курсор: ~2.4× системного у пікселях запису
  const CS = 2.4 * 19 / 36;
  const near = p.clicks.map((c) => t - c.t).filter((d) => d > -0.05 && d < 0.6)[0];
  const press = near == null ? 1 : interpolate(near, [-0.05, 0.05, 0.3], [1, 0.82, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -cam.x * s, top: -cam.y * s, width: p.sw * s, height: p.sh * s }}>
        <OffthreadVideo src={staticFile(p.src)} startFrom={Math.round(p.from * fps)} muted style={{ width: '100%', height: '100%' }} />
        <svg viewBox={`0 0 ${p.sw} ${p.sh}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {p.clicks.map((c, i) => {
            const d = t - c.t;
            if (d < 0 || d > 0.7) return null;
            const r = interpolate(d, [0, 0.7], [6, 70], { ...clamp, easing: Easing.out(Easing.cubic) });
            const o = interpolate(d, [0, 0.15, 0.7], [0, 0.95, 0], clamp);
            return <g key={i} opacity={o}>
              <circle cx={c.x} cy={c.y} r={r} fill={accent} fillOpacity={0.18} stroke={accent} strokeWidth={5} />
              <circle cx={c.x} cy={c.y} r={r * 0.55} fill="none" stroke={accent} strokeWidth={3} strokeOpacity={0.7} />
            </g>;
          })}
          {cur && (
            <g transform={`translate(${cur.x} ${cur.y}) scale(${CS * press})`}>
              {cur.shape === 'hand' ? <g transform="translate(-10 -2)"><Hand /></g> : <g transform="translate(-2 -2)"><Arrow /></g>}
            </g>
          )}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
