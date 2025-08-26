import React, { useState, useEffect, useRef } from "react";
import apiService from "../services/api";

const BarcodeScanner = ({ onProductFound }) => {
  const [barcode, setBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (barcode.length >= 3) {
        setLoading(true);
        try {
          // Rechercher par code-barre d'abord
          if (barcode.length === 13 && /^\d{13}$/.test(barcode)) {
            const response = await apiService.get(
              `/produits/barcode/${barcode}`
            );
            if (response.data) {
              setSuggestions([[barcode, response.data]]);
              setShowSuggestions(true);
              setLoading(false);
              return;
            }
          }

          // Rechercher par nom ou description
          const response = await apiService.get(
            `/produits/search?q=${barcode}`
          );
          const filtered = response.data
            .filter(
              (product) =>
                product.nom.toLowerCase().includes(barcode.toLowerCase()) ||
                (product.description &&
                  product.description
                    .toLowerCase()
                    .includes(barcode.toLowerCase()))
            )
            .slice(0, 5)
            .map((product) => [product.codeBarre || "", product]);

          setSuggestions(filtered);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Erreur lors de la recherche:", error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [barcode]);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (barcode.length < 3) return;

    setLoading(true);
    try {
      // Rechercher le produit par code-barre
      if (barcode.length === 13 && /^\d{13}$/.test(barcode)) {
        const response = await apiService.get(`/produits/barcode/${barcode}`);
        if (response.data) {
          onProductFound({
            ...response.data,
            isExisting: true,
          });
          setBarcode("");
          setShowSuggestions(false);
          return;
        }
      }

      // Si pas trouvé par code-barre, proposer de créer un nouveau produit
      onProductFound({
        nom: `Produit ${barcode}`,
        description: `Produit avec code-barres ${barcode}`,
        prix: 0,
        stock: 1,
        categorie: "",
        codeBarre: barcode,
        isNew: true,
      });

      setBarcode("");
      setShowSuggestions(false);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      // Proposer de créer un nouveau produit
      onProductFound({
        nom: `Produit ${barcode}`,
        description: `Produit avec code-barres ${barcode}`,
        prix: 0,
        stock: 1,
        categorie: "",
        codeBarre: barcode,
        isNew: true,
      });
      setBarcode("");
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (code, productData) => {
    setBarcode(code);
    setShowSuggestions(false);

    onProductFound({
      ...productData,
      isExisting: true,
    });
  };

  const startScanning = () => {
    setIsScanning(true);
    setBarcode("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Scanner de Code-barres
        </h3>
        <div className="flex space-x-2">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Scanner</span>
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Arrêter</span>
            </button>
          )}
        </div>
      </div>

      {isScanning && (
        <div className="space-y-4">
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Saisir le code-barres ou rechercher un produit..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={barcode.length < 3 || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                {loading ? "Recherche..." : "Ajouter"}
              </button>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {suggestions.map(([code, product]) => (
                  <button
                    key={code}
                    onClick={() => handleSuggestionClick(code, product)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.categorie} • {product.prix.toFixed(2)} TND
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {code}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="text-sm text-gray-600">
            <p>
              💡 <strong>Instructions :</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                Saisissez le code-barres complet ou commencez à taper le nom du
                produit
              </li>
              <li>Les suggestions apparaîtront automatiquement</li>
              <li>Si le produit existe déjà, le stock sera incrémenté</li>
              <li>
                Si le code n&apos;existe pas, un nouveau produit sera créé
              </li>
            </ul>
          </div>

          {/* Instructions pour les codes-barres */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Instructions :
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                • Saisissez un code-barre EAN-13 (13 chiffres) pour rechercher
                un produit
              </p>
              <p>• Ou tapez le nom d&apos;un produit pour le rechercher</p>
              <p>
                • Si le produit n&apos;existe pas, il sera créé automatiquement
              </p>
            </div>
          </div>
        </div>
      )}

      {!isScanning && (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
            />
          </svg>
          <p className="text-gray-500">
            Cliquez sur &quot;Scanner&quot; pour commencer à saisir des
            codes-barres
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
