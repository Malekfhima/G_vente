import { useState, useEffect, createContext, useContext } from "react";
import apiService from "../services/api";

// Contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

// Provider d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérification automatique du token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const profile = await apiService.getProfile();
          setUser(profile.user);
          setError(null);
        } catch (err) {
          console.error("Token invalide:", err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Connexion
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.login(credentials);

      const { user: userData, token: newToken } = response;

      // Stockage du token et des données utilisateur
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.message || "Erreur de connexion";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.register(userData);

      const { user: newUser, token: newToken } = response;

      // Stockage du token et des données utilisateur
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.message || "Erreur d'inscription";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Mise à jour du profil
  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  // Vérification si l'utilisateur est connecté
  const isAuthenticated = !!user && !!token;

  // Vérification du rôle admin
  const isAdmin = user?.role === "admin";

  // Vérification du rôle vendeur
  const isVendeur = user?.role === "user" || user?.role === "admin";

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isAdmin,
    isVendeur,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
