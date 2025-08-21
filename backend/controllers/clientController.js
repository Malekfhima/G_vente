const { prisma } = require("../config/database");

const listClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ clients });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const getClient = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    res.json({ client });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const createClient = async (req, res) => {
  try {
    const { nom, email, telephone, adresse } = req.body;
    if (!nom) return res.status(400).json({ message: "Nom requis" });
    const client = await prisma.client.create({
      data: { nom, email, telephone, adresse },
    });
    res.status(201).json({ message: "Client créé", client });
  } catch (e) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const updateClient = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nom, email, telephone, adresse } = req.body;
    const client = await prisma.client.update({
      where: { id },
      data: { nom, email, telephone, adresse },
    });
    res.json({ message: "Client mis à jour", client });
  } catch (e) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Client non trouvé" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const deleteClient = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.client.delete({ where: { id } });
    res.json({ message: "Client supprimé" });
  } catch (e) {
    if (e.code === "P2025")
      return res.status(404).json({ message: "Client non trouvé" });
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};


