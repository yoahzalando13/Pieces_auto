import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import * as productService from "../services/productService";
import * as cartService from "../services/cartService";

function FiltersPanel({
    categories,
    brands,
    models,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    selectedModel,
    setSelectedModel,
    selectedEngine,
    setSelectedEngine,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    onApply,
    onReset,
    onClose,
    isMobile = false,
}) {
    return (
        <div className={`flex flex-col gap-6 linear-glass rounded-2xl p-6 h-fit z-10 ${isMobile ? "w-full max-w-xl max-h-[88vh] overflow-y-auto shadow-[0_25px_80px_rgba(0,0,0,0.55)]" : ""}`}>
            <div className="flex items-center justify-between border-b border-linear-border pb-4">
                <h3 className="text-sm font-semibold text-linear-text-primary tracking-wider uppercase">
                    Filtres Avancés
                </h3>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onReset}
                        className="text-xs text-linear-accent hover:text-white transition-colors cursor-pointer"
                    >
                        Effacer tout
                    </button>
                    {isMobile && onClose && (
                        <button
                            onClick={onClose}
                            className="text-xs text-linear-text-muted hover:text-white transition-colors cursor-pointer"
                        >
                            Fermer
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                    Catégorie
                </label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-black/30 border border-linear-border rounded-lg p-2.5 text-xs text-linear-text-secondary focus:outline-none focus:border-linear-accent/50 focus:ring-0 transition-all cursor-pointer"
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                    Marque Véhicule
                </label>
                <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-black/30 border border-linear-border rounded-lg p-2.5 text-xs text-linear-text-secondary focus:outline-none focus:border-linear-accent/50 focus:ring-0 transition-all cursor-pointer"
                >
                    <option value="">Toutes les marques</option>
                    {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                    Modèle
                </label>
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!selectedBrand}
                    className="w-full bg-black/30 border border-linear-border rounded-lg p-2.5 text-xs text-linear-text-secondary focus:outline-none focus:border-linear-accent/50 focus:ring-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <option value="">Tous les modèles</option>
                    {models.map((m) => (
                        <option key={m.id} value={m.name}>
                            {m.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                    Motorisation
                </label>
                <input
                    type="text"
                    placeholder="ex: 1.2 PureTech"
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value)}
                    className="w-full bg-black/30 border border-linear-border rounded-lg p-2.5 text-xs text-linear-text-primary placeholder-linear-text-muted/40 focus:outline-none focus:border-linear-accent/50 focus:ring-0 transition-all"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                    Prix (Ar)
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-1/2 bg-black/30 border border-linear-border rounded-lg p-2.5 text-xs text-linear-text-primary placeholder-linear-text-muted/40 focus:outline-none focus:border-linear-accent/50 transition-all"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-1/2 bg-black/30 border border-linear-border rounded-lg p-2.5 text-xs text-linear-text-primary placeholder-linear-text-muted/40 focus:outline-none focus:border-linear-accent/50 transition-all"
                    />
                </div>
            </div>

            <button
                onClick={onApply}
                className="w-full bg-[#f7f8f8] hover:bg-[#e4e4e7] text-black text-xs font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(255,255,255,0.05)] mt-2"
            >
                Appliquer les filtres
            </button>
        </div>
    );
}

export default function ProductsPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Products and Categories state
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Smart Search Query State
    const [smartQuery, setSmartQuery] = useState("");
    const [parsedSearch, setParsedSearch] = useState(null);

    // Advanced Search Fields
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedEngine, setSelectedEngine] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Vehicle API lists
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [goToPageValue, setGoToPageValue] = useState("");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const productsPerPage = 9;

    // Cart loading state per product
    const [addingToCartId, setAddingToCartId] = useState(null);
    const [successAddedId, setSuccessAddedId] = useState(null);

    // Initial load: Categories, Vehicle Brands and location state handling
    useEffect(() => {
        const initData = async () => {
            try {
                const [cats, brandList] = await Promise.all([
                    productService.getCategories(),
                    productService.getBrands()
                ]);
                setCategories(cats);
                setBrands(brandList);

                // Handle navigation state from HomePage (Plate or Model search)
                if (location.state) {
                    const { searchType, brand, model, engine, query } = location.state;
                    
                    if (searchType === "plate" && query) {
                        setSmartQuery(query);
                        // Query with plate information using smart search
                        await executeSmartSearch(query);
                    } else if (searchType === "model" && brand) {
                        // Prefill model search
                        setSelectedBrand(brand);
                        // Find brand in list to fetch models
                        const brandObj = brandList.find(b => b.name.toLowerCase() === brand.toLowerCase());
                        if (brandObj) {
                            const modelList = await productService.getModels(brandObj.id);
                            setModels(modelList);
                        }
                        setSelectedModel(model || "");
                        setSelectedEngine(engine || "");
                        
                        // Execute search advanced
                        await fetchFilteredProducts({
                            vehiculeBrand: brand,
                            vehiculeModel: model,
                            engine: engine
                        });
                    } else {
                        await fetchAll();
                    }
                } else {
                    await fetchAll();
                }
            } catch (err) {
                console.error("Error loading initial data:", err);
                setError("Erreur de chargement des filtres. Veuillez réessayer.");
                await fetchAll();
            }
        };

        initData();
    }, [location.state]);

    // Fetch models when brand changes
    useEffect(() => {
        if (!selectedBrand) {
            setModels([]);
            setSelectedModel("");
            setSelectedEngine("");
            return;
        }
        const fetchModels = async () => {
            try {
                const brandObj = brands.find(b => b.name === selectedBrand);
                if (brandObj) {
                    const modelList = await productService.getModels(brandObj.id);
                    setModels(modelList);
                }
            } catch (err) {
                console.error("Error loading models:", err);
            }
        };
        fetchModels();
    }, [selectedBrand, brands]);

    // Fetch all products
    const fetchAll = async () => {
        setIsLoading(true);
        setError("");
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            setError("Impossible de charger les produits.");
        } finally {
            setIsLoading(false);
        }
    };

    // Main fetch with advanced filters
    const fetchFilteredProducts = async (customFilters = null) => {
        setIsLoading(true);
        setError("");
        setParsedSearch(null); // Reset smart search display
        
        const filters = customFilters || {
            categoryId: selectedCategory,
            vehiculeBrand: selectedBrand,
            vehiculeModel: selectedModel,
            engine: selectedEngine,
            minPrice: minPrice,
            maxPrice: maxPrice
        };

        try {
            const data = await productService.searchAdvanced(filters);
            setProducts(data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la recherche filtrée.");
        } finally {
            setIsLoading(false);
        }
    };

    // Execute Smart Search
    const executeSmartSearch = async (queryStr) => {
        if (!queryStr.trim()) {
            await fetchAll();
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            // Get parsed info to show in UI
            const parsed = await productService.parseSmartSearch(queryStr);
            setParsedSearch(parsed);

            // Fetch actual products
            const data = await productService.smartSearch(queryStr);
            setProducts(data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la recherche intelligente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartSubmit = (e) => {
        e.preventDefault();
        executeSmartSearch(smartQuery);
    };

    const resetFilters = () => {
        setSmartQuery("");
        setParsedSearch(null);
        setSelectedCategory("");
        setSelectedBrand("");
        setSelectedModel("");
        setSelectedEngine("");
        setMinPrice("");
        setMaxPrice("");
        fetchAll();
        setIsFiltersOpen(false);
    };

    // Add product to cart
    const handleAddToCart = async (productId) => {
        if (!user) {
            navigate("/login");
            return;
        }
        setAddingToCartId(productId);
        try {
            await cartService.addToCart(productId, 1);
            setSuccessAddedId(productId);
            // Trigger navbar update
            window.dispatchEvent(new Event("cart-updated"));
            
            // Remove success indicator after 2s
            setTimeout(() => {
                setSuccessAddedId(null);
            }, 2000);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'ajout au panier.");
        } finally {
            setAddingToCartId(null);
        }
    };

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleGoToPage = (e) => {
        e.preventDefault();
        const pageNumber = Number(goToPageValue);

        if (!Number.isInteger(pageNumber)) {
            return;
        }

        if (pageNumber < 1 || pageNumber > totalPages) {
            return;
        }

        paginate(pageNumber);
        setGoToPageValue("");
    };

    const visiblePageCount = Math.min(totalPages, 5);
    const visiblePages = Array.from({ length: visiblePageCount }, (_, index) => index + 1);

    return (
        <div className="w-full flex flex-col gap-10">
            {/* Top Glow Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-linear-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-linear-gradient tracking-editorial">
                        Catalogue Produits
                    </h1>
                    <p className="text-sm text-linear-text-paragraph mt-1">
                        Trouvez et achetez vos pièces de rechange d'origine automobile.
                    </p>
                </div>
                <div className="text-xs text-linear-text-muted bg-white/[0.02] border border-linear-border px-3.5 py-1.5 rounded-full self-start">
                    {products.length} {products.length > 1 ? "produits disponibles" : "produit disponible"}
                </div>
            </div>

            {/* Smart Search Bar */}
            <form onSubmit={handleSmartSubmit} className="w-full">
                <div className="relative flex items-center">
                    <svg className="absolute left-4 w-5 h-5 text-linear-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Recherche intelligente (ex: 'Filtre à huile Peugeot 208 diesel 2020')"
                        value={smartQuery}
                        onChange={(e) => setSmartQuery(e.target.value)}
                        className="w-full bg-black/40 border border-linear-border rounded-xl py-3.5 pl-12 pr-32 text-sm text-linear-text-primary placeholder-linear-text-muted/50 focus:outline-none focus:border-linear-accent/60 focus:ring-1 focus:ring-linear-accent/20 transition-all font-medium"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 bg-linear-accent hover:bg-linear-accent-hover text-white text-xs font-semibold px-4 py-2 rounded-lg active:scale-[0.98] transition-all cursor-pointer"
                    >
                        Rechercher
                    </button>
                </div>

                {/* Smart Search parsed display indicator */}
                {parsedSearch && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs bg-linear-accent/5 border border-linear-accent/20 rounded-lg p-3 animate-card-enter">
                        <span className="text-linear-text-primary font-medium mr-1">🔍 Moteur IA:</span>
                        {parsedSearch.vehiculeBrand && <span className="bg-black/35 px-2.5 py-0.5 rounded border border-linear-border text-linear-text-secondary">Marque: {parsedSearch.vehiculeBrand}</span>}
                        {parsedSearch.vehiculeModel && <span className="bg-black/35 px-2.5 py-0.5 rounded border border-linear-border text-linear-text-secondary">Modèle: {parsedSearch.vehiculeModel}</span>}
                        {parsedSearch.year && <span className="bg-black/35 px-2.5 py-0.5 rounded border border-linear-border text-linear-text-secondary">Année: {parsedSearch.year}</span>}
                        {parsedSearch.engine && <span className="bg-black/35 px-2.5 py-0.5 rounded border border-linear-border text-linear-text-secondary">Moteur: {parsedSearch.engine}L</span>}
                        {parsedSearch.fuelType && <span className="bg-black/35 px-2.5 py-0.5 rounded border border-linear-border text-linear-text-secondary">Carburant: {parsedSearch.fuelType}</span>}
                        {parsedSearch.keyword && <span className="bg-black/35 px-2.5 py-0.5 rounded border border-linear-border text-linear-text-secondary">Terme: "{parsedSearch.keyword}"</span>}
                    </div>
                )}
            </form>

            <div className="lg:hidden flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => setIsFiltersOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-linear-border text-linear-text-primary text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M10 20h4" />
                    </svg>
                    Filtres Avancés
                </button>
                <span className="text-[11px] text-linear-text-muted">
                    Affichage mobile
                </span>
            </div>

            {isFiltersOpen && (
                <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm px-4 py-6 flex items-center justify-center lg:hidden animate-modal-backdrop">
                    <div className="absolute inset-0" onClick={() => setIsFiltersOpen(false)} />
                    <div className="relative w-full flex justify-center animate-modal-panel">
                        <FiltersPanel
                            isMobile
                            categories={categories}
                            brands={brands}
                            models={models}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            selectedBrand={selectedBrand}
                            setSelectedBrand={setSelectedBrand}
                            selectedModel={selectedModel}
                            setSelectedModel={setSelectedModel}
                            selectedEngine={selectedEngine}
                            setSelectedEngine={setSelectedEngine}
                            minPrice={minPrice}
                            setMinPrice={setMinPrice}
                            maxPrice={maxPrice}
                            setMaxPrice={setMaxPrice}
                            onApply={() => {
                                fetchFilteredProducts();
                                setIsFiltersOpen(false);
                            }}
                            onReset={resetFilters}
                            onClose={() => setIsFiltersOpen(false)}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Side: Advanced Filters Bar */}
                <div className="hidden lg:block lg:col-span-1">
                    <FiltersPanel
                        categories={categories}
                        brands={brands}
                        models={models}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedBrand={selectedBrand}
                        setSelectedBrand={setSelectedBrand}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        selectedEngine={selectedEngine}
                        setSelectedEngine={setSelectedEngine}
                        minPrice={minPrice}
                        setMinPrice={setMinPrice}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                        onApply={() => fetchFilteredProducts()}
                        onReset={resetFilters}
                    />
                </div>

                {/* Right Side: Product Grid */}
                <div className="lg:col-span-3 flex flex-col gap-10">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        /* Skeleton loading grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, idx) => (
                                <div key={idx} className="linear-glass rounded-xl p-5 flex flex-col gap-4 animate-card-enter">
                                    <div className="linear-shimmer w-full h-44 rounded-lg" />
                                    <div className="linear-shimmer w-2/3 h-5 rounded" />
                                    <div className="linear-shimmer w-full h-12 rounded" />
                                    <div className="linear-shimmer w-1/3 h-4 rounded" />
                                    <div className="flex gap-2.5 mt-2">
                                        <div className="linear-shimmer w-1/2 h-9 rounded" />
                                        <div className="linear-shimmer w-1/2 h-9 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center text-center py-20 bg-white/[0.01] border border-dashed border-linear-border rounded-2xl p-8">
                            <svg className="w-12 h-12 text-linear-text-muted/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <h4 className="text-base font-semibold text-linear-text-primary">Aucune pièce trouvée</h4>
                            <p className="text-xs text-linear-text-paragraph max-w-sm mt-1">
                                Essayez d'ajuster vos critères ou de vider les filtres pour voir d'autres résultats.
                            </p>
                            <button
                                onClick={resetFilters}
                                className="mt-5 bg-linear-accent hover:bg-linear-accent-hover text-white text-xs font-semibold px-4 py-2 rounded-lg active:scale-[0.98] transition-all cursor-pointer"
                            >
                                Tout réinitialiser
                            </button>
                        </div>
                    ) : (
                        /* Product Grid */
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-card-enter">
                                {currentProducts.map((product) => (
                                    <div 
                                        key={product.id} 
                                        className="group relative flex flex-col justify-between bg-gradient-to-b from-white/[0.02] to-transparent border border-linear-border rounded-xl p-5 hover:border-linear-accent/30 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                                    >
                                        <div>
                                            {/* Brand and Ref row */}
                                            <div className="flex items-center justify-between mb-3.5">
                                                <span className="text-[10px] font-semibold text-linear-text-muted bg-white/[0.03] border border-linear-border px-2.5 py-0.5 rounded uppercase">
                                                    {product.brandName || "Générique"}
                                                </span>
                                                <span className="text-[9px] font-mono text-linear-text-muted/60">
                                                    Ref: {product.reference}
                                                </span>
                                            </div>

                                            {/* Product Image */}
                                            <div className="relative w-full h-40 bg-black/35 rounded-lg overflow-hidden border border-linear-border/40 mb-4 flex items-center justify-center">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=350&auto=format&fit=crop";
                                                        }}
                                                    />
                                                ) : (
                                                    /* Fallback Icon */
                                                    <svg className="w-12 h-12 text-linear-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Details Info */}
                                            <h4 className="text-sm font-semibold text-linear-text-primary line-clamp-1">
                                                {product.name}
                                            </h4>
                                            <p className="text-[11px] text-linear-text-muted mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">
                                                {product.description || "Aucune description fournie pour ce produit."}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-linear-border/30">
                                            {/* Pricing & Stock */}
                                            <div className="flex items-end justify-between mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-linear-text-muted leading-none">Prix normal</span>
                                                    <span className="text-base font-bold text-linear-text-primary mt-1">
                                                        {product.normalPrice ? Number(product.normalPrice).toLocaleString() : 0} Ar
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-linear-text-muted leading-none">Achat groupé</span>
                                                    <span className="text-[13px] font-bold text-[#a2acfc] mt-1">
                                                        {product.groupPrice ? Number(product.groupPrice).toLocaleString() : 0} Ar
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-2.5">
                                                <Link
                                                    to={`/products/${product.id}`}
                                                    className="w-1/2 bg-black/40 hover:bg-white/[0.04] text-linear-text-secondary hover:text-white border border-linear-border rounded-lg text-xs font-semibold py-2.5 text-center transition-all cursor-pointer"
                                                >
                                                    Détails
                                                </Link>
                                                <button
                                                    onClick={() => handleAddToCart(product.id)}
                                                    disabled={addingToCartId === product.id || product.stock === 0}
                                                    className={`w-1/2 border rounded-lg text-xs font-semibold py-2.5 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98] ${
                                                        successAddedId === product.id 
                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                            : product.stock === 0
                                                            ? "bg-zinc-800/20 border-zinc-700/20 text-zinc-500 cursor-not-allowed"
                                                            : "bg-linear-accent hover:bg-linear-accent-hover border-white/10 text-white shadow-[0_4px_12px_rgba(94,106,210,0.25)]"
                                                    }`}
                                                >
                                                    {successAddedId === product.id ? (
                                                        <>
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span>Ajouté !</span>
                                                        </>
                                                    ) : product.stock === 0 ? (
                                                        <span>En rupture</span>
                                                    ) : addingToCartId === product.id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <span>Prendre</span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex flex-col gap-4 mt-8 animate-card-enter">
                                    <div className="flex justify-center items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="bg-black/30 hover:bg-white/[0.04] disabled:opacity-40 disabled:hover:bg-transparent border border-linear-border px-3.5 py-2 rounded-lg text-xs font-semibold text-linear-text-secondary hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            Précédent
                                        </button>

                                        {visiblePages.map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => paginate(page)}
                                                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                                    currentPage === page
                                                        ? "bg-linear-accent border-linear-accent/35 text-white"
                                                        : "bg-black/30 border-linear-border text-linear-text-muted hover:text-white hover:border-linear-border-focus"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {totalPages > 5 && (
                                            <span className="px-2 text-linear-text-muted text-xs font-semibold select-none">
                                                ...
                                            </span>
                                        )}

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="bg-black/30 hover:bg-white/[0.04] disabled:opacity-40 disabled:hover:bg-transparent border border-linear-border px-3.5 py-2 rounded-lg text-xs font-semibold text-linear-text-secondary hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            Suivant
                                        </button>
                                    </div>

                                    <form onSubmit={handleGoToPage} className="flex justify-center items-center gap-2 flex-wrap">
                                        <label htmlFor="go-to-page" className="text-xs text-linear-text-muted font-medium">
                                            Aller vers
                                        </label>
                                        <input
                                            id="go-to-page"
                                            type="number"
                                            min="1"
                                            max={totalPages}
                                            value={goToPageValue}
                                            onChange={(e) => setGoToPageValue(e.target.value)}
                                            placeholder={String(currentPage)}
                                            className="w-24 bg-black/30 border border-linear-border rounded-lg px-3 py-2 text-xs text-linear-text-primary placeholder-linear-text-muted/50 focus:outline-none focus:border-linear-accent/50 transition-all"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-linear-accent hover:bg-linear-accent-hover text-white text-xs font-semibold px-4 py-2 rounded-lg active:scale-[0.98] transition-all cursor-pointer"
                                        >
                                            Aller
                                        </button>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}