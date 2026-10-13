готово: `out/idea-016/idea-016-1080x1920-14lufs.mp4` |готово: `out/idea-015/idea-015-1080x1920-14lufs.mp4` |готово: `out/idea-014/idea-014-1080x1920-14lufs.mp4` |готово: `out/idea-013/idea-013-1080x1920-14lufs.mp4` |готово: `out/idea-012/idea-012-1080x1920-14lufs.mp4` |готово: `out/idea-011/idea-011-1080x1920-14lufs.mp4` |готово: `out/idea-010/idea-010-1080x1920-14lufs.mp4` |готово: `out/idea-009/idea-009-1080x1920-14lufs.mp4` |так | 24 | готово: `out/idea-008/idea-008-1080x1920-14lufs.mp4` ||так | 36 | готово: `out/idea-007/idea-007-1080x1920-14lufs.mp4` ||так | 23 | готово: `out/idea-006/idea-006-1080x1920-14lufs.mp4` ||так | 41 | готово: `out/idea-005/idea-005-1080x1920-14lufs.mp4` ||так | 27 | готово: `out/idea-004/idea-004-1080x1920-14lufs.mp4` ||# Банк ідей

Як працюємо: Вадим кидає ідеї будь-як (рядок, абзац, голосове в тексті) → агент кладе їх у «Вхідні» дослівно
і розкладає кожну в картку за `docs/CONTENT_STRATEGY.md`. Скіл: `.claude/skills/devguide-ideas`.
Статуси: `нова` → `ок` (ідею погоджено) → `сценарій ок` (зібрано матеріал у `public/ideas/<id>/` і погоджено `scenario.md`) → `готово` (є MP4 в `out/idea-<id>/`) → `опубліковано`.

## Вхідні
<!-- сирі ідеї, дослівно, з датою. Агент не редагує, лише позначає «→ ID-xxx», коли розклав -->
- 2026-10-10: «ElevenLabs_…Anton….mp3 зроби відео на пк 1920x1080 кінцевий варіант… Зроби гарне відео для youtube.» → ID-001
- 2026-10-10: «ElevenLabs_…Bogdan_Melodic_and_Calm….mp3 (Сирий матеріал) треба відео.» → ID-002
- 2026-10-10: «Finish.mp4 … треба гарно зробити відео. Це говоряща голова» (сайт, блок flow video; монтаж не змінювати) → ID-003
- 2026-10-10: «Треба подивитися на мою програму і я хочу, щоб ти згенерив під кожен крок відео… Сценарій і можливо окремий текст для elevenlabs… Якщо щось можна генерити без elevenlabs давай спробуємо.» (claude.json → `data/learning-claude.json`) → ID-004…ID-017

## Картки

