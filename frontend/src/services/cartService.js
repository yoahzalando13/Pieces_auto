import api from "../api/axiosConfig";

export async function getCart() {
    const response = await api.get("/cart");
    return response.data;
}

export async function addToCart(productId, quantity = 1) {
    const response = await api.post(`/cart/add/${productId}?quantity=${quantity}`);
    return response.data;
}

export async function updateCart(productId, quantity) {
    const response = await api.put(`/cart/update/${productId}?quantity=${quantity}`);
    return response.data;
}

export async function removeFromCart(productId) {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
}

export async function clearCart() {
    const response = await api.delete("/cart/clear");
    return response.data;
}

export async function getCartTotal() {
    const response = await api.get("/cart/total");
    return response.data;
}

export async function checkout(checkoutData) {
    // checkoutData should contain { deliveryAddress, customerPhone }
    const response = await api.post("/orders/checkout", checkoutData);
    return response.data;
}

export async function payOrder(orderId, method = "SIMULATION") {
    const response = await api.post(`/payments/pay/order/${orderId}?method=${method}`);
    return response.data;
}
