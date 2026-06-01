import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import * as cartService from "../services/cartService";

export default function CartPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // UI Steps: 1: Cart list, 2: Delivery form, 3: Payment select, 4: Success confirmation
    const [step, setStep] = useState(1);
    
    // Cart Data
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Checkout form state
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState("SIMULATION");
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchCartDetails();
    }, [user]);

    const fetchCartDetails = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await cartService.getCart();
            setCart(data);
        } catch (err) {
            console.error("Error loading cart:", err);
            setError("Impossible de charger votre panier.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, currentQty, delta) => {
        const targetQty = currentQty + delta;
        if (targetQty < 1) return;
        setError("");
        try {
            await cartService.updateCart(productId, targetQty);
            await fetchCartDetails();
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la modification de la quantité.");
        }
    };

    const handleRemoveItem = async (productId) => {
        setError("");
        try {
            await cartService.removeFromCart(productId);
            await fetchCartDetails();
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la suppression de l'article.");
        }
    };

    const handleClearCart = async () => {
        setError("");
        try {
            await cartService.clearCart();
            setCart(null);
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error(err);
            setError("Erreur lors du vidage du panier.");
        }
    };

    const handleDeliverySubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!deliveryAddress.trim() || deliveryAddress.length < 5) {
            setError("L'adresse de livraison doit contenir au moins 5 caractères.");
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(customerPhone)) {
            setError("Le numéro de téléphone doit contenir exactement 10 chiffres (ex: 0341234567).");
            return;
        }

        setIsCheckoutLoading(true);
        try {
            const order = await cartService.checkout({ deliveryAddress, customerPhone });
            setCreatedOrder(order);
            setStep(3);
        } catch (err) {
            console.error("Checkout error:", err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de la validation de la commande.");
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const handlePaymentConfirm = async () => {
        if (!createdOrder) return;
        setIsPaymentLoading(true);
        setError("");
        try {
            await cartService.payOrder(createdOrder.id, paymentMethod);
            window.dispatchEvent(new Event("cart-updated"));
            setStep(4);
        } catch (err) {
            console.error("Payment error:", err);
            setError("Une erreur est survenue pendant le paiement. Veuillez réessayer.");
        } finally {
            setIsPaymentLoading(false);
        }
    };

    // Payment method card component
    const PaymentCard = ({ value, label, description, icon }) => (
        <div
            onClick={() => setPaymentMethod(value)}
            className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === value
                    ? "border-linear-accent bg-linear-accent/5"
                    : "border-linear-border bg-black/20 hover:border-linear-border-focus"
            }`}
        >
            <div className="flex items-center gap-3">
                <span className="text-linear-accent">{icon}</span>
                <div>
                    <h5 className="text-xs font-bold text-white">{label}</h5>
                    <p className="text-[10px] text-linear-text-muted mt-0.5">{description}</p>
                </div>
            </div>
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                paymentMethod === value ? "border-linear-accent" : "border-linear-border"
            }`}>
                {paymentMethod === value && <div className="w-1.5 h-1.5 rounded-full bg-linear-accent" />}
            </div>
        </div>
    );

    if (isLoading && step === 1) {
        return (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-card-enter">
                <div className="h-8 w-44 linear-shimmer rounded mb-4" />
                <div className="flex flex-col gap-4">
                    <div className="linear-shimmer h-24 w-full rounded-xl" />
                    <div className="linear-shimmer h-24 w-full rounded-xl" />
                    <div className="linear-shimmer h-12 w-1/3 rounded self-end mt-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-10">
            {/* Step header with progress bar */}
            <div className="border-b border-linear-border pb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-linear-gradient tracking-editorial">
                        {step === 1 && "Mon Panier"}
                        {step === 2 && "Détails de Livraison"}
                        {step === 3 && "Règlement Sécurisé"}
                        {step === 4 && "Commande Confirmée !"}
                    </h1>
                    <span className="text-[10px] text-linear-text-muted font-mono uppercase tracking-wider">
                        Étape {step} / 4
                    </span>
                </div>
                <div className="w-full h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                        className="h-full progress-shimmer-glow transition-all duration-500 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Steps container */}
            <div className="relative overflow-hidden w-full">

                {/* ── ÉTAPE 1 : Panier ── */}
                <div className={`transition-all duration-300 ease-out flex flex-col gap-6 ${
                    step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12 pointer-events-none absolute inset-0 w-full"
                }`}>
                    {!cart || !cart.items || cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-20 bg-white/[0.01] border border-dashed border-linear-border rounded-2xl p-8">
                            <svg className="w-12 h-12 text-linear-text-muted/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <h3 className="text-base font-semibold text-linear-text-primary">Votre panier est vide</h3>
                            <p className="text-xs text-linear-text-paragraph max-w-sm mt-1">
                                Découvrez nos offres et ajoutez des pièces auto de qualité supérieure à votre panier.
                            </p>
                            <Link
                                to="/products"
                                className="mt-6 bg-linear-accent hover:bg-linear-accent-hover text-white text-xs font-semibold px-5 py-2.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer inline-block"
                            >
                                Voir les pièces auto
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Liste articles */}
                            <div className="flex flex-col divide-y divide-linear-border/40 border border-linear-border/60 rounded-xl bg-white/[0.01] overflow-hidden">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 hover:bg-white/[0.015] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-16 h-16 bg-black/40 border border-linear-border rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                                {item.productImageUrl ? (
                                                    <img
                                                        src={item.productImageUrl}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=200&auto=format&fit=crop"; }}
                                                    />
                                                ) : (
                                                    <svg className="w-6 h-6 text-linear-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                )}
                                            </div>
                                            {/* Infos */}
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-linear-text-primary line-clamp-1">
                                                    {item.productName}
                                                </span>
                                                <span className="text-[11px] text-linear-text-muted">
                                                    Réf: {item.productReference} &bull; {item.productBrandName}
                                                </span>
                                                <span className="text-[11px] text-linear-text-muted mt-0.5">
                                                    Prix unitaire : <span className="text-linear-text-secondary">{Number(item.unitPrice).toLocaleString()} Ar</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 self-end sm:self-auto">
                                            {/* Quantité */}
                                            <div className="flex items-center border border-linear-border rounded-lg bg-black/30 select-none overflow-hidden">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-8 flex items-center justify-center text-linear-text-muted hover:text-white hover:bg-white/[0.05] disabled:opacity-30 transition-all cursor-pointer"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M20 12H4"/></svg>
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-linear-text-muted hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4"/></svg>
                                                </button>
                                            </div>

                                            {/* Sous-total + supprimer */}
                                            <div className="flex items-center gap-4 min-w-[100px] justify-end">
                                                <span className="text-sm font-bold text-white">
                                                    {Number(item.totalPrice).toLocaleString()} Ar
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                    className="p-1.5 text-linear-text-muted hover:text-red-400 transition-colors cursor-pointer rounded"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Récapitulatif + bouton suivant */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-2 pt-6 border-t border-linear-border/30">
                                <button
                                    onClick={handleClearCart}
                                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors uppercase tracking-wider font-semibold cursor-pointer self-start"
                                >
                                    Vider le panier
                                </button>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="flex items-center gap-8">
                                        <span className="text-xs text-linear-text-muted uppercase tracking-wider">Total :</span>
                                        <span className="text-2xl font-bold text-white">
                                            {Number(cart.totalAmount).toLocaleString()} Ar
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-xs font-semibold py-3 px-8 rounded-lg active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.06)] flex items-center gap-2"
                                    >
                                        <span>Continuer vers la livraison</span>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── ÉTAPE 2 : Livraison ── */}
                <div className={`transition-all duration-300 ease-out ${
                    step === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none absolute inset-0 w-full"
                }`}>
                    <form onSubmit={handleDeliverySubmit} className="linear-glass rounded-xl p-6 sm:p-8 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Adresse complète de livraison *
                            </label>
                            <textarea
                                placeholder="ex: Lot III-A Cité 67Ha, Bloc 12 Escalier B, Antananarivo 101"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                disabled={isCheckoutLoading}
                                rows="3"
                                className="w-full bg-black/40 border border-linear-border rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-linear-text-muted/50 focus:outline-none focus:border-linear-accent/50 focus:ring-1 focus:ring-linear-accent/20 transition-all resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Téléphone de contact (10 chiffres) *
                            </label>
                            <input
                                type="tel"
                                placeholder="ex: 0341234567"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                disabled={isCheckoutLoading}
                                maxLength="10"
                                className="w-full bg-black/40 border border-linear-border rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-linear-text-muted/50 focus:outline-none focus:border-linear-accent/50 focus:ring-1 focus:ring-linear-accent/20 transition-all font-mono tracking-widest"
                            />
                            <span className="text-[10px] text-linear-text-muted">
                                {customerPhone.length}/10 chiffres
                            </span>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-linear-border/30">
                            <button
                                type="button"
                                onClick={() => { setStep(1); setError(""); }}
                                disabled={isCheckoutLoading}
                                className="w-1/2 bg-black/40 hover:bg-white/[0.04] border border-linear-border rounded-lg text-xs font-semibold py-3 text-linear-text-secondary hover:text-white transition-all cursor-pointer"
                            >
                                ← Retour au panier
                            </button>
                            <button
                                type="submit"
                                disabled={isCheckoutLoading}
                                className="w-1/2 bg-linear-accent hover:bg-linear-accent-hover text-white text-xs font-semibold py-3 rounded-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(94,106,210,0.25)] disabled:opacity-60"
                            >
                                {isCheckoutLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : "Valider → Passer au paiement"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── ÉTAPE 3 : Paiement ── */}
                <div className={`transition-all duration-300 ease-out ${
                    step === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none absolute inset-0 w-full"
                }`}>
                    <div className="linear-glass rounded-xl p-6 sm:p-8 flex flex-col gap-6">
                        {/* Résumé commande */}
                        {createdOrder && (
                            <div className="bg-white/[0.02] border border-linear-border/60 rounded-xl p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <h4 className="text-xs font-bold text-linear-text-primary uppercase tracking-wider">
                                        Commande N° {createdOrder.orderNumber}
                                    </h4>
                                </div>
                                <div className="flex flex-col gap-1 text-xs text-linear-text-muted">
                                    <span>📍 {createdOrder.deliveryAddress}</span>
                                    <span>📱 {createdOrder.customerPhone}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-linear-border/30">
                                    <span className="text-sm font-bold text-white">
                                        Montant à régler : {Number(createdOrder.totalAmount).toLocaleString()} Ar
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Choix mode de paiement */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                                Choisissez votre mode de paiement
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                <PaymentCard
                                    value="SIMULATION"
                                    label="Simulation Test"
                                    description="Validation instantanée (démo)"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                                <PaymentCard
                                    value="MOBILE_MONEY"
                                    label="Mobile Money"
                                    description="Mvola · Orange Money · AirtelMoney"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                                <PaymentCard
                                    value="CARD"
                                    label="Carte Bancaire"
                                    description="Visa · Mastercard sécurisé"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    }
                                />
                                <PaymentCard
                                    value="CASH"
                                    label="Espèces"
                                    description="Paiement à la livraison"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-linear-border/30">
                            <button
                                type="button"
                                onClick={() => { setStep(2); setError(""); }}
                                disabled={isPaymentLoading}
                                className="w-1/2 bg-black/40 hover:bg-white/[0.04] border border-linear-border rounded-lg text-xs font-semibold py-3 text-linear-text-secondary hover:text-white transition-all cursor-pointer"
                            >
                                ← Retour à la livraison
                            </button>
                            <button
                                type="button"
                                onClick={handlePaymentConfirm}
                                disabled={isPaymentLoading}
                                className="w-1/2 bg-linear-accent hover:bg-linear-accent-hover text-white text-xs font-semibold py-3 rounded-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(94,106,210,0.25)] disabled:opacity-60"
                            >
                                {isPaymentLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : "Confirmer le paiement ✓"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── ÉTAPE 4 : Succès ── */}
                <div className={`transition-all duration-300 ease-out flex flex-col items-center text-center justify-center py-16 gap-6 ${
                    step === 4 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none absolute inset-0 w-full"
                }`}>
                    {/* Animated check */}
                    <div className="relative flex items-center justify-center w-20 h-20">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-ping" style={{ animationDuration: "2s" }} />
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white tracking-editorial">
                            Commande confirmée ! 🎉
                        </h2>
                        <p className="text-sm text-linear-text-paragraph max-w-sm leading-relaxed">
                            Votre paiement a été validé. Notre équipe prépare votre colis pour l'expédition. Vous recevrez une confirmation bientôt.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-md mt-2">
                        <Link
                            to="/products"
                            className="bg-black/40 hover:bg-white/[0.04] text-linear-text-secondary hover:text-white border border-linear-border rounded-lg text-xs font-semibold py-3 px-6 transition-all text-center cursor-pointer"
                        >
                            Continuer mes achats
                        </Link>
                        <Link
                            to="/profile"
                            className="bg-linear-accent hover:bg-linear-accent-hover text-white text-xs font-semibold py-3 px-6 rounded-lg active:scale-[0.98] transition-all text-center shadow-[0_4px_12px_rgba(94,106,210,0.25)] cursor-pointer"
                        >
                            Suivre ma commande →
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}