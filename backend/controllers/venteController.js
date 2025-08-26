const { prisma } = require("../config/database");
const { randomUUID } = require("crypto");

// Récupérer toutes les ventes
const getAllVentes = async (req, res) => {
  try {
    const ventes = await prisma.vente.findMany({
      include: {
        user: {
          select: { id: true, nom: true, email: true },
        },
        produit: {
          select: {
            id: true,
            nom: true,
            prix: true,
            categorie: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(ventes);
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Récupérer une vente par ID
const getVenteById = async (req, res) => {
  try {
    const { id } = req.params;
    const vente = await prisma.vente.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, nom: true, email: true },
        },
        produit: {
          select: {
            id: true,
            nom: true,
            prix: true,
            stock: true,
            categorie: true,
          },
        },
      },
    });

    if (!vente) {
      return res.status(404).json({ message: "Vente non trouvée" });
    }

    res.json(vente);
  } catch (error) {
    console.error("Erreur lors de la récupération de la vente:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Créer une nouvelle vente
const createVente = async (req, res) => {
  try {
    const { produitId, quantite } = req.body;
    const userId = req.user.id;

    // Vérification des champs requis
    if (!produitId || !quantite) {
      return res.status(400).json({
        message: "Produit et quantité sont requis",
      });
    }

    // Vérification que la quantité est positive
    if (quantite <= 0) {
      return res.status(400).json({
        message: "La quantité doit être positive",
      });
    }

    // Récupération du produit
    const produit = await prisma.produit.findUnique({
      where: { id: parseInt(produitId) },
    });

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    const isService = produit.isService === true;

    // Vérification du stock disponible (sauf pour services)
    if (!isService && produit.stock < quantite) {
      return res.status(400).json({
        message: `Stock insuffisant. Disponible: ${produit.stock}`,
      });
    }

    // Calcul du prix total
    const prixTotal = produit.prix * quantite;

    // Création de la vente et mise à jour du stock en transaction
    const result = await prisma.$transaction(async (tx) => {
      // Création de la vente
      const vente = await tx.vente.create({
        data: {
          quantite,
          prixTotal,
          userId,
          produitId: parseInt(produitId),
        },
        include: {
          user: {
            select: { id: true, nom: true, email: true },
          },
          produit: {
            select: {
              id: true,
              nom: true,
              prix: true,
              categorie: true,
            },
          },
        },
      });

      // Mise à jour du stock si non service
      if (!isService) {
        await tx.produit.update({
          where: { id: parseInt(produitId) },
          data: { stock: produit.stock - quantite },
        });
      }

      return vente;
    });

    res.status(201).json({
      message: "Vente créée avec succès",
      vente: result,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la vente:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Mettre à jour une vente
const updateVente = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantite } = req.body;

    // Vérification que la vente existe
    const existingVente = await prisma.vente.findUnique({
      where: { id: parseInt(id) },
      include: { produit: true },
    });

    if (!existingVente) {
      return res.status(404).json({ message: "Vente non trouvée" });
    }

    // Vérification que la quantité est positive
    if (quantite <= 0) {
      return res.status(400).json({
        message: "La quantité doit être positive",
      });
    }

    // Calcul de la différence de quantité
    const differenceQuantite = quantite - existingVente.quantite;

    // Vérification du stock disponible (sauf pour services)
    if (!existingVente.produit.isService) {
      const nouveauStock = existingVente.produit.stock - differenceQuantite;
      if (nouveauStock < 0) {
        return res.status(400).json({
          message: `Stock insuffisant pour cette modification. Disponible: ${existingVente.produit.stock}`,
        });
      }
    }

    // Calcul du nouveau prix total
    const nouveauPrixTotal = existingVente.produit.prix * quantite;

    // Mise à jour de la vente et du stock en transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mise à jour de la vente
      const vente = await tx.vente.update({
        where: { id: parseInt(id) },
        data: {
          quantite,
          prixTotal: nouveauPrixTotal,
        },
        include: {
          user: {
            select: { id: true, nom: true, email: true },
          },
          produit: {
            select: {
              id: true,
              nom: true,
              prix: true,
              categorie: true,
            },
          },
        },
      });

      // Mise à jour du stock (sauf pour services)
      if (!existingVente.produit.isService) {
        const nouveauStock = existingVente.produit.stock - differenceQuantite;
        await tx.produit.update({
          where: { id: existingVente.produitId },
          data: { stock: nouveauStock },
        });
      }

      return vente;
    });

    res.json({
      message: "Vente mise à jour avec succès",
      vente: result,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la vente:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Supprimer une vente
const deleteVente = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification que la vente existe
    const existingVente = await prisma.vente.findUnique({
      where: { id: parseInt(id) },
      include: { produit: true },
    });

    if (!existingVente) {
      return res.status(404).json({ message: "Vente non trouvée" });
    }

    // Suppression de la vente et restauration du stock en transaction
    await prisma.$transaction(async (tx) => {
      // Suppression de la vente
      await tx.vente.delete({
        where: { id: parseInt(id) },
      });

      // Restauration du stock (sauf pour services)
      if (!existingVente.produit.isService) {
        await tx.produit.update({
          where: { id: existingVente.produitId },
          data: {
            stock: existingVente.produit.stock + existingVente.quantite,
          },
        });
      }
    });

    res.json({ message: "Vente supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la vente:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Récupérer les ventes d'un utilisateur
const getVentesByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const ventes = await prisma.vente.findMany({
      where: { userId },
      include: {
        produit: {
          select: {
            id: true,
            nom: true,
            prix: true,
            categorie: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(ventes);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des ventes utilisateur:",
      error
    );
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Statistiques des ventes
const getVentesStats = async (req, res) => {
  try {
    const { periode } = req.query; // 'jour', 'semaine', 'mois', 'annee'

    let dateFilter = {};
    const now = new Date();

    switch (periode) {
      case "jour":
        dateFilter = {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        };
        break;
      case "semaine":
        const semaineAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { gte: semaineAgo };
        break;
      case "mois":
        dateFilter = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        break;
      case "annee":
        dateFilter = { gte: new Date(now.getFullYear(), 0, 1) };
        break;
      default:
        // Toutes les ventes
        break;
    }

    const where = periode ? { date: dateFilter } : {};

    const [totalVentes, totalRevenus, ventesParProduit] = await Promise.all([
      // Nombre total de ventes
      prisma.vente.count({ where }),

      // Revenus totaux
      prisma.vente.aggregate({
        where,
        _sum: { prixTotal: true },
      }),

      // Ventes par produit
      prisma.vente.groupBy({
        by: ["produitId"],
        where,
        _sum: { quantite: true, prixTotal: true },
        _count: true,
      }),
    ]);

    res.json({
      totalVentes,
      totalRevenus: totalRevenus._sum.prixTotal || 0,
      ventesParProduit,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Exporter les ventes en PDF
const pdf = require("pdfkit");
const exportVentesPDF = async (req, res) => {
  try {
    const ventes = await prisma.vente.findMany({
      include: {
        user: { select: { nom: true, email: true } },
        produit: { select: { nom: true, prix: true } },
      },
      orderBy: { date: "desc" },
    });

    // Création du PDF
    const doc = new pdf();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="ventes.pdf"');
    doc.pipe(res);

    doc.fontSize(18).text("Liste des ventes", { align: "center" });
    doc.moveDown();

    ventes.forEach((vente, i) => {
      doc
        .fontSize(12)
        .text(
          `${i + 1}. Produit: ${vente.produit.nom} | Quantité: ${
            vente.quantite
          } | Prix total: ${vente.prixTotal}€ | Vendu par: ${vente.user.nom} (${
            vente.user.email
          }) | Date: ${new Date(vente.date).toLocaleString()}`
        );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error("Erreur export PDF:", error);
    res.status(500).json({ message: "Erreur export PDF" });
  }
};

// Compteur de tickets en mémoire (réinitialisé à chaque redémarrage du serveur)
let lastTicketDateISO = null;
let lastTicketNumberForDay = 0;

// Générer un ticket PDF pour un panier donné
const generateTicketPDF = async (req, res) => {
  try {
    const { items, total, encaisse, rendu, paymentMethod, tvaRate } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Panier vide" });
    }

    // Calcul du numéro de ticket journalier (1, 2, 3, ...)
    const now = new Date();
    const todayISO = now.toISOString().slice(0, 10); // YYYY-MM-DD
    if (lastTicketDateISO !== todayISO) {
      lastTicketDateISO = todayISO;
      lastTicketNumberForDay = 0;
    }
    lastTicketNumberForDay += 1;
    const ticketNumber = lastTicketNumberForDay;

    const doc = new pdf({ margin: 16, size: [220, 800] }); // format étroit style ticket
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="ticket.pdf"');
    doc.pipe(res);

    // Données magasin (adapter si besoin à partir d'une config/env)
    const storeName = process.env.STORE_NAME || "Le Pronto";
    const storeAddress =
      process.env.STORE_ADDRESS ||
      "12 avenue Félix Faure\n69007 LYON\nTel: 0631571304";

    // Mise en page entête
    doc.rect(16, 12, 188, 22).fillAndStroke("#333", "#333");
    doc
      .fillColor("#fff")
      .fontSize(12)
      .text(storeName, 18, 16, { width: 184, align: "center" });
    doc.moveDown(0.5);
    doc
      .fillColor("#000")
      .fontSize(8)
      .text("Éditeur de logiciels pour restaurants", { align: "center" });
    doc.moveDown(0.4);
    doc.fontSize(9).text(storeAddress, { align: "left" });

    // Infos ticket
    const drawSeparator = () => {
      doc.moveDown(0.3);
      doc.fontSize(9).text("".padEnd(40, "="));
      doc.moveDown(0.2);
    };

    doc.moveDown(0.2);
    doc.fontSize(9).text(`Date: ${now.toLocaleString()}`);
    doc.fontSize(9).text(`Ticket: ${String(ticketNumber).padStart(4, "0")}`);
    drawSeparator();

    // Lignes d'articles
    const right = (v) => doc.text(v, { align: "right" });
    items.forEach((item) => {
      const qty = Number(item.quantite || 1);
      const unit = Number(item.prix || 0);
      const remise = Number(item.remise || 0);
      const lineTotal = qty * unit - remise;
      doc.fontSize(9).text(item.nom);
      doc
        .fontSize(9)
        .text(`x ${qty}  @ ${unit.toFixed(2)}`, { continued: true })
        .text(lineTotal.toFixed(2), { align: "right" });
    });

    // Totaux, TVA
    drawSeparator();
    const rate = Number(tvaRate ?? process.env.TVA_RATE ?? 0.19);
    const totalTTC = Number(total || 0);
    const totalHT = totalTTC / (1 + rate);
    const tvaAmount = totalTTC - totalHT;

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Total", { continued: true })
      .text(totalTTC.toFixed(2), { align: "right" });
    doc.font("Helvetica").fontSize(9);
    doc
      .text(`Montant H.T.`, { continued: true })
      .text(totalHT.toFixed(2), { align: "right" });
    doc
      .text(`T.V.A (${Math.round(rate * 100)}%)`, { continued: true })
      .text(tvaAmount.toFixed(2), { align: "right" });

    drawSeparator();
    // Mode de paiement et encaissement
    const mode =
      paymentMethod ||
      (Number(encaisse) >= totalTTC ? "Espèces" : "Carte bancaire");
    doc.fontSize(9).font("Helvetica-Bold").text("MODE DE PAIEMENT");
    doc.font("Helvetica").text(mode);
    doc.moveDown(0.2);
    if (encaisse !== undefined)
      doc.text(`Encaisse: ${Number(encaisse).toFixed(2)}`);
    if (rendu !== undefined) doc.text(`Rendu: ${Number(rendu).toFixed(2)}`);

    drawSeparator();
    doc
      .fontSize(8)
      .text("Nous vous remercions de votre visite", { align: "center" });
    doc.moveDown(0.1);
    doc.fontSize(8).text(`Ticket ${String(ticketNumber).padStart(4, "0")}`, {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("Erreur ticket PDF:", error);
    res.status(500).json({ message: "Erreur génération ticket" });
  }
};

module.exports = {
  getAllVentes,
  getVenteById,
  createVente,
  updateVente,
  deleteVente,
  getVentesByUser,
  getVentesStats,
  exportVentesPDF,
  generateTicketPDF,
};

// Créer une vente groupée (plusieurs articles en une transaction)
const createGroupedVente = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // items: [{ produitId, quantite }]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Liste d'articles requise" });
    }

    // Générer un identifiant de transaction
    const transactionId = randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      const lignes = [];
      let totalTransaction = 0;

      for (const item of items) {
        const produitId = parseInt(item.produitId);
        const quantite = parseInt(item.quantite);

        if (!produitId || !quantite || quantite <= 0) {
          throw new Error("Produit et quantité valides requis");
        }

        const produit = await tx.produit.findUnique({
          where: { id: produitId },
        });
        if (!produit) {
          throw new Error(`Produit ${produitId} introuvable`);
        }

        const isService = produit.isService === true;
        if (!isService && produit.stock < quantite) {
          throw new Error(`Stock insuffisant pour ${produit.nom}`);
        }

        const prixTotal = produit.prix * quantite;
        const vente = await tx.vente.create({
          data: {
            quantite,
            prixTotal,
            userId,
            produitId,
            transactionId,
          },
          include: {
            produit: {
              select: { id: true, nom: true, prix: true, categorie: true },
            },
          },
        });

        if (!isService) {
          await tx.produit.update({
            where: { id: produitId },
            data: { stock: produit.stock - quantite },
          });
        }

        totalTransaction += prixTotal;
        lignes.push(vente);
      }

      return { transactionId, total: totalTransaction, lignes };
    });

    res.status(201).json({
      message: "Vente groupée créée avec succès",
      transaction: result,
    });
  } catch (error) {
    console.error("Erreur vente groupée:", error);
    res
      .status(400)
      .json({ message: error.message || "Erreur création vente groupée" });
  }
};

// Lister les ventes groupées: une ligne par transactionId
const getGroupedVentes = async (req, res) => {
  try {
    const groups = await prisma.vente.groupBy({
      by: ["transactionId"],
      _sum: { prixTotal: true, quantite: true },
      _count: { _all: true },
      orderBy: { transactionId: "desc" },
    });

    // Récupérer pour chaque groupe la première date et l'utilisateur
    const details = await Promise.all(
      groups.map(async (g) => {
        const first = await prisma.vente.findFirst({
          where: { transactionId: g.transactionId },
          orderBy: { date: "asc" },
          include: { user: { select: { id: true, nom: true, email: true } } },
        });
        return {
          transactionId: g.transactionId,
          total: g._sum.prixTotal || 0,
          totalQuantite: g._sum.quantite || 0,
          lignes: g._count._all,
          date: first?.date || null,
          user: first?.user || null,
        };
      })
    );

    res.json(details);
  } catch (error) {
    console.error("Erreur liste ventes groupées:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Détails d'une vente groupée
const getGroupedVenteDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const ventes = await prisma.vente.findMany({
      where: { transactionId },
      include: {
        user: { select: { id: true, nom: true, email: true } },
        produit: {
          select: { id: true, nom: true, prix: true, categorie: true },
        },
      },
      orderBy: { id: "asc" },
    });

    if (ventes.length === 0) {
      return res.status(404).json({ message: "Transaction introuvable" });
    }

    const total = ventes.reduce((acc, v) => acc + v.prixTotal, 0);
    const totalQuantite = ventes.reduce((acc, v) => acc + v.quantite, 0);
    const meta = {
      transactionId,
      date: ventes[0].date,
      user: ventes[0].user,
      total,
      totalQuantite,
      lignes: ventes.length,
    };

    res.json({ meta, ventes });
  } catch (error) {
    console.error("Erreur détails vente groupée:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports.createGroupedVente = createGroupedVente;
module.exports.getGroupedVentes = getGroupedVentes;
module.exports.getGroupedVenteDetails = getGroupedVenteDetails;
