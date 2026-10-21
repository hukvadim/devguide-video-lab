# Takes: primary screen + phone camera + USB mic, each into its own file. Pause/resume = segments glued on stop.
#   rec.ps1 start <name> [-NoCam] [-NoMic]  -> public/ideas/<name>/, hidden host runs the recorders, panel opens on the side monitor
#   rec.ps1 pause | resume                  -> closes current segments / starts new ones (panel buttons do the same)
#   rec.ps1 stop                            -> take-NN.mp4 (screen), take-NN-cam.mp4, take-NN-mic.wav, take-NN.log
#   rec.ps1 status
# Devices and quality: config.json. Camera = scrcpy over Wi-Fi adb (1080p); if the phone is not connected, Windows Virtual Camera (720p max).
param([Parameter(Mandatory)][ValidateSet('start', 'stop', 'pause', 'resume', 'status', 'host', 'discard')][string]$op, [string]$name, [switch]$NoCam, [switch]$NoMic)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$state = "$root\.state"; $pidFile = "$root\.ffpid"
$repo = (Resolve-Path "$root\..\..\..").Path
$cfg = Get-Content "$root\config.json" -Raw | ConvertFrom-Json
function Now { [DateTimeOffset]::Now.ToUnixTimeMilliseconds() }
function StateDir { (Get-Content $state -Raw).Trim() }
# do.ps1 writes clicks into the same log: retry instead of dying on a locked file
function Log($dir, $line) { $s = "$line $(Now)"; for ($i = 0; $i -lt 20; $i++) { try { Add-Content "$dir\log.txt" $s -Encoding UTF8 -ErrorAction Stop; return } catch { Start-Sleep -Milliseconds 25 } } }

function Start-Ff($argline) {
  $p = New-Object Diagnostics.Process
  $p.StartInfo.FileName = 'ffmpeg'; $p.StartInfo.Arguments = "-y -loglevel error $argline"
  $p.StartInfo.UseShellExecute = $false; $p.StartInfo.RedirectStandardInput = $true; $p.StartInfo.CreateNoWindow = $true
  $p.Start() | Out-Null; $p
}

if ($op -eq 'host') {
  $ErrorActionPreference = 'Continue'   # a hiccup must not kill the recorders' owner
  # Hidden host: owns every recorder so pause/stop end them cleanly. Flags in the take dir: .pause, .stop. Live pids: .procs
  $dir = $name; $seg = 0
  $useCam = -not (Test-Path "$dir\.nocam"); $useMic = -not (Test-Path "$dir\.nomic")
  $phoneOk = $false; $serial = $null
  if ($useCam) {
    # Already-paired phone: try the saved endpoint, then the current port announced over mDNS (it changes after reboots). No codes needed.
    adb connect $cfg.phone 2>&1 | Out-Null
    if (-not (adb devices | Select-String '\s+device$')) {
      adb mdns services 2>&1 | Select-String '_adb-tls-connect' | ForEach-Object { if ("$_" -match '(\d+\.\d+\.\d+\.\d+:\d+)') { adb connect $Matches[1] 2>&1 | Out-Null } }
    }
    $serial = adb devices | Select-String '^(\S+)\s+device$' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Sort-Object { $_ -ne $cfg.phone } | Select-Object -First 1
    $phoneOk = [bool]$serial
    Log $dir "camera $(if ($phoneOk) { "scrcpy-$serial" } else { 'fallback-virtual-720p' })"
  }
  Add-Type -AssemblyName System.Windows.Forms
  $side = [Windows.Forms.Screen]::AllScreens | Where-Object { -not $_.Primary } | Select-Object -First 1
  $px = if ($side) { $side.WorkingArea.Left + 660 } else { 1200 }; $py = if ($side) { $side.WorkingArea.Top + 60 } else { 60 }
  while (-not (Test-Path "$dir\.stop")) {
    if (Test-Path "$dir\.pause") { Set-Content "$dir\.procs" ''; Start-Sleep -Milliseconds 200; continue }
    $seg++; $n = '{0:D2}' -f $seg; $procs = @()
    if ($useCam) {
      if ($phoneOk) {
        $c = New-Object Diagnostics.Process
        $c.StartInfo.FileName = 'scrcpy'
        $c.StartInfo.Arguments = "-s $serial --video-source=camera --camera-facing=$($cfg.cameraFacing) --camera-size=$($cfg.cameraSize) --camera-fps=$($cfg.cameraFps) --video-bit-rate=$($cfg.cameraBitrate) --audio-source=mic --no-audio-playback --no-control --record=`"$dir\cam-$n.mkv`" --window-title=Камера --window-x=$px --window-y=$py --window-width=$($cfg.previewWidth) --always-on-top"
        $c.StartInfo.UseShellExecute = $false; $c.StartInfo.CreateNoWindow = $true
        $c.Start() | Out-Null
        $procs += [pscustomobject]@{ k = 'cam'; p = $c; kind = 'scrcpy' }
      } else {
        $c = Start-Ff "-f dshow -rtbufsize 200M -i video=`"$($cfg.fallbackCamera)`" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p `"$dir\cam-$n.mkv`""
        $procs += [pscustomobject]@{ k = 'cam'; p = $c; kind = 'ff' }
      }
      # scrcpy needs ~2 s before the first frame: start screen and mic only once the camera file is growing, so tracks start together
      if ($phoneOk) { Start-Sleep -Milliseconds 2000 }   # leftover head is trimmed on stop (cam vs mic duration)
      Log $dir "seg $n cam"
    }
    $scr = Start-Ff "-f gdigrab -framerate 30 -draw_mouse 1 -offset_x 0 -offset_y 0 -video_size 1920x1080 -i desktop -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p `"$dir\seg-$n.mkv`""
    $procs += [pscustomobject]@{ k = 'screen'; p = $scr; kind = 'ff' }; Log $dir "seg $n screen"
    if ($useMic) {
      $mic = Start-Ff "-f dshow -audio_buffer_size 50 -i audio=`"$($cfg.mic)`" -ar 48000 -ac 1 -c:a pcm_s16le `"$dir\mic-$n.wav`""
      $procs += [pscustomobject]@{ k = 'mic'; p = $mic; kind = 'ff' }; Log $dir "seg $n mic"
    }
    Set-Content "$dir\.procs" ($procs | ForEach-Object { "$($_.k) $($_.p.Id)" })
    while (-not (Test-Path "$dir\.stop") -and -not (Test-Path "$dir\.pause")) { Start-Sleep -Milliseconds 150 }
    # signal every recorder first, then wait: ends line up, so stop can trim camera heads by duration difference
    foreach ($r in $procs) { if (-not $r.p.HasExited) { if ($r.kind -eq 'scrcpy') { $r.p.CloseMainWindow() | Out-Null } else { $r.p.StandardInput.Write('q') } } }
    foreach ($r in $procs) { if (-not $r.p.WaitForExit(15000)) { $r.p.Kill(); Log $dir "seg $n $($r.k) killed" } }
    Log $dir "seg $n stopped"
  }
  Remove-Item "$dir\.stop", "$dir\.pause", "$dir\.procs", "$dir\.hold" -ErrorAction SilentlyContinue
  exit
}

