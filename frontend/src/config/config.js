// Configuration de l'application
export const config = {
  // Configuration de l'API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    timeout: 10000,
  },

  // Configuration de l'application
  app: {
    name: "Gestion Vente",
    version: "1.0.0",
    description: "Application de gestion des ventes",
  },

  // Configuration des routes
  routes: {
    home: "/",
    login: "/login",
    register: "/register",
    products: "/produits",
    sales: "/ventes",
    profile: "/profile",
  },

  // Configuration des messages
  messages: {
    errors: {
      network: "Erreur de connexion au serveur",
      unauthorized: "Accès non autorisé",
      validation: "Veuillez vérifier les informations saisies",
      notFound: "Ressource non trouvée",
      serverError: "Erreur interne du serveur",
    },
    success: {
      login: "Connexion réussie",
      register: "Inscription réussie",
      logout: "Déconnexion réussie",
    },
  },

  // Configuration de la pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },

  // Configuration des formats
  formats: {
    date: "dd/MM/yyyy",
    time: "HH:mm",
    datetime: "dd/MM/yyyy HH:mm",
    currency: "EUR",
    decimalPlaces: 2,
  },
};
