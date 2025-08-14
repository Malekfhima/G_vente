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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">
          {vente ? 'Modifier la vente' : 'Nouvelle vente'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="produitId" className="block text-sm font-medium text-gray-700 mb-1">
                Produit *
              </label>
              <select
                id="produitId"
                name="produitId"
                value={formData.produitId}
                onChange={handleChange}
                required
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.produitId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un produit</option>
                {produits.map(produit => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom} - Stock: {produit.stock} - {formatCurrency(produit.prix)}
                  </option>
                ))}
              </select>
              {getFieldError('produitId')}
            </div>

            <div>
              <label htmlFor="quantite" className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                id="quantite"
                name="quantite"
                type="number"
                min={VALIDATION.MIN_QUANTITY}
                max={selectedProduit?.stock || VALIDATION.MAX_QUANTITY}
                value={formData.quantite}
                onChange={handleChange}
                required
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantite ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {selectedProduit && (
                <p className="text-sm text-gray-500 mt-1">
                  Stock disponible: {selectedProduit.stock}
                </p>
              )}
              {getFieldError('quantite')}
            </div>
          </div>

          {selectedProduit && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Détails du produit sélectionné</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Nom:</span>
                  <p className="text-gray-900">{selectedProduit.nom}</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Prix unitaire:</span>
                  <p className="text-gray-900">{formatCurrency(selectedProduit.prix)}</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Stock actuel:</span>
                  <p className="text-gray-900">{selectedProduit.stock}</p>
                </div>
                {formData.quantite && formData.quantite > 0 && (
                  <div className="md:col-span-3">
                    <span className="text-blue-600 font-medium">Prix total estimé:</span>
                    <p className="text-gray-900 text-lg font-semibold">
                      {formatCurrency(selectedProduit.prix * formData.quantite)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {vente ? 'Mettre à jour' : 'Enregistrer la vente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenteForm;
