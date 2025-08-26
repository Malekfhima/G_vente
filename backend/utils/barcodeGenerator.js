const { prisma } = require("../config/database");

/**
 * Génère un code-barre unique de 13 chiffres (format EAN-13)
 * @returns {Promise<string>} Code-barre unique
 */
async function generateUniqueBarcode() {
  let barcode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    // Générer un code-barre de 12 chiffres
    const randomDigits =
      Math.floor(Math.random() * 900000000000) + 100000000000;

    // Calculer la clé de contrôle (13ème chiffre)
    const digits = randomDigits.toString().split("").map(Number);
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    barcode = randomDigits.toString() + checkDigit;

    // Vérifier si le code-barre existe déjà
    const existingProduct = await prisma.produit.findUnique({
      where: { codeBarre: barcode },
    });

    if (!existingProduct) {
      isUnique = true;
    }

    attempts++;
  }

  if (!isUnique) {
    throw new Error(
      "Impossible de générer un code-barre unique après plusieurs tentatives"
    );
  }

  return barcode;
}

/**
 * Valide un code-barre EAN-13
 * @param {string} barcode - Code-barre à valider
 * @returns {boolean} True si valide
 */
function validateBarcode(barcode) {
  if (!barcode || barcode.length !== 13) {
    return false;
  }

  const digits = barcode.split("").map(Number);

  // Vérifier que tous les caractères sont des chiffres
  if (digits.some(isNaN)) {
    return false;
  }

  // Calculer la clé de contrôle
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  const actualCheckDigit = digits[12];

  return expectedCheckDigit === actualCheckDigit;
}

/**
 * Vérifie si un code-barre existe déjà
 * @param {string} barcode - Code-barre à vérifier
 * @param {number} excludeId - ID du produit à exclure (pour les mises à jour)
 * @returns {Promise<boolean>} True si le code-barre existe
 */
async function barcodeExists(barcode, excludeId = null) {
  const where = { codeBarre: barcode };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingProduct = await prisma.produit.findFirst({ where });
  return !!existingProduct;
}

module.exports = {
  generateUniqueBarcode,
  validateBarcode,
  barcodeExists,
};

