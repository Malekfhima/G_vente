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
    if (!nom || !prix) {
      return res.status(400).json({
        message: "Nom et prix sont requis",
      });
    }

    // Vérification que le prix est positif
    if (prix <= 0) {
      return res.status(400).json({
        message: "Le prix doit être positif",
      });
    }

    // Pour les services, le stock est toujours 0
    // Pour les produits physiques, le stock doit être défini et >= 0
    let stockValue = stock;
    if (isService === true) {
      stockValue = 0;
    } else if (stock === undefined || stock < 0) {
      return res.status(400).json({
        message:
          "Le stock doit être défini et >= 0 pour les produits physiques",
      });
    }

    const produit = await prisma.produit.create({
      data: {
        nom,
        description,
        prix: parseFloat(prix),
        stock: parseInt(stockValue),
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

    // Gestion du stock selon le type de produit
    let stockValue = stock;
    if (isService === true) {
      stockValue = 0; // Les services ont toujours un stock de 0
    } else if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: "Le stock doit être >= 0" });
    }

    const produit = await prisma.produit.update({
      where: { id: parseInt(id) },
      data: {
        nom,
        description,
        prix: prix !== undefined ? parseFloat(prix) : undefined,
        stock: stockValue !== undefined ? parseInt(stockValue) : undefined,
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
