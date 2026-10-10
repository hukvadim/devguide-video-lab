"use client";

/**
 * DevGuide patch: upstream snapcn loads six Google fonts via @remotion/google-fonts
 * at module scope (a network fetch on every render). This project ships local
 * @fontsource faces (Inter, Unbounded, JetBrains Mono, imported in src/style.css),
 * so the allowlist is local-only and every component gets an explicit fontFamily.
 */
export const FONTS: Record<string, string> = {
  Inter: "Inter",
  Unbounded: "Unbounded",
  "JetBrains Mono": "'JetBrains Mono'",
};

export const DEFAULT_FONT = "Default";
export const FONT_NAMES = [DEFAULT_FONT, ...Object.keys(FONTS)];

export const resolveFont = (name?: string): string | undefined =>
  !name || name === DEFAULT_FONT ? undefined : (FONTS[name] ?? name);
