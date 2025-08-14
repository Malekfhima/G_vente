import React from 'react';

const TicketCaisse = ({ vente, onClose, onPrint }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('ticket-content');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    
    if (onPrint) onPrint();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête du ticket */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Ticket de Caisse</h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Gestion Vente</h3>
            <p className="text-sm text-gray-600">Système de Gestion des Ventes</p>
            <p className="text-xs text-gray-500 mt-1">Tunis, Tunisie</p>
          </div>
        </div>

        {/* Contenu du ticket */}
        <div id="ticket-content" className="p-6">
          {/* Informations de la vente */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Ticket N°:</span>
              <span className="text-sm font-medium">#{vente.id.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-medium">{formatDate(vente.date)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Vendeur:</span>
              <span className="text-sm font-medium">{vente.user?.nom || 'N/A'}</span>
            </div>
          </div>

          {/* Détails du produit */}
          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-2">Produit acheté:</h4>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-900">
                  {vente.produit?.nom || 'Produit supprimé'}
                </div>
                {vente.produit?.categorie && (
                  <div className="text-sm text-gray-600">
                    Catégorie: {vente.produit.categorie}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Quantité:</span>
                <span className="font-medium ml-2">{vente.quantite}</span>
              </div>
              <div>
                <span className="text-gray-600">Prix unitaire:</span>
                <span className="font-medium ml-2">
                  {vente.produit ? formatCurrency(vente.produit.prix) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>TOTAL:</span>
              <span className="text-green-600">{formatCurrency(vente.prixTotal)}</span>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>Merci pour votre achat !</p>
            <p className="mt-1">Pour toute question, contactez-nous</p>
            <p className="mt-1">Tél: +216 XX XXX XXX</p>
            <p className="mt-1">Email: contact@gestion-vente.tn</p>
          </div>

          {/* Code QR ou informations de sécurité */}
          <div className="mt-4 text-center">
            <div className="inline-block bg-gray-100 p-2 rounded">
              <div className="text-xs font-mono text-gray-600">
                {vente.id.toString().padStart(6, '0')}-{new Date(vente.date).getTime().toString().slice(-6)}
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-xs text-gray-500">
            <p>Ce ticket est une preuve d&apos;achat valide</p>
            <p className="mt-1">Conservez-le pour toute réclamation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCaisse;
