import api from "../api/axiosConfig";

export async function getAllProducts() {
    const response = await api.get("/products");
    return response.data;
}

export async function getCategories() {
    const response = await api.get("/products/categories");
    return response.data;
}
export async function searchProducts(keyword) {
    const response = await api.get(`/products/search?keyword=${keyword}`);
    return response.data;
}