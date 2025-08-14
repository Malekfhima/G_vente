const { body, validationResult } = require('express-validator');

// Validation pour l'inscription
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Rôle invalide'),
];

// Validation pour la connexion
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
];

// Validation pour les produits
const validateProduit = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('prix')
    .isFloat({ min: 0.01 })
    .withMessage('Le prix doit être un nombre positif'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Le stock doit être un nombre entier positif'),
  body('categorie')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La catégorie ne peut pas dépasser 50 caractères'),
];

// Validation pour les ventes
const validateVente = [
  body('quantite')
    .isInt({ min: 1 })
    .withMessage('La quantité doit être un nombre entier positif'),
  body('prixTotal')
    .isFloat({ min: 0.01 })
    .withMessage('Le prix total doit être un nombre positif'),
  body('produitId')
    .isInt({ min: 1 })
    .withMessage('ID de produit invalide'),
];

// Middleware pour vérifier les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduit,
  validateVente,
  handleValidationErrors,
};

