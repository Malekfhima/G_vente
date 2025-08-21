const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config = require("../config/config");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding de la base de données...");

  // Création d'un utilisateur admin
  const hashedPassword = await bcrypt.hash(
    "admin123",
    config.security.bcryptRounds
  );

  const admin = await prisma.user.upsert({
    where: { email: "admin@gestion-vente.com" },
    update: {},
    create: {
      email: "admin@gestion-vente.com",
      password: hashedPassword,
      nom: "Administrateur",
      role: "admin",
    },
  });

  console.log("✅ Utilisateur admin créé:", admin.email);

  // Création d'un utilisateur vendeur
  const vendeurPassword = await bcrypt.hash(
    "vendeur123",
    config.security.bcryptRounds
  );

  const vendeur = await prisma.user.upsert({
    where: { email: "vendeur@gestion-vente.com" },
    update: {},
    create: {
      email: "vendeur@gestion-vente.com",
      password: vendeurPassword,
      nom: "Vendeur Test",
      role: "user",
    },
  });

  console.log("✅ Utilisateur vendeur créé:", vendeur.email);

  // Création de catégories de produits
  const categories = [
    "SERVICES",
    "IMPRESSION",
    "PHOTOCOPIE",
    "PLASTIFICATION",
    "RELIURE",
    "SCOLARITE",
  ];

  // Création de produits de test
  const produits = [
    // Services scolaires - Impression / Photocopie
    {
      nom: "Impression N/B - A4",
      description: "Par page",
      prix: 0.2,
      stock: 0,
      categorie: "IMPRESSION",
    },
    {
      nom: "Impression Couleur - A4",
      description: "Par page",
      prix: 0.8,
      stock: 0,
      categorie: "IMPRESSION",
    },
    {
      nom: "Photocopie N/B - A4",
      description: "Par page",
      prix: 0.15,
      stock: 0,
      categorie: "PHOTOCOPIE",
    },
    {
      nom: "Photocopie Couleur - A4",
      description: "Par page",
      prix: 0.7,
      stock: 0,
      categorie: "PHOTOCOPIE",
    },
    // Plastification / Reliure
    {
      nom: "Plastification A4",
      description: "Unité",
      prix: 2.5,
      stock: 0,
      categorie: "PLASTIFICATION",
    },
    {
      nom: "Plastification A3",
      description: "Unité",
      prix: 4.0,
      stock: 0,
      categorie: "PLASTIFICATION",
    },
    {
      nom: "Reliure Spirale (jusqu'à 50p)",
      description: "Unité",
      prix: 3.0,
      stock: 0,
      categorie: "RELIURE",
    },
    {
      nom: "Reliure Spirale (jusqu'à 100p)",
      description: "Unité",
      prix: 5.0,
      stock: 0,
      categorie: "RELIURE",
    },
    // Scolarité
    {
      nom: "Inscription scolaire",
      description: "Frais de dossier",
      prix: 15.0,
      stock: 0,
      categorie: "SCOLARITE",
    },
    {
      nom: "Attestation / Certificat",
      description: "Délivrance de document",
      prix: 2.0,
      stock: 0,
      categorie: "SCOLARITE",
    },
  ];

  for (const produitData of produits) {
    const produit = await prisma.produit.upsert({
      where: { nom: produitData.nom },
      update: {},
      create: {
        ...produitData,
        // Ces éléments sont des services, on laisse stock à 0
      },
    });
    console.log(`✅ Produit créé: ${produit.nom}`);
  }

  // Création de quelques ventes de test
  const ventes = [
    {
      quantite: 2,
      prixTotal: 39.98,
      userId: vendeur.id,
      produitId: 3, // T-shirt
    },
    {
      quantite: 1,
      prixTotal: 29.99,
      userId: vendeur.id,
      produitId: 7, // Ballon de football
    },
  ];

  for (const venteData of ventes) {
    const vente = await prisma.vente.create({
      data: venteData,
    });
    console.log(
      `✅ Vente créée: ${vente.quantite}x produit ID ${vente.produitId}`
    );
  }

  console.log("🎉 Seeding terminé avec succès!");
  console.log("\n📋 Comptes de test créés:");
  console.log("👑 Admin: admin@gestion-vente.com / admin123");
  console.log("👤 Vendeur: vendeur@gestion-vente.com / vendeur123");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
