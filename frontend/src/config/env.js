// Configuration des variables d'environnement
export const env = {
  // Configuration de l'API
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  
  // Configuration de l'application
  APP_NAME: import.meta.env.VITE_APP_NAME || "Gestion Vente",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  
  // Configuration de l'environnement
  NODE_ENV: import.meta.env.MODE || "development",
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  
  // Configuration du serveur de développement
  DEV_SERVER_PORT: 3000,
  API_SERVER_PORT: 5000,
};
