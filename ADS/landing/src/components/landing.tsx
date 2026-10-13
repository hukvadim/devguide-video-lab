import Image from "next/image";
import Link from "next/link";
import { Check, MessageSquareText, Clock, CalendarDays, Laptop, X as XIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StickyCta, TelegramCta } from "./cta";
import { HeroBackdrop } from "./hero-visual";
import { Motion } from "./motion";

// Тексти й факти: ADS/README.md, ADS/02-copy/aida-angles.md, devguide.com.ua/about (перевірено 2026-10-12).
// Два варіанти hero під дві кампанії: "/" (українці за кордоном) і "/business" (підприємці й команди). Решта спільна.
export type Variant = "abroad" | "business";

const HERO: Record<Variant, { kicker: string; title: [string, string]; sub: string; video: string; problems: [string, string][] }> = {
  abroad: {
    kicker: "Онлайн · українською · 1:1",
    title: ["AI у тебе вже є.", "Навчимо його працювати."],
    sub: "10 індивідуальних годин з розробником. Один твій проєкт: від розмови з клієнтом до опублікованого сайту, аналітики й першої реклами.",
    video: "hero-abroad",
    problems: [
      ["AI відповідає загально", "Питаєш у чаті — отримуєш воду, яку не покажеш клієнту."],
      ["Незрозуміло, з чого почати", "Курси на 100 годин, а потрібна одна навичка, з якою можна брати замовлення."],
      ["Нова країна — новий старт", "Цифрова навичка не залежить від мови в офісі й переїздить разом з тобою."],
    ],
  },
  business: {
    kicker: "Для підприємців і команд · 1:1",
    title: ["Задачі бізнесу з AI —", "без чекання підрядника."],
    sub: "10 індивідуальних годин з розробником для вас або співробітника. Беремо одну реальну задачу вашого бізнесу й доводимо до запуску.",
    video: "hero-business",
    problems: [
      ["Кожна дрібниця — через підрядника", "Лендінг, банер, тест реклами: тижні очікування й окремий рахунок."],
      ["AI є, процесу немає", "Команда вже має ChatGPT чи Claude, але результат щоразу різний."],
      ["Невідомо, що спрацювало", "Без аналітики й UTM реклама — це здогадки."],
    ],
  },
};

const STEPS: [string, string][] = [
  ["Ідея або діалог → чітке завдання", "Розмову з клієнтом чи власну ідею перетворюємо на ТЗ, з яким AI працює точно."],
  ["AI-інструменти й безпечні доступи", "Налаштовуємо робоче місце: Claude, редактор, репозиторій. Ключі й паролі — без витоків."],
  ["Сайт: створюємо й публікуємо", "Невеликий сайт під твою задачу, опублікований у мережі з власною адресою."],
  ["Аналітика, UTM, відстеження дій", "Бачимо, звідки прийшли люди і хто натиснув головну кнопку."],
  ["Креатив і перша кампанія під наглядом", "Готуємо оголошення й запускаємо невеликий тест. Бюджет і публікацію перевіряє людина."],
];

const PORTFOLIO = [
  { src: "/portfolio/devguide.png", name: "DevGuide", note: "освітня платформа: каталог, оплати, адмінка" },
  { src: "/portfolio/babayaga.png", name: "Багажна хатинка", note: "сайт камери зберігання у Львові, клієнт" },
  { src: "/portfolio/solar-energy.png", name: "Solar 30 кВт", note: "лендінг для енергетичного бізнесу" },
  { src: "/portfolio/test-1-lesson.png", name: "VOLTERRA", note: "навчальний проєкт з заняття" },
];

const FAQ: [string, string][] = [
  ["Я зовсім не айтішник. Це для мене?", "Так, якщо готовий практикуватися між заняттями. Обсяг проєкту підбираємо під стартовий рівень на безкоштовній зустрічі."],
  ["Скільки часу потрібно на практику?", "Орієнтовно 2–4 години на тиждень між заняттями. Без практики 10 годин дадуть значно менше."],
  ["Що потрібно мати?", "Комп'ютер і підписку на AI-інструмент. Claude Pro коштує орієнтовно $20/міс і оплачується окремо."],
  ["Можна навчити співробітника?", "Так. Працюємо на реальній задачі вашого бізнесу, заняття проходить співробітник."],
  ["А бот чи автоматизація?", "Це окремий фокус або наступний етап. За 10 годин не обіцяємо все одразу."],
  ["Ви гарантуєте роботу чи замовлення?", "Ні. Ви отримуєте навичку, опублікований проєкт і зрозумілий процес. Результат залежить від практики."],
];

