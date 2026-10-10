# DevGuide-Final — фінальний звіт (2026-10-09)

## Результат

| Файл | Що це |
|---|---|
| `out/final/devguide-final-1080x1920-14lufs.mp4` | **Основний файл для публікації**: 1080×1920, 30 fps, H.264 CRF 18, AAC 256k, −14.2 LUFS, 38.1 с, 9.5 МБ |
| `out/final/devguide-final-1080x1920.mp4` | Той самий рендер з оригінальним міксом (−18.5 LUFS), без мастерингу |
| `out/final/devguide-final-preview-540x960.mp4` | Прев'ю 540×960, CRF 23 |
| `out/final/stills/cover.png` | Обкладинка (кадр 1060, end card) |
| `out/final/stills/final-*.png` | 8 контрольних кадрів 1080×1920: 40, 100, 230, 330, 560, 700, 870, 1060 |
| `out/{a-kinetic,b-depth,c-explainer}/devguide-*-preview-540x960.mp4` | Три альтернативи по 30 с |
| `out/skia-lab/devguide-skia-lab-1080x1920.mp4` | Skia-експеримент, 10 с |

Розкадрування — `docs/STORYBOARD.md`; порівняння технологій і часи — `docs/EXPERIMENT_RESULTS.md`.

## Меседж і факти

«Від ідеї — до власного проєкту з DevGuide». Hook «У тебе є ІДЕЯ» → справжній код → справжній «Шлях навчання» з сайту → 8 напрямів → ментор → шлях ІДЕЯ → КОД → ПРОЄКТ → CTA.
Усі факти — або з брифу (`data/brand.json`), або дослівно з devguide.com.ua від 2026-10-09 (`brand.json → site`, із джерелом).
Не використано: ціни, відгуки, кількість учнів, гарантії. Офер «Перше заняття — 30 хвилин, безкоштовно» узятий дослівно з сайту — **перевір актуальність перед публікацією**.

## Чому Final сильніший за стартери

- Стартери — чотири окремі тех-демо з однаковою композицією «заголовок + картка + CTA» і фоновим звуком. Final — одна історія з причинно-наслідковими переходами: слово «ІДЕЯ» буквально стає рядком коду (типографічний match cut), код збирає сайт, натиск кнопки штовхає камеру в 3D-план.
- Реальний доказ замість абстракції: справжній скриншот «Шляху навчання» на 3D-телефоні та справжні назви 8 напрямів.
- Звук прибитий до кадрів (таблиця SFX у кожній сцені), дроп музики співпадає з 3D-розкриттям, 3 повнокадрові удари (хук, 3D, логотип) — не більше.
- End card читається 5+ секунд у спокої (R1: бренд тримається ≥1 с; тут — увесь фінал).

## Використані технології (реально в Final)

| Технологія | Де | Навіщо |
|---|---|---|
| GSAP 3.13 через `@remotion/gsap` `useGsapTimeline` | Хук «ІДЕЯ» | Stagger літер/слів без власного таймера |
| `three` 0.180 + `@react-three/fiber` + `@remotion/three` `ThreeCanvas` | 3D-телефон | Орбіта камери, світло, прокрутка текстури; `useLoader` для детермінованого завантаження |
| `@remotion/paths` (`evolvePath`, `getPointAtLength`, `getLength`) | Шлях ІДЕЯ → КОД → ПРОЄКТ | Промальовування SVG |
| `remotion-bits` 0.2.1 `Particles` | End card | Сідований лаймовий пил, кероване кадром |
| `@remotion/noise` | Фон Stage | Повільний дрейф світла |
| Локальні шрифти `@fontsource/unbounded`, `@fontsource/jetbrains-mono`, `@fontsource/inter` | Уся типографіка | Без мережі під час рендеру, повна кирилиця |
| Mixkit SFX/BGM (зі скіла video-shotcraft) + процедурний riser (ffmpeg) | Звук | Ліцензія Mixkit Free; URL кожного файлу — `.claude/skills/video-shotcraft/assets/audio/ATTRIBUTION.md` |

Не взято у Final (і чому): Lottie (немає доречного бренд-Lottie), Skia (потрібен окремий WASM-entry), Snapcn (компоненти розраховані на 16:9, див. EXPERIMENT_RESULTS), motion blur (не застосовувався — немає вимірювання, отже немає заяв про поліпшення), Rive (BLOCKED_BY_RIV_ASSET).

## Скіли, які реально прочитано

