# Результати експериментів

Початкові перевірки комплекту — у ../VALIDATION.md. Сесія агента 2026-10-09, Windows 11, 4 потоки CPU, GPU-рендер `--gl=angle`.
Час рендеру — точні вимірювання з `out/render-times.log` (скрипт `scripts/render-timed.mjs`, `--concurrency=4`).
Час створення — орієнтовний за локальними мітками часу сесії (написання коду + налагодження, без рендерів).

| Варіант | Фактичні технології | Час створення | Час рендеру | QA | Файл |
|---|---|---|---|---|---|
| Starter Hybrid | GSAP, Three/R3F, SVG paths, Lottie, Caption types, TransitionSeries | Не вимірювався окремо | Не вимірювався | Повний 540×960 render + кадри (VALIDATION.md) | examples/devguide-lab-preview.mp4 |
| **A — DevGuide-A-Kinetic** (30 с) | GSAP `useGsapTimeline` (слова/літери, stagger), @remotion/paths `evolvePath`, Unbounded/Inter local fonts, remotion-bits Particles (end card) | ~8 хв (сцени Journey/EndCard спільні з Final) | 540×960: 76.4 с | Аркуш 21 кадру `out/qa/A-sheet.png`; виправлено невидимий «ПРОЄКТ» у Journey | out/a-kinetic/devguide-a-kinetic-preview-540x960.mp4 |
| **B — DevGuide-B-Depth** (30 с) | Three.js r180 + R3F через `ThreeCanvas`, `useLoader`-текстури зі справжніх скриншотів, CSS 2.5D-нахил сітки | ~10 хв + ~6 хв налагодження текстури | 540×960: 71.8 → 77.1 → 67.7 → 68.5 с (4 ітерації правок) | `out/qa/B-sheet.png` … `B-sheet-4.png`; знайдено й виправлено чорний екран, наїзд телефона на заголовок (crane) | out/b-depth/devguide-b-depth-preview-540x960.mp4 |
| **C — DevGuide-C-Explainer** (30 с) | Snapcn `text-reveal`, `phone-frame` (shadcn CLI, власна тема DevGuide), remotion-bits `TypeWriter` + `AnimatedText` + `Particles`, `@remotion/captions` `createTikTokStyleCaptions` | ~12 хв, з них ~6 хв адаптація Snapcn до 9:16 | 540×960: 77.2 → 68.4 → 83.8 с | `out/qa/C-sheet.png`, `C-sheet-2.png`, `C-sheet-3.png`, `qa/dev/c-term2.png` | out/c-explainer/devguide-c-explainer-preview-540x960.mp4 |
| Vector / Lottie (етап 03) | Не робився окремим роликом: SVG-промальовування (`evolvePath` + `getPointAtLength`) увійшло в A і Final; Lottie лишився у стартері `DevGuide-Vector` — у фінал не взято (немає доречного бренд-Lottie) | — | — | — | — |
| Captions / Audio (етап 04) | Титри — у C; звук — у всіх: Mixkit SFX за таблицею кадрів, процедурний riser (ffmpeg), BGM `cat-walk.mp3` з дропом на ключовий кадр, loudnorm −14 LUFS | — | — | ebur128 на прев'ю: −18.3 LUFS, пік −1.0 dBFS → мастеринг | — |
| **Skia — DevGuide-Skia-Lab** (10 с) | @remotion/skia 4.0.534 + @shopify/react-native-skia **2.0.0** (2.14.0 не бандлиться без react-native), окремий entry `src/skia/index.ts` + `remotion.skia.config.ts`, 1 SkSL RuntimeEffect, уніформи від кадру | ~10 хв | 1080×1920: 48 с | `out/qa/skia-sheet.png` (7 кадрів) | out/skia-lab/devguide-skia-lab-1080x1920.mp4 |
| **Rive** | **BLOCKED_BY_RIV_ASSET**: у проєкті немає ліцензованого `.riv` з персонажем/символом під «Практика з ментором». Офіційні приклади Rive — чужі персонажі без зв'язку з брендом; фальшивий `.riv` не створювався, `@remotion/rive` не встановлювався | — | — | — | — |
| **DevGuide-Final** (38 с) | GSAP (хук), типографічний match cut, Three.js-телефон зі справжнім екраном сайту, SVG-шлях (@remotion/paths), remotion-bits Particles, Mixkit SFX + BGM-дроп | ~25 хв + ~15 хв QA-ітерацій | 540×960: 98.5 / 112.0 с; **1080×1920 CRF 18: 174.4 с** | 3 аркуші кадрів, перевірка match cut по кадрах 82/84/86, звук ebur128 | out/final/devguide-final-1080x1920-14lufs.mp4 |
| **Idea-001 «Покажи AI свою ціль»** (YouTube 1920×1080, 110 с, 2026-10-10) | Голос ElevenLabs (Anton, платний тариф) + whisper-таймінги слів → усі появи синхронно з голосом; нейтральний AI-чат, друк по словах, суцільна кольорова підсвітка ЦІЛЬ/ЧАС/РЕЗУЛЬТАТ; 3 стокові вставки Mixkit Free (`OffthreadVideo`, наїзд, затемнення); вшиті субтитри + `.srt` з того самого розбивача (`src/ideas/captions.ts`); музика Mixkit «Hazy After Hours» тихо під голосом; SFX з `public/assets/audio`; стілл-обкладинка `Idea-001-Thumb` | ~25 хв матеріал і сценарій, ~40 хв код і правки (без рендерів) | прев'ю 960×540: 225–238 с; фінал 1920×1080: 480 с і 426 с (перерендер без switch-click-quick) | 2 контакт-листи прев'ю, 4 контрольні стілли після правок, 12 + 6 кадрів фіналу; ffprobe 1920×1080 30 fps 110.1 с; −14.0 LUFS, пік −1.3 dBFS | out/idea-001/idea-001-1920x1080-14lufs.mp4 |
| **Idea-001 Shorts 1–3** (1080×1920, 32 / 42 / 36 с) | Ті самі сцени Idea-001 + карта «секунда ролика → секунда голосу» (`SHORTS`), вертикальна верстка через `useLay()` (чат зверху, тези під ним, формула й до/після стовпчиком), голос шматками через `trimBefore`, субтитри перераховані в час шорта, «удар» камери й transition-snap на склейках | ~35 хв код і 2 раунди правок верстки | прев'ю 540×960: 71–99 с; фінал 1080×1920: 168–184 с на шорт | контакт-листи прев'ю (6+6+7 кадрів), після правок 4+2+4 кадри фіналів; ffprobe 1080×1920 30 fps; −13.9…−14.0 LUFS, пік −1.5 dBFS; горизонталь звірена PSNR 35–37 дБ (верстка не змінилась) | out/idea-001-short{1,2,3}/…-1080x1920-14lufs.mp4 |
| **Шлях «Claude / AI»: Idea-004…016** (13 шортів 1080×1920, 25–61 с, 2026-10-10) | Голос ElevenLabs (Bogdan) → `scripts/words.mjs`: whisper large-v3-turbo дає час, `voice.txt` дає текст (вирівнювання Нідлмана–Вунша), словник показу «Клод Код» → Claude Code; спільні блоки `src/system/step.tsx` (Title, PromptCard з промптами дослівно з `data/learning-claude.json`, Term, Browser, Steps, Check, NextCard, вертикальні субтитри); сцени прив'язані до слів через `at()`; SFX з `public/assets/audio`, музика Hazy After Hours; збірка в `out/_шлях-claude-ai/` (`scripts/collect-path.mjs`) | ~2.5 год код і правки (без рендерів); whisper 13 файлів ≈ 40 хв CPU | прев'ю 540×960: 84–158 с на ролик; фінали 1080×1920: 97–195 с, разом 2031 с | контакт-листи прев'ю (14 кадрів) для всіх 13, повторні стілли після правок (004, 008, 010, 014, 015, 016), фінальні кадри 013–016 і кроп титулу 016; ffprobe 1080×1920 30 fps; −14 LUFS | out/_шлях-claude-ai/01…14 *.mp4 |
| **Лабораторія форматів: 20 варіантів** (1080×1920, 12–62 с, 2026-10-11) | Теми `src/system/theme.tsx` (brand + 5 палітр Color Drop + neon; бренд попіксельно незмінний, PSNR inf); постерний вигляд (контурне відлуння, фон з літер), кінетика «слово на біт» і караоке (`step.tsx`); ролики без голосу в ритм (`scripts/bpm.mjs`: онсети + автокореляція → BPM і перший біт); 50 треків і 41 SFX з Mixkit (`fetch-music.mjs`, `fetch-sfx.mjs`); спліти/голова через скіл devguide-reel з новим полем `theme` (`scripts/lab-split.mjs`) | ~3 год код, дослідження й правки (без рендерів) | Remotion 08–20: ~1–3 хв на ролик; скіл 01–07: ~1–4 хв (lab-01 перерендер після тайм-ауту браузера, lab-05 після правки субтитрів) | 7-кадрові контакт-листи всіх 20 фіналів, 12 контрольних стіллів до рендеру; ffprobe 1080×1920 30 fps; −14 LUFS (скіл і master-audio) | out/_варіанти/01…20 *.mp4 |

