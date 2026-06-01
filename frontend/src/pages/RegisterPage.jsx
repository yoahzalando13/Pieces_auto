import { useState, useContext } from "react";
import authService from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        motDePasse: ""
    });
    const [confirmMotDePasse, setConfirmMotDePasse] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { setUser } = useContext(AuthContext) || {};
    const navigate = useNavigate();

    // Step 1 Validation (nom & prenom)
    const handleNextStep1 = (e) => {
        e.preventDefault();
        setError("");
        if (!form.prenom.trim()) {
            setError("Veuillez saisir votre prénom.");
            return;
        }
        if (!form.nom.trim()) {
            setError("Veuillez saisir votre nom.");
            return;
        }
        setStep(2);
    };

    // Step 2 Validation (telephone & email)
    const handleNextStep2 = (e) => {
        e.preventDefault();
        setError("");
        if (!form.telephone.trim()) {
            setError("Veuillez saisir votre numéro de téléphone.");
            return;
        }
        
        // Clean phone number check
        const cleanPhone = form.telephone.replace(/[^\d+]/g, "");
        if (cleanPhone.length < 8) {
            setError("Numéro de téléphone invalide (min. 8 caractères).");
            return;
        }

        if (!form.email.trim()) {
            setError("Veuillez saisir votre adresse e-mail.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(form.email)) {
            setError("Adresse e-mail invalide.");
            return;
        }
        setStep(3);
    };

    // Form Submission (Step 3)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.motDePasse) {
            setError("Veuillez saisir un mot de passe.");
            return;
        }
        if (form.motDePasse.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        if (form.motDePasse !== confirmMotDePasse) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.register(form);
            console.log("Inscription réussie :", response);
            
            // Auto login or redirect to login page with success notification
            if (response && response.token) {
                localStorage.setItem("token", response.token);
                if (setUser) {
                    setUser(response.user || { telephone: form.telephone, email: form.email });
                }
            }
            
            navigate("/");
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || "Une erreur est survenue lors de l'inscription.";
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
                
                {/* Progress bar */}
                <div className="w-full h-[1px] bg-white/[0.04] rounded-full overflow-hidden mb-6 relative">
                    <div 
                        className="h-full progress-shimmer-glow transition-all duration-300 ease-out" 
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Header (Logo + Title) */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 mb-5 text-[#f7f8f8]">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-[#f7f8f8] tracking-editorial font-sans">
                        Créer un compte
                    </h2>
                    <p className="text-[13px] text-linear-text-muted mt-2">
                        {step === 1 && "Commençons par votre identité"}
                        {step === 2 && "Renseignez vos coordonnées"}
                        {step === 3 && "Sécurisez l'accès à votre compte"}
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
                <div className="relative overflow-hidden w-full min-h-[220px]">
                    
                    {/* Etape 1: Nom / Prénom */}
                    <form 
                        onSubmit={handleNextStep1}
                        className={`transition-all duration-300 ease-out flex flex-col gap-4 ${
                            step === 1 
                                ? "opacity-100 translate-x-0" 
                                : "opacity-0 -translate-x-12 pointer-events-none absolute inset-0 w-full"
                        }`}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    placeholder="Jean"
                                    value={form.prenom}
                                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                                    disabled={isLoading}
                                    autoFocus={step === 1}
                                    className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    placeholder="Dupont"
                                    value={form.nom}
                                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                                    disabled={isLoading}
                                    className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                        >
                            <span>Continuer</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </form>

                    {/* Etape 2: Téléphone / Email */}
                    <form 
                        onSubmit={handleNextStep2}
                        className={`transition-all duration-300 ease-out flex flex-col gap-4 ${
                            step === 2 
                                ? "opacity-100 translate-x-0" 
                                : "opacity-0 " + (step < 2 ? "translate-x-12 pointer-events-none absolute inset-0 w-full" : "-translate-x-12 pointer-events-none absolute inset-0 w-full")
                        }`}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                    Téléphone
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-sm text-[#52525b] font-medium border-r border-white/10 pr-2">
                                        MG
                                    </span>
                                    <input
                                        type="tel"
                                        placeholder="034 12 345 67"
                                        value={form.telephone}
                                        onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                        disabled={isLoading}
                                        autoFocus={step === 2}
                                        className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 pl-14 pr-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                    Adresse E-mail
                                </label>
                                <input
                                    type="email"
                                    placeholder="jean.dupont@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    disabled={isLoading}
                                    className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-1/3 bg-[#121214] hover:bg-[#1a1a1d] border border-white/[0.06] text-white text-xs font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer text-center"
                            >
                                Retour
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)]"
                            >
                                <span>Continuer</span>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Etape 3: Mot de passe */}
                    <form 
                        onSubmit={handleSubmit}
                        className={`transition-all duration-300 ease-out flex flex-col gap-4 ${
                            step === 3 
                                ? "opacity-100 translate-x-0" 
                                : "opacity-0 translate-x-12 pointer-events-none absolute inset-0 w-full"
                        }`}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.motDePasse}
                                        onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                                        disabled={isLoading}
                                        autoFocus={step === 3}
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

                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmMotDePasse}
                                    onChange={(e) => setConfirmMotDePasse(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-[#52525b] focus:outline-none focus:border-white/20 focus:ring-0 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-1/3 bg-[#121214] hover:bg-[#1a1a1d] border border-white/[0.06] text-white text-xs font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer text-center"
                            >
                                Retour
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-[13px] font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-4.5 w-4.5 text-black" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <span>S'inscrire</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Login Link */}
                <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                    <p className="text-xs text-linear-text-muted">
                        Déjà inscrit ?{" "}
                        <Link to="/login" className="text-white hover:text-white/80 font-medium transition-colors hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}