import React, { useState, useEffect, useRef } from 'react';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const BarcodeScanner = ({ onProductFound, existingProducts = [] }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Simuler une base de données de codes-barres
  const barcodeDatabase = {
    '1234567890123': { nom: 'Smartphone Samsung Galaxy', prix: 999.99, categorie: 'Électronique' },
    '2345678901234': { nom: 'Laptop HP Pavilion', prix: 1999.99, categorie: 'Informatique' },
    '3456789012345': { nom: 'T-shirt en coton', prix: 65.99, categorie: 'Vêtements' },
    '4567890123456': { nom: 'Jeans slim fit', prix: 165.99, categorie: 'Vêtements' },
    '5678901234567': { nom: 'Livre "Le Petit Prince"', prix: 42.99, categorie: 'Livres' },
    '6789012345678': { nom: 'Canapé 3 places', prix: 2999.99, categorie: 'Meubles' },
    '7890123456789': { nom: 'Ballon de football', prix: 82.99, categorie: 'Sport' },
    '8901234567890': { nom: 'Café en grains', prix: 29.99, categorie: 'Alimentation' },
    '9012345678901': { nom: 'Pile AA 4 unités', prix: 13.99, categorie: 'Électronique' },
    '0123456789012': { nom: 'Stylo à bille', prix: 6.99, categorie: 'Fournitures' },
  };

  useEffect(() => {
    if (barcode.length >= 3) {
      const filtered = Object.entries(barcodeDatabase)
        .filter(([code, product]) => 
          code.includes(barcode) || 
          product.nom.toLowerCase().includes(barcode.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [barcode]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcode.length < 3) return;

    // Vérifier si le code-barres existe dans la base
    const productData = barcodeDatabase[barcode];
    
    if (productData) {
      // Vérifier si le produit existe déjà
      const existingProduct = existingProducts.find(p => p.nom === productData.nom);
      
      if (existingProduct) {
        // Produit existant - proposer de modifier le stock
        onProductFound({
          ...productData,
          id: existingProduct.id,
          stock: existingProduct.stock + 1,
          isExisting: true
        });
      } else {
        // Nouveau produit
        onProductFound({
          ...productData,
          stock: 1,
          isExisting: false
        });
      }
      
      setBarcode('');
      setShowSuggestions(false);
    } else {
      // Code-barres non trouvé - proposer de créer un nouveau produit
      onProductFound({
        nom: `Produit ${barcode}`,
        description: `Produit avec code-barres ${barcode}`,
        prix: 0,
        stock: 1,
        categorie: '',
        barcode: barcode,
        isNew: true
      });
      
      setBarcode('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (code, productData) => {
    setBarcode(code);
    setShowSuggestions(false);
    
    const existingProduct = existingProducts.find(p => p.nom === productData.nom);
    
    if (existingProduct) {
      onProductFound({
        ...productData,
        id: existingProduct.id,
        stock: existingProduct.stock + 1,
        isExisting: true
      });
    } else {
      onProductFound({
        ...productData,
        stock: 1,
        isExisting: false
      });
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setBarcode('');
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
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Scanner</span>
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
                disabled={barcode.length < 3}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                Ajouter
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
                        <div className="font-medium text-gray-900">{product.nom}</div>
                                                 <div className="text-sm text-gray-500">
                           {product.categorie} • {product.prix.toFixed(2)} TND
                         </div>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{code}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="text-sm text-gray-600">
            <p>💡 <strong>Instructions :</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Saisissez le code-barres complet ou commencez à taper le nom du produit</li>
              <li>Les suggestions apparaîtront automatiquement</li>
              <li>Si le produit existe déjà, le stock sera incrémenté</li>
              <li>Si le code n&apos;existe pas, un nouveau produit sera créé</li>
            </ul>
          </div>

          {/* Codes-barres de test */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Codes-barres de test :</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {Object.keys(barcodeDatabase).slice(0, 8).map(code => (
                <button
                  key={code}
                  onClick={() => setBarcode(code)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 font-mono"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isScanning && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
          </svg>
          <p className="text-gray-500">Cliquez sur &quot;Scanner&quot; pour commencer à saisir des codes-barres</p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
