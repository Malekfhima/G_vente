@echo off
echo ========================================
echo   Test Port 5001 - Gestion Vente
echo ========================================
echo.

echo [1/2] Verification du port 5001...
netstat -ano | findstr :5001
if %errorlevel% equ 0 (
  echo ❌ Port 5001 est deja utilise!
  echo.
  echo Processus utilisant le port 5001:
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    tasklist /FI "PID eq %%a" 2>nul
  )
  echo.
  echo Appuyez sur une touche pour fermer...
  pause >nul
  exit /b 1
) else (
  echo ✅ Port 5001 est disponible!
)

echo [2/2] Demarrage du serveur backend...
cd backend
npm run dev

echo.
echo Appuyez sur une touche pour fermer...
pause >nul
