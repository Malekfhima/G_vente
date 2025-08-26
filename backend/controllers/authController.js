const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/database");
const config = require("../config/config");

// Inscription d'un nouvel utilisateur
const register = async (req, res) => {
  try {
    const { email, password, nom, role = "user" } = req.body;

    // Vérification des champs requis
    if (!email || !password || !nom) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérification si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(
      password,
      config.security.bcryptRounds
    );

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
      },
    });

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Connexion d'un utilisateur
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs requis
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );

    // Retour des informations utilisateur (sans le mot de passe)
    const userInfo = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      role: user.role,
    };

    res.json({
      message: "Connexion réussie",
      user: userInfo,
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Récupération du profil utilisateur
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};

// Changer le mot de passe (utilisateur connecté)
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({
          message:
            "Champs requis: currentPassword, newPassword, confirmPassword",
        });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "La confirmation ne correspond pas" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          message:
            "Le nouveau mot de passe doit contenir au moins 6 caractères",
        });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports.changePassword = changePassword;
