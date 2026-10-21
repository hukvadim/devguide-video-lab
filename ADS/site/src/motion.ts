import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Lenis from "lenis";
import { track } from "./analytics";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin);

type Mode = "full" | "lite" | "off";
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const fine = matchMedia("(pointer: fine)").matches;

/**
 * Три режими (html[data-motion], ставиться в index.html до першого кадру):
 *  full — усі сцени: pin, scrub, Lenis на десктопі;
 *  lite — Instagram/FB WebView або ?motion=lite: короткі reveal, без pin/scrub/Lenis;
 *  off  — prefers-reduced-motion або ?motion=off: жодної анімації, усе статично.
 * Зміст і CTA лежать у HTML, анімація лише "from"-станами — без JS сторінка повна.
 */
export function initMotion() {
  const mode = document.documentElement.dataset.motion as Mode;
  details(mode);
  videos(mode);
  taskJump(mode);
  if (mode === "off") return;

  phoneCycle(mode);
  headings(mode);
  if (mode === "lite") return lite();

  if (fine) smooth();
  hero();
  marquees();
  tasks();
  work();
  automation();
  services();
  steps();
  ads();
  final();
  magnetic();

  // висоти змінюються після шрифтів і картинок
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => ScrollTrigger.refresh());
}

/* ---------- спільне ---------- */

function details(mode: Mode) {
  for (const d of $$<HTMLDetailsElement>("details")) {
    const sum = $("summary", d);
    const body = $(".svc-body", d);
    sum.addEventListener("click", (e) => {
      if (!d.open && d.dataset.svc) track("service_expand", { service_id: d.dataset.svc });
      if (mode === "off") return;
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: 0.35, ease: "power2.inOut", onComplete: () => { d.open = false; gsap.set(body, { clearProps: "height" }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.from(body, { height: 0, duration: 0.5, ease: "expo.out", onComplete: () => ScrollTrigger.refresh() });
        gsap.from($$(".svc-inner > *", d), { y: 14, autoAlpha: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });
      }
    });
  }
}

function videos(mode: Mode) {
  const seen = new Set<string>();
  const vids = $$<HTMLVideoElement>("video");
  for (const v of vids) {
    v.addEventListener("play", () => {
      const id = v.dataset.asset!;
      if (!seen.has(id)) { seen.add(id); track("video_play", { asset_id: id }); }
    });
    // зламаний файл не лишає чорний плеєр
    v.addEventListener("error", () => v.replaceWith(Object.assign(document.createElement("div"), { className: "case-missing", textContent: "Демо — матеріал буде замінено" })));
  }
  if (mode === "off") {
    // reduced-motion: без автоплею, превʼю по tap
    vids.forEach((v) => (v.controls = true));
    return;
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target as HTMLVideoElement;
    if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.25 });
  vids.forEach((v) => io.observe(v));
}

// картка задачі: імпульс, плавний переїзд до групи послуг, групa "підсвічується"
function taskJump(mode: Mode) {
  for (const a of $$<HTMLAnchorElement>("[data-task]")) {
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href")!);
      if (mode === "off") return;
      e.preventDefault();
      track("service_expand", { service_id: `group-${a.dataset.task}` });
      gsap.timeline()
        .to(a, { scale: 0.96, duration: 0.12, ease: "power2.in" })
        .to(a, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      scrollTo(target, () => {
        gsap.fromTo($$(".svc", target), { x: 30, autoAlpha: 0.2 }, { x: 0, autoAlpha: 1, stagger: 0.07, duration: 0.6, ease: "expo.out", clearProps: "all" });
        gsap.fromTo($(".svc-title", target), { scale: 1.15, transformOrigin: "left center" }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
      });
    });
  }
  for (const a of $$<HTMLAnchorElement>("[data-scroll]")) {
    a.addEventListener("click", (e) => {
      if (mode === "off") return;
      e.preventDefault();
      scrollTo($(a.getAttribute("href")!));
    });
  }
  const copy = $<HTMLButtonElement>("[data-copy]");
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(copy.dataset.copy!); } catch { return; }
    const t = Object.assign(document.createElement("div"), { className: "toast", textContent: `Скопійовано ${copy.dataset.copy}` });
    document.body.append(t);
    gsap.timeline({ onComplete: () => t.remove() })
      .from(t, { y: 20, autoAlpha: 0, duration: 0.3 })
      .to(t, { autoAlpha: 0, duration: 0.3 }, "+=1.4");
  });
}

