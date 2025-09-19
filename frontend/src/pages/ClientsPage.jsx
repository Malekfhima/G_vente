import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useClients } from "../hooks/useApi";

const ClientsPage = () => {
  const { isAdmin } = useAuth();
  const {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    clearError,
  } = useClients();
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateClient(editing.id, form);
      setEditing(null);
    } else {
      await createClient(form);
    }
    setForm({ nom: "", email: "", telephone: "", adresse: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Clients</h1>

      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded shadow space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Adresse"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {editing ? "Mettre à jour" : "Ajouter"}
            </button>
            {editing && (
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={() => {
                  setEditing(null);
                  setForm({ nom: "", email: "", telephone: "", adresse: "" });
                }}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nom
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Téléphone
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Adresse
                </th>
                {isAdmin && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 text-sm">{c.nom}</td>
                  <td className="px-4 py-2 text-sm">{c.email || "-"}</td>
                  <td className="px-4 py-2 text-sm">{c.telephone || "-"}</td>
                  <td className="px-4 py-2 text-sm">{c.adresse || "-"}</td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-sm text-right space-x-2">
                      <button
                        className="px-3 py-1 border rounded"
                        onClick={() => {
                          setEditing(c);
                          setForm({
                            nom: c.nom || "",
                            email: c.email || "",
                            telephone: c.telephone || "",
                            adresse: c.adresse || "",
                          });
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => deleteClient(c.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div className="text-red-600">
          {error}{" "}
          <button className="underline" onClick={clearError}>
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
