import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useVentes, useProduits } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { ROUTES, STATS_PERIODS } from "../utils/constants";

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    ventes,
    fetchVentesStats,
    fetchVentes,
    loading: statsLoading,
  } = useVentes();
  const { produits, fetchProduits } = useProduits();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("mois");

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      fetchVentes();
      fetchProduits();
    }
  }, [isAuthenticated, selectedPeriod, fetchVentes, fetchProduits, loadStats]);

  const loadStats = React.useCallback(async () => {
    try {
      const statsData = await fetchVentesStats(selectedPeriod);
      setStats(statsData);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  }, [fetchVentesStats, selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  const getPeriodLabel = (period) => {
    const found = STATS_PERIODS.find((p) => p.value === period);
    return found ? found.label : period;
  };

  // KPIs additionnels
  const averageOrder = useMemo(() => {
    if (!stats || !stats.totalVentes) return 0;
    return (stats.totalRevenus || 0) / stats.totalVentes;
  }, [stats]);

  const stockCounts = useMemo(() => {
    const rupture = produits.filter((p) => (p.stock || 0) === 0).length;
    const low = produits.filter(
      (p) => (p.stock || 0) > 0 && p.stock < 10
    ).length;
    return { rupture, low };
  }, [produits]);

  // Top produits par quantité (à partir des stats ventesParProduit)
  const topProduits = useMemo(() => {
    const list = (stats?.ventesParProduit || [])
      .map((v) => {
        const produit = produits.find((p) => p.id === v.produitId);
        return {
          produitId: v.produitId,
          nom: produit?.nom || `Produit #${v.produitId}`,
          quantite: v._sum?.quantite || 0,
          prixTotal: v._sum?.prixTotal || 0,
        };
      })
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);
    return list;
  }, [stats, produits]);

  const maxQuantite = useMemo(
    () => topProduits.reduce((m, p) => Math.max(m, p.quantite), 0) || 1,
    [topProduits]
  );

  // Dernières ventes (5 plus récentes)
  const lastVentes = useMemo(() => {
    const sorted = [...(ventes || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    return sorted.slice(0, 5);
  }, [ventes]);

  // POS state
  const [cart, setCart] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);

  const addToCart = (produit) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === produit.id);
      if (existing) {
        if (existing.quantite + 1 > produit.stock) return prev; // ne pas dépasser le stock
        return prev.map((i) =>
          i.id === produit.id ? { ...i, quantite: i.quantite + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: produit.id,
          nom: produit.nom,
          prix: produit.prix,
          stock: produit.stock,
          quantite: 1,
        },
      ];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));
  const changeQty = (id, delta) =>
    setCart((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              quantite: Math.max(1, Math.min(i.stock, i.quantite + delta)),
            }
          : i
      )
    );
  const setQty = (id, qty) =>
    setCart((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantite: Math.max(1, Math.min(i.stock, qty || 1)) }
          : i
      )
    );

  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.prix * i.quantite, 0),
    [cart]
  );

  const { createVente } = useVentes();
  const checkout = async () => {
    try {
      setCheckingOut(true);
      for (const item of cart) {
        await createVente({ produitId: item.id, quantite: item.quantite });
      }
      setCart([]);
      await fetchVentes();
      await fetchProduits();
    } catch (e) {
      console.error("Erreur encaissement:", e);
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur Gestion Vente
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
          <div className="space-x-4">
            <a
              href={ROUTES.LOGIN}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Se connecter
            </a>
            <a
              href={ROUTES.REGISTER}
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              S&apos;inscrire
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Point de vente
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Bienvenue, {user?.nom}. Enregistrez les ventes rapidement.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="period"
                className="text-sm font-medium text-gray-700"
              >
                Période :
              </label>
              <select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="select-field w-48"
              >
                {STATS_PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche: sélection produits */}
          <div className="lg:col-span-2">
            <div className="section mb-6">
              <div className="section-inner">
                <h3 className="text-lg font-medium mb-4">Produits</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[420px] overflow-auto">
                  {produits.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="p-3 rounded border hover:border-blue-400 hover:shadow text-left"
                    >
                      <div className="font-medium truncate">{p.nom}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {p.categorie || "Sans catégorie"}
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        {formatCurrency(p.prix)}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          p.stock > 0 ? "text-gray-500" : "text-red-600"
                        }`}
                      >
                        Stock: {p.stock}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite: panier */}
          <div className="lg:col-span-1">
            <div className="section mb-6">
              <div className="section-inner">
                <h3 className="text-lg font-medium mb-4">Panier</h3>
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun article.</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border rounded p-2"
                      >
                        <div className="mr-2 truncate">
                          <div className="text-sm font-medium truncate">
                            {item.nom}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(item.prix)} ×
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            className="px-2 border rounded"
                            onClick={() => changeQty(item.id, -1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            className="w-14 border rounded px-2 py-1"
                            value={item.quantite}
                            onChange={(e) =>
                              setQty(
                                item.id,
                                parseInt(e.target.value || "1", 10)
                              )
                            }
                          />
                          <button
                            className="px-2 border rounded"
                            onClick={() => changeQty(item.id, +1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {formatCurrency(item.prix * item.quantite)}
                          </div>
                          <button
                            className="text-xs text-red-600 underline"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2 text-right">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(cartTotal)}
                      </div>
                    </div>
                    <button
                      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                      onClick={checkout}
                      disabled={checkingOut || cart.length === 0}
                    >
                      {checkingOut ? "En cours..." : "Encaisser"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="stats-grid">
          {/* Total des ventes */}
          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="stat-card-icon bg-blue-500">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total des ventes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                      ) : (
                        stats?.totalVentes || 0
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Revenus totaux */}
          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="stat-card-icon bg-green-500">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Revenus totaux
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
                      ) : (
                        formatCurrency(stats?.totalRevenus || 0)
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Période sélectionnée */}
          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="stat-card-icon bg-purple-500">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Période
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {getPeriodLabel(selectedPeriod)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          {/* Panier moyen */}
          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="stat-card-icon bg-indigo-500">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16 11V3a1 1 0 10-2 0v8H9V5a1 1 0 10-2 0v6H4a1 1 0 100 2h3v4a1 1 0 102 0v-4h5a1 1 0 100-2h-1z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Panier moyen
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                      ) : (
                        new Intl.NumberFormat("fr-TN", {
                          style: "currency",
                          currency: "TND",
                        }).format(averageOrder || 0)
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          {/* Stocks critiques */}
          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="stat-card-icon bg-red-500">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.366-.446 1.12-.446 1.486 0l6.518 7.947c.39.475.038 1.204-.743 1.204H2.482c-.78 0-1.132-.729-.743-1.204l6.518-7.947zM11 13a1 1 0 10-2 0 1 1 0 002 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Stocks critiques
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stockCounts.rupture} rupture(s), {stockCounts.low}{" "}
                      faible(s)
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top produits */}
        <div className="section mb-8">
          <div className="section-inner">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top produits (quantités)
            </h3>
            {topProduits.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucune donnée disponible pour la période sélectionnée.
              </p>
            ) : (
              <div className="space-y-3">
                {topProduits.map((p) => (
                  <div key={p.produitId} className="">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{p.nom}</span>
                      <span className="text-gray-500">{p.quantite}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded">
                      <div
                        className="h-3 bg-green-500 rounded"
                        style={{
                          width: `${Math.max(
                            5,
                            (p.quantite / maxQuantite) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dernières ventes */}
        <div className="section mb-8">
          <div className="section-inner">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dernières ventes
            </h3>
            {lastVentes.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune vente récente.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendeur
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lastVentes.map((v) => (
                      <tr key={v.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(v.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {v.produit?.nom || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {v.quantite}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat("fr-TN", {
                            style: "currency",
                            currency: "TND",
                          }).format(v.prixTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {v.user?.nom || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="section mb-8">
          <div className="section-inner">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(ROUTES.PRODUCTS)}
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium group-hover:text-blue-600 transition-colors">
                    Gérer les produits
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Ajouter, modifier ou supprimer des produits de votre
                    catalogue.
                  </p>
                </div>
              </div>

              <div
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(ROUTES.SALES)}
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium group-hover:text-green-600 transition-colors">
                    Nouvelle vente
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Enregistrer une nouvelle vente et mettre à jour les stocks.
                  </p>
                </div>
              </div>

              <div
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(ROUTES.SALES)}
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium group-hover:text-yellow-600 transition-colors">
                    Voir les ventes
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Consulter l&apos;historique de toutes vos ventes et
                    statistiques.
                  </p>
                </div>
              </div>

              <div
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(ROUTES.PRODUCTS)}
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium group-hover:text-purple-600 transition-colors">
                    Rechercher
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Rechercher rapidement des produits ou des ventes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="section">
          <div className="section-inner">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Informations du compte
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nom</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.nom}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {user?.role}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Membre depuis
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                    : "N/A"}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
