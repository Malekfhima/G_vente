import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProduits } from "../hooks/useApi";
import { PRODUCT_CATEGORIES } from "../utils/constants";
import "../styles/pages/services.css";

const ServicesPage = () => {
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
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("nom");
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    categorie: "",
    isService: true,
  });

  // Filtrer seulement les services
  const services = produits.filter((p) => p.isService === true);

  // Données de démonstration pour tester l'affichage
  const demoServices = [
    {
      id: 1,
      nom: "Service de Réparation",
      description: "Réparation et maintenance d'équipements",
      prix: 25.0,
      categorie: "Électronique",
      isService: true,
      stock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      nom: "Consultation Technique",
      description: "Conseils et assistance technique",
      prix: 50.0,
      categorie: "Services",
      isService: true,
      stock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      nom: "Formation Utilisateur",
      description: "Formation sur l'utilisation des produits",
      prix: 75.0,
      categorie: "Formation",
      isService: true,
      stock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Utiliser les données de démonstration si aucun service n'est trouvé
  const displayServices = services.length > 0 ? services : demoServices;

  useEffect(() => {
    fetchProduits();
  }, [fetchProduits]);

  // Rediriger si pas admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = "/";
    }
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateProduit(editingService.id, formData);
        setEditingService(null);
      } else {
        await createProduit(formData);
      }
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      nom: service.nom,
      description: service.description || "",
      prix: service.prix.toString(),
      categorie: service.categorie || "",
      isService: true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await deleteProduit(id);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      description: "",
      prix: "",
      categorie: "",
      isService: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filtrer et trier les services
  const filteredServices = displayServices
    .filter(
      (service) =>
        service.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!selectedCategory || service.categorie === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "nom":
          return a.nom.localeCompare(b.nom);
        case "prix":
          return a.prix - b.prix;
        case "categorie":
          return (a.categorie || "").localeCompare(b.categorie || "");
        default:
          return 0;
      }
    });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h1>
          <p className="text-gray-600">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Services
            </h1>
            <p className="text-gray-600">
              Gérez les services proposés par votre entreprise
            </p>
          </div>

          {/* Barre d'outils */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  + Nouveau Service
                </button>

                <input
                  type="text"
                  placeholder="Rechercher un service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-64"
                />

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Toutes les catégories</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="nom">Trier par nom</option>
                  <option value="prix">Trier par prix</option>
                  <option value="categorie">Trier par catégorie</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                {filteredServices.length} service(s) trouvé(s)
              </div>
            </div>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingService ? "Modifier le service" : "Nouveau service"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du service *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Nom du service"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (TND) *
                    </label>
                    <input
                      type="number"
                      name="prix"
                      value={formData.prix}
                      onChange={handleInputChange}
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      name="categorie"
                      value={formData.categorie}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      value="Service"
                      disabled
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Description du service..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                  >
                    {editingService ? "Mettre à jour" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des services */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des services...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={clearError}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Réessayer
                </button>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory
                    ? "Aucun service trouvé avec ces critères"
                    : "Aucun service disponible"}
                </p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Créer le premier service
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-medium">
                                S
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {service.nom}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {service.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {service.categorie || "Non catégorisé"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {service.prix.toFixed(2)} TND
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {service.description || "Aucune description"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(service)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
