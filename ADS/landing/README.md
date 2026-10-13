# Лендінг «AI як робочий помічник»

ТЗ: `../05-landing/TZ.md`. Маршрути: `/` — кампанія А (українці за кордоном), `/business` — кампанія Б, `/privacy`.

```bash
npm install
cp .env.example .env.local   # вписати NEXT_PUBLIC_META_PIXEL_ID і NEXT_PUBLIC_GA_ID
npm run dev                  # http://localhost:3000 (з кореня репо: preview "ads-landing" на 3100)
npm run build
```

- Аналітика вмикається лише після згоди в cookie-банері (`src/components/analytics.tsx`).
- Події: `PageView`; `ViewContent` / `view_item` — скрол до ціни; `Contact` / `generate_lead` — клік Telegram (з `place` і UTM першого входу).
- Анімації: `src/components/motion.tsx` (data-split / data-reveal / data-line). 3D-фон: `hero-3d.tsx`, лише десктоп і без reduced-motion.
- Hero-відео: `public/media/hero-*.webm|mp4|avif` (Flow-кліпи, 8 с, 540 px). Замінити на нові Flow-кліпи — ті самі імена.
- Деплой: Vercel, Root Directory = `ADS/landing`.
