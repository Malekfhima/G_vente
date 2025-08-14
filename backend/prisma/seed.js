const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config = require("../config/config");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding de la base de données...");

  // Création d'un utilisateur admin
  const hashedPassword = await bcrypt.hash("admin123", config.security.bcryptRounds);

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
  const vendeurPassword = await bcrypt.hash("vendeur123", config.security.bcryptRounds);

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
  const categories = ["Électronique", "Vêtements", "Livres", "Maison", "Sport"];

  // Création de produits de test
  const produits = [
    {
      nom: "Smartphone Samsung Galaxy",
      description: 'Smartphone Android avec écran 6.1" et appareil photo 48MP',
      prix: 299.99,
      stock: 50,
      categorie: "Électronique",
    },
    {
      nom: "Laptop HP Pavilion",
      description: 'Ordinateur portable 15.6" avec processeur Intel i5',
      prix: 699.99,
      stock: 25,
      categorie: "Électronique",
    },
    {
      nom: "T-shirt en coton",
      description: "T-shirt confortable en coton 100% bio",
      prix: 19.99,
      stock: 100,
      categorie: "Vêtements",
    },
    {
      nom: "Jeans slim fit",
      description: "Jeans moderne avec coupe slim et stretch",
      prix: 49.99,
      stock: 75,
      categorie: "Vêtements",
    },
    {
      nom: 'Livre "Le Petit Prince"',
      description: "Édition illustrée du classique de Saint-Exupéry",
      prix: 12.99,
      stock: 200,
      categorie: "Livres",
    },
    {
      nom: "Canapé 3 places",
      description: "Canapé confortable en tissu avec accoudoirs rembourrés",
      prix: 599.99,
      stock: 10,
      categorie: "Maison",
    },
    {
      nom: "Ballon de football",
      description: "Ballon officiel taille 5 pour matchs professionnels",
      prix: 29.99,
      stock: 60,
      categorie: "Sport",
    },
  ];

  for (const produitData of produits) {
    const produit = await prisma.produit.upsert({
      where: { nom: produitData.nom },
      update: {},
      create: produitData,
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



