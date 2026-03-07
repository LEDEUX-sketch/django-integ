"use client";

import { useAuth } from "../../../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { api } from "../../../../lib/api";
import Link from "next/link";

type Category = "action-figures" | "statues" | "model-kits" | "diecast" | "plush-collectibles";
type Condition = "mint-in-box" | "new" | "like-new" | "used";

/* ——— inline styles ——— */
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
    h1: { fontSize: "1.65rem", fontWeight: 700, color: "#222", marginBottom: 4 } as React.CSSProperties,
    subtitle: { color: "#757575", fontSize: "0.92rem", marginBottom: 28 } as React.CSSProperties,
    loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f0f2f5" } as React.CSSProperties,
    spinner: { width: 40, height: 40, border: "3px solid #e8e8e8", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "adminspin 0.8s linear infinite" } as React.CSSProperties,
    formCard: { background: "#fff", borderRadius: 14, padding: 32, border: "1px solid #e8e8e8" } as React.CSSProperties,
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 } as React.CSSProperties,
    formGroup: { display: "flex", flexDirection: "column", gap: 6 } as React.CSSProperties,
    formGroupFull: { display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" } as React.CSSProperties,
    label: { fontSize: "0.85rem", fontWeight: 600, color: "#222" } as React.CSSProperties,
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#f5f5f5", color: "#222", boxSizing: "border-box" } as React.CSSProperties,
    select: { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#f5f5f5", color: "#222", cursor: "pointer", boxSizing: "border-box" } as React.CSSProperties,
    textarea: { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#f5f5f5", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" } as React.CSSProperties,
    fieldError: { color: "#ef4444", fontSize: "0.75rem" } as React.CSSProperties,
    imgPreview: { marginTop: 8, width: 120, height: 120, borderRadius: 8, border: "1px solid #e8e8e8", overflow: "hidden", background: "#f8f8f8" } as React.CSSProperties,
    imgPreviewImg: { width: "100%", height: "100%", objectFit: "contain" } as React.CSSProperties,
    formActions: { marginTop: 28, display: "flex", justifyContent: "flex-end" } as React.CSSProperties,
    submitBtn: { padding: "12px 36px", background: "#ee4d2d", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease" } as React.CSSProperties,
    submitBtnDisabled: { padding: "12px 36px", background: "#ee4d2d", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.95rem", fontWeight: 600, cursor: "not-allowed", opacity: 0.6 } as React.CSSProperties,
    message: (type: "success" | "error") => ({
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderRadius: 10, marginBottom: 20, fontSize: "0.88rem", fontWeight: 500,
        background: type === "success" ? "#ecfdf5" : "#fef2f2",
        color: type === "success" ? "#065f46" : "#991b1b",
        border: `1px solid ${type === "success" ? "#a7f3d0" : "#fecaca"}`,
    }) as React.CSSProperties,
    msgClose: { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "inherit", opacity: 0.7, padding: "0 4px" } as React.CSSProperties,
};

export default function AddProductPage() {
    const { user, isAdmin, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        name: "", price: "", category: "" as Category | "", stock: "", brand: "",
        condition: "" as Condition | "", imageUrl: "", shortDescription: "", description: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (mounted && (!user || !isAdmin)) router.push("/"); }, [mounted, user, isAdmin, router]);

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!formData.name.trim()) e.name = "Product name is required.";
        if (!formData.price || Number(formData.price) <= 0) e.price = "Enter a valid price.";
        if (!formData.category) e.category = "Select a category.";
        if (!formData.stock || Number(formData.stock) < 0) e.stock = "Enter a valid stock quantity.";
        if (!formData.brand.trim()) e.brand = "Brand is required.";
        if (!formData.condition) e.condition = "Select a condition.";
        if (!formData.shortDescription.trim()) e.shortDescription = "Short description is required.";
        if (!formData.description.trim()) e.description = "Description is required.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true); setSuccessMsg("");
        try {
            await api.products.createProduct({
                name: formData.name, price: Number(formData.price), category: formData.category,
                stock: Number(formData.stock), brand: formData.brand, condition: formData.condition,
                images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
                description: formData.description, shortDescription: formData.shortDescription,
            });
            setSuccessMsg("Product created successfully!");
            setFormData({ name: "", price: "", category: "", stock: "", brand: "", condition: "", imageUrl: "", shortDescription: "", description: "" });
            setErrors({});
        } catch (err: unknown) {
            setErrors({ submit: err instanceof Error ? err.message : "Failed to create product." });
        } finally { setLoading(false); }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((p) => ({ ...p, [field]: value }));
        if (errors[field]) setErrors((p) => { const c = { ...p }; delete c[field]; return c; });
    };

    if (!mounted || !user || !isAdmin) {
        return (<><style>{`@keyframes adminspin { to { transform: rotate(360deg); } }`}</style><div style={S.loading}><div style={S.spinner} /></div></>);
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
                    <Link href="/admin/products/new" style={S.navItem(true)}>
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
                <h1 style={S.h1}>Add New Product</h1>
                <p style={S.subtitle}>Fill in the details to add a new product to the store.</p>

                {successMsg && (
                    <div style={S.message("success")}>{successMsg}<button style={S.msgClose} onClick={() => setSuccessMsg("")}>×</button></div>
                )}
                {errors.submit && (
                    <div style={S.message("error")}>{errors.submit}<button style={S.msgClose} onClick={() => setErrors((p) => { const c = { ...p }; delete c.submit; return c; })}>×</button></div>
                )}

                <form onSubmit={handleSubmit} style={S.formCard}>
                    <div style={S.formGrid}>
                        <div style={S.formGroup}>
                            <label style={S.label}>Product Name *</label>
                            <input style={S.input} type="text" placeholder="e.g. Hot Toys Iron Man Mark LXXXV" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                            {errors.name && <span style={S.fieldError}>{errors.name}</span>}
                        </div>
                        <div style={S.formGroup}>
                            <label style={S.label}>Price (₱) *</label>
                            <input style={S.input} type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => handleChange("price", e.target.value)} />
                            {errors.price && <span style={S.fieldError}>{errors.price}</span>}
                        </div>
                        <div style={S.formGroup}>
                            <label style={S.label}>Category *</label>
                            <select style={S.select} value={formData.category} onChange={(e) => handleChange("category", e.target.value)}>
                                <option value="">Select category</option>
                                <option value="action-figures">Action Figures</option>
                                <option value="statues">Statues</option>
                                <option value="model-kits">Model Kits</option>
                                <option value="diecast">Die-Cast</option>
                                <option value="plush-collectibles">Plush &amp; Collectibles</option>
                            </select>
                            {errors.category && <span style={S.fieldError}>{errors.category}</span>}
                        </div>
                        <div style={S.formGroup}>
                            <label style={S.label}>Stock Quantity *</label>
                            <input style={S.input} type="number" placeholder="0" value={formData.stock} onChange={(e) => handleChange("stock", e.target.value)} />
                            {errors.stock && <span style={S.fieldError}>{errors.stock}</span>}
                        </div>
                        <div style={S.formGroup}>
                            <label style={S.label}>Brand *</label>
                            <input style={S.input} type="text" placeholder="e.g. Hot Toys, Bandai, NECA" value={formData.brand} onChange={(e) => handleChange("brand", e.target.value)} />
                            {errors.brand && <span style={S.fieldError}>{errors.brand}</span>}
                        </div>
                        <div style={S.formGroup}>
                            <label style={S.label}>Condition *</label>
                            <select style={S.select} value={formData.condition} onChange={(e) => handleChange("condition", e.target.value)}>
                                <option value="">Select condition</option>
                                <option value="new">New</option>
                                <option value="mint-in-box">Mint in Box</option>
                                <option value="like-new">Like New</option>
                                <option value="used">Used</option>
                            </select>
                            {errors.condition && <span style={S.fieldError}>{errors.condition}</span>}
                        </div>
                        <div style={S.formGroupFull}>
                            <label style={S.label}>Product Image URL</label>
                            <input style={S.input} type="url" placeholder="https://example.com/image.jpg" value={formData.imageUrl} onChange={(e) => handleChange("imageUrl", e.target.value)} />
                            {formData.imageUrl && (
                                <div style={S.imgPreview}>
                                    <img style={S.imgPreviewImg as React.CSSProperties} src={formData.imageUrl} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                </div>
                            )}
                        </div>
                        <div style={S.formGroupFull}>
                            <label style={S.label}>Short Description *</label>
                            <input style={S.input} type="text" placeholder="Brief product summary (shown in product lists)" value={formData.shortDescription} onChange={(e) => handleChange("shortDescription", e.target.value)} />
                            {errors.shortDescription && <span style={S.fieldError}>{errors.shortDescription}</span>}
                        </div>
                        <div style={S.formGroupFull}>
                            <label style={S.label}>Full Description *</label>
                            <textarea style={S.textarea as React.CSSProperties} placeholder="Detailed product description..." rows={4} value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
                            {errors.description && <span style={S.fieldError}>{errors.description}</span>}
                        </div>
                    </div>
                    <div style={S.formActions}>
                        <button type="submit" style={loading ? S.submitBtnDisabled : S.submitBtn} disabled={loading}>
                            {loading ? "Creating Product..." : "Create Product"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
