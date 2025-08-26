const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  changePassword,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

// Route d'inscription (publique)
router.post("/register", register);

// Route de connexion (publique)
router.post("/login", login);

// Route pour récupérer le profil (protégée)
router.get("/profile", authenticateToken, getProfile);

// Route pour changer le mot de passe (protégée)
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;
