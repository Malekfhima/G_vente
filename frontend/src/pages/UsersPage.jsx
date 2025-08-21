import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const UsersPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const api = (await import("../services/api")).default;
        const data = await api.request("/users");
        setUsers(data.users || []);
      } catch (e) {
        setError(e.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (!isAdmin) {
    return <div className="p-6">Accès réservé aux administrateurs.</div>;
  }

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Utilisateurs</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Rôle
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Ventes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 text-sm">{u.id}</td>
                <td className="px-4 py-2 text-sm">{u.nom}</td>
                <td className="px-4 py-2 text-sm">{u.email}</td>
                <td className="px-4 py-2 text-sm capitalize">{u.role}</td>
                <td className="px-4 py-2 text-sm text-right">
                  {u._count?.ventes ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
