import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProduits } from '../hooks/useApi';
import ProduitForm from '../components/ProduitForm';
import ProduitList from '../components/ProduitList';
import { PRODUCT_CATEGORIES, VALIDATION } from '../utils/constants';

const ProduitsPage = () => {
  const { isAdmin } = useAuth();
  const { 
    produits, 
    loading, 
    error, 
    fetchProduits, 
    createProduit, 
    updateProduit, 
    deleteProduit,
    clearError 
  } = useProduits();

  const [showForm, setShowForm] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('nom');

  useEffect(() => {
    fetchProduits();
  }, []);

  const handleSubmit = async (produitData) => {
    try {
      if (editingProduit) {
        await updateProduit(editingProduit.id, produitData);
        setEditingProduit(null);
      } else {
        await createProduit(produitData);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (produit) => {
    setEditingProduit(produit);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduit(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduit(null);
  };

  const filteredProduits = produits
    .filter(produit => {
      const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           produit.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || produit.categorie === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'prix':
          return a.prix - b.prix;
        case 'stock':
          return a.stock - b.stock;
        case 'categorie':
          return (a.categorie || '').localeCompare(b.categorie || '');
        default:
          return a.nom.localeCompare(b.nom);
      }
    });

  if (loading && produits.length === 0) {
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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Ajouter un produit
                </button>
              )}
            </div>

            {/* Filtres et recherche */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="nom">Trier par nom</option>
                <option value="prix">Trier par prix</option>
                <option value="stock">Trier par stock</option>
                <option value="categorie">Trier par catégorie</option>
              </select>
              <div className="text-sm text-gray-600">
                {filteredProduits.length} produit(s) trouvé(s)
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <ProduitForm
            produit={editingProduit}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        {/* Liste des produits */}
        <ProduitList
          produits={filteredProduits}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />

        {/* Gestion des erreurs */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
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
      </div>
    </div>
  );
};

export default ProduitsPage;