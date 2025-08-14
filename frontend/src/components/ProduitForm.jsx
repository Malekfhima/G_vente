import React, { useState } from 'react';
import { PRODUCT_CATEGORIES, VALIDATION } from '../utils/constants';

const ProduitForm = ({ produit, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: produit?.nom || '',
    description: produit?.description || '',
    prix: produit?.prix || '',
    stock: produit?.stock || '',
    categorie: produit?.categorie || ''
  });

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du produit est requis';
    } else if (formData.nom.length > VALIDATION.MAX_NAME_LENGTH) {
      newErrors.nom = `Le nom ne peut pas dépasser ${VALIDATION.MAX_NAME_LENGTH} caractères`;
    }

    if (formData.description && formData.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `La description ne peut pas dépasser ${VALIDATION.MAX_DESCRIPTION_LENGTH} caractères`;
    }

    if (!formData.prix || formData.prix <= 0) {
      newErrors.prix = 'Le prix doit être supérieur à 0';
    } else if (formData.prix > VALIDATION.MAX_PRICE) {
      newErrors.prix = `Le prix ne peut pas dépasser ${VALIDATION.MAX_PRICE}`;
    }

    if (formData.stock === '' || formData.stock < 0) {
      newErrors.stock = 'Le stock doit être >= 0';
    } else if (formData.stock > VALIDATION.MAX_STOCK) {
      newErrors.stock = `Le stock ne peut pas dépasser ${VALIDATION.MAX_STOCK}`;
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
      ...formData,
      prix: parseFloat(formData.prix),
      stock: parseInt(formData.stock)
    });
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
    ) : null;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">
          {produit ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit *
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                required
                maxLength={VALIDATION.MAX_NAME_LENGTH}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nom ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nom du produit"
              />
              {getFieldError('nom')}
            </div>

            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1">
                Prix *
              </label>
              <div className="relative">
                <input
                  id="prix"
                  name="prix"
                  type="number"
                  step="0.01"
                  min={VALIDATION.MIN_PRICE}
                  max={VALIDATION.MAX_PRICE}
                  value={formData.prix}
                  onChange={handleChange}
                  required
                  className={`w-full border rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.prix ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">TND</span>
                </div>
              </div>
              {getFieldError('prix')}
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min={VALIDATION.MIN_STOCK}
                max={VALIDATION.MAX_STOCK}
                value={formData.stock}
                onChange={handleChange}
                required
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.stock ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {getFieldError('stock')}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Description du produit (optionnel)"
            />
            {getFieldError('description')}
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/{VALIDATION.MAX_DESCRIPTION_LENGTH} caractères
            </p>
          </div>

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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {produit ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProduitForm;
