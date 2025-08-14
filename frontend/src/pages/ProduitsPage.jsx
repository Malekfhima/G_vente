import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProduits } from "../hooks/useApi";
import ProduitForm from "../components/ProduitForm";
import ProduitList from "../components/ProduitList";
import BarcodeScanner from "../components/BarcodeScanner";
import { PRODUCT_CATEGORIES } from "../utils/constants";

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
    clearError,
  } = useProduits();

  const [showForm, setShowForm] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("nom");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

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
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleEdit = (produit) => {
    setEditingProduit(produit);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProduit(id);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduit(null);
  };

  const handleProductFound = async (productData) => {
    try {
      if (productData.isExisting) {
        // Mettre à jour le stock du produit existant
        await updateProduit(productData.id, {
          stock: productData.stock,
        });
      } else if (productData.isNew) {
        // Créer un nouveau produit avec le code-barres
        await createProduit({
          nom: productData.nom,
          description: productData.description,
          prix: productData.prix,
          stock: productData.stock,
          categorie: productData.categorie,
        });
      } else {
        // Créer un nouveau produit depuis la base de données
        await createProduit({
          nom: productData.nom,
          description: `Produit ajouté par code-barres`,
          prix: productData.prix,
          stock: productData.stock,
          categorie: productData.categorie,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout par code-barres:", error);
    }
  };

  const filteredProduits = produits
    .filter((produit) => {
      const matchesSearch =
        produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produit.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || produit.categorie === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "prix":
          return a.prix - b.prix;
        case "stock":
          return a.stock - b.stock;
        case "categorie":
          return (a.categorie || "").localeCompare(b.categorie || "");
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
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Produits
              </h1>
              {isAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Code-barres</span>
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Ajouter un produit
                  </button>
                </div>
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
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
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

        {/* Scanner de code-barres */}
        {showBarcodeScanner && (
          <BarcodeScanner
            onProductFound={handleProductFound}
            existingProducts={produits}
          />
        )}

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
      </div>
    </div>
  );
};

export default ProduitsPage;
