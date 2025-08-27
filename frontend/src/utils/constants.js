// Constantes pour les rôles utilisateur
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

// Constantes pour les catégories de produits
export const PRODUCT_CATEGORIES = [
  "Stylos",
  "Cahiers",
  "Cartables",
  "Fournitures de bureau",
  "Papeterie",
  "Accessoires scolaires",
  "Impression",
  "Informatique",
  "Autre",
];

// Constantes pour les périodes de statistiques
export const STATS_PERIODS = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
  { value: "annee", label: "Cette année" },
];

// Constantes pour les statuts
export const STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Constantes pour les messages
export const MESSAGES = {
  // Messages de succès
  SUCCESS: {
    LOGIN: "Connexion réussie",
    REGISTER: "Inscription réussie",
    LOGOUT: "Déconnexion réussie",
    CREATE_PRODUCT: "Produit créé avec succès",
    UPDATE_PRODUCT: "Produit mis à jour avec succès",
    DELETE_PRODUCT: "Produit supprimé avec succès",
    CREATE_SERVICE: "Service créé avec succès",
    UPDATE_SERVICE: "Service mis à jour avec succès",
    DELETE_SERVICE: "Service supprimé avec succès",
    CREATE_ZONE: "Zone créée avec succès",
    UPDATE_ZONE: "Zone mise à jour avec succès",
    DELETE_ZONE: "Zone supprimée avec succès",
    CREATE_SALE: "Vente créée avec succès",
    UPDATE_SALE: "Vente mise à jour avec succès",
    DELETE_SALE: "Vente supprimée avec succès",
  },

  // Messages d'erreur
  ERROR: {
    LOGIN: "Erreur de connexion",
    REGISTER: "Erreur d'inscription",
    NETWORK: "Erreur de connexion au serveur",
    VALIDATION: "Veuillez vérifier les informations saisies",
    UNAUTHORIZED: "Accès non autorisé",
    NOT_FOUND: "Ressource non trouvée",
    SERVER_ERROR: "Erreur interne du serveur",
  },

  // Messages de confirmation
  CONFIRM: {
    DELETE_PRODUCT: "Êtes-vous sûr de vouloir supprimer ce produit ?",
    DELETE_SERVICE: "Êtes-vous sûr de vouloir supprimer ce service ?",
    DELETE_ZONE: "Êtes-vous sûr de vouloir supprimer cette zone ?",
    DELETE_SALE: "Êtes-vous sûr de vouloir supprimer cette vente ?",
    LOGOUT: "Êtes-vous sûr de vouloir vous déconnecter ?",
  },
};

// Constantes pour la validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999999,
};

// Constantes pour le formatage
export const FORMAT = {
  DATE_FORMAT: "dd/MM/yyyy",
  TIME_FORMAT: "HH:mm",
  DATETIME_FORMAT: "dd/MM/yyyy HH:mm",
  CURRENCY: "TND",
  DECIMAL_PLACES: 2,
};

// Constantes pour la pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100,
};

// Constantes pour les routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PRODUCTS: "/produits",
  SALES: "/ventes",
  POS: "/pos",
  SERVICES: "/services",
  ZONES: "/zones",
  USERS: "/users",
  CLIENTS: "/clients",
  SUPPLIERS: "/fournisseurs",
  PROFILE: "/profile",
};

// Constantes pour les actions
export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
};

// Constantes pour les permissions
export const PERMISSIONS = {
  PRODUCTS: {
    CREATE: [USER_ROLES.ADMIN],
    UPDATE: [USER_ROLES.ADMIN],
    DELETE: [USER_ROLES.ADMIN],
    READ: [USER_ROLES.ADMIN, USER_ROLES.USER],
  },
  SERVICES: {
    CREATE: [USER_ROLES.ADMIN],
    UPDATE: [USER_ROLES.ADMIN],
    DELETE: [USER_ROLES.ADMIN],
    READ: [USER_ROLES.ADMIN, USER_ROLES.USER],
  },
  ZONES: {
    CREATE: [USER_ROLES.ADMIN],
    UPDATE: [USER_ROLES.ADMIN],
    DELETE: [USER_ROLES.ADMIN],
    READ: [USER_ROLES.ADMIN, USER_ROLES.USER],
  },
  SALES: {
    CREATE: [USER_ROLES.ADMIN, USER_ROLES.USER],
    UPDATE: [USER_ROLES.ADMIN, USER_ROLES.USER],
    DELETE: [USER_ROLES.ADMIN],
    READ: [USER_ROLES.ADMIN, USER_ROLES.USER],
  },
  USERS: {
    CREATE: [USER_ROLES.ADMIN],
    UPDATE: [USER_ROLES.ADMIN],
    DELETE: [USER_ROLES.ADMIN],
    READ: [USER_ROLES.ADMIN],
  },
};
