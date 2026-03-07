"use client";

import { useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Product } from "../../lib/types";
import Link from "next/link";

/* ——— inline style objects ——— */
const S = {
    layout: {
        display: "flex",
        minHeight: "100vh",
        background: "#f0f2f5",
        fontFamily: "'Inter', system-ui, sans-serif",
    } as React.CSSProperties,
    sidebar: { width: 260, background: "#ffffff", borderRight: "1px solid #e8e8e8", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto", boxShadow: "2px 0 12px rgba(0,0,0,0.04)", flexShrink: 0 } as React.CSSProperties,
    sidebarHeader: { padding: "24px 20px 16px", borderBottom: "1px solid #e8e8e8" } as React.CSSProperties,
    logo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#222", fontSize: "1.25rem", fontWeight: 800, letterSpacing: -0.5 } as React.CSSProperties,
    roleBadge: { display: "inline-block", background: "linear-gradient(135deg, #1a1a2e, #16213e)", color: "#fff", padding: "3px 14px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, marginTop: 10 } as React.CSSProperties,
    nav: { flex: 1, padding: "16px 0" } as React.CSSProperties,
    navItem: (active: boolean) => ({ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", color: active ? "#ee4d2d" : "#757575", textDecoration: "none", fontSize: "0.88rem", fontWeight: active ? 600 : 500, borderLeft: `3px solid ${active ? "#ee4d2d" : "transparent"}`, background: active ? "rgba(238,77,45,0.07)" : "transparent", transition: "all 0.15s ease" }) as React.CSSProperties,
    sidebarFooter: { padding: "16px 20px", borderTop: "1px solid #e8e8e8" } as React.CSSProperties,
    userInfo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } as React.CSSProperties,
    avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #ee4d2d, #ff6f4e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 } as React.CSSProperties,
    userName: { fontSize: "0.85rem", fontWeight: 600, color: "#222" } as React.CSSProperties,
    userEmail: { fontSize: "0.72rem", color: "#999" } as React.CSSProperties,
    logoutBtn: { display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 12px", background: "none", border: "1px solid #e8e8e8", borderRadius: 8, color: "#757575", fontSize: "0.82rem", cursor: "pointer", transition: "all 0.15s ease" } as React.CSSProperties,
    main: { flex: 1, padding: "32px 40px", overflowY: "auto", minWidth: 0 } as React.CSSProperties,
    headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 } as React.CSSProperties,
    h1: { fontSize: "1.65rem", fontWeight: 700, color: "#222", marginBottom: 4 } as React.CSSProperties,
    subtitle: { color: "#757575", fontSize: "0.92rem" } as React.CSSProperties,
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 36 } as React.CSSProperties,
    statCard: { background: "#fff", borderRadius: 14, padding: "22px 20px", display: "flex", alignItems: "center", gap: 16, border: "1px solid #e8e8e8", transition: "all 0.2s ease", cursor: "default" } as React.CSSProperties,
    statIcon: (bg: string, color: string) => ({ width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color, flexShrink: 0 }) as React.CSSProperties,
    statLabel: { display: "block", fontSize: "0.76rem", color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 } as React.CSSProperties,
    statValue: { display: "block", fontSize: "1.5rem", fontWeight: 800, color: "#222" } as React.CSSProperties,
    sectionTitle: { fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, color: "#222" } as React.CSSProperties,
    actionsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 } as React.CSSProperties,
    actionCard: { background: "#fff", borderRadius: 14, padding: "28px 24px", border: "1px solid #e8e8e8", textDecoration: "none", color: "#222", display: "block", transition: "all 0.2s ease" } as React.CSSProperties,
    actionCardH3: { fontSize: "1rem", fontWeight: 600, marginBottom: 4, marginTop: 14 } as React.CSSProperties,
    actionCardP: { fontSize: "0.82rem", color: "#757575", lineHeight: 1.5 } as React.CSSProperties,
    loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f0f2f5" } as React.CSSProperties,
    spinner: { width: 40, height: 40, border: "3px solid #e8e8e8", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "adminspin 0.8s linear infinite" } as React.CSSProperties,
};

type AdminUser = { _id: string; name: string; email: string; role: string; status: string; createdAt: number };

export default function AdminDashboard() {
    const { user, isAdmin, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [allUsers, setAllUsers] = useState<AdminUser[] | null>(null);
    const [allProducts, setAllProducts] = useState<Product[] | null>(null);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (mounted && (!user || !isAdmin)) router.push("/");
    }, [mounted, user, isAdmin, router]);

    useEffect(() => {
        api.users.listAll().then(setAllUsers).catch(() => setAllUsers([]));
        api.products.list({ limit: 1000 }).then(setAllProducts).catch(() => setAllProducts([]));
    }, []);

    if (!mounted || !user || !isAdmin) {
        return (
            <>
                <style>{`@keyframes adminspin { to { transform: rotate(360deg); } }`}</style>
                <div style={S.loading}><div style={S.spinner} /></div>
            </>
        );
    }

    const totalUsers = allUsers?.filter((u) => u.role !== "admin").length ?? 0;
    const activeUsers = allUsers?.filter((u) => u.role !== "admin" && u.status === "active").length ?? 0;
    const bannedUsers = allUsers?.filter((u) => u.status === "banned").length ?? 0;
    const suspendedUsers = allUsers?.filter((u) => u.status === "suspended").length ?? 0;
    const totalProducts = allProducts?.length ?? 0;

    const stats = [
        { label: "Total Users", value: totalUsers, bg: "#e8f4fd", color: "#3b82f6", icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />, icon2: <circle cx="9" cy="7" r="4" /> },
        { label: "Active", value: activeUsers, bg: "#ecfdf5", color: "#22c55e", icon: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />, icon2: <polyline points="22 4 12 14.01 9 11.01" /> },
        { label: "Banned", value: bannedUsers, bg: "#fef2f2", color: "#ef4444", icon: <circle cx="12" cy="12" r="10" />, icon2: <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /> },
        { label: "Suspended", value: suspendedUsers, bg: "#fffbeb", color: "#f59e0b", icon: <circle cx="12" cy="12" r="10" />, icon2: <><line x1="10" y1="15" x2="10" y2="9" /><line x1="14" y1="15" x2="14" y2="9" /></> },
        { label: "Products", value: totalProducts, bg: "#f5f3ff", color: "#8b5cf6", icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />, icon2: <><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></> },
    ];

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
                    <Link href="/admin" style={S.navItem(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                        Dashboard
                    </Link>
                    <Link href="/admin/users" style={S.navItem(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Users
                    </Link>
                    <Link href="/admin/products/new" style={S.navItem(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                        Add Product
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
                        <h1 style={S.h1}>Dashboard</h1>
                        <p style={S.subtitle}>Welcome back, {user.name}. Here&apos;s an overview of your store.</p>
                    </div>
                </div>

                <div style={S.statsGrid}>
                    {stats.map((s) => (
                        <div key={s.label} style={S.statCard}>
                            <div style={S.statIcon(s.bg, s.color)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{s.icon}{s.icon2}</svg>
                            </div>
                            <div>
                                <span style={S.statLabel}>{s.label}</span>
                                <span style={S.statValue}>{s.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 style={S.sectionTitle}>Quick Actions</h2>
                <div style={S.actionsGrid}>
                    <Link href="/admin/users" style={S.actionCard}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        <h3 style={S.actionCardH3}>Manage Users</h3>
                        <p style={S.actionCardP}>View, ban, suspend, and manage user accounts</p>
                    </Link>
                    <Link href="/admin/products/new" style={S.actionCard}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        <h3 style={S.actionCardH3}>Add New Product</h3>
                        <p style={S.actionCardP}>Add a new product listing to the store</p>
                    </Link>
                    <Link href="/" style={S.actionCard}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        <h3 style={S.actionCardH3}>View Storefront</h3>
                        <p style={S.actionCardP}>Go to the main store page</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
