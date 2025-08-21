const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  listFournisseurs,
  getFournisseur,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
} = require("../controllers/fournisseurController");

router.use(authenticateToken);
router.get("/", listFournisseurs);
router.get("/:id", getFournisseur);
router.post("/", requireAdmin, createFournisseur);
router.put("/:id", requireAdmin, updateFournisseur);
router.delete("/:id", requireAdmin, deleteFournisseur);

module.exports = router;
