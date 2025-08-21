const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

router.use(authenticateToken);
router.get("/", listClients);
router.get("/:id", getClient);
router.post("/", requireAdmin, createClient);
router.put("/:id", requireAdmin, updateClient);
router.delete("/:id", requireAdmin, deleteClient);

module.exports = router;


