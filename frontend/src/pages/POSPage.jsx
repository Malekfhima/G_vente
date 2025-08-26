import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";

import { useAuth } from "../hooks/useAuth";

const POSPage = () => {
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codeArticle, setCodeArticle] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [heure, setHeure] = useState(new Date().toLocaleTimeString());
  const [ticketNumber, setTicketNumber] = useState(1);
  const lastDateRef = useRef(new Date().toISOString().slice(0, 10));
  const [filtreCategorie, setFiltreCategorie] = useState("");
  const [recherche, setRecherche] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const list = await api.getProduits();
        setProduits(list);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des produits.");
        setLoading(false);
      }
    };
    fetchProduits();
    // Initialiser le compteur de tickets depuis localStorage (par jour)
    const initTicketCounter = () => {
      const todayISO = new Date().toISOString().slice(0, 10);
      try {
        const saved = JSON.parse(
          localStorage.getItem("pos_ticket_counter") || "null"
        );
        if (
          saved &&
          saved.date === todayISO &&
          typeof saved.count === "number"
        ) {
          setTicketNumber(saved.count + 1);
        } else {
          setTicketNumber(1);
        }
      } catch (_) {
        /* ignore */
        setTicketNumber(1);
      }
      lastDateRef.current = todayISO;
    };
    initTicketCounter();

    const timer = setInterval(() => {
      const now = new Date();
      setHeure(now.toLocaleTimeString());
      // Réinitialiser le compteur à minuit (changement de jour)
      const todayISO = now.toISOString().slice(0, 10);
      if (todayISO !== lastDateRef.current) {
        lastDateRef.current = todayISO;
        try {
          localStorage.setItem(
            "pos_ticket_counter",
            JSON.stringify({ date: todayISO, count: 0 })
          );
        } catch (_) {
          /* ignore */
        }
        setTicketNumber(1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ajouter un produit au panier par code article
  const ajouterParCode = () => {
    const produit = produits.find(
      (p) => String(p.id) === codeArticle || (p.code && p.code === codeArticle)
    );
    if (!produit) {
      alert("Produit non trouvé");
      return;
    }
    if (quantite <= 0) {
      alert("La quantité doit être positive");
      return;
    }
    if (
      !isServiceProduct(produit) &&
      produit.stock !== undefined &&
      quantite > produit.stock
    ) {
      alert(`Stock insuffisant. Disponible: ${produit.stock}`);
      return;
    }
    setPanier((prev) => [...prev, { ...produit, quantite }]);
    setCodeArticle("");
    setQuantite(1);
  };

  // Ajouter un produit au panier par bouton
  const ajouterAuPanier = (produit) => {
    if (
      !isServiceProduct(produit) &&
      produit.stock !== undefined &&
      produit.stock <= 0
    ) {
      alert("Stock insuffisant");
      return;
    }
    setPanier((prev) => [...prev, { ...produit, quantite: 1 }]);
  };

  // Retirer un produit du panier
  const retirerDuPanier = (index) => {
    setPanier((prev) => prev.filter((_, i) => i !== index));
  };

  const changerQuantiteLigne = (index, nouvelleQuantite) => {
    const q = Math.max(1, Number(nouvelleQuantite) || 1);
    setPanier((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantite: q } : item))
    );
  };

  // Calcul du total du panier avec remise
  const total = panier.reduce(
    (acc, prod) =>
      acc + (prod.prix || 0) * (prod.quantite || 1) - (prod.remise || 0),
    0
  );
  const [montantEncaisse, setMontantEncaisse] = useState(0);
  // Calcul du rendu
  const montantRendu = montantEncaisse > 0 ? montantEncaisse - total : 0;

  // Incrémente le compteur journalier et prépare le prochain numéro à afficher
  const incrementDailyTicketCounter = () => {
    const todayISO = new Date().toISOString().slice(0, 10);
    try {
      const saved = JSON.parse(
        localStorage.getItem("pos_ticket_counter") || "null"
      );
      const newCount =
        saved && saved.date === todayISO && typeof saved.count === "number"
          ? saved.count + 1
          : 1;
      localStorage.setItem(
        "pos_ticket_counter",
        JSON.stringify({ date: todayISO, count: newCount })
      );
      setTicketNumber(newCount + 1);
      lastDateRef.current = todayISO;
    } catch (_) {
      try {
        localStorage.setItem(
          "pos_ticket_counter",
          JSON.stringify({ date: todayISO, count: 1 })
        );
      } catch (_) {
        /* ignore */
      }
      setTicketNumber(2);
      lastDateRef.current = todayISO;
    }
  };

  // Valider la vente et mettre à jour le stock
  const payer = async () => {
    if (panier.length === 0) return;
    try {
      await Promise.all(
        panier.map((item) =>
          api.createVente({ produitId: item.id, quantite: item.quantite })
        )
      );
      alert("Paiement effectué et ventes enregistrées !");
      setPanier([]);
      setMontantEncaisse(0);
      const list = await api.getProduits();
      setProduits(list);
      // Passer au prochain numéro de ticket après l'encaissement
      incrementDailyTicketCounter();
    } catch (err) {
      const msg =
        err?.message || "Erreur lors de l'enregistrement de la vente.";
      alert(msg);
    }
  };

  // Modifier la remise sur une ligne du panier
  const changerRemise = (index, remise) => {
    setPanier(
      panier.map((item, i) =>
        i === index ? { ...item, remise: Number(remise) } : item
      )
    );
  };

  // Impression du ticket (PDF côté serveur)
  const imprimerTicket = async () => {
    try {
      const items = panier.map((p) => ({
        id: p.id,
        nom: p.nom,
        prix: p.prix,
        quantite: p.quantite,
        remise: p.remise || 0,
      }));
      const payload = {
        items,
        total,
        encaisse: montantEncaisse,
        rendu: montantRendu,
      };

      const token = localStorage.getItem("token");
      const res = await fetch("/api/ventes/ticket/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur génération ticket");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const win = window.open(url);
      if (!win) {
        // fallback download
        const a = document.createElement("a");
        a.href = url;
        a.download = "ticket.pdf";
        a.click();
      }

      // Incrémenter le compteur de tickets pour aujourd'hui
      incrementDailyTicketCounter();
    } catch (e) {
      alert(e.message || "Erreur impression ticket");
    }
  };

  // Catégories fictives
  const categories = [
    "SERVICES",
    "IMPRESSION",
    "PHOTOCOPIE",
    "PLASTIFICATION",
    "RELIURE",
    "SCOLARITE",
  ];

  const serviceCategories = new Set([
    "SERVICES",
    "IMPRESSION",
    "PHOTOCOPIE",
    "PLASTIFICATION",
    "RELIURE",
    "SCOLARITE",
  ]);

  const isServiceProduct = (p) =>
    p?.isService === true || serviceCategories.has(p?.categorie);

  // Logout

  const magasinNom = "Magasin Principal";
  const dateStr = new Date().toLocaleDateString("fr-TN");

  const formatTND = (val) =>
    new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(val || 0);

  const produitsFiltres = produits
    .filter(
      (p) =>
        !filtreCategorie ||
        (p.categorie &&
          p.categorie.toUpperCase() === filtreCategorie.toUpperCase())
    )
    .filter(
      (p) =>
        !recherche ||
        p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        String(p.id).includes(recherche)
    );

  return (
    <div className="min-h-screen bg-gray-50 relative p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-4">
          {/* En-tête ticket */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-3">
            <div>
              Magasin: <span className="font-semibold">{magasinNom}</span>
            </div>
            <div>TPV: 1</div>
            <div>
              Ticket: <span className="font-semibold">{ticketNumber}</span>
            </div>
            <div>
              Date: <span className="font-semibold">{dateStr}</span>
            </div>
            <div>
              Heure: <span className="font-semibold">{heure}</span>
            </div>
            <div>
              Caissier:{" "}
              <span className="font-semibold">{user?.nom || "-"}</span>
            </div>
          </div>

          {/* Recherche / code */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Code article ou ID"
              value={codeArticle}
              onChange={(e) => setCodeArticle(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-40"
            />
            <input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 w-24"
            />
            <button
              onClick={ajouterParCode}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Entrée
            </button>

            {/* Ouvrir tiroir caisse */}
            <button
              onClick={async () => {
                try {
                  const apiSvc = (await import("../services/api")).default;
                  await apiSvc.openDrawer();
                  alert("Tiroir ouvert");
                } catch (e) {
                  alert("Tiroir ouvert");
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md"
            >
              Tiroir
            </button>

            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[200px]"
            />
          </div>

          {/* Montant encaissé / rendu */}
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm text-gray-700">Montant encaissé :</label>
            <input
              type="number"
              min={0}
              value={montantEncaisse}
              onChange={(e) => setMontantEncaisse(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 w-40"
            />
            <span className="text-xl font-bold text-green-600">
              A RENDRE : {formatTND(montantRendu)}
            </span>
          </div>

          {/* Total */}
          <div className="text-lg font-semibold mb-2">
            Total : {formatTND(total)}
          </div>

          {/* Tableau panier */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Désignation
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Remise
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {panier.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-center" colSpan={7}>
                      Aucun article
                    </td>
                  </tr>
                ) : (
                  panier.map((prod, i) => (
                    <tr key={`${prod.id}-${i}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{prod.code || prod.id}</td>
                      <td className="px-3 py-2">{prod.nom}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2 py-1 bg-gray-200 rounded"
                            onClick={() =>
                              changerQuantiteLigne(i, (prod.quantite || 1) - 1)
                            }
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={prod.quantite}
                            onChange={(e) =>
                              changerQuantiteLigne(i, e.target.value)
                            }
                            className="w-20 border border-gray-300 rounded px-2 py-1"
                          />
                          <button
                            className="px-2 py-1 bg-gray-200 rounded"
                            onClick={() =>
                              changerQuantiteLigne(i, (prod.quantite || 1) + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">{formatTND(prod.prix)}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={prod.remise || 0}
                          onChange={(e) => changerRemise(i, e.target.value)}
                          className="w-24 border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {formatTND(
                          prod.prix * prod.quantite - (prod.remise || 0)
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => retirerDuPanier(i)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
              onClick={imprimerTicket}
              disabled={panier.length === 0}
            >
              Imprimer Ticket
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md disabled:bg-gray-100"
              onClick={() => {
                // Mise en attente simple : stocker dans localStorage
                localStorage.setItem(
                  "pos_hold",
                  JSON.stringify({ panier, montantEncaisse })
                );
                alert("Commande mise en attente");
              }}
              disabled={panier.length === 0}
            >
              Mettre en attente
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
              onClick={() => {
                const saved = localStorage.getItem("pos_hold");
                if (!saved) return alert("Aucune commande en attente");
                try {
                  const { panier: p, montantEncaisse: m } = JSON.parse(saved);
                  if (Array.isArray(p)) setPanier(p);
                  if (typeof m === "number") setMontantEncaisse(m);
                  alert("Commande reprise");
                } catch (e) {
                  alert("Erreur lors de la reprise");
                }
              }}
            >
              Reprendre
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
              onClick={payer}
              disabled={panier.length === 0}
            >
              Encaisser
            </button>
          </div>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="bg-white shadow rounded-lg p-4 flex flex-col">
          <div className="text-center mb-6">
            <div className="text-2xl text-blue-600 font-bold">{dateStr}</div>
            <div className="text-2xl text-blue-600 font-bold">{heure}</div>
          </div>

          {/* Catégories */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`px-3 py-2 rounded text-center font-medium text-white transition-all ${
                  !filtreCategorie
                    ? "bg-gradient-to-b from-blue-400 to-blue-600 shadow-md"
                    : "bg-gradient-to-b from-blue-300 to-blue-500 hover:from-blue-400 hover:to-blue-600"
                }`}
                onClick={() => setFiltreCategorie("")}
              >
                Toutes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-3 py-2 rounded text-center font-medium text-white transition-all ${
                    filtreCategorie === cat
                      ? "bg-gradient-to-b from-blue-400 to-blue-600 shadow-md"
                      : "bg-gradient-to-b from-blue-300 to-blue-500 hover:from-blue-400 hover:to-blue-600"
                  }`}
                  onClick={() => setFiltreCategorie(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Produits */}
          <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1">
            {loading ? (
              <span className="col-span-2 text-center text-gray-600">
                Chargement...
              </span>
            ) : error ? (
              <span className="col-span-2 text-center text-red-600">
                {error}
              </span>
            ) : (
              produitsFiltres.map((prod, index) => {
                // Alternate colors for products: blue gradient, green, pink, blue gradient, etc.
                const colorClass = (() => {
                  const colorIndex = index % 4;
                  switch (colorIndex) {
                    case 0:
                      return "bg-gradient-to-b from-blue-300 to-blue-500 hover:from-blue-400 hover:to-blue-600 text-white";
                    case 1:
                      return "bg-lime-500 hover:bg-lime-600 text-white";
                    case 2:
                      return "bg-pink-500 hover:bg-pink-600 text-white";
                    case 3:
                      return "bg-gradient-to-b from-blue-300 to-blue-500 hover:from-blue-400 hover:to-blue-600 text-white";
                    default:
                      return "bg-gradient-to-b from-blue-300 to-blue-500 hover:from-blue-400 hover:to-blue-600 text-white";
                  }
                })();

                return (
                  <button
                    key={prod.id}
                    className={`${colorClass} px-3 py-2 rounded text-center transition-all shadow-sm hover:shadow-md`}
                    onClick={() => ajouterAuPanier(prod)}
                  >
                    <div className="font-medium truncate text-sm">
                      {prod.nom}
                    </div>
                    <div className="text-xs opacity-90 mt-1">
                      {formatTND(prod.prix)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
