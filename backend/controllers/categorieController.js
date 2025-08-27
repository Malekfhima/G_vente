const { prisma } = require("../config/database");

const listCategories = async (req, res) => {
  try {
    const categories = await prisma.categorie.findMany({
      orderBy: { nom: "asc" },
    });
    res.json({ categories });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const getCategorie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const categorie = await prisma.categorie.findUnique({ where: { id } });
    if (!categorie)
      return res.status(404).json({ message: "Catégorie non trouvée" });
    res.json({ categorie });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;
    if (!nom) return res.status(400).json({ message: "Nom requis" });
    const categorie = await prisma.categorie.create({
      data: { nom, description },
    });
    res.status(201).json({ message: "Catégorie créée", categorie });
  } catch (e) {
    if (e.code === "P2002")
      return res.status(400).json({ message: "Nom de catégorie déjà utilisé" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const updateCategorie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nom, description } = req.body;
    const categorie = await prisma.categorie.update({
      where: { id },
      data: { nom, description },
    });
    res.json({ message: "Catégorie mise à jour", categorie });
  } catch (e) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Catégorie non trouvée" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const deleteCategorie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Détacher les produits de cette catégorie
    await prisma.produit.updateMany({
      where: { categorieId: id },
      data: { categorieId: null },
    });
    await prisma.categorie.delete({ where: { id } });
    res.json({ message: "Catégorie supprimée" });
  } catch (e) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Catégorie non trouvée" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  listCategories,
  getCategorie,
  createCategorie,
  updateCategorie,
  deleteCategorie,
};
