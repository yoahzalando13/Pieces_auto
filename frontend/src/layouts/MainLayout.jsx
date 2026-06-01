import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";

export default function MainLayout({ children }) {
    const location = useLocation();
    const isAuthPage = ["/login", "/register", "/create-product", "/become-seller"].includes(location.pathname);
    const isProductDetailPage = location.pathname.startsWith("/products/");
    const isSellerSpace = location.pathname === "/seller-space";
    const isSpacedPage = ["/products", "/cart", "/profile"].includes(location.pathname);
    const isFooterHidden = ["/cart", "/profile", "/seller-space"].includes(location.pathname);

    const mainSpacingClass = isSellerSpace
        ? "w-full flex-grow pt-0 md:pt-32 pb-32 md:pb-16 max-w-6xl mx-auto px-0 md:px-8 relative"
        : isProductDetailPage
            ? "w-full flex-grow px-4 md:px-8 pt-12 pb-32 md:pt-40 md:pb-16 max-w-7xl mx-auto z-10 relative"
            : isSpacedPage
                ? "w-full flex-grow px-4 md:px-8 pt-10 pb-32 md:pt-36 md:pb-16 max-w-7xl mx-auto z-10 relative"
                : "w-full flex-grow px-4 md:px-8 pt-8 pb-32 md:pt-28 md:pb-16 max-w-7xl mx-auto z-10 relative";

    if (isAuthPage) {
        return (
            <main className="w-full flex-grow flex flex-col">
                {children}
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-linear-bg text-linear-text-primary linear-dots linear-glow flex flex-col relative overflow-hidden font-sans">
            {/* Soft background ambient halo glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-linear-accent/10 rounded-full blur-[130px] pointer-events-none z-0 animate-float-glow" />

            <Navbar />

            <main className={mainSpacingClass}>
                {children}
            </main>

            {!isFooterHidden && <Footer />}
        </div>
    );
}