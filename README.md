# 🚀 Gestion Vente - Application de Gestion des Ventes

Une application complète de gestion des ventes avec authentification, gestion des produits et suivi des ventes.

## 📋 Fonctionnalités

- 🔐 **Authentification** : Connexion/Inscription sécurisée
- 📦 **Gestion des Produits** : CRUD complet des produits
- 💰 **Gestion des Ventes** : Enregistrement et suivi des ventes
- 📊 **Tableau de Bord** : Statistiques et aperçu de l'activité
- 👥 **Gestion des Utilisateurs** : Rôles admin et utilisateur
- 🎨 **Interface Moderne** : Design responsive avec Tailwind CSS

## 🛠️ Technologies Utilisées

### Backend
- Node.js + Express.js
- Prisma ORM avec SQLite
- JWT pour l'authentification
- Bcrypt pour le hachage des mots de passe

### Frontend
- React 18 avec Vite
- React Router pour la navigation
- Tailwind CSS pour le styling
- Axios pour les requêtes API

## 📁 Structure du Projet

```
gestion-vente/
├── backend/                 # Serveur Node.js
│   ├── controllers/        # Contrôleurs de l'API
│   ├── routes/            # Routes de l'API
│   ├── middleware/        # Middlewares (auth, validation)
│   ├── config/           # Configuration (DB, etc.)
│   ├── prisma/           # Schéma et migrations Prisma
│   └── server.js         # Point d'entrée du serveur
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── services/     # Services API
│   │   └── utils/        # Utilitaires et constantes
│   └── package.json
└── README.md
```

## 🚀 Installation et Exécution

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Git

### 1. Cloner le projet
```bash
git clone <https://github.com/Malekfhima/G_vente.git>
cd gestion-vente
```

### 2. Configuration du Backend

```bash
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env (copier .env.example)
cp .env.example .env

# Éditer le fichier .env avec vos configurations
# DATABASE_URL="postgresql://username:password@localhost:5432/gestion_vente"
# JWT_SECRET="votre_secret_jwt_tres_securise_ici"

# Initialiser la base de données
npx prisma generate
npx prisma db push

# Optionnel : Ajouter des données de test
npx prisma db seed

# Démarrer le serveur
npm run dev
```

### 3. Configuration du Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application
npm run dev
```

### 4. Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **Documentation API** : http://localhost:5000/api

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev          # Démarrage en mode développement
npm run start        # Démarrage en mode production
npm run build        # Build de l'application
npm run test         # Exécution des tests
```

### Frontend
```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de l'application
npm run preview      # Prévisualisation du build
npm run lint         # Vérification du code
```

## 📊 Base de Données

Le projet utilise Prisma avec SQLite par défaut. Pour utiliser PostgreSQL :

1. Modifier `backend/prisma/schema.prisma`
2. Changer le provider de `sqlite` à `postgresql`
3. Mettre à jour `DATABASE_URL` dans `.env`
4. Exécuter `npx prisma db push`

## 🔐 Authentification

L'application utilise JWT pour l'authentification :

- **Inscription** : `POST /api/auth/register`
- **Connexion** : `POST /api/auth/login`
- **Profil** : `GET /api/auth/profile` (protégé)

## 📱 Utilisation

1. **Créer un compte** via la page d'inscription
2. **Se connecter** avec vos identifiants
3. **Ajouter des produits** dans la section Produits
4. **Enregistrer des ventes** dans la section Ventes
5. **Consulter les statistiques** sur le tableau de bord

## 🚨 Dépannage

### Erreur de connexion à la base de données
```bash
# Vérifier que la base est accessible
npx prisma db push

# Réinitialiser la base si nécessaire
npx prisma migrate reset
```

### Erreur CORS
- Vérifier que `FRONTEND_URL` est correctement configuré dans `.env`
- S'assurer que le frontend tourne sur le bon port

### Erreur JWT
- Vérifier que `JWT_SECRET` est défini dans `.env`
- Redémarrer le serveur après modification

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Bon développement ! 🎉**

