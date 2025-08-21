import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { ROUTES } from "../utils/constants";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate(ROUTES.LOGIN);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 min-h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center font-bold">
            {user?.nom?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-semibold">{user?.nom}</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          to={ROUTES.HOME}
          className={`block px-3 py-2 rounded ${
            isActive(ROUTES.HOME) ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          Dashboard
        </Link>
        <Link
          to={ROUTES.SALES}
          className={`block px-3 py-2 rounded ${
            isActive(ROUTES.SALES) ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          Ventes
        </Link>
        <Link
          to={ROUTES.PRODUCTS}
          className={`block px-3 py-2 rounded ${
            isActive(ROUTES.PRODUCTS) ? "bg-gray-800" : "hover:bg-gray-800"
          }`}
        >
          Produits
        </Link>
        {isAdmin && (
          <>
            <Link
              to={ROUTES.USERS}
              className={`block px-3 py-2 rounded ${
                isActive(ROUTES.USERS) ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
            >
              Utilisateurs
            </Link>
            <Link
              to={ROUTES.SUPPLIERS}
              className={`block px-3 py-2 rounded ${
                isActive(ROUTES.SUPPLIERS) ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
            >
              Fournisseurs
            </Link>
            <Link
              to={ROUTES.CLIENTS}
              className={`block px-3 py-2 rounded ${
                isActive(ROUTES.CLIENTS) ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
            >
              Clients
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded bg-red-600 hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


