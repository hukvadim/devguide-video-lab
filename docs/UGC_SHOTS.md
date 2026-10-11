# UGC-вставки з Вадимом: 10 кліпів по 3–4 с

Навіщо: короткі живі кадри з обличчям між сценами Remotion. Глядач бачить автора, а не лише графіку.
Записуємо один раз, далі використовуємо в усіх роликах (шляхи, лабораторія форматів, Instagram).

## Як знімати (один підхід, ≈ 20 хв)
- Телефон вертикально на штативі, 1080×1920 або 4K, 30 fps. Об'єктив на рівні очей, 1–1.5 м.
- Світло від вікна спереду або збоку, без жовтої лампи ззаду. Фон спокійний: робоче місце або однотонна стіна.
- Той самий одяг для всіх кліпів (темний верх; лаймова деталь бренду, якщо є: стікер, чашка, кепка).
- **Без слів** (звук не потрібен, заглушимо або поставимо удар/whoosh). Можна шепнути команду собі — виріжемо.
- Кожен кліп: 1 с стоїш спокійно → дія → 1 с завмираєш. 2–3 дублі. Ми обріжемо до 3–4 с.
- Файли клади в `public/assets/ugc/raw/` з назвою як у таблиці: `ugc-01-stop.mp4` (дублі — `ugc-01-stop-2.mp4`).

## 10 кліпів
| № | Файл | Дія | Де вставляємо |
|---|---|---|---|
| 01 | ugc-01-stop | різко виставляєш долоню в камеру «Стоп!» | хук «AI зламав», «4 правила безпеки» |
| 02 | ugc-02-wow | дивишся в ноутбук → повертаєшся в камеру з «вау» | «результат першим», перед готовим сайтом |
| 03 | ugc-03-nod | впевнено киваєш, легка усмішка | після кожного виконаного кроку, перед «Перевіркою» |
| 04 | ugc-04-typing | друкуєш на клавіатурі, камера збоку на руки й обличчя | під промпти, «встав запит» |
| 05 | ugc-05-point-up | показуєш пальцем угору (на текст над головою) | титули й плашки зверху, спліт |
| 06 | ugc-06-phone | показуєш телефон екраном у камеру (екран замінимо графікою) | Telegram, Instagram-CTA, «напиши» |
| 07 | ugc-07-facepalm | facepalm → видих → усмішка | «AI ходить по колу», помилки |
| 08 | ugc-08-ok | показуєш «ок» рукою або стікер «ок» | «дочекайся мого ок», режим плану |
| 09 | ugc-09-snap | знизуєш плечима → клацаєш пальцями | перехід між сценами (клац = склейка) |
| 10 | ugc-10-point-down | показуєш униз на кнопку / «в коментарі» | end card, CTA |

## Варіант без зйомки: Google Flow (Veo)
У Flow: формат **9:16**, у «Ingredients» додай 1–3 своїх фото (обличчя анфас, добре світло), щоб лице було твоє.
Готові кліпи (Flow дає ~8 с, ми ріжемо до 3–4 с) клади в `public/assets/ugc/flow/` з назвами `ugc-01-stop.mp4` … `ugc-10-point-down.mp4`
(дублі: `ugc-01-stop-2.mp4`). Промпти англійською — Veo розуміє їх точніше. Тексту в кадрі не просимо: AI спотворює літери.

Спільний опис (уже вставлено в кожен промпт): the man from the reference images, short dark hair, black t-shirt, modern home office,
laptop with a small lime-green sticker, soft window light, shallow depth of field, vertical 9:16, handheld UGC style, no text, no speech.

01 `ugc-01-stop`: The man from the reference images sits at his desk, looks straight into the camera and quickly raises his open palm toward the lens in a confident "stop" gesture, then holds still. Short dark hair, black t-shirt, modern home office, laptop with a small lime-green sticker, soft window light, shallow depth of field, vertical 9:16, handheld UGC style, no text, no speech.
02 `ugc-02-wow`: The man from the reference images looks at his laptop screen, his eyes widen in genuine surprise, then he turns to the camera with an amazed smile. Short dark hair, black t-shirt, modern home office, lime-green sticker on the laptop, soft window light, vertical 9:16, UGC selfie-camera feel, no text, no speech.
03 `ugc-03-nod`: The man from the reference images looks into the camera and gives a slow, confident nod with a slight satisfied smile, as if saying "done". Short dark hair, black t-shirt, home office with laptop in the background, soft natural light, vertical 9:16, UGC style, no text, no speech.
04 `ugc-04-typing`: Side view of the man from the reference images typing fast on a laptop keyboard, focused face lit by the screen glow, lime-green sticker on the laptop lid, cozy home office at evening, slow push-in camera, vertical 9:16, no readable text on screen, no speech.
05 `ugc-05-point-up`: The man from the reference images looks at the camera and points his index finger up above his head, as if showing a title that appears above him, with an energetic smile. Black t-shirt, plain dark wall behind him, soft key light, vertical 9:16, empty space in the top third of the frame, no text, no speech.
06 `ugc-06-phone`: The man from the reference images holds a smartphone and turns its screen toward the camera, screen shows a plain bright green color, he smiles and nods. Black t-shirt, home office, soft window light, vertical 9:16, UGC style, no text, no speech.
07 `ugc-07-facepalm`: The man from the reference images reads something on his laptop, does a facepalm, exhales, then looks up at the camera and laughs it off. Short dark hair, black t-shirt, home office, laptop with lime-green sticker, soft light, vertical 9:16, UGC style, no text, no speech.
08 `ugc-08-ok`: The man from the reference images looks into the camera and shows a clear "OK" hand sign next to his face with a calm confident smile. Black t-shirt, blurred home office background with a lime-green accent object, soft window light, vertical 9:16, no text, no speech.
09 `ugc-09-snap`: The man from the reference images shrugs playfully, then snaps his fingers toward the camera with a quick hand movement, motion blur on the snap. Black t-shirt, plain dark wall, punchy contrast lighting, vertical 9:16, UGC style, no text, no speech.
10 `ugc-10-point-down`: The man from the reference images looks into the camera and points down with both index fingers toward the bottom of the frame, inviting the viewer to comment, friendly smile. Black t-shirt, home office, soft window light, vertical 9:16, empty space in the lower third, no text, no speech.

## Що робимо з ними в конвеєрі
1. Обрізаємо до найкращих 3–4 с, звук прибираємо.
2. Кольорова корекція під палітру ролика (brand, drop01, drop14 …, `src/system/theme.tsx`).
3. За бажанням вирізаємо фон маскою RVM (є в скілі devguide-reel) і ставимо тебе на колір палітри — у стилі «Color Drop».
4. Компонент вставки в `src/system/` (повноекранний кліп 3–4 с з whoosh/ударом) — використовуємо в `StepVideo` і лабораторії.
