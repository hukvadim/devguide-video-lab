"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useRef } from "react";
import { track } from "./analytics";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Уся анімація сторінки в одному місці, через data-атрибути в розмітці:
 *  [data-split]  — заголовок з'являється по словах (SplitText) при вході в екран
 *  [data-reveal] — блок підіймається й проявляється
 *  [data-line]   — лінія таймлайну, що заповнюється скролом (scrub)
 *  #price        — ViewContent / view_item один раз
 * prefers-reduced-motion: без Lenis і без анімацій, контент просто видно.
 */
export function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ScrollTrigger.create({ trigger: "#price", start: "top 70%", once: true, onEnter: () => track("ViewContent", "view_item", { content_name: "price" }) });

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        const split = SplitText.create(el, { type: "words", mask: "words" });
        gsap.from(split.words, { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: el, start: "top 85%" } });
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: 40, autoAlpha: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
      });
      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) => {
        gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: el.parentElement, start: "top 70%", end: "bottom 60%", scrub: true } });
      });

      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
