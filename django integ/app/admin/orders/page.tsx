"use client";

import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import Link from "next/link";

/* ——— shared sidebar styles ——— */
const S = {
    layout: { display: "flex", minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Inter', system-ui, sans-serif" } as React.CSSProperties,
    sidebar: { width: 260, background: "#fff", borderRight: "1px solid #e8e8e8", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto", boxShadow: "2px 0 12px rgba(0,0,0,0.04)", flexShrink: 0 } as React.CSSProperties,
    sidebarHeader: { padding: "24px 20px 16px", borderBottom: "1px solid #e8e8e8" } as React.CSSProperties,
    logo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#222", fontSize: "1.25rem", fontWeight: 800, letterSpacing: -0.5 } as React.CSSProperties,
    roleBadge: { display: "inline-block", background: "linear-gradient(135deg, #1a1a2e, #16213e)", color: "#fff", padding: "3px 14px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, marginTop: 10 } as React.CSSProperties,
    nav: { flex: 1, padding: "16px 0" } as React.CSSProperties,
    navItem: (active: boolean) => ({ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", color: active ? "#ee4d2d" : "#757575", textDecoration: "none", fontSize: "0.88rem", fontWeight: active ? 600 : 500, borderLeft: `3px solid ${active ? "#ee4d2d" : "transparent"}`, background: active ? "rgba(238,77,45,0.07)" : "transparent" }) as React.CSSProperties,
    sidebarFooter: { padding: "16px 20px", borderTop: "1px solid #e8e8e8" } as React.CSSProperties,
    userInfo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } as React.CSSProperties,
    avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #ee4d2d, #ff6f4e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 } as React.CSSProperties,
    userName: { fontSize: "0.85rem", fontWeight: 600, color: "#222" } as React.CSSProperties,
    userEmail: { fontSize: "0.72rem", color: "#999" } as React.CSSProperties,
    logoutBtn: { display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 12px", background: "none", border: "1px solid #e8e8e8", borderRadius: 8, color: "#757575", fontSize: "0.82rem", cursor: "pointer" } as React.CSSProperties,
    main: { flex: 1, padding: "32px 40px", overflowY: "auto", minWidth: 0 } as React.CSSProperties,
    headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 } as React.CSSProperties,
    h1: { fontSize: "1.65rem", fontWeight: 700, color: "#222", marginBottom: 4 } as React.CSSProperties,
    subtitle: { color: "#757575", fontSize: "0.92rem" } as React.CSSProperties,
    badge: { background: "rgba(238,77,45,0.1)", color: "#ee4d2d", padding: "6px 16px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600 } as React.CSSProperties,
    loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f0f2f5" } as React.CSSProperties,
    spinner: { width: 40, height: 40, border: "3px solid #e8e8e8", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "adminspin 0.8s linear infinite" } as React.CSSProperties,
    tableWrap: { background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", overflow: "hidden" } as React.CSSProperties,
    table: { width: "100%", borderCollapse: "collapse" } as React.CSSProperties,
    th: { padding: "14px 18px", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #e8e8e8", background: "#f8f9fa" } as React.CSSProperties,
    td: { padding: "14px 18px", fontSize: "0.88rem", color: "#222", borderBottom: "1px solid #f3f4f6" } as React.CSSProperties,
    tdEmpty: { padding: "48px 18px", textAlign: "center", color: "#999", fontSize: "0.92rem" } as React.CSSProperties,
    statusBadge: (status: string) => {
        const colors: Record<string, { bg: string; color: string; border: string }> = {
            completed: { bg: "#f0fdf4", color: "#22c55e", border: "#bbf7d0" },
            shipped: { bg: "#eff6ff", color: "#3b82f6", border: "#dbeafe" },
            cancelled: { bg: "#fef2f2", color: "#ef4444", border: "#fee2e2" },
            pending: { bg: "#fffbeb", color: "#f59e0b", border: "#fef3c7" },
        };
        const c = colors[status] || colors.pending;
        return { display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", background: c.bg, color: c.color, border: `1px solid ${c.border}` } as React.CSSProperties;
    },
    select: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.85rem", background: "white", cursor: "pointer", outline: "none" } as React.CSSProperties,
    message: (type: "success" | "error") => ({
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderRadius: 10, marginBottom: 20, fontSize: "0.88rem", fontWeight: 500,
        background: type === "success" ? "#ecfdf5" : "#fef2f2",
        color: type === "success" ? "#065f46" : "#991b1b",
        border: `1px solid ${type === "success" ? "#a7f3d0" : "#fecaca"}`,
    }) as React.CSSProperties,
    msgClose: { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "inherit", opacity: 0.7, padding: "0 4px" } as React.CSSProperties,
};

const formatPrice = (price: number) => {
    return `₱${price.toLocaleString("en-PH")}`;
};

type OrderItem = { productId: string; name: string; price: number; quantity: number; image: string };
type AdminOrder = { _id: string; userId: string; items: OrderItem[]; totalAmount: number; status: string; shippingAddress: Record<string, string>; createdAt: string };

export default function AdminOrdersPage() {
    const { user, isAdmin, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [allOrders, setAllOrders] = useState<AdminOrder[] | null>(null);

    const fetchOrders = () => { api.orders.getAll().then(setAllOrders).catch(() => setAllOrders([])); };

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (mounted && (!user || !isAdmin)) router.push("/");
    }, [mounted, user, isAdmin, router]);
    useEffect(() => { fetchOrders(); }, []);

    if (!mounted || !user || !isAdmin) {
        return (
            <>
                <style>{`@keyframes adminspin { to { transform: rotate(360deg); } }`}</style>
                <div style={S.loading}><div style={S.spinner} /></div>
            </>
        );
    }

    return (
        <div style={S.layout}>
            <aside style={S.sidebar}>
                <div style={S.sidebarHeader}>
                    <Link href="/" style={S.logo}>
                        <svg viewBox="0 0 32 32" fill="none" width={28} height={28}><rect width="32" height="32" rx="8" fill="rgba(238,77,45,0.15)" /><path d="M8 22V10l8-4 8 4v12l-8 4-8-4z" stroke="#ee4d2d" strokeWidth="1.5" fill="none" /><path d="M16 6v20M8 10l8 4 8-4" stroke="#ee4d2d" strokeWidth="1.5" /></svg>
                        <span>TitanVault</span>
                    </Link>
                    <div style={S.roleBadge}>Admin Panel</div>
                </div>
                <nav style={S.nav}>
                    <Link href="/admin" style={S.navItem(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                        Dashboard
                    </Link>
                    <Link href="/admin/users" style={S.navItem(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Users
                    </Link>
                    <Link href="/admin/products" style={S.navItem(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                        Products
                    </Link>
                    <Link href="/admin/orders" style={S.navItem(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        Orders
                    </Link>
                </nav>
                <div style={S.sidebarFooter}>
                    <div style={S.userInfo}>
                        <div style={S.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style={S.userName}>{user.name}</div>
                            <div style={S.userEmail}>{user.email}</div>
                        </div>
                    </div>
                    <button style={S.logoutBtn} onClick={() => { logout(); router.push("/"); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            <main style={S.main}>
                <div style={S.headerRow}>
                    <div>
                        <h1 style={S.h1}>Orders Management</h1>
                        <p style={S.subtitle}>Track and manage customer orders.</p>
                    </div>
                    <span style={S.badge}>{allOrders?.length || 0} Total Orders</span>
                </div>

                {message && (
                    <div style={S.message(message.type)}>
                        {message.text}
                        <button style={S.msgClose} onClick={() => setMessage(null)}>×</button>
                    </div>
                )}

                <div style={S.tableWrap}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Order ID</th>
                                <th style={S.th}>Customer</th>
                                <th style={S.th}>Items</th>
                                <th style={S.th}>Total</th>
                                <th style={S.th}>Status</th>
                                <th style={S.th}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!allOrders || allOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={S.tdEmpty as React.CSSProperties}>No orders found.</td>
                                </tr>
                            ) : (
                                allOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td style={{ ...S.td, fontWeight: 700, color: "#ee4d2d" }}>#{order._id.toString().slice(-8).toUpperCase()}</td>
                                        <td style={S.td}>
                                            <div style={{ fontWeight: 700 }}>{order.shippingAddress?.fullName}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>{order.shippingAddress?.phone}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#999", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={`${order.shippingAddress?.address}, ${order.shippingAddress?.city}`}>
                                                {order.shippingAddress?.address}, {order.shippingAddress?.city}
                                            </div>
                                        </td>
                                        <td style={S.td}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                {order.items.map((item, i) => (
                                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: "32px", height: "32px", background: "#f1f3f5", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                                                            {item.image ? (
                                                                <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            ) : (
                                                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🎮</div>
                                                            )}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: "0.8rem", fontWeight: 600, maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.name}>{item.name}</div>
                                                            <div style={{ fontSize: "0.75rem", color: "#999" }}>Qty: {item.quantity}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={S.td}>
                                            <strong style={{ color: "#ee4d2d", fontSize: "1rem" }}>{formatPrice(order.totalAmount)}</strong>
                                        </td>
                                        <td style={S.td}>
                                            <span style={S.statusBadge(order.status || "pending")}>{order.status || "pending"}</span>
                                        </td>
                                        <td style={S.td}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
