import { Link } from "react-router-dom";

export default function Navbar() {

    return (
        <nav>

            <Link to="/">
                Accueil
            </Link>

            <Link to="/products">
                Produits
            </Link>

            <Link to="/cart">
                Panier
            </Link>

            <Link to="/login">
                Connexion
            </Link>

        </nav>
    );
}