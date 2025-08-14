# 📚 Documentation API - Gestion des Utilisateurs

Cette documentation décrit l'API de gestion des utilisateurs de l'application de gestion des ventes.

## 🔐 Authentification

Toutes les routes de l'API utilisateurs nécessitent :

1. **Authentification JWT** : Token valide dans le header `Authorization`
2. **Rôle Administrateur** : L'utilisateur doit avoir le rôle `admin`

### Headers requis

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📋 Endpoints

### 1. Récupérer tous les utilisateurs

**GET** `/api/users`

Récupère la liste de tous les utilisateurs avec leurs statistiques de ventes.

#### Réponse

```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "nom": "Administrateur",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "ventes": 15
      }
    }
  ]
}
```

#### Codes de statut

- `200` : Succès
- `401` : Non authentifié
- `403` : Accès refusé (rôle insuffisant)

---

### 2. Récupérer un utilisateur par ID

**GET** `/api/users/:id`

Récupère les détails d'un utilisateur spécifique avec ses ventes.

#### Paramètres

- `id` (number) : ID de l'utilisateur

#### Réponse

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nom": "Utilisateur Test",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "ventes": [
      {
        "id": 1,
        "quantite": 2,
        "prixTotal": 50.0,
        "date": "2024-01-01T10:00:00.000Z",
        "produit": {
          "id": 1,
          "nom": "Produit Test"
        }
      }
    ],
    "_count": {
      "ventes": 5
    }
  }
}
```

#### Codes de statut

- `200` : Succès
- `400` : ID invalide
- `401` : Non authentifié
- `403` : Accès refusé
- `404` : Utilisateur non trouvé

---

### 3. Créer un nouvel utilisateur

**POST** `/api/users`

Crée un nouvel utilisateur dans le système.

#### Corps de la requête

```json
{
  "email": "nouveau@example.com",
  "password": "motdepasse123",
  "nom": "Nouvel Utilisateur",
  "role": "user"
}
```

#### Validation

- `email` : Requis, format email valide, unique
- `password` : Requis, minimum 6 caractères
- `nom` : Requis, maximum 100 caractères
- `role` : Optionnel, "admin" ou "user" (défaut: "user")

#### Réponse

```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 2,
    "email": "nouveau@example.com",
    "nom": "Nouvel Utilisateur",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Codes de statut

- `201` : Utilisateur créé
- `400` : Données invalides
- `401` : Non authentifié
- `403` : Accès refusé

---

### 4. Modifier un utilisateur

**PUT** `/api/users/:id`

Modifie les informations d'un utilisateur existant.

#### Paramètres

- `id` (number) : ID de l'utilisateur

#### Corps de la requête

```json
{
  "email": "modifie@example.com",
  "nom": "Utilisateur Modifié",
  "role": "admin",
  "password": "nouveaumotdepasse"
}
```

#### Validation

- Tous les champs sont optionnels
- `email` : Format email valide, unique
- `password` : Minimum 6 caractères
- `nom` : Maximum 100 caractères
- `role` : "admin" ou "user"

#### Réponse

