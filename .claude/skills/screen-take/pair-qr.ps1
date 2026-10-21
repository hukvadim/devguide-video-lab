# Pair the phone for wireless adb with a QR code (no 6-digit code). Only needed when pairing was lost:
# an already-paired phone is found automatically by rec.ps1 over mDNS.
# Phone: Developer options > Wireless debugging > "Pair device with QR code" > scan the window.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
# started hidden (no console) from Phone-QR.bat, which would hide the form too: show it on the first tick
Add-Type 'using System; using System.Runtime.InteropServices; public class SWq { [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c); }'
$name = 'st-' + (Get-Random -Maximum 99999); $pass = -join ((48..57) + (97..122) | Get-Random -Count 10 | ForEach-Object { [char]$_ })
$png = "$env:TEMP\screen-take\pair.png"; New-Item -ItemType Directory -Force (Split-Path $png) | Out-Null
uvx --quiet --with 'qrcode[pil]' python -c "import qrcode,sys; qrcode.make(sys.argv[1], box_size=10, border=2).save(sys.argv[2])" "WIFI:T:ADB;S:$name;P:$pass;;" $png

$f = New-Object Windows.Forms.Form
$f.Text = 'Скануй телефоном: Налагодження через Wi-Fi > QR-код'; $f.TopMost = $true; $f.StartPosition = 'CenterScreen'; $f.ClientSize = '420,470'
$pic = New-Object Windows.Forms.PictureBox; $pic.Image = [Drawing.Image]::FromFile($png); $pic.SizeMode = 'Zoom'; $pic.Location = '10,10'; $pic.Size = '400,400'; $f.Controls.Add($pic)
$lbl = New-Object Windows.Forms.Label; $lbl.Location = '10,420'; $lbl.Size = '400,40'; $lbl.Font = New-Object Drawing.Font 'Segoe UI', 11; $lbl.Text = 'Чекаю на сканування…'; $f.Controls.Add($lbl)
$t = New-Object Windows.Forms.Timer; $t.Interval = 1000; $script:done = $false
$t.Add_Tick({
  if (-not $script:shown) { [SWq]::ShowWindow($f.Handle, 5) | Out-Null; $f.Activate(); $script:shown = $true }
  if ($script:done) { return }
  $svc = adb mdns services 2>&1 | Select-String "$name.*_adb-tls-pairing.*?(\d+\.\d+\.\d+\.\d+:\d+)"
  if (-not $svc) { return }
  $script:done = $true; $ep = $svc.Matches[0].Groups[1].Value
  $lbl.Text = "Спаровую з $ep…"; $f.Refresh()
  $r = adb pair $ep $pass 2>&1 | Out-String
  Start-Sleep 2
  adb mdns services 2>&1 | Select-String '_adb-tls-connect' | ForEach-Object { if ("$_" -match '(\d+\.\d+\.\d+\.\d+:\d+)') { adb connect $Matches[1] 2>&1 | Out-Null } }
  $lbl.Text = if ($r -match 'Successfully') { 'Готово: телефон спарено й підключено. Можна закривати.' } else { "Не вийшло: $($r.Trim())" }
})
$t.Start(); [Windows.Forms.Application]::Run($f)
