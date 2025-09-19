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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Menu de navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to={ROUTES.HOME} className="flex items-center mr-4">
              <div className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-soft">
                <svg
                  className="h-5 w-5"
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
              <span className="ml-3 text-gray-900 font-semibold tracking-tight">
                G Vente
              </span>
            </Link>
            <Link
              to={ROUTES.HOME}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActiveRoute(ROUTES.HOME)
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Accueil
            </Link>

            {/* Admin: CRUD Produits */}

            {/* Admin: CRUD Vendeurs */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/vendeurs"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActiveRoute("/vendeurs")
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Vendeurs
              </Link>
            )}

            {/* Admin: CRUD Fournisseurs */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to={ROUTES.SUPPLIERS}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActiveRoute(ROUTES.SUPPLIERS)
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Fournisseurs
              </Link>
            )}

            {/* Admin: CRUD Clients */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to={ROUTES.CLIENTS}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActiveRoute(ROUTES.CLIENTS)
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Clients
              </Link>
            )}

            {/* Admin: CRUD Services */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to={ROUTES.SERVICES}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActiveRoute(ROUTES.SERVICES)
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Services
              </Link>
            )}

            {/* Admin: CRUD Catégories */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/categories"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActiveRoute("/categories")
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Catégories
              </Link>
            )}

            {/* Admin: CRUD Zones */}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to={ROUTES.ZONES}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActiveRoute(ROUTES.ZONES)
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActiveRoute(ROUTES.PRODUCTS)
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Produits
                </Link>
                <Link
                  to={ROUTES.SALES}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActiveRoute(ROUTES.SALES)
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1"
                >
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-sm font-medium">
                      {user?.nom?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{user?.nom}</div>
                    <div className="text-gray-500 text-xs capitalize">
                      {user?.role === "user" ? "Vendeur" : user?.role}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white shadow-soft"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-semibold text-white shadow-soft"
                >
                  Connexion
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold text-white shadow-soft"
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
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
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
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to={ROUTES.HOME}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveRoute(ROUTES.HOME)
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={closeMenu}
            >
              Accueil
            </Link>

            {isAuthenticated && user?.role === "admin" ? (
              <>
                <Link
                  to={ROUTES.PRODUCTS}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute(ROUTES.PRODUCTS)
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  Produits
                </Link>
                <Link
                  to="/vendeurs"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute("/vendeurs")
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  Vendeurs
                </Link>
                <Link
                  to={ROUTES.SUPPLIERS}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute(ROUTES.SUPPLIERS)
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  Fournisseurs
                </Link>
                <Link
                  to={ROUTES.CLIENTS}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute(ROUTES.CLIENTS)
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  Clients
                </Link>
                <Link
                  to={ROUTES.SERVICES}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute(ROUTES.SERVICES)
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  Services
                </Link>
                <Link
                  to={ROUTES.ZONES}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute(ROUTES.ZONES)
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
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
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActiveRoute(ROUTES.PRODUCTS)
                        ? "text-gray-900 bg-gray-100"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={closeMenu}
                  >
                    Produits
                  </Link>
                  <Link
                    to={ROUTES.SALES}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActiveRoute(ROUTES.SALES)
                        ? "text-gray-900 bg-gray-100"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
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
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-4 space-y-3">
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-2 py-1"
                >
                  <div className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-sm font-medium">
                      {user?.nom?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-medium">{user?.nom}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {user?.role}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white shadow-soft"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                <Link
                  to={ROUTES.LOGIN}
                  className="block w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-semibold text-center text-white shadow-soft"
                  onClick={closeMenu}
                >
                  Connexion
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold text-center text-white shadow-soft"
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
