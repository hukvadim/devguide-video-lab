# Стек

## Встановлюється звичайним npm install

| Шар | Пакети | Призначення |
|---|---|---|
| Основа | React 19.2, TypeScript 5.9, Remotion 4.0.534 | Компоненти, кадри, типізація |
| Рендер | @remotion/cli, @remotion/renderer | Studio, MP4, кадри |
| Прев'ю в застосунку | @remotion/player | Вбудовування відео в React |
| Анімації | gsap, @remotion/gsap | DOM/SVG-таймлайни, stagger |
| 3D | three, @react-three/fiber, @remotion/three | Об'єкти, світло, камера |
| Монтаж | @remotion/transitions | Переходи між сценами |
| Вектор | @remotion/paths, @remotion/shapes | SVG, промальовування, геометрія |
| Готові анімації | lottie-web, @remotion/lottie | Локальний Lottie JSON |
| Титри | @remotion/captions | Типи та утиліти субтитрів |
| Візуальні ефекти | @remotion/noise, @remotion/motion-blur | Процедурні текстури та blur |
| Типографіка | @fontsource/inter, @remotion/google-fonts, @remotion/layout-utils | Локальні шрифти та розміри тексту |
| Медіа | @remotion/media-utils | Метадані та візуалізація аудіо |
| Стилі | Tailwind 4, @remotion/tailwind-v4 | Стилізація React-компонентів |
| Допоміжні | zod, lucide-react | Схеми параметрів та іконки |

Усі Remotion-пакети зафіксовані на однаковій версії. Точні сторонні версії — у package.json; npm install відтворює package-lock.json.
Сама наявність залежності не гарантує, що кожна сцена її використовує. `docs/TEST_MATRIX.md` задає реальні експерименти.

## Встановлюється окремо

- Офіційні Remotion Skills: https://github.com/remotion-dev/skills
- Snapcn skill + окремі копійовані компоненти: https://snapcn.dev/
- video-shotcraft: https://github.com/Vincentwei1021/video-shotcraft
- Remotion Bits: https://remotion-bits.dev/
- Rive: @remotion/rive 4.0.534 встановлено (2026-10-15); потрібен локальний .riv (`public/assets/mascot.riv`), у проєкті його ще немає
- Onda (github.com/degueba/onda): source-копія через `npx ondajs add <slug> --components-out src/system/onda --lib-out src/system/onda/lib`; встановлено fade-in + lib-canvas. Шрифти Clash Display / Space Grotesk підключати локально. Код MIT, назва/логотип Onda не використовувати
- Skia: @remotion/skia + @shopify/react-native-skia + WASM setup
- remotion-qa: https://github.com/GroMarketing/remotion-qa — додатковий інструмент, підключати після прочитання актуального README.
- Інші альтернативи для окремого тесту: RemotionUI, Remocn, Onda — https://www.remotion.dev/docs/resources

## Важливі межі

GSAP-анімації — через useGsapTimeline. Не запускай gsap.to на окремому таймері.
Поточний адаптер не підтримує GSAP plugins: не використовуй ScrollTrigger, Draggable, SplitText або MorphSVG через цей адаптер.
Для тексту розбий JSX на слова/літери; для SVG-переходів використовуй @remotion/paths або власну детерміновану інтерполяцію.
Three.js — через ThreeCanvas і useCurrentFrame, не автономний useFrame-loop.
Skia, motion blur та 3D можуть збільшувати час рендеру. Вимірюй окремо час генерації коду й час рендеру.
Для готових фото, голосів та AI-відеовставок потрібні окремі матеріали/сервіси. Базовий проєкт обходиться без них.

## Джерела, перевірені 2026-10-09

- https://www.remotion.dev/docs/gsap/use-gsap-timeline
- https://www.remotion.dev/docs/three
- https://www.remotion.dev/docs/transitions
- https://www.remotion.dev/docs/lottie
- https://www.remotion.dev/docs/captions
- https://www.remotion.dev/docs/skia
- https://www.remotion.dev/docs/rive
- https://www.remotion.dev/docs/ai/skills
- https://www.remotion.dev/docs/resources
- https://www.remotion.dev/prompts

Треті бібліотеки та скіли мають власні ліцензії. Перед публікацією перевір умови Remotion і ліцензії доданих матеріалів.
