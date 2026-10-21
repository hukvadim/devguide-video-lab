# Agent demo: тестовий сценарій (A: Windows-MCP, B: Power Automate Desktop)

Підготовка: робочий стіл чистий, Chrome і VS Code закриті, сповіщення вимкнені (Focus assist).
Старт: Recordly REC → камера REC → `run.ps1` (або Run flow у PAD). Beep = маркер синхронізації.

| # | Репліка (голос, ~сек) | Дія на екрані | Пауза |
|---|---|---|---|
| 0 | — | beep, `start` у log.txt | 2 |
| 1 | «Відкриваю сайт DevGuide» (3) | Chrome → devguide.com.ua | 4 |
| 2 | «Тепер редактор і новий файл» (3) | VS Code → `Desktop\hello.html` | 4 |
| 3 | «Пишу три рядки HTML» (4) | друк HTML | 2 |
| 4 | «Зберігаю й дивлюся в браузері» (3) | Ctrl+S → відкрити файл у Chrome | 4 |
| 5 | «Міняю заголовок» (3) | Alt+Tab у VS Code → змінити h1 → Ctrl+S | 2 |
| 6 | «Оновлюю — готово» (3) | Alt+Tab у Chrome → F5 | 4 |
| 7 | «І назад» (2) | Alt+Tab, `end` у log.txt | 2 |

Паузу можна підігнати під реальний голос: правиш `$pause` у `run.ps1`.
