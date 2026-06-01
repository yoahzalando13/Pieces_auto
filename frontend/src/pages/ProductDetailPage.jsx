import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import * as productService from "../services/productService";
import * as cartService from "../services/cartService";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [compatibilities, setCompatibilities] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [successAdded, setSuccessAdded] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProductData = async () => {
            setIsLoading(true);
            setError("");
            try {
                const [productData, compData] = await Promise.all([
                    productService.getProductById(id),
                    productService.getCompatibilities(id)
                ]);
                setProduct(productData);
                setCompatibilities(compData);
            } catch (err) {
                console.error("Error loading product details:", err);
                setError("Impossible de charger les détails du produit. Il est possible que le produit n'existe pas.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProductData();
        }
    }, [id]);

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) {
            setQuantity(1);
        } else if (product && val > product.stock) {
            setQuantity(product.stock);
        } else {
            setQuantity(val);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!product || product.stock === 0) return;

        setIsAdding(true);
        try {
            await cartService.addToCart(product.id, quantity);
            setSuccessAdded(true);
            // Notify Navbar to update cart count
            window.dispatchEvent(new Event("cart-updated"));

            setTimeout(() => {
                setSuccessAdded(false);
            }, 3000);
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert("Une erreur s'est produite lors de l'ajout au panier.");
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-6 animate-card-enter">
                <div className="h-6 w-32 linear-shimmer rounded mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="linear-shimmer h-[400px] w-full rounded-2xl" />
                    <div className="flex flex-col gap-4">
                        <div className="linear-shimmer h-10 w-3/4 rounded" />
                        <div className="linear-shimmer h-5 w-1/4 rounded" />
                        <div className="linear-shimmer h-32 w-full rounded" />
                        <div className="linear-shimmer h-12 w-1/2 rounded mt-6" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="w-full flex flex-col items-center justify-center text-center py-20 animate-card-enter">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-6 py-4 rounded-xl max-w-md">
                    {error || "Le produit demandé est introuvable."}
                </div>
                <Link
                    to="/products"
                    className="mt-6 text-sm text-linear-accent hover:text-white transition-colors"
                >
                    &larr; Retour au catalogue
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8 animate-card-enter">
            {/* Back link */}
            <div>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-linear-text-muted hover:text-white transition-colors uppercase tracking-wider"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Retour au catalogue</span>
                </Link>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                {/* Image container */}
                <div className="lg:col-span-5 flex items-center justify-center bg-black/45 border border-linear-border rounded-2xl overflow-hidden p-6 aspect-square max-h-[500px]">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain rounded-lg hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=600&auto=format&fit=crop";
                            }}
                        />
                    ) : (
                        <svg className="w-20 h-20 text-linear-text-muted/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                    )}
                </div>

                {/* Info and Actions */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Brand and reference */}
                    <div className="flex items-center gap-4">
                        <span className="bg-linear-accent/10 border border-linear-accent/30 text-[#a2acfc] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {product.brandName || "Générique"}
                        </span>
                        <span className="text-xs font-mono text-linear-text-muted">
                            Référence: {product.reference}
                        </span>
                    </div>

                    {/* Product Name */}
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-editorial leading-tight">
                            {product.name}
                        </h2>
                        <span className="text-xs text-linear-text-muted mt-1.5 block">
                            Catégorie: <span className="text-linear-text-secondary">{product.categoryName}</span>
                        </span>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                            Description du Produit
                        </h3>
                        <p className="text-sm text-linear-text-paragraph leading-relaxed bg-white/[0.01] border border-linear-border/50 rounded-xl p-4">
                            {product.description || "Aucune description détaillée n'est disponible pour cette pièce."}
                        </p>
                    </div>

                    {/* Shop information */}
                    {product.shopName && (
                        <div className="text-xs text-linear-text-muted flex items-center gap-2">
                            <span>Vendu par:</span>
                            <span className="text-linear-text-primary font-medium">{product.shopName}</span>
                        </div>
                    )}

                    {/* Price and Add card split */}
                    <div className="linear-glass border-linear-border rounded-2xl p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 mt-2">
                        {/* Pricing */}
                        <div className="flex flex-col gap-2.5">
                            <div>
                                <span className="text-[10px] text-linear-text-muted block uppercase tracking-wider">Achat Individuel</span>
                                <span className="text-2xl font-bold text-white">
                                    {Number(product.normalPrice).toLocaleString()} Ar
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-linear-text-muted block uppercase tracking-wider">Achat Groupé</span>
                                <span className="text-sm font-semibold text-[#a2acfc]">
                                    {Number(product.groupPrice).toLocaleString()} Ar
                                </span>
                            </div>
                        </div>

                        {/* Quantity and Cart button */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            {product.stock > 0 ? (
                                <>
                                    {/* Stock Indicator */}
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs text-emerald-400 font-medium">
                                            En stock ({product.stock} unités restantes)
                                        </span>
                                    </div>

                                    {/* Inputs */}
                                    <div className="flex gap-2.5">
                                        <div className="w-20 flex flex-col gap-1.5">
                                            <input
                                                type="number"
                                                min="1"
                                                max={product.stock}
                                                value={quantity}
                                                onChange={handleQuantityChange}
                                                className="w-full bg-black/40 border border-linear-border rounded-lg py-2 px-2.5 text-sm text-center text-white focus:outline-none focus:border-linear-accent/50"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={isAdding}
                                            className={`flex-1 text-xs font-semibold py-2.5 px-4 rounded-lg cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                                                successAdded
                                                    ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] border border-emerald-400/20"
                                                    : "bg-linear-accent hover:bg-linear-accent-hover text-white border border-white/10 shadow-[0_4px_12px_rgba(94,106,210,0.25)]"
                                            }`}
                                        >
                                            {successAdded ? (
                                                <>
                                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Ajouté !</span>
                                                </>
                                            ) : isAdding ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <span>Ajouter au panier</span>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-xs text-red-400 font-medium">Rupture de stock</span>
                                    </div>
                                    <button
                                        disabled
                                        className="w-full bg-zinc-800/40 border border-zinc-700/20 text-zinc-500 text-xs font-semibold py-2.5 rounded-lg cursor-not-allowed"
                                    >
                                        Indisponible
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Compatibility List section */}
                    <div className="flex flex-col gap-3 mt-4">
                        <h3 className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                            Compatibilité Véhicule
                        </h3>
                        {compatibilities.length === 0 ? (
                            <p className="text-xs text-linear-text-paragraph italic">
                                Information de compatibilité spécifique non documentée. Convient généralement aux véhicules standards.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                                {compatibilities.map((comp) => {
                                    const v = comp?.vehiculeVersion;
                                    const m = v?.model;
                                    const b = m?.brand;
                                    return (
                                        <div 
                                            key={comp.id} 
                                            className="bg-white/[0.01] border border-linear-border/30 rounded-lg p-3 flex flex-col gap-1 hover:border-linear-accent/20 transition-all"
                                        >
                                            <span className="text-xs font-semibold text-linear-text-primary">
                                                {b?.name ?? "—"} {m?.name ?? "—"}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-linear-text-muted font-medium">
                                                {v?.engine && <span>{v.engine}</span>}
                                                {v?.fuelType && <><span className="opacity-30">•</span><span>{v.fuelType}</span></>}
                                                {v?.transmission && <><span className="opacity-30">•</span><span>{v.transmission}</span></>}
                                                {v?.startYear && <><span className="opacity-30">•</span><span>{v.startYear} – {v.endYear ?? "présent"}</span></>}
                                            </div>
                                            {comp.note && (
                                                <span className="text-[9px] text-linear-text-muted italic mt-1 bg-black/20 p-1 rounded">
                                                    Note: {comp.note}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}