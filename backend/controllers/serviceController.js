const { prisma } = require("../config/database");

// Un service est un produit avec isService=true et stock=0
const listServices = async (req, res) => {
  try {
    const services = await prisma.produit.findMany({
      where: { isService: true },
      orderBy: { nom: "asc" },
    });
    res.json({ services });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const getService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const service = await prisma.produit.findFirst({
      where: { id, isService: true },
    });
    if (!service)
      return res.status(404).json({ message: "Service non trouvé" });
    res.json({ service });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const createService = async (req, res) => {
  try {
    const { nom, description, prixVenteTTC, categorieId, tauxTVA } = req.body;
    if (!nom || prixVenteTTC === undefined)
      return res.status(400).json({ message: "Nom et prix sont requis" });
    const service = await prisma.produit.create({
      data: {
        nom,
        description,
        prix: Number(prixVenteTTC),
        prixVenteTTC: Number(prixVenteTTC),
        tauxTVA: tauxTVA !== undefined ? Number(tauxTVA) : null,
        stock: 0,
        isService: true,
        categorieId: categorieId ? Number(categorieId) : null,
      },
    });
    res.status(201).json({ message: "Service créé", service });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const updateService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nom, description, prixVenteTTC, categorieId, tauxTVA } = req.body;
    const service = await prisma.produit.update({
      where: { id },
      data: {
        nom,
        description,
        prix: prixVenteTTC !== undefined ? Number(prixVenteTTC) : undefined,
        prixVenteTTC:
          prixVenteTTC !== undefined ? Number(prixVenteTTC) : undefined,
        tauxTVA: tauxTVA !== undefined ? Number(tauxTVA) : undefined,
        stock: 0,
        isService: true,
        categorieId:
          categorieId !== undefined ? Number(categorieId) : undefined,
      },
    });
    res.json({ message: "Service mis à jour", service });
  } catch (e) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Service non trouvé" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const deleteService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.produit.delete({ where: { id } });
    res.json({ message: "Service supprimé" });
  } catch (e) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Service non trouvé" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
};