- `.claude/skills/remotion-best-practices/SKILL.md` + `remotion-create/REFERENCE.md`, `remotion-create/video-layout.md`, `remotion-markup/multi-scene-video.md`, `remotion-markup/3d.md`, `remotion-docs/REFERENCE.md` (за ним отримано актуальні сторінки skia.md / enable-skia.md).
- `.claude/skills/video-shotcraft/SKILL.md`, `references/aesthetic-rules.md` (R/Q/S/C/P), `assets/audio/ATTRIBUTION.md`, `AUDITION-2026-07-27.md`.
- `.claude/skills/motion-quality/SKILL.md` (Snapcn), `.claude/skills/snapcn/SKILL.md`, `references/components/index.md`, `terminal-simulator.md`, `text-reveal.md`.

## Команди

```bash
npm install
npm run check
npm run preview:final                      # out/final/devguide-final-preview-540x960.mp4
npm run render:final                       # out/final/devguide-final-1080x1920.mp4 + -14lufs.mp4
npm run preview:alts                       # A/B/C прев'ю
npm run render:skia                        # окремий Skia entry
npm run qa:final                           # 10 кадрів у out/final/qa/
node scripts/qa-sheet.mjs <video> <out.png> 20,84,300,560,700,860,1000,1130
```

Еквівалент без npm-скриптів:
`npx remotion render src/index.ts DevGuide-Final out/final/devguide-final-1080x1920.mp4 --codec=h264 --crf=18 --concurrency=4`
і `node scripts/master-audio.mjs out/final/devguide-final-1080x1920.mp4`.

## Час

- Рендер Final 1080×1920: **174.4 с** (38 с відео, concurrency 4, `--gl=angle`); прев'ю 540×960: 98–112 с.
- Мастеринг звуку (2 проходи loudnorm, відео копіюється): кілька секунд.
- Створення (орієнтовно, за мітками сесії): підготовка й аудит ~15 хв, сцени Final ~25 хв, альтернативи ~30 хв, Skia ~10 хв, QA-ітерації ~25 хв. Детально — EXPERIMENT_RESULTS.md.

## Візуальна та звукова QA (що реально перевірено)

- Кадри: контактні аркуші 21 кадру з прев'ю Final (`out/final/qa/draft1/sheet.png`, `final-sheet-2.png`), перехід match cut по кадрах 82/84/86 (`final-sheet-3.png`), 3D-план по 10 кадрах (`qa/dev/final-phone-test2.png`), повнорозмірні кадри 330/700/1060 (`out/qa/final-fullres-check.png`).
- Власна перевірка (не remotion-qa — його не підключали): safe area 84 px по боках і y 180–1650 для читабельного тексту; розміри: заголовки 76–104 px, основний текст 36–52 px, код 36 px, URL 56 px; час читання — сценові заголовки («Пиши справжній код», «Шлях навчання», «8 напрямів», «Пиши код разом із ментором») у кадрі 3–5 с, end card повністю зібраний ~5.3 с; слова хука («У тебе є», «Що далі?») навмисно короткі — ~1–2 с.
- Звук: ebur128 повного міксу −18.5 LUFS / −0.96 dBTP → мастеринг −14.2 LUFS, LRA 5.1, пік −0.7 dBFS; BGM fade-in 40 кадрів і fade-out 90 кадрів у кінці; SFX довгих семплів обрізано `durationInFrames`.
- **Не зроблено**: перегляд MP4 у реальному часі людиною — я перевіряв кадри та вимірювання звуку, а не слухав мікс. Перед публікацією подивись і послухай ролик повністю.

## Відомі обмеження

- Офер і кількість кроків у напрямах — стан сайту на 2026-10-09; можуть змінитися.
- Справжні пікові значення після мастерингу −0.7 dBFS (ціль TP −1.5 не досягнута в linear-режимі loudnorm); кліпінгу немає.
- Пікселі `yuvj420p` (повний діапазон, дефолт Remotion для JPEG-кадрів). Якщо платформа зсуне кольори — рендер з `--pixel-format=yuv420p`.
- Голосу немає (немає наданого файла/сервісу) — ролик повноцінний без нього, титри фактично вбудовані в сцени.
- `remotion-bits` тягне власний three 0.182 → попередження «Multiple instances of Three.js» у логах.
- Snapcn `terminal-simulator` встановлено, але не використано (16:9-камера); `@remotion/google-fonts` у Snapcn вимкнено патчем `src/lib/snap-cn-ui/fonts.ts`.
- Деякі SFX бази video-shotcraft мають неперевірене походження — у ролику використано лише файли з URL у ATTRIBUTION.md, плюс власний процедурний riser.
- Публікацію ліцензій Remotion для комерційного використання перевір окремо (Remotion має власну ліцензію для компаній).
