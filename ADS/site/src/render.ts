// Розмітка сторінки з content.ts. Викликається у vite.config.ts під час збірки (transformIndexHtml),
// тож увесь текст, ціни й посилання лежать у готовому HTML і читаються без JS та без очікування анімацій.
import { contact, demoAssets, faq, groupTitle, projects, services, steps, tasks, type Asset, type Group } from "./content";

const tg = (placement: string, label: string, cls = "btn btn-primary", service = "") =>
  `<a class="${cls}" href="${contact.telegram}" target="_blank" rel="noopener" data-tg="${placement}"${service ? ` data-service="${service}"` : ""}><span>${label}</span><i aria-hidden="true">↗</i></a>`;

const price = (n: number) => n.toLocaleString("uk-UA").replace(/\s/g, " ");

const media = (a: Asset, cls = "") =>
  a.kind === "video"
    ? `<video class="${cls}" data-asset="${a.id}" src="${a.path}" poster="${a.poster}" muted playsinline loop preload="none" aria-label="${a.alt}"></video>`
    : `<img class="${cls}" data-asset="${a.id}" src="${a.path}" alt="${a.alt}" loading="lazy" decoding="async">`;

const marquee = (words: string[]) => {
  const row = words.map((w) => `<span>${w}</span><b aria-hidden="true">✦</b>`).join("");
  return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${row}${row}${row}</div></div>`;
};

const hero = `
<header class="hero" id="top">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="brand">
    <span class="logo">DG</span>
    <span class="brand-text"><b>Вадим Гук</b><small>Технічний партнер для бізнесу</small></span>
    <span class="live"><i></i>на звʼязку</span>
  </div>
  <h1 class="hero-title" data-hero-title>Сайт, відео та автоматизація — <em>з одним технічним партнером</em></h1>
  <p class="hero-sub" data-hero-fade>Допоможу представити ваш бізнес онлайн, підготувати контент і зібрати заявки в зрозумілий процес. Від першої задачі до запуску та супроводу.</p>
  <div class="hero-cta">
    ${tg("hero", "Обговорити мою задачу", "btn btn-primary btn-magnetic")}
    <a class="btn btn-ghost" href="#work" data-scroll>Подивитися роботи</a>
  </div>
  <p class="hero-note">Почнемо з конкретної задачі та погодженого кошторису.</p>
  <div class="phone" data-phone aria-label="Приклади робіт: сайт, відео, заявка">
    <div class="phone-notch"></div>
    <div class="phone-screen">
      <div class="slide is-on" data-slide="site"><img src="${demoAssets.lovim.path}" alt="${demoAssets.lovim.alt}" class="scroller" fetchpriority="high"></div>
      <div class="slide" data-slide="video">${media(demoAssets.short3)}</div>
      <div class="slide slide-lead" data-slide="lead">
        <div class="mini-chat">Добрий день! Потрібен сайт для студії 🙂</div>
        <div class="mini-card">
          <span class="chip chip-lime">Нова заявка</span>
          <b>Сайт для студії</b>
          <span>Джерело: Instagram</span>
          <span>Власник: Вадим</span>
        </div>
      </div>
    </div>
    <div class="phone-tabs"><span class="is-on">сайт</span><span>відео</span><span>заявка</span></div>
  </div>
</header>`;

const choose = `
<section class="section" id="choose">
  <p class="eyebrow">01 · З чого почнемо</p>
  <h2 data-split>Оберіть свою задачу</h2>
  <div class="tasks">
    ${tasks
      .map(
        (t, i) => `<a class="task" href="#svc-${t.group}" data-task="${t.group}">
      <span class="task-num">0${i + 1}</span>
      <span class="task-icon" aria-hidden="true">${t.icon}</span>
      <b>${t.title}</b>
      <small>${t.hint}</small>
      <span class="task-arrow" aria-hidden="true">→</span>
    </a>`,
      )
      .join("")}
  </div>
</section>`;

const work = `
<section class="work" id="work">
  <div class="work-head">
    <p class="eyebrow">02 · Приклади, які можна відкрити</p>
    <h2 data-split>Роботи</h2>
  </div>
  <div class="work-viewport">
    <div class="work-track">
      ${projects
        .map((p, i) => {
          const a = demoAssets[p.asset];
          return `<article class="case" data-case>
        <div class="case-frame">${media(a, a.kind === "image" ? "case-scroll" : "case-video")}${p.id === "shorts" ? `<div class="case-stack">${media(demoAssets.short1)}${media(demoAssets.short2)}</div>` : ""}</div>
        <div class="case-body">
          <span class="case-idx">${String(i + 1).padStart(2, "0")} / 0${projects.length}</span>
          <p class="eyebrow">${p.tag}</p>
          <h3>${p.title}</h3>
          <dl><dt>Задача</dt><dd>${p.task}</dd><dt>Що зроблено</dt><dd>${p.done}</dd><dt>Послуга</dt><dd>${p.service}</dd></dl>
          <a class="link" href="${p.url}" target="_blank" rel="noopener" data-portfolio="${p.id}">${p.cta} ↗</a>
        </div>
      </article>`;
        })
        .join("")}
    </div>
  </div>
  <div class="work-progress" aria-hidden="true"><i></i></div>
</section>`;

const auto = `
<section class="section auto" id="auto">
  <p class="eyebrow">03 · Автоматизація <span class="badge-demo">Демонстрація</span></p>
  <h2 data-split>Повідомлення стає задачею</h2>
  <p class="lead-text">Клієнт пише як зручно. AI уточнює деталі, збирає заявку і створює картку в Trello. Нестандартне — передає людині.</p>
  <div class="auto-stage">
    <span class="badge-demo badge-fixed">Демонстрація · вигадані дані</span>
    <div class="auto-step auto-msg">
      <span class="auto-label">Instagram Direct · 10:42</span>
      <p class="bubble" data-type>Добрий день! Потрібен лендинг для студії манікюру до кінця місяця, і щоб заявки падали в Telegram.</p>
      <p class="bubble bubble-me">Дякую! Уточню: у вас уже є домен і фото робіт?</p>
    </div>
    <div class="auto-step auto-lead">
      <span class="auto-label">Структурована заявка</span>
      <dl class="lead-grid">
        <dt>Джерело</dt><dd>Instagram Direct</dd>
        <dt>Задача</dt><dd>Лендинг + заявки в Telegram</dd>
        <dt>Дедлайн</dt><dd>кінець місяця (уточнити)</dd>
        <dt>Власник</dt><dd>Вадим</dd>
      </dl>
    </div>
    <div class="auto-step auto-board">
      <span class="auto-label">Trello · Заявки</span>
      <div class="board">
        <div class="col"><b>Нові</b><div class="tcard ghost">Сайт для кавʼярні</div></div>
        <div class="col"><b>В роботі</b><div class="tcard tcard-main"><span>Лендинг для студії</span><small>до кінця місяця · Вадим</small><span class="chip chip-status"><i></i><em data-status>Готово до кошторису</em></span></div></div>
        <div class="col"><b>Готово</b><div class="tcard ghost">Бот для запису</div></div>
      </div>
    </div>
  </div>
</section>`;

const groups: Group[] = ["site", "video", "leads"];
const svc = `
<section class="section" id="services">
  <p class="eyebrow">04 · Послуга → результат → ціна</p>
  <h2 data-split>Скільки коштує старт</h2>
  <p class="lead-text">Стартові ціни за базовий обсяг. Строк — після погодження обсягу. Почнемо з однієї задачі, а не з великого пакета.</p>
  ${groups
    .map(
      (g) => `<div class="svc-group" id="svc-${g}"><h3 class="svc-title">${groupTitle[g]}</h3>
    ${services
      .filter((s) => s.group === g)
      .map(
        (s) => `<details class="svc" data-svc="${s.id}">
      <summary><span class="svc-name">${s.title}</span><span class="svc-price">від <b data-price="${price(s.price)}">${price(s.price)}</b> грн${s.unit ?? ""}</span><i class="svc-plus" aria-hidden="true"></i></summary>
      <div class="svc-body"><div class="svc-inner">
        <p><b>Що входить.</b> ${s.includes}</p>
        <p><b>Окремо.</b> ${s.extra}</p>
        <p><b>Приклад.</b> ${s.example}</p>
        ${tg("service", "Обговорити", "link", s.id)}
      </div></div>
    </details>`,
      )
      .join("")}</div>`,
    )
    .join("")}
  <div class="note-box">
    <b>Приклад кошторису, не обовʼязковий пакет:</b> лендинг 20 000 + 4 відео 10 000 + запуск реклами 8 000 = <b>38 000 грн</b> робіт. Без рекламного бюджету й сервісів.
  </div>
</section>`;

const how = `
<section class="section process" id="process">
  <p class="eyebrow">05 · Як працюємо</p>
  <h2 data-split>Шість кроків, без сюрпризів</h2>
  <div class="steps">
    <svg class="steps-line" viewBox="0 0 20 600" preserveAspectRatio="none" aria-hidden="true"><path d="M10 0 V600" /></svg>
    ${steps.map(([t, d], i) => `<div class="step" data-step><span class="step-dot">${i + 1}</span><div><b>${t}</b><p>${d}</p></div></div>`).join("")}
  </div>
  <p class="lead-text">AI допомагає структурувати повідомлення й задачі. Остаточні домовленості та якість контролюю я. Система не приймає платежі, не погоджує ціни й не змінює рекламний бюджет без правил і авторизації.</p>
</section>`;

const ads = `
<section class="section ads" id="ads">
  <p class="eyebrow">06 · Контроль реклами <span class="badge-demo">Демо звіту</span></p>
  <h2 data-split>Бюджет — це стеля</h2>
  <p class="lead-text">Починаю з Facebook та Instagram через Meta Ads. Наперед погоджуємо стоп-умови й рахуємо кожен етап окремо.</p>
  <div class="gauge" aria-label="Демо: витрати не перевищують погоджену стелю">
    <div class="gauge-bar"><i data-gauge></i></div>
    <div class="gauge-limit"><span>стеля бюджету</span></div>
    <div class="gauge-legend"><span>витрачено</span><span>стоп-умова</span></div>
  </div>
  <ol class="funnel">
    ${["Заявки", "Кваліфіковані заявки", "Записи", "Проведені консультації", "Оплати"].map((t, i) => `<li data-funnel style="--w:${100 - i * 16}%"><span>${t}</span></li>`).join("")}
  </ol>
  <p class="small">Рахуємо джерело, країну, дати, результат і причину відмови. Не обираємо «переможця» за кількома випадковими конверсіями. Google Ads — наступний напрям.</p>
</section>`;

const faqHtml = `
<section class="section" id="faq">
  <p class="eyebrow">07 · Питання</p>
  <h2 data-split>Коротко про важливе</h2>
  ${faq.map(([q, a]) => `<details class="faq"><summary>${q}<i class="svc-plus" aria-hidden="true"></i></summary><div class="svc-body"><div class="svc-inner"><p>${a}</p></div></div></details>`).join("")}
</section>`;

const final = `
<section class="final" id="contact">
  <div class="final-card" data-final>
    <div class="final-mono" aria-hidden="true">ВГ</div>
  </div>
  <h2 class="final-title" data-split>Розкажіть, що зараз забирає час у вашому бізнесі.</h2>
  <p class="lead-text">Запропоную перший конкретний крок.</p>
  ${tg("final", "Написати Вадиму в Telegram", "btn btn-primary btn-wide btn-magnetic")}
  <p class="hint">Напишіть: «потрібен сайт», «потрібні відео» або «потрібен бот».</p>
  <button class="copy" type="button" data-copy="${contact.handle}">Скопіювати ${contact.handle}</button>
  <footer class="foot">DevGuide · Вадим Гук · <a href="https://devguide.com.ua/" target="_blank" rel="noopener">devguide.com.ua</a></footer>
</section>`;

const sticky = `<div class="sticky">${tg("sticky", "Написати в Telegram", "btn btn-primary btn-wide")}</div>`;

export function page() {
  return `<div class="noise" aria-hidden="true"></div>
<main class="page">
${hero}
${marquee(["Лендинги", "Магазини", "Вертикальні відео", "Telegram-боти", "AI + Trello", "Meta Ads", "Аналітика"])}
${choose}
${work}
${auto}
${marquee(["Один партнер", "Погоджений кошторис", "Проміжний результат", "Запуск", "Супровід"])}
${svc}
${how}
${ads}
${faqHtml}
${final}
</main>
${sticky}`;
}
