import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Конфіденційність | Вадим Гук", robots: { index: false } };

// ponytail: коротка політика для запуску тесту; перед масштабуванням варто перевірити текст юристом (ЄС/GDPR).
export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 leading-relaxed md:py-24">
      <Link href="/" className="text-sm text-dim hover:text-fg">← На головну</Link>
      <h1 className="mt-6 font-display text-3xl font-black md:text-4xl">Політика конфіденційності</h1>
      <div className="mt-8 space-y-5 text-dim">
        <p>Сайт належить Вадиму Гуку (DevGuide, Львів). Контакт: hukvadim@gmail.com.</p>
        <p>Сайт не збирає форм і персональних даних напряму. Зв&apos;язок відбувається в Telegram, де діють правила Telegram.</p>
        <p>
          Лише за вашою згодою (кнопка «Дозволити») вмикаються Google Analytics 4 і Meta Pixel. Вони збирають знеособлені дані про відвідування й кліки, щоб ми розуміли, яка реклама працює. Обравши «Тільки необхідні», ви вимикаєте ці сервіси.
        </p>
        <p>Змінити вибір можна, очистивши дані сайту в браузері. Із питань щодо даних пишіть на пошту вище.</p>
      </div>
    </main>
  );
}