### ID-001 · Покажи AI свою ціль (план навчання JavaScript)
- **Статус:** готово (`out/idea-001/idea-001-1920x1080-14lufs.mp4`, прев'ю, `.srt`, обкладинка `stills/thumb-1280x720.png`) · **Акаунт:** YouTube (DevGuide) · **Формат:** F1-подібний explainer 1920×1080, ≈ 110 с · **Зйомка:** не потрібна (голос ElevenLabs)
- **Рубрика:** Claude/AI
- **Хук (0–4 с):** «Чому AI відповідає загально?» на стоковому кадрі розгубленої людини за ноутбуком
- **Сценарій:** `public/ideas/idea-001/scenario.md` · матеріал і ліцензії: `sources.md`, `contact.png`
- **CTA:** «Напиши «ЦІЛЬ»» → шаблон запиту; на картці `t.me/hukvadim` + `devguide.com.ua/learning`
- **Рендер:** `node scripts/render-timed.mjs final Idea-001 --wh=1920x1080` → `node scripts/master-audio.mjs out/idea-001/idea-001-1920x1080.mp4`
- **Шорти:** `out/idea-001-short1..3/` (1080×1920, ≈ 32 / 41 / 36 с), склад — у кінці `scenario.md`; рендер `node scripts/render-timed.mjs final Idea-001-Short1 Idea-001-Short2 Idea-001-Short3`
- **Перевірити:** шаблон запиту для «ЦІЛЬ» існує, перш ніж публікувати

### ID-002 · Не бійся першого запитання до AI
- **Статус:** готово (`out/idea-002/idea-002-1920x1080-14lufs.mp4`, `.srt`, обкладинка `stills/thumb-1920x1080.png`; рендер: `node scripts/render-timed.mjs final Idea-002 --wh=1920x1080` → `node scripts/master-audio.mjs out/idea-002/idea-002-1920x1080.mp4`) · **Акаунт:** YouTube (DevGuide) · **Формат:** F1-подібний explainer 1920×1080, ≈ 58 с, без шортів · **Зйомка:** не потрібна (голос ElevenLabs, `public/ideas/idea-002/voice.mp3`)
- **Рубрика:** Claude/AI
- **Хук (0–4 с):** «Яка найбільша помилка, коли вперше відкриваєш AI?»
- **Сценарій:** `public/ideas/idea-002/scenario.md`
- **CTA:** без слова; end card `devguide.com.ua/learning` (шлях «Claude / AI»)
- **Перевірити:** на екрані лише сказане в голосі; ChatGPT називаємо як у голосі, без цін і статистики

### ID-003 · Відео-знайомство «Вадим Гук, ментор» (сайт)
- **Статус:** готово (`out/idea-003/idea-003-1080x1920-14lufs.mp4` + веб-версія `idea-003-web-720x1280.mp4`, faststart) · **Канал:** devguide.com.ua, блок flow video (кнопка на сайті) · **Формат:** talking-head 48 с, монтаж Вадима без змін
- **Що додано:** субтитри з підсвіченими словами, титул, 6 плашок, гучність −14 LUFS; без музики, інтро й end card
- **Рендер:** з папки `Сирий матеріал/`: `node ../.claude/skills/devguide-reel/scripts/vid.mjs render work/Finish/edit.json`; копія edit.json — `public/ideas/idea-003/edit.json`
- **Перевірити:** «з ШІ» на 5.6 с (whisper почув «шаї»); «300+ учнів» — зі слів Вадима

### Шлях «Claude / AI»: відео на кожен крок (ID-004…ID-017)
Спільне для всіх: **Канал:** devguide.com.ua, сторінка кроку + YouTube Shorts / Reels · **Формат:** Shorts 9:16, 1080×1920 (рішення Вадима 2026-10-10: «все буде shorts для телефонів»), стиль ID-002 · **Зйомка:** не потрібна
· **Рубрика:** Claude/AI · **CTA:** end card «Наступний крок: …» (без слова) · **Факти:** лише `data/learning-claude.json`, промпти дослівно, цін тарифів немає.
Структура кожного: що зробимо → як (промпт/дії) → перевірка (`check`) → наступний крок. Голос — ElevenLabs Bogdan «Melodic and Calm», текст у `voice.txt`.
Матеріал: `public/ideas/idea-0xx/` (`scenario.md`, `sources.md`, `voice.txt`). Рішення Вадима 2026-10-10: 9:16 Shorts; усі кроки з голосом ElevenLabs (спершу 5 простих планувались без голосу — передумали); крок 3 = ID-002; живі кроки — симуляція.

| ID | Крок (`key`) | Голос | ≈ с | Статус |
|---|---|---|---|---|
| 004 | Створи акаунт (`account`) | так | 29 | готово: `out/idea-004/idea-004-1080x1920-14lufs.mp4` |
| 005 | Обери підписку (`plan`) | так | 37 | готово: `out/idea-005/idea-005-1080x1920-14lufs.mp4` |
| 002 | Перше питання до AI (`first-question`) | так | 37 | готово: `Idea-002-Short1` (вертикальний шорт ID-002) |
| 006 | Встанови Claude Desktop (`desktop`) | так | 25 | готово: `out/idea-006/idea-006-1080x1920-14lufs.mp4` |
| 007 | Встанови VS Code (`vscode`) | так | 37 | готово: `out/idea-007/idea-007-1080x1920-14lufs.mp4` |
| 008 | Встанови Claude Code (`claude-code-install`) | так | 53 | готово: `out/idea-008/idea-008-1080x1920-14lufs.mp4` |
| 009 | Claude Code: перший проєкт (`claude-code`) | так | 58 | готово: `out/idea-009/idea-009-1080x1920-14lufs.mp4` |
| 010 | Правила проєкту в CLAUDE.md (`claude-md`) | так | 53 | готово: `out/idea-010/idea-010-1080x1920-14lufs.mp4` |
| 011 | Git як страховка (`git`) | так | 54 | готово: `out/idea-011/idea-011-1080x1920-14lufs.mp4` |
| 012 | Спершу план, потім код (`plan-mode`) | так | 52 | готово: `out/idea-012/idea-012-1080x1920-14lufs.mp4` |
| 013 | AI зламав — що робити (`ai-broke`) | так | 61 | готово: `out/idea-013/idea-013-1080x1920-14lufs.mp4` |
| 014 | Безпечно з AI (`ai-safety`) | так | 55 | готово: `out/idea-014/idea-014-1080x1920-14lufs.mp4` |
| 015 | Skills і MCP (`skills-mcp`) | так | 58 | готово: `out/idea-015/idea-015-1080x1920-14lufs.mp4` |
| 016 | Свій skill: процес в одну команду (`own-skill`) | так | 45 | готово: `out/idea-016/idea-016-1080x1920-14lufs.mp4` |
| 017 | Йдемо до клієнта (`next-websites`) | так | 24 | чекає voice.mp3 |

**Збірка:** `node scripts/words.mjs public/ideas/idea-0xx` (таймінги: whisper + voice.txt + словник показу) → `src/ideas/Idea0xx.tsx` на блоках `src/system/step.tsx` (сцени прив'язані до слів через `at()`) → `node scripts/render-timed.mjs final Idea-0xx` → `node scripts/master-audio.mjs out/idea-0xx/idea-0xx-1080x1920.mp4` → `node scripts/collect-path.mjs [claude|websites]` (усі кроки по порядку в `out/_шлях-claude-ai/` або `out/sites/`, `NN Назва.mp4`).
**Перевірити:** команду відкату `git restore .` (ID-011/013); порт `localhost:5173` підписано «може відрізнятися» (ID-009); ElevenLabs вимова «Клод», «Ві-Ес Код», «Ем-Сі-Пі», «точка енв».

<!-- шаблон, копіювати під кожну ідею
### ID-001 · Назва
- **Статус:** нова · **Акаунт:** особистий / DevGuide / шлях · **Формат:** F3 · **Зйомка:** не потрібна / потрібна
- **Рубрика:** Claude/AI · Сайти · Автоматизації · Дизайн → код · За кадром
- **Хук (0–2 с):** …
- **Сценарій:** 0–2 с … · 2–8 с … · … · кінець: CTA
- **Текст на екрані:** титул + плашки (≤ 4 слова в акценті)
- **CTA:** «Напиши СЛОВО» → що надсилає бот / наступний крок шляху
- **Матеріали:** скріни, код, роботи з каталогу, звідки факти
- **Перевірити:** факти, які треба звірити перед публікацією
-->
