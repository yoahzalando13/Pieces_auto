import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import { createSellerProduct, uploadProductImage, getCategories } from "../services/productService";

export default function CreateProductPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        reference: "PRD-" + Math.floor(1000 + Math.random() * 9000),
        brandName: "",
        normalPrice: "",
        groupPrice: "",
        stock: "",
        description: "",
        categoryId: "",
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Load categories
    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
        if (!loading && user?.role !== "VENDEUR") {
            navigate("/become-seller");
        }

        const loadCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                if (data.length > 0 && !formData.categoryId) {
                    setFormData(prev => ({ ...prev, categoryId: data[0].id }));
                }
            } catch (err) {
                console.error("Erreur chargement catégories:", err);
            }
        };

        loadCategories();
    }, [user, loading, navigate]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Veuillez sélectionner une image valide");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("L'image doit faire moins de 5MB");
            return;
        }

        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        setError("");
    };

    // Remove image
    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    // Validate form
    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Le nom du produit est requis");
            return false;
        }
        if (!formData.reference.trim()) {
            setError("La référence est requise");
            return false;
        }
        if (!formData.brandName.trim()) {
            setError("La marque est requise");
            return false;
        }
        if (!formData.categoryId) {
            setError("Veuillez sélectionner une catégorie");
            return false;
        }
        if (!formData.normalPrice || parseFloat(formData.normalPrice) <= 0) {
            setError("Le prix normal est requis et doit être positif");
            return false;
        }
        if (!formData.stock || parseInt(formData.stock) < 0) {
            setError("Le stock est requis et doit être positif");
            return false;
        }
        if (formData.groupPrice && parseFloat(formData.groupPrice) > parseFloat(formData.normalPrice)) {
            setError("Le prix groupé ne peut pas dépasser le prix normal");
            return false;
        }
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Create product
            const payload = {
                name: formData.name.trim(),
                reference: formData.reference.trim(),
                brandName: formData.brandName.trim(),
                normalPrice: parseFloat(formData.normalPrice),
                groupPrice: formData.groupPrice ? parseFloat(formData.groupPrice) : undefined,
                stock: parseInt(formData.stock),
                description: formData.description.trim() || undefined,
            };

            const createdProduct = await createSellerProduct(formData.categoryId, payload);

            // Upload image if selected
            if (image) {
                try {
                    await uploadProductImage(createdProduct.id, image);
                } catch (imgErr) {
                    console.error("Erreur lors de l'upload de l'image:", imgErr);
                }
            }

            setSuccess(true);
            setTimeout(() => {
                navigate("/seller-space");
            }, 2000);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Erreur lors de la création du produit");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-black linear-dots linear-top-glow text-linear-text-primary">
                <div className="w-10 h-10 border-3 border-white/10 border-t-linear-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-black linear-dots linear-top-glow text-linear-text-primary">
                <div className="w-full max-w-[360px] text-center animate-card-enter">
                    <div className="text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-semibold text-[#f7f8f8] mb-2">Produit créé !</h2>
                    <p className="text-linear-text-muted text-sm">Redirection vers votre espace vendeur...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black linear-dots linear-top-glow text-linear-text-primary font-sans relative px-4 py-12 select-none overflow-hidden">
            
            {/* Subtle ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-linear-accent/5 rounded-full blur-[100px] pointer-events-none z-0" />

            <div className="w-full max-w-[480px] z-10 relative group animate-card-enter">
                
                {/* Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <button
                        type="button"
                        onClick={() => navigate("/seller-space")}
                        className="text-xs text-linear-accent hover:text-linear-accent-hover font-semibold transition-colors mb-4 flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Retour</span>
                    </button>
                    <h2 className="text-2xl font-semibold text-[#f7f8f8] tracking-editorial font-sans">
                        Créer un produit
                    </h2>
                    <p className="text-[13px] text-linear-text-muted mt-2">
                        Étape {currentStep} sur 3
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2.5 animate-fadeIn">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    {/* STEP 1: Basic Info */}
                    <div className={`transition-all duration-300 ease-out flex flex-col gap-4 ${currentStep === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12 pointer-events-none absolute inset-0"}`}>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Nom du produit *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ex: Disque de frein avant"
                                maxLength={150}
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                            <span className="text-[10px] text-linear-text-muted text-right">{formData.name.length}/150</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Marque *
                            </label>
                            <input
                                type="text"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                                placeholder="Ex: Bosch, TRW"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Référence *
                            </label>
                            <input
                                type="text"
                                name="reference"
                                value={formData.reference}
                                onChange={handleChange}
                                placeholder="Ex: REF-001"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (formData.name.trim() && formData.brandName.trim() && formData.reference.trim()) {
                                    setCurrentStep(2);
                                    setError("");
                                } else {
                                    setError("Complétez tous les champs obligatoires");
                                }
                            }}
                            disabled={isSubmitting}
                            className="w-full bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)] disabled:opacity-50 mt-2"
                        >
                            <span>Continuer</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* STEP 2: Category & Pricing */}
                    <div className={`transition-all duration-300 ease-out flex flex-col gap-4 ${currentStep === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none absolute inset-0"}`}>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Catégorie *
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium appearance-none cursor-pointer"
                                disabled={isSubmitting || categories.length === 0}
                            >
                                <option value="">Sélectionnez une catégorie</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Prix normal (Ar) *
                            </label>
                            <input
                                type="number"
                                name="normalPrice"
                                value={formData.normalPrice}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Prix groupé (Ar) <span className="text-[10px] font-normal">optionnel</span>
                            </label>
                            <input
                                type="number"
                                name="groupPrice"
                                value={formData.groupPrice}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                disabled={isSubmitting}
                                className="flex-1 bg-transparent hover:bg-white/5 text-linear-text-primary text-[13px] font-semibold py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                Retour
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (formData.categoryId && formData.normalPrice) {
                                        setCurrentStep(3);
                                        setError("");
                                    } else {
                                        setError("Complétez tous les champs obligatoires");
                                    }
                                }}
                                disabled={isSubmitting}
                                className="flex-1 bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)] disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                <span>Continuer</span>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* STEP 3: Stock & Image */}
                    <div className={`transition-all duration-300 ease-out flex flex-col gap-4 ${currentStep === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none absolute inset-0"}`}>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Stock *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Description <span className="text-[10px] font-normal">optionnel</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Caractéristiques du produit..."
                                maxLength={500}
                                rows={3}
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium resize-none"
                                disabled={isSubmitting}
                            />
                            <span className="text-[10px] text-linear-text-muted text-right">{formData.description.length}/500</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Image <span className="text-[10px] font-normal">optionnel</span>
                            </label>
                            {imagePreview ? (
                                <div className="relative bg-[#0c0c0e] border border-white/10 rounded-lg overflow-hidden">
                                    <img src={imagePreview} alt="Aperçu" className="w-full h-40 object-contain py-4" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        disabled={isSubmitting}
                                        className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs px-2 py-1 rounded transition-all"
                                    >
                                        ✕ Supprimer
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer">
                                    <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-4 text-center hover:border-white/20 transition-all">
                                        <div className="text-2xl mb-1">📷</div>
                                        <p className="text-xs text-linear-text-muted">Cliquez pour ajouter une image</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                disabled={isSubmitting}
                                className="flex-1 bg-transparent hover:bg-white/5 text-linear-text-primary text-[13px] font-semibold py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                Retour
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.name || !formData.stock}
                                className="flex-1 bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)] disabled:opacity-50"
                            >
                                {isSubmitting ? "Création..." : "Créer le produit"}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
