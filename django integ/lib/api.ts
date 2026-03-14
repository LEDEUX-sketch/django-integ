const API_BASE = "http://127.0.0.1:8000/api";

async function request(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
        cache: "no-store",
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json();
}

// ─── Auth ───
export const api = {
    auth: {
        register: (data: { email: string; password: string; name: string }) =>
            request("/auth/register/", { method: "POST", body: JSON.stringify(data) }),
        signIn: (data: { email: string; password: string }) =>
            request("/auth/signin/", { method: "POST", body: JSON.stringify(data) }),
        adminLogin: () =>
            request("/auth/admin-login/", { method: "POST", body: JSON.stringify({}) }),
        getUser: (userId: string) =>
            request(`/auth/user/${userId}/`),
    },

    // ─── Users (Admin) ───
    users: {
        listAll: () => request("/users/"),
        banUser: (userId: string) =>
            request(`/users/${userId}/ban/`, { method: "POST", body: JSON.stringify({}) }),
        unbanUser: (userId: string) =>
            request(`/users/${userId}/unban/`, { method: "POST", body: JSON.stringify({}) }),
        suspendUser: (userId: string, durationHours?: number) =>
            request(`/users/${userId}/suspend/`, { method: "POST", body: JSON.stringify({ durationHours }) }),
        reactivateUser: (userId: string) =>
            request(`/users/${userId}/reactivate/`, { method: "POST", body: JSON.stringify({}) }),
    },

    // ─── Products ───
    products: {
        list: (params?: { category?: string; brand?: string; limit?: number }) => {
            const sp = new URLSearchParams();
            if (params?.category) sp.set("category", params.category);
            if (params?.brand) sp.set("brand", params.brand);
            if (params?.limit) sp.set("limit", String(params.limit));
            return request(`/products/?${sp.toString()}`);
        },
        getFeatured: () => request("/products/featured/"),
        getFlashSale: () => request("/products/flash-sale/"),
        getById: (productId: string | number) => request(`/products/${productId}/`),
        search: (searchTerm: string) =>
            request(`/products/search/?searchTerm=${encodeURIComponent(searchTerm)}`),
        createProduct: (data: Record<string, unknown>) =>
            request("/products/create/", { method: "POST", body: JSON.stringify(data) }),
        deleteProduct: (productId: string | number) =>
            request(`/products/${productId}/delete/`, { method: "DELETE" }),
        updateStock: (productId: string | number, stock: number) =>
            request(`/products/${productId}/update/`, { method: "PUT", body: JSON.stringify({ stock }) }),
        addReview: (data: { userId: string; productId: string | number; rating: number; comment: string }) =>
            request("/products/review/add/", { method: "POST", body: JSON.stringify(data) }),
    },

    // ─── Cart ───
    cart: {
        get: (userId: string) => request(`/cart/?userId=${userId}`),
        add: (data: { userId: string; productId: string | number; quantity: number }) =>
            request("/cart/add/", { method: "POST", body: JSON.stringify(data) }),
        updateQuantity: (data: { cartItemId: string | number; quantity: number }) =>
            request("/cart/update/", { method: "POST", body: JSON.stringify(data) }),
        remove: (data: { cartItemId: string | number }) =>
            request("/cart/remove/", { method: "POST", body: JSON.stringify(data) }),
        getCount: (userId: string) => request(`/cart/count/?userId=${userId}`),
    },

    // ─── Orders ───
    orders: {
        getAll: () => request("/orders/all/"),
        place: (data: { userId: string; shippingAddress: Record<string, string> }) =>
            request("/orders/place/", { method: "POST", body: JSON.stringify(data) }),
        getByUser: (userId: string) => request(`/orders/?userId=${userId}`),
        confirmReceived: (orderId: string | number, userId: string) =>
            request(`/orders/${orderId}/confirm-received/`, { method: "POST", body: JSON.stringify({ userId }) }),
        cancelOrder: (orderId: string | number, userId: string) =>
            request(`/orders/${orderId}/cancel/`, { method: "POST", body: JSON.stringify({ userId }) }),
        updateStatus: (orderId: string | number, newStatus: string) =>
            request(`/orders/${orderId}/update/`, { method: "PUT", body: JSON.stringify({ status: newStatus }) }),
    },

    // ─── Seed ───
    seed: () => request("/seed/", { method: "POST", body: JSON.stringify({}) }),
};
