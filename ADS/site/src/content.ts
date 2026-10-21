// Увесь зміст сторінки (ТЗ §5): послуги, кейси, демо-матеріали, контакт.
// Ціни — рекомендований стартовий прайс з ТЗ, ще не погоджений (§1, §7). Перед запуском звірити.

export const contact = {
  telegram: "https://t.me/hukvadim",
  handle: "@hukvadim",
};

export type Asset = {
  id: string;
  kind: "image" | "video";
  path: string;
  poster?: string;
  alt: string;
  caption: string;
  isDemo: boolean;
  replacementNote: string;
};

export const demoAssets: Record<string, Asset> = {
  lovim: { id: "lovim", kind: "image", path: "/media/lovim.webp", alt: "Мобільна версія магазину Lovim", caption: "lovim.devguide.com.ua", isDemo: false, replacementNote: "Замінити на запис екрана й предметний ролик з рожевим кварцом (MP4)" },
  devguide: { id: "devguide", kind: "image", path: "/media/devguide.webp", alt: "Мобільна головна DevGuide", caption: "devguide.com.ua", isDemo: false, replacementNote: "Оновити скрин після змін на сайті" },
  short1: { id: "short1", kind: "video", path: "/media/short1.mp4", poster: "/media/short1.webp", alt: "Ролик DevGuide: Встанови Claude Code", caption: "Встанови Claude Code", isDemo: false, replacementNote: "Замінити на 3 опубліковані Shorts з посиланнями" },
  short2: { id: "short2", kind: "video", path: "/media/short2.mp4", poster: "/media/short2.webp", alt: "Ролик DevGuide: Спершу план, потім код", caption: "Спершу план, потім код", isDemo: false, replacementNote: "Замінити на опублікований Short" },
  short3: { id: "short3", kind: "video", path: "/media/short3.mp4", poster: "/media/short3.webp", alt: "Ролик DevGuide: 5 промптів для старту", caption: "5 промптів для старту", isDemo: false, replacementNote: "Замінити на опублікований Short" },
};

export type Group = "site" | "video" | "leads";

export const tasks: { group: Group; title: string; hint: string; icon: string }[] = [
  { group: "site", title: "Потрібен сайт", hint: "Лендинг, сайт послуг, магазин", icon: "◱" },
  { group: "video", title: "Потрібні відео", hint: "Вертикальні ролики й контент на місяць", icon: "▶" },
  { group: "leads", title: "Потрібен порядок у заявках", hint: "Бот, AI + Trello, аналітика, реклама", icon: "⇄" },
];

export type Service = {
  id: string;
  group: Group;
  title: string;
  price: number;
  unit?: string;
  includes: string;
  extra: string;
  example: string;
};

const SITE_EXTRA = "Домен, хостинг, платні сервіси, фотозйомка. Нові функції — окремий кошторис.";
const VIDEO_EXTRA = "Зйомка, актори, AI-кредити понад погоджений ліміт, клонування голосу.";
const LEADS_EXTRA = "Тарифи месенджерів і платних API, рекламний бюджет.";

export const services: Service[] = [
  { id: "landing", group: "site", title: "Лендинг", price: 20000, includes: "1 мова, до 7 секцій, мобільний дизайн, одна форма або Telegram, базове SEO, GA4 після згоди. Два раунди правок.", extra: SITE_EXTRA, example: "DevGuide" },
  { id: "services-site", group: "site", title: "Сайт послуг", price: 35000, includes: "До 5 основних сторінок: послуги, контакти, форми, базове SEO та аналітика. Два раунди правок.", extra: SITE_EXTRA, example: "демо для локальної послуги" },
  { id: "shop", group: "site", title: "Магазин", price: 60000, includes: "До 30 товарів з готовими матеріалами, каталог, кошик, оформлення, базова адмінка. Оплати й доставку оцінюємо окремо.", extra: SITE_EXTRA, example: "Lovim" },
  { id: "video", group: "video", title: "Вертикальне відео", price: 3000, includes: "15–30 с, один сценарій, ваші фото/відео, монтаж, субтитри, стандартна озвучка, один раунд правок.", extra: VIDEO_EXTRA, example: "ролики DevGuide" },
  { id: "video-pack", group: "video", title: "Пакет відео", price: 10000, includes: "4 ролики 15–30 с в одному стилі з ваших матеріалів.", extra: VIDEO_EXTRA, example: "DevGuide Shorts" },
  { id: "content", group: "video", title: "Контент на місяць", price: 16000, unit: "/міс", includes: "План на 4 тижні, 4 відео + 4 статичні публікації, тексти, планування в одному акаунті.", extra: VIDEO_EXTRA, example: "демо контент-плану" },
  { id: "bot", group: "leads", title: "Telegram-бот", price: 15000, includes: "До 3 сценаріїв, збір контактів і заявок, сповіщення власнику.", extra: LEADS_EXTRA, example: "демо запису" },
  { id: "ai-trello", group: "leads", title: "AI + Trello", price: 25000, includes: "Один канал, погоджена база відповідей, уточнення заявки, картка в Trello, передача людині, журнал помилок.", extra: LEADS_EXTRA, example: "демо процесу вище" },
  { id: "analytics", group: "leads", title: "Аналітика", price: 6000, includes: "1 сайт, GA4/GTM, до 5 подій, UTM, перевірка подій, короткий звіт.", extra: "Платні інструменти аналітики.", example: "демо подій" },
  { id: "meta-launch", group: "leads", title: "Запуск Meta Ads", price: 8000, unit: " разово", includes: "1 пропозиція, до 2 наборів і 6 оголошень з ваших креативів, події/UTM, план тесту.", extra: "Рекламний бюджет, нові креативи.", example: "власний запуск DevGuide" },
  { id: "meta-support", group: "leads", title: "Супровід Meta Ads", price: 8000, unit: "/міс", includes: "Один акаунт, погоджений тест, щоденна перевірка витрат і помилок, щотижневий звіт.", extra: "Рекламний бюджет, нові креативи.", example: "демо звіту" },
  { id: "support", group: "leads", title: "Технічна підтримка", price: 6000, unit: "/міс", includes: "До 4 годин робіт на місяць, контроль форм і доступності, дрібні зміни. Реакція в робочий час.", extra: "Роботи понад ліміт годин.", example: "журнал задач" },
];

