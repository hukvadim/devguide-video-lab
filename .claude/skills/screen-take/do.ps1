# Screen-take actions. One call runs several steps: each argument is one command.
#   do.ps1 "click 80 1008 account" "wait 1.2" "type Chrome https://claude.ai/" "key {ENTER}"
# Commands:
#   shot [x1 y1 x2 y2]      screenshot: full screen at 50% (multiply coords by 2) or a full-res crop
#   title                   print foreground window title
#   guard <fragment>        stop if the foreground title lacks <fragment>
#   move x y [ms]           smooth glide (ease in-out)
#   click x y [label] [ms]  glide + left click, logged for zooms
#   dbl x y [label]         glide + double click
#   type <fragment> <text>  guard <fragment>, then type text letter by letter (unicode OK)
#   key <SendKeys>          e.g. {ENTER} {DEL} {ESC} {F5} ^l (avoid on camera unless asked)
#   scroll <steps> [x y]    smooth wheel; + = down, 1 step ~ 17px (15 steps ~ 250px)
#   wait <seconds>
#   front <fragment>        bring the window whose title contains <fragment> to the front (no mouse, invisible on video)
#   run <exe> [args...]     Start-Process
#   mark <label>            timestamp into the take log
# Coords: primary screen 1920x1080 at (0,0), 100% scale.
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$root = $PSScriptRoot
$state = "$root\.state"
$dir = if (Test-Path $state) { (Get-Content $state -Raw).Trim() } else { "$env:TEMP\screen-take" }
New-Item -ItemType Directory -Force $dir | Out-Null
$log = "$dir\log.txt"
$shotDir = "$env:TEMP\screen-take"; New-Item -ItemType Directory -Force $shotDir | Out-Null
$sh = New-Object -ComObject WScript.Shell
Add-Type -AssemblyName System.Drawing
if (-not ('ST' -as [type])) {
Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices;
public class ST {
 [StructLayout(LayoutKind.Sequential)] public struct PT { public int X, Y; }
 [DllImport("user32.dll")] public static extern bool GetCursorPos(out PT p);
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
 [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, int d, IntPtr e);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
 [StructLayout(LayoutKind.Sequential)] public struct KI { public ushort vk, scan; public uint flags, time; public IntPtr extra; }
 [StructLayout(LayoutKind.Explicit, Size=40)] public struct IN { [FieldOffset(0)] public uint type; [FieldOffset(8)] public KI ki; }
 [DllImport("user32.dll")] static extern uint SendInput(uint n, IN[] i, int s);
 public static void Ch(char c){ var a=new IN[2]; a[0].type=1; a[0].ki.scan=c; a[0].ki.flags=4; a[1].type=1; a[1].ki.scan=c; a[1].ki.flags=6; SendInput(2,a,Marshal.SizeOf(typeof(IN))); }
 public static string Title(){ var s=new StringBuilder(512); GetWindowText(GetForegroundWindow(), s, 512); return s.ToString(); }
}
"@
}
# F9 on the panel creates <take>\.hold: freeze right here (even mid-glide or mid-word) until it is gone
function Hold { while (Test-Path "$dir\.hold") { Start-Sleep -Milliseconds 100 } }
function Mark($what) { $s = "$what $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())"; for ($i = 0; $i -lt 20; $i++) { try { Add-Content $log $s -Encoding UTF8 -ErrorAction Stop; return } catch { Start-Sleep -Milliseconds 25 } } }
function Guard($f) { $t = [ST]::Title(); if ($t -notlike "*$f*") { throw "STOP: foreground is '$t', expected '*$f*'" } }
function Glide([int]$x, [int]$y, [int]$ms = 800) {
  $p = New-Object ST+PT; [ST]::GetCursorPos([ref]$p) | Out-Null
  $n = [Math]::Max(1, [int]($ms / 16))
  for ($i = 1; $i -le $n; $i++) {
    $t = $i / $n; $e = if ($t -lt 0.5) { 4 * $t * $t * $t } else { 1 - [Math]::Pow(-2 * $t + 2, 3) / 2 }
    Hold; [ST]::SetCursorPos([int]($p.X + ($x - $p.X) * $e), [int]($p.Y + ($y - $p.Y) * $e)) | Out-Null
    Start-Sleep -Milliseconds 16
  }
}
function Press { [ST]::mouse_event(2, 0, 0, 0, [IntPtr]::Zero); Start-Sleep -Milliseconds 60; [ST]::mouse_event(4, 0, 0, 0, [IntPtr]::Zero) }
function Shot($a) {
  $b = New-Object Drawing.Bitmap 1920, 1080; [Drawing.Graphics]::FromImage($b).CopyFromScreen(0, 0, 0, 0, $b.Size)
  $out = "$shotDir\shot.png"
  if ($a.Count -eq 4) {
    $r = New-Object Drawing.Rectangle ([int]$a[0]), ([int]$a[1]), ([int]$a[2] - [int]$a[0]), ([int]$a[3] - [int]$a[1])
    $b.Clone($r, $b.PixelFormat).Save($out); "shot (crop, full-res, origin $($a[0]),$($a[1])): $out"
  } else {
    $s = New-Object Drawing.Bitmap 960, 540; $g = [Drawing.Graphics]::FromImage($s)
    $g.InterpolationMode = 'HighQualityBicubic'; $g.DrawImage($b, 0, 0, 960, 540); $s.Save($out); "shot (50%, coords x2): $out"
  }
}

