# UGC Flow: 10 нових вставок без голосу (3–4 с)

Доповнює `docs/UGC_SHOTS.md`. Тут інша логіка: **різні локації, одяг із твоїх фото**, жодної мови, жодного тексту в кадрі.
Готові кліпи кладемо в `public/assets/ugc/flow/<slug>.mp4` (як уже лежать `Stop`, `wow`, `typing` …).

## Робочий процес у Flow
1. Формат **9:16**, у «Ingredients» додай 1–3 фото **одного образу** (обличчя анфас + одяг). Один образ = одна група нижче. Не змішуй хутра й сорочки в одному промпті.
2. Вставляй промпт цілком. Flow дає ~8 с; нам потрібні 3–4 с, найкращий шматок обріжемо.
3. Збережи як `<slug>.mp4`. Дублі: `<slug>-2.mp4`.
4. Допиши кліп у `public/assets/ugc/ugc.json`: `name`, `file`, `from` (початок найкращого шматка), `dur`, `tags` (емоції: wow, laugh, fail, stop, phone…). Тоді скіл `devguide-reel` сам підставить його в рілси за емоцією фрази (`edit.ugc`), а в Remotion-роликах він доступний через `ugc(<slug>, at, dur)` з `src/system/ugc.tsx`.

Правило для кожного промпту (вже вписано): стартова секунда спокійна, дія, завмирання в кінці. Це дає чистий різ і не ламає обличчя.
Не просимо: текст на екранах, логотипи, мову, музику. Екран ноутбука = «abstract glow, no readable text».

## Образи (під твої фото)
- **A. Бордовий худі, домашній/кафе-світ** — камерні, робочі сцени.
- **B. Чорний піджак, дощ, місто** — серйозний, «експертний» тон.
- **C. Капелюх + кремова футболка, червона стіна** — яскравий, емоційний.
- **D. Бірюзова сорочка, диван** — розслаблений, «поясню по-простому».

## 10 кліпів

| № | Slug | Образ | Де вставляємо |
|---|---|---|---|
| 1 | `cafe-sip` | A | пауза між кроками, «поки AI думає» |
| 2 | `rain-window` | B | серйозні теми, безпека, «що не можна довіряти AI» |
| 3 | `sofa-laugh` | D | помилки AI, жарт, «мій улюблений баг» |
| 4 | `street-phone` | C | Telegram/CTA, «подивись у телефоні» |
| 5 | `whiteboard-aha` | B | пояснення схеми, «як це працює» |
| 6 | `headphones-focus` | A | глибока робота, «пишу код» |
| 7 | `night-stretch` | A | довгий процес, генерація, очікування |
| 8 | `phone-buzz` | D | сповіщення, підсумок, «прийшло повідомлення» |
| 9 | `kitchen-morning` | D | початок ролика, «ранок з AI» |
| 10 | `fist-pump` | C | успіх, «задеплоїв», перед end card |

## Промпти (англійською, Veo)

Спільний хвіст у кожному: `vertical 9:16, handheld UGC style, natural light, shallow depth of field, no text, no logos, no speech, no music.`

**1 `cafe-sip`** (A)
The man from the reference images sits at a small cafe table by a window with a laptop. He is calm for a second, lifts a coffee cup, takes a slow sip while reading the screen, lowers the cup and raises his eyebrows, impressed. Wearing the same burgundy hoodie as in the reference. Laptop screen shows only an abstract soft glow. Warm daylight, blurred street outside. Vertical 9:16, handheld UGC style, shallow depth of field, no text, no logos, no speech, no music.

**2 `rain-window`** (B)
The man from the reference images in the same black blazer stands next to a large window with raindrops, a blurred evening city behind him. He looks out at the city for a second, then turns his head to the camera with a serious, calm, knowing look and gives one small slow nod. Moody cool light, a warm interior lamp in the background. Vertical 9:16, cinematic handheld, shallow depth of field, no text, no logos, no speech, no music.

**3 `sofa-laugh`** (D)
The man from the reference images in the same teal shirt sits on a grey sofa with a laptop on his knees. He reads the screen, bursts into a short genuine laugh, shakes his head, looks into the camera and rolls his eyes playfully. Cozy living room, soft lamp light. Laptop screen is only an abstract glow. Vertical 9:16, handheld UGC style, shallow depth of field, no text, no logos, no speech, no music.

**4 `street-phone`** (C)
The man from the reference images in the same brown hat and cream t-shirt walks along a sunny city street, phone in hand. He glances at the phone, stops, smiles widely, holds the phone toward the camera for a moment (screen is a plain bright green), then points at it. Camera follows him from the front at a steady handheld pace. Vertical 9:16, golden hour, shallow depth of field, no text, no logos, no speech, no music.

**5 `whiteboard-aha`** (B)
The man from the reference images in the same black blazer stands at a glass whiteboard in a modern office. He draws a simple diagram with three boxes and arrows (no letters, only shapes), steps back, taps the marker on the last box and turns to the camera with a satisfied "got it" smile. Soft office light. Vertical 9:16, handheld UGC style, shallow depth of field, no text, no logos, no speech, no music.

**6 `headphones-focus`** (A)
The man from the reference images in the same burgundy hoodie sits at a desk wearing over-ear headphones, typing fast, eyes locked on a monitor that shows only a soft abstract glow. After two seconds he slows down, takes the headphones off, exhales and leans back with a relieved smile. Side three-quarter view, slow push-in. Vertical 9:16, evening room light, shallow depth of field, no text, no logos, no speech, no music.

**7 `night-stretch`** (A)
The man from the reference images in the same burgundy hoodie sits at a desk late at night, only a desk lamp and the screen glow lighting the room. He rubs his eyes, stretches both arms up, leans back in the chair and checks the screen again, tired but content. Vertical 9:16, low-key lighting, handheld UGC style, shallow depth of field, no text, no logos, no speech, no music.

**8 `phone-buzz`** (D)
The man from the reference images in the same teal shirt sits at a table, laptop open. A smartphone on the table lights up and buzzes. He picks it up, reads the screen (not visible to the viewer), raises his eyebrows, smirks and gives a quiet impressed nod toward the camera. Soft window light. Vertical 9:16, handheld UGC style, shallow depth of field, no text, no logos, no speech, no music.

**9 `kitchen-morning`** (D)
The man from the reference images in the same teal shirt stands in a bright modern kitchen in the morning, holding a mug. He opens a laptop on the counter with one hand, looks at it, takes a sip, looks into the camera and gives a relaxed "let's go" smile. Warm morning sun through the window. Vertical 9:16, handheld UGC style, shallow depth of field, no text, no logos, no speech, no music.

**10 `fist-pump`** (C)
The man from the reference images in the same brown hat and cream t-shirt sits at a desk against a deep red wall. He stares at the laptop screen for a moment, then throws his fist up in a quiet "yes!" and grins into the camera, then holds the pose. Laptop screen is only an abstract glow. Vertical 9:16, punchy key light, handheld UGC style, shallow depth of field, no text, no logos, no speech, no music.

## Чек-лист після генерації
- Обличчя схоже на тебе на старті й у кінці кліпа (Veo часто «пливе» наприкінці: тоді беремо перші 3 с).
- Руки без зайвих пальців; на екранах немає «каші» з літер.
- Є спокійна секунда на початку і завмирання в кінці (для різу).
- Кліп ≤ 8 с, звук вимикаємо у `UgcInsert` (`muted`).
