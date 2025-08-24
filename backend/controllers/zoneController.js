const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Créer une nouvelle zone
const createZone = async (req, res) => {
  try {
    const { nom, description, adresse, ville, codePostal, pays, actif } =
      req.body;

    if (!nom) {
      return res.status(400).json({ error: "Le nom de la zone est requis" });
    }

    const zone = await prisma.zone.create({
      data: {
        nom,
        description,
        adresse,
        ville,
        codePostal,
        pays: pays || "Tunisie",
        actif: actif !== undefined ? actif : true,
      },
    });

    res.status(201).json({
      message: "Zone créée avec succès",
      zone,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la zone:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Une zone avec ce nom existe déjà" });
    }
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Obtenir toutes les zones
const getAllZones = async (req, res) => {
  try {
    const zones = await prisma.zone.findMany({
      orderBy: { nom: "asc" },
      include: {
        _count: {
          select: {
            ventes: true,
            clients: true,
            fournisseurs: true,
          },
        },
      },
    });

    res.json(zones);
  } catch (error) {
    console.error("Erreur lors de la récupération des zones:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Obtenir une zone par ID
const getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await prisma.zone.findUnique({
      where: { id: parseInt(id) },
      include: {
        ventes: {
          include: {
            produit: true,
            user: true,
          },
          orderBy: { date: "desc" },
        },
        clients: true,
        fournisseurs: true,
        _count: {
          select: {
            ventes: true,
            clients: true,
            fournisseurs: true,
          },
        },
      },
    });

    if (!zone) {
      return res.status(404).json({ error: "Zone non trouvée" });
    }

    res.json(zone);
  } catch (error) {
    console.error("Erreur lors de la récupération de la zone:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Mettre à jour une zone
const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, adresse, ville, codePostal, pays, actif } =
      req.body;

    if (!nom) {
      return res.status(400).json({ error: "Le nom de la zone est requis" });
    }

    const zone = await prisma.zone.update({
      where: { id: parseInt(id) },
      data: {
        nom,
        description,
        adresse,
        ville,
        codePostal,
        pays,
        actif,
      },
    });

    res.json({
      message: "Zone mise à jour avec succès",
      zone,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la zone:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Une zone avec ce nom existe déjà" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Zone non trouvée" });
    }
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Supprimer une zone
const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la zone a des ventes associées
    const zoneWithVentes = await prisma.zone.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            ventes: true,
            clients: true,
            fournisseurs: true,
          },
        },
      },
    });

    if (!zoneWithVentes) {
      return res.status(404).json({ error: "Zone non trouvée" });
    }

    if (zoneWithVentes._count.ventes > 0) {
      return res.status(400).json({
        error:
          "Impossible de supprimer cette zone car elle a des ventes associées",
      });
    }

    await prisma.zone.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Zone supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la zone:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Obtenir les statistiques de rentabilité par zone
