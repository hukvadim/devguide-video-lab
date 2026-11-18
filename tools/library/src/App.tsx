import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Captions,
  Clapperboard,
  ClipboardCopy,
  ExternalLink,
  Image as ImageIcon,
  LayoutGrid,
  Music,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Star,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* ---------- дані з /api/library ---------- */
type Sound = { name: string; path: string; use: string; source: string };
type Song = {
  n: number;
  title: string;
  author: string;
  group: string;
  genre: string;
  dur: string;
  file: string;
  bpm: number | null;
  local: boolean;
  src: string;
  use: string;
};
type Clip = {
  name: string;
  file: string;
  from: number;
  dur: number;
  tags: string[];
  path: string;
};
type El = {
  code: string;
  name: string;
  appear: string;
  when: string;
  demo: string;
  t: number;
};
type Group = {
  id: string;
  title: string;
  sheet: string;
  video: string;
  items: El[];
};
type Lib = {
  repo: string;
  sounds: { id: string; when: string; tip: string; items: Sound[] }[];
  music: Song[];
  ugc: Clip[];
  groups: Group[];
  captions: { title: string; items: { code: string; name: string }[] }[];
  captionSheet: string;
  captionVideo: string;
  combos: { cap: string; t: number }[];
  images: { name: string; path: string }[];
  picks: Pick[];
};
type Kind = "sound" | "music" | "ugc" | "element" | "cap";
type Pick = { kind: Kind; id: string; label: string };
type Track = { title: string; sub: string; src: string };
type PlaySpec = {
  src: string;
  t: number;
  dur: number;
  label: string;
  pick?: Pick;
};

const fsUrl = (p: string) => (p.startsWith("http") ? p : `/@fs/${p}`);
const has = (q: string, ...xs: (string | undefined)[]) =>
  !q || xs.some((x) => x?.toLowerCase().includes(q));
const fmt = (s: number) =>
  Number.isFinite(s)
    ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
    : "–:––";
const safePlay = (el: HTMLMediaElement) => el.play().catch(() => {}); // наведення/відведення миші перериває play() — це норма

function copy(text: string, what = "Скопійовано") {
  navigator.clipboard.writeText(text);
  toast.success(what, {
    description: text.length > 120 ? `${text.slice(0, 120)}…` : text,
  });
}

const KIND_LABEL: Record<Kind, string> = {
  sound: "Звуки",
  music: "Музика",
  ugc: "UGC-вставки",
  element: "Елементи кадру",
  cap: "Субтитри (cap)",
};

