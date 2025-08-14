// Configuration des variables d'environnement - Exemple
// Copiez ce fichier vers .env et modifiez les valeurs selon votre environnement

export const env = {
  // Configuration de l'API
  VITE_API_URL: "http://localhost:5000/api",
  
  // Configuration de l'application
  VITE_APP_NAME: "Gestion Vente",
  VITE_APP_VERSION: "1.0.0",
  
  // Configuration de l'environnement
  NODE_ENV: "development",
  IS_DEV: true,
  IS_PROD: false,
  
  // Configuration du serveur de développement
  DEV_SERVER_PORT: 3000,
  API_SERVER_PORT: 5000,
  
  // Configuration des routes
  ROUTES: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    PRODUCTS: "/produits",
    SALES: "/ventes",
  },
};
