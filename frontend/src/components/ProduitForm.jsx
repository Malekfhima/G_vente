import React, { useEffect, useState } from "react";
import { PRODUCT_CATEGORIES, VALIDATION } from "../utils/constants";

const ProduitForm = ({ produit, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: produit?.nom || "",
    description: produit?.description || "",
    reference: produit?.reference || "",
    codeBarre: produit?.codeBarre || "",
    prixAchatHT: produit?.prixAchatHT ?? "",
    prixVenteTTC: produit?.prixVenteTTC ?? produit?.prix ?? "",
    tauxTVA: produit?.tauxTVA ?? "",
    stock: produit?.stock ?? "",
    seuilAlerteStock: produit?.seuilAlerteStock ?? "",
    categorie: produit?.categorie || "",
    fournisseurId: produit?.fournisseurId ?? "",
    isService: produit?.isService || false,
  });

  const [fournisseurs, setFournisseurs] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/fournisseurs");
        const data = await res.json();
        setFournisseurs(Array.isArray(data) ? data : []);
      } catch (e) {
        setFournisseurs([]);
      }
    };
    load();
  }, []);

  // Champs de position (rack)
  const initialPos = (() => {
    const desc = produit?.description || "";
    // Format attendu injecté: POS[A:x;C:y;E:z]
    const match = desc.match(/POS\[A:([^;\]]*);C:([^;\]]*);E:([^;\]]*)\]/);
    if (!match) return { aisle: "", column: "", shelf: "" };
    return {
      aisle: match[1] || "",
      column: match[2] || "",
      shelf: match[3] || "",
    };
  })();
  const [rackAisle, setRackAisle] = useState(initialPos.aisle);
  const [rackColumn, setRackColumn] = useState(initialPos.column);
  const [rackShelf, setRackShelf] = useState(initialPos.shelf);

  const [errors, setErrors] = useState({});
  const [showBarcodeOptions, setShowBarcodeOptions] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du produit est requis";
    } else if (formData.nom.length > VALIDATION.MAX_NAME_LENGTH) {
      newErrors.nom = `Le nom ne peut pas dépasser ${VALIDATION.MAX_NAME_LENGTH} caractères`;
    }

    if (
      formData.description &&
      formData.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH
    ) {
      newErrors.description = `La description ne peut pas dépasser ${VALIDATION.MAX_DESCRIPTION_LENGTH} caractères`;
    }

    if (!formData.prixVenteTTC || formData.prixVenteTTC <= 0) {
      newErrors.prixVenteTTC = "Le prix de vente TTC doit être supérieur à 0";
    } else if (formData.prixVenteTTC > VALIDATION.MAX_PRICE) {
      newErrors.prixVenteTTC = `Le prix ne peut pas dépasser ${VALIDATION.MAX_PRICE}`;
    }

    if (formData.stock === "" || formData.stock < 0) {
      newErrors.stock = "Le stock doit être >= 0";
    } else if (formData.stock > VALIDATION.MAX_STOCK) {
      newErrors.stock = `Le stock ne peut pas dépasser ${VALIDATION.MAX_STOCK}`;
    }

    // Validation du code-barre
    if (formData.codeBarre && formData.codeBarre.length !== 13) {
      newErrors.codeBarre =
        "Le code-barre doit contenir exactement 13 chiffres";
    } else if (formData.codeBarre && !/^\d{13}$/.test(formData.codeBarre)) {
      newErrors.codeBarre = "Le code-barre ne doit contenir que des chiffres";
    }

    // Validation TVA
    if (
      formData.tauxTVA !== "" &&
      (parseFloat(formData.tauxTVA) < 0 || parseFloat(formData.tauxTVA) > 100)
    ) {
      newErrors.tauxTVA = "Le taux de TVA doit être entre 0 et 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    // Nettoyer ancienne balise POS si existante
    const cleanedDesc = (formData.description || "").replace(
      /\s*\|?\s*POS\[[^\]]*\]\s*$/,
      ""
    );
    const hasAnyPos = rackAisle || rackColumn || rackShelf;
    const posTag = hasAnyPos
      ? ` | POS[A:${rackAisle};C:${rackColumn};E:${rackShelf}]`
      : "";

    onSubmit({
      ...formData,
      description: `${cleanedDesc}${posTag}`.trim(),
      prixAchatHT:
        formData.prixAchatHT !== ""
          ? parseFloat(formData.prixAchatHT)
          : undefined,
      prixVenteTTC: parseFloat(formData.prixVenteTTC),
      tauxTVA:
        formData.tauxTVA !== "" ? parseFloat(formData.tauxTVA) : undefined,
      stock: formData.isService ? 0 : parseInt(formData.stock),
      seuilAlerteStock:
        formData.seuilAlerteStock !== ""
          ? parseInt(formData.seuilAlerteStock)
          : undefined,
      fournisseurId:
        formData.fournisseurId !== ""
          ? parseInt(formData.fournisseurId)
          : undefined,
      codeBarre: formData.codeBarre || null,
    });
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
    ) : null;
  };

  return (
    <div className="card card-hoverable">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">
          {produit ? "Modifier le produit" : "Ajouter un nouveau produit"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div>
                <label className="inline-flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={formData.isService}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isService: e.target.checked,
                        stock: e.target.checked ? 0 : prev.stock,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Ceci est un service (pas de stock)
                  </span>
                </label>
              </div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom du produit *
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                required
                maxLength={VALIDATION.MAX_NAME_LENGTH}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nom ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Nom du produit"
              />
              {getFieldError("nom")}
            </div>

            <div>
              <label
                htmlFor="categorie"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Catégorie
              </label>
              <select
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence
              </label>
              <input
                name="reference"
                type="text"
                value={formData.reference}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Référence interne"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix d&apos;achat (TND)
              </label>
              <div>
                <input
                  name="prixAchatHT"
                  type="number"
                  step="0.01"
                  min={VALIDATION.MIN_PRICE}
                  max={VALIDATION.MAX_PRICE}
                  value={formData.prixAchatHT}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.prixAchatHT ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {getFieldError("prixAchatHT")}
            </div>

            {!formData.isService && (
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stock *
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min={VALIDATION.MIN_STOCK}
                  max={VALIDATION.MAX_STOCK}
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.stock ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {getFieldError("stock")}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de vente (TND) *
              </label>
              <div>
                <input
                  name="prixVenteTTC"
                  type="number"
                  step="0.01"
                  min={VALIDATION.MIN_PRICE}
                  max={VALIDATION.MAX_PRICE}
                  value={formData.prixVenteTTC}
                  onChange={handleChange}
                  required
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.prixVenteTTC ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>
              {getFieldError("prixVenteTTC")}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de TVA (%)
              </label>
              <input
                name="tauxTVA"
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={formData.tauxTVA}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tauxTVA ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ex: 19"
              />
              {getFieldError("tauxTVA")}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fournisseur
              </label>
              <select
                name="fournisseurId"
                value={formData.fournisseurId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un fournisseur</option>
                {fournisseurs.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>

            {!formData.isService && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seuil d&apos;alerte stock
                </label>
                <input
                  name="seuilAlerteStock"
                  type="number"
                  min={0}
                  value={formData.seuilAlerteStock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 10"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="codeBarre"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code-barre
                </label>
                <button
                  type="button"
                  onClick={() => setShowBarcodeOptions(!showBarcodeOptions)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showBarcodeOptions ? "Masquer" : "Options"}
                </button>
              </div>
              <input
                id="codeBarre"
                name="codeBarre"
                type="text"
                value={formData.codeBarre}
                onChange={handleChange}
                maxLength={13}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.codeBarre ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="13 chiffres (EAN-13)"
              />
              {getFieldError("codeBarre")}

              {showBarcodeOptions && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Options de code-barre :</strong>
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Laissez vide pour génération automatique</li>
                    <li>• Saisissez un code EAN-13 valide (13 chiffres)</li>
                    <li>• Le code sera vérifié pour éviter les doublons</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Position dans le rack */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allée
              </label>
              <input
                type="text"
                value={rackAisle}
                onChange={(e) => setRackAisle(e.target.value)}
                placeholder="Ex: A"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colonne
              </label>
              <input
                type="text"
                value={rackColumn}
                onChange={(e) => setRackColumn(e.target.value)}
                placeholder="Ex: 3"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Étagère
              </label>
              <input
                type="text"
                value={rackShelf}
                onChange={(e) => setRackShelf(e.target.value)}
                placeholder="Ex: 2"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Description du produit (optionnel)"
            />
            {getFieldError("description")}
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/{VALIDATION.MAX_DESCRIPTION_LENGTH}{" "}
              caractères
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {produit ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProduitForm;
