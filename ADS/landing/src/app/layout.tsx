import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Unbounded } from "next/font/google";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "cyrillic"], weight: ["700", "900"] });
const mono = JetBrains_Mono({ variable: "--font-jb-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "AI як робочий помічник — 10 годин з ментором | Вадим Гук",
  description:
    "Індивідуальне навчання онлайн українською: від діалогу з клієнтом і ТЗ до опублікованого сайту, аналітики й першої реклами. Перше заняття 30 хв безкоштовно.",
  openGraph: { locale: "uk_UA", type: "website", siteName: "DevGuide" },
};

export const viewport: Viewport = { themeColor: "#080B0E" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`${inter.variable} ${unbounded.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh bg-bg text-fg font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
