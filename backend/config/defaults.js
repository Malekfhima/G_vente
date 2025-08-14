// Configuration par défaut pour le backend
module.exports = {
  // Configuration de la base de données
  database: {
    url: "file:./dev.db",
  },

  // Configuration JWT
  jwt: {
    secret: "votre_secret_jwt_super_securise_changez_cela_en_production",
    expiresIn: "24h",
  },

  // Configuration du serveur
  server: {
    port: 5000,
    nodeEnv: "development",
  },

  // Configuration CORS
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },

  // Configuration de sécurité
  security: {
    bcryptRounds: 12,
  },

  // Configuration des logs
  logging: {
    level: "combined",
    morgan: "dev",
  },
};
