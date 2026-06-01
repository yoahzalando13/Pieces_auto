import { useState, useContext } from "react";
import authService from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
    const [step, setStep] = useState(1);
    const [telephone, setTelephone] = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { setUser } = useContext(AuthContext) || {};
    const navigate = useNavigate();

    // Basic validation and step transition
    const handleContinue = (e) => {
        e.preventDefault();
        setError("");
        
        if (!telephone.trim()) {
            setError("Veuillez saisir votre numéro de téléphone.");
            return;
        }

        // Clean phone number (keep digits and +)
        const cleanPhone = telephone.replace(/[^\d+]/g, "");
        if (cleanPhone.length < 8) {
            setError("Numéro de téléphone invalide (min. 8 caractères).");
            return;
        }

        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!motDePasse) {
            setError("Veuillez saisir votre mot de passe.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.login({
                telephone,
                motDePasse
            });

            if (response && response.token) {
                localStorage.setItem("token", response.token);
                if (setUser && response.user) {
                    setUser(response.user);
                } else if (setUser) {
                    // Fallback to decode or set a dummy user
                    setUser({ telephone });
                }
            }
            
            console.log("Connexion réussie :", response);
            navigate("/");
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || "Numéro de téléphone ou mot de passe incorrect.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center bg-black linear-dots linear-top-glow text-linear-text-primary font-sans relative px-4 py-16 select-none overflow-hidden">
            
            {/* Extremely subtle ambient glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-linear-accent/5 rounded-full blur-[100px] pointer-events-none z-0" />

            <div className="w-full max-w-[360px] z-10 relative group animate-card-enter">
                
                {/* Header (Logo + Title) */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 mb-5 text-[#f7f8f8]">
                        {/* Piston/Gear outline icon stylized like a clean logo */}
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-[#f7f8f8] tracking-editorial font-sans">
                        Connexion à Pièces Auto
                    </h2>
                    <p className="text-[13px] text-linear-text-muted mt-2">
                        {step === 1 ? "Entrez votre numéro pour continuer" : "Saisissez votre mot de passe"}
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

                {/* Forms with custom transitions */}
                <div className="relative overflow-hidden w-full min-h-[185px]">
                    
                    {/* Phase 1: Téléphone */}
                    <form 
                        onSubmit={handleContinue}
                        className={`transition-all duration-300 ease-out flex flex-col gap-4 ${
                            step === 1 
                                ? "opacity-100 translate-x-0" 
                                : "opacity-0 -translate-x-12 pointer-events-none absolute inset-0 w-full"
                        }`}
                    >
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Numéro de téléphone
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-sm text-[#52525b] font-medium border-r border-white/10 pr-2">
                                    MG
                                </span>
                                <input
                                    type="tel"
                                    placeholder="034 12 345 67"
                                    value={telephone}
                                    onChange={(e) => setTelephone(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus
                                    className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 pl-14 pr-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)] disabled:opacity-50"
                        >
                            <span>Continuer</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </form>

                    {/* Phase 2: Mot de passe */}
                    <form 
                        onSubmit={handleSubmit}
                        className={`transition-all duration-300 ease-out flex flex-col gap-4 ${
                            step === 2 
                                ? "opacity-100 translate-x-0" 
                                : "opacity-0 translate-x-12 pointer-events-none absolute inset-0 w-full"
                        }`}
                    >
                        {/* Display & Edit previous input */}
                        <div className="bg-[#121214] border border-white/[0.06] rounded-lg p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-linear-text-muted uppercase tracking-wider font-semibold">Téléphone</span>
                                <span className="text-sm font-medium text-linear-text-primary">{telephone}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-xs text-linear-accent hover:text-linear-accent-hover font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <span>Modifier</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                    Mot de passe
                                </label>
                                <a href="#forgot" className="text-[11px] font-medium text-linear-accent hover:text-linear-accent-hover transition-colors">
                                    Mot de passe oublié ?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={motDePasse}
                                    onChange={(e) => setMotDePasse(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus={step === 2}
                                    className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 pl-3.5 pr-10 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-linear-text-muted hover:text-linear-text-primary transition-colors cursor-pointer"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-4.5 w-4.5 text-black" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <span>Se connecter</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Register Link */}
                <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                    <p className="text-xs text-linear-text-muted">
                        Nouveau sur Pièces Auto ?{" "}
                        <Link to="/register" className="text-white hover:text-white/80 font-medium transition-colors hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}