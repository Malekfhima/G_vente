import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { ROUTES } from "../utils/constants";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate(ROUTES.LOGIN);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveRoute = (route) => {
    return location.pathname === route;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Menu de navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to={ROUTES.HOME}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActiveRoute(ROUTES.HOME)
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              Accueil
            </Link>

            {/* Admin: CRUD Produits */}

            {/* Admin: CRUD Vendeurs */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/vendeurs"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute("/vendeurs")
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                Vendeurs
              </Link>
            )}

            {/* Admin: CRUD Fournisseurs */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to={ROUTES.SUPPLIERS}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(ROUTES.SUPPLIERS)
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                Fournisseurs
              </Link>
            )}

            {/* Admin: CRUD Clients */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to={ROUTES.CLIENTS}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(ROUTES.CLIENTS)
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                Clients
              </Link>
            )}

            {/* Admin: CRUD Services */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to={ROUTES.SERVICES}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(ROUTES.SERVICES)
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                Services
              </Link>
            )}

            {/* Admin: CRUD Zones */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to={ROUTES.ZONES}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(ROUTES.ZONES)
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                Zones
              </Link>
            )}

            {/* Navigation pour tous les utilisateurs authentifiés */}
            {isAuthenticated && (
              <>
                <Link
                  to={ROUTES.PRODUCTS}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(ROUTES.PRODUCTS)
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  Produits
                </Link>

                <Link
                  to={ROUTES.SALES}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(ROUTES.SALES)
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  Ventes
                </Link>
              </>
            )}
          </div>

          {/* Section utilisateur - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 hover:opacity-90"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.nom?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{user?.nom}</div>
                    <div className="text-blue-200 text-xs capitalize">
                      {user?.role === "user" ? "Vendeur" : user?.role}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-blue-100 hover:text-white focus:outline-none focus:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to={ROUTES.HOME}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActiveRoute(ROUTES.HOME)
                  ? "bg-blue-800 text-white"
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              }`}
              onClick={closeMenu}
            >
              Accueil
            </Link>

            {isAuthenticated && user?.role === "admin" ? (
              <>
                <Link
                  to={ROUTES.PRODUCTS}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveRoute(ROUTES.PRODUCTS)
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                  onClick={closeMenu}
                >
                  Produits
                </Link>
                <Link
                  to="/vendeurs"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveRoute("/vendeurs")
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                  onClick={closeMenu}
                >
                  Vendeurs
                </Link>
                <Link
                  to={ROUTES.SUPPLIERS}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveRoute(ROUTES.SUPPLIERS)
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                  onClick={closeMenu}
                >
                  Fournisseurs
                </Link>
                <Link
                  to={ROUTES.CLIENTS}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveRoute(ROUTES.CLIENTS)
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                  onClick={closeMenu}
                >
                  Clients
                </Link>
                <Link
                  to={ROUTES.SERVICES}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveRoute(ROUTES.SERVICES)
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                  onClick={closeMenu}
                >
                  Services
                </Link>
                <Link
                  to={ROUTES.ZONES}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveRoute(ROUTES.ZONES)
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                  onClick={closeMenu}
                >
                  Zones
                </Link>
              </>
            ) : (
              isAuthenticated && (
                <>
                  <Link
                    to={ROUTES.PRODUCTS}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActiveRoute(ROUTES.PRODUCTS)
                        ? "bg-blue-800 text-white"
                        : "text-blue-100 hover:bg-blue-800 hover:text-white"
                    }`}
                    onClick={closeMenu}
                  >
                    Produits
                  </Link>
                  <Link
                    to={ROUTES.SALES}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActiveRoute(ROUTES.SALES)
                        ? "bg-blue-800 text-white"
                        : "text-blue-100 hover:bg-blue-800 hover:text-white"
                    }`}
                    onClick={closeMenu}
                  >
                    Ventes
                  </Link>
                </>
              )
            )}
          </div>

          {/* Section utilisateur mobile */}
          <div className="pt-4 pb-3 border-t border-blue-600">
            {isAuthenticated ? (
              <div className="px-4 space-y-3">
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 hover:opacity-90"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.nom?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-medium">{user?.nom}</div>
                    <div className="text-sm text-blue-200 capitalize">
                      {user?.role}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                <Link
                  to={ROUTES.LOGIN}
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-center transition-colors"
                  onClick={closeMenu}
                >
                  Connexion
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium text-center transition-colors"
                  onClick={closeMenu}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
