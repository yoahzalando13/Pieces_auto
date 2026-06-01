import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/UseAuth";

// Modern Minimalist SVG Icons
function HomeIcon({ className }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

function CatalogueIcon({ className }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function CartIcon({ className }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}

function UserIcon({ className }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function LogoIcon({ className }) {
    return (
        <svg 
            className={className} 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

function SearchIcon({ className }) {
    return (
        <svg 
            className={className} 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

function CloseIcon({ className }) {
    return (
        <svg 
            className={className} 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

export default function Navbar() {
    const { user } = useAuth();
    const location = useLocation();
    const navLinksRef = useRef(null);
    const itemsRef = useRef([]);
    const searchBarRef = useRef(null);
    const searchInputRef = useRef(null);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const menuItems = [
        { path: "/", label: "Accueil", icon: <HomeIcon className="w-5.5 h-5.5" /> },
        { path: "/products", label: "Catalogue", icon: <CatalogueIcon className="w-5.5 h-5.5" /> },
        { path: "/cart", label: "Panier", icon: <CartIcon className="w-5.5 h-5.5" /> },
        { 
            path: user ? "/profile" : "/login", 
            label: user ? "Profil" : "Connexion", 
            icon: <UserIcon className="w-5.5 h-5.5" /> 
        }
    ];

    // Detect active index based on route pathname
    const getActiveIndex = () => {
        const path = location.pathname;
        if (path === "/") return 0;
        if (path.startsWith("/products")) return 1;
        if (path.startsWith("/cart")) return 2;
        if (path.startsWith("/profile") || path.startsWith("/login") || path.startsWith("/register")) return 3;
        return 0;
    };

    const activeIndex = getActiveIndex();
    
    // State to store coordinates for active indicator bubble
    const [bubbleStyle, setBubbleStyle] = useState({ left: 0, width: 0, opacity: 0 });

    useEffect(() => {
        const updateBubble = () => {
            const activeElement = itemsRef.current[activeIndex];
            const navLinks = navLinksRef.current;
            if (activeElement && navLinks) {
                const navLinksRect = navLinks.getBoundingClientRect();
                const activeRect = activeElement.getBoundingClientRect();
                
                // Position relative to the center links container X axis (local coordinates)
                const left = activeRect.left - navLinksRect.left;
                const width = activeRect.width;
                
                setBubbleStyle({
                    left: left,
                    width: width,
                    opacity: 1
                });
            }
        };

        // Run updates on mount and when index changes
        updateBubble();

        // Small delay to make sure DOM refs are fully rendered & structured
        const timeoutId = setTimeout(updateBubble, 60);

        // Listen for screen resize to adjust bubble position perfectly
        window.addEventListener("resize", updateBubble);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", updateBubble);
        };
    }, [activeIndex, user]);

    // Handle auto-focus and key/mouse click-outside listeners for expanding search bar
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }

        function handleClickOutside(event) {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        }

        if (isSearchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSearchOpen]);

    return (
        <>
            {/* SVG Filter for Liquid/Gooey bubble transition */}
            <svg className="absolute w-0 h-0 pointer-events-none select-none" xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                    <filter id="navbar-goo">
                        {/* Blur effect */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                        {/* Sharpening alpha channel contrast to create liquid gooey edge */}
                        <feColorMatrix 
                            in="blur" 
                            mode="matrix" 
                            values="1 0 0 0 0  
                                    0 1 0 0 0  
                                    0 0 1 0 0  
                                    0 0 0 22 -9" 
                            result="goo" 
                        />
                        {/* Blend gooey result atop */}
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            {/* Floating Glass Navbar Dock: Top on Desktop, Bottom on Mobile */}
            <nav 
                className="fixed z-50 flex items-center justify-between px-3 rounded-full linear-glass shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)] select-none border-linear-border transition-all duration-500 ease-in-out
                    /* Mobile Dock */
                    bottom-6 left-1/2 -translate-x-1/2 h-18 w-[calc(100%-2rem)] max-w-[440px] animate-card-enter
                    /* Desktop Header */
                    md:bottom-auto md:top-4 md:h-20 md:w-[calc(100%-4rem)] md:max-w-6xl md:px-8"
            >
                {/* Brand Logo (Desktop only) */}
                <div className="hidden md:flex items-center gap-3 w-1/4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-accent-glow border border-linear-accent/20">
                        <LogoIcon className="w-5.5 h-5.5 text-linear-accent" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-white uppercase">
                        Piece<span className="text-linear-accent">Auto</span>
                    </span>
                </div>

                {/* Centered Navigation Container (Always visible, responsive) */}
                <div 
                    ref={navLinksRef}
                    className="relative flex items-center justify-between md:justify-center flex-1 h-full gap-2 md:gap-4 z-10 md:w-2/4"
                >
                    
                    {/* Gooey Bubble Layer - Behind icons inside local coordinate system */}
                    <div 
                        className="absolute inset-0 pointer-events-none overflow-visible gooey-filter-container"
                        style={{ filter: "url(#navbar-goo)" }}
                    >
                        {/* Primary Blob: Elastic Leader */}
                        <div 
                            className="absolute top-2 bottom-2 md:top-3 md:bottom-3 rounded-full bg-gradient-to-r from-[#5e6ad2] to-[#7f8df2] opacity-95 shadow-[0_0_18px_rgba(94,106,210,0.5)] transition-all duration-[420ms] will-change-transform"
                            style={{
                                left: `${bubbleStyle.left}px`,
                                width: `${bubbleStyle.width}px`,
                                opacity: bubbleStyle.opacity,
                                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" // Elastic overshoot
                            }}
                        />
                        
                        {/* Secondary Blob: Liquid Follower (creates the stretch/gooey tail) */}
                        <div 
                            className="absolute top-2 bottom-2 md:top-3 md:bottom-3 rounded-full bg-gradient-to-r from-[#5e6ad2] to-[#7f8df2] opacity-85 transition-all duration-[600ms] will-change-transform"
                            style={{
                                left: `${bubbleStyle.left}px`,
                                width: `${bubbleStyle.width}px`,
                                opacity: bubbleStyle.opacity,
                                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" // Trailing gooey lag
                            }}
                        />
                    </div>

                    {/* Nav Items */}
                    {menuItems.map((item, idx) => {
                        const isActive = activeIndex === idx;
                        return (
                            <Link
                                key={idx}
                                to={item.path}
                                ref={(el) => (itemsRef.current[idx] = el)}
                                className={`relative flex flex-col items-center justify-center flex-1 md:flex-none md:h-14 md:px-7 py-1.5 rounded-full transition-all duration-300 outline-hidden focus-visible:ring-2 focus-visible:ring-linear-accent select-none ${
                                    isActive 
                                        ? "active text-white" 
                                        : "text-linear-text-muted hover:text-linear-text-secondary hover:scale-105"
                                }`}
                            >
                                <div className={`transition-transform duration-300 ${isActive ? "animate-active-pop" : "scale-100"}`}>
                                    {item.icon}
                                </div>
                                
                                {/* Anchored Text and Active Dot Wrapper */}
                                <div className="relative flex flex-col items-center">
                                    <span className="text-[10px] md:text-[11px] font-semibold mt-1.5 tracking-wide transition-colors duration-300">
                                        {item.label}
                                    </span>

                                    {/* Micro Accent Indicator dot exactly 6px (mt-1.5) below the bottom edge of the text */}
                                    {isActive && (
                                        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)] animate-pulse" />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Actions (Desktop only) - High-end Expanding Search Bar */}
                <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
                    
                    {/* Dynamic Expanding Search Container */}
                    <div 
                        ref={searchBarRef}
                        className={`relative flex items-center h-10 rounded-full border transition-all duration-300 ease-in-out ${
                            isSearchOpen 
                                ? "w-60 bg-white/5 border-linear-accent/40 shadow-[0_0_15px_rgba(94,106,210,0.15)] px-3" 
                                : "w-10 bg-white/4 border-white/8 hover:bg-white/8 hover:scale-105 cursor-pointer justify-center"
                        }`}
                        onClick={() => !isSearchOpen && setIsSearchOpen(true)}
                    >
                        {isSearchOpen ? (
                            <>
                                <SearchIcon className="w-4.5 h-4.5 text-linear-accent shrink-0" />
                                <input 
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Rechercher une pièce..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-0 outline-hidden text-xs text-white px-2 placeholder-linear-text-muted"
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                            setIsSearchOpen(false);
                                        }
                                    }}
                                />
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Avoid triggering parent div onClick
                                        setIsSearchOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className="text-linear-text-muted hover:text-white transition-colors cursor-pointer shrink-0"
                                >
                                    <CloseIcon className="w-3.5 h-3.5" />
                                </button>
                            </>
                        ) : (
                            <SearchIcon className="w-5 h-5 text-linear-text-muted" />
                        )}
                    </div>

                    {/* Online / Connect Button (Fades out when search bar expands for optimal spacing) */}
                    {!isSearchOpen && (
                        <div className="animate-card-enter flex items-center">
                            {user ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[11px] font-semibold text-linear-text-secondary select-none">En ligne</span>
                                </div>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="px-4 py-1.5 rounded-full bg-linear-accent text-white hover:bg-linear-accent-hover transition-all text-xs font-semibold shadow-[0_0_12px_rgba(94,106,210,0.3)] cursor-pointer"
                                >
                                    Connexion
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}