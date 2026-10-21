"""Transcribe a take's mic track and build a ready-to-paste prompt for editing.

usage: python transcribe.py <take base path without extension>   e.g. .../public/ideas/superpowers/take-01
writes <base>.txt (plain text), <base>.srt (timed), <base>.prompt.md (paths + idea + beats + transcript).
Runs on CPU (faster-whisper medium, int8): roughly real time, so rec.ps1 starts it in the background after stop.
"""
import re
import sys
from pathlib import Path

from faster_whisper import WhisperModel

base = Path(sys.argv[1])
d, name = base.parent, base.name
audio = Path(f"{base}-mic.wav")
if not audio.exists():
    audio = Path(f"{base}-cam.mp4")  # no USB mic: the phone audio in the camera file still has the voice


def ts(t):
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02}:{int(m):02}:{s:06.3f}".replace(".", ",")


model = WhisperModel("medium", device="cpu", compute_type="int8")
segments, _ = model.transcribe(str(audio), language="uk", vad_filter=True, beam_size=5)
segments = list(segments)

text = "\n".join(s.text.strip() for s in segments)
Path(f"{base}.txt").write_text(text + "\n", encoding="utf-8")
Path(f"{base}.srt").write_text(
    "\n".join(f"{i}\n{ts(s.start)} --> {ts(s.end)}\n{s.text.strip()}\n" for i, s in enumerate(segments, 1)),
    encoding="utf-8",
)

# idea = intro section of the teleprompter; beats = what the panel's "Далі" did
idea = ""
prompter = d / "prompter.txt"
if prompter.exists():
    m = re.search(r"^## 0[^\n]*\n(.*?)(?=^## |\Z)", prompter.read_text(encoding="utf-8"), re.S | re.M)
    idea = (m.group(1) if m else "").strip()
beats = []
if (d / "beats.txt").exists():
    beats = [l.split("|")[0].strip() for l in (d / "beats.txt").read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]

files = [p for p in (Path(f"{base}.mp4"), Path(f"{base}-cam.mp4"), Path(f"{base}-voice.wav"), Path(f"{base}-mic.wav"), Path(f"{base}.log"), Path(f"{base}.srt")) if p.exists()]
prompt = f"""Змонтуй відео з дубля «{d.name}/{name}» (скіл devguide-reel).

Як працювати:
1. Спершу прочитай текст нижче і .srt: знайди повтори, обірвані фрази, дублі одного речення, бери найкращий дубль, решту виріж. Паузи довші за ~0.4 с прибери.
2. Формат 9:16, 1080x1920, до 60 с (Instagram). 16:9 — тільки якщо попрошу.
3. Прийоми (міксуй, не все одразу):
   - моє обличчя на весь екран + великі субтитри по словах (завжди є субтитри);
   - спліт: зверху екран (зум на клік за .log), знизу я; або екран на весь кадр з моїм кружечком;
   - графічні картки, що спливають поруч/за мною (UI-макет, цифра, назва скіла, таймлайн), великий 3D-заголовок за спиною на ключовому слові;
   - переходи на склейках (whip, flash, «клац» камери), SFX лише на події, музика тихо під голос.
4. Зроби варіанти, кожен окремим файлом у out/<сцена>/:
   - Instagram A і B: різний хук і ритм, кінцівка «напиши СЛОВО в коментарях» (слово спитай, якщо не вказане нижче);
   - Бот A і B (Telegram/DevGuide-крок): без заклику коментувати, кінцівка — наступний крок навчання.
   Спершу покажи обкладинку й 2 кадри кожного варіанта, потім рендер.

Файли:
{chr(10).join(f"- {p}" for p in files)}

Доріжки синхронні й однакові за довжиною: екран (основний монітор), камера телефона (є звук телефона як опора), сирий звук з USB-мікрофона (-mic.wav) і вже оброблений голос (-voice.wav: зріз гулу, компресор, де-есер, -14 LUFS / -1.5 dBTP). Для монтажу бери -voice.wav, повторно гучність не нормалізуй.
У .log: кліки з координатами (для зумів), beats («Далі»), паузи; час у мс від epoch, `start` = біп.

Ідея сцени:
{idea or "(немає prompter.txt)"}

Кроки на екрані: {" → ".join(beats) if beats else "(без beats)"}

Що я сказав (Whisper, може мати помилки в термінах):
{text}
"""
Path(f"{base}.prompt.md").write_text(prompt, encoding="utf-8")
print(f"done {base}.prompt.md")
