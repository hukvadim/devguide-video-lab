# Take: taskbar Chrome -> new tab -> claude.ai -> account menu -> apps -> scroll -> Download for Windows -> Save -> Downloads -> launch installer. Mouse only, no shortcuts on screen.
# Records primary screen (1920x1080 @0,0) with ffmpeg while the script drives mouse/keyboard. Coords calibrated 2026-10-20, Chrome maximized, 100% scale.
param([switch]$NoLaunch, [switch]$NoRecord)
$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot
$log = "$dir\log.txt"
$rec = "$dir\..\screen-rec"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$sh = New-Object -ComObject WScript.Shell
Add-Type @"
using System; using System.Runtime.InteropServices;
public class P { [StructLayout(LayoutKind.Sequential)] public struct PT { public int X, Y; }
[DllImport("user32.dll")] public static extern bool GetCursorPos(out PT p);
[DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
[DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, int d, IntPtr e);
[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, System.Text.StringBuilder s, int n); }
"@
function Mark($what) { Add-Content $log "$what $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())" }
function Glide([int]$x, [int]$y, [int]$ms = 800) {
  $p = New-Object P+PT; [P]::GetCursorPos([ref]$p) | Out-Null
  $n = [Math]::Max(1, [int]($ms / 16))
  for ($i = 1; $i -le $n; $i++) {
    $t = $i / $n; $e = if ($t -lt 0.5) { 4 * $t * $t * $t } else { 1 - [Math]::Pow(-2 * $t + 2, 3) / 2 }
    [P]::SetCursorPos([int]($p.X + ($x - $p.X) * $e), [int]($p.Y + ($y - $p.Y) * $e)) | Out-Null
    Start-Sleep -Milliseconds 16
  }
}
# Abort instead of clicking/typing into a wrong window (e.g. Chrome profile picker)
function Guard([string]$expect) {
  $sb = New-Object Text.StringBuilder 512; [P]::GetWindowText([P]::GetForegroundWindow(), $sb, 512) | Out-Null
  if ($sb.ToString() -notlike "*$expect*") { if ($ff) { $ff.StandardInput.Write('q'); $ff.WaitForExit(5000) | Out-Null }; throw "Foreground is '$sb', expected '$expect'" }
}
function Click([int]$x, [int]$y, [string]$label, [int]$ms = 800) { Glide $x $y $ms; Start-Sleep -Milliseconds 150; & "$rec\click.ps1" $x $y $label -log $log }

# Clean start: a previous file would trigger Chrome's "replace?" prompt
Remove-Item "$env:USERPROFILE\Downloads\Claude Setup*.exe" -ErrorAction SilentlyContinue
Set-Content $log ""
[P]::SetCursorPos(1400, 700) | Out-Null


$ff = $null
if (-not $NoRecord) {
  $ff = New-Object Diagnostics.Process
  $ff.StartInfo.FileName = 'ffmpeg'
  $ff.StartInfo.Arguments = "-y -loglevel error -f gdigrab -framerate 30 -draw_mouse 1 -offset_x 0 -offset_y 0 -video_size 1920x1080 -i desktop -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p `"$dir\raw.mkv`""
  $ff.StartInfo.UseShellExecute = $false; $ff.StartInfo.RedirectStandardInput = $true; $ff.StartInfo.CreateNoWindow = $true
  $ff.Start() | Out-Null; Start-Sleep 1
}
[console]::beep(1000, 300); Mark start; Start-Sleep 1

# 1. Bring Chrome up from the taskbar (a click on an already active window would minimize it)
$sb = New-Object Text.StringBuilder 512; [P]::GetWindowText([P]::GetForegroundWindow(), $sb, 512) | Out-Null
if ($sb.ToString() -notlike '*Google Chrome*') { Click 565 1056 taskbar 1000; Start-Sleep 1.2 }
Guard 'Google Chrome'
# 2. New tab with "+", then type the address
Click 292 20 newtab 900; Start-Sleep 1
Click 700 62 address 700; Start-Sleep 0.3; Guard 'New Tab'
& "$rec\type.ps1" -text 'https://claude.ai/' -delayMs 90 -log $log; $sh.SendKeys('{DEL}'); Start-Sleep -Milliseconds 400
$sh.SendKeys('{ENTER}'); Mark enter; Start-Sleep 4.5

# 2. Account menu -> Get apps and extensions
Guard 'Claude'; Click 80 1008 account 1000; Start-Sleep 1.2
Click 150 893 apps 700; Start-Sleep 3

# 3. Smooth scroll to the Claude Code card
Glide 1600 600 600; Mark scroll
for ($i = 0; $i -lt 15; $i++) { [P]::mouse_event(0x800, 0, 0, -20, [IntPtr]::Zero); Start-Sleep -Milliseconds 70 }
Start-Sleep 1.5

# 4. Download for Windows -> Save dialog
Guard 'Claude'; Click 1265 662 download 900; Start-Sleep 2.5
Guard 'Збереження'
Click 1018 733 save 900; Start-Sleep 4

# 5. Downloads panel
Click 300 700 dismiss 900; Start-Sleep 0.8   # close the auto-opened bubble with a click on empty page area
Guard 'Claude'; Click 1825 63 downloads 900; Start-Sleep 1.5
if (-not $NoLaunch) { Click 1630 150 launch 900; Start-Sleep 7 } else { Glide 1630 150 700; Mark hover; Start-Sleep 2.5 }

Mark end
if ($ff) { $ff.StandardInput.Write('q'); $ff.WaitForExit(15000) | Out-Null }
