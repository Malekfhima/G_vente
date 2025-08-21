const { prisma } = require("../config/database");

const listFournisseurs = async (req, res) => {
  try {
    const fournisseurs = await prisma.fournisseur.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ fournisseurs });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const getFournisseur = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fournisseur = await prisma.fournisseur.findUnique({ where: { id } });
    if (!fournisseur)
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    res.json({ fournisseur });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const createFournisseur = async (req, res) => {
  try {
    const { nom, email, telephone, adresse } = req.body;
    if (!nom) return res.status(400).json({ message: "Nom requis" });
    const fournisseur = await prisma.fournisseur.create({
      data: { nom, email, telephone, adresse },
    });
    res.status(201).json({ message: "Fournisseur créé", fournisseur });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const updateFournisseur = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nom, email, telephone, adresse } = req.body;
    const fournisseur = await prisma.fournisseur.update({
      where: { id },
      data: { nom, email, telephone, adresse },
    });
    res.json({ message: "Fournisseur mis à jour", fournisseur });
  } catch (e) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const deleteFournisseur = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.fournisseur.delete({ where: { id } });
    res.json({ message: "Fournisseur supprimé" });
  } catch (e) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  listFournisseurs,
  getFournisseur,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
};
