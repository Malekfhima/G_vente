import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: "", description: "" });

  const apiImport = () => import("../services/api").then((m) => m.default);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const api = await apiImport();
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (e) {
      setError(e.message || "Erreur");
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: e.message || "Erreur",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const api = await apiImport();
      if (editing) {
        await api.updateCategorie(editing.id, form);
      } else {
        await api.createCategorie(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nom: "", description: "" });
      await load();
    } catch (e) {
      setError(e.message || "Erreur");
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: e.message || "Erreur",
      });
    }
  };

  const onDelete = async (id) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Supprimer cette catégorie ?",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });
    if (!res.isConfirmed) return;
    try {
      const api = await apiImport();
      await api.deleteCategorie(id);
      await load();
      Swal.fire({
        icon: "success",
        title: "Supprimé",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e) {
      setError(e.message || "Erreur");
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: e.message || "Erreur",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 pt-24">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Catégories</h1>
          <button
            onClick={() => {
              setEditing(null);
              setForm({ nom: "", description: "" });
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nouvelle
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>
        )}

        {showForm && (
          <div className="bg-white rounded shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">
              {editing ? "Modifier" : "Créer"} une catégorie
            </h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editing ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded shadow">
          {loading ? (
            <div className="p-6">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-3 text-sm font-medium">{c.nom}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {c.description || "-"}
                      </td>
                      <td className="px-6 py-3 text-sm text-right">
                        <button
                          onClick={() => {
                            setEditing(c);
                            setForm({
                              nom: c.nom,
                              description: c.description || "",
                            });
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td
                        className="px-6 py-5 text-sm text-gray-600"
                        colSpan="3"
                      >
                        Aucune catégorie
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
