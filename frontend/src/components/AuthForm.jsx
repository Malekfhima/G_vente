import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom";
import { ROUTES, VALIDATION } from "../utils/constants";

const AuthForm = ({ mode = "login" }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nom: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const isLoginMode = mode === "login";

  const validateForm = () => {
    const newErrors = {};

    // Validation email
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      newErrors.password = `Le mot de passe doit contenir au moins ${VALIDATION.MIN_PASSWORD_LENGTH} caractères`;
    }

    // Validation nom (inscription uniquement)
    if (!isLoginMode && !formData.nom) {
      newErrors.nom = "Le nom est requis";
    } else if (
      !isLoginMode &&
      formData.nom.length > VALIDATION.MAX_NAME_LENGTH
    ) {
      newErrors.nom = `Le nom ne peut pas dépasser ${VALIDATION.MAX_NAME_LENGTH} caractères`;
    }

    // Validation confirmation mot de passe (inscription uniquement)
    if (!isLoginMode && !formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (!isLoginMode && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login({
          email: formData.email,
          password: formData.password,
        });
        navigate(ROUTES.HOME);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
        });
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      // L'erreur est gérée par le hook useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
    ) : null;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div>
          <div className="auth-brand">
            <svg
              className="h-8 w-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="auth-title">
            {isLoginMode
              ? "Connexion à votre compte"
              : "Créer un nouveau compte"}
          </h2>
          <p className="auth-subtitle">
            {isLoginMode ? (
              <>
                Ou{" "}
                <button
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="btn-link"
                >
                  créez un compte gratuitement
                </button>
              </>
            ) : (
              <>
                Ou{" "}
                <button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="btn-link"
                >
                  connectez-vous à votre compte existant
                </button>
              </>
            )}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nom (inscription uniquement) */}
            {!isLoginMode && (
              <div>
                <label htmlFor="nom" className="form-label">
                  Nom complet
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required={!isLoginMode}
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`input-field ${errors.nom ? "input-error" : ""}`}
                  placeholder="Votre nom complet"
                />
                {getFieldError("nom")}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`input-field ${errors.email ? "input-error" : ""}`}
                placeholder="votre@email.com"
              />
              {getFieldError("email")}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`input-field ${
                  errors.password ? "input-error" : ""
                }`}
                placeholder="Votre mot de passe"
              />
              {getFieldError("password")}
            </div>

            {/* Confirmation mot de passe (inscription uniquement) */}
            {!isLoginMode && (
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required={!isLoginMode}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`input-field ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                  placeholder="Confirmez votre mot de passe"
                />
                {getFieldError("confirmPassword")}
              </div>
            )}
          </div>

          {/* Bouton de soumission */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full btn btn-primary ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {isSubmitting
                ? "Traitement..."
                : isLoginMode
                ? "Se connecter"
                : "S'inscrire"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
