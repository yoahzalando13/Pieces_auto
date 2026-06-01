import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import { getMyOrders, cancelMyOrder } from "../services/orderService";

const STATUS_CONFIG = {
    PENDING:    { label: "En attente",   color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/25" },
    CONFIRMED:  { label: "Confirmée",    color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/25" },
    PROCESSING: { label: "En cours",     color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/25" },
    SHIPPED:    { label: "Expédiée",     color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/25" },
    DELIVERED:  { label: "Livrée",       color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
    CANCELLED:  { label: "Annulée",      color: "text-red-400",     bg: "bg-red-500/10 border-red-500/25" },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: "text-linear-text-muted", bg: "bg-white/5 border-linear-border" };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders]           = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [cancellingId, setCancellingId]       = useState(null);
    const [expandedId, setExpandedId]           = useState(null);
    const [activeTab, setActiveTab]             = useState("orders"); // "orders" | "account"
    const [error, setError]                     = useState("");

    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm("Annuler cette commande ?")) return;
        setCancellingId(orderId);
        setError("");
        try {
            await cancelMyOrder(orderId);
            await fetchOrders();
        } catch (e) {
            setError(e.response?.data?.message ?? "Impossible d'annuler la commande.");
        } finally {
            setCancellingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    if (!user) return null;

    const initials = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase() || "U";

    return (
        <div className="w-full flex flex-col gap-10 animate-card-enter">

            {/* ── En-tête profil ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-linear-border pb-8">
                <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-linear-accent/15 border border-linear-accent/30 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-linear-accent tracking-tight">{initials}</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-editorial">
                            {user.prenom} {user.nom}
                        </h1>
                        <p className="text-xs text-linear-text-muted mt-1">{user.telephone}</p>
                        {user.email && <p className="text-xs text-linear-text-muted">{user.email}</p>}
                        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-linear-accent/10 border border-linear-accent/25 text-[#a2acfc]">
                            {user.role === "ADMIN" ? "Administrateur" : user.role === "VENDEUR" ? "Vendeur" : "Client"}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs font-semibold text-linear-text-muted hover:text-red-400 border border-linear-border hover:border-red-500/30 px-4 py-2.5 rounded-lg transition-all cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                </button>
            </div>

            {/* ── Onglets ── */}
            <div className="flex gap-1 p-1 bg-white/[0.02] border border-linear-border rounded-xl w-fit">
                {[
                    { id: "orders",  label: "Mes commandes" },
                    { id: "account", label: "Mon compte" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === tab.id
                                ? "bg-linear-accent text-white shadow-[0_2px_8px_rgba(94,106,210,0.3)]"
                                : "text-linear-text-muted hover:text-white"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                </div>
            )}

            {/* ── Contenu onglet COMMANDES ── */}
            {activeTab === "orders" && (
                <div className="flex flex-col gap-4">
                    {isLoadingOrders ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="linear-shimmer h-28 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-20 bg-white/[0.01] border border-dashed border-linear-border rounded-2xl p-8">
                            <svg className="w-12 h-12 text-linear-text-muted/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="text-base font-semibold text-linear-text-primary">Aucune commande</h3>
                            <p className="text-xs text-linear-text-paragraph max-w-sm mt-1">
                                Vous n'avez pas encore passé de commande. Parcourez notre catalogue pour trouver vos pièces.
                            </p>
                            <Link
                                to="/products"
                                className="mt-6 bg-linear-accent hover:bg-linear-accent-hover text-white text-xs font-semibold px-5 py-2.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer inline-block"
                            >
                                Voir le catalogue
                            </Link>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const isExpanded = expandedId === order.id;
                            const canCancel  = ["PENDING", "CONFIRMED"].includes(order.status);
                            return (
                                <div
                                    key={order.id}
                                    className="border border-linear-border/60 rounded-xl bg-white/[0.01] overflow-hidden hover:border-linear-border transition-all"
                                >
                                    {/* Ligne principale */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-sm font-bold text-white">
                                                    Commande #{order.orderNumber}
                                                </span>
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs text-linear-text-muted mt-1">
                                                <span>
                                                    {order.items?.length ?? 0} article{(order.items?.length ?? 0) > 1 ? "s" : ""}
                                                </span>
                                                <span className="font-semibold text-linear-text-secondary">
                                                    {Number(order.totalAmount).toLocaleString()} Ar
                                                </span>
                                                <span>
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-linear-text-muted truncate max-w-sm">
                                                📍 {order.deliveryAddress}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 self-start sm:self-center">
                                            {canCancel && (
                                                <button
                                                    onClick={() => handleCancel(order.id)}
                                                    disabled={cancellingId === order.id}
                                                    className="text-xs font-semibold text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                                                >
                                                    {cancellingId === order.id ? (
                                                        <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : "Annuler"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                className="text-xs font-semibold text-linear-text-muted hover:text-white border border-linear-border hover:border-linear-border-focus px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                            >
                                                {isExpanded ? "Masquer" : "Détails"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Détails articles (accordéon) */}
                                    {isExpanded && order.items && order.items.length > 0 && (
                                        <div className="border-t border-linear-border/40 bg-black/20 p-5 flex flex-col gap-3">
                                            <h4 className="text-[10px] font-semibold text-linear-text-muted uppercase tracking-wider mb-1">
                                                Articles commandés
                                            </h4>
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-linear-border flex items-center justify-center shrink-0">
                                                            <svg className="w-3.5 h-3.5 text-linear-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <span className="text-linear-text-primary font-medium">{item.productName}</span>
                                                            <span className="text-linear-text-muted ml-2">× {item.quantity}</span>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-white shrink-0">
                                                        {Number(item.totalPrice ?? (item.unitPrice * item.quantity)).toLocaleString()} Ar
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="flex justify-end pt-3 border-t border-linear-border/30 mt-1">
                                                <span className="text-sm font-bold text-white">
                                                    Total : {Number(order.totalAmount).toLocaleString()} Ar
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ── Contenu onglet COMPTE ── */}
            {activeTab === "account" && (
                <div className="linear-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-5 max-w-lg">
                    <h3 className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase border-b border-linear-border pb-3">
                        Informations personnelles
                    </h3>

                    {[
                        { label: "Prénom",     value: user.prenom },
                        { label: "Nom",        value: user.nom },
                        { label: "Téléphone",  value: user.telephone },
                        { label: "Email",      value: user.email || "Non renseigné" },
                        { label: "Rôle",       value: user.role === "ADMIN" ? "Administrateur" : user.role === "VENDEUR" ? "Vendeur" : "Client" },
                        { label: "Compte créé",value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" }) : "—" },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center gap-4">
                            <span className="text-[11px] font-semibold text-linear-text-muted uppercase tracking-wider whitespace-nowrap">
                                {label}
                            </span>
                            <span className="text-sm text-linear-text-primary font-medium text-right truncate">
                                {value}
                            </span>
                        </div>
                    ))}

                    <div className="pt-4 border-t border-linear-border/30 mt-2">
                        <p className="text-[11px] text-linear-text-muted italic">
                            La modification du profil sera disponible prochainement.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}