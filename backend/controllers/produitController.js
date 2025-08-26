const { prisma } = require("../config/database");
const {
  generateUniqueBarcode,
  validateBarcode,
  barcodeExists,
} = require("../utils/barcodeGenerator");

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
    const { nom, description, prix, stock, categorie, isService, codeBarre } =
      req.body;

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

    // Gestion du code-barre
    let finalCodeBarre = codeBarre;
    if (codeBarre) {
      // Vérifier si le code-barre est valide
      if (!validateBarcode(codeBarre)) {
        return res.status(400).json({
          message:
            "Le code-barre doit être un code EAN-13 valide (13 chiffres)",
        });
      }

      // Vérifier si le code-barre existe déjà
      if (await barcodeExists(codeBarre)) {
        return res.status(400).json({
          message: "Ce code-barre existe déjà",
        });
      }
    } else {
      // Générer un code-barre automatiquement
      try {
        finalCodeBarre = await generateUniqueBarcode();
      } catch (error) {
        return res.status(500).json({
          message: "Erreur lors de la génération du code-barre",
        });
      }
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
        codeBarre: finalCodeBarre,
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
    const { nom, description, prix, stock, categorie, isService, codeBarre } =
      req.body;

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

    // Gestion du code-barre
    let finalCodeBarre = codeBarre;
    if (codeBarre && codeBarre !== existingProduit.codeBarre) {
      // Vérifier si le code-barre est valide
      if (!validateBarcode(codeBarre)) {
        return res.status(400).json({
          message:
            "Le code-barre doit être un code EAN-13 valide (13 chiffres)",
        });
      }

      // Vérifier si le code-barre existe déjà
      if (await barcodeExists(codeBarre, parseInt(id))) {
        return res.status(400).json({
          message: "Ce code-barre existe déjà",
        });
      }
    } else if (!codeBarre && !existingProduit.codeBarre) {
      // Générer un code-barre automatiquement si le produit n'en a pas
      try {
        finalCodeBarre = await generateUniqueBarcode();
      } catch (error) {
        return res.status(500).json({
          message: "Erreur lors de la génération du code-barre",
        });
      }
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
        codeBarre: finalCodeBarre,
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
    const { q, categorie, minPrix, maxPrix, codeBarre } = req.query;

    let where = {};

    // Recherche par code-barre (priorité)
    if (codeBarre) {
      where.codeBarre = codeBarre;
    } else if (q) {
      // Recherche par nom ou description (SQLite ne supporte pas mode: "insensitive")
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

// Rechercher un produit par code-barre
const getProduitByCodeBarre = async (req, res) => {
  try {
    const { codeBarre } = req.params;

    if (!codeBarre) {
      return res.status(400).json({ message: "Code-barre requis" });
    }

    const produit = await prisma.produit.findUnique({
      where: { codeBarre: codeBarre },
    });

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(produit);
  } catch (error) {
    console.error(
      "Erreur lors de la recherche du produit par code-barre:",
      error
    );
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
  getProduitByCodeBarre,
};
