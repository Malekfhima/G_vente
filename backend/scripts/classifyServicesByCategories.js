require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Mapping simple nom categorie -> id (création si manquante)
const CATEGORY_NAMES = [
  "IMPRESSION",
  "PHOTOCOPIE",
  "PLASTIFICATION",
  "RELIURE",
  "SCOLARITE",
  "SERVICES",
];

function inferCategoryNameFromServiceName(serviceName) {
  const name = (serviceName || "").toUpperCase();
  if (name.includes("IMPRESSION")) return "IMPRESSION";
  if (name.includes("PHOTOCOP")) return "PHOTOCOPIE";
  if (name.includes("PLASTIF")) return "PLASTIFICATION";
  if (name.includes("RELIURE")) return "RELIURE";
  if (
    name.includes("SCOLAR") ||
    name.includes("CERTIFICAT") ||
    name.includes("ATTESTATION") ||
    name.includes("INSCRIPTION") ||
    name.includes("DOSSIER")
  )
    return "SCOLARITE";
  return null;
}

async function ensureCategories() {
  const existing = await prisma.categorie.findMany();
  const byName = new Map(existing.map((c) => [c.nom.toUpperCase(), c]));
  const created = [];
  for (const nom of CATEGORY_NAMES) {
    if (!byName.has(nom)) {
      const c = await prisma.categorie.create({ data: { nom } });
      created.push(c);
      byName.set(nom, c);
    }
  }
  return byName;
}

async function main() {
  console.log("🗂  Classification des services par catégories...");

  const categoriesByName = await ensureCategories();

  // Récupérer tous les services
  const services = await prisma.produit.findMany({
    where: { isService: true },
  });

  let updated = 0;

  for (const s of services) {
    // Si deja catégorisé, on passe
    if (s.categorieId) continue;

    // 1) Catégorie par champ texte existant
    const fromText = (s.categorie || "").toUpperCase().trim();
    let target = categoriesByName.get(fromText) || null;

    // 2) Sinon, inférer depuis le nom
    if (!target) {
      const inferred = inferCategoryNameFromServiceName(s.nom);
      if (inferred) target = categoriesByName.get(inferred);
    }

    // 3) Sinon, basculer dans "SERVICES"
    if (!target) target = categoriesByName.get("SERVICES");

    if (target) {
      await prisma.produit.update({
        where: { id: s.id },
        data: { categorieId: target.id },
      });
      updated += 1;
      console.log(`✅ ${s.nom} -> ${target.nom}`);
    }
  }

  console.log(`\n🎉 Classification terminée. Services mis à jour: ${updated}`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur de classification:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
