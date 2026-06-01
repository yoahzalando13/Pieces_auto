import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import { createMyShop } from "../services/shopService";

export default function BecomeSellerPage() {
    const { user, setUser, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        boutiqueName: "",
        slogan: "",
        ville: "",
        description: "",
        visibility: "Publique"
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
        if (!loading && user?.role === "VENDEUR") {
            navigate("/seller-space");
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.boutiqueName.trim()) {
            setError("Veuillez indiquer le nom de votre boutique.");
            return;
        }
        if (!form.ville.trim()) {
            setError("Veuillez indiquer la ville de votre boutique.");
            return;
        }

        setIsSubmitting(true);

        try {
            await createMyShop({
                shopName: form.boutiqueName,
                description: form.description,
                phone: user.telephone || "",
                address: form.ville,
                logoUrl: null
            });

            setUser({
                ...user,
                role: "VENDEUR"
            });
            setSuccess(true);
            setTimeout(() => {
                navigate("/seller-space");
            }, 1500);
        } catch (err) {
            console.error(err);
            setError("Impossible de valider votre boutique pour le moment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !user) return null;

    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-black linear-dots linear-top-glow text-linear-text-primary">
                <div className="w-full max-w-[360px] text-center animate-card-enter">
                    <div className="text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-semibold text-[#f7f8f8] mb-2">Boutique créée !</h2>
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
                        onClick={() => navigate("/profile")}
                        className="text-xs text-linear-accent hover:text-linear-accent-hover font-semibold transition-colors mb-4 flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Retour</span>
                    </button>
                    <h2 className="text-2xl font-semibold text-[#f7f8f8] tracking-editorial font-sans">
                        Devenir vendeur
                    </h2>
                    <p className="text-[13px] text-linear-text-muted mt-2">
                        Étape {currentStep} sur 2
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
                    
                    {/* STEP 1: Shop Basics */}
                    <div className={`transition-all duration-300 ease-out flex flex-col gap-4 ${currentStep === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12 pointer-events-none absolute inset-0"}`}>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Nom de la boutique *
                            </label>
                            <input
                                type="text"
                                value={form.boutiqueName}
                                onChange={(e) => setForm({ ...form, boutiqueName: e.target.value })}
                                placeholder="Ex : Pièces Auto Express"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Ville *
                            </label>
                            <input
                                type="text"
                                value={form.ville}
                                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                                placeholder="Ex : Antananarivo"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (form.boutiqueName.trim() && form.ville.trim()) {
                                    setCurrentStep(2);
                                    setError("");
                                } else {
                                    setError("Veuillez remplir tous les champs obligatoires");
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

                    {/* STEP 2: Details */}
                    <div className={`transition-all duration-300 ease-out flex flex-col gap-4 ${currentStep === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none absolute inset-0"}`}>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Slogan <span className="text-[10px] font-normal">optionnel</span>
                            </label>
                            <input
                                type="text"
                                value={form.slogan}
                                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                                placeholder="Ex : Votre référence de confiance"
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Visibilité
                            </label>
                            <select
                                value={form.visibility ?? "Publique"}
                                onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium appearance-none cursor-pointer"
                                disabled={isSubmitting}
                            >
                                <option value="Publique">Publique</option>
                                <option value="Privée">Privée</option>
                                <option value="Brouillon">Brouillon</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Description <span className="text-[10px] font-normal">optionnel</span>
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Parlez de votre boutique et des pièces..."
                                maxLength={300}
                                rows={3}
                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium resize-none"
                                disabled={isSubmitting}
                            />
                            <span className="text-[10px] text-linear-text-muted text-right">{form.description.length}/300</span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                disabled={isSubmitting}
                                className="flex-1 bg-transparent hover:bg-white/5 text-linear-text-primary text-[13px] font-semibold py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                Retour
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)] disabled:opacity-50"
                            >
                                {isSubmitting ? "Validation..." : "Valider"}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