let lenis: Lenis | null = null;
function scrollTo(el: HTMLElement, done?: () => void) {
  const y = el.getBoundingClientRect().top + scrollY - 20;
  if (lenis) lenis.scrollTo(y, { duration: 1.2, onComplete: done });
  else { scrollTo2(y); setTimeout(() => done?.(), 700); }
}
const scrollTo2 = (y: number) => window.scrollTo({ top: y, behavior: "smooth" });

/* ---------- hero ---------- */

// цикл демонстрацій у телефоні: сайт сам прокручується → відео → заявка збирається
function phoneCycle(mode: Mode) {
  const slides = $$("[data-slide]");
  const tabs = $$(".phone-tabs span");
  const img = $<HTMLImageElement>(".scroller");
  const screen = $(".phone-screen");
  let i = 0;
  const show = (n: number) => {
    const prev = slides[i], next = slides[n];
    tabs.forEach((t, k) => t.classList.toggle("is-on", k === n));
    next.classList.add("is-on");
    if (mode === "full") {
      gsap.fromTo(next, { clipPath: "circle(0% at 50% 100%)", autoAlpha: 1 }, { clipPath: "circle(150% at 50% 100%)", duration: 0.9, ease: "expo.inOut", onComplete: () => { prev.classList.remove("is-on"); gsap.set(prev, { autoAlpha: 0 }); } });
      gsap.fromTo(prev, { scale: 1 }, { scale: 0.92, duration: 0.9, ease: "expo.inOut", clearProps: "scale" });
    } else {
      gsap.fromTo(next, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, onComplete: () => { prev.classList.remove("is-on"); gsap.set(prev, { autoAlpha: 0 }); } });
    }
    const slide = next.dataset.slide;
    if (slide === "site") {
      gsap.fromTo(img, { y: 0 }, { y: () => -(img.offsetHeight - screen.offsetHeight) * 0.55, duration: 2.6, ease: "power1.inOut", delay: 0.3 });
    } else if (slide === "video") {
      const v = $<HTMLVideoElement>("video", next);
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      gsap.from($$(".mini-chat, .mini-card > *", next), { y: 18, autoAlpha: 0, stagger: 0.18, duration: 0.5, ease: "back.out(2)", delay: 0.3 });
    }
    i = n;
  };
  gsap.set(slides.slice(1), { autoAlpha: 0 });
  show(0);
  // gsap.delayedCall замість setInterval: пауза разом з глобальним таймлайном, коли вкладка прихована
  const loop = () => gsap.delayedCall(3, () => { show((i + 1) % slides.length); loop(); });
  loop();
}

function headings(mode: Mode) {
  for (const el of $$("[data-split]")) {
    SplitText.create(el, {
      type: "words", mask: "words", autoSplit: true,
      onSplit: (s) => mode === "full"
        ? gsap.from(s.words, { yPercent: 115, rotate: 4, duration: 1, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: el, start: "top 88%" } })
        : gsap.from(s.words, { autoAlpha: 0, duration: 0.5, stagger: 0.04, scrollTrigger: { trigger: el, start: "top 90%" } }),
    });
  }
}

function hero() {
  const title = $("[data-hero-title]");
  const phone = $("[data-phone]");
  const glow = $(".hero-glow");
  SplitText.create(title, {
    type: "words,chars", mask: "words", charsClass: "char", autoSplit: true,
    onSplit: (s) => gsap.from(s.chars, { yPercent: 120, rotate: 12, duration: 1.1, ease: "expo.out", stagger: 0.016, delay: 0.05 }),
  });
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".brand > *", { y: -16, autoAlpha: 0, stagger: 0.08, duration: 0.8 })
    .from("[data-hero-fade], .hero-note", { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.5)
    .from(phone, { y: 140, rotateX: 35, scale: 0.85, autoAlpha: 0, duration: 1.6, transformPerspective: 1200 }, 0.35)
    .from(".phone-tabs span", { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.5 }, 1.2)
    .from(glow, { scale: 0.3, autoAlpha: 0, duration: 2.2, ease: "power2.out" }, 0);

  // "жива" світлова пляма
  gsap.to(glow, { xPercent: 18, yPercent: -12, scale: 1.15, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });

  // вихід hero: телефон відкидається назад, заголовок відʼїжджає
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
    .to(phone, { rotateX: 18, scale: 0.86, y: 60, transformPerspective: 1200, ease: "none" }, 0)
    .to(title, { y: -80, autoAlpha: 0.2, ease: "none" }, 0)
    .to(glow, { yPercent: 60, autoAlpha: 0.3, ease: "none" }, 0);

  if (fine) {
    const gx = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power3" });
    const gy = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power3" });
    const ry = gsap.quickTo(phone, "rotateY", { duration: 0.8, ease: "power3" });
    const page = $(".page");
    $(".hero").addEventListener("pointermove", (e) => {
      const r = page.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      gx(nx * 160); gy(ny * 120); ry(nx * 16);
    });
  }
}

