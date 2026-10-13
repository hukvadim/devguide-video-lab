"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const Hero3D = dynamic(() => import("./hero-3d"), { ssr: false });

const noop = () => () => {};
let ok: boolean | undefined;
const canRender = () => (ok ??= !!document.createElement("canvas").getContext("webgl2") && !matchMedia("(prefers-reduced-motion: reduce)").matches);

/** 3D-фон hero: лише якщо немає reduced-motion і є WebGL; інакше лишається статичне світіння з CSS. */
export function HeroBackdrop() {
  const on = useSyncExternalStore(noop, canRender, () => false);
  return on ? <Hero3D /> : null;
}