foreach ($cmd in $args) {
  $w = "$cmd".Trim() -split '\s+', 2; $op = $w[0]; $rest = if ($w.Count -gt 1) { $w[1] } else { '' }
  $p = if ($rest) { $rest -split '\s+' } else { @() }
  Hold
  switch ($op) {
    'shot'   { Shot $p }
    'title'  { "title: $([ST]::Title())" }
    'guard'  { Guard $rest }
    'move'   { Glide $p[0] $p[1] $(if ($p.Count -gt 2) { $p[2] } else { 800 }) }
    'click'  { Glide $p[0] $p[1] $(if ($p.Count -gt 3) { $p[3] } else { 800 }); Start-Sleep -Milliseconds 150; Mark "click $($p[0]) $($p[1]) $($p[2])"; Press }
    'dbl'    { Glide $p[0] $p[1] 800; Start-Sleep -Milliseconds 150; Mark "click $($p[0]) $($p[1]) $($p[2])"; Press; Start-Sleep -Milliseconds 80; Press }
    'type'   { $f, $text = $rest -split '\s+', 2; Guard $f; Mark type_start; foreach ($c in $text.ToCharArray()) { Hold; [ST]::Ch($c); Start-Sleep -Milliseconds 85 }; Mark type_end }
    'key'    { $sh.SendKeys($rest); Mark "key $rest"; Start-Sleep -Milliseconds 150 }
    'scroll' { if ($p.Count -ge 3) { Glide $p[1] $p[2] 600 }; $n = [int]$p[0]; $d = if ($n -gt 0) { -20 } else { 20 }
               Mark "scroll $n"; for ($i = 0; $i -lt [Math]::Abs($n); $i++) { [ST]::mouse_event(0x800, 0, 0, $d, [IntPtr]::Zero); Start-Sleep -Milliseconds 70 } }
    'wait'   { Start-Sleep -Milliseconds ([int]([double]$rest * 1000)) }
    'front'  { if (-not $sh.AppActivate($rest)) { throw "STOP: no window titled '*$rest*'" }; Start-Sleep -Milliseconds 300 }
    'run'    { $exe, $ra = $rest -split '\s+', 2; if ($ra) { Start-Process $exe $ra } else { Start-Process $exe } }
    'mark'   { Mark $rest }
    default  { throw "unknown command: $op" }
  }
}
"ok; title: $([ST]::Title())"