export const groupTitle: Record<Group, string> = { site: "Сайти", video: "Відео й контент", leads: "Заявки, автоматизація, реклама" };

export type Project = {
  id: string;
  tag: string;
  title: string;
  task: string;
  done: string;
  service: string;
  url: string;
  asset: string;
  cta: string;
};

export const projects: Project[] = [
  { id: "lovim", tag: "Інтернет-магазин", title: "Lovim", task: "Магазин прикрас ручної роботи з мобільним каталогом.", done: "Дизайн, каталог, кошик, мобільна версія.", service: "Магазин", url: "https://lovim.devguide.com.ua/", asset: "lovim", cta: "Відкрити сайт" },
  { id: "devguide", tag: "Власний проєкт", title: "DevGuide", task: "Платформа навчання з мобільною сторінкою.", done: "Дизайн, верстка, контент, аналітика.", service: "Лендинг", url: "https://devguide.com.ua/", asset: "devguide", cta: "Відкрити сайт" },
  { id: "shorts", tag: "Вертикальні відео", title: "DevGuide Shorts", task: "Серія коротких пояснювальних роликів.", done: "Сценарій, моушн, монтаж, звук.", service: "Пакет відео", url: "https://www.youtube.com/@devguide_com_ua/shorts", asset: "short1", cta: "Ще відео" },
];

export const steps = [
  ["Пишете в Telegram", "Коротко: що болить і що хочете отримати."],
  ["Уточнюємо задачу", "Кілька питань, щоб зрозуміти обсяг."],
  ["Погоджуємо обсяг і бюджет", "Кошторис, етапи, що окремо."],
  ["Показую проміжний результат", "Бачите роботу до запуску, вносимо правки."],
  ["Запускаємо", "Публікація, події, перевірка форм."],
  ["Перевіряємо й підтримуємо", "За потреби — супровід за лімітом годин."],
];

export const faq = [
  ["З чого почати?", "З однієї задачі, яка зараз забирає найбільше часу. Напишіть її в Telegram — запропоную перший крок і порядок кошторису."],
  ["Що треба від мене?", "Опис бізнесу, тексти або тези, фото чи відео, доступи до потрібних сервісів і одна людина, яка погоджує рішення."],
  ["Які витрати окремо?", "Рекламний бюджет, домен, хостинг, платні API, тарифи месенджерів, ліцензії, фотозйомка, актори. Ліміт AI-генерацій фіксуємо до оплати."],
  ["Хто володіє сайтом?", "Ви. Домен, хостинг і акаунти оформлюються на вас, доступи передаю після запуску."],
  ["Що робить AI?", "Прискорює чернетки, структуру й рутину. Рішення, домовленості й якість перевіряю я. AI не приймає платежі й не змінює бюджет самостійно."],
  ["Чи гарантуєте продажі?", "Ні. Гарантую погоджений обсяг роботи та її якість. Продажі залежать від продукту, ціни, ринку й реклами."],
  ["Чи можна навчитися самому?", "Так. У DevGuide є індивідуальне навчання — можемо пройти вашу задачу разом. Спитайте в Telegram."],
];
