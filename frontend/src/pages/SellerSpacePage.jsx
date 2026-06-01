import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import { getMyShop, createMyShop, updateMyShop, uploadShopLogo, getMyDashboard } from "../services/shopService";
import { getMySellerProducts, createSellerProduct, uploadProductImage, deleteProduct, getCategories } from "../services/productService";
import "./SellerSpacePage.css";

const NAV_ITEMS = [
    { id: "dashboard", label: "Tableau de bord", icon: "M4 13h6V4H4v9zm10 7h6V10h-6v10zM4 20h6v-5H4v5zm10-12h6V4h-6v4z" },
    { id: "shop",      label: "Ma boutique",    icon: "M4 9.5 12 4l8 5.5V20H4V9.5zm8-2.1-4.5 3V18h9V10.4l-4.5-3z" },
    { id: "products",  label: "Produits",       icon: "M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { id: "stock",     label: "Stocks",         icon: "M3 7h18M6 7v12m6-12v12m6-12v12M4 19h16" },
    { id: "sales",     label: "Ventes",         icon: "M4 19V5m0 14h16M8 15l3-3 3 2 6-7" },
];

/* ─── Helpers ─── */

function fmt(num) {
    if (!num && num !== 0) return "—";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + " M Ar";
    return new Intl.NumberFormat("fr-FR").format(num) + " Ar";
}

function relTime(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── Primitive UI components ─── */

function StatusPill({ children, tone = "neutral" }) {
    return <span className={`seller-pill seller-pill--${tone}`}>{children}</span>;
}

function MetricCard({ label, value, hint, tone }) {
    return (
        <div className={`seller-metric seller-metric--${tone}`}>
            <span className="seller-metric__label">{label}</span>
            <div className="seller-metric__body">
                <span className="seller-metric__value">{value}</span>
                <span className="seller-metric__hint">{hint}</span>
            </div>
        </div>
    );
}

function SectionTitle({ title, subtitle }) {
    return (
        <div className="seller-section-title">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
        </div>
    );
}

function Spinner() {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
            <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "3px solid rgba(94,106,210,.15)",
                borderTopColor: "#5e6ad2",
                animation: "spin 0.7s linear infinite"
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

function ErrorCard({ message, onRetry }) {
    return (
        <div className="seller-card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <p style={{ color: "#fcd34d", marginBottom: "1rem", fontSize: 13 }}>⚠ {message}</p>
            {onRetry && (
                <button type="button" className="seller-btn seller-btn--outline" onClick={onRetry}>
                    Réessayer
                </button>
            )}
        </div>
    );
}

/* ─── Toast ─── */

function Toast({ message, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3500);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <div className="seller-toast">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" style={{ color: "#10b981", flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{message}</span>
        </div>
    );
}

/* ═══════════════════════════════════════════
   DASHBOARD SECTION
═══════════════════════════════════════════ */

function DashboardSection({ setActiveSection, showToast }) {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            setData(await getMyDashboard());
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Erreur de chargement du tableau de bord");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Spinner />;
    if (error)   return <ErrorCard message={error} onRetry={load} />;

    return (
        <div className="seller-content-section animate-card-enter">
            <SectionTitle
                title="Tableau de bord"
                subtitle="Vue d'ensemble en temps réel de votre activité"
            />

            <div className="seller-metrics-grid">
                <MetricCard label="Boutique" value={data.shopName || "—"} hint="Votre boutique" tone="emerald" />
                <MetricCard label="Produits totaux" value={String(data.totalProducts ?? 0)} hint="Dans le catalogue" tone="blue" />
                <MetricCard label="Produits actifs" value={String(data.activeProducts ?? 0)} hint="Publiés et visibles" tone="violet" />
                <MetricCard label="Commandes" value={String(data.totalOrders ?? 0)} hint="Reçues au total" tone="amber" />
            </div>

            <div className="seller-cards-row">
                <div className="seller-card">
                    <p className="seller-card__header">Revenus générés</p>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: "#f7f8f8", margin: "0.5rem 0 0", letterSpacing: "-0.02em" }}>
                        {fmt(data.totalSales)}
                    </p>
                    <p style={{ fontSize: 12, color: "#8a8f98", marginTop: 4 }}>Chiffre d'affaires total cumulé</p>
                </div>

                <div className="seller-card">
                    <p className="seller-card__header">Actions rapides</p>
                    <div className="seller-card__actions" style={{ marginTop: "0.5rem" }}>
                        <button type="button" onClick={() => navigate("/create-product")}
                            className="seller-btn seller-btn--primary" style={{ width: "100%" }}>
                            + Ajouter un produit
                        </button>
                        <button type="button" onClick={() => setActiveSection("shop")}
                            className="seller-btn seller-btn--outline" style={{ width: "100%" }}>
                            Modifier la boutique
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   SHOP SECTION
═══════════════════════════════════════════ */

function ShopSection({ showToast }) {
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [hasShop, setHasShop] = useState(false);
    const logoInputRef = useRef(null);

    // form fields
    const [shopName, setShopName]     = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone]           = useState("");
    const [address, setAddress]       = useState("");

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const s = await getMyShop();
            setShop(s);
            setHasShop(true);
            setShopName(s.shopName || "");
            setDescription(s.description || "");
            setPhone(s.phone || "");
            setAddress(s.address || "");
        } catch (e) {
            const status = e?.response?.status;
            if (status === 404 || status === 500) {
                setHasShop(false);
            } else {
                setError(e?.response?.data?.message || e.message || "Impossible de charger la boutique");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { shopName, description, phone, address, logoUrl: shop?.logoUrl || null };
            const updated = hasShop ? await updateMyShop(payload) : await createMyShop(payload);
            setShop(updated);
            setHasShop(true);
            showToast(hasShop ? "Boutique mise à jour !" : "Boutique créée avec succès !");
        } catch (e) {
            showToast("Erreur : " + (e?.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const updated = await uploadShopLogo(file);
            setShop(updated);
            showToast("Logo mis à jour !");
        } catch (err) {
            showToast("Erreur upload logo : " + (err?.response?.data?.message || err.message));
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    if (loading) return <Spinner />;
    if (error)   return <ErrorCard message={error} onRetry={load} />;

    return (
        <div className="seller-content-section animate-card-enter">
            <SectionTitle
                title="Ma boutique"
                subtitle={hasShop ? "Gérez les informations et l'image de votre boutique" : "Créez votre boutique pour commencer à vendre"}
            />

            {hasShop && shop && (
                <div className="seller-cards-row">
                    {/* Aperçu */}
                    <div className="seller-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <p className="seller-card__header">Aperçu public</p>

                        {/* Logo */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: 16, overflow: "hidden", flexShrink: 0,
                                border: "1px solid rgba(255,255,255,.08)",
                                background: "rgba(94,106,210,.1)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                {shop.logoUrl
                                    ? <img src={shop.logoUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5e6ad2" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="4" />
                                        <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                    </svg>
                                }
                            </div>
                            <div>
                                <p style={{ fontSize: 15, fontWeight: 700, color: "#f7f8f8", margin: 0 }}>{shop.shopName}</p>
                                <p style={{ fontSize: 12, color: "#8a8f98", margin: "2px 0 0" }}>
                                    {shop.active ? "Boutique active" : "Boutique inactive"} • Créée le {relTime(shop.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Status pill */}
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <StatusPill tone={shop.active ? "success" : "warning"}>
                                {shop.active ? "Active" : "Inactive"}
                            </StatusPill>
                            {shop.sellerStatus && (
                                <StatusPill tone={shop.sellerStatus === "APPROVED" ? "success" : shop.sellerStatus === "PENDING" ? "warning" : "neutral"}>
                                    {shop.sellerStatus === "APPROVED" ? "Approuvé" : shop.sellerStatus === "PENDING" ? "En attente" : shop.sellerStatus}
                                </StatusPill>
                            )}
                        </div>

                        {shop.description && (
                            <p style={{ fontSize: 13, color: "#b4bcd0", lineHeight: 1.6, margin: 0 }}>{shop.description}</p>
                        )}

                        {/* Info grid */}
                        <div className="seller-shop-info-grid">
                            <div className="seller-shop-info-item">
                                <span className="seller-shop-info-label">Téléphone</span>
                                <span className="seller-shop-info-value">{shop.phone || "—"}</span>
                            </div>
                            <div className="seller-shop-info-item">
                                <span className="seller-shop-info-label">Adresse</span>
                                <span className="seller-shop-info-value">{shop.address || "—"}</span>
                            </div>
                        </div>

                        {/* Logo upload */}
                        <div>
                            <p className="seller-card__header" style={{ marginBottom: "0.5rem" }}>Logo de la boutique</p>
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleLogoChange}
                            />
                            <button
                                type="button"
                                className="seller-btn seller-btn--outline"
                                style={{ width: "100%" }}
                                disabled={uploading}
                                onClick={() => logoInputRef.current?.click()}
                            >
                                {uploading
                                    ? "Envoi en cours…"
                                    : shop.logoUrl ? "🔄 Changer le logo" : "📷 Ajouter un logo"
                                }
                            </button>
                            <p style={{ fontSize: 11, color: "#8a8f98", marginTop: 6 }}>
                                JPG, PNG ou WebP · max recommandé 2 Mo
                            </p>
                        </div>
                    </div>

                    {/* Edit form */}
                    <div className="seller-card">
                        <p className="seller-card__header">Modifier les informations</p>
                        <form onSubmit={handleSave} className="seller-form-stack">
                            <div>
                                <label className="seller-field-label">Nom de la boutique *</label>
                                <input className="seller-input" value={shopName} onChange={e => setShopName(e.target.value)} required maxLength={100} />
                            </div>
                            <div>
                                <label className="seller-field-label">Téléphone *</label>
                                <input className="seller-input" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+261 34 00 000 00" />
                            </div>
                            <div>
                                <label className="seller-field-label">Adresse *</label>
                                <input className="seller-input" value={address} onChange={e => setAddress(e.target.value)} required placeholder="Rue, Quartier, Ville" />
                            </div>
                            <div>
                                <label className="seller-field-label">Description</label>
                                <textarea className="seller-textarea" value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} placeholder="Décrivez votre boutique…" />
                            </div>
                            <button type="submit" className="seller-btn seller-btn--primary" disabled={saving}>
                                {saving ? "Enregistrement…" : "Enregistrer les modifications"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {!hasShop && (
                <div className="seller-card" style={{ maxWidth: 520 }}>
                    <p className="seller-card__header">Créer votre boutique</p>
                    <form onSubmit={handleSave} className="seller-form-stack">
                        <div>
                            <label className="seller-field-label">Nom de la boutique *</label>
                            <input className="seller-input" value={shopName} onChange={e => setShopName(e.target.value)} required maxLength={100} placeholder="Ex: Garage Pro Mada" />
                        </div>
                        <div>
                            <label className="seller-field-label">Téléphone *</label>
                            <input className="seller-input" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+261 34 00 000 00" />
                        </div>
                        <div>
                            <label className="seller-field-label">Adresse *</label>
                            <input className="seller-input" value={address} onChange={e => setAddress(e.target.value)} required placeholder="Rue, Quartier, Ville" />
                        </div>
                        <div>
                            <label className="seller-field-label">Description</label>
                            <textarea className="seller-textarea" value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} placeholder="Décrivez votre boutique…" />
                        </div>
                        <button type="submit" className="seller-btn seller-btn--primary" disabled={saving}>
                            {saving ? "Création en cours…" : "Créer ma boutique"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════
   PRODUCTS SECTION
═══════════════════════════════════════════ */

function ProductCreateModal({ categories, onClose, onCreate, showToast }) {
    const [name, setName]           = useState("");
    const [reference, setReference] = useState("PRD-" + Math.floor(1000 + Math.random() * 9000));
    const [brandName, setBrandName] = useState("");
    const [normalPrice, setNormalPrice] = useState("");
    const [groupPrice, setGroupPrice]   = useState("");
    const [stock, setStock]             = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId]   = useState(categories[0]?.id || "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId) { showToast("Sélectionnez une catégorie"); return; }
        setSaving(true);
        try {
            const payload = {
                name, reference, brandName,
                normalPrice: parseFloat(normalPrice),
                groupPrice:  groupPrice ? parseFloat(groupPrice) : undefined,
                stock: parseInt(stock),
                description: description || undefined,
            };
            const created = await createSellerProduct(categoryId, payload);
            onCreate(created);
            showToast(`Produit "${name}" créé avec succès !`);
            onClose();
        } catch (err) {
            showToast("Erreur : " + (err?.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="seller-modal-overlay" onClick={onClose}>
            <div className="seller-modal" onClick={e => e.stopPropagation()}>
                <div className="seller-modal__header">
                    <h3 className="seller-modal__title">Ajouter un produit</h3>
                    <button type="button" className="seller-modal__close-btn" onClick={onClose}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="seller-form-stack">
                    <div>
                        <label className="seller-field-label">Nom du produit *</label>
                        <input className="seller-input" value={name} onChange={e => setName(e.target.value)} required maxLength={150} placeholder="Ex: Disque de frein avant" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                        <div>
                            <label className="seller-field-label">Référence *</label>
                            <input className="seller-input" value={reference} onChange={e => setReference(e.target.value)} required maxLength={100} />
                        </div>
                        <div>
                            <label className="seller-field-label">Marque *</label>
                            <input className="seller-input" value={brandName} onChange={e => setBrandName(e.target.value)} required placeholder="Ex: Bosch" />
                        </div>
                    </div>
                    <div>
                        <label className="seller-field-label">Catégorie *</label>
                        <select
                            className="seller-input"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            required
                            style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.08)" }}
                        >
                            {categories.length === 0
                                ? <option value="">Aucune catégorie disponible</option>
                                : categories.map(c => (
                                    <option key={c.id} value={c.id} style={{ background: "#09090b", color: "#fff" }}>
                                        {c.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.625rem" }}>
                        <div>
                            <label className="seller-field-label">Prix normal (Ar) *</label>
                            <input type="number" className="seller-input" value={normalPrice} onChange={e => setNormalPrice(e.target.value)} required min="0" />
                        </div>
                        <div>
                            <label className="seller-field-label">Prix groupé (Ar)</label>
                            <input type="number" className="seller-input" value={groupPrice} onChange={e => setGroupPrice(e.target.value)} min="0" />
                        </div>
                        <div>
                            <label className="seller-field-label">Stock *</label>
                            <input type="number" className="seller-input" value={stock} onChange={e => setStock(e.target.value)} required min="0" />
                        </div>
                    </div>
                    <div>
                        <label className="seller-field-label">Description</label>
                        <textarea className="seller-textarea" value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} placeholder="Caractéristiques, compatibilité…" rows={3} />
                    </div>
                    <div className="seller-modal__footer">
                        <button type="button" className="seller-btn seller-btn--outline" onClick={onClose}>Annuler</button>
                        <button type="submit" className="seller-btn seller-btn--primary" disabled={saving}>
                            {saving ? "Création…" : "Créer le produit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ProductImageModal({ product, onClose, onUpdated, showToast }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(product.imageUrl || null);
    const [uploading, setUploading] = useState(false);

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const updated = await uploadProductImage(product.id, file);
            onUpdated(updated);
            showToast("Image mise à jour !");
            onClose();
        } catch (err) {
            showToast("Erreur : " + (err?.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="seller-modal-overlay" onClick={onClose}>
            <div className="seller-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                <div className="seller-modal__header">
                    <h3 className="seller-modal__title">Image du produit</h3>
                    <button type="button" className="seller-modal__close-btn" onClick={onClose}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{
                        width: "100%", aspectRatio: "16/9", borderRadius: 12,
                        border: "1px solid rgba(255,255,255,.08)",
                        background: "rgba(255,255,255,.02)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden"
                    }}>
                        {preview
                            ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            : <p style={{ color: "#8a8f98", fontSize: 13 }}>Aucune image</p>
                        }
                    </div>
                    <label className="seller-btn seller-btn--outline" style={{ cursor: "pointer", textAlign: "center" }}>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                        Choisir une image
                    </label>
                    <div className="seller-modal__footer" style={{ marginTop: 0 }}>
                        <button type="button" className="seller-btn seller-btn--outline" onClick={onClose}>Annuler</button>
                        <button type="button" className="seller-btn seller-btn--primary" onClick={handleUpload} disabled={!file || uploading}>
                            {uploading ? "Upload…" : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductsSection({ showToast }) {
    const navigate = useNavigate();
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [imgProduct, setImgProduct] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [prods, cats] = await Promise.all([getMySellerProducts(), getCategories()]);
            setProducts(prods);
            setCategories(cats);
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Impossible de charger les produits");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = (newProduct) => {
        setProducts(prev => [newProduct, ...prev]);
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`Supprimer "${p.name}" ? Cette action est irréversible.`)) return;
        try {
            await deleteProduct(p.id);
            setProducts(prev => prev.filter(x => x.id !== p.id));
            showToast(`"${p.name}" supprimé.`);
        } catch (err) {
            showToast("Erreur suppression : " + (err?.response?.data?.message || err.message));
        }
    };

    const handleImageUpdated = (updated) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    if (loading) return <Spinner />;
    if (error)   return <ErrorCard message={error} onRetry={load} />;

    return (
        <div className="seller-content-section animate-card-enter">
            <div className="seller-section-header-row">
                <SectionTitle
                    title="Produits de la boutique"
                    subtitle={`${products.length} référence${products.length !== 1 ? "s" : ""} dans votre catalogue`}
                />
                <button type="button" onClick={() => navigate("/create-product")} className="seller-btn seller-btn--primary">
                    + Nouveau produit
                </button>
            </div>

            {products.length === 0 ? (
                <div className="seller-card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <p style={{ color: "#8a8f98", fontSize: 13 }}>Aucun produit dans votre boutique.<br />Cliquez sur «&nbsp;+ Nouveau produit&nbsp;» pour commencer.</p>
                </div>
            ) : (
                <div className="seller-list">
                    {products.map(p => (
                        <div key={p.id} className="seller-list-item">
                            {/* Thumbnail */}
                            <div style={{
                                width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0,
                                border: "1px solid rgba(255,255,255,.07)",
                                background: "rgba(255,255,255,.03)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                {p.imageUrl
                                    ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5e6ad2" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                    </svg>
                                }
                            </div>

                            <div className="seller-list-item__info" style={{ flex: 1 }}>
                                <p className="seller-list-item__name">{p.name}</p>
                                <p className="seller-list-item__sub">
                                    Réf. {p.reference} • {p.brandName} • {p.categoryName || "Sans catégorie"}
                                </p>
                            </div>

                            <div className="seller-list-item__actions">
                                <StatusPill tone={!p.active ? "neutral" : p.stock === 0 ? "warning" : p.stock < 5 ? "warning" : "success"}>
                                    {!p.active ? "Inactif" : p.stock === 0 ? "Rupture" : p.stock < 5 ? "Stock bas" : "Actif"}
                                </StatusPill>
                                <span className="seller-list-item__price" style={{ color: "#fff", fontWeight: 600 }}>
                                    {fmt(p.normalPrice)}
                                </span>
                                <span style={{ fontSize: 12, color: "#8a8f98" }}>{p.stock} u</span>
                                <div style={{ display: "flex", gap: "0.375rem" }}>
                                    <button type="button" onClick={() => setImgProduct(p)} className="seller-btn seller-btn--small" title="Gérer l'image">
                                        🖼
                                    </button>
                                    <button type="button" onClick={() => handleDelete(p)} className="seller-btn seller-btn--small"
                                        style={{ color: "#ef4444", borderColor: "rgba(239,68,68,.2)" }}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <ProductCreateModal
                    categories={categories}
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreate}
                    showToast={showToast}
                />
            )}

            {imgProduct && (
                <ProductImageModal
                    product={imgProduct}
                    onClose={() => setImgProduct(null)}
                    onUpdated={handleImageUpdated}
                    showToast={showToast}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════
   STOCK SECTION
═══════════════════════════════════════════ */

function StockSection({ showToast }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            setProducts(await getMySellerProducts());
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Impossible de charger les stocks");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const sorted = useMemo(() => [...products].sort((a, b) => a.stock - b.stock), [products]);

    if (loading) return <Spinner />;
    if (error)   return <ErrorCard message={error} onRetry={load} />;

    const critical = products.filter(p => p.stock === 0).length;
    const low      = products.filter(p => p.stock > 0 && p.stock < 5).length;

    return (
        <div className="seller-content-section animate-card-enter">
            <SectionTitle
                title="Suivi des stocks"
                subtitle="Produits triés du plus bas au plus élevé"
            />

            <div className="seller-metrics-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                <MetricCard label="En rupture"  value={String(critical)} hint="Stock = 0" tone="amber" />
                <MetricCard label="Stock bas"   value={String(low)}      hint="Moins de 5 unités" tone="violet" />
                <MetricCard label="Références"  value={String(products.length)} hint="Total catalogue" tone="blue" />
            </div>

            {sorted.length === 0 ? (
                <div className="seller-card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <p style={{ color: "#8a8f98", fontSize: 13 }}>Aucun produit trouvé.</p>
                </div>
            ) : (
                <div className="seller-list">
                    {sorted.map(p => {
                        const isOut  = p.stock === 0;
                        const isLow  = p.stock > 0 && p.stock < 5;
                        return (
                            <div key={p.id} className="seller-list-item">
                                <div className="seller-list-item__info">
                                    <p className="seller-list-item__name">{p.name}</p>
                                    <p className="seller-list-item__sub">Réf. {p.reference} · {p.brandName}</p>
                                </div>
                                <div className="seller-list-item__actions">
                                    <StatusPill tone={isOut ? "warning" : isLow ? "warning" : "success"}>
                                        {isOut ? "Rupture totale" : isLow ? "Stock critique" : "Stock sain"}
                                    </StatusPill>
                                    <span className="seller-list-item__price" style={{
                                        color: isOut ? "#fcd34d" : isLow ? "#fcd34d" : "#fff",
                                        fontWeight: 700
                                    }}>
                                        {p.stock} unités
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════
   SALES SECTION
═══════════════════════════════════════════ */

function SalesSection() {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            setData(await getMyDashboard());
        } catch (e) {
            setError(e?.response?.data?.message || e.message || "Impossible de charger les ventes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Spinner />;
    if (error)   return <ErrorCard message={error} onRetry={load} />;

    return (
        <div className="seller-content-section animate-card-enter">
            <SectionTitle
                title="Ventes"
                subtitle="Performance commerciale de votre boutique"
            />

            <div className="seller-metrics-grid">
                <MetricCard label="Revenus totaux" value={fmt(data.totalSales)} hint="Chiffre d'affaires" tone="violet" />
                <MetricCard label="Commandes"      value={String(data.totalOrders ?? 0)} hint="Reçues au total" tone="emerald" />
                <MetricCard label="Produits actifs" value={String(data.activeProducts ?? 0)} hint="Sur le catalogue" tone="blue" />
                <MetricCard label="Produits totaux" value={String(data.totalProducts ?? 0)} hint="Dans la boutique" tone="amber" />
            </div>

            <div className="seller-card">
                <p className="seller-card__header">Résumé de la boutique</p>
                <div className="seller-card__list" style={{ marginTop: "0.75rem" }}>
                    {[
                        { label: "Boutique", value: data.shopName || "—" },
                        { label: "Revenus générés", value: fmt(data.totalSales) },
                        { label: "Nombre de commandes", value: String(data.totalOrders ?? 0) },
                        { label: "Produits actifs / total", value: `${data.activeProducts ?? 0} / ${data.totalProducts ?? 0}` },
                    ].map(row => (
                        <div key={row.label} className="seller-card__list-item">
                            <span>{row.label}</span>
                            <span className="seller-card__list-value">{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */

export default function SellerSpacePage() {
    const { user } = useAuth();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState(() => {
        const initialTab = new URLSearchParams(location.search).get("tab");
        return initialTab && NAV_ITEMS.some(item => item.id === initialTab) ? initialTab : "dashboard";
    });
    const [toast, setToast] = useState(null);

    const canAccess = user && (user.role === "VENDEUR" || user.role === "ADMIN");

    const activeItem = useMemo(
        () => NAV_ITEMS.find(i => i.id === activeSection) ?? NAV_ITEMS[0],
        [activeSection]
    );

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get("tab");
        if (tab && tab !== activeSection && NAV_ITEMS.some(item => item.id === tab)) {
            setActiveSection(tab);
        }
    }, [location.search, activeSection]);

    const showToast = useCallback((msg) => setToast(msg), []);

    /* Access denied */
    if (user && !canAccess) {
        return (
            <div className="seller-access-denied animate-card-enter">
                <div className="seller-card" style={{ maxWidth: 520, margin: "0 auto" }}>
                    <StatusPill tone="warning">Accès restreint</StatusPill>
                    <h1 className="seller-denied-title">Espace vendeur réservé</h1>
                    <p className="seller-denied-text">
                        Cette zone est réservée aux comptes vendeurs. Si vous souhaitez gérer une boutique,
                        demandez un rôle vendeur depuis votre profil.
                    </p>
                    <div className="seller-denied-actions">
                        <Link to="/profile" className="seller-btn seller-btn--primary">Mon profil</Link>
                        <Link to="/products" className="seller-btn seller-btn--outline">Catalogue</Link>
                    </div>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeSection) {
            case "dashboard": return <DashboardSection setActiveSection={setActiveSection} showToast={showToast} />;
            case "shop":      return <ShopSection showToast={showToast} />;
            case "products":  return <ProductsSection showToast={showToast} />;
            case "stock":     return <StockSection showToast={showToast} />;
            case "sales":     return <SalesSection />;
            default:          return <DashboardSection setActiveSection={setActiveSection} showToast={showToast} />;
        }
    };

    return (
        <div className="seller-layout">
            <div className="seller-main">
                <div className="seller-main__header">
                    <StatusPill tone="success">Espace vendeur</StatusPill>
                    <h1 className="seller-main__title">{activeItem.label}</h1>
                    <p className="seller-main__subtitle">
                        Gérez votre boutique, vos produits, vos stocks et suivez vos performances commerciales.
                    </p>
                </div>
                {renderContent()}
            </div>
            {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </div>
    );
}
