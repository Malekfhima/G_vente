@echo off
echo ========================================
echo    DEMARRAGE DU PROJET GESTION VENTE
echo ========================================
echo.

echo [1/3] Demarrage du backend...
cd backend
start "Backend" cmd /k "npm install && npm run dev"

echo [2/3] Attente du demarrage du backend...
timeout /t 10 /nobreak > nul

echo [3/3] Demarrage du frontend...
cd ..\frontend
start "Frontend" cmd /k "npm install && npm run dev"

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
pause