```json
{
  "message": "Utilisateur mis à jour avec succès",
  "user": {
    "id": 1,
    "email": "modifie@example.com",
    "nom": "Utilisateur Modifié",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Codes de statut

- `200` : Utilisateur modifié
- `400` : Données invalides
- `401` : Non authentifié
- `403` : Accès refusé
- `404` : Utilisateur non trouvé

---

### 5. Supprimer un utilisateur

**DELETE** `/api/users/:id`

Supprime un utilisateur et toutes ses ventes associées.

#### Paramètres

- `id` (number) : ID de l'utilisateur

#### Contraintes

- Impossible de supprimer son propre compte
- Suppression en cascade des ventes associées

#### Réponse

```json
{
  "message": "Utilisateur supprimé avec succès"
}
```

#### Codes de statut

- `200` : Utilisateur supprimé
- `400` : ID invalide ou tentative de suppression de son propre compte
- `401` : Non authentifié
- `403` : Accès refusé
- `404` : Utilisateur non trouvé

---

### 6. Statistiques des utilisateurs

**GET** `/api/users/stats`

Récupère les statistiques globales des utilisateurs.

#### Réponse

```json
{
  "stats": {
    "totalUsers": 10,
    "adminUsers": 2,
    "regularUsers": 8,
    "topUsers": [
      {
        "id": 1,
        "nom": "Utilisateur Actif",
        "email": "actif@example.com",
        "role": "user",
        "_count": {
          "ventes": 25
        }
      }
    ]
  }
}
```

#### Codes de statut

- `200` : Succès
- `401` : Non authentifié
- `403` : Accès refusé

---

## 🔒 Gestion des Erreurs

### Format des erreurs

```json
{
  "message": "Description de l'erreur",
  "details": "Détails supplémentaires (optionnel)"
}
```

### Codes d'erreur courants

| Code  | Description                                   |
| ----- | --------------------------------------------- |
| `400` | Données invalides ou requête malformée        |
| `401` | Token d'authentification manquant ou invalide |
| `403` | Accès refusé (rôle insuffisant)               |
| `404` | Ressource non trouvée                         |
| `500` | Erreur interne du serveur                     |

### Messages d'erreur spécifiques

- `"Email et mot de passe requis"` : Champs manquants lors de la création
- `"Cet email est déjà utilisé"` : Email en doublon
- `"Rôle invalide. Doit être 'admin' ou 'user'"` : Rôle non autorisé
- `"Vous ne pouvez pas supprimer votre propre compte"` : Tentative de suppression de son compte
- `"Accès refusé. Rôle admin requis."` : Permissions insuffisantes

---

## 📝 Exemples d'utilisation

### Exemple avec cURL

#### Connexion admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

#### Récupérer tous les utilisateurs

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

#### Créer un utilisateur

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@example.com",
    "password": "password123",
    "nom": "Nouvel Utilisateur",
    "role": "user"
  }'
```

### Exemple avec JavaScript (fetch)

```javascript
// Connexion admin
const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@example.com",
    password: "password123",
  }),
});

const { token } = await loginResponse.json();

// Récupérer les utilisateurs
const usersResponse = await fetch("/api/users", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const { users } = await usersResponse.json();
```

---

## 🧪 Tests

Un script de test complet est disponible dans `test-users-api.js` :

```bash
# Installer les dépendances
npm install axios

# Exécuter les tests
node test-users-api.js
```

Le script teste tous les endpoints et vérifie :

- Authentification admin
- CRUD complet des utilisateurs
- Gestion des erreurs
- Contrôle d'accès

---

## 🔧 Configuration

### Variables d'environnement requises

```env
# Base de données
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="votre_secret_jwt_tres_securise_ici"
JWT_EXPIRES_IN="24h"

# Sécurité
BCRYPT_ROUNDS=12
```

### Middleware de sécurité

L'API utilise les middlewares suivants :

- `authenticateToken` : Vérification du token JWT
- `requireAdmin` : Vérification du rôle administrateur
- Validation des données d'entrée
- Protection contre les injections SQL (Prisma)

---

## 📊 Modèle de données

### Table User

```sql
CREATE TABLE User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nom TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Relations

- `User` → `Vente` (1:N) : Un utilisateur peut avoir plusieurs ventes
- Suppression en cascade : Supprimer un utilisateur supprime ses ventes

---

## 🚀 Déploiement

### Prérequis

- Node.js 18+
- Base de données SQLite/PostgreSQL
- Variables d'environnement configurées

### Étapes de déploiement

1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement
4. Initialiser la base de données : `npx prisma db push`
5. Démarrer le serveur : `npm run dev`

---

## 📞 Support

Pour toute question ou problème :

- Vérifier les logs du serveur
- Consulter la documentation Prisma
- Tester avec le script de test fourni
- Ouvrir une issue sur GitHub