const SECTIONS = [
  { id: "picks", label: "Вибране", icon: Star },
  { id: "sounds", label: "Звуки", icon: Volume2 },
  { id: "music", label: "Музика", icon: Music },
  { id: "ugc", label: "UGC-вставки", icon: Clapperboard },
  { id: "elements", label: "Елементи кадру", icon: LayoutGrid },
  { id: "captions", label: "Субтитри", icon: Captions },
  { id: "images", label: "Картинки", icon: ImageIcon },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

/* ---------- контекст сторінки (один на всю апку, тож просто проп-драйвінг через ctx) ---------- */
type Ctx = {
  lib: Lib;
  q: string;
  play: (t: Track) => void;
  isOn: (src: string) => boolean;
  picked: (p: Pick) => boolean;
  togglePick: (p: Pick) => void;
  open: (p: PlaySpec) => void;
};

export default function App() {
  const [lib, setLib] = useState<Lib | null>(null);
  const [section, setSection] = useState<SectionId>(() => {
    try {
      return (localStorage.getItem("lib.section") as SectionId) || "sounds";
    } catch {
      return "sounds";
    }
  });
  const [q, setQ] = useState("");
  const [picks, setPicks] = useState<Pick[]>([]);
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [modal, setModal] = useState<PlaySpec | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/library")
      .then((r) => r.json())
      .then((l: Lib) => {
        setLib(l);
        setPicks(l.picks ?? []);
      });
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("lib.section", section);
    } catch {
      /* приватне вікно */
    }
  }, [section]);

  const savePicks = (next: Pick[]) => {
    setPicks(next);
    fetch("/api/picks", { method: "POST", body: JSON.stringify(next) }).catch(
      () => toast.error("Не вдалося зберегти вибране"),
    );
  };
  const picked = (p: Pick) =>
    picks.some((x) => x.kind === p.kind && x.id === p.id);
  const togglePick = (p: Pick) =>
    savePicks(
      picked(p)
        ? picks.filter((x) => !(x.kind === p.kind && x.id === p.id))
        : [...picks, p],
    );

  const play = useCallback(
    (t: Track) => {
      const a = audio.current!;
      if (track?.src === t.src) {
        a.paused ? safePlay(a) : a.pause();
        return;
      }
      setTrack(t);
      a.src = fsUrl(t.src);
      safePlay(a);
    },
    [track],
  );
  const isOn = (src: string) => playing && track?.src === src;

  // ←/→ — попередній/наступний у тому ж списку (звуки або музика), пробіл — пауза
  const queue = useMemo<Track[]>(() => {
    if (!lib || !track) return [];
    const sounds = lib.sounds.flatMap((g) =>
      g.items.map((s) => ({
        title: s.name,
        sub: `звук · ${g.id}`,
        src: s.path,
      })),
    );
    const music = lib.music.map((m) => ({
      title: m.title,
      sub: `${m.author} · ${m.genre}`,
      src: m.src,
    }));
    return sounds.some((s) => s.src === track.src) ? sounds : music;
  }, [lib, track]);
  const step = useCallback(
    (d: number) => {
      const i = queue.findIndex((x) => x.src === track?.src);
      if (i < 0) return;
      play(queue[(i + d + queue.length) % queue.length]);
    },
    [queue, track, play],
  );

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).tagName === "INPUT";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        search.current?.focus();
        return;
      }
      if (typing || modal) return;
      if (e.key === " " && track) {
        e.preventDefault();
        play(track);
      }
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [track, play, step, modal]);

  if (!lib)
    return (
      <div className="p-10 text-sm text-muted-foreground">Сканую папки…</div>
    );

  const ctx: Ctx = {
    lib,
    q: q.trim().toLowerCase(),
    play,
    isOn,
    picked,
    togglePick,
    open: setModal,
  };
  const counts: Record<SectionId, number> = {
    picks: picks.length,
    sounds: lib.sounds.reduce((n, g) => n + g.items.length, 0),
    music: lib.music.length,
    ugc: lib.ugc.length,
    elements: lib.groups.reduce((n, g) => n + g.items.length, 0),
    captions: lib.captions.reduce((n, g) => n + g.items.length, 0),
    images: lib.images.length,
  };
  const searching = ctx.q.length > 0;
  const current = SECTIONS.find((s) => s.id === section)!;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-card/60">
        <div className="px-5 pt-6 pb-5">
          <div className="font-display text-[15px] font-extrabold tracking-tight">
            DEV<span className="text-primary">GUIDE</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Бібліотека для монтажу
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 px-3">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setSection(s.id);
                setQ("");
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                section === s.id && !searching
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                i === 0 && "mb-2",
              )}
            >
              <s.icon
                className={cn(
                  "size-4",
                  s.id === "picks" &&
                    picks.length > 0 &&
                    "fill-primary text-primary",
                )}
              />
              <span className="flex-1">{s.label}</span>
              <span className="font-mono text-[11px] opacity-60">
                {counts[s.id] || ""}
              </span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-2 px-5 pb-5 text-[11px] leading-relaxed text-muted-foreground/70">
          <div>
            <Kbd>★</Kbd> відміть, що взяти в ролик, і скажи Claude «візьми з
            вибраного»
          </div>
          <div>
            <Kbd>/</Kbd> пошук · <Kbd>пробіл</Kbd> пауза · <Kbd>←</Kbd>
            <Kbd>→</Kbd> сусідній звук
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b px-8 py-4">
          <h1 className="font-display text-xl font-semibold">
            {searching ? "Пошук по всьому" : current.label}
          </h1>
          <div className="relative ml-auto w-96">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQ("")}
              placeholder="Шукати всюди: whoosh, trap, wow, лічильник, E01…"
              className="h-10 bg-muted pl-9"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-8 pt-6 pb-32">
            {searching ? (
              <SearchAll ctx={ctx} />
            ) : section === "picks" ? (
              <Picks ctx={ctx} picks={picks} clear={() => savePicks([])} />
            ) : section === "sounds" ? (
              <Sounds ctx={ctx} />
            ) : section === "music" ? (
              <MusicList ctx={ctx} />
            ) : section === "ugc" ? (
              <Ugc ctx={ctx} />
            ) : section === "elements" ? (
              <Elements ctx={ctx} />
            ) : section === "captions" ? (
              <CaptionsBuilder ctx={ctx} />
            ) : (
              <Images ctx={ctx} />
            )}
          </div>
        </ScrollArea>
        <Player
          track={track}
          audio={audio}
          playing={playing}
          toggle={() => track && play(track)}
          step={step}
        />
      </main>
      <audio
        ref={audio}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {modal && (
        <VideoModal {...modal} ctx={ctx} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

/* ---------- плеєр ---------- */
function Player({
  track,
  audio,
  playing,
  toggle,
  step,
}: {
  track: Track | null;
  audio: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  toggle: () => void;
  step: (d: number) => void;
}) {
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const on = () => {
      setT(a.currentTime);
      setD(a.duration);
    };
    a.addEventListener("timeupdate", on);
    a.addEventListener("loadedmetadata", on);
    return () => {
      a.removeEventListener("timeupdate", on);
      a.removeEventListener("loadedmetadata", on);
    };
  }, [audio]);
  if (!track) return null;
  return (
    <div className="absolute right-0 bottom-0 left-0 border-t bg-popover/90 px-8 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => step(-1)}>
          <SkipBack />
        </Button>
        <Button size="icon" onClick={toggle} className="size-10 rounded-full">
          {playing ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4 translate-x-px" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => step(1)}>
          <SkipForward />
        </Button>
        <div className="ml-2 w-60 min-w-0">
          <div className="truncate text-sm font-medium">{track.title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {track.sub}
          </div>
        </div>
        <span className="w-10 text-right font-mono text-xs text-muted-foreground">
          {fmt(t)}
        </span>
        <input
          type="range"
          className="seek flex-1"
          min={0}
          max={d || 0}
          step={0.01}
          value={t}
          onChange={(e) => {
            audio.current!.currentTime = Number(e.target.value);
          }}
        />
        <span className="w-10 font-mono text-xs text-muted-foreground">
          {fmt(d)}
        </span>
      </div>
    </div>
  );
}

/* ---------- дрібниці ---------- */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 rounded border border-border bg-muted px-1 font-mono text-[10px] text-foreground/80">
      {children}
    </kbd>
  );
}

