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
