require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const { generateUniqueBarcode } = require("../utils/barcodeGenerator");

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
      isService: true,
    },
    {
      nom: "Impression Couleur - A4",
      description: "Par page",
      prix: 0.8,
      stock: 0,
      categorie: "IMPRESSION",
      isService: true,
    },
    {
      nom: "Photocopie N/B - A4",
      description: "Par page",
      prix: 0.15,
      stock: 0,
      categorie: "PHOTOCOPIE",
      isService: true,
    },
    {
      nom: "Photocopie Couleur - A4",
      description: "Par page",
      prix: 0.7,
      stock: 0,
      categorie: "PHOTOCOPIE",
      isService: true,
    },
    // Plastification / Reliure
    {
      nom: "Plastification A4",
      description: "Unité",
      prix: 2.5,
      stock: 0,
      categorie: "PLASTIFICATION",
      isService: true,
    },
    {
      nom: "Plastification A3",
      description: "Unité",
      prix: 4.0,
      stock: 0,
      categorie: "PLASTIFICATION",
      isService: true,
    },
    {
      nom: "Reliure Spirale (jusqu'à 50p)",
      description: "Unité",
      prix: 3.0,
      stock: 0,
      categorie: "RELIURE",
      isService: true,
    },
    {
      nom: "Reliure Spirale (jusqu'à 100p)",
      description: "Unité",
      prix: 5.0,
      stock: 0,
      categorie: "RELIURE",
      isService: true,
    },
    // Scolarité
    {
      nom: "Inscription scolaire",
      description: "Frais de dossier",
      prix: 15.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Attestation / Certificat",
      description: "Délivrance de document",
      prix: 2.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    // Services scolaires détaillés
    {
      nom: "Duplicata carte étudiant",
      description: "Réédition carte étudiant",
      prix: 5.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Certificat de scolarité",
      description: "Délivrance certificat",
      prix: 3.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Relevé de notes (par semestre)",
      description: "Impression et signature",
      prix: 4.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Attestation de réussite",
      description: "Délivrance attestation",
      prix: 3.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Traduction simple (par page)",
      description: "Traduction non assermentée",
      prix: 10.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Dossier d'inscription (complet)",
      description: "Préparation + vérification",
      prix: 20.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Scan document (par page)",
      description: "Numérisation et envoi",
      prix: 0.3,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Photocopie dossier (20 pages)",
      description: "Forfait 20 pages N/B",
      prix: 2.5,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Reliure dossier scolaire",
      description: "Spirale + couverture",
      prix: 6.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Plastification carte",
      description: "Format ID",
      prix: 1.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Photo d'identité (4 pièces)",
      description: "Impression 3.5x4.5",
      prix: 5.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Lettre de motivation (rédaction)",
      description: "Saisie + mise en forme",
      prix: 7.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
    {
      nom: "Curriculum Vitae (rédaction)",
      description: "Saisie + mise en page",
      prix: 8.0,
      stock: 0,
      categorie: "SCOLARITE",
      isService: true,
    },
  ];

  for (const produitData of produits) {
    // Générer un code-barre pour les services (optionnel)
    let codeBarre = null;
    if (!produitData.isService) {
      try {
        codeBarre = await generateUniqueBarcode();
      } catch (error) {
        console.log(
          `⚠️ Impossible de générer un code-barre pour ${produitData.nom}`
        );
      }
    }

    const produit = await prisma.produit.upsert({
      where: { nom: produitData.nom },
      update: {},
      create: {
        ...produitData,
        prixVenteTTC: produitData.prix, // Assurer la cohérence des prix
        codeBarre,
        // Ces éléments sont des services, on laisse stock à 0
      },
    });
    console.log(
      `✅ Produit créé: ${produit.nom}${
        codeBarre ? ` (Code: ${codeBarre})` : ""
      }`
    );
  }

  // Création d'une vente groupée de test (transactionId unique)
  const { randomUUID } = require("crypto");
  const transactionId = randomUUID();

  // Récupérer les premiers produits créés pour les ventes de test
  const produitsDisponibles = await prisma.produit.findMany({
    take: 5,
    orderBy: { id: "asc" },
  });

  if (produitsDisponibles.length >= 2) {
    const ventes = [
      { quantite: 2, userId: vendeur.id, produitId: produitsDisponibles[2].id }, // 3ème produit
      { quantite: 1, userId: vendeur.id, produitId: produitsDisponibles[4].id }, // 5ème produit
    ];

    for (const item of ventes) {
      const produit = await prisma.produit.findUnique({
        where: { id: item.produitId },
      });
      const prixTotal =
        (produit?.prixVenteTTC || produit?.prix || 0) * item.quantite;
      const vente = await prisma.vente.create({
        data: { ...item, prixTotal, transactionId },
      });
      console.log(
        `✅ Vente (groupée) créée: ${vente.quantite}x produit ID ${vente.produitId}`
      );
    }
  } else {
    console.log("⚠️ Pas assez de produits pour créer des ventes de test");
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