## Що показало візуальне порівняння

- **A (типографіка)** — найчистіший ритм, але без доказу «що саме я отримаю»: немає жодного реального екрану. Найкраще з A — хук «ІДЕЯ» і SVG-шлях — пішли у Final.
- **B (3D)** — найпреміальніший план: справжній «Шлях навчання» у телефоні з орбітою камери. Два 3D-плани поспіль задовгі (монотонно) — у Final лишився один, на дропі музики.
- **C (компоненти)** — найшвидше дає «пояснення», але бібліотечні компоненти тягнуть свою естетику й геометрію:
  - Snapcn `terminal-simulator` має «світ» 1280×720 і камеру з фіксованими станціями — у 9:16 обрізається навіть із `zoom: 1` і масштабом 0.62. Замінено на `TypeWriter` з remotion-bits у власному вікні терміналу. Компонент лишився у `src/components/snap-cn/` як артефакт тесту.
  - Snapcn `text-reveal` у 9:16 працює лише з коротким текстом (один рядок без переносу).
  - Snapcn тягнув 6 Google Fonts мережею під час рендеру — `src/lib/snap-cn-ui/fonts.ts` замінено на локальні шрифти.
  - remotion-bits імпортує власний three 0.182 → у консолі «Multiple instances of Three.js» (на кадри не вплинуло).
