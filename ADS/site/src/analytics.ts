// GA4 лише після згоди (ТЗ §5). Без VITE_GA_ID банер не показуємо: нічого не збираємо.
// Події: telegram_click(service_id, placement), service_expand, portfolio_open, video_play. UTM першого входу — до кожної.
const GA = import.meta.env.VITE_GA_ID as string | undefined;
const KEY = "dg-consent";
const UTM_KEY = "dg-utm";

type W = Window & { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };

const get = (s: Storage, k: string) => { try { return s.getItem(k); } catch { return null; } };
const set = (s: Storage, k: string, v: string) => { try { s.setItem(k, v); } catch {} };

export function track(event: string, params: Record<string, string> = {}) {
  (window as W).gtag?.("event", event, { ...JSON.parse(get(sessionStorage, UTM_KEY) ?? "{}"), ...params });
}

function loadGA() {
  if (!GA) return;
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer!.push(arguments); };
  w.gtag("js", new Date());
  w.gtag("config", GA);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA}`;
  document.head.append(s);
}

export function initAnalytics() {
  const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => k.startsWith("utm_")));
  if (Object.keys(utm).length) set(sessionStorage, UTM_KEY, JSON.stringify(utm));

  const consent = get(localStorage, KEY);
  if (consent === "all") loadGA();
  else if (!consent && GA) {
    const box = document.createElement("div");
    box.className = "consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Cookie");
    box.innerHTML = `Використовую cookie аналітики (Google Analytics), щоб бачити, які блоки корисні. Текст листування не збирається.<div><button data-c="necessary">Тільки необхідні</button><button data-c="all">Дозволити</button></div>`;
    box.addEventListener("click", (e) => {
      const v = (e.target as HTMLElement).dataset.c;
      if (!v) return;
      set(localStorage, KEY, v);
      box.remove();
      if (v === "all") loadGA();
    });
    document.body.append(box);
  }

  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tg],[data-portfolio]");
    if (el?.dataset.tg) track("telegram_click", { placement: el.dataset.tg, service_id: el.dataset.service ?? "" });
    if (el?.dataset.portfolio) track("portfolio_open", { project_id: el.dataset.portfolio });
  });
}
