# Банер (кампанія 3) — промт для GPT і техвимоги

## Техвимоги
- Розміри: 1080×1350 (4:5, Feed — основний), 1080×1080 (1:1), 1080×1920 (9:16, Stories/Reels).
- Safe zone 9:16: нічого важливого в верхніх 14% (~270 px) і нижніх 20% (~380 px).
- Формат: PNG або JPG, sRGB, ≤30 МБ.
- Текст на зображенні: ≤6 слів заголовка + плашка; великий, читабельний з телефона (заголовок ≥80 px на 1080).
- Палітра бренду: фон #080B0E, текст #F5F7F2, акцент #C3FF55 (лайм, лише для заливок/плашок; темний текст на лаймі). Без коралового/червоного на синьому.
- Без фейкових інтерфейсів відомих брендів і логотипів (OpenAI/Anthropic), без фейкових відгуків і цифр.
- Українська кирилиця: GPT часто псує літери — заголовок краще накласти в Figma/Canva після генерації. Тому генеруємо **фон без тексту**, текст ставимо окремо.

## Промт (фон без тексту)
> Vertical 4:5 advertising image, 1080x1350. Dark near-black background (#080B0E). On the left, a chat bubble interface made of soft glowing glass shapes dissolves into a stream of light that flows to the right and turns into a neat workspace: a laptop showing an abstract website layout, a small analytics chart and an ad card, all as clean minimal 3D objects. Accent lighting in lime green (#C3FF55), subtle. Premium, calm, modern tech aesthetic, plenty of empty dark space in the top third for a headline. No text, no letters, no logos, no people's faces.

Варіант з людиною (якщо дасиш своє фото в GPT):
> Use the attached photo of the man. Place him on the right side, waist-up, friendly confident look, wearing the same clothes, against a dark near-black background (#080B0E) with soft lime-green (#C3FF55) rim light. On the left, floating minimal glass cards: chat bubble → document → website → chart, connected by a thin glowing line. Empty space at the top for a headline. Photorealistic, no text, no logos.

## Банер з фото — формати (2026-10-13)
Основа: `ADS/4 на 5 - Преміум AI-навчання з Вадимом Гуком.png` (подобається, але 1092×1440 = 3:4, а 9:16 — 941×1672 і текст у нижніх 20%).
Прикріпити банер у GPT і генерувати тричі, підставивши розмір:

> Recreate the attached ad banner exactly: same man, same photo, same dark #080B0E background with subtle grid, same lime #C3FF55 accents, same fonts, same Ukrainian text, letter for letter (copy every Cyrillic character exactly, do not translate, do not add or repeat words). Only change the canvas to **{SIZE}** and re-layout so nothing is cropped.
> - 1080×1350 (4:5): layout as in the original.
> - 1080×1920 (9:16): keep all text and the lime button between y=290 and y=1500. The top 270 px and the bottom 400 px hold only background and the man's body, with no text. Text column on the left 60%, man on the right.
> - 1080×1080 (1:1): headline + $300 + lime button on the left, man on the right; drop the browser-window illustration if space is tight.
> Sharp, high resolution, no extra text, no watermarks, no logos.

Після генерації перевірити кожну літеру (старий GPT-банер видав «навчимо працювать працювати»).

## Текст для накладання
- Заголовок: «З чату — в робочого помічника»
- Підзаголовок (менше): «AI-навичка за 10 годин з ментором»
- Плашка (лайм, темний текст): «30 хв безкоштовно»
- Внизу дрібно: «Вадим Гук · devguide.com.ua»
