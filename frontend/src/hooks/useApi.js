import { useState, useCallback } from "react";

// Hook personnalisé pour gérer les appels API
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction générique pour exécuter des appels API
  const executeApiCall = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage = err.message || "Une erreur est survenue";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour effacer les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fonction pour définir une erreur manuellement
  const setApiError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  return {
    loading,
    error,
    executeApiCall,
    clearError,
    setApiError,
  };
};

// Hook spécialisé pour les produits
export const useProduits = () => {
  const { loading, error, executeApiCall, clearError, setApiError } = useApi();
  const [produits, setProduits] = useState([]);

  const fetchProduits = useCallback(async () => {
    try {
      const result = await executeApiCall(async () => {
        const apiService = await import("../services/api");
        return await apiService.default.getProduits();
      });
      setProduits(result);
      return result;
    } catch (err) {
      setApiError("Erreur lors du chargement des produits");
      throw err;
    }
  }, [executeApiCall, setApiError]);

  const createProduit = useCallback(
    async (produitData) => {
      try {
        const result = await executeApiCall(async () => {
          const apiService = await import("../services/api");
          return await apiService.default.createProduit(produitData);
        });

        // Ajout du nouveau produit à la liste
        setProduits((prev) => [result.produit, ...prev]);
        return result;
      } catch (err) {
        setApiError("Erreur lors de la création du produit");
        throw err;
      }
    },
    [executeApiCall, setApiError]
  );

  const updateProduit = useCallback(
    async (id, produitData) => {
      try {
        const result = await executeApiCall(async () => {
          const apiService = await import("../services/api");
          return await apiService.default.updateProduit(id, produitData);
        });

        // Mise à jour du produit dans la liste
        setProduits((prev) =>
          prev.map((p) => (p.id === id ? result.produit : p))
        );
        return result;
      } catch (err) {
        setApiError("Erreur lors de la mise à jour du produit");
        throw err;
      }
    },
    [executeApiCall, setApiError]
  );

  const deleteProduit = useCallback(
    async (id) => {
      try {
        await executeApiCall(async () => {
          const apiService = await import("../services/api");
          return await apiService.default.deleteProduit(id);
        });

        // Suppression du produit de la liste
        setProduits((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        setApiError("Erreur lors de la suppression du produit");
        throw err;
      }
    },
    [executeApiCall, setApiError]
  );

  const searchProduits = useCallback(
    async (params) => {
      try {
        const result = await executeApiCall(async () => {
          const apiService = await import("../services/api");
          return await apiService.default.searchProduits(params);
        });
        setProduits(result);
        return result;
      } catch (err) {
        setApiError("Erreur lors de la recherche des produits");
        throw err;
      }
    },
    [executeApiCall, setApiError]
  );

  return {
    produits,
    loading,
    error,
    fetchProduits,
    createProduit,
    updateProduit,
    deleteProduit,
    searchProduits,
    clearError,
  };
};

// Hook spécialisé pour les ventes
export const useVentes = () => {
  const { loading, error, executeApiCall, clearError, setApiError } = useApi();
  const [ventes, setVentes] = useState([]);

  const fetchVentes = useCallback(async () => {
    try {
      const result = await executeApiCall(async () => {
        const apiService = await import("../services/api");
        return await apiService.default.getVentes();
      });
      setVentes(result);
      return result;
    } catch (err) {
      setApiError("Erreur lors du chargement des ventes");
      throw err;
    }
  }, [executeApiCall, setApiError]);

  const createVente = useCallback(
    async (venteData) => {
      try {
        const result = await executeApiCall(async () => {
          const apiService = await import("../services/api");
          return await apiService.default.createVente(venteData);
        });

        // Ajout de la nouvelle vente à la liste
        setVentes((prev) => [result.vente, ...prev]);
        return result;
      } catch (err) {
        setApiError("Erreur lors de la création de la vente");
        throw err;
      }
    },
    [executeApiCall, setApiError]
  );

  const updateVente = useCallback(
    async (id, venteData) => {
      try {
        const result = await executeApiCall(async () => {
          const apiService = await import("../services/api");
          return await apiService.default.updateVente(id, venteData);
        });

        // Mise à jour de la vente dans la liste
        setVentes((prev) => prev.map((v) => (v.id === id ? result.vente : v)));
        return result;
      } catch (err) {
        setApiError("Erreur lors de la mise à jour de la vente");
        throw err;
      }
    },
    [executeApiCall, setApiError]
  );

  const deleteVente = useCallback(
    async (id) => {
      try {
        await executeApiCall(async () => {
          const apiService = await import("../services/api");
          return await apiService.default.deleteVente(id);
        });

        // Suppression de la vente de la liste
        setVentes((prev) => prev.filter((v) => v.id !== id));
      } catch (err) {
        setApiError("Erreur lors de la suppression de la vente");
        throw err;
      }
    },
    [executeApiCall, setApiError]
  );

  const fetchMyVentes = useCallback(async () => {
    try {
      const result = await executeApiCall(async () => {
        const apiService = await import("../services/api");
        return await apiService.default.getMyVentes();
      });
      setVentes(result);
      return result;
    } catch (err) {
      setApiError("Erreur lors du chargement de vos ventes");
      throw err;
    }
  }, [executeApiCall, setApiError]);

  const fetchVentesStats = useCallback(
    async (periode) => {
      try {
        const result = await executeApiCall(async () => {
          const apiService = await import("../services/api");
          return await apiService.default.getVentesStats(periode);
        });
        return result;
      } catch (err) {
        setApiError("Erreur lors du chargement des statistiques");
        throw err;
      }
    },
    [executeApiCall, setApiError]
  );

  return {
    ventes,
    loading,
    error,
    fetchVentes,
    createVente,
    updateVente,
    deleteVente,
    fetchMyVentes,
    fetchVentesStats,
    clearError,
  };
};

// Hook pour clients
export const useClients = () => {
  const { loading, error, executeApiCall, clearError, setApiError } = useApi();
  const [clients, setClients] = useState([]);

  const fetchClients = useCallback(async () => {
    try {
      const result = await executeApiCall(async () => {
        const apiService = await import("../services/api");
        return await apiService.default.getClients();
      });
      setClients(result.clients || []);
      return result;
    } catch (err) {
      setApiError("Erreur lors du chargement des clients");
      throw err;
    }
  }, [executeApiCall, setApiError]);

  const createClient = useCallback(
    async (data) => {
      const result = await executeApiCall(async () => {
        const api = (await import("../services/api")).default;
        return api.createClient(data);
      });
      setClients((prev) => [result.client, ...prev]);
      return result;
    },
    [executeApiCall]
  );

  const updateClient = useCallback(
    async (id, data) => {
      const result = await executeApiCall(async () => {
        const api = (await import("../services/api")).default;
        return api.updateClient(id, data);
      });
      setClients((prev) => prev.map((c) => (c.id === id ? result.client : c)));
      return result;
    },
    [executeApiCall]
  );

  const deleteClient = useCallback(
    async (id) => {
      await executeApiCall(async () => {
        const api = (await import("../services/api")).default;
        return api.deleteClient(id);
      });
      setClients((prev) => prev.filter((c) => c.id !== id));
    },
    [executeApiCall]
  );

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    clearError,
  };
};

// Hook pour fournisseurs
export const useFournisseurs = () => {
  const { loading, error, executeApiCall, clearError, setApiError } = useApi();
  const [fournisseurs, setFournisseurs] = useState([]);

  const fetchFournisseurs = useCallback(async () => {
    try {
      const result = await executeApiCall(async () => {
        const api = (await import("../services/api")).default;
        return api.getFournisseurs();
      });
      setFournisseurs(result.fournisseurs || []);
      return result;
    } catch (err) {
      setApiError("Erreur lors du chargement des fournisseurs");
      throw err;
    }
  }, [executeApiCall, setApiError]);

  const createFournisseur = useCallback(
    async (data) => {
      const result = await executeApiCall(async () => {
        const api = (await import("../services/api")).default;
        return api.createFournisseur(data);
      });
      setFournisseurs((prev) => [result.fournisseur, ...prev]);
      return result;
    },
    [executeApiCall]
  );

  const updateFournisseur = useCallback(
    async (id, data) => {
      const result = await executeApiCall(async () => {
        const api = (await import("../services/api")).default;
        return api.updateFournisseur(id, data);
      });
      setFournisseurs((prev) =>
        prev.map((f) => (f.id === id ? result.fournisseur : f))
      );
      return result;
    },
    [executeApiCall]
  );

  const deleteFournisseur = useCallback(
    async (id) => {
      await executeApiCall(async () => {
        const api = (await import("../services/api")).default;
        return api.deleteFournisseur(id);
      });
      setFournisseurs((prev) => prev.filter((f) => f.id !== id));
    },
    [executeApiCall]
  );

  return {
    fournisseurs,
    loading,
    error,
    fetchFournisseurs,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    clearError,
  };
};
