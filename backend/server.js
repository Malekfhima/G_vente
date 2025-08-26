require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { testConnection } = require("./config/database");
const config = require("./config/config");

// Import des routes
const authRoutes = require("./routes/auth");
const produitRoutes = require("./routes/produits");
const venteRoutes = require("./routes/ventes");
const userRoutes = require("./routes/users");
const clientRoutes = require("./routes/clients");
const fournisseurRoutes = require("./routes/fournisseurs");
const posRoutes = require("./routes/pos");
const zoneRoutes = require("./routes/zones");
const vendeurRoutes = require("./routes/vendeurs");

const app = express();
const PORT = config.server.port;

// Middlewares de sécurité
app.use(
  helmet({
    contentSecurityPolicy: false, // Désactiver CSP pour le développement
  })
);

app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

// Middleware de logging
app.use(morgan(config.server.nodeEnv === "development" ? "dev" : "combined"));

// Middleware pour parser le JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes de base
app.get("/", (req, res) => {
  res.json({
    message: "API de Gestion de Vente",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      produits: "/api/produits",
      ventes: "/api/ventes",
      users: "/api/users",
      vendeurs: "/api/vendeurs",
      clients: "/api/clients",
      fournisseurs: "/api/fournisseurs",
      zones: "/api/zones",
    },
  });
});

// Routes de l'API
app.use("/api/auth", authRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/ventes", venteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendeurs", vendeurRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/zones", zoneRoutes);

// Middleware de gestion des erreurs 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Middleware de gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error("Erreur globale:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Erreur de validation",
      details: error.message,
    });
  }

  if (error.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      message: "Erreur de base de données",
      details: error.message,
    });
  }

  res.status(500).json({
    message: "Erreur interne du serveur",
    error:
      config.server.nodeEnv === "development"
        ? error.message
        : "Une erreur est survenue",
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}`);
      console.log(`🔐 Environnement: ${config.server.nodeEnv}`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
process.on("SIGTERM", () => {
  console.log("🛑 Signal SIGTERM reçu, arrêt du serveur...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Signal SIGINT reçu, arrêt du serveur...");
  process.exit(0);
});

startServer();
