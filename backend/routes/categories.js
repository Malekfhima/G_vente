const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  listCategories,
  getCategorie,
  createCategorie,
  updateCategorie,
  deleteCategorie,
} = require("../controllers/categorieController");

router.get("/", listCategories);
router.get("/:id", getCategorie);
router.post("/", authenticateToken, requireAdmin, createCategorie);
router.put("/:id", authenticateToken, requireAdmin, updateCategorie);
router.delete("/:id", authenticateToken, requireAdmin, deleteCategorie);

module.exports = router;
