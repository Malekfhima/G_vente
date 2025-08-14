import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProduitsPage from './pages/ProduitsPage';
import VentesPage from './pages/VentesPage';
import { ROUTES } from './utils/constants';

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

// Composant pour les routes publiques (redirection si déjà connecté)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Routes protégées avec navigation */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <HomePage />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PRODUCTS}
        element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <ProduitsPage />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SALES}
        element={
          <ProtectedRoute>
            <div>
              <Navbar />
              <VentesPage />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Route par défaut - redirection vers l'accueil */}
      <Route
        path="*"
        element={<Navigate to={ROUTES.HOME} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;