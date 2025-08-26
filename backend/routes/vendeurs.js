const express = require("express");
const router = express.Router();
const {
  getAllVendeurs,
  getVendeurById,
  createVendeur,
  updateVendeur,
  deleteVendeur,
  searchVendeurs,
} = require("../controllers/vendeurController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Toutes les routes nécessitent une authentification admin
router.use(authenticateToken, requireAdmin);

// Routes pour la gestion des vendeurs
router.get("/", getAllVendeurs);
router.get("/search", searchVendeurs);
router.get("/:id", getVendeurById);
router.post("/", createVendeur);
router.put("/:id", updateVendeur);
router.delete("/:id", deleteVendeur);

module.exports = router;

