#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Vérification de l'installation...\n");

// Vérifier Node.js
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);

  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);
  if (majorVersion < 16) {
    console.log("❌ Node.js version 16 ou supérieure requise");
    process.exit(1);
  }
} catch (error) {
  console.log("❌ Node.js non trouvé");
  process.exit(1);
}

// Vérifier npm
try {
  const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
  console.log(`✅ npm version: ${npmVersion}`);
} catch (error) {
  console.log("❌ npm non trouvé");
  process.exit(1);
}

// Vérifier les fichiers de configuration
const requiredFiles = [
  "package.json",
  "backend/package.json",
  "frontend/package.json",
  "backend/prisma/schema.prisma",
  "frontend/vite.config.js",
  "frontend/tailwind.config.js",
];

console.log("\n📁 Vérification des fichiers de configuration...");
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} manquant`);
  }
}

// Vérifier les fichiers .env
const envFiles = ["backend/.env", "frontend/.env"];

console.log("\n🔐 Vérification des fichiers d'environnement...");
for (const file of envFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`⚠️  ${file} manquant - copiez le fichier .env.example`);
  }
}

// Vérifier les node_modules
const nodeModulesDirs = [
  "node_modules",
  "backend/node_modules",
  "frontend/node_modules",
];

console.log("\n📦 Vérification des dépendances...");
for (const dir of nodeModulesDirs) {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`⚠️  ${dir} manquant - exécutez npm install`);
  }
}

console.log("\n🎉 Vérification terminée !");
console.log("\n📋 Prochaines étapes :");
console.log(
  "1. Si des fichiers .env manquent, copiez les fichiers .env.example"
);
console.log("2. Si des node_modules manquent, exécutez npm run install:all");
console.log("3. Pour démarrer l'application, exécutez npm run dev");
console.log("4. Pour configurer la base de données, exécutez npm run db:setup");