const Kicker = ({ children }: { children: React.ReactNode }) => <p className="font-mono text-xs tracking-[0.25em] text-lime uppercase md:text-sm">{children}</p>;
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 data-split className="mt-3 font-display text-3xl leading-[1.08] font-black tracking-tight text-balance md:text-5xl">
    {children}
  </h2>
);
const Section = ({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`mx-auto w-full max-w-6xl px-4 py-20 md:px-8 md:py-28 ${className}`}>
    {children}
  </section>
);

export function Landing({ variant }: { variant: Variant }) {
  const h = HERO[variant];
  return (
    <Motion>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <a href="https://devguide.com.ua" className="font-display text-lg font-black tracking-tight">
          DEV<span className="text-lime">GUIDE</span>
        </a>
        <TelegramCta place="header" className="h-10 px-4 text-sm shadow-none">
          Написати
        </TelegramCta>
      </header>

      {/* ATTENTION */}
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-lime/10 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 hidden opacity-90 md:block">
          <HeroBackdrop />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-20 md:grid-cols-[1.25fr_1fr] md:px-8 md:pt-16 md:pb-28">
          <div>
            <Kicker>{h.kicker}</Kicker>
            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.02] font-black tracking-tight text-balance md:text-7xl">
              {h.title[0]} <span className="text-lime">{h.title[1]}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-dim md:text-xl">{h.sub}</p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <TelegramCta place="hero" />
              <span className="text-sm text-dim">Перше заняття 30 хв — безкоштовно, без зобов&apos;язань</span>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-dim">
              <li>10+ років у веброзробці</li>
              <li>300+ учнів 1:1</li>
              <li>5.0 на Superprof (48 відгуків)</li>
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-[300px] md:max-w-[340px]">
            <div className="overflow-hidden rounded-[2.5rem] border border-line bg-panel p-2 shadow-[0_40px_120px_-30px_#000,0_0_0_1px_#c3ff5522]">
              <video className="aspect-[9/16] w-full rounded-[2rem] object-cover" autoPlay muted loop playsInline preload="metadata" poster={`/media/${h.video}.avif`} aria-label="Вадим Гук за роботою">
                <source src={`/media/${h.video}.webm`} type="video/webm" />
                <source src={`/media/${h.video}.mp4`} type="video/mp4" />
              </video>
            </div>
            <div className="absolute -bottom-5 -left-4 rounded-2xl border border-line bg-panel/90 px-4 py-3 text-sm backdrop-blur md:-left-10">
              <p className="font-bold">Вадим Гук</p>
              <p className="text-dim">розробник і викладач, Львів</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTEREST: проблема */}
      <Section>
        <Kicker>Знайомо?</Kicker>
        <H2>
          Чат з AI — це ще не <span className="text-lime">робочий процес</span>
        </H2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {h.problems.map(([t, d]) => (
            <div key={t} data-reveal className="rounded-3xl border border-line bg-panel p-6 md:p-8">
              <XIcon className="size-6 text-dim" aria-hidden />
              <h3 className="mt-5 text-xl font-bold">{t}</h3>
              <p className="mt-2 leading-relaxed text-dim">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* INTEREST: що робимо */}
      <Section>
        <Kicker>Що робимо за 10 годин</Kicker>
        <H2>
          Від діалогу з клієнтом — <span className="text-lime">до першої реклами</span>
        </H2>
        <ol className="relative mt-14 space-y-6 pl-12 md:pl-16">
          <div className="absolute top-2 bottom-2 left-[15px] w-px bg-line md:left-[23px]" />
          <div data-line className="absolute top-2 bottom-2 left-[15px] w-px origin-top bg-lime md:left-[23px]" />
          {STEPS.map(([t, d], i) => (
            <li key={t} data-reveal className="relative rounded-3xl border border-line bg-panel p-6 md:p-8">
              <span className="absolute top-6 -left-12 grid size-8 place-items-center rounded-full bg-lime font-display text-sm font-black text-bg md:top-8 md:-left-16 md:size-12 md:text-lg">{i + 1}</span>
              <h3 className="text-xl font-bold md:text-2xl">{t}</h3>
              <p className="mt-2 leading-relaxed text-dim">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-dim">Бот або автоматизація — альтернативний фокус чи наступний етап, а не обіцянка всього одразу.</p>
      </Section>

      {/* DESIRE: як проходить */}
      <Section>
        <Kicker>Формат</Kicker>
        <H2>Посильний темп і один реальний проєкт</H2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Clock, "10 × 1 година", "індивідуально, онлайн"],
            [CalendarDays, "2 рази на тиждень", "приблизно 5 тижнів"],
            [Laptop, "1 проєкт", "під твій стартовий рівень"],
            [MessageSquareText, "Практика між заняттями", "і записи кожного уроку"],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Clock;
            return (
              <div key={t as string} data-reveal className="rounded-3xl border border-line bg-panel p-6">
                <I className="size-7 text-lime" aria-hidden />
                <p className="mt-5 text-lg font-bold">{t as string}</p>
                <p className="text-dim">{d as string}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* DESIRE: про Вадима */}
      <Section>
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
          <div>
            <Kicker>Ментор</Kicker>
            <H2>
              Вадим Гук, <span className="text-lime">технічний партнер</span>
            </H2>
            <p data-reveal className="mt-6 text-lg leading-relaxed text-dim">
              Понад 10 років комерційної веброзробки, з 2022 року навчаю індивідуально. Понад 300 учнів, 800+ годин записаних занять. Працюю з HTML, CSS, JavaScript, React, Next.js, TypeScript, Node.js і AI-асистованою розробкою.
            </p>
            <a data-reveal href="https://www.superprof.com.ua/stvoriuiu-saity-rokiv-navchaiu-html-css-react-redux-git-api-povnomu-tsyklu-veb-rozrobky.html" target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 font-semibold hover:border-lime">
              5.0 · 48 відгуків на Superprof ↗
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {PORTFOLIO.map((p) => (
              <figure key={p.name} data-reveal className="overflow-hidden rounded-3xl border border-line bg-panel">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={p.src} alt={`Сайт ${p.name}`} fill sizes="(max-width: 768px) 45vw, 280px" className="object-cover object-top" />
                </div>
                <figcaption className="p-4">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm text-dim">{p.note}</p>
                </figcaption>
              </figure>
            ))}
            <p className="col-span-2 text-xs text-dim">Проєкти Вадима, не роботи учнів.</p>
          </div>
        </div>
      </Section>

      {/* ACTION: ціна */}
      <Section id="price">
        <div data-reveal className="relative overflow-hidden rounded-[2rem] border border-lime/40 bg-panel p-6 md:p-12">
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-lime/15 blur-3xl" />
          <Kicker>Вартість</Kicker>
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
            <p className="font-display text-6xl font-black md:text-8xl">$300</p>
            <p className="pb-2 text-lg text-dim md:pb-4">10 годин × $30</p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <ul className="space-y-3">
              {["10 індивідуальних занять онлайн", "Один проєкт від ідеї до публікації", "Аналітика й перша рекламна кампанія під наглядом", "Записи занять"].map((s) => (
                <li key={s} className="flex gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
            <ul className="space-y-3 text-dim">
              {["Підписка на AI (Claude Pro ~$20/міс) — окремо", "Рекламний бюджет — окремо, вирішуєте ви", "Без гарантій працевлаштування чи замовлень"].map((s) => (
                <li key={s} className="flex gap-3">
                  <XIcon className="mt-0.5 size-5 shrink-0" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <TelegramCta place="price">Почати з безкоштовних 30 хв</TelegramCta>
            <span className="text-sm text-dim">Узгоджуємо обсяг і розклад перед оплатою</span>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="max-w-3xl">
        <Kicker>Питання</Kicker>
        <H2>Часті запитання</H2>
        <Accordion className="mt-10">
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q} className="border-line">
              <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline md:text-lg">{q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-dim">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* ACTION: фінал */}
      <Section className="text-center">
        <H2>
          Почнімо з <span className="text-lime">30 хвилин</span>
        </H2>
        <p data-reveal className="mx-auto mt-5 max-w-xl text-lg text-dim">
          Розкажи про свою ідею чи задачу. Підберемо проєкт під твій рівень і скажемо чесно, чи підходить цей формат.
        </p>
        <div data-reveal className="mt-8 flex justify-center">
          <TelegramCta place="final" />
        </div>
      </Section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-dim md:flex-row md:justify-between md:px-8">
          <p>© 2026 Вадим Гук · DevGuide · Львів</p>
          <p className="flex gap-5">
            <a href="mailto:hukvadim@gmail.com" className="hover:text-fg">hukvadim@gmail.com</a>
            <Link href="/privacy" className="hover:text-fg">Конфіденційність</Link>
          </p>
        </div>
      </footer>

      <StickyCta />
    </Motion>
  );
}
