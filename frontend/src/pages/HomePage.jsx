import { useEffect, useState } from "react";
import { getAllProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function HomePage() {

    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <h1>Produits</h1>

                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
        
            <input
                type="text"
                placeholder="Rechercher..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />
            <button
                onClick={async () => {
                
                    const data = await searchProducts(keyword);
                
                    setProducts(data);
                }}
            >
                Rechercher
            </button>

        </div>
    );
}   

