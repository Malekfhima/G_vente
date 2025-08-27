const { prisma } = require("../config/database");
const bcrypt = require("bcryptjs");
const config = require("../config/config");

// Récupérer tous les vendeurs
const getAllVendeurs = async (req, res) => {
  try {
    const vendeurs = await prisma.user.findMany({
      where: {
        role: "user", // Seulement les vendeurs (pas les admins)
      },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas inclure le mot de passe
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(vendeurs);
  } catch (error) {
    console.error("Erreur lors de la récupération des vendeurs:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Récupérer un vendeur par ID
const getVendeurById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendeur = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
        role: "user", // Seulement les vendeurs
      },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas inclure le mot de passe
      },
    });

    if (!vendeur) {
      return res.status(404).json({ message: "Vendeur non trouvé" });
    }

    res.json(vendeur);
  } catch (error) {
    console.error("Erreur lors de la récupération du vendeur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Créer un nouveau vendeur
const createVendeur = async (req, res) => {
  try {
    const { email, nom, password } = req.body;

    // Vérification des champs requis
    if (!email || !nom || !password) {
      return res.status(400).json({
        message: "Email, nom et mot de passe sont requis",
      });
    }

    // Vérification du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format d'email invalide",
      });
    }

    // Vérification de la longueur du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(
      password,
      config.security.bcryptRounds
    );

    const vendeur = await prisma.user.create({
      data: {
        email,
        nom,
        password: hashedPassword,
        role: "user", // Toujours créer comme vendeur
      },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas inclure le mot de passe
      },
    });

    res.status(201).json({
      message: "Vendeur créé avec succès",
      vendeur,
    });
  } catch (error) {
    console.error("Erreur lors de la création du vendeur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Mettre à jour un vendeur
const updateVendeur = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nom, password } = req.body;

    // Vérification que le vendeur existe
    const existingVendeur = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
        role: "user", // Seulement les vendeurs
      },
    });

    if (!existingVendeur) {
      return res.status(404).json({ message: "Vendeur non trouvé" });
    }

    // Préparer les données de mise à jour
    const updateData = {};

    if (email) {
      // Vérification du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Format d'email invalide",
        });
      }

      // Vérifier si l'email existe déjà (sauf pour cet utilisateur)
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: parseInt(id) },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé",
        });
      }

      updateData.email = email;
    }

    if (nom) {
      updateData.nom = nom;
    }

    if (password) {
      // Vérification de la longueur du mot de passe
      if (password.length < 6) {
        return res.status(400).json({
          message: "Le mot de passe doit contenir au moins 6 caractères",
        });
      }

      // Hasher le nouveau mot de passe
      updateData.password = await bcrypt.hash(
        password,
        config.security.bcryptRounds
      );
    }

    const vendeur = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas inclure le mot de passe
      },
    });

    res.json({
      message: "Vendeur mis à jour avec succès",
      vendeur,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du vendeur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Supprimer un vendeur
const deleteVendeur = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification que le vendeur existe
    const existingVendeur = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
        role: "user", // Seulement les vendeurs
      },
    });

    if (!existingVendeur) {
      return res.status(404).json({ message: "Vendeur non trouvé" });
    }

    // Vérification qu'aucune vente n'est liée à ce vendeur
    const ventes = await prisma.vente.findMany({
      where: { userId: parseInt(id) },
    });

    if (ventes.length > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer ce vendeur car il a des ventes associées",
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Vendeur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du vendeur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Rechercher des vendeurs
const searchVendeurs = async (req, res) => {
  try {
    const { q } = req.query;

    let where = {
      role: "user", // Seulement les vendeurs
    };

    // Recherche par nom ou email
    if (q) {
      where.OR = [{ nom: { contains: q } }, { email: { contains: q } }];
    }

    const vendeurs = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Ne pas inclure le mot de passe
      },
      orderBy: { nom: "asc" },
    });

    res.json(vendeurs);
  } catch (error) {
    console.error("Erreur lors de la recherche des vendeurs:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  getAllVendeurs,
  getVendeurById,
  createVendeur,
  updateVendeur,
  deleteVendeur,
  searchVendeurs,
};
