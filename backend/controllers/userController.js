const bcrypt = require("bcryptjs");
const { prisma } = require("../config/database");
const config = require("../config/config");

// Récupérer tous les utilisateurs (admin seulement)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ventes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ users });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Récupérer un utilisateur par ID (admin seulement)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ventes: {
          select: {
            id: true,
            quantite: true,
            prixTotal: true,
            date: true,
            produit: {
              select: {
                id: true,
                nom: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        _count: {
          select: {
            ventes: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Créer un nouvel utilisateur (admin seulement)
const createUser = async (req, res) => {
  try {
    const { email, password, nom, role = "user" } = req.body;

    // Vérification des champs requis
    if (!email || !password || !nom) {
      return res.status(400).json({ message: "Email, mot de passe et nom sont requis" });
    }

    // Validation du rôle
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide. Doit être 'admin' ou 'user'" });
    }

    // Vérification si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        role,
      },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Mettre à jour un utilisateur (admin seulement)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nom, role, password } = req.body;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Validation du rôle
    if (role && !["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide. Doit être 'admin' ou 'user'" });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    // Préparer les données de mise à jour
    const updateData = {};
    if (email) updateData.email = email;
    if (nom) updateData.nom = nom;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, config.security.bcryptRounds);
    }

    // Mise à jour de l'utilisateur
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "Utilisateur mis à jour avec succès",
      user,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Supprimer un utilisateur (admin seulement)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    // Empêcher la suppression de son propre compte
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer l'utilisateur (les ventes seront supprimées en cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Obtenir les statistiques des utilisateurs (admin seulement)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const adminUsers = await prisma.user.count({
      where: { role: "admin" },
    });
    const regularUsers = await prisma.user.count({
      where: { role: "user" },
    });

    // Utilisateurs les plus actifs (avec le plus de ventes)
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        _count: {
          select: {
            ventes: true,
          },
        },
      },
      orderBy: {
        ventes: {
          _count: "desc",
        },
      },
      take: 5,
    });

    res.json({
      stats: {
        totalUsers,
        adminUsers,
        regularUsers,
        topUsers,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
};
