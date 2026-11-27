@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. Node.js 18 veya daha yeni bir surum kurun.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Gerekli paketler kuruluyor...
  call npm install
  if errorlevel 1 (
    echo Paket kurulumu basarisiz oldu.
    pause
    exit /b 1
  )
)

start "Sarkiyi Tahmin Et" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "" http://localhost:3000
