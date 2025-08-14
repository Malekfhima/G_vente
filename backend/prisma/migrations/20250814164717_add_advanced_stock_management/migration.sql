-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimum" INTEGER NOT NULL DEFAULT 10,
    "stockMaximum" INTEGER NOT NULL DEFAULT 100,
    "categorie" TEXT,
    "codeBarre" TEXT,
    "reference" TEXT,
    "prixAchat" REAL,
    "fournisseurId" INTEGER,
    "dateExpiration" DATETIME,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Produit_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantite" INTEGER NOT NULL,
    "prixTotal" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "produitId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vente_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MouvementStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "quantiteAvant" INTEGER NOT NULL,
    "quantiteApres" INTEGER NOT NULL,
    "raison" TEXT,
    "reference" TEXT,
    "userId" INTEGER NOT NULL,
    "produitId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MouvementStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MouvementStock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fournisseur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "contact" TEXT,
    "notes" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AlerteStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "produitId" INTEGER NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlerteStock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Produit_nom_key" ON "Produit"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Produit_codeBarre_key" ON "Produit"("codeBarre");

-- CreateIndex
CREATE UNIQUE INDEX "Produit_reference_key" ON "Produit"("reference");

-- CreateIndex
CREATE INDEX "Vente_userId_idx" ON "Vente"("userId");

-- CreateIndex
CREATE INDEX "Vente_produitId_idx" ON "Vente"("produitId");

-- CreateIndex
CREATE INDEX "MouvementStock_userId_idx" ON "MouvementStock"("userId");

-- CreateIndex
CREATE INDEX "MouvementStock_produitId_idx" ON "MouvementStock"("produitId");

-- CreateIndex
CREATE INDEX "MouvementStock_type_idx" ON "MouvementStock"("type");

-- CreateIndex
CREATE INDEX "MouvementStock_createdAt_idx" ON "MouvementStock"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Fournisseur_nom_key" ON "Fournisseur"("nom");

-- CreateIndex
CREATE INDEX "AlerteStock_produitId_idx" ON "AlerteStock"("produitId");

-- CreateIndex
CREATE INDEX "AlerteStock_type_idx" ON "AlerteStock"("type");

-- CreateIndex
CREATE INDEX "AlerteStock_lu_idx" ON "AlerteStock"("lu");

-- CreateIndex
CREATE INDEX "AlerteStock_createdAt_idx" ON "AlerteStock"("createdAt");
