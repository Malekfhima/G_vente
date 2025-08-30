# 🚀 Commandes d'Exécution - Gestion Vente

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- npm (version 8 ou supérieure)
- Git

## 🔧 Installation Initiale

### 1. Installation de toutes les dépendances

```bash
npm run install:all
```

Cette commande installe les dépendances pour :

- Le projet principal
- Le backend (Node.js + Express)
- Le frontend (React + Vite)

### 2. Vérification de l'installation

```bash
npm run check
```

Cette commande vérifie :

- La version de Node.js et npm
- La présence des fichiers de configuration
- La présence des fichiers d'environnement
- La présence des dépendances installées

## 🚀 Démarrage du Projet

### Option 1: Démarrage automatique (recommandé)

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Option 1b: Démarrage avec vérification (recommandé)

```bash
# Windows
start-improved.bat

# Linux/Mac
chmod +x start-improved.sh
./start-improved.sh
```

### Option 2: Démarrage manuel

#### Terminal 1 - Backend

```bash
cd backend
npm install
npm run dev
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

### Option 3: Démarrage simultané

```bash
npm run dev
```

## 🗄️ Configuration de la Base de Données

### Configuration initiale

```bash
npm run db:setup
```

### Réinitialisation de la base

```bash
npm run db:reset
```

## 📊 Accès à l'Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Documentation API**: http://localhost:5000

## 👥 Comptes de Test

### Administrateur

- **Email**: admin@gestion-vente.com
- **Mot de passe**: admin123
- **Rôle**: admin (accès complet)

### Vendeur

- **Email**: vendeur@gestion-vente.com
- **Mot de passe**: vendeur123
- **Rôle**: user (accès limité)

## 🔍 Scripts Disponibles

### Scripts Principaux

```bash
npm run install:all      # Installation de toutes les dépendances
npm run check            # Vérification de l'installation
npm run dev              # Démarrage simultané backend + frontend
npm run dev:backend      # Démarrage du backend uniquement
npm run dev:frontend     # Démarrage du frontend uniquement
npm run build            # Build de production du frontend
npm run start            # Démarrage du backend en production
```

### Scripts de Base de Données

```bash
npm run db:setup         # Configuration initiale de la base
npm run db:reset         # Réinitialisation de la base
```

## 🛠️ Développement

### Backend

```bash
cd backend
npm run dev              # Démarrage avec nodemon
npm run db:generate      # Génération du client Prisma
npm run db:push          # Synchronisation du schéma
npm run db:studio        # Interface Prisma Studio
npm run db:seed          # Ajout de données de test
```

### Frontend

```bash
cd frontend
npm run dev              # Serveur de développement Vite
npm run build            # Build de production
npm run preview          # Prévisualisation du build
npm run lint             # Vérification du code
```

## 🐳 Docker (Optionnel)

```bash
# Démarrer tous les services
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter les services
docker-compose down
```

## 🚨 Dépannage

### Erreur de port déjà utilisé

```bash
# Vérifier les processus sur les ports
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Tuer le processus (Windows)
taskkill /PID <PID> /F

# Tuer le processus (Linux/Mac)
kill -9 <PID>
```

### Erreur de base de données

```bash
cd backend
npm run db:push
npm run db:seed
```

### Erreur de dépendances

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
cd backend && rm -rf node_modules package-lock.json
cd ../frontend && rm -rf node_modules package-lock.json
cd ..
npm run install:all
```

## 📝 Variables d'Environnement

### Backend (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre_secret_jwt_super_securise"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Gestion Vente
VITE_APP_VERSION=1.0.0
```

## 🎯 Commandes Rapides

```bash
# Démarrage complet en une commande
npm run install:all && npm run db:setup && npm run dev

# Redémarrage rapide
npm run dev:backend & npm run dev:frontend

# Vérification de l'état
curl http://localhost:5000
curl http://localhost:3000
```

---

**💡 Conseil**: Utilisez `start.bat` (Windows) ou `start.sh` (Linux/Mac) pour un démarrage automatique et sans erreur !
