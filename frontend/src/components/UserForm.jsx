import React, { useState, useEffect } from 'react';
import { USER_ROLES, VALIDATION, MESSAGES } from '../utils/constants';

const UserForm = ({ user, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Initialiser le formulaire avec les données de l'utilisateur si en mode édition
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        nom: user.nom || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Validation de l'email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du nom
    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length > VALIDATION.MAX_NAME_LENGTH) {
      newErrors.nom = `Le nom ne peut pas dépasser ${VALIDATION.MAX_NAME_LENGTH} caractères`;
    }

    // Validation du mot de passe (requis seulement pour la création)
    if (!user) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        newErrors.password = `Le mot de passe doit contenir au moins ${VALIDATION.MIN_PASSWORD_LENGTH} caractères`;
      }
    } else if (formData.password && formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      newErrors.password = `Le mot de passe doit contenir au moins ${VALIDATION.MIN_PASSWORD_LENGTH} caractères`;
    }

    // Validation de la confirmation du mot de passe
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation du rôle
    if (!Object.values(USER_ROLES).includes(formData.role)) {
      newErrors.role = 'Rôle invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const userData = {
        email: formData.email.trim(),
        nom: formData.nom.trim(),
        role: formData.role
      };

      // Ajouter le mot de passe seulement s'il a été saisi
      if (formData.password) {
        userData.password = formData.password;
      }

      onSubmit(userData);
    }
  };

  // Gestion des changements dans les champs
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {user ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="exemple@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nom ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nom complet"
            disabled={isLoading}
          />
          {errors.nom && (
            <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
          )}
        </div>

        {/* Rôle */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Rôle *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.role ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value={USER_ROLES.USER}>Utilisateur</option>
            <option value={USER_ROLES.ADMIN}>Administrateur</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe {!user && '*'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={user ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          {user && (
            <p className="mt-1 text-sm text-gray-500">
              Laissez vide pour conserver le mot de passe actuel
            </p>
          )}
        </div>

        {/* Confirmation du mot de passe */}
        {formData.password && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirmer le mot de passe"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {user ? 'Modification...' : 'Création...'}
              </div>
            ) : (
              user ? 'Modifier' : 'Créer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
