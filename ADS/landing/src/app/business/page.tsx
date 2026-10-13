import type { Metadata } from "next";
import { Landing } from "@/components/landing";

export const metadata: Metadata = {
  title: "AI-процес для вашої команди — 10 годин з ментором | Вадим Гук",
  description: "Ви або співробітник проходите одну реальну задачу бізнесу з AI: ТЗ, сторінка, аналітика, перший тест реклами. Перші 30 хв безкоштовно.",
};

export default function Page() {
  return <Landing variant="business" />;
}
