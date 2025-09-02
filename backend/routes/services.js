const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  listServices,
  listServicesGroupedByCategory,
  getService,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

router.get("/", listServices);
router.get("/grouped", listServicesGroupedByCategory);
router.get("/:id", getService);
router.post("/", authenticateToken, requireAdmin, createService);
router.put("/:id", authenticateToken, requireAdmin, updateService);
router.delete("/:id", authenticateToken, requireAdmin, deleteService);

module.exports = router;
