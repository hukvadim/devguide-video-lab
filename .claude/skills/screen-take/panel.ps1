# Control panel on the side monitor (the non-primary one): record/pause/stop, track indicators, "Далі" beats, teleprompter.
# Everything goes through rec.ps1 / do.ps1, so Claude and the panel share one state. Stays open between takes; X closes it.
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
# Launched with -WindowStyle Hidden (no console), which would also hide the form: show it explicitly on the first tick
Add-Type @'
using System; using System.Runtime.InteropServices;
public class SW {
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [StructLayout(LayoutKind.Sequential)] public struct PT { public int X, Y; }
  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, int m, IntPtr w, ref PT p);
  public static int GetY(IntPtr h) { var p = new PT(); SendMessage(h, 0x4DD, IntPtr.Zero, ref p); return p.Y; }
  public static void SetY(IntPtr h, int y) { var p = new PT(); p.Y = y; SendMessage(h, 0x4DE, IntPtr.Zero, ref p); }
}
'@
$root = $PSScriptRoot
# global hotkeys (work while the mouse is busy): F9 = hold/continue the scenario, F10 = next beat now, F11 = reread the current section, Alt+0..9 = jump to section N
Add-Type -ReferencedAssemblies System.Windows.Forms @'
using System; using System.Windows.Forms; using System.Runtime.InteropServices;
public class HK : NativeWindow {
  [DllImport("user32.dll")] static extern bool RegisterHotKey(IntPtr h, int id, uint mod, uint vk);
  public static int Last;
  public HK() { CreateHandle(new CreateParams()); RegisterHotKey(Handle, 1, 0, 0x78); RegisterHotKey(Handle, 2, 0, 0x79); RegisterHotKey(Handle, 3, 0, 0x7A); for (int n = 0; n < 10; n++) RegisterHotKey(Handle, 10 + n, 1, (uint)(0x30 + n)); }
  protected override void WndProc(ref Message m) { if (m.Msg == 0x312) Last = (int)m.WParam; base.WndProc(ref m); }
}
'@
$hk = New-Object HK
function Rec($op) { & powershell -NoProfile -ExecutionPolicy Bypass -File "$root\rec.ps1" $op 2>&1 | Out-String }
function TakeDir { if (Test-Path "$root\.state") { (Get-Content "$root\.state" -Raw).Trim() } }
# Status straight from flag files: spawning rec.ps1 twice a second would be heavy
function Status { if (-not (Test-Path "$root\.ffpid")) { return 'idle' }; if (Test-Path "$(TakeDir)\.pause") { 'paused' } else { 'recording' } }

$C = @{ bg = [Drawing.Color]::FromArgb(24, 24, 27); card = [Drawing.Color]::FromArgb(39, 39, 42); lime = [Drawing.Color]::FromArgb(214, 255, 61)
        red = [Drawing.Color]::FromArgb(255, 90, 90); amber = [Drawing.Color]::FromArgb(255, 200, 80); green = [Drawing.Color]::FromArgb(110, 220, 140)
        blue = [Drawing.Color]::FromArgb(45, 100, 220); grey = [Drawing.Color]::FromArgb(140, 140, 150) }
function Font($size, $bold = $false) { New-Object Drawing.Font 'Segoe UI', $size, $(if ($bold) { [Drawing.FontStyle]::Bold } else { [Drawing.FontStyle]::Regular }) }
function Btn($text, $x, $y, $w, $h, $size = 12, $bold = $false) {
  $b = New-Object Windows.Forms.Button; $b.Text = $text; $b.Location = New-Object Drawing.Point $x, $y; $b.Size = New-Object Drawing.Size $w, $h
  $b.Font = Font $size $bold; $b.FlatStyle = 'Flat'; $b.FlatAppearance.BorderSize = 0; $b.BackColor = $C.card; $b.ForeColor = 'White'; $f.Controls.Add($b); $b
}
function Lbl($text, $x, $y, $w, $h, $size = 11, $bold = $false) {
  $l = New-Object Windows.Forms.Label; $l.Text = $text; $l.Location = New-Object Drawing.Point $x, $y; $l.Size = New-Object Drawing.Size $w, $h
  $l.Font = Font $size $bold; $l.ForeColor = $C.grey; $f.Controls.Add($l); $l
}

