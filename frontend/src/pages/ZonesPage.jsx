import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import "../styles/pages/zones.css";

const ZonesPage = () => {
  const { isAdmin } = useAuth();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [stats, setStats] = useState(null);
  const [topZones, setTopZones] = useState([]);
  // const [trends, setTrends] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    adresse: "",
    ville: "",
    codePostal: "",
    pays: "Tunisie",
    actif: true,
  });

  // Chargements initiaux une fois les callbacks définis

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/zones");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des zones");
      const data = await response.json();
      setZones(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/zones/stats/rentability?period=${selectedPeriod}`
      );
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des statistiques");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erreur stats:", error);
    }
  }, [selectedPeriod]);

  const fetchTopZones = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/zones/stats/top?limit=5&period=${selectedPeriod}`
      );
      if (!response.ok)
        throw new Error("Erreur lors de la récupération du top des zones");
      const data = await response.json();
      setTopZones(data.topZones);
    } catch (error) {
      console.error("Erreur top zones:", error);
    }
  }, [selectedPeriod]);

  const fetchTrends = async () => {
    try {
      const response = await fetch(`/api/zones/stats/trends?days=30`);
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des tendances");
      await response.json();
      // setTrends(data); // Commenté car trends n'est pas utilisé
    } catch (error) {
      console.error("Erreur tendances:", error);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = "/";
      return;
    }
    fetchZones();
    fetchStats();
    fetchTopZones();
    fetchTrends();
  }, [isAdmin, selectedPeriod, fetchStats, fetchTopZones]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingZone ? `/api/zones/${editingZone.id}` : "/api/zones";
      const method = editingZone ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      setShowForm(false);
      setEditingZone(null);
      resetForm();
      fetchZones();
      fetchStats();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      nom: zone.nom,
      description: zone.description || "",
      adresse: zone.adresse || "",
      ville: zone.ville || "",
      codePostal: zone.codePostal || "",
      pays: zone.pays || "Tunisie",
      actif: zone.actif,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette zone ?"))
      return;

    try {
      const response = await fetch(`/api/zones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      fetchZones();
      fetchStats();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingZone(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      description: "",
      adresse: "",
      ville: "",
      codePostal: "",
      pays: "Tunisie",
      actif: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h1>
          <p className="text-gray-600">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Racks
            </h1>
            <p className="text-gray-600">
              Gérez les racks et analysez leur rentabilité
            </p>
          </div>

          {/* Sélecteur de période */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Période d&apos;analyse (rentabilité racks):
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="daily">Aujourd&apos;hui</option>
                <option value="weekly">Cette semaine</option>
                <option value="monthly">Ce mois</option>
                <option value="yearly">Cette année</option>
              </select>
            </div>
          </div>

          {/* Statistiques des racks */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Racks
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalZones}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Revenu Total
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.zones
                        .reduce((sum, zone) => sum + zone.totalRevenue, 0)
                        .toFixed(2)}{" "}
                      TND
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Clients
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.zones.reduce(
                        (sum, zone) => sum + zone.nombreClients,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Ventes
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.zones.reduce(
                        (sum, zone) => sum + zone.totalVentes,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top des racks les plus rentables */}
          {topZones.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Top 5 des Racks les Plus Rentables
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topZones.map((zone, index) => (
                  <div
                    key={zone.id}
                    className="text-center p-4 border rounded-lg"
                  >
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      #{index + 1}
                    </div>
                    <div className="font-semibold text-gray-900 mb-1">
                      {zone.nom}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {zone.ville}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {zone.rentabilite.toFixed(2)} TND
                    </div>
                    <div className="text-xs text-gray-500">par client</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barre d'outils */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  + Nouveau Rack
                </button>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingZone ? "Modifier le rack" : "Nouveau rack"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du rack *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Nom du rack"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allée
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Allée (ex: A)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position / Étagère
                    </label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Position (ex: Ét. 3, Niv. 2)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colonne
                    </label>
                    <input
                      type="text"
                      name="codePostal"
                      value={formData.codePostal}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Colonne (ex: 3)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      name="pays"
                      value={formData.pays}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Pays"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="actif"
                      checked={formData.actif}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Rack actif
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Description du rack..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                  >
                    {editingZone ? "Mettre à jour" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des racks avec rentabilité */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des racks...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchZones();
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Réessayer
                </button>
              </div>
            ) : zones.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">Aucun rack disponible</p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Créer le premier rack
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rack
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ventes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenu Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rentabilité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {zones.map((zone) => {
                      const zoneStats = stats?.zones.find(
                        (s) => s.id === zone.id
                      );
                      return (
                        <tr key={zone.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">
                                  {zone.nom.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {zone.nom}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {zone.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {zone.ville || "Non spécifiée"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {zone.codePostal || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {zoneStats?.nombreClients || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {zoneStats?.totalVentes || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {zoneStats?.totalRevenue?.toFixed(2) || "0.00"}{" "}
                              TND
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {zoneStats?.rentabilite?.toFixed(2) || "0.00"} TND
                            </div>
                            <div className="text-xs text-gray-500">
                              par client
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                zone.actif
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {zone.actif ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(zone)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(zone.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZonesPage;
