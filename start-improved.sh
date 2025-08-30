#!/bin/bash

echo "========================================"
echo "    DEMARRAGE AMELIORE - GESTION VENTE"
echo "========================================"
echo

echo "[1/4] Verification de l'installation..."
node check-installation.js
if [ $? -ne 0 ]; then
  echo
  echo "❌ Probleme detecte lors de la verification"
  echo "Veuillez corriger les problemes avant de continuer"
  exit 1
fi

echo
echo "[2/4] Demarrage du backend..."
cd backend
gnome-terminal --title="Backend" -- bash -c "npm run dev; exec bash" &

echo "[3/4] Attente du demarrage du backend..."
sleep 15

echo "[4/4] Demarrage du frontend..."
cd ../frontend
gnome-terminal --title="Frontend" -- bash -c "npm run dev; exec bash" &

echo
echo "========================================"
echo "    PROJET DEMARRE AVEC SUCCES !"
echo "========================================"
echo
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo
echo "Comptes de test:"
echo "- Admin: admin@gestion-vente.com / admin123"
echo "- Vendeur: vendeur@gestion-vente.com / vendeur123"
echo
echo "Appuyez sur Entree pour fermer..."
read
