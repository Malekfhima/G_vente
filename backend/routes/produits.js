const express = require("express");
const router = express.Router();
const {
  getAllProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
  searchProduits,
  getProduitByCodeBarre,
} = require("../controllers/produitController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Routes publiques
router.get("/", getAllProduits);
router.get("/search", searchProduits);
router.get("/barcode/:codeBarre", getProduitByCodeBarre);
router.get("/:id", getProduitById);

// Routes protégées (authentification requise)
router.post("/", authenticateToken, requireAdmin, createProduit);
router.put("/:id", authenticateToken, requireAdmin, updateProduit);
router.delete("/:id", authenticateToken, requireAdmin, deleteProduit);

module.exports = router;