function Concat($dir, $pattern, $out, [string[]]$extra = @()) {
  $segs = @(Get-ChildItem "$dir\$pattern" -ErrorAction SilentlyContinue | Where-Object Length -gt 0 | Sort-Object Name)
  if ($segs.Count -eq 0) { return $null }
  $list = "$dir\segs.txt"; $segs | ForEach-Object { "file '$($_.FullName -replace '\\','/')'" } | Set-Content $list -Encoding ASCII
  ffmpeg -y -v error -f concat -safe 0 -i $list -c copy @extra $out
  Remove-Item $list; $segs | Remove-Item
  $d = ffprobe -v error -show_entries format=duration -of csv=p=0 $out
  "$(Split-Path $out -Leaf) $([math]::Round([double]$d,1))s"
}

switch ($op) {
  'start' {
    if (-not $name) { throw 'rec.ps1 start <name>' }
    if (Test-Path $pidFile) { throw "already recording; run rec.ps1 stop" }
    $dir = "$repo\public\ideas\$name"; New-Item -ItemType Directory -Force $dir | Out-Null
    Remove-Item "$dir\.stop", "$dir\.pause", "$dir\.beat", "$dir\.hold", "$dir\.procs", "$dir\.nocam", "$dir\.nomic", "$dir\seg-*.mkv", "$dir\cam-*.mkv", "$dir\mic-*.wav" -ErrorAction SilentlyContinue
    if ($NoCam) { New-Item "$dir\.nocam" -ItemType File | Out-Null }; if ($NoMic) { New-Item "$dir\.nomic" -ItemType File | Out-Null }
    Set-Content $state $dir
    Set-Content "$dir\log.txt" "" -Encoding UTF8
    $h = Start-Process powershell -PassThru -WindowStyle Hidden -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" host `"$dir`""
    Set-Content $pidFile $h.Id
    if (-not (Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object CommandLine -like '*screen-take*panel.ps1*')) {
      Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoProfile -STA -ExecutionPolicy Bypass -File `"$root\panel.ps1`""
    }
    # wait until recorders are up (camera needs a few seconds), then the sync beep
    for ($i = 0; $i -lt 60 -and -not ((Test-Path "$dir\.procs") -and (Get-Content "$dir\.procs" -Raw)); $i++) { Start-Sleep -Milliseconds 250 }
    Start-Sleep 2; [console]::beep(1000, 300); Log $dir 'start'
    "REC $dir`n$((Get-Content "$dir\log.txt" -Raw).Trim())"
  }
  'pause'  { $dir = StateDir; if (-not (Test-Path "$dir\.pause")) { New-Item "$dir\.pause" -ItemType File | Out-Null; Log $dir 'pause' }; 'PAUSED' }
  'resume' { $dir = StateDir; if (Test-Path "$dir\.pause") { Remove-Item "$dir\.pause"; Log $dir 'resume' }; 'REC' }
  'discard' {   # stop recorders and delete what this take wrote
    if (-not (Test-Path $pidFile)) { throw 'not recording' }
    $dir = StateDir
    New-Item "$dir\.stop" -ItemType File -Force | Out-Null
    $h = Get-Process -Id ([int](Get-Content $pidFile)) -ErrorAction SilentlyContinue
    if ($h) { $h.WaitForExit(40000) | Out-Null }
    Remove-Item $pidFile
    Remove-Item "$dir\.stop", "$dir\.pause", "$dir\.beat", "$dir\.hold", "$dir\.procs", "$dir\.nocam", "$dir\.nomic", "$dir\seg-*.mkv", "$dir\cam-*.mkv", "$dir\mic-*.wav", "$dir\segs.txt" -ErrorAction SilentlyContinue
    'DISCARDED'
  }
  'stop' {
    if (-not (Test-Path $pidFile)) { throw 'not recording' }
    $dir = StateDir
    Log $dir 'end'
    New-Item "$dir\.stop" -ItemType File -Force | Out-Null
    $h = Get-Process -Id ([int](Get-Content $pidFile)) -ErrorAction SilentlyContinue
    if ($h) { $h.WaitForExit(40000) | Out-Null }
    Remove-Item $pidFile
    # align every segment to its screen segment (main video): recorders stop together, so the difference sits at the head
    $inv = [Globalization.CultureInfo]::InvariantCulture
    function Dur($p) { [double](ffprobe -v error -show_entries format=duration -of csv=p=0 $p) }
    Get-ChildItem "$dir\seg-*.mkv" | ForEach-Object {
      $n = $_.BaseName -replace 'seg-', ''; $ds = Dur $_.FullName
      $cam = "$dir\cam-$n.mkv"; $mic = "$dir\mic-$n.wav"
      if (Test-Path $cam) {
        $d = (Dur $cam) - $ds
        # every cam segment is re-encoded the same way so concat stays clean; trim a longer head, clone the first frame for a shorter one
        $vf = if ($d -lt -0.04) { "tpad=start_mode=clone:start_duration=$((-$d).ToString('0.000', $inv))" } else { 'null' }
        $af = if ($d -lt -0.04) { "adelay=$([int](-$d * 1000)):all=1" } else { 'anull' }
        ffmpeg -y -v error -ss ([Math]::Max(0, $d)).ToString('0.000', $inv) -i $cam -vf $vf -af $af -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -r 30 -c:a aac -b:a 160k "$dir\camt-$n.mkv"
        Remove-Item $cam; Rename-Item "$dir\camt-$n.mkv" "cam-$n.mkv"
        Add-Content "$dir\log.txt" ("align seg {0} screen {1:N2}s cam {2:+0.00;-0.00}s" -f $n, $ds, $d) -Encoding UTF8
      }
      if (Test-Path $mic) {
        $d = (Dur $mic) - $ds
        if ([Math]::Abs($d) -gt 0.02) {
          $af = if ($d -lt 0) { "adelay=$([int](-$d * 1000)):all=1" } else { "atrim=start=$($d.ToString('0.000', $inv)),asetpts=PTS-STARTPTS" }
          ffmpeg -y -v error -i $mic -af $af -ar 48000 -ac 1 -c:a pcm_s16le "$dir\mict-$n.wav"
          Remove-Item $mic; Rename-Item "$dir\mict-$n.wav" "mic-$n.wav"
        }
        Add-Content "$dir\log.txt" ("align seg {0} mic {1:+0.00;-0.00}s" -f $n, $d) -Encoding UTF8
      }
    }
    $k = 1; while (Test-Path ("$dir\take-{0:D2}.mp4" -f $k)) { $k++ }
    $base = "$dir\take-{0:D2}" -f $k
    $res = @(
      Concat $dir 'seg-*.mkv' "$base.mp4" @('-movflags', '+faststart')
      Concat $dir 'cam-*.mkv' "$base-cam.mp4" @('-movflags', '+faststart')
      Concat $dir 'mic-*.wav' "$base-mic.wav"
    ) | Where-Object { $_ }; $res = @($res)
    Move-Item "$dir\log.txt" "$base.log"
    Remove-Item "$dir\.nocam", "$dir\.nomic" -ErrorAction SilentlyContinue
    # polished voice next to the raw mic (a few seconds), then transcript + prompt in the background
    if (Test-Path "$base-mic.wav") { $res += (& "$root\voice.ps1" "$base-mic.wav") -replace '^voice: ', '' }
    # transcript + ready prompt in the background (CPU whisper ~ real time); the panel shows "Промпт" when <base>.prompt.md appears
    Start-Process python -WindowStyle Hidden -ArgumentList "`"$root\transcribe.py`" `"$base`"" -RedirectStandardError "$env:TEMP\screen-take\whisper.log"
    "SAVED $(Split-Path $base -Leaf): $($res -join ' | ')`nтекст і промпт готуються у фоні"
  }
  'status' {
    if (-not (Test-Path $pidFile)) { 'idle' } elseif (Test-Path "$(StateDir)\.pause") { "paused -> $(StateDir)" } else { "recording -> $(StateDir)" }
  }
}
