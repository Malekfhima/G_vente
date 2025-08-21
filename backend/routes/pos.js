const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// Ouvrir le tiroir-caisse (placeholder logiciel)
router.post("/open-drawer", authenticateToken, async (req, res) => {
  try {
    // Ici on pourrait envoyer une commande ESC/POS à l'imprimante pour ouvrir le tiroir
    // Pour l'instant on retourne simplement un succès
    res.json({ success: true, message: "Tiroir ouvert" });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "Erreur ouverture tiroir" });
  }
});

module.exports = router;
