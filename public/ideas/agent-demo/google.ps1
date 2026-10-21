# Test take: open Chrome, Google search with smooth mouse + human-speed typing. Coords for 1920x1080 primary screen, 100% scale.
param([string]$query = 'як стати веб-розробником', [int]$resX = 260, [int]$resY = 330)
$ErrorActionPreference = 'Stop'
$log = "$PSScriptRoot\log.txt"
$rec = "$PSScriptRoot\..\screen-rec"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
Add-Type @"
using System; using System.Runtime.InteropServices;
public class P { [StructLayout(LayoutKind.Sequential)] public struct PT { public int X, Y; }
[DllImport("user32.dll")] public static extern bool GetCursorPos(out PT p);
[DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y); }
"@
function Mark($what) { Add-Content $log "$what $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())" }
# Smooth glide with ease-in-out, ~60 steps/s
function Glide([int]$x, [int]$y, [int]$ms = 700) {
  $p = New-Object P+PT; [P]::GetCursorPos([ref]$p) | Out-Null
  $n = [Math]::Max(1, [int]($ms / 16))
  for ($i = 1; $i -le $n; $i++) {
    $t = $i / $n; $e = if ($t -lt 0.5) { 4 * $t * $t * $t } else { 1 - [Math]::Pow(-2 * $t + 2, 3) / 2 }
    [P]::SetCursorPos([int]($p.X + ($x - $p.X) * $e), [int]($p.Y + ($y - $p.Y) * $e)) | Out-Null
    Start-Sleep -Milliseconds 16
  }
  Mark "move $x $y"
}

Set-Content $log ""
[P]::SetCursorPos(1500, 800) | Out-Null
[console]::beep(1000, 300); Mark start; Start-Sleep 1

Mark open; Start-Process $chrome '--new-window --window-position=0,0 --start-maximized https://www.google.com/?hl=uk'; Start-Sleep 3

Glide 850 489 900; & "$rec\click.ps1" 850 489 search -log $log; Start-Sleep -Milliseconds 400
& "$rec\type.ps1" -text $query -delayMs 90 -log $log; Start-Sleep -Milliseconds 600
(New-Object -ComObject WScript.Shell).SendKeys('{ENTER}'); Mark enter; Start-Sleep 2.5

Glide $resX $resY 1000; Mark hover; Start-Sleep 3; Mark end
