#!/bin/bash

echo "========================================"
echo "    DEMARRAGE DU PROJET GESTION VENTE"
echo "========================================"
echo

echo "[1/3] Demarrage du backend..."
cd backend
gnome-terminal --title="Backend" -- bash -c "npm install && npm run dev; exec bash" &

echo "[2/3] Attente du demarrage du backend..."
sleep 5

echo "[3/3] Demarrage du frontend..."
cd ../frontend
gnome-terminal --title="Frontend" -- bash -c "npm install && npm run dev; exec bash" &

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

