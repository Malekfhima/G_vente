import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";
import { useVentes, useProduits } from "../hooks/useApi";
import VenteForm from "../components/VenteForm";
import VenteList from "../components/VenteList";
import TicketCaisse from "../components/TicketCaisse";

const VentesPage = () => {
  const { isAdmin } = useAuth();
  const {
    ventes,
    loading,
    error,
    fetchVentes,
    createVente,
    updateVente,
    deleteVente,
    clearError,
  } = useVentes();

  const { produits } = useProduits();

  const [showForm, setShowForm] = useState(false);
  const [editingVente, setEditingVente] = useState(null);
  const [lastVente, setLastVente] = useState(null);

  useEffect(() => {
    fetchVentes();
  }, []);

  const handleSubmit = async (venteData) => {
    try {
      if (editingVente) {
        await updateVente(editingVente.id, venteData);
        setEditingVente(null);
      } else {
        const newVente = await createVente(venteData);
        // Afficher le ticket pour la nouvelle vente
        if (newVente) {
        
          setLastVente(newVente);
        }
      }
      setShowForm(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Swal.fire({
        icon: "error",
        title: "Échec",
        text: error?.message || "Erreur lors de la sauvegarde",
      });
    }
  };

  const handleEdit = (vente) => {
    setEditingVente(vente);

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Supprimer cette vente ?",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });
    if (!res.isConfirmed) return;
    try {
      await deleteVente(id);
      Swal.fire({
        icon: "success",
        title: "Supprimée",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      Swal.fire({
        icon: "error",
        title: "Échec",
        text: error?.message || "Erreur lors de la suppression",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVente(null);
  };

  if (loading && ventes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm text-gray-600">
              {ventes.length} vente(s) enregistrée(s)
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <VenteForm
            vente={editingVente}
            produits={produits}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        {/* Gestion des erreurs */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des ventes */}
        <VenteList
          ventes={ventes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />

        {/* Modal du ticket de caisse pour nouvelle vente */}
        {lastVente && (
          <TicketCaisse
            vente={lastVente}
            onClose={() => setLastVente(null)}
            onPrint={() => {
              console.log(
                "Ticket imprimé pour la nouvelle vente:",
                lastVente.id
              );
              setLastVente(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VentesPage;