function Eq({ on }: { on: boolean }) {
  return on ? (
    <span className="eq flex h-3.5 items-end gap-[2px]">
      <span />
      <span />
      <span />
    </span>
  ) : (
    <Play className="size-4 translate-x-px" />
  );
}

function Empty({ text = "Нічого не знайдено" }: { text?: string }) {
  return (
    <div className="py-16 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        on
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function StarBtn({
  ctx,
  p,
  className,
}: {
  ctx: Ctx;
  p: Pick;
  className?: string;
}) {
  const on = ctx.picked(p);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            ctx.togglePick(p);
          }}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent",
            on
              ? "text-primary"
              : "text-muted-foreground/50 hover:text-foreground",
            className,
          )}
        >
          <Star className={cn("size-4", on && "fill-primary")} />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {on ? "Прибрати з вибраного" : "У вибране для ролика"}
      </TooltipContent>
    </Tooltip>
  );
}

function SectionTitle({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
        {children}
      </h2>
      {sub && <span className="text-sm text-muted-foreground">{sub}</span>}
    </div>
  );
}

/* ---------- елементи списків (спільні для розділів, пошуку й вибраного) ---------- */
function SoundTile({ ctx, s, folder }: { ctx: Ctx; s: Sound; folder: string }) {
  const on = ctx.isOn(s.path);
  return (
    <div
      onClick={() =>
        ctx.play({ title: s.name, sub: `звук · ${folder}`, src: s.path })
      }
      title={s.source}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-2.5 pr-1.5 transition-colors hover:border-primary/40",
        on && "border-primary/60 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
          on &&
            "bg-primary/15 group-hover:bg-primary/15 group-hover:text-foreground",
        )}
      >
        <Eq on={on} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {s.name.replace(/[-_]\d{3,}$/, "")}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">
          {folder}
        </div>
      </div>
      <StarBtn ctx={ctx} p={{ kind: "sound", id: s.use, label: s.name }} />
    </div>
  );
}

