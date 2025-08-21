const express = require("express");
const router = express.Router();
const {
  getAllVentes,
  getVenteById,
  createVente,
  updateVente,
  deleteVente,
  getVentesByUser,
  getVentesStats,
  exportVentesPDF,
} = require("../controllers/venteController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Routes protégées (authentification requise)
router.get("/", authenticateToken, getAllVentes);
router.get("/stats", authenticateToken, getVentesStats);
router.get("/my-ventes", authenticateToken, getVentesByUser);
// Export PDF des ventes (placer avant la route paramétrée :id)
router.get("/export/pdf", authenticateToken, exportVentesPDF);
router.get("/:id", authenticateToken, getVenteById);
router.post("/", authenticateToken, createVente);
router.put("/:id", authenticateToken, updateVente);
router.delete("/:id", authenticateToken, requireAdmin, deleteVente);

module.exports = router;
