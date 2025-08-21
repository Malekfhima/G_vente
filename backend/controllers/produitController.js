const { prisma } = require("../config/database");

// Récupérer tous les produits
const getAllProduits = async (req, res) => {
  try {
    const produits = await prisma.produit.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(produits);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Récupérer un produit par ID
const getProduitById = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await prisma.produit.findUnique({
      where: { id: parseInt(id) },
    });

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(produit);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Créer un nouveau produit
const createProduit = async (req, res) => {
  try {
    const { nom, description, prix, stock, categorie, isService } = req.body;

    // Vérification des champs requis
    if (!nom || !prix || (isService !== true && stock === undefined)) {
      return res.status(400).json({
        message:
          "Nom et prix sont requis. Le stock est requis pour un produit non-service",
      });
    }

    // Vérification que le prix et le stock sont positifs
    if (prix <= 0 || (isService !== true && stock < 0)) {
      return res.status(400).json({
        message: "Le prix doit être positif et le stock doit être >= 0",
      });
    }

    const produit = await prisma.produit.create({
      data: {
        nom,
        description,
        prix: parseFloat(prix),
        stock: isService === true ? 0 : parseInt(stock),
        isService: Boolean(isService),
        categorie,
      },
    });

    res.status(201).json({
      message: "Produit créé avec succès",
      produit,
    });
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Mettre à jour un produit
const updateProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, stock, categorie, isService } = req.body;

    // Vérification que le produit existe
    const existingProduit = await prisma.produit.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Vérification des données
    if (prix !== undefined && prix <= 0) {
      return res.status(400).json({ message: "Le prix doit être positif" });
    }

    if (isService !== true && stock !== undefined && stock < 0) {
      return res.status(400).json({ message: "Le stock doit être >= 0" });
    }

    const produit = await prisma.produit.update({
      where: { id: parseInt(id) },
      data: {
        nom,
        description,
        prix: prix !== undefined ? parseFloat(prix) : undefined,
        stock:
          isService === true
            ? 0
            : stock !== undefined
            ? parseInt(stock)
            : undefined,
        isService: isService !== undefined ? Boolean(isService) : undefined,
        categorie,
      },
    });

    res.json({
      message: "Produit mis à jour avec succès",
      produit,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Supprimer un produit
const deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification que le produit existe
    const existingProduit = await prisma.produit.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Vérification qu'aucune vente n'est liée à ce produit
    const ventes = await prisma.vente.findMany({
      where: { produitId: parseInt(id) },
    });

    if (ventes.length > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer ce produit car il a des ventes associées",
      });
    }

    await prisma.produit.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Rechercher des produits
const searchProduits = async (req, res) => {
  try {
    const { q, categorie, minPrix, maxPrix } = req.query;

    let where = {};

    // Recherche par nom ou description (SQLite ne supporte pas mode: "insensitive")
    if (q) {
      where.OR = [{ nom: { contains: q } }, { description: { contains: q } }];
    }

    // Filtre par catégorie
    if (categorie) {
      where.categorie = categorie;
    }

    // Filtre par prix
    if (minPrix || maxPrix) {
      where.prix = {};
      if (minPrix) where.prix.gte = parseFloat(minPrix);
      if (maxPrix) where.prix.lte = parseFloat(maxPrix);
    }

    const produits = await prisma.produit.findMany({
      where,
      orderBy: { nom: "asc" },
    });

    res.json(produits);
  } catch (error) {
    console.error("Erreur lors de la recherche des produits:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  getAllProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
  searchProduits,
};
