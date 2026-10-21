# Voice polish for a mic track: rumble cut, gentle compression, de-ess, then loudness to -14 LUFS / -1.5 dBTP (two-pass loudnorm).
#   voice.ps1 <in.wav> [out.wav]   (default out: <in>-voice.wav, or take-NN-voice.wav for take-NN-mic.wav)
# Same rule as by hand in Audition ("just louder"), but measured: loud enough for YouTube/Instagram, never clipping.
param([Parameter(Mandatory)][string]$in, [string]$out)
$ErrorActionPreference = 'Stop'
if (-not $out) { $out = if ($in -match '-mic\.wav$') { $in -replace '-mic\.wav$', '-voice.wav' } else { $in -replace '\.wav$', '-voice.wav' } }
# highpass 80 Hz: desk/steps/AC hum · compressor 3:1 from -21 dB: quiet words up, loud ones tamed · deesser: softer "с/ш"
$chain = 'highpass=f=80,acompressor=threshold=-21dB:ratio=3:attack=5:release=120:makeup=2,deesser=i=0.4'
$target = 'I=-14:TP=-1.5:LRA=11'
# ffmpeg prints the measurement to stderr; collect it without PowerShell treating stderr as an error
$m = & { $ErrorActionPreference = 'Continue'; ffmpeg -hide_banner -nostats -i $in -af "$chain,loudnorm=$($target):print_format=json" -f null - 2>&1 } | Out-String
$j = [regex]::Match($m, '(?s)\{[^{}]*"input_i"[^{}]*\}').Value | ConvertFrom-Json
$ln = "loudnorm=$($target):measured_I=$($j.input_i):measured_TP=$($j.input_tp):measured_LRA=$($j.input_lra):measured_thresh=$($j.input_thresh):offset=$($j.target_offset):linear=true"
ffmpeg -y -v error -i $in -af "$chain,$ln" -ar 48000 -ac 1 -c:a pcm_s16le $out
"voice: $(Split-Path $out -Leaf) (-14 LUFS, peak <= -1.5 dBTP)"
