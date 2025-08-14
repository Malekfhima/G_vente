require('dotenv').config();
const defaults = require('./defaults');

module.exports = {
  // Configuration de la base de données
  database: {
    url: process.env.DATABASE_URL || defaults.database.url,
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || defaults.jwt.secret,
    expiresIn: process.env.JWT_EXPIRES_IN || defaults.jwt.expiresIn,
  },

  // Configuration du serveur
  server: {
    port: process.env.PORT || defaults.server.port,
    nodeEnv: process.env.NODE_ENV || defaults.server.nodeEnv,
  },

  // Configuration CORS
  cors: {
    origin: process.env.FRONTEND_URL || defaults.cors.origin,
    credentials: process.env.CORS_CREDENTIALS === 'true' || defaults.cors.credentials,
  },

  // Configuration de sécurité
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || defaults.security.bcryptRounds,
  },

  // Configuration des logs
  logging: {
    level: process.env.LOG_LEVEL || defaults.logging.level,
    morgan: process.env.NODE_ENV === 'development' ? 'dev' : defaults.logging.morgan,
  },
};

