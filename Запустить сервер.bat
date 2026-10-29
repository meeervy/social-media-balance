@echo off
title Social Media Balance - local server
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [ERROR] Node.js is not installed or not in PATH.
  echo  Install it from https://nodejs.org and try again.
  echo.
  pause
  exit /b 1
)

node server.js

echo.
echo  Server stopped.
pause
