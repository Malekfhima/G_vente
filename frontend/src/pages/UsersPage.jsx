import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/api";
import UserList from "../components/UserList";
import UserForm from "../components/UserForm";
import { MESSAGES, USER_ROLES } from "../utils/constants";

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Vérifier si l'utilisateur actuel est admin
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  // Charger les utilisateurs et statistiques
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [usersResponse, statsResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getUserStats(),
      ]);

      setUsers(usersResponse.users);
      setStats(statsResponse.stats);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setError(error.message || MESSAGES.ERROR.NETWORK);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Gestion de la création/modification d'utilisateur
  const handleSubmit = async (userData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      if (selectedUser) {
        // Modification
        await apiService.updateUser(selectedUser.id, userData);
        setSuccess(MESSAGES.SUCCESS.UPDATE_USER);
      } else {
        // Création
        await apiService.createUser(userData);
        setSuccess(MESSAGES.SUCCESS.CREATE_USER);
      }

      // Recharger les données
      await loadUsers();

      // Fermer le formulaire
      handleCancel();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setError(error.message || MESSAGES.ERROR.SERVER_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de la suppression d'utilisateur
  const handleDelete = async (userId) => {
    try {
      setError(null);
      setSuccess(null);

      await apiService.deleteUser(userId);
      setSuccess(MESSAGES.SUCCESS.DELETE_USER);

      // Recharger les données
      await loadUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError(error.message || MESSAGES.ERROR.SERVER_ERROR);
    }
  };

  // Gestion de l'édition d'utilisateur
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  // Gestion de l'annulation
  const handleCancel = () => {
    setSelectedUser(null);
    setShowForm(false);
    setError(null);
    setSuccess(null);
  };

  // Gestion de la création d'un nouvel utilisateur
  const handleCreate = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  // Si l'utilisateur n'est pas admin, afficher un message d'accès refusé
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Accès Refusé
          </h1>
          <p className="text-gray-600">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Gérez les utilisateurs de l&apos;application et leurs permissions.
          </p>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Utilisateurs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Administrateurs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.adminUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Utilisateurs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.regularUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Plus Actif
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.topUsers?.[0]?._count?.ventes || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des utilisateurs */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Liste des Utilisateurs
              </h2>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  className="w-5 h-5 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Nouvel Utilisateur
              </button>
            </div>

            <UserList
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={loadUsers}
              isLoading={isLoading}
              currentUserId={currentUser?.id}
            />
          </div>

          {/* Formulaire ou détails */}
          <div className="lg:col-span-1">
            {showForm ? (
              <UserForm
                user={selectedUser}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Actions Rapides
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={handleCreate}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Créer un nouvel utilisateur
                  </button>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Utilisateurs les plus actifs
                    </h4>
                    {stats?.topUsers?.slice(0, 3).map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {index + 1}.
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {user.nom}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {user._count.ventes} ventes
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