function MusicRow({ ctx, m }: { ctx: Ctx; m: Song }) {
  const on = ctx.isOn(m.src);
  return (
    <div
      onClick={() =>
        ctx.play({
          title: m.title,
          sub: `${m.author} · ${m.genre}`,
          src: m.src,
        })
      }
      className={cn(
        "group flex cursor-pointer items-center gap-4 border-b px-4 py-2.5 last:border-0 hover:bg-accent/50",
        on && "bg-primary/5",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
          on &&
            "bg-primary/15 group-hover:bg-primary/15 group-hover:text-foreground",
        )}
      >
        <Eq on={on} />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={cn("truncate text-sm font-medium", on && "text-primary")}
        >
          {m.title}
        </div>
        <div className="truncate text-xs text-muted-foreground">{m.author}</div>
      </div>
      <span className="hidden w-52 truncate text-xs text-muted-foreground xl:block">
        {m.genre}
      </span>
      <Badge
        variant="secondary"
        className="w-24 justify-center font-mono text-[11px]"
      >
        {m.group}
      </Badge>
      <span className="w-16 text-right font-mono text-xs text-muted-foreground">
        {m.bpm ? `${Math.round(m.bpm)} bpm` : ""}
      </span>
      <span className="w-10 text-right font-mono text-xs text-muted-foreground">
        {m.dur}
      </span>
      <StarBtn
        ctx={ctx}
        p={{ kind: "music", id: m.use, label: `${m.title} (${m.group})` }}
      />
    </div>
  );
}

/* кліп каталогу: кадр-постер із середини життя елемента; наведення → грає свій шматок по колу */
function CatalogClip({
  src,
  t,
  dur,
  className,
  onClick,
}: {
  src: string;
  t: number;
  dur: number;
  className?: string;
  onClick?: () => void;
}) {
  const v = useRef<HTMLVideoElement>(null);
  const poster = t + Math.min(1.6, dur / 2);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => {
        const el = v.current!;
        el.currentTime = t;
        safePlay(el);
      }}
      onMouseLeave={() => {
        const el = v.current!;
        el.pause();
        el.currentTime = poster;
      }}
      className={cn(
        "relative aspect-[9/16] cursor-pointer overflow-hidden rounded-lg bg-black",
        className,
      )}
    >
      <video
        ref={v}
        src={`${fsUrl(src)}#t=${poster}`}
        muted
        playsInline
        preload="metadata"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.currentTime > t + dur || el.currentTime < t - 0.2)
            el.currentTime = t;
        }}
        className="size-full object-cover"
      />
    </div>
  );
}

