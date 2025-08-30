#!/usr/bin/env node

const http = require("http");

console.log(
  "🧪 Test complet de l'application Gestion Vente (Version améliorée)...\n"
);

// Configuration
const BASE_URL = "http://localhost:5000";
const FRONTEND_URL = "http://localhost:3000";

// Fonction utilitaire pour faire des requêtes HTTP
function makeRequest(path, method = "GET", data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Tests
async function runTests() {
  let passedTests = 0;
  let totalTests = 0;
  let adminToken = null;
  let vendeurToken = null;

  // Test 1: API principale
  console.log("1. Test de l'API principale...");
  totalTests++;
  try {
    const response = await makeRequest("/");
    if (response.status === 200 && response.data.message) {
      console.log("✅ API principale fonctionne");
      passedTests++;
    } else {
      console.log("❌ API principale ne fonctionne pas");
    }
  } catch (error) {
    console.log("❌ Erreur lors du test de l'API principale:", error.message);
  }

  // Test 2: Authentification admin
  console.log("\n2. Test d'authentification admin...");
  totalTests++;
  try {
    const response = await makeRequest("/api/auth/login", "POST", {
      email: "admin@gestion-vente.com",
      password: "admin123",
    });
    if (response.status === 200 && response.data.token) {
      console.log("✅ Authentification admin réussie");
      adminToken = response.data.token;
      passedTests++;
    } else {
      console.log("❌ Authentification admin échouée");
    }
  } catch (error) {
    console.log(
      "❌ Erreur lors du test d'authentification admin:",
      error.message
    );
  }

  // Test 3: Authentification vendeur
  console.log("\n3. Test d'authentification vendeur...");
  totalTests++;
  try {
    const response = await makeRequest("/api/auth/login", "POST", {
      email: "vendeur@gestion-vente.com",
      password: "vendeur123",
    });
    if (response.status === 200 && response.data.token) {
      console.log("✅ Authentification vendeur réussie");
      vendeurToken = response.data.token;
      passedTests++;
    } else {
      console.log("❌ Authentification vendeur échouée");
    }
  } catch (error) {
    console.log(
      "❌ Erreur lors du test d'authentification vendeur:",
      error.message
    );
  }

  // Test 4: Récupération des produits (publique)
  console.log("\n4. Test de récupération des produits...");
  totalTests++;
  try {
    const response = await makeRequest("/api/produits");
    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`✅ ${response.data.length} produits récupérés`);
      passedTests++;
    } else {
      console.log("❌ Erreur lors de la récupération des produits");
    }
  } catch (error) {
    console.log("❌ Erreur lors du test des produits:", error.message);
  }

  // Test 5: Récupération des ventes (avec authentification)
  console.log("\n5. Test de récupération des ventes...");
  totalTests++;
  try {
    const token = adminToken || vendeurToken;
    if (token) {
      const response = await makeRequest("/api/ventes", "GET", null, token);
      if (response.status === 200 && Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} ventes récupérées`);
        passedTests++;
      } else {
        console.log("❌ Erreur lors de la récupération des ventes");
      }
    } else {
      console.log(
        "⚠️ Impossible de tester les ventes sans token d'authentification"
      );
    }
  } catch (error) {
    console.log("❌ Erreur lors du test des ventes:", error.message);
  }

  // Test 6: Récupération des catégories
  console.log("\n6. Test de récupération des catégories...");
  totalTests++;
  try {
    const response = await makeRequest("/api/categories");
    if (response.status === 200 && response.data.categories) {
      console.log(
        `✅ ${response.data.categories.length} catégories récupérées`
      );
      passedTests++;
    } else {
      console.log("❌ Erreur lors de la récupération des catégories");
    }
  } catch (error) {
    console.log("❌ Erreur lors du test des catégories:", error.message);
  }

  // Test 7: Récupération des zones
  console.log("\n7. Test de récupération des zones...");
  totalTests++;
  try {
    const response = await makeRequest("/api/zones");
    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`✅ ${response.data.length} zones récupérées`);
      passedTests++;
    } else {
      console.log("❌ Erreur lors de la récupération des zones");
    }
  } catch (error) {
    console.log("❌ Erreur lors du test des zones:", error.message);
  }

  // Test 8: Récupération des services
  console.log("\n8. Test de récupération des services...");
  totalTests++;
  try {
    const response = await makeRequest("/api/services");
    if (response.status === 200 && response.data.services) {
      console.log(`✅ ${response.data.services.length} services récupérés`);
      passedTests++;
    } else {
      console.log("❌ Erreur lors de la récupération des services");
    }
  } catch (error) {
    console.log("❌ Erreur lors du test des services:", error.message);
  }

  // Test 9: Récupération du profil utilisateur (avec authentification)
  console.log("\n9. Test de récupération du profil utilisateur...");
  totalTests++;
  try {
    const token = adminToken || vendeurToken;
    if (token) {
      const response = await makeRequest(
        "/api/auth/profile",
        "GET",
        null,
        token
      );
      if (response.status === 200 && response.data.user) {
        console.log(
          `✅ Profil utilisateur récupéré: ${response.data.user.nom}`
        );
        passedTests++;
      } else {
        console.log("❌ Erreur lors de la récupération du profil");
      }
    } else {
      console.log(
        "⚠️ Impossible de tester le profil sans token d'authentification"
      );
    }
  } catch (error) {
    console.log("❌ Erreur lors du test du profil:", error.message);
  }

  // Test 10: Test de recherche de produits
  console.log("\n10. Test de recherche de produits...");
  totalTests++;
  try {
    const response = await makeRequest("/api/produits/search?q=impression");
    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(
        `✅ Recherche de produits fonctionne: ${response.data.length} résultats`
      );
      passedTests++;
    } else {
      console.log("❌ Erreur lors de la recherche de produits");
    }
  } catch (error) {
    console.log("❌ Erreur lors du test de recherche:", error.message);
  }

  // Résumé
  console.log("\n" + "=".repeat(60));
  console.log(`📊 Résumé des tests: ${passedTests}/${totalTests} réussis`);
  console.log("=".repeat(60));

  if (passedTests === totalTests) {
    console.log(
      "🎉 Tous les tests sont passés ! L'application fonctionne parfaitement."
    );
  } else if (passedTests >= totalTests * 0.8) {
    console.log(
      "✅ La plupart des tests sont passés ! L'application fonctionne bien."
    );
  } else {
    console.log("⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.");
  }

  console.log("\n🌐 URLs d'accès:");
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend API: ${BASE_URL}`);
  console.log(`Documentation API: ${BASE_URL}/api`);

  console.log("\n👥 Comptes de test:");
  console.log("Admin: admin@gestion-vente.com / admin123");
  console.log("Vendeur: vendeur@gestion-vente.com / vendeur123");

  console.log("\n📋 Fonctionnalités testées:");
  console.log("✅ API principale");
  console.log("✅ Authentification (admin et vendeur)");
  console.log("✅ Gestion des produits");
  console.log("✅ Gestion des ventes (avec authentification)");
  console.log("✅ Gestion des catégories");
  console.log("✅ Gestion des zones");
  console.log("✅ Gestion des services");
  console.log("✅ Profil utilisateur");
  console.log("✅ Recherche de produits");
}

// Exécution des tests
runTests().catch(console.error);
