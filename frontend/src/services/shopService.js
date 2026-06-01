import api from "../api/axiosConfig";

/**
 * Get the current user's shop profile.
 */
export async function getMyShop() {
    const response = await api.get("/sellers/shop/my");
    return response.data;
}

/**
 * Create a new shop profile.
 * @param {Object} shopData - { shopName, description, phone, address, logoUrl }
 */
export async function createMyShop(shopData) {
    const response = await api.post("/sellers/shop", shopData);
    return response.data;
}

/**
 * Update an existing shop profile.
 * @param {Object} shopData - { shopName, description, phone, address, logoUrl }
 */
export async function updateMyShop(shopData) {
    const response = await api.put("/sellers/shop", shopData);
    return response.data;
}

/**
 * Upload a logo image file for the shop.
 * @param {File} imageFile - The image file to upload
 */
export async function uploadShopLogo(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await api.post("/sellers/shop/upload-logo", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
}

/**
 * Get seller dashboard statistics.
 */
export async function getMyDashboard() {
    const response = await api.get("/sellers/dashboard");
    return response.data;
}
