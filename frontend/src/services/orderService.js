import api from "../api/axiosConfig";

export async function getMyOrders() {
    const response = await api.get("/orders/my");
    return response.data;
}

export async function getMyOrderDetails(orderId) {
    const response = await api.get(`/orders/my/${orderId}`);
    return response.data;
}

export async function cancelMyOrder(orderId) {
    const response = await api.put(`/orders/my/${orderId}/cancel`);
    return response.data;
}

export async function getMyPayments() {
    const response = await api.get("/payments/my");
    return response.data;
}
