import React, { useState } from "react";

const VendeurForm = ({ vendeur, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: vendeur?.nom || "",
    email: vendeur?.email || "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du vendeur est requis";
    } else if (formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    } else if (formData.nom.length > 50) {
      newErrors.nom = "Le nom ne peut pas dépasser 50 caractères";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
    }

    // Pour la création, le mot de passe est requis
    if (!vendeur && !formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      nom: formData.nom.trim(),
      email: formData.email.trim().toLowerCase(),
    };

    // Inclure le mot de passe seulement s'il a été saisi
    if (formData.password) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
    ) : null;
  };

  return (
    <div className="card card-hoverable">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">
          {vendeur ? "Modifier le vendeur" : "Ajouter un nouveau vendeur"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom complet *
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                required
                maxLength={50}
                className={`input-field ${errors.nom ? "input-error" : ""}`}
                placeholder="Nom et prénom"
              />
              {getFieldError("nom")}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`input-field ${errors.email ? "input-error" : ""}`}
                placeholder="email@exemple.com"
              />
              {getFieldError("email")}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {vendeur
                  ? "Nouveau mot de passe (optionnel)"
                  : "Mot de passe *"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                className={`input-field ${
                  errors.password ? "input-error" : ""
                }`}
                placeholder={
                  vendeur ? "Laisser vide pour ne pas changer" : "Mot de passe"
                }
              />
              {getFieldError("password")}
              {vendeur && (
                <p className="text-sm text-gray-500 mt-1">
                  Laissez vide pour conserver le mot de passe actuel
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {vendeur ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendeurForm;
