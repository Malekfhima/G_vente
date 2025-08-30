@echo off
echo ========================================
echo    DEMARRAGE AMELIORE - GESTION VENTE
echo ========================================
echo.

echo [1/4] Verification de l'installation...
node check-installation.js
if %errorlevel% neq 0 (
  echo.
  echo ❌ Probleme detecte lors de la verification
  echo Veuillez corriger les problemes avant de continuer
  pause
  exit /b 1
)

echo.
echo [2/4] Demarrage du backend...
cd backend
start "Backend" cmd /k "npm run dev"

echo [3/4] Attente du demarrage du backend...
timeout /t 15 /nobreak > nul

echo [4/4] Demarrage du frontend...
cd ..\frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    PROJET DEMARRE AVEC SUCCES !
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Comptes de test:
echo - Admin: admin@gestion-vente.com / admin123
echo - Vendeur: vendeur@gestion-vente.com / vendeur123
echo.
echo Appuyez sur une touche pour fermer...
pause >nul