const getZoneRentability = async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly, yearly
    let dateFilter = {};

    // Filtrer par période si spécifiée
    if (period) {
      const now = new Date();
      switch (period) {
        case "daily":
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          };
          break;
        case "weekly":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = { gte: weekAgo };
          break;
        case "monthly":
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          };
          break;
        case "yearly":
          dateFilter = {
            gte: new Date(now.getFullYear(), 0, 1),
          };
          break;
      }
    }

    const zonesStats = await prisma.zone.findMany({
      where: { actif: true },
      include: {
        _count: {
          select: {
            ventes: true,
            clients: true,
          },
        },
        ventes: {
          where: dateFilter,
          select: {
            prixTotal: true,
            quantite: true,
            date: true,
            produit: {
              select: {
                nom: true,
                categorie: true,
              },
            },
          },
        },
      },
    });

    // Calculer les statistiques de rentabilité
    const zonesWithStats = zonesStats.map((zone) => {
      const totalVentes = zone.ventes.length;
      const totalRevenue = zone.ventes.reduce(
        (sum, vente) => sum + vente.prixTotal,
        0
      );
      const totalQuantite = zone.ventes.reduce(
        (sum, vente) => sum + vente.quantite,
        0
      );
      const revenueMoyen = totalVentes > 0 ? totalRevenue / totalVentes : 0;
      const quantiteMoyenne = totalVentes > 0 ? totalQuantite / totalVentes : 0;

      // Calculer la rentabilité (revenu par client)
      const rentabilite =
        zone._count.clients > 0 ? totalRevenue / zone._count.clients : 0;

      // Grouper par catégorie de produit
      const categories = {};
      zone.ventes.forEach((vente) => {
        const categorie = vente.produit.categorie || "Non catégorisé";
        if (!categories[categorie]) {
          categories[categorie] = { revenue: 0, quantite: 0 };
        }
        categories[categorie].revenue += vente.prixTotal;
        categories[categorie].quantite += vente.quantite;
      });

      return {
        id: zone.id,
        nom: zone.nom,
        ville: zone.ville,
        totalVentes,
        totalRevenue,
        totalQuantite,
        revenueMoyen,
        quantiteMoyenne,
        nombreClients: zone._count.clients,
        rentabilite,
        categories,
        actif: zone.actif,
      };
    });

    // Trier par rentabilité (du plus rentable au moins rentable)
    zonesWithStats.sort((a, b) => b.rentabilite - a.rentabilite);

    res.json({
      zones: zonesWithStats,
      totalZones: zonesWithStats.length,
      periode: period || "toutes",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Obtenir le top des zones les plus rentables
const getTopZones = async (req, res) => {
  try {
    const { limit = 5, period } = req.query;
    let dateFilter = {};

    // Filtrer par période si spécifiée
    if (period) {
      const now = new Date();
      switch (period) {
        case "daily":
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          };
          break;
        case "weekly":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = { gte: weekAgo };
          break;
        case "monthly":
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          };
          break;
        case "yearly":
          dateFilter = {
            gte: new Date(now.getFullYear(), 0, 1),
          };
          break;
      }
    }

    const topZones = await prisma.zone.findMany({
      where: { actif: true },
      include: {
        _count: {
          select: {
            ventes: true,
            clients: true,
          },
        },
        ventes: {
          where: dateFilter,
          select: {
            prixTotal: true,
            quantite: true,
            date: true,
          },
        },
      },
      take: parseInt(limit),
    });

    // Calculer les métriques de performance
    const zonesWithMetrics = topZones.map((zone) => {
      const totalRevenue = zone.ventes.reduce(
        (sum, vente) => sum + vente.prixTotal,
        0
      );
      const totalQuantite = zone.ventes.reduce(
        (sum, vente) => sum + vente.quantite,
        0
      );
      const revenueMoyen =
        zone.ventes.length > 0 ? totalRevenue / zone.ventes.length : 0;
      const rentabilite =
        zone._count.clients > 0 ? totalRevenue / zone._count.clients : 0;

      return {
        id: zone.id,
        nom: zone.nom,
        ville: zone.ville,
        totalVentes: zone.ventes.length,
        totalRevenue,
        totalQuantite,
        revenueMoyen,
        nombreClients: zone._count.clients,
        rentabilite,
        performance:
          (totalRevenue * zone.ventes.length) /
          Math.max(zone._count.clients, 1),
      };
    });

    // Trier par performance
    zonesWithMetrics.sort((a, b) => b.performance - a.performance);

    res.json({
      topZones: zonesWithMetrics,
      periode: period || "toutes",
      limite: parseInt(limit),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du top des zones:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// Obtenir les tendances de vente par zone
const getZoneTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date(
      endDate.getTime() - parseInt(days) * 24 * 60 * 60 * 1000
    );

    const trends = await prisma.zone.findMany({
      where: { actif: true },
      include: {
        ventes: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            prixTotal: true,
            quantite: true,
            date: true,
          },
        },
      },
    });

    // Grouper les ventes par jour pour chaque zone
    const zonesWithTrends = trends.map((zone) => {
      const dailyData = {};

      // Initialiser tous les jours avec 0
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateKey = d.toISOString().split("T")[0];
        dailyData[dateKey] = { revenue: 0, quantite: 0, ventes: 0 };
      }

      // Remplir avec les vraies données
      zone.ventes.forEach((vente) => {
        const dateKey = vente.date.toISOString().split("T")[0];
        if (dailyData[dateKey]) {
          dailyData[dateKey].revenue += vente.prixTotal;
          dailyData[dateKey].quantite += vente.quantite;
          dailyData[dateKey].ventes += 1;
        }
      });

      const trendData = Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data,
      }));

      return {
        id: zone.id,
        nom: zone.nom,
        ville: zone.ville,
        trendData,
        totalRevenue: zone.ventes.reduce((sum, v) => sum + v.prixTotal, 0),
        totalVentes: zone.ventes.length,
      };
    });

    res.json({
      zones: zonesWithTrends,
      periode: `${days} jours`,
      dateDebut: startDate,
      dateFin: endDate,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tendances:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
  getZoneRentability,
  getTopZones,
  getZoneTrends,
};
