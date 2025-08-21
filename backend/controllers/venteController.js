const { prisma } = require("../config/database");

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

    const isService =
      produit.isService === true || produit.categorie === "SERVICES";

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
    const nouveauStock = existingVente.produit.stock - differenceQuantite;

    // Vérification du stock disponible
    if (nouveauStock < 0) {
      return res.status(400).json({
        message: `Stock insuffisant pour cette modification. Disponible: ${existingVente.produit.stock}`,
      });
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

      // Mise à jour du stock
      await tx.produit.update({
        where: { id: existingVente.produitId },
        data: { stock: nouveauStock },
      });

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

      // Restauration du stock
      await tx.produit.update({
        where: { id: existingVente.produitId },
        data: {
          stock: existingVente.produit.stock + existingVente.quantite,
        },
      });
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

// Générer un ticket PDF pour un panier donné
const generateTicketPDF = async (req, res) => {
  try {
    const { items, total, encaisse, rendu } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Panier vide" });
    }

    const doc = new pdf({ margin: 24 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="ticket.pdf"');
    doc.pipe(res);

    doc.fontSize(14).text("Ticket de caisse", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown(0.5);

    items.forEach((item, idx) => {
      const line = `${idx + 1}. ${item.nom} x${item.quantite}  @ ${
        item.prix
      }  = ${(item.prix * item.quantite - (item.remise || 0)).toFixed(2)}`;
      doc.text(line);
    });

    doc.moveDown();
    doc.text(`Total: ${Number(total || 0).toFixed(2)}`);
    if (encaisse !== undefined)
      doc.text(`Encaisse: ${Number(encaisse).toFixed(2)}`);
    if (rendu !== undefined) doc.text(`Rendu: ${Number(rendu).toFixed(2)}`);

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
