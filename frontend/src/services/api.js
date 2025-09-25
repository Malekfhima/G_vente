import { env } from "../config/env";

class ApiService {
  constructor() {
    this.baseURL = env.API_URL;
  }

  // Méthode générique pour les requêtes HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Ajout des headers par défaut
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Ajout du token d'authentification si disponible
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      // Gestion des erreurs HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Si la réponse est vide, retourner null
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur API:", error);
      throw error;
    }
  }

  // Méthodes d'authentification
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request("/auth/profile");
  }

  async changePassword(payload) {
    // payload: { currentPassword, newPassword, confirmPassword }
    return this.request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Méthodes des produits
  async getProduits() {
    return this.request("/produits");
  }

  async getProduit(id) {
    return this.request(`/produits/${id}`);
  }

  async createProduit(produitData) {
    return this.request("/produits", {
      method: "POST",
      body: JSON.stringify(produitData),
    });
  }

  async updateProduit(id, produitData) {
    return this.request(`/produits/${id}`, {
      method: "PUT",
      body: JSON.stringify(produitData),
    });
  }

  async deleteProduit(id) {
    return this.request(`/produits/${id}`, {
      method: "DELETE",
    });
  }

  async searchProduits(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/produits/search?${queryString}`);
  }

  // Méthodes des ventes
  async getVentes() {
    return this.request("/ventes");
  }

  // Email facture avec QRCode
  async sendInvoiceEmail(venteId, email) {
    return this.request(`/ventes/${venteId}/email-invoice`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Récupérer une vente depuis QR (payload JSON encodé)
  async getVenteByQR(data) {
    const q = new URLSearchParams({ data }).toString();
    return this.request(`/ventes/by-qr?${q}`);
  }

  // Services (produits isService=true)
  async getServices() {
    return this.request("/services");
  }
  async createService(data) {
    return this.request("/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateService(id, data) {
    return this.request(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteService(id) {
    return this.request(`/services/${id}`, { method: "DELETE" });
  }

  // Catégories
  async getCategories() {
    return this.request("/categories");
  }
  async createCategorie(data) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateCategorie(id, data) {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteCategorie(id) {
    return this.request(`/categories/${id}`, { method: "DELETE" });
  }

  async getVente(id) {
    return this.request(`/ventes/${id}`);
  }

  async createVente(venteData) {
    return this.request("/ventes", {
      method: "POST",
      body: JSON.stringify(venteData),
    });
  }

  async updateVente(id, venteData) {
    return this.request(`/ventes/${id}`, {
      method: "PUT",
      body: JSON.stringify(venteData),
    });
  }

  async deleteVente(id) {
    return this.request(`/ventes/${id}`, {
      method: "DELETE",
    });
  }

  async getMyVentes() {
    return this.request("/ventes/my-ventes");
  }

  async getVentesStats(periode) {
    const params = periode ? { periode } : {};
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/ventes/stats?${queryString}`);
  }

  // POS - ouvrir tiroir
  async openDrawer() {
    return this.request(`/pos/open-drawer`, { method: "POST" });
  }

  // Statistiques des utilisateurs (admin)
  async getUsersStats() {
    return this.request(`/users/stats`);
  }

  // Clients
  async getClients() {
    return this.request("/clients");
  }
  async createClient(data) {
    return this.request("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateClient(id, data) {
    return this.request(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteClient(id) {
    return this.request(`/clients/${id}`, { method: "DELETE" });
  }

  // Fournisseurs
  async getFournisseurs() {
    return this.request("/fournisseurs");
  }
  async createFournisseur(data) {
    return this.request("/fournisseurs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateFournisseur(id, data) {
    return this.request(`/fournisseurs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  async deleteFournisseur(id) {
    return this.request(`/fournisseurs/${id}`, { method: "DELETE" });
  }

  // Méthode pour vérifier la connectivité
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace("/api", "")}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Instance singleton
const apiService = new ApiService();

export default apiService;
