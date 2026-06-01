import api from "../api/axiosConfig";

export async function getAllProducts() {
    const response = await api.get("/products");
    return response.data;
}

export async function getProductById(productId) {
    const response = await api.get(`/products/${productId}`);
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

export async function searchAdvanced(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
            params.append(key, filters[key]);
        }
    });
    const response = await api.get(`/products/search-advanced?${params.toString()}`);
    return response.data;
}

export async function smartSearch(q) {
    const response = await api.get(`/products/smart-search?q=${encodeURIComponent(q)}`);
    return response.data;
}

export async function parseSmartSearch(q) {
    const response = await api.get(`/products/smart-search/parse?q=${encodeURIComponent(q)}`);
    return response.data;
}

export async function getBrands() {
    const response = await api.get("/vehicules/brands");
    return response.data;
}

export async function getModels(brandId) {
    const response = await api.get(`/vehicules/brands/${brandId}/models`);
    return response.data;
}

export async function getVersions(modelId) {
    const response = await api.get(`/vehicules/models/${modelId}/versions`);
    return response.data;
}

export async function getCompatibilities(productId) {
    const response = await api.get(`/products/${productId}/compatibilities`);
    return response.data;
}

export async function getMySellerProducts() {
    const response = await api.get("/products/seller/my");
    return response.data;
}

export async function createSellerProduct(categoryId, productData) {
    const response = await api.post(`/products/seller/categories/${categoryId}`, productData);
    return response.data;
}

export async function uploadProductImage(productId, imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await api.post(`/products/${productId}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
}

export async function deleteProduct(productId) {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
}