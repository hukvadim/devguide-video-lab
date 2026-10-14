# Шлях «Сайти»: YouTube

Плейлист (public): https://www.youtube.com/playlist?list=PLa76T4ab_n1s
Квота YouTube API: 10 000/день, upload = 1600 → ~5 відео на день (+50 за додавання в плейлист).
Після заливки: слайд `{media: "https://youtube.com/shorts/<id>", caption}` + `needsVideo: false` у кроці на сайті — MCP `learning_update_step` або `node scripts/devguide-admin.mjs get/put websites <file>` (токен з ~/.claude.json, не друкується).

2026-10-14: на сайт залито нову програму з `C:/DevGuide/docs/learning/paths/websites.md` (23 кроки замість 26; стара — `data/websites-prod-before-2026-10-14.json`). Слайди stack, variants, responsive, deploy-vercel, domain-simple відновлено зі старої.

| Крок | Ключ | YouTube id | Залито | На сайті |
|---|---|---|---|---|
| 07 | cinematic | PnJ6U2XmvgE | 2026-10-14 | так |
| 09 | client-chat | DKT2KUgMrWc | 2026-10-14 | так |
| 10 | tz | 1F--N9BpPiI | 2026-10-14 | так |
| 11 | estimate | 6-_vRFYBUbE | 2026-10-14 | так |
| 12 | generate-v1 | 06Sn8H3UPkc | 2026-10-14 | так |

Черга (усе готове, фінали в out/sites/): 14, 15, 16, 20, 21 → 22, 13, 01, 02, 03 → 04, 05, 06; велике 16:9 готове: pX430c82A1E (19:19, 2026-10-14, плейлист: слайд у кроці 1 `setup-tools`, на сайті так; heroVideo шляху ще порожній).
