const express = require("express");
const router = express.Router();
const {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
  getZoneRentability,
  getTopZones,
  getZoneTrends,
} = require("../controllers/zoneController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Routes publiques (lecture seule)
router.get("/", getAllZones);
router.get("/:id", getZoneById);
router.get("/stats/rentability", getZoneRentability);
router.get("/stats/top", getTopZones);
router.get("/stats/trends", getZoneTrends);

// Routes protégées (admin seulement)
router.post("/", authenticateToken, requireAdmin, createZone);
router.put("/:id", authenticateToken, requireAdmin, updateZone);
router.delete("/:id", authenticateToken, requireAdmin, deleteZone);

module.exports = router;