- **Skia** — шейдер дає найорганічніший «шум → порядок», але потребує окремого entrypoint і конфігу; у Final не взято, щоб не тягнути WASM у основний бандл.

## Налагодження, яке вплинуло на якість

1. Текстура телефону: асинхронний `TextureLoader` + `delayRender` давав чорний/білий екран у частині кадрів відеорендеру (ThreeCanvas малює лише на зміну кадру). Рішення — `useLoader` (Suspense всередині ThreeCanvas). Перевірено короткими рендерами 265–450.
2. Match cut: гігантське слово спершу малювалося під редактором і двоїлося 4 кадри; перенесено вище в DOM, перехресна зміна — 1 кадр.
3. Safe area: wordmark 150 px виходив за поля → 118 px; телефон торкався заголовка → камера 13.2 → 16.6.

## Команди

```bash
npm run preview:final      # 540x960, CRF 23
npm run render:final       # 1080x1920, CRF 18 + мастеринг звуку -14 LUFS
npm run preview:alts       # A/B/C 540x960
npm run render:skia        # окремий entry + config
node scripts/qa-sheet.mjs out/final/devguide-final-preview-540x960.mp4 out/final/qa/sheet.png 20,84,300,560,700,860,1000,1130
```

> 2026-10-10: лабораторні композиції (Lab/Pro/Posts/Scenes, Day5, Skia, snap-cn) видалено з коду; спільне перенесено в `src/system/`. Відновити: `git checkout 852b0d0 -- src/dg src/skia src/components src/lib`.

## ADS: Meta-реклама менторства (2026-10-12)

- `Ads-A-Abroad` (26 с, трек 20-edm-be-happy 120 BPM) і `Ads-B-Business` (27 с, 49-pop-close-up 105 BPM), `src/ideas/Ads.tsx`. v1 без голосу: `BeatVideo` з `src/system/beat.tsx`, картки = візуал + ≤6 слів, Flow-вставки (`UgcInsert`), скриншоти портфоліо (Playwright). Голос Вадима — v2.
- Кодинг ~40 хв. Рендер: прев'ю 540×960 — 30.7 с і 39.0 с; фінал — див. `out/render-times.log`.
- QA: стіли кадрів 0/285/690 (A) і 0/300/493 (B), смуги кадрів кожні 2 с з прев'ю обох роликів.
- Обмеження: скриншоти 430 px завширшки (у телефоні масштабуються ~1.2×); музика з кандидатів (не вибрана Вадимом).
- Лендінг: `ADS/landing` (Next.js 16, Tailwind 4, shadcn/ui, GSAP+ScrollTrigger+SplitText, Lenis, R3F+Drei), окремий package.json.
- v2 (2026-10-12): А — картка сайту = 3 скриншоти babayaga.lviv.ua (Playwright, DPR 2, кожен через 5 с після прокрутки), + 3D-телефон «Шлях навчання» (`src/system/phone3d.tsx`, відновлено з 852b0d0 PhoneScene, без «острова», що закривав заголовок). Б — переписано: порівняння $1000/$300, 5 карток, 16.4 с. Текст озвучки: `ADS/03-video/voice.md`.
