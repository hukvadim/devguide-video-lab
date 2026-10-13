"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";

// Meta Pixel + GA4 вантажимо лише після згоди (Польща/ЄС, GDPR). ID — з .env.local (див. .env.example).
// Події: PageView/page_view автоматично, ViewContent/view_item — скрол до ціни, Contact/generate_lead — клік Telegram.
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "dg-consent"; // "all" | "necessary"
const UTM_KEY = "dg-utm";

type Params = Record<string, string | number>;
type W = Window & { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };

// вибір згоди: localStorage + запасне значення в пам'яті (приватний режим, заблоковане сховище)
let mem: string | null = null;
const listeners = new Set<() => void>();
const subscribe = (f: () => void) => {
  listeners.add(f);
  return () => void listeners.delete(f);
};
const readConsent = () => {
  try {
    return localStorage.getItem(KEY) ?? mem;
  } catch {
    return mem;
  }
};

/** UTM з першого входу в сесії — до кожної події, щоб бачити кампанію в GA4 і Events Manager. */
export function utm(): Params {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Одна подія в обидві системи. Без згоди fbq/gtag відсутні — тихо нічого не робимо. */
export function track(meta: string, ga: string, params: Params = {}) {
  const w = window as W;
  const p = { ...utm(), ...params };
  w.fbq?.("track", meta, p);
  w.gtag?.("event", ga, p);
}

export function Analytics() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => "pending");

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const found = Object.fromEntries([...q].filter(([k]) => k.startsWith("utm_")));
    try {
      if (Object.keys(found).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(found));
    } catch {}
  }, []);

  const choose = (v: string) => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    mem = v;
    listeners.forEach((f) => f());
  };

  return (
    <>
      {consent === "all" && PIXEL ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      ) : null}
      {consent === "all" && GA ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}');`}
          </Script>
        </>
      ) : null}
      {consent === null ? (
        <div role="dialog" aria-label="Cookie" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-panel/95 p-4 text-sm shadow-2xl backdrop-blur md:p-5">
          <p className="text-dim">
            Використовуємо cookie аналітики (Google Analytics, Meta Pixel), щоб розуміти, яка реклама працює.{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-fg">
              Деталі
            </a>
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => choose("necessary")} className="flex-1 rounded-xl border border-line px-4 py-2.5 font-semibold hover:bg-panel-2">
              Тільки необхідні
            </button>
            <button onClick={() => choose("all")} className="flex-1 rounded-xl bg-lime px-4 py-2.5 font-semibold text-bg hover:brightness-95">
              Дозволити
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
