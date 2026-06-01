import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import ProfilePage from "../pages/ProfilePage";
import SellerSpacePage from "../pages/SellerSpacePage";
import BecomeSellerPage from "../pages/BecomeSellerPage";
import CreateProductPage from "../pages/CreateProductPage";

export default function AppRouter() {

    return (
        <Routes>

            <Route
                path="/"
                element={<HomePage />}
            />

            <Route
                path="/products"
                element={<ProductsPage />}
            />

            <Route
                path="/products/:id"
                element={<ProductDetailPage />}
            />

            <Route
                path="/cart"
                element={<CartPage />}
            />

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/register"
                element={<RegisterPage />}
            />

            <Route
                path="/profile"
                element={<ProfilePage />}
            />

            <Route
                path="/become-seller"
                element={<BecomeSellerPage />}
            />

            <Route
                path="/seller-space"
                element={<SellerSpacePage />}
            />

            <Route
                path="/create-product"
                element={<CreateProductPage />}
            />

        </Routes>
    );
}