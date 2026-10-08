@echo off
cd /d "%~dp0"
if not exist .env (
  echo Primero ejecuta configurar.ps1 siguiendo el README.
  pause
  exit /b 1
)
echo PharmaBoost: http://localhost:3080
call npm.cmd start
pause
