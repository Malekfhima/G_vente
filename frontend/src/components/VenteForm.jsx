import React, { useState } from 'react';
import { VALIDATION } from '../utils/constants';

const VenteForm = ({ vente, produits, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    produitId: vente?.produitId || '',
    quantite: vente?.quantite || ''
  });

  const [selectedProduit, setSelectedProduit] = useState(
    produits.find(p => p.id === vente?.produitId) || null
  );

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les produits selon la recherche
  const filteredProduits = produits.filter(produit =>
    produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produit.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produit.id.toString().includes(searchTerm)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Mettre à jour le produit sélectionné
    if (name === 'produitId') {
      const produit = produits.find(p => p.id === parseInt(value));
      setSelectedProduit(produit);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.produitId) {
      newErrors.produitId = 'Veuillez sélectionner un produit';
    }

    if (!formData.quantite || formData.quantite <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0';
    } else if (selectedProduit && formData.quantite > selectedProduit.stock) {
      newErrors.quantite = `La quantité ne peut pas dépasser le stock disponible (${selectedProduit.stock})`;
    } else if (formData.quantite > VALIDATION.MAX_QUANTITY) {
      newErrors.quantite = `La quantité ne peut pas dépasser ${VALIDATION.MAX_QUANTITY}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      produitId: parseInt(formData.produitId),
      quantite: parseInt(formData.quantite)
    });
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
    ) : null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
          {vente ? 'Modifier la vente' : 'Nouvelle vente'}
        </h2>
            <p className="text-sm text-gray-600 mt-1">
              {vente ? 'Modifiez les détails de la vente' : 'Créez une nouvelle vente en sélectionnant un produit'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Sélection du Produit */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Sélection du Produit
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <label htmlFor="produitId" className="block text-sm font-medium text-gray-700 mb-2">
                Produit *
              </label>
                
                {/* Champ de recherche amélioré */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="🔍 Rechercher un produit par nom, catégorie ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
              <select
                id="produitId"
                name="produitId"
                value={formData.produitId}
                onChange={handleChange}
                required
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.produitId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                  <option value="">📦 Sélectionner un produit</option>
                  {filteredProduits.map(produit => (
                  <option key={produit.id} value={produit.id}>
                      {produit.nom} - {produit.categorie || 'Sans catégorie'} - Stock: {produit.stock} - {formatCurrency(produit.prix)}
                  </option>
                ))}
              </select>
              {getFieldError('produitId')}
                
                {filteredProduits.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {filteredProduits.length} produit(s) trouvé(s)
                  </p>
                )}
            </div>

            <div>
                <label htmlFor="quantite" className="block text-sm font-medium text-gray-700 mb-2">
                Quantité *
              </label>
                <div className="relative">
              <input
                id="quantite"
                name="quantite"
                type="number"
                min={VALIDATION.MIN_QUANTITY}
                max={selectedProduit?.stock || VALIDATION.MAX_QUANTITY}
                value={formData.quantite}
                onChange={handleChange}
                required
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.quantite ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="1"
              />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">unités</span>
                  </div>
                </div>
                
              {selectedProduit && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">
                        📦 Stock disponible: <span className="font-semibold">{selectedProduit.stock}</span>
                      </span>
                      {selectedProduit.stock < 10 && (
                        <span className="text-orange-600 text-xs font-medium">
                          ⚠️ Stock faible
                        </span>
                      )}
                    </div>
                  </div>
              )}
              {getFieldError('quantite')}
              </div>
            </div>
          </div>

          {/* Section Détails du Produit */}
          {selectedProduit && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Détails du Produit Sélectionné
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm font-medium text-green-700">Nom</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{selectedProduit.nom}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700">Catégorie</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{selectedProduit.categorie || 'Non définie'}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-sm font-medium text-purple-700">Prix Unitaire</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">{formatCurrency(selectedProduit.prix)}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="text-sm font-medium text-orange-700">Stock</span>
                  </div>
                  <p className={`font-semibold text-lg ${selectedProduit.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduit.stock} unités
                  </p>
                </div>
              </div>
              
              {/* Calcul du prix total */}
                {formData.quantite && formData.quantite > 0 && (
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Calcul de la vente</h4>
                      <p className="text-sm text-gray-600">
                        {formData.quantite} × {formatCurrency(selectedProduit.prix)} = {formatCurrency(selectedProduit.prix * formData.quantite)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Prix Total</p>
                      <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedProduit.prix * formData.quantite)}
                    </p>
                    </div>
                  </div>
                  </div>
                )}
            </div>
          )}



          {/* Section Actions */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Prêt à enregistrer</p>
                  <p className="text-xs text-gray-600">
                    {selectedProduit ? `Vente de ${selectedProduit.nom}` : 'Sélectionnez un produit'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2"
            >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Annuler</span>
            </button>
                
            <button
              type="submit"
                  disabled={!selectedProduit || !formData.quantite || formData.quantite <= 0}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{vente ? 'Mettre à jour' : 'Enregistrer la vente'}</span>
            </button>
              </div>
            </div>
            
            {/* Informations supplémentaires */}
            {selectedProduit && formData.quantite && formData.quantite > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Résumé :</span> {formData.quantite} × {selectedProduit.nom}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(selectedProduit.prix * formData.quantite)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenteForm;
