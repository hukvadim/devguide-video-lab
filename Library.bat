@echo off
chcp 65001 >nul
title DevGuide - бібліотека звуків, музики й елементів
rem уже запущена -> просто відкрити браузер
netstat -ano | findstr ":5179 " | findstr LISTENING >/dev/null && (start "" http://localhost:5179 & exit /b)
cd /d "%~dp0tools\library"
if not exist node_modules (
  echo Перший запуск: встановлюю пакети...
  call npm install
)
echo Бібліотека відкриється в браузері: http://localhost:5179  (закрий це вікно, щоб зупинити)
call npx vite --port 5179 --open
