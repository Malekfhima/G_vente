import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useVentes, useProduits } from '../hooks/useApi';
import VenteForm from '../components/VenteForm';
import VenteList from '../components/VenteList';
import { VALIDATION } from '../utils/constants';

const VentesPage = () => {
  const { user, isAdmin } = useAuth();
  const { 
    ventes, 
    loading, 
    error, 
    fetchVentes, 
    createVente, 
    updateVente, 
    deleteVente,
    clearError 
  } = useVentes();
  
  const { produits } = useProduits();

  const [showForm, setShowForm] = useState(false);
  const [editingVente, setEditingVente] = useState(null);
  const [selectedProduit, setSelectedProduit] = useState(null);

  useEffect(() => {
    fetchVentes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const venteData = {
      produitId: parseInt(formData.get('produitId')),
      quantite: parseInt(formData.get('quantite'))
    };

    try {
      if (editingVente) {
        await updateVente(editingVente.id, venteData);
        setEditingVente(null);
      } else {
        await createVente(venteData);
      }
      setShowForm(false);
      e.target.reset();
      setSelectedProduit(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (vente) => {
    setEditingVente(vente);
    setSelectedProduit(produits.find(p => p.id === vente.produitId));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      try {
        await deleteVente(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVente(null);
    setSelectedProduit(null);
  };

  const handleProduitChange = (produitId) => {
    const produit = produits.find(p => p.id === parseInt(produitId));
    setSelectedProduit(produit);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Ventes</h1>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Nouvelle vente
              </button>
            </div>

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
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
      </div>
    </div>
  );
};

export default VentesPage;
