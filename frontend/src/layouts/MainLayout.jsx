import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";

export default function MainLayout({ children }) {
    const location = useLocation();
    const isAuthPage = ["/login", "/register"].includes(location.pathname);

    if (isAuthPage) {
        return (
            <main className="w-full flex-grow flex flex-col">
                {children}
            </main>
        );
    }

    return (
        <>
            <Navbar />

            <main>
                {children}
            </main>

            <Footer />
        </>
    );
}