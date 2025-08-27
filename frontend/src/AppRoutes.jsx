// ...existing code...
const TestPage = () => (
  <div style={{ padding: 40, textAlign: "center" }}>
    <h1 style={{ color: "#3182ce" }}>Test Frontend OK</h1>
    <p>Si tu vois ce message, le frontend fonctionne.</p>
  </div>
);
<Route path="/test" element={<TestPage />} />;
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import ProduitsPage from "./pages/ProduitsPage";
import VentesPage from "./pages/VentesPage";
import POSPage from "./pages/POSPage";
import { ROUTES } from "./utils/constants";
import UsersPage from "./pages/UsersPage";
import VendeursPage from "./pages/VendeursPage";
import ClientsPage from "./pages/ClientsPage";
import FournisseursPage from "./pages/FournisseursPage";
import ServicesPage from "./pages/ServicesPage";
import ZonesPage from "./pages/ZonesPage";
import ProfilePage from "./pages/ProfilePage";
import CategoriesPage from "./pages/CategoriesPage";
import AdminRoute from "./components/AdminRoute";

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

      {/* Accueil -> POS plein écran (sans Navbar) */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <POSPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PRODUCTS}
        element={
          <ProtectedRoute>
            <ProduitsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SERVICES}
        element={
          <AdminRoute>
            <ServicesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <AdminRoute>
            <CategoriesPage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.ZONES}
        element={
          <AdminRoute>
            <ZonesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SALES}
        element={
          <ProtectedRoute>
            <VentesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.POS}
        element={
          <ProtectedRoute>
            <POSPage />
          </ProtectedRoute>
        }
      />

      {/* Admin CRUD pages */}
      <Route
        path={ROUTES.USERS}
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendeurs"
        element={
          <ProtectedRoute>
            <VendeursPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CLIENTS}
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUPPLIERS}
        element={
          <ProtectedRoute>
            <FournisseursPage />
          </ProtectedRoute>
        }
      />

      {/* Route par défaut - affiche HomePage si non connecté */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default AppRoutes;