$side = [Windows.Forms.Screen]::AllScreens | Where-Object { -not $_.Primary } | Select-Object -First 1
if (-not $side) { $side = [Windows.Forms.Screen]::PrimaryScreen }
$f = New-Object Windows.Forms.Form
$f.Text = 'Запис'; $f.TopMost = $true; $f.FormBorderStyle = 'FixedToolWindow'; $f.StartPosition = 'Manual'
$f.Size = New-Object Drawing.Size 600, 945; $f.BackColor = $C.bg
$wa = $side.WorkingArea; $f.Location = New-Object Drawing.Point ($wa.Left + 30), ($wa.Top + 30)

$lblState = Lbl 'Готово до запису' 18 8 440 34 16 $true
$lblScene = Lbl '' 18 52 560 22 10; $lblScene.Visible = $false
# scene picker: folders in public/ideas with beats.txt or prompter.txt; the choice goes to .state so rec/do/panel agree
$ideas = (Resolve-Path "$root\..\..\..\public\ideas").Path
$cmb = New-Object Windows.Forms.ComboBox; $cmb.DropDownStyle = 'DropDownList'; $cmb.Location = '18,572'; $cmb.Size = '300,30'; $cmb.Font = Font 12
$cmb.BackColor = $C.card; $cmb.ForeColor = 'White'; $f.Controls.Add($cmb)
function Scenes { Get-ChildItem $ideas -Directory | Where-Object { (Test-Path "$($_.FullName)\beats.txt") -or (Test-Path "$($_.FullName)\prompter.txt") } | Sort-Object LastWriteTime -Descending | ForEach-Object Name }
$cmb.Items.AddRange(@(Scenes)); $cur = if (TakeDir) { Split-Path (TakeDir) -Leaf }; if ($cur -and $cmb.Items.Contains($cur)) { $cmb.SelectedItem = $cur } elseif ($cmb.Items.Count) { $cmb.SelectedIndex = 0 }
$cmb.Add_SelectedIndexChanged({ if ((Status) -eq 'idle' -and $cmb.SelectedItem) { Set-Content "$root\.state" "$ideas\$($cmb.SelectedItem)" } })
if ($cmb.SelectedItem -and (Status) -eq 'idle') { Set-Content "$root\.state" "$ideas\$($cmb.SelectedItem)" }
$btnCheck = Btn 'Перевірити' 326 570 126 34 10 $true
$btnQr = Btn 'QR телефона' 458 570 120 34 10 $true
$lblDev = Lbl 'мікрофон і телефон: натисни «Перевірити»' 18 608 560 22 10
# devices: the mic from config.json among DirectShow inputs, the phone among adb devices (saved address, then mDNS)
function CheckDevices {
  $lblDev.Text = 'перевіряю…'; $lblDev.ForeColor = $C.grey; $f.Refresh()
  $cfg = Get-Content "$root\config.json" -Raw | ConvertFrom-Json
  $micOk = [bool](cmd /c "ffmpeg -hide_banner -list_devices true -f dshow -i dummy 2>&1" | Select-String ([regex]::Escape("`"$($cfg.mic)`"")))
  adb connect $cfg.phone 2>&1 | Out-Null
  if (-not (adb devices | Select-String '\s+device$')) { adb mdns services 2>&1 | Select-String '_adb-tls-connect' | ForEach-Object { if ("$_" -match '(\d+\.\d+\.\d+\.\d+:\d+)') { adb connect $Matches[1] 2>&1 | Out-Null } } }
  $phoneOk = [bool](adb devices | Select-String '\s+device$')
  $lvl = ''
  if ($micOk) {
    $lblDev.Text = 'скажи щось у мікрофон (2 с)…'; $f.Refresh()
    $vd = cmd /c "ffmpeg -hide_banner -f dshow -i audio=`"$($cfg.mic)`" -t 2 -af volumedetect -f null - 2>&1"
    $mx = ($vd | Select-String 'max_volume: (-?[\d.]+)').Matches.Groups[1].Value
    if ($mx) { $v = [double]$mx; $lvl = if ($v -lt -30) { "  · пік $v dB: тихо, ближче до мікрофона" } elseif ($v -gt -1) { "  · пік $v dB: зашкалює, тихіше" } else { "  · пік $v dB: ок" }; if ($v -lt -30 -or $v -gt -1) { $micOk = $false } }
  }
  $lblDev.Text = "$(if ($micOk) { '✔' } else { '✖' }) мікрофон $($cfg.mic)$lvl    $(if ($phoneOk) { '✔ телефон (1080p)' } else { '✖ телефон: увімкни «Налагодження через Wi-Fi» або QR (буде 720p)' })"
  $lblDev.ForeColor = if ($micOk -and $phoneOk) { $C.green } else { $C.amber }
}
$btnPrompt = Btn 'Промпт' 410 630 168 30 10 $true
$btnPrompt.Add_Click({ $p = Get-ChildItem "$(TakeDir)\take-*.prompt.md" -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -Last 1; if ($p) { Set-Clipboard -Value (Get-Content $p.FullName -Raw -Encoding UTF8); $btnPrompt.Text = '✔ скопійовано' } })
$btnDir = Btn 'Відкрити папку' 452 8 126 32 10 $true
$btnDir.Add_Click({ $d = TakeDir; if ($d -and (Test-Path $d)) { Start-Process explorer.exe $d } })
$btnCheck.Add_Click({ CheckDevices })
$btnQr.Add_Click({ Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoProfile -STA -ExecutionPolicy Bypass -File `"$root\pair-qr.ps1`"" })
$trk = @{}; $tx = 18
foreach ($k in 'screen', 'cam', 'mic') { $trk[$k] = Lbl "● $(@{screen='Екран';cam='Камера';mic='Мікрофон'}[$k])" $tx 634 130 24 11 $true; $tx += 130 }

$btnMain = Btn '● Почати запис' 18 668 560 70 18 $true
$btnBack = Btn '◀ Назад' 18 746 112 76 11 $true
$btnRetake = Btn '↻ Дубль' 136 746 112 76 11 $true
$btnNext = Btn 'Далі ▶' 254 746 214 76 13 $true
$btnStop = Btn '⏹ Стоп' 474 746 104 76 12 $true
$btnDiscard = Btn '✖ Стоп без збереження (видалити запис)' 18 828 560 34 10 $true
$lblKeys = Lbl "Гарячі клавіші:  F9 пауза мишки · F10 далі · F11 секція спочатку`nAlt+0…9 перейти на секцію (без мишки)" 18 868 560 44 10 $true; $lblKeys.ForeColor = $C.lime

# --- teleprompter: <take dir>\prompter.txt, sections "## N" follow the beats ---
$rtb = New-Object Windows.Forms.RichTextBox
$rtb.Location = '18,46'; $rtb.Size = '560,410'; $rtb.ReadOnly = $true; $rtb.BorderStyle = 'None'; $rtb.ScrollBars = 'None'
$rtb.BackColor = [Drawing.Color]::Black; $rtb.ForeColor = 'White'; $rtb.Font = Font 22 $true; $rtb.DetectUrls = $false
$f.Controls.Add($rtb)
$btnPlay = Btn '▶ Старт' 18 464 150 44 13 $true
$btnSlow = Btn 'повільніше' 176 464 120 44 10
$btnFast = Btn 'швидше' 304 464 100 44 10
$btnFm = Btn 'A−' 412 464 80 44 12 $true
$btnFp = Btn 'A+' 498 464 80 44 12 $true
$lblSpeed = Lbl '' 18 512 560 20 9
# auto scenario: after «Говори!» beats run by themselves with a speaking gap between them; F9 holds everything
$chkAuto = New-Object Windows.Forms.CheckBox; $chkAuto.Text = 'Авто-сценарій'; $chkAuto.Location = '18,536'; $chkAuto.Size = '170,28'; $chkAuto.Font = Font 11 $true; $chkAuto.ForeColor = 'White'; $f.Controls.Add($chkAuto)
$btnGapM = Btn '−' 190 534 34 30 12 $true
$lblGap = Lbl '' 226 540 110 22 10
$btnGapP = Btn '+' 338 534 34 30 12 $true
$btnHold = Btn '❚❚ Сценарій (F9)' 380 534 198 30 10 $true
# 3-2-1 over the teleprompter once every recorder is up (after start and after resume), so Vadim starts on cue
$lblCd = New-Object Windows.Forms.Label; $lblCd.Location = $rtb.Location; $lblCd.Size = $rtb.Size; $lblCd.TextAlign = 'MiddleCenter'
$lblCd.Font = Font 120 $true; $lblCd.BackColor = [Drawing.Color]::Black; $lblCd.ForeColor = $C.lime; $lblCd.Visible = $false; $f.Controls.Add($lblCd); $lblCd.BringToFront()
$script:cdStart = $null; $script:ready = $false

# font/speed survive restarts in .panel.json (scene lives in .state)
$script:set = if (Test-Path "$root\.panel.json") { Get-Content "$root\.panel.json" -Raw | ConvertFrom-Json } else { [pscustomobject]@{ font = 22; speed = 0.8; auto = $false; gap = 5 } }
$rtb.Font = Font $script:set.font $true
function SaveSet { [pscustomobject]@{ font = [int]$rtb.Font.Size; speed = $script:speed; auto = $chkAuto.Checked; gap = $script:gap } | ConvertTo-Json | Set-Content "$root\.panel.json" }
$script:gap = if ($null -ne $script:set.gap) { [int]$script:set.gap } else { 5 }; $chkAuto.Checked = if ($null -ne $script:set.auto) { [bool]$script:set.auto } else { $true }; $lblGap.Text = "пауза $($script:gap) с"
$script:speed = [double]$script:set.speed; $script:playing = $false; $script:py = 0.0; $script:pfile = $null; $script:pmtime = $null
function LoadPrompter {
  $d = TakeDir; $p = if ($d) { "$d\prompter.txt" }
  if (-not $p -or -not (Test-Path $p)) { if ($script:pfile -ne 'none') { $rtb.Text = '(немає prompter.txt у папці сцени)'; $script:pfile = 'none' }; return }
  $m = (Get-Item $p).LastWriteTime
  if ($p -eq $script:pfile -and $m -eq $script:pmtime) { return }
  $script:pfile = $p; $script:pmtime = $m
  $rtb.Text = "`n" + ((Get-Content $p -Encoding UTF8) -join "`n") + "`n`n`n`n`n"
  foreach ($mt in [regex]::Matches($rtb.Text, '(?m)^## .*$')) { $rtb.Select($mt.Index, $mt.Length); $rtb.SelectionColor = $C.lime; $rtb.SelectionFont = Font 13 $true }
  $rtb.Select(0, 0); $script:py = 0; [SW]::SetY($rtb.Handle, 0)
}
function Heads { [regex]::Matches($rtb.Text, '(?m)^## .*$') }
function JumpTo($k) {   # k = heading index (0 = intro, last = outro)
  $hs = Heads; if ($k -ge $hs.Count) { return }; $mt = $hs[$k]
  $pos = $rtb.GetPositionFromCharIndex($mt.Index)
  $script:py = [Math]::Max(0, [SW]::GetY($rtb.Handle) + $pos.Y - 10); [SW]::SetY($rtb.Handle, [int]$script:py)
}
function RestartSection { JumpTo (BeatIdx); $script:playing = $true; $btnPlay.Text = '❚❚ Пауза' }   # F11: reread this section from its start
function GoSection($n) {   # Alt+N: pointer and prompter to section N without running any mouse beat
  if ($script:job -and -not $script:job.HasExited) { return }
  if ($n -ge (Heads).Count -or -not (TakeDir)) { return }
  Set-Content "$(TakeDir)\.beat" $n; JumpTo $n; $script:playing = $true; $btnPlay.Text = '❚❚ Пауза'
}
function SpeedText { $lblSpeed.Text = "швидкість {0:N1}  ·  шрифт {1}  ·  F9 пауза · F10 далі · F11 секція спочатку · Alt+0…9 перехід" -f $script:speed, [int]$rtb.Font.Size }
$btnPlay.Add_Click({ $script:playing = -not $script:playing; $script:py = [SW]::GetY($rtb.Handle); $btnPlay.Text = $(if ($script:playing) { '❚❚ Пауза' } else { '▶ Старт' }) })
$btnSlow.Add_Click({ $script:speed = [Math]::Max(0.2, $script:speed - 0.2); SpeedText; SaveSet })
$btnFast.Add_Click({ $script:speed = [Math]::Min(6, $script:speed + 0.2); SpeedText; SaveSet })
$btnFm.Add_Click({ $rtb.Font = Font ([Math]::Max(14, $rtb.Font.Size - 2)) $true; $script:pfile = $null; LoadPrompter; SpeedText; SaveSet })
$btnFp.Add_Click({ $rtb.Font = Font ([Math]::Min(48, $rtb.Font.Size + 2)) $true; $script:pfile = $null; LoadPrompter; SpeedText; SaveSet })
$scroll = New-Object Windows.Forms.Timer; $scroll.Interval = 30
$scroll.Add_Tick({
  if ($script:cdStart) { $e = ((Get-Date) - $script:cdStart).TotalSeconds; if ($e -lt 3) { $lblCd.Text = [string](3 - [int][Math]::Floor($e)); $lblCd.Visible = $true } elseif ($e -lt 3.8) { $lblCd.Font = Font 64 $true; $lblCd.Text = 'Говори!' } else { $lblCd.Visible = $false; $lblCd.Font = Font 120 $true; $script:cdStart = $null; $script:autoNext = (Get-Date).AddSeconds($script:gap); $script:playing = $true; $script:py = [SW]::GetY($rtb.Handle); $btnPlay.Text = '❚❚ Пауза' } }   # prompter rolls on «Говори!» and stops at the end of the section
  if ([HK]::Last) { $k = [HK]::Last; [HK]::Last = 0; if ($k -eq 1) { ToggleHold } elseif ($k -eq 2 -and (Status) -eq 'recording' -and -not (Holding)) { RunNext } elseif ($k -eq 3) { RestartSection } elseif ($k -ge 10 -and $k -le 19) { GoSection ($k - 10) } }
  if ($script:playing) {
    # the prompter stops when the next section heading reaches the bottom: the next section starts only on «Далі»
    $hs = Heads; $nx = (BeatIdx) + 1
    $stop = $false; if ($nx -lt $hs.Count) { $stop = ($rtb.GetPositionFromCharIndex($hs[$nx].Index).Y -lt ($rtb.Height - 40)) } else { $stop = ($rtb.GetPositionFromCharIndex([Math]::Max(0, $rtb.Text.TrimEnd().Length - 1)).Y -lt ($rtb.Height - 70)) }   # last section: stop when the final line is visible
    if (-not $stop) { $script:py += $script:speed; [SW]::SetY($rtb.Handle, [int]$script:py) }
  }
  # auto: next beat when the previous one finished and the speaking gap passed
  if ($script:job -and $script:job.HasExited) { $script:job = $null; $script:autoNext = (Get-Date).AddSeconds($script:gap) }
  if ($chkAuto.Checked -and $script:autoNext -and -not $script:cdStart -and (Get-Date) -ge $script:autoNext -and (Status) -eq 'recording' -and -not (Holding) -and -not $script:job) { $script:autoNext = $null; RunNext }
})
$scroll.Start()

# --- beats: <take dir>\beats.txt, "Назва | do.ps1 cmd | cmd ..." ---
$script:job = $null; $script:startJob = $null
function Beats { $d = TakeDir; if ($d -and (Test-Path "$d\beats.txt")) { @(Get-Content "$d\beats.txt" -Encoding UTF8 | Where-Object { $_.Trim() -and -not $_.StartsWith('#') -and -not $_.StartsWith('@') }) } else { @() } }
function BeatIdx { $p = "$(TakeDir)\.beat"; if (Test-Path $p) { [int](Get-Content $p) } else { 0 } }
function Steps { [Math]::Max((Beats).Count, [Math]::Max(0, (Heads).Count - 1)) }   # beats, plus text-only sections at the end
function StartBeat($i) {
  $all = Beats; if ($i -lt 0 -or $i -ge $all.Count) { return }
  $parts = $all[$i] -split '\|' | Select-Object -Skip 1 | ForEach-Object { '"' + $_.Trim() + '"' }
  $script:job = Start-Process powershell -PassThru -WindowStyle Hidden -ArgumentList (@('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$root\do.ps1`"", "`"mark beat $($i + 1)`"") + $parts)
}
function RunNext {
  if ($script:job -and -not $script:job.HasExited) { return }
  $i = BeatIdx; if ($i -ge (Steps)) { return }
  Set-Content "$(TakeDir)\.beat" ($i + 1)
  JumpTo ($i + 1)
  StartBeat $i
}
$btnNext.Add_Click({ RunNext })
# back: only moves the beat pointer and the prompter (nothing on screen is undone), to redo a step or reread a section
$btnBack.Add_Click({
  if ($script:job -and -not $script:job.HasExited) { return }
  $i = BeatIdx; if ($i -le 0) { return }
  Set-Content "$(TakeDir)\.beat" ($i - 1); JumpTo ($i - 1)
})
# retake: log a marker (for cutting later), reread the current section, run the current beat's mouse again; the recording keeps going
$script:retakes = 0
$btnRetake.Add_Click({
  $d = TakeDir; if (-not $d -or (Status) -ne 'recording' -or ($script:job -and -not $script:job.HasExited)) { return }
  $i = BeatIdx; $script:retakes++
  Add-Content "$d\log.txt" "retake $i $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())" -Encoding UTF8 -ErrorAction SilentlyContinue
  JumpTo $i; StartBeat ($i - 1)
})
# F9 hold: do.ps1 freezes mid-move while <take>\.hold exists; prompter and auto steps wait too
function Holding { $d = TakeDir; $d -and (Test-Path "$d\.hold") }
function ToggleHold {
  $d = TakeDir; if (-not $d) { return }
  if (Holding) { Remove-Item "$d\.hold"; $script:playing = $script:wasPlaying; $script:autoNext = (Get-Date).AddSeconds(1.5); Add-Content "$d\log.txt" "hold_end $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())" -Encoding UTF8 -ErrorAction SilentlyContinue }
  else { New-Item "$d\.hold" -ItemType File -Force | Out-Null; $script:wasPlaying = $script:playing; $script:playing = $false; Add-Content "$d\log.txt" "hold $([DateTimeOffset]::Now.ToUnixTimeMilliseconds())" -Encoding UTF8 -ErrorAction SilentlyContinue }
}
$btnHold.Add_Click({ ToggleHold })
$btnDiscard.Add_Click({
  if ([Windows.Forms.MessageBox]::Show('Зупинити й видалити цей запис без збереження?', 'Запис', 'YesNo', 'Warning') -ne 'Yes') { return }
  $btnStop.Enabled = $false; $btnDiscard.Enabled = $false; $lblState.Text = 'Видаляю…'; $f.Refresh(); Rec discard | Out-Null; $script:playing = $false; $btnPlay.Text = '▶ Старт'; $lblDev.Text = 'запис видалено'; $lblDev.ForeColor = $C.amber
})
function GapText { $lblGap.Text = "пауза $($script:gap) с" }
$btnGapM.Add_Click({ $script:gap = [Math]::Max(1, $script:gap - 1); GapText; SaveSet })
$btnGapP.Add_Click({ $script:gap = [Math]::Min(30, $script:gap + 1); GapText; SaveSet })
$chkAuto.Add_CheckedChanged({ SaveSet })
$script:autoNext = $null
$btnMain.Add_Click({
  switch (Status) {
    'recording' { Rec pause | Out-Null; $script:playing = $false; $btnPlay.Text = '▶ Старт' }
    'paused' { Rec resume | Out-Null }
    'idle' {
      $d = TakeDir; if (-not $d) { return }
      $btnMain.Text = 'Запускаю камеру…'; $btnMain.Enabled = $false
      $script:startJob = Start-Process powershell -PassThru -WindowStyle Hidden -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$root\rec.ps1`" start `"$(Split-Path $d -Leaf)`""
    }
  }
})
$btnStop.Add_Click({ $btnStop.Enabled = $false; $lblState.Text = 'Зберігаю…'; $f.Refresh(); $r = Rec stop; $script:playing = $false; $btnPlay.Text = '▶ Старт'; $lblDev.Text = ($r.Trim() -split "`n")[0]; $lblDev.ForeColor = $C.green; if (TakeDir) { Start-Process explorer.exe (TakeDir) } })   # open the take folder right away

$script:t0 = $null; $script:acc = [TimeSpan]::Zero
function MicPeak($d) {
  $w = Get-ChildItem "$d\mic-*.wav" -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -Last 1; if (-not $w -or $w.Length -lt 30000) { return $null }
  try { $fs = [IO.File]::Open($w.FullName, 'Open', 'Read', 'ReadWrite'); $n = 24000; $fs.Seek(-$n, 'End') | Out-Null; $b = New-Object byte[] $n; $fs.Read($b, 0, $n) | Out-Null; $fs.Close() } catch { return $null }
  $pk = 1; for ($i = 0; $i -lt $n; $i += 8) { $s = [Math]::Abs([int][BitConverter]::ToInt16($b, $i)); if ($s -gt $pk) { $pk = $s } }
  20 * [Math]::Log10($pk / 32768)
}
function Refresh {
  LoadPrompter
  $d = TakeDir; $lblScene.Text = if ($d) { "сцена: $(Split-Path $d -Leaf)" } else { 'сцена не вибрана: скажи Claude «сцена <назва>»' }
  $s = Status
  $hold = Holding; $btnHold.Text = if ($hold) { '▶ Продовжити (F9)' } else { '❚❚ Сценарій (F9)' }; $btnHold.BackColor = if ($hold) { $C.amber } else { $C.card }; $btnHold.ForeColor = if ($hold) { 'Black' } else { 'White' }
  # tracks: green = recorder process alive
  $live = @{}; if ($d -and (Test-Path "$d\.procs")) { Get-Content "$d\.procs" | ForEach-Object { $k, $id = "$_" -split ' '; if ($k -and $id -and (Get-Process -Id $id -ErrorAction SilentlyContinue)) { $live[$k] = $true } } }
  foreach ($k in @($trk.Keys)) { $trk[$k].ForeColor = if ($live[$k]) { $C.green } elseif ($s -eq 'idle') { $C.grey } else { $C.red } }
  $starting = $script:startJob -and -not $script:startJob.HasExited
  $cmb.Enabled = ($s -eq 'idle') -and -not $starting; $btnDiscard.Enabled = ($s -ne 'idle'); $btnDiscard.ForeColor = if ($s -ne 'idle') { $C.red } else { $C.grey }
  $isReady = ($s -eq 'recording') -and $live.Count -gt 0 -and -not $starting
  if ($isReady -and -not $script:ready) {
    $script:cdStart = Get-Date; $script:retakes = 0; $script:playing = $false; JumpTo 0   # new take: counters and prompter back to the start
    # optional "@start | do.ps1 cmd | ..." in beats.txt: set the stage (e.g. front Google Chrome) before Vadim speaks
    $pre = if ($d -and (Test-Path "$d\beats.txt")) { Get-Content "$d\beats.txt" -Encoding UTF8 | Where-Object { $_.StartsWith('@start') } | Select-Object -First 1 }
    if ($pre -and -not (Test-Path "$d\.beat")) { $parts = $pre -split '\|' | Select-Object -Skip 1 | ForEach-Object { '"' + $_.Trim() + '"' }; Start-Process powershell -WindowStyle Hidden -ArgumentList (@('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$root\do.ps1`"") + $parts) }
  }; $script:ready = $isReady
  if ($s -eq 'recording') {
    $db = MicPeak $d; if ($null -ne $db) { $bars = [int][Math]::Max(0, [Math]::Min(20, ($db + 50) / 2.5)); $lblDev.Text = "мікрофон  " + ('▮' * $bars) + ('▯' * (20 - $bars)) + ("  {0:N0} dB" -f $db); $lblDev.ForeColor = if ($db -gt -1) { $C.red } elseif ($db -lt -40) { $C.grey } else { $C.green } }
    if (-not $script:t0) { $script:t0 = Get-Date }
    $lblState.Text = "● ЗАПИС  {0:mm\:ss}" -f ($script:acc + ((Get-Date) - $script:t0)); $lblState.ForeColor = $C.red
    $btnMain.Text = '❚❚  Пауза'; $btnMain.BackColor = $C.lime; $btnMain.ForeColor = 'Black'; $btnMain.Enabled = -not $starting; $btnStop.Enabled = $true
  } elseif ($s -eq 'paused') {
    if ($script:t0) { $script:acc += (Get-Date) - $script:t0; $script:t0 = $null }
    $lblState.Text = "❚❚ ПАУЗА  {0:mm\:ss}" -f $script:acc; $lblState.ForeColor = $C.amber
    $btnMain.Text = '▶  Продовжити'; $btnMain.BackColor = $C.green; $btnMain.ForeColor = 'Black'; $btnMain.Enabled = $true; $btnStop.Enabled = $true
  } else {
    $script:t0 = $null; $script:acc = [TimeSpan]::Zero
    $lblState.Text = 'Готово до запису'; $lblState.ForeColor = $C.grey
    if (-not $starting) { $btnMain.Text = '●  Почати запис'; $btnMain.Enabled = [bool]$d }
    $btnMain.BackColor = $C.red; $btnMain.ForeColor = 'White'; $btnStop.Enabled = $false
  }
  # prompt button: newest take has a .prompt.md -> copy; take without it yet -> whisper still running
  $lastTake = Get-ChildItem "$d\take-*.mp4" -ErrorAction SilentlyContinue | Where-Object Name -notlike '*-cam.mp4' | Sort-Object Name | Select-Object -Last 1
  if (-not $lastTake) { $btnPrompt.Text = 'Промпт'; $btnPrompt.Enabled = $false }
  elseif (Test-Path ($lastTake.FullName -replace '\.mp4$', '.prompt.md')) { if ($btnPrompt.Text -ne '✔ скопійовано' -or -not $btnPrompt.Tag -or $btnPrompt.Tag -ne $lastTake.Name) { if ($btnPrompt.Tag -ne $lastTake.Name) { $btnPrompt.Text = "Копіювати промпт" }; $btnPrompt.Tag = $lastTake.Name }; $btnPrompt.Enabled = $true }
  else { $btnPrompt.Text = 'текст пишеться…'; $btnPrompt.Enabled = $false; $btnPrompt.Tag = $null }
  $all = Beats; $i = BeatIdx
  $btnBack.Enabled = ($i -gt 0) -and -not ($script:job -and -not $script:job.HasExited) -and ($s -ne 'idle'); $btnBack.Text = "◀ Назад`n$i/$(Steps)"; $btnRetake.Enabled = ($s -eq 'recording') -and -not ($script:job -and -not $script:job.HasExited); $btnRetake.Text = "↻ Дубль`n$($script:retakes + 1)"
  if ($script:job -and -not $script:job.HasExited) { $btnNext.Text = '…виконую'; $btnNext.Enabled = $false }
  elseif ((Steps) -eq 0) { $btnNext.Text = '(немає beats.txt)'; $btnNext.Enabled = $false; $btnNext.BackColor = $C.card }
  elseif ($i -ge (Steps)) { $btnNext.Text = 'Сцена пройдена'; $btnNext.Enabled = $false; $btnNext.BackColor = $C.card }
  else { $nm = if ($i -lt $all.Count) { ($all[$i] -split '\|')[0].Trim() } else { ((Heads)[$i + 1].Value -replace '^## ', '') }; $btnNext.Text = "Далі ▶  $($i + 1)/$(Steps)`n$nm"; $btnNext.Enabled = $true; $btnNext.BackColor = $C.blue }
}
$timer = New-Object Windows.Forms.Timer; $timer.Interval = 500
$timer.Add_Tick({ if (-not $script:shown) { [SW]::ShowWindow($f.Handle, 5) | Out-Null; $f.TopMost = $true; $script:shown = $true }; Refresh })
$timer.Start()
SpeedText; Refresh
[Windows.Forms.Application]::Run($f)