function ElementCard({ ctx, g, i }: { ctx: Ctx; g: Group; i: El }) {
  const pick: Pick = { kind: "element", id: i.code, label: i.name };
  const open = () =>
    g.video &&
    ctx.open({
      src: g.video,
      t: i.t,
      dur: 3.5,
      label: `${i.code} · ${i.name}`,
      pick,
    });
  return (
    <div
      onClick={open}
      className="group flex cursor-pointer gap-4 rounded-xl border bg-card p-3 transition-colors hover:border-primary/50"
    >
      {g.video && (
        <CatalogClip
          src={g.video}
          t={i.t}
          dur={3.5}
          className="w-32 shrink-0"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-sm font-medium text-primary">
            {i.code}
          </span>
          <span className="flex-1 text-sm font-medium leading-snug">
            {i.name}
          </span>
          <StarBtn ctx={ctx} p={pick} />
        </div>
        <div className="text-xs leading-relaxed text-muted-foreground">
          {i.appear}
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground/60">коли: </span>
          {i.when}
        </div>
      </div>
    </div>
  );
}

function UgcCard({ ctx, c }: { ctx: Ctx; c: Clip }) {
  const pick: Pick = { kind: "ugc", id: c.name, label: c.tags.join(", ") };
  return (
    <div className="group overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/50">
      <CatalogClip
        src={c.path}
        t={c.from}
        dur={c.dur || 3}
        className="rounded-none"
        onClick={() =>
          ctx.open({
            src: c.path,
            t: c.from,
            dur: c.dur || 3,
            label: c.name,
            pick,
          })
        }
      />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-sm text-primary">
            {c.name}
          </span>
          <StarBtn ctx={ctx} p={pick} />
        </div>
        <div className="flex flex-wrap gap-1">
          {c.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

const GRID_SOUND =
  "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2.5";
const GRID_EL = "grid grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-3";
const GRID_UGC = "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4";

/* ---------- розділи ---------- */
function Sounds({ ctx }: { ctx: Ctx }) {
  const [folder, setFolder] = useState<string | null>(null);
  const groups = ctx.lib.sounds.filter((g) => !folder || g.id === folder);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-1.5">
        <Chip on={!folder} onClick={() => setFolder(null)}>
          усі
        </Chip>
        {ctx.lib.sounds.map((g) => (
          <Chip
            key={g.id}
            on={folder === g.id}
            onClick={() => setFolder(folder === g.id ? null : g.id)}
          >
            {g.id} <span className="opacity-50">{g.items.length}</span>
          </Chip>
        ))}
      </div>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Клік по картці грає звук. Звук лише на реальну подію: поява сцени,
        картка, склейка, кілька на хвилину.{" "}
        <span className="text-foreground/80">
          switch-click-quick.mp3 заборонено.
        </span>
      </p>
      {groups.map((g) => (
        <section key={g.id}>
          <SectionTitle sub={g.when}>{g.id}</SectionTitle>
          <div className={GRID_SOUND}>
            {g.items.map((s) => (
              <SoundTile key={s.path} ctx={ctx} s={s} folder={g.id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MusicList({ ctx }: { ctx: Ctx }) {
  const [group, setGroup] = useState<string | null>(null);
  const groups = useMemo(
    () => [...new Set(ctx.lib.music.map((m) => m.group))],
    [ctx.lib],
  );
  const list = ctx.lib.music.filter((m) => !group || m.group === group);
  const missing = ctx.lib.music.filter((m) => !m.local).length;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        <Chip on={!group} onClick={() => setGroup(null)}>
          усі
        </Chip>
        {groups.map((g) => (
          <Chip
            key={g}
            on={group === g}
            onClick={() => setGroup(group === g ? null : g)}
          >
            {g}
          </Chip>
        ))}
      </div>
      {missing > 0 && (
        <p className="text-sm text-muted-foreground">
          {missing} треків не скачано, грають з інтернету. Скачати:{" "}
          <button
            onClick={() => copy("node scripts/fetch-music.mjs")}
            className="font-mono text-foreground hover:text-primary"
          >
            node scripts/fetch-music.mjs
          </button>
        </p>
      )}
      <div className="overflow-hidden rounded-xl border">
        {list.map((m) => (
          <MusicRow key={m.file} ctx={ctx} m={m} />
        ))}
      </div>
    </div>
  );
}

function Ugc({ ctx }: { ctx: Ctx }) {
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(
    () => [...new Set(ctx.lib.ugc.flatMap((c) => c.tags))].sort(),
    [ctx.lib],
  );
  const list = ctx.lib.ugc.filter((c) => !tag || c.tags.includes(tag));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        <Chip on={!tag} onClick={() => setTag(null)}>
          усі
        </Chip>
        {tags.map((t) => (
          <Chip
            key={t}
            on={tag === t}
            onClick={() => setTag(tag === t ? null : t)}
          >
            {t}
          </Chip>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Наведи — грає найкращий шматок, клік — велике відео. Без звуку, 2–4 с
        між фразами.
      </p>
      <div className={GRID_UGC}>
        {list.map((c) => (
          <UgcCard key={c.file} ctx={ctx} c={c} />
        ))}
      </div>
    </div>
  );
}

function Elements({ ctx }: { ctx: Ctx }) {
  const [group, setGroup] = useState("A");
  const [sheet, setSheet] = useState<string | null>(null);
  const g = ctx.lib.groups.find((x) => x.id === group)!;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {ctx.lib.groups.map((x) => (
          <Chip key={x.id} on={group === x.id} onClick={() => setGroup(x.id)}>
            <b className="font-mono">{x.id}</b> {x.title.split(" (")[0]}
          </Chip>
        ))}
      </div>
      <div className="flex items-baseline gap-4">
        <h2 className="font-display text-lg font-semibold">
          <span className="text-primary">{g.id}.</span> {g.title}
        </h2>
        <button
          onClick={() => setSheet(g.sheet)}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          аркуш-скріншот
        </button>
      </div>
      {!g.video && <NoVideo />}
      <p className="text-sm text-muted-foreground">
        Наведи на картку — елемент оживе, клік — велике відео.
      </p>
      <div className={GRID_EL}>
        {g.items.map((i) => (
          <ElementCard key={i.code} ctx={ctx} g={g} i={i} />
        ))}
      </div>
      {sheet && <Lightbox src={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}

function CaptionsBuilder({ ctx }: { ctx: Ctx }) {
  const [cap, setCap] = useState<string[]>(["S08", "T04", "T35", "T36"]);
  const [sheet, setSheet] = useState(false);
  const toggle = (code: string) =>
    setCap((c) =>
      c.includes(code) ? c.filter((x) => x !== code) : [...c, code],
    );
  const value = cap.join("+");
  const pick: Pick = { kind: "cap", id: value, label: "субтитри" };
  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-8 -mt-6 flex items-center gap-3 border-b bg-background/85 px-8 py-3 backdrop-blur-xl">
        <span className="text-sm text-muted-foreground">Твоя комбінація:</span>
        <code className="font-mono text-lg text-primary">{value || "—"}</code>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCap([])}>
            Очистити
          </Button>
          <Button
            size="sm"
            disabled={!value}
            onClick={() => ctx.togglePick(pick)}
          >
            <Star className={cn(ctx.picked(pick) && "fill-current")} />{" "}
            {ctx.picked(pick) ? "У вибраному" : "У вибране"}
          </Button>
        </div>
      </div>
      {ctx.lib.captionVideo ? (
        <section>
          <SectionTitle sub="наведи, щоб побачити · клік бере комбінацію">
            Готові приклади
          </SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
            {ctx.lib.combos.map((c) => (
              <div key={c.cap} className="space-y-1.5">
                <CatalogClip
                  src={ctx.lib.captionVideo}
                  t={c.t}
                  dur={3.5}
                  onClick={() => setCap(c.cap.split("+"))}
                  className={cn(
                    "w-full border transition-colors hover:border-primary/60",
                    value === c.cap && "border-primary",
                  )}
                />
                <div
                  className={cn(
                    "truncate font-mono text-[11px]",
                    value === c.cap ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {c.cap}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <NoVideo />
      )}
      <div className="flex items-baseline gap-4">
        <SectionTitle sub="або збери свою: клік додає / прибирає код">
          Усі коди
        </SectionTitle>
        <button
          onClick={() => setSheet(true)}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          аркуш-скріншот
        </button>
      </div>
      {ctx.lib.captions.map((g) => (
        <section key={g.title}>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {g.title}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2">
            {g.items.map((i) => {
              const on = cap.includes(i.code);
              return (
                <button
                  key={i.code}
                  onClick={() => toggle(i.code)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/50",
                    on && "border-primary bg-primary/10",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-xs",
                      on ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {i.code}
                  </span>
                  <span className="leading-snug">{i.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      {sheet && (
        <Lightbox src={ctx.lib.captionSheet} onClose={() => setSheet(false)} />
      )}
    </div>
  );
}

function Images({ ctx }: { ctx: Ctx }) {
  const [zoom, setZoom] = useState<string | null>(null);
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {ctx.lib.images.map((i) => (
          <button
            key={i.path}
            onClick={() => setZoom(i.path)}
            className="overflow-hidden rounded-xl border bg-card text-left transition-colors hover:border-primary/50"
          >
            <div className="aspect-video bg-black/40">
              <img
                src={fsUrl(i.path)}
                alt={i.name}
                className="size-full object-cover object-top"
              />
            </div>
            <div className="truncate p-3 text-sm">{i.name}</div>
          </button>
        ))}
      </div>
      {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
    </>
  );
}

/* ---------- пошук по всіх розділах ---------- */
function SearchAll({ ctx }: { ctx: Ctx }) {
  const { lib, q } = ctx;
  const sounds = lib.sounds.flatMap((g) =>
    g.items
      .filter((s) => has(q, s.name, g.id, g.when))
      .map((s) => ({ s, g: g.id })),
  );
  const music = lib.music.filter((m) =>
    has(q, m.title, m.author, m.group, m.genre),
  );
  const ugc = lib.ugc.filter((c) => has(q, c.name, ...c.tags));
  const els = lib.groups.flatMap((g) =>
    g.items
      .filter((i) => has(q, i.code, i.name, i.appear, i.when))
      .map((i) => ({ g, i })),
  );
  const caps = lib.captions
    .flatMap((g) => g.items)
    .filter((i) => has(q, i.code, i.name));
  if (
    !sounds.length &&
    !music.length &&
    !ugc.length &&
    !els.length &&
    !caps.length
  )
    return <Empty />;
  return (
    <div className="space-y-10">
      {sounds.length > 0 && (
        <section>
          <SectionTitle sub={`${sounds.length}`}>Звуки</SectionTitle>
          <div className={GRID_SOUND}>
            {sounds.map(({ s, g }) => (
              <SoundTile key={s.path} ctx={ctx} s={s} folder={g} />
            ))}
          </div>
        </section>
      )}
      {music.length > 0 && (
        <section>
          <SectionTitle sub={`${music.length}`}>Музика</SectionTitle>
          <div className="overflow-hidden rounded-xl border">
            {music.map((m) => (
              <MusicRow key={m.file} ctx={ctx} m={m} />
            ))}
          </div>
        </section>
      )}
      {ugc.length > 0 && (
        <section>
          <SectionTitle sub={`${ugc.length}`}>UGC-вставки</SectionTitle>
          <div className={GRID_UGC}>
            {ugc.map((c) => (
              <UgcCard key={c.file} ctx={ctx} c={c} />
            ))}
          </div>
        </section>
      )}
      {els.length > 0 && (
        <section>
          <SectionTitle sub={`${els.length}`}>Елементи кадру</SectionTitle>
          <div className={GRID_EL}>
            {els.map(({ g, i }) => (
              <ElementCard key={i.code} ctx={ctx} g={g} i={i} />
            ))}
          </div>
        </section>
      )}
      {caps.length > 0 && (
        <section>
          <SectionTitle
            sub={`${caps.length} · збирай комбінацію в розділі «Субтитри»`}
          >
            Коди субтитрів
          </SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2">
            {caps.map((i) => (
              <div
                key={i.code}
                className="flex gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm"
              >
                <span className="font-mono text-xs text-primary">{i.code}</span>
                {i.name}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- вибране ---------- */
function Picks({
  ctx,
  picks,
  clear,
}: {
  ctx: Ctx;
  picks: Pick[];
  clear: () => void;
}) {
  const { lib } = ctx;
  if (!picks.length)
    return (
      <Empty text="Тут поки порожньо. Тисни ★ біля звуку, треку, вставки чи елемента — і воно з'явиться тут." />
    );
  const brief = (Object.keys(KIND_LABEL) as Kind[])
    .map((k) => [k, picks.filter((p) => p.kind === k)] as const)
    .filter(([, ps]) => ps.length)
    .map(
      ([k, ps]) =>
        `${KIND_LABEL[k]}: ${ps.map((p) => (k === "element" ? `${p.id} (${p.label})` : p.id)).join(", ")}`,
    )
    .join("\n");
  const of = <K extends Kind>(k: K) => picks.filter((p) => p.kind === k);
  const sounds = lib.sounds.flatMap((g) =>
    g.items
      .filter((s) => of("sound").some((p) => p.id === s.use))
      .map((s) => ({ s, g: g.id })),
  );
  const music = lib.music.filter((m) =>
    of("music").some((p) => p.id === m.use),
  );
  const ugc = lib.ugc.filter((c) => of("ugc").some((p) => p.id === c.name));
  const els = lib.groups.flatMap((g) =>
    g.items
      .filter((i) => of("element").some((p) => p.id === i.code))
      .map((i) => ({ g, i })),
  );
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex-1 space-y-2">
          <div className="font-medium">Як передати в монтаж</div>
          <p className="text-sm text-muted-foreground">
            Вибране зберігається в{" "}
            <span className="font-mono text-foreground">
              data/library-picks.json
            </span>
            . Просто напиши Claude:{" "}
            <span className="text-foreground">
              «змонтуй … і візьми з вибраного»
            </span>
            . Або скопіюй список нижче в чат.
          </p>
          <pre className="whitespace-pre-wrap rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            {brief}
          </pre>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() =>
              copy(
                `Для монтажу візьми з бібліотеки:\n${brief}`,
                "Список скопійовано",
              )
            }
          >
            <ClipboardCopy /> Копіювати
          </Button>
          <Button size="sm" variant="ghost" onClick={clear}>
            <Trash2 /> Очистити
          </Button>
        </div>
      </div>
      {sounds.length > 0 && (
        <section>
          <SectionTitle>Звуки</SectionTitle>
          <div className={GRID_SOUND}>
            {sounds.map(({ s, g }) => (
              <SoundTile key={s.path} ctx={ctx} s={s} folder={g} />
            ))}
          </div>
        </section>
      )}
      {music.length > 0 && (
        <section>
          <SectionTitle>Музика</SectionTitle>
          <div className="overflow-hidden rounded-xl border">
            {music.map((m) => (
              <MusicRow key={m.file} ctx={ctx} m={m} />
            ))}
          </div>
        </section>
      )}
      {ugc.length > 0 && (
        <section>
          <SectionTitle>UGC-вставки</SectionTitle>
          <div className={GRID_UGC}>
            {ugc.map((c) => (
              <UgcCard key={c.file} ctx={ctx} c={c} />
            ))}
          </div>
        </section>
      )}
      {els.length > 0 && (
        <section>
          <SectionTitle>Елементи кадру</SectionTitle>
          <div className={GRID_EL}>
            {els.map(({ g, i }) => (
              <ElementCard key={i.code} ctx={ctx} g={g} i={i} />
            ))}
          </div>
        </section>
      )}
      {of("cap").length > 0 && (
        <section>
          <SectionTitle>Субтитри</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {of("cap").map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1 rounded-lg border bg-card py-1 pr-1 pl-3"
              >
                <code className="font-mono text-sm text-primary">{p.id}</code>
                <StarBtn ctx={ctx} p={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- модалки ---------- */
function NoVideo() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
      <Clapperboard className="size-4 text-primary" />
      <span>
        Відео-прикладів ще нема. Запусти{" "}
        <button
          onClick={() => copy("npm run library:catalog")}
          className="font-mono text-foreground hover:text-primary"
        >
          npm run library:catalog
        </button>{" "}
        і онови сторінку.
      </span>
    </div>
  );
}

function useEsc(onClose: () => void) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
}

function VideoModal({
  src,
  t,
  dur,
  label,
  pick,
  ctx,
  onClose,
}: PlaySpec & { ctx: Ctx; onClose: () => void }) {
  useEsc(onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <video
        src={`${fsUrl(src)}#t=${t}`}
        autoPlay
        muted
        playsInline
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.currentTime > t + dur) el.currentTime = t;
        }}
        className="max-h-[80vh] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className="flex items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono text-sm text-primary">{label}</span>
        {pick && (
          <Button
            size="sm"
            variant={ctx.picked(pick) ? "secondary" : "default"}
            onClick={() => ctx.togglePick(pick)}
          >
            <Star className={cn(ctx.picked(pick) && "fill-current")} />{" "}
            {ctx.picked(pick) ? "У вибраному" : "У вибране"}
          </Button>
        )}
      </div>
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-5 right-5"
        onClick={onClose}
      >
        <X />
      </Button>
    </div>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEsc(onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <img
        src={fsUrl(src)}
        alt=""
        className="max-h-full max-w-full rounded-lg shadow-2xl"
      />
      <div className="absolute top-5 right-5 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            window.open(fsUrl(src));
          }}
        >
          <ExternalLink />
        </Button>
        <Button variant="secondary" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>
    </div>
  );
}