function smooth() {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- сцени ---------- */

// безкінечний рядок; швидкість і нахил — від швидкості скролу
function marquees() {
  $$(".marquee-track").forEach((track, k) => {
    const dir = k % 2 ? 1 : -1;
    const loop = gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -33.333 }, { xPercent: dir < 0 ? -33.333 : 0, duration: 22, ease: "none", repeat: -1 });
    const skew = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });
    ScrollTrigger.create({
      trigger: track, start: "top bottom", end: "bottom top",
      onUpdate: (st) => {
        const v = st.getVelocity();
        gsap.to(loop, { timeScale: 1 + Math.min(Math.abs(v) / 300, 6) * Math.sign(v || 1), duration: 0.2, overwrite: true });
        skew(gsap.utils.clamp(-14, 14, -v / 120));
      },
    });
  });
}

function tasks() {
  const cards = $$(".task");
  gsap.from(cards, { rotateX: -70, y: 80, autoAlpha: 0, transformOrigin: "50% 0%", stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".tasks", start: "top 85%" } });
  for (const c of cards) {
    const rx = gsap.quickTo(c, "rotateX", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(c, "rotateY", { duration: 0.5, ease: "power3" });
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty("--mx", `${x * 100}%`);
      c.style.setProperty("--my", `${y * 100}%`);
      if (fine) { rx((0.5 - y) * 10); ry((x - 0.5) * 12); }
    });
    c.addEventListener("pointerleave", () => { rx(0); ry(0); });
  }
}

