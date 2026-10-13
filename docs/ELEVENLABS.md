# ElevenLabs: озвучка для шляху навчання

Статус (2026-10-13): **тариф Creator+**, озвучку можна публікувати. Шлях «Claude / AI» озвучено голосом Bogdan (з UI, таймінги `scripts/words.mjs`).
Шлях «Сайти» — клон голосу Вадима (Professional Voice Clone) через API: `scripts/tts.mjs`.

## Тарифи (сторінка elevenlabs.io/pricing, перевірено 2026-10-10)

| | Free | Starter |
|---|---|---|
| Кредити | 10k / міс | 30k / міс |
| Комерційна ліцензія | **ні** | так |
| Instant Voice Cloning (свій голос) | ні | так |
| Ціна | $0 | $6/міс (на дату перевірки акція: $1 за перший місяць до 18 жовтня) |

Висновок:
- **Free тільки для проби.** Без комерційної ліцензії не публікуємо озвучку в DevGuide (сайт з платним менторством) і в Instagram з CTA. Перед будь-якою публікацією перевір актуальні умови в [Terms](https://elevenlabs.io/terms-of-use) і в Help Center (ліцензія та атрибуція на free).
- Свій голос з'являється від Starter: клон голосу Вадима з 1–2 хв чистого запису (можна взяти Sound.wav із запису кроку).
- Вийшла модель Eleven v4. Її `model_id` дивись у [документації](https://elevenlabs.io/docs) або `GET /v1/models` і вкажи в `ELEVENLABS_MODEL`.

Скільки це: кредит ≈ символ тексту для multilingual-моделей (Flash/Turbo дешевші, перевір FAQ «How many credits does each product use?»). 10k ≈ 10k символів ≈ 10 хв української мови. Досить на 2–3 тестові кроки, не на весь шлях.

## Де використовуємо

1. **F1 «Крок шляху» без обличчя**: запис екрана + озвучка за сценарієм. Головний кейс: кроки, де голос «живцем» не потрібен (налаштування, кліки по інтерфейсу).
2. **Інтро/аутро** однаковим голосом.
3. **Тест для Instagram**: ролик «AI vs мій голос» (F6). Публікуємо лише на Starter.

Не використовуємо: замість живого Вадима в особистому акаунті й у відгуках/кейсах.

## Конвеєр

```
сценарій (txt, ≤ 1 думка на речення)
  → node scripts/tts.mjs public/ideas/<id>     (voice.txt у папці ідеї)
  → voice.mp3 + words.json   (таймінги з endpoint with-timestamps + словник показу words.mjs)
  → Remotion: StepVideo dir="ideas/<id>" (src/system/step.tsx) бере voice.mp3 і words.json
     або скіл devguide-reel: mp3 як окремий мікрофон (формат 2, --audio)
```

Формат `words.json`: `[{ "w": "Привіт,", "s": 0.12, "e": 0.55 }]`, як слова в `motion/Text.tsx` скіла.

## Налаштування

### API-ключ
elevenlabs.io → Developers → API Keys → Create API Key:
- Name `DevGuide video-lab`, Expire: Never (або рік), **Restrict Key: ON**, **Auto-disable if leaked: ON**, IP: OFF (домашній IP змінюється).
- Usage limit: кап кредитів на місяць, не більше тарифу (помилка в циклі не з'їсть усе).
- Access лише: **Text to Speech**, **Voices: Write** (список голосів і клон; Read, якщо клонуєш тільки в UI), **Models**, **User** (залишок кредитів).
  Опційно: Speech to Text (перевірка вимови), Sound Effects. Решта: No Access.

Ключ живе лише в `.env` у корені цього репо (`.env*` у .gitignore). На кожному ПК — свій `.env`, копія з `.env.example`.
У чат, коміти й скріни ключ не потрапляє. Скіли (`devguide-ideas`, `devguide-reel`) озвучують через `scripts/tts.mjs`, який читає `.env` сам.
```
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...   # клон Вадима (node scripts/tts.mjs voices)
ELEVENLABS_MODEL=...      # node scripts/tts.mjs models → модель з uk:так; порожньо = eleven_multilingual_v2
ELEVENLABS_STABILITY= ELEVENLABS_SIMILARITY= ELEVENLABS_STYLE= ELEVENLABS_SPEED=   # порожньо = налаштування голосу з акаунта
```
Перевірка: `node scripts/tts.mjs credits` (тариф і залишок), `node scripts/tts.mjs voices`, `node scripts/tts.mjs models`.

### Клон голосу (Professional Voice Clone)
- Запис окремо від уроків (у Sound.wav уроків клавіатура й кліки). Тиха кімната з м'якими речами, один мікрофон і та сама відстань 15–20 см
  в усіх файлах, пік ≈ −6 dB, без шумодаву, музики, ехо й компресії. WAV або mp3 від 192k.
- Обсяг: мінімум 30 хв чистої мови, оптимум 1–2 год, файли по 10–30 хв, довгі паузи вирізані.
- Що читати: `voice.txt` усіх кроків «Сайтів» (`C:/DevGuide/helpers/websites-videos/*/voice.txt`), тексти шляху Claude, вільна розповідь.
  Темп і тон як в уроці: клон повторює манеру запису.
- Voices → Add a new voice → Professional Voice Clone, мова Ukrainian → upload → верифікація голосом → тренування (кілька годин).
- Поки тренується: Instant Voice Clone з 2–3 хв тих самих записів, щоб ганяти конвеєр. Після тренування — новий `ELEVENLABS_VOICE_ID` і переозвучка.

### Озвучка кроку
```bash
node scripts/tts.mjs public/ideas/sites-01        # voice.txt → voice.mp3 + words.json (таймінги з API, whisper не потрібен)
node scripts/tts.mjs --file voice.txt out/sites/_voice-test/01-v2   # проба голосу/моделі без папки ідеї
```
Терміни у `voice.txt` пиши фонетично («клод код»): `tts.mjs` після озвучки сам проганяє словник показу з `scripts/words.mjs`
(«клод код» → Claude Code у субтитрах). Нове слово — додай у `DISPLAY` там же.
`node scripts/tts.mjs selftest` перевіряє розбір таймінгів без мережі.

## Що оцінити на пробі

- [ ] Наголоси й вимова термінів: JavaScript, React, Git, Claude, MCP. Якщо погано, пиши фонетично або в лапках.
- [ ] Швидкість: для уроку повільніше, ніж для рілса.
- [ ] 2–3 стокові голоси на тому самому тексті, обрати один для всього шляху.
- [ ] Порівняти з живим записом Вадима, вирішити, де лишаємо живий голос.

Результати проби запиши сюди ж (дата, голос, модель, кредити, враження).
