const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variables globales
let adminToken = "";
let testUserId = null;

// Fonction pour afficher les résultats
const log = (message, data = null) => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(message);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log(`${"=".repeat(50)}`);
};

// Test 1: Connexion admin
const testAdminLogin = async () => {
  try {
    log("🧪 Test 1: Connexion administrateur");

    const response = await api.post("/auth/login", {
      email: "admin@example.com",
      password: "password123",
    });

    adminToken = response.data.token;
    api.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;

    log("✅ Connexion admin réussie", {
      user: response.data.user,
      token: adminToken.substring(0, 20) + "...",
    });

    return true;
  } catch (error) {
    log("❌ Erreur connexion admin", error.response?.data || error.message);
    return false;
  }
};

// Test 2: Récupérer tous les utilisateurs
const testGetAllUsers = async () => {
  try {
    log("🧪 Test 2: Récupérer tous les utilisateurs");

    const response = await api.get("/users");

    log("✅ Liste des utilisateurs récupérée", {
      count: response.data.users.length,
      users: response.data.users.map((u) => ({
        id: u.id,
        nom: u.nom,
        email: u.email,
        role: u.role,
      })),
    });

    return response.data.users;
  } catch (error) {
    log(
      "❌ Erreur récupération utilisateurs",
      error.response?.data || error.message
    );
    return [];
  }
};

// Test 3: Créer un nouvel utilisateur
const testCreateUser = async () => {
  try {
    log("🧪 Test 3: Créer un nouvel utilisateur");

    const newUser = {
      email: "test@example.com",
      password: "password123",
      nom: "Utilisateur Test",
      role: "user",
    };

    const response = await api.post("/users", newUser);

    testUserId = response.data.user.id;

    log("✅ Utilisateur créé avec succès", {
      user: response.data.user,
      message: response.data.message,
    });

    return response.data.user;
  } catch (error) {
    log(
      "❌ Erreur création utilisateur",
      error.response?.data || error.message
    );
    return null;
  }
};

// Test 4: Récupérer un utilisateur par ID
const testGetUserById = async () => {
  if (!testUserId) {
    log("⚠️ Test 4 ignoré: Aucun utilisateur de test créé");
    return null;
  }

  try {
    log("🧪 Test 4: Récupérer un utilisateur par ID");

    const response = await api.get(`/users/${testUserId}`);

    log("✅ Utilisateur récupéré par ID", {
      user: response.data.user,
    });

    return response.data.user;
  } catch (error) {
    log(
      "❌ Erreur récupération utilisateur par ID",
      error.response?.data || error.message
    );
    return null;
  }
};

// Test 5: Modifier un utilisateur
const testUpdateUser = async () => {
  if (!testUserId) {
    log("⚠️ Test 5 ignoré: Aucun utilisateur de test créé");
    return null;
  }

  try {
    log("🧪 Test 5: Modifier un utilisateur");

    const updateData = {
      nom: "Utilisateur Test Modifié",
      role: "admin",
    };

    const response = await api.put(`/users/${testUserId}`, updateData);

    log("✅ Utilisateur modifié avec succès", {
      user: response.data.user,
      message: response.data.message,
    });

    return response.data.user;
  } catch (error) {
    log(
      "❌ Erreur modification utilisateur",
      error.response?.data || error.message
    );
    return null;
  }
};

// Test 6: Récupérer les statistiques des utilisateurs
const testGetUserStats = async () => {
  try {
    log("🧪 Test 6: Récupérer les statistiques des utilisateurs");

    const response = await api.get("/users/stats");

    log("✅ Statistiques récupérées", {
      stats: response.data.stats,
    });

    return response.data.stats;
  } catch (error) {
    log(
      "❌ Erreur récupération statistiques",
      error.response?.data || error.message
    );
    return null;
  }
};

// Test 7: Supprimer un utilisateur
const testDeleteUser = async () => {
  if (!testUserId) {
    log("⚠️ Test 7 ignoré: Aucun utilisateur de test créé");
    return false;
  }

  try {
    log("🧪 Test 7: Supprimer un utilisateur");

    const response = await api.delete(`/users/${testUserId}`);

    log("✅ Utilisateur supprimé avec succès", {
      message: response.data.message,
    });

    testUserId = null;
    return true;
  } catch (error) {
    log(
      "❌ Erreur suppression utilisateur",
      error.response?.data || error.message
    );
    return false;
  }
};

// Test 8: Test d'accès non autorisé (utilisateur non admin)
const testUnauthorizedAccess = async () => {
  try {
    log("🧪 Test 8: Test d'accès non autorisé");

    // Créer un token d'utilisateur normal
    const userResponse = await api.post("/auth/register", {
      email: "user@example.com",
      password: "password123",
      nom: "Utilisateur Normal",
      role: "user",
    });

    const userToken = userResponse.data.token;
    const userApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    // Essayer d'accéder à l'API des utilisateurs
    try {
      await userApi.get("/users");
      log("❌ Erreur: L'accès non autorisé a réussi (devrait échouer)");
    } catch (error) {
      if (error.response?.status === 403) {
        log("✅ Accès correctement refusé pour utilisateur non admin", {
          status: error.response.status,
          message: error.response.data.message,
        });
      } else {
        log(
          "❌ Erreur inattendue lors du test d'accès non autorisé",
          error.response?.data || error.message
        );
      }
    }

    return true;
  } catch (error) {
    log(
      "❌ Erreur lors du test d'accès non autorisé",
      error.response?.data || error.message
    );
    return false;
  }
};

// Fonction principale de test
const runTests = async () => {
  console.log("🚀 Démarrage des tests de l'API de gestion des utilisateurs\n");

  const tests = [
    { name: "Connexion admin", fn: testAdminLogin },
    { name: "Récupérer tous les utilisateurs", fn: testGetAllUsers },
    { name: "Créer un utilisateur", fn: testCreateUser },
    { name: "Récupérer utilisateur par ID", fn: testGetUserById },
    { name: "Modifier un utilisateur", fn: testUpdateUser },
    { name: "Récupérer les statistiques", fn: testGetUserStats },
    { name: "Supprimer un utilisateur", fn: testDeleteUser },
    { name: "Test d'accès non autorisé", fn: testUnauthorizedAccess },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result !== false) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ Erreur lors du test "${test.name}":`, error.message);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `📊 Résumé des tests: ${passedTests}/${totalTests} tests réussis`
  );
  console.log(`${"=".repeat(60)}`);

  if (passedTests === totalTests) {
    console.log("🎉 Tous les tests sont passés avec succès !");
  } else {
    console.log("⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.");
  }
};

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testAdminLogin,
  testGetAllUsers,
  testCreateUser,
  testGetUserById,
  testUpdateUser,
  testGetUserStats,
  testDeleteUser,
  testUnauthorizedAccess,
};
