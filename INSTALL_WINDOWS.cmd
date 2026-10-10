@echo off
cd /d "%~dp0"
call npm.cmd install
if errorlevel 1 goto fail
call npm.cmd run check
if errorlevel 1 goto fail
echo Ready. Read START_HERE_UA.md. Run npm start for preview.
pause
exit /b 0
:fail
echo Installation/check failed. Read the error above and docs/TROUBLESHOOTING.md.
pause
exit /b 1
