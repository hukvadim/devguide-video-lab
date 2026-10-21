@echo off
rem Pair the phone camera for screen-take by QR (phone: Wireless debugging > Pair device with QR code)
start "" powershell -NoProfile -STA -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0.claude\skills\screen-take\pair-qr.ps1"
