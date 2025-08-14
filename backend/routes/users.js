const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Toutes les routes nécessitent une authentification et un rôle admin
router.use(authenticateToken);
router.use(requireAdmin);

// Récupérer tous les utilisateurs
router.get("/", getAllUsers);

// Récupérer les statistiques des utilisateurs
router.get("/stats", getUserStats);

// Récupérer un utilisateur par ID
router.get("/:id", getUserById);

// Créer un nouvel utilisateur
router.post("/", createUser);

// Mettre à jour un utilisateur
router.put("/:id", updateUser);

// Supprimer un utilisateur
router.delete("/:id", deleteUser);

module.exports = router;