// кейси: секція закріплюється, стрічка їде горизонтально, скрини всередині прокручуються
function work() {
  const track = $(".work-track");
  const vp = $(".work-viewport");
  const dist = () => track.scrollWidth - vp.clientWidth;
  const scroll = gsap.to(track, {
    x: () => -dist(), ease: "none",
    scrollTrigger: { trigger: ".work", start: "top top", end: () => `+=${dist() * 1.6}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
  });
  gsap.fromTo(".work-progress i", { scaleX: 0.08 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".work", start: "top top", end: () => `+=${dist() * 1.6}`, scrub: true, invalidateOnRefresh: true } });

  for (const c of $$("[data-case]")) {
    gsap.fromTo(c, { scale: 0.86, rotate: 2, autoAlpha: 0.5 }, { scale: 1, rotate: 0, autoAlpha: 1, ease: "power2.out", scrollTrigger: { trigger: c, containerAnimation: scroll, start: "left 95%", end: "left 30%", scrub: true } });
    const img = c.querySelector<HTMLImageElement>(".case-scroll");
    if (img) {
      const frame = $(".case-frame", c);
      gsap.fromTo(img, { y: 0 }, { y: () => -(img.offsetHeight - frame.offsetHeight) * 0.6, ease: "none", scrollTrigger: { trigger: c, containerAnimation: scroll, start: "left right", end: "right left", scrub: true, invalidateOnRefresh: true } });
    }
  }
  // перша картка ще й розкривається clip-path при вході секції
  gsap.from(".case-frame", { clipPath: "inset(18% 12% 18% 12% round 22px)", duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".work", start: "top 75%" } });
}

// повідомлення → заявка → картка Trello, кероване скролом
function automation() {
  const stage = $(".auto-stage");
  const bubble = $("[data-type]");
  const status = $("[data-status]");
  const finalStatus = status.textContent!;
  const chars = SplitText.create(bubble, { type: "words,chars" }).chars;
  status.textContent = "Нова заявка";

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: { trigger: stage, start: "top 12%", end: "+=1500", pin: true, scrub: 0.6, anticipatePin: 1 },
  });
  tl.from(".auto-msg", { y: 40, autoAlpha: 0, duration: 0.4 })
    .from(chars, { autoAlpha: 0, duration: 0.02, stagger: 0.012, ease: "none" })
    .from(".bubble-me", { y: 20, scale: 0.9, autoAlpha: 0, transformOrigin: "100% 100%", duration: 0.4 })
    .from(".auto-lead", { y: 60, autoAlpha: 0, scale: 0.92, duration: 0.5 })
    .from(".lead-grid dd", { x: -40, autoAlpha: 0, stagger: 0.15, duration: 0.4 }, "<0.2")
    .from(".lead-grid dt", { autoAlpha: 0, stagger: 0.15, duration: 0.3 }, "<")
    .from(".auto-board", { y: 60, autoAlpha: 0, duration: 0.5 })
    .from(".tcard.ghost", { autoAlpha: 0, scale: 0.8, stagger: 0.1, duration: 0.3 }, "<0.2")
    .from(".tcard-main", { x: -140, y: -160, rotate: -14, scale: 1.25, autoAlpha: 0, duration: 0.8, ease: "back.out(1.4)" })
    .to(status, { scrambleText: { text: finalStatus, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", speed: 0.6 }, duration: 0.6 })
    .fromTo(".tcard-main", { boxShadow: "0 0 0 0 rgba(195,255,85,0.6)" }, { boxShadow: "0 0 0 14px rgba(195,255,85,0)", duration: 0.5 }, "<0.3")
    .to({}, { duration: 0.3 });
}

function services() {
  ScrollTrigger.batch(".svc", {
    start: "top 92%", once: true,
    onEnter: (els) => {
      gsap.from(els, { x: 50, rotate: 1.5, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: "expo.out" });
      // ціна вже в HTML, при появі лише коротко "перебирає" цифри
      els.forEach((el, k) => {
        const b = el.querySelector<HTMLElement>("[data-price]")!;
        gsap.to(b, { scrambleText: { text: b.dataset.price!, chars: "0123456789", revealDelay: 0.25, speed: 0.8 }, duration: 0.7, delay: k * 0.07 });
      });
    },
  });
  gsap.from(".note-box", { y: 30, autoAlpha: 0, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: ".note-box", start: "top 92%" } });
}

function steps() {
  gsap.fromTo(".steps-line path", { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: ".steps", start: "top 60%", end: "bottom 60%", scrub: true } });
  for (const s of $$("[data-step]")) {
    ScrollTrigger.create({
      trigger: s, start: "top 62%",
      onEnter: () => { s.classList.add("is-lit"); gsap.fromTo($(".step-dot", s), { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "back.out(4)" }); },
      onLeaveBack: () => s.classList.remove("is-lit"),
    });
    gsap.from(s.lastElementChild, { x: 30, autoAlpha: 0, duration: 0.7, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 80%" } });
  }
}

function ads() {
  const tl = gsap.timeline({ scrollTrigger: { trigger: ".gauge", start: "top 80%", end: "top 30%", scrub: true } });
  tl.from("[data-gauge]", { scaleX: 0, ease: "none" })
    .from(".gauge-limit", { autoAlpha: 0, y: -10, duration: 0.2 }, 0.6);
  gsap.from("[data-funnel]", { "--s": 0, autoAlpha: 0, stagger: 0.12, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".funnel", start: "top 85%" } });
}

function final() {
  gsap.fromTo("[data-final]", { scale: 1 }, { scale: 1.03, ease: "none", scrollTrigger: { trigger: ".final", start: "top bottom", end: "bottom bottom", scrub: true } });
  gsap.fromTo(".final-mono", { yPercent: 30, scale: 0.8 }, { yPercent: -10, scale: 1, ease: "none", scrollTrigger: { trigger: ".final-card", start: "top bottom", end: "bottom top", scrub: true } });
  // нижня кнопка поступається місцем фінальній CTA, щоб не було двох однакових поруч
  ScrollTrigger.create({
    trigger: ".final .btn", start: "top bottom-=90", end: "bottom top",
    onToggle: (st) => gsap.to(".sticky", { yPercent: st.isActive ? 120 : 0, duration: 0.4, ease: "power2.out" }),
  });
  gsap.from(".final .btn, .final .hint, .final .copy", { y: 24, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".final-title", start: "top 80%" } });
}

// кнопки трохи тягнуться за курсором (лише миша)
function magnetic() {
  if (!fine) return;
  for (const b of $$(".btn-magnetic")) {
    const x = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3" });
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    b.addEventListener("pointerleave", () => { x(0); y(0); });
  }
}

function lite() {
  ScrollTrigger.batch(".task, .case, .auto-step, .svc, .step, .funnel li, .note-box", {
    start: "top 92%", once: true,
    onEnter: (els) => gsap.from(els, { y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.5, ease: "power2.out" }),
  });
}
