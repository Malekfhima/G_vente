import React, { useState, useEffect } from "react";
import VendeurForm from "../components/VendeurForm";
import VendeurList from "../components/VendeurList";
import apiService from "../services/api";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";

const VendeursPage = () => {
  const [vendeurs, setVendeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVendeur, setEditingVendeur] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const fetchVendeurs = async (search = "") => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = search
        ? `/vendeurs/search?q=${encodeURIComponent(search)}`
        : "/vendeurs";
      const response = await apiService.request(endpoint);
      setVendeurs(response);
    } catch (error) {
      console.error("Erreur lors du chargement des vendeurs:", error);
      setError("Erreur lors du chargement des vendeurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchVendeurs();
    }
  }, [user]);

  // Vérifier si l'utilisateur est admin
  if (user?.role !== "admin") {
    return (
      <div className="page">
        <div className="page-container">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Accès refusé
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Vous devez être administrateur pour accéder à cette page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVendeurs(searchTerm);
  };

  const handleCreateVendeur = async (vendeurData) => {
    try {
      const response = await apiService.request("/vendeurs", {
        method: "POST",
        body: JSON.stringify(vendeurData),
      });
      setVendeurs((prev) => [response.vendeur, ...prev]);
      setShowForm(false);
      setEditingVendeur(null);
    } catch (error) {
      console.error("Erreur lors de la création du vendeur:", error);
      throw error;
    }
  };

  const handleUpdateVendeur = async (vendeurData) => {
    try {
      const response = await apiService.request(
        `/vendeurs/${editingVendeur.id}`,
        {
          method: "PUT",
          body: JSON.stringify(vendeurData),
        }
      );
      setVendeurs((prev) =>
        prev.map((v) => (v.id === editingVendeur.id ? response.vendeur : v))
      );
      setShowForm(false);
      setEditingVendeur(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du vendeur:", error);
      throw error;
    }
  };

  const handleDeleteVendeur = async (vendeurId) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Supprimer ce vendeur ?",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });
    if (!res.isConfirmed) return;

    try {
      await apiService.request(`/vendeurs/${vendeurId}`, {
        method: "DELETE",
      });
      setVendeurs((prev) => prev.filter((v) => v.id !== vendeurId));
    } catch (error) {
      console.error("Erreur lors de la suppression du vendeur:", error);
      Swal.fire({
        icon: "error",
        title: "Échec",
        text: error?.message || "Erreur lors de la suppression",
      });
    }
  };

  const handleEdit = (vendeur) => {
    setEditingVendeur(vendeur);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVendeur(null);
  };

  const handleSubmit = async (vendeurData) => {
    if (editingVendeur) {
      await handleUpdateVendeur(vendeurData);
    } else {
      await handleCreateVendeur(vendeurData);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-container">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des vendeurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-container">
        {/* En-tête */}
        <div className="page-header">
          <div className="page-header-inner">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des Vendeurs
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gérez les comptes vendeurs de votre système
                </p>
              </div>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Ajouter un vendeur
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="section">
          <div className="section-inner">
            {/* Barre de recherche */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    className="input-field"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Rechercher
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      fetchVendeurs();
                    }}
                    className="btn-secondary"
                  >
                    Effacer
                  </button>
                )}
              </form>
            </div>

            {/* Formulaire */}
            {showForm && (
              <div className="mb-6">
                <VendeurForm
                  vendeur={editingVendeur}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            )}

            {/* Liste des vendeurs */}
            {error ? (
              <div className="message-error">
                <p>{error}</p>
                <button
                  onClick={() => fetchVendeurs()}
                  className="btn-primary mt-2"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <VendeurList
                vendeurs={vendeurs}
                onEdit={handleEdit}
                onDelete={handleDeleteVendeur}
              />
            )}

            {/* Statistiques */}
            <div className="mt-8 stats-grid">
              <div className="stat-card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="stat-card-icon bg-blue-100">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Vendeurs
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {vendeurs.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendeursPage;
