import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import apiService from "../services/api";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ventesStats, usersStats] = await Promise.all([
          apiService.getVentesStats(),
          apiService.getUsersStats(),
        ]);
        setStats({ ventes: ventesStats, users: usersStats });
      } catch (err) {
        setError("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
          <p className="text-gray-600">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  // Préparation des données pour les graphiques
  const ventesLabels = (stats.ventes.ventesParProduit || []).map(
    (v) => `Produit ${v.produitId}`
  );
  const ventesData = (stats.ventes.ventesParProduit || []).map(
    (v) => v._sum.quantite
  );

  // Adapter la forme renvoyée par le backend users/stats
  // backend renvoie { stats: { totalUsers, adminUsers, regularUsers, topUsers } }
  const userRoleLabels = ["Admins", "Utilisateurs"];
  const userRoleData = [
    stats.users?.stats?.adminUsers || 0,
    stats.users?.stats?.regularUsers || 0,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">
            Vue d'ensemble des ventes et des utilisateurs
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500">Total ventes</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.ventes.totalVentes}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500">Revenus totaux</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(stats.ventes.totalRevenus)}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500">Admins</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.users?.stats?.adminUsers || 0}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500">Utilisateurs</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {stats.users?.stats?.regularUsers || 0}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ventes par produit
            </h3>
            <Bar
              data={{
                labels: ventesLabels,
                datasets: [
                  {
                    label: "Quantité vendue",
                    data: ventesData,
                    backgroundColor: "#3b82f6",
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
                maintainAspectRatio: false,
              }}
              height={300}
            />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Utilisateurs par rôle
            </h3>
            <Pie
              data={{
                labels: userRoleLabels,
                datasets: [
                  {
                    data: userRoleData,
                    backgroundColor: ["#10b981", "#f59e0b"],
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
