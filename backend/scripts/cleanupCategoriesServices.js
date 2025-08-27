require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Suppression de toutes les catégories et services...");

  // Détacher toutes les catégories des produits
  await prisma.produit.updateMany({ data: { categorieId: null } });

  // Supprimer tous les services (produits isService=true)
  const deletedServices = await prisma.produit.deleteMany({
    where: { isService: true },
  });

  // Supprimer toutes les catégories
  const deletedCategories = await prisma.categorie.deleteMany({});

  console.log(`✅ Services supprimés: ${deletedServices.count}`);
  console.log(`✅ Catégories supprimées: ${deletedCategories.count}`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur de nettoyage:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
