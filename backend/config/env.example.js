// Configuration des variables d'environnement - Exemple
// Copiez ce fichier vers .env et modifiez les valeurs selon votre environnement

module.exports = {
  // Configuration de la base de données
  DATABASE_URL: "file:./dev.db",
  
  // Configuration JWT
  JWT_SECRET: "votre_secret_jwt_super_securise_changez_cela_en_production",
  JWT_EXPIRES_IN: "24h",
  
  // Configuration du serveur
  PORT: 5000,
  NODE_ENV: "development",
  
  // Configuration CORS
  FRONTEND_URL: "http://localhost:3000",
  CORS_CREDENTIALS: true,
  
  // Configuration de sécurité
  BCRYPT_ROUNDS: 12,
  
  // Configuration des logs
  LOG_LEVEL: "combined",
};
