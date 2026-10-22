# devguide-reel — скіл Claude Code для монтажу Reels / TikTok / Shorts у стилі DevGuide

Кладете сире відео «говорю в камеру» в папку, пишете Claude `/devguide-reel VID.mp4` і отримуєте готовий
вертикальний ролик 1080×1920:

- вирізані паузи, «еее», дублі; наближення на склейках ховає джамп-кати;
- чистий звук: шумодав, компресор, −14 LUFS, без клацань на склейках;
- субтитри по 2–3 слова, поточне слово підсвічене жовтим;
- титул-хук і плашки з ключовими думками;
- **ваші роботи вилітають за спиною**: картки в рамці браузера (Remotion, пружини, паралакс, 3D-стіна),
  а ви на передньому плані завдяки масці Robust Video Matting, без зеленого екрана;
- повноекранні стокові вставки з переходом і звуком «вжух»;
- фонова музика, яка приглушується під голосом;
- **план кадру сам**: скіл читає, що ви кажете, і чергує обличчя, екран, **сценки 4–5 с на весь кадр**
  (цифри, порівняння, кроки) і **UGC-вставки з емоціями** (вау, сміх, facepalm, стоп…);
- **100 елементів кадру й 50 стилів субтитрів** за кодами (`E01` лічильник, `G01` ✗/✓, `I01` «напиши СЛОВО»…),
  скріншоти всіх кодів у [docs/elements/](docs/elements/), опис у [docs/ELEMENTS.md](docs/ELEMENTS.md);
- **аудит ритму** перед рендером (оцінка /100, де кадр стоїть довше 6 с) і **розкадровка** на погодження.

