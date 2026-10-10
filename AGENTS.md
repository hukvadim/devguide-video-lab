# DevGuide Video Lab: production instructions

Read START_HERE_UA.md, data/brand.json and docs/STACK.md before changing the project.
Use installed official Remotion Skills; inspect actual SKILL.md paths and current API docs. Do not claim a skill/package is installed without checking it.
The task is to create polished Ukrainian DevGuide videos, with distinct experiments and a final creative edit.

- Keep starter compositions working. Add alternatives in separate files and unique composition IDs.
- Frame-driven animation only. GSAP via useGsapTimeline, Three via useCurrentFrame; seeded randomness.
- No GSAP plugins through @remotion/gsap. No setInterval, autonomous playback, Date.now or CSS animation clocks.
- All remotion/@remotion dependencies must stay on the same exact version.
- Base canvas 1080x1920, 30fps. Working safe area x=84..940, y=180..1650; confirm against actual intended platform UI.
- Readable Ukrainian titles: 64-110px; body/captions usually 36-54px. Use deliberate text duration.
- Do not fabricate testimonials, statistics, offers, guarantees or current website contents. Preserve provenance in data/brand.json.
- Use local assets when possible. No unexplained remote dependencies during rendering.
- No paid service calls without an existing authorized account/budget. If absent, render with procedural assets and clearly describe the fallback.
- Run npm run check; validate compositions; render 540x960 preview, inspect representative frames, then final MP4.
- Outputs: one folder per video, `out/<composition id without devguide->/` (qa frames in `qa/`, stills in `stills/`). Use scripts/render-timed.mjs; never write to the out/ root. Gallery: `out/index.html`, favourites: `out/_обране/`.
- A text/code audit is not visual QA. Report separately which renders and frames were checked.
- Include sound design, edit rhythm and a clear end card. Do not add an effect merely to increase dependency usage.
- Track technology usage and timings in docs/EXPERIMENT_RESULTS.md. Distinguish coding time from rendering time.
- Final outputs: preview MP4, 1080x1920 MP4, selected stills, accurate render commands, technology list and known limitations.
