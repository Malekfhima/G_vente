const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Test de connexion
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Connexion à la base de données réussie");
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données:", error);
  }
}

// Fermeture de la connexion
async function closeConnection() {
  await prisma.$disconnect();
}

module.exports = { prisma, testConnection, closeConnection };