## Для учня: швидкий старт
1. Один раз: поставте [Claude Code](https://claude.com/claude-code), [Git](https://git-scm.com), [Node.js 22/24 LTS](https://nodejs.org), потім
   ```bash
   git clone https://github.com/hukvadim/devguide-video-lab.git
   cd devguide-video-lab
   npm install
   npm run bootstrap
   ```
   `bootstrap` сам доставить ffmpeg, whisper, моделі й музику (~1 ГБ, один раз). Повна інструкція: `docs/STUDENT_SETUP_UA.md` у корені репо.
2. Кожного разу: `git pull`, покладіть своє відео в папку (наприклад `мій-ролик/VID.mp4`), відкрийте Claude Code в корені репо й напишіть:
   ```
   /devguide-reel мій-ролик/VID.mp4
   ```
   Claude розшифрує мову, покаже **таблицю плану кадру** (час → обличчя / сценка / UGC → коди → текст), потім **розкадровку** `board.jpg`.
   Правте словами («сценку на 12 с прибери», «тут E03 замість E01», «колір #FFD84D»), на «ок» він рендерить фінал у `мій-ролик/out/`.
3. **Свої UGC-вставки.** У репо лежать кліпи автора з його обличчям. Для своїх роликів зробіть свої (промпти: `docs/UGC_FLOW.md`, Google Flow, 9:16, 3–4 с без мови),
   покладіть у `мій-ролик/assets/ugc/` і поруч `ugc.json` за зразком `public/assets/ugc/ugc.json` (назва, файл, найкращий шматок `from`, `dur`, емоції в `tags`).
   Своя бібліотека береться першою. Вимкнути вставки зовсім: `"ugcLibrary": false` в `edit.json`.
4. Свій стиль: `"theme": {"accent": "#FFD84D"}` (колір усіх карток і підсвітки субтитрів), `"captions": {"cap": "S02+T04", "size": 1.1}`.
   Акцент беріть яскравий, бо на темному склі має бути контраст ≥3:1.

**Два формати запису:**
1. **Говорюща голова** — одне відео.
2. **Екран + голова + окремий мікрофон** (`… Head.mp4`, `… Screen.mp4`, `… Sound.wav` в одній папці) →
   `/devguide-reel <папка>`. Скіл сам синхронізує файли за звуком і складає спліт: екран зверху з наближенням на
   потрібну ділянку, ви знизу, звук із мікрофона.

Як має виглядати ролик (структура, темп, стиль, звук, чекліст), описано в [docs/TZ-video.md](docs/TZ-video.md).

## Встановлення

Скіл живе в репо DevGuide Video Lab (`.claude/skills/devguide-reel/`), окремо його ставити не треба.
Потрібні [Claude Code](https://claude.com/claude-code), git і Node.js 22/24 LTS. Повна інструкція — `docs/STUDENT_SETUP_UA.md` у корені репо:
```bash
git clone git@github.com:hukvadim/devguide-video-lab.git
cd devguide-video-lab
npm install
npm run bootstrap
```

Відкрийте Claude Code у папці з відео й напишіть:
```
/devguide-reel VID_20260608_165802.mp4
```

### Що встановлюється при першому запуску (`scripts/setup.mjs`)
| Компонент | Windows | macOS | Розмір |
|---|---|---|---|
| Node.js ≥ 20 | `winget install OpenJS.NodeJS.LTS` | `brew install node` | — |
| ffmpeg ≥ 7 (libass) | `winget install Gyan.FFmpeg` | `brew install ffmpeg` | ~200 МБ |
| whisper.cpp | реліз `whisper-bin-x64.zip` з GitHub | `brew install whisper-cpp` | ~10 МБ |
| модель whisper large-v3-turbo q5 | huggingface | так само | ~570 МБ |
| модель RVM mobilenetv3 | GitHub releases | так само | 15 МБ |
| Remotion, onnxruntime-node, React | `npm ci` | так само | ~300 МБ |
| Chrome Headless Shell (для Remotion) | автоматично | так само | ~120 МБ |

Перевірити або доставити вручну:
```
node .claude/skills/devguide-reel/scripts/setup.mjs          # перевірити й встановити відсутнє
node .claude/skills/devguide-reel/scripts/setup.mjs --check  # лише звіт
```
На Windows зі старим Visual C++ Runtime setup сам підкладе новіші DLL для onnxruntime (система не змінюється),
а якщо це не допоможе — поставить VC++ Redistributable (з'явиться вікно UAC).

> macOS-гілку (Homebrew, шрифт Montserrat) написано, але на Mac не перевірено. Якщо щось не так, напишіть в Issues.

## Структура папки з відео
```
мій-ролик/
  VID.mp4
  assets/covers/   — обкладинки/скріншоти ваших робіт для b-roll (16:9)
  assets/stock/    — стокові кліпи для вставок
  assets/music/    — фонова музика
  assets/sfx/      — (необов'язково) свій «вжух»
  work/VID/        — розшифровка, edit.json, кеш маски й кліпів, прев'ю
  out/VID_final.mp4
```

## Команди (Claude запускає їх сам)
```
node scripts/vid.mjs prep <відео|папка> [uk|ru|en|auto] [--audio f] [--screen f]   # розшифровка, паузи, синхронізація
node scripts/vid.mjs plan    work/<назва>/edit.json [--apply] [--keyword СЛОВО]  # план кадру: обличчя / екран / сценка / UGC + коди
node scripts/vid.mjs audit   work/<назва>/edit.json [--fix]   # ритм /100; --fix закриває дірки й прибирає накладки
node scripts/vid.mjs board   work/<назва>/edit.json [--full]  # розкадровка board.jpg (~20 с; --full з чернеткового рендеру)
node scripts/vid.mjs preview work/<назва>/edit.json  # прев'ю 540×960 + тестові кадри
node scripts/vid.mjs render  work/<назва>/edit.json  # фінал 1080×1920
node scripts/vid.mjs selftest
```
Приклад плану монтажу: [examples/edit.example.json](examples/edit.example.json).

## Продуктивність
На слабкому ноутбуці (i5 4-го покоління, 8 ГБ): розшифровка 80 с відео займає ~3 хв, маска ~1 кадр/с (рахується лише на
відрізках b-roll і кешується), фінальний рендер 45 с ролика — кілька хвилин.

## Ліцензії
- Код скіла — MIT ([LICENSE](LICENSE)).
- Шрифт Montserrat — SIL Open Font License ([fonts/OFL.txt](fonts/OFL.txt)).
- Стороннє скачується при встановленні, а не лежить у репозиторії: Robust Video Matting (GPL-3.0),
  whisper.cpp (MIT), Remotion ([безкоштовний для фізичних осіб і команд до 3 людей](https://remotion.dev/license)),
  ffmpeg (LGPL/GPL).
- Медіа (стоки, музика, звуки) мають власні ліцензії. Mixkit — лише кліпи з Free License; Pixabay Music — лише треки
  без позначки «Content ID Registered». Деталі в ТЗ.
