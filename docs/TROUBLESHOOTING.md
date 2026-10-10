# Якщо щось не запускається

## PowerShell блокує npm.ps1

Використай `npm.cmd install` / `npm.cmd start` або термінал Command Prompt. Для npx — `npx.cmd`.
Змінювати системну execution policy для цього не потрібно.

## npm install: конфлікт peer dependencies

Не додавай одразу --force або --legacy-peer-deps. Перевір версію Node, lockfile і назву конфліктного пакета.
Skia/Rive/Bits встановлюються окремо. Якщо конфлікт виник після extras, попроси агента підібрати сумісні версії, зберігши базові композиції.
Пакети Remotion повинні мати одну точну версію. Перевір `npm ls remotion @remotion/cli @remotion/gsap @remotion/three`.

## Рендер довгий або закінчується нестачею пам'яті

Використай draft 540×960 і concurrency=1 або 2. Спочатку без motion blur та важких shaders.
Не збільшуй FPS/роздільність до завершення композиції. GPU не гарантує прискорення всього рендеру.
На іншому комп'ютері повтори вимірювання: попередні цифри не будуть універсальними.

## Three.js: чорний кадр

У конфігурації вже gl=angle. При програмному renderer API також передай chromiumOptions.gl='angle'.
Якщо комп'ютер/контейнер не має GPU-контексту, спробуй software renderer:

```bash
npm run render:3d -- --software
npm run render:hybrid -- --software
npm run qa:frames -- Hybrid --software
```

Це додає `--gl=swangle`. Якість сцени зберігається, швидкість може відрізнятися.
Перевір camera, lights, asset paths і headless screenshot. Не орієнтуйся тільки на Studio.

## Шрифти / український текст

Inter Latin та Cyrillic включені локально через @fontsource/inter. Перевір імпорт CSS і рендер гліфів.
Якщо потрібен інший шрифт, додай локальний із підтримкою української; дочекайся load до рендеру.

## GSAP animation не працює на render

Використовуй тільки useGsapTimeline для DOM/SVG. Object tweens, callbacks, autonomous ticker і plugins не підтримуються цим адаптером.
Three числові параметри обчислюй від кадру.

## Скіли не видно

npm install не встановлює скіли. Запусти setup:skills, перевір його вихідний код/лог, перезапусти агент.
Нехай агент прочитає встановлений SKILL.md і вкаже точний шлях. Не довіряй лише фразі «скил увімкнено».

## Snapcn не встановлюється

Спочатку потрібні components.json, alias configuration і поточна registry setup із docs Snapcn.
Скіл і готові компоненти — різні установки. Попроси агента виконати prompts/05_COMPONENT_LIBRARIES.md.

## Перенесення

Перенось ZIP, а не node_modules. Розпакуй, npm install. Lockfile зберігає версії.
Скіли можуть містити локальні symlinks: на новому ПК встанови їх заново через setup:skills.
