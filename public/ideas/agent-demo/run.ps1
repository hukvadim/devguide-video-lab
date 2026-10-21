# Deterministic run of scenario.md for screen recording. Keyboard only, windows focused by title: no hard-coded coords.
# ponytail: SendKeys for shortcuts, ../screen-rec/type.ps1 for visible typing. Add click.ps1 steps if a scene needs the mouse.
param([double]$speed = 1.0)
$ErrorActionPreference = 'Stop'
$log = "$PSScriptRoot\log.txt"
$type = "$PSScriptRoot\..\screen-rec\type.ps1"
$file = "$env:USERPROFILE\Desktop\hello.html"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$sh = New-Object -ComObject WScript.Shell
function Mark($what) { Add-Content $log "$what $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())" }
function Pause($s) { Start-Sleep -Milliseconds ([int]($s * 1000 / $speed)) }
function Keys($k) { $sh.SendKeys($k); Start-Sleep -Milliseconds 150 }
# VS Code auto-closes tags, so type only the opening tag + text, then jump past the auto-inserted close tag
function Line($t) { & $type -text $t -delayMs 55 -log $log; Keys '{END}{ENTER}' }
function Focus($title) {
  for ($i = 0; $i -lt 50; $i++) { if ($sh.AppActivate($title)) { Start-Sleep -Milliseconds 300; return }; Start-Sleep -Milliseconds 200 }
  throw "Window not found: $title"   # stop instead of typing into a wrong window
}

Set-Content $log ""
Set-Content $file "" -Encoding UTF8   # empty file so VS Code opens it directly

[console]::beep(1000, 300); Mark start; Pause 2

Mark s1; Start-Process $chrome '--new-window https://devguide.com.ua'; Pause 4

Mark s2; Start-Process code "--new-window `"$file`""; Focus 'hello.html - Visual Studio Code'; Pause 3

Mark s3; Line '<h1>Привіт, DevGuide'; Line '<p>Цей файл створив агент.'; Pause 2

Mark s4; Keys '^s'; Start-Process $chrome "`"$file`""; Focus 'hello.html - Google Chrome'; Pause 4

Mark s5; Focus 'hello.html - Visual Studio Code'; Keys '^{HOME}'; Keys '+{END}'; Keys '{DEL}'; & $type -text '<h1>Готово!' -delayMs 55 -log $log; Keys '^s'; Pause 2

Mark s6; Focus 'hello.html - Google Chrome'; Keys '{F5}'; Pause 4

Mark s7; Focus 'DevGuide'; Pause 2; Mark end
