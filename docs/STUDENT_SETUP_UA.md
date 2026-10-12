# Як почати на новому ПК (учень / інший комп'ютер)

Мета: після налаштування сказати Claude «зроби відео про X» і отримати ролик, який можна переглянути.

## 1. Одноразове налаштування (≈ 15 хв, ~1 ГБ завантажень)
Потрібні: Node.js 22 або 24 LTS, Git, Claude Code (своя авторизація), SSH-доступ до репо.

```bash
git clone git@github.com:hukvadim/devguide-video-lab.git
cd devguide-video-lab
npm install
npm run bootstrap
```

`npm run bootstrap` ставить Remotion-скіли (`setup:skills`), ffmpeg, whisper і моделі для монтажу (`devguide-reel/scripts/setup.mjs`) і запускає `npm run check`. Повторний запуск нічого не перекачує.
Потім відкрий папку в Claude Code. `CLAUDE.md` і `AGENTS.md` підхопляться самі, скіли `devguide-ideas`, `devguide-reel` лежать у `.claude/skills/`.

## 2. Щоденна робота
```bash
git pull
npm start
```
Remotion Studio відкриється на localhost:3000: там усі ролики, тут же перегляд. Потім у Claude Code, наприклад:

> Зроби відео «5 безкоштовних інструментів для дизайну», формат без голосу, CTA «ДИЗАЙН». Спочатку покажи сценарій.

Claude напише сценарій, закодить ролик, зробить прев'ю 540×960 і покаже кадри; на «ок» зарендерить фінал у `out/<id>/`. Галерея результатів: `out/index.html`.
Прев'ю вручну: `node scripts/render-timed.mjs draft <CompositionId>`, фінал: `... final <CompositionId>`.

## 3. Що їде через git, а що ні
| Є після `git clone` | Треба зробити вручну |
|---|---|
| код `src/`, `data/brand.json`, `docs/`, `prompts/` | ключ ElevenLabs: скопіюй `.env.example` у `.env` і впиши (лише якщо потрібна озвучка) |
| скіли `devguide-ideas`, `devguide-reel`, правила `AGENTS.md` і `CLAUDE.md` (з уподобаннями автора) | `npm run bootstrap` (сторонні скіли, ffmpeg, whisper, моделі ~600 МБ) |
| вибрані музика й SFX, UGC-клипи Flow (`public/assets/ugc/flow/`) | сирі записи (`5/` та папки днів), `out/` (готові рендери), кандидати музики/звуків: перенеси диском або перегенеруй |

## 4. Глобальне на ПК автора, чого учневі не треба
`~/.claude/skills/` містить багато маркетингових скілів (SEO, ads, email) і старий `edit-video`: для відео вони не потрібні, їхню роль виконує `devguide-reel` з репо. Плагіни (ponytail, ui-ux-pro-max, figma тощо) за бажанням. Пам'ять Claude (`~/.claude/projects/.../memory`) у git не їде, тому її суть уже вписано в `CLAUDE.md`.

## 5. UGC-вставки з Flow
Промпти й образи в `docs/UGC_FLOW.md`. Свої фото додавай як Ingredients у Google Flow, готові клипи клади в `public/assets/ugc/flow/`, далі `git add`, `commit`, `push`.
