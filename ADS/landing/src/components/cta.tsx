"use client";

import { ArrowUpRight } from "lucide-react";
import { useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { track } from "./analytics";

export const TELEGRAM = "https://t.me/hukvadim";

/** Головна дія сторінки: Telegram. Клік = мікроконверсія (Contact / generate_lead), справжня заявка — повідомлення. */
export function TelegramCta({ place, className, children = "Безкоштовні 30 хв у Telegram" }: { place: string; className?: string; children?: React.ReactNode }) {
  return (
    <a
      href={TELEGRAM}
      target="_blank"
      rel="noopener"
      onClick={() => track("Contact", "generate_lead", { place })}
      className={cn(buttonVariants({ size: "lg" }), "h-14 rounded-full px-7 text-base font-bold shadow-[0_20px_60px_-15px_#c3ff5580]", className)}
    >
      {children}
      <ArrowUpRight className="size-5" aria-hidden />
    </a>
  );
}

const onScroll = (f: () => void) => {
  addEventListener("scroll", f, { passive: true });
  return () => removeEventListener("scroll", f);
};

/** Мобільна кнопка внизу: з'являється, коли hero-кнопка пішла з екрана. */
export function StickyCta() {
  const on = useSyncExternalStore(onScroll, () => scrollY > 700, () => false);
  return (
    <div className={cn("fixed inset-x-3 bottom-3 z-40 transition-all duration-300 md:hidden", on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0")}>
      <TelegramCta place="sticky" className="w-full justify-center" />
    </div>
  );
}
