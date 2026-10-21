@echo off
rem Open the screen-take control panel on the side monitor (scene list, device check, record/pause/stop, "Next", teleprompter).
rem An already open panel is closed first, so there is only one.
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='powershell.exe'\" | Where-Object CommandLine -like '*screen-take*panel.ps1*' | ForEach-Object { Stop-Process -Id $_.ProcessId }"
start "" powershell -NoProfile -STA -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0.claude\skills\screen-take\panel.ps1"
