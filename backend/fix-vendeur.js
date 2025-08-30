#!/usr/bin/env node

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function fixVendeur() {
  try {
    console.log("🔧 Correction du compte vendeur...");

    // Supprimer l'ancien vendeur s'il existe
    await prisma.user.deleteMany({
      where: {
        email: "vendeur@gestion-vente.com"
      }
    });

    // Créer un nouveau vendeur
    const hashedPassword = await bcrypt.hash("vendeur123", 12);
    
    const vendeur = await prisma.user.create({
      data: {
        email: "vendeur@gestion-vente.com",
        password: hashedPassword,
        nom: "Vendeur Test",
        role: "user",
      },
    });

    console.log("✅ Vendeur recréé avec succès:", vendeur.email);
    console.log("📝 Identifiants: vendeur@gestion-vente.com / vendeur123");

  } catch (error) {
    console.error("❌ Erreur lors de la correction du vendeur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVendeur();
