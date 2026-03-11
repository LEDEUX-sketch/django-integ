"use client";

import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { Product } from "../../../lib/types";

function formatPrice(price: number) {
    return `₱${price.toLocaleString("en-PH")}`;
}

export default function AdminProductsPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [products, setProducts] = useState<Product[] | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | number | null>(null);
    const [isUpdatingStock, setIsUpdatingStock] = useState<string | number | null>(null);
    
    const [stockModal, setStockModal] = useState<{ isOpen: boolean; productId: string | number | null; currentStock: number }>({
        isOpen: false,
        productId: null,
        currentStock: 0
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | number | null; productName: string }>({
        isOpen: false,
        productId: null,
        productName: ""
    });
    const [newStockValue, setNewStockValue] = useState("");

    const fetchProducts = () => {
        api.products.list({ limit: 1000 }).then(setProducts).catch(() => setProducts([]));
    };

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (mounted && (!user || !isAdmin)) router.push("/");
    }, [mounted, user, isAdmin, router]);

    useEffect(() => {
        if (mounted && user && isAdmin) {
            fetchProducts();
        }
    }, [mounted, user, isAdmin]);

    if (!mounted || !user || !isAdmin || products === null) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <style>{`@keyframes adminspin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ width: 40, height: 40, border: "3px solid #e8e8e8", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "adminspin 0.8s linear infinite" }} />
            </div>
        );
    }

    const openDeleteModal = (productId: string | number, productName: string) => {
        setDeleteModal({ isOpen: true, productId, productName });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.productId) return;

        setIsDeleting(deleteModal.productId);
        try {
            await api.products.deleteProduct(deleteModal.productId);
            setDeleteModal({ isOpen: false, productId: null, productName: "" });
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Error deleting product.");
        } finally {
            setIsDeleting(null);
        }
    };

    const openStockModal = (productId: string | number, currentStock: number) => {
        setStockModal({ isOpen: true, productId, currentStock });
        setNewStockValue(currentStock.toString());
    };

    const handleUpdateStockSubmit = async () => {
        if (!stockModal.productId) return;

        const newStock = parseInt(newStockValue, 10);
        if (isNaN(newStock) || newStock < 0) {
            alert("Invalid stock amount. Please enter a valid number (0 or greater).");
            return;
        }

        setIsUpdatingStock(stockModal.productId);
        try {
            await api.products.updateStock(stockModal.productId, newStock);
            setStockModal({ isOpen: false, productId: null, currentStock: 0 });
            fetchProducts();
        } catch (error) {
            console.error("Failed to update stock:", error);
            alert("Error updating stock.");
        } finally {
            setIsUpdatingStock(null);
        }
    };

    // Shared styles
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
        
        tableContainer: {
            background: "white",
            borderRadius: "14px",
            border: "1px solid #e8e8e8",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse" as const,
        },
        th: {
            textAlign: "left" as const,
            padding: "16px 18px",
            fontSize: "0.76rem",
            fontWeight: 600,
            color: "#999",
            textTransform: "uppercase" as const,
            letterSpacing: 0.5,
            borderBottom: "1px solid #e8e8e8",
            background: "#f8f9fa",
        },
        td: {
            padding: "16px 18px",
            fontSize: "0.88rem",
            color: "#222",
            borderBottom: "1px solid #f3f4f6",
            verticalAlign: "middle" as const,
        },
        btnPrimary: {
            background: "#ee4d2d",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(238,77,45,0.2)"
        },
        actionBtn: {
            padding: "6px 14px",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginRight: "8px",
        },
        modalOverlay: {
            position: "fixed" as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
        },
        modalContent: {
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "400px",
        },
        modalTitle: {
            margin: "0 0 20px 0",
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#1a1a2e",
        },
        modalInput: {
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "1rem",
            marginBottom: "20px",
            outline: "none",
            transition: "border-color 0.2s ease",
        },
        modalActions: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
        },
        btnSecondary: {
            background: "#f1f5f9",
            color: "#64748b",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
        }
    };

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
                    <Link href="/admin/products" style={S.navItem(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                        Products
                    </Link>
                    <Link href="/admin/orders" style={S.navItem(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        Orders
                    </Link>
                </nav>
                <div style={S.sidebarFooter}>
                    <div style={S.userInfo}>
                        <div style={S.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style={S.userName}>{user?.name}</div>
                            <div style={S.userEmail}>{user?.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            <main style={S.main}>
                <div style={S.headerRow}>
                    <div>
                        <h1 style={S.h1}>Products Management</h1>
                        <p style={S.subtitle}>View, manage, and track store inventory.</p>
                    </div>
                    <Link href="/admin/products/new" style={S.btnPrimary}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Product
                    </Link>
                </div>

                <div style={S.tableContainer}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Product</th>
                                <th style={S.th}>Category/Brand</th>
                                <th style={S.th}>Price</th>
                                <th style={S.th}>Stock</th>
                                <th style={S.th}>Status</th>
                                <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#a0aabf" }}>
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product: Product) => (
                                    <tr key={product._id}>
                                        <td style={S.td}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "45px", height: "45px", borderRadius: "8px", background: "#f1f3f5", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        <span style={{ fontSize: "1.2rem" }}>📦</span>
                                                    )}
                                                </div>
                                                <div style={{ fontWeight: 600, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {product.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={S.td}>
                                            <div style={{ fontSize: "0.85rem", color: "#2d3436" }}>{product.category}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#a0aabf" }}>{product.brand}</div>
                                        </td>
                                        <td style={S.td}>
                                            <strong style={{ color: "#2d3436" }}>
                                                {formatPrice(product.price)}
                                            </strong>
                                        </td>
                                        <td style={S.td}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: product.stock <= 0 ? "#e74c3c" : product.stock < 5 ? "#e67e22" : "#2d3436"
                                            }}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <span style={{
                                                display: "inline-block",
                                                padding: "4px 10px",
                                                borderRadius: 20,
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                background: product.stock <= 0 ? "#fef2f2" : "#f0fdf4",
                                                color: product.stock <= 0 ? "#ef4444" : "#22c55e",
                                                border: `1px solid ${product.stock <= 0 ? "#fecaca" : "#bbf7d0"}`
                                            }}>
                                                {product.stock <= 0 ? "Sold Out" : "In Stock"}
                                            </span>
                                        </td>
                                        <td style={{ ...S.td, textAlign: "right" }}>
                                            <button
                                                onClick={() => openStockModal(product._id, product.stock)}
                                                disabled={isUpdatingStock === product._id}
                                                style={{
                                                    ...S.actionBtn,
                                                    background: "#e0f2fe",
                                                    color: "#0369a1",
                                                    opacity: isUpdatingStock === product._id ? 0.5 : 1
                                                }}
                                            >
                                                {isUpdatingStock === product._id ? "..." : "Stock"}
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(product._id, product.name)}
                                                disabled={isDeleting === product._id}
                                                style={{
                                                    ...S.actionBtn,
                                                    background: "#fee2e2",
                                                    color: "#b91c1c",
                                                    marginRight: 0,
                                                    opacity: isDeleting === product._id ? 0.5 : 1
                                                }}
                                            >
                                                {isDeleting === product._id ? "..." : "Delete"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Stock Update Modal */}
            {stockModal.isOpen && (
                <div style={S.modalOverlay} onClick={() => setStockModal({ isOpen: false, productId: null, currentStock: 0 })}>
                    <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={S.modalTitle}>Update Product Stock</h3>
                        <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "16px" }}>
                            Current stock: <strong>{stockModal.currentStock}</strong>
                        </p>
                        <input
                            type="number"
                            min="0"
                            style={S.modalInput}
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdateStockSubmit();
                                if (e.key === "Escape") setStockModal({ isOpen: false, productId: null, currentStock: 0 });
                            }}
                        />
                        <div style={S.modalActions}>
                            <button style={S.btnSecondary} onClick={() => setStockModal({ isOpen: false, productId: null, currentStock: 0 })}>
                                Cancel
                            </button>
                            <button
                                style={{ ...S.btnPrimary, background: "#1a1a2e", boxShadow: "0 4px 12px rgba(26,26,46,0.2)" }}
                                onClick={handleUpdateStockSubmit}
                                disabled={isUpdatingStock === stockModal.productId}
                            >
                                {isUpdatingStock === stockModal.productId ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div style={S.modalOverlay} onClick={() => setDeleteModal({ isOpen: false, productId: null, productName: "" })}>
                    <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </div>
                            <h3 style={S.modalTitle}>Delete Product?</h3>
                            <p style={{ fontSize: "0.95rem", color: "#64748b", lineHeight: 1.5 }}>
                                Are you sure you want to delete <strong style={{ color: "#1a1a2e" }}>{deleteModal.productName}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div style={{ ...S.modalActions, justifyContent: "stretch", flexDirection: "column" as const, gap: "10px" }}>
                            <button
                                style={{ ...S.btnPrimary, background: "#ef4444", justifyContent: "center", boxShadow: "0 4px 12px rgba(239,68,68,0.2)" }}
                                onClick={handleConfirmDelete}
                                disabled={isDeleting !== null}
                            >
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                            <button
                                style={{ ...S.btnSecondary, padding: "12px", textAlign: "center" }}
                                onClick={() => setDeleteModal({ isOpen: false, productId: null, productName: "" })}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
