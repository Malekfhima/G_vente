const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

router.get("/", listServices);
router.get("/:id", getService);
router.post("/", authenticateToken, requireAdmin, createService);
router.put("/:id", authenticateToken, requireAdmin, updateService);
router.delete("/:id", authenticateToken, requireAdmin, deleteService);

module.exports = router;
