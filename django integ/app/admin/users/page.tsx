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
    userCell: { display: "flex", alignItems: "center", gap: 10 } as React.CSSProperties,
    avatarSm: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #ee4d2d, #ff6f4e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.72rem", flexShrink: 0 } as React.CSSProperties,
    statusBadge: (status: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            active: { bg: "#ecfdf5", color: "#065f46" },
            banned: { bg: "#fef2f2", color: "#991b1b" },
            suspended: { bg: "#fffbeb", color: "#92400e" },
        };
        const c = colors[status] || colors.active;
        return { display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize", background: c.bg, color: c.color } as React.CSSProperties;
    },
    actionBtns: { display: "flex", gap: 6 } as React.CSSProperties,
    actionBtn: (type: string) => {
        const colors: Record<string, { bg: string; color: string; border: string }> = {
            ban: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
            suspend: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
            unban: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
            reactivate: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
        };
        const c = colors[type] || colors.ban;
        return { padding: "5px 14px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: `1px solid ${c.border}`, background: c.bg, color: c.color, transition: "all 0.15s ease" } as React.CSSProperties;
    },
    message: (type: "success" | "error") => ({
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderRadius: 10, marginBottom: 20, fontSize: "0.88rem", fontWeight: 500,
        background: type === "success" ? "#ecfdf5" : "#fef2f2",
        color: type === "success" ? "#065f46" : "#991b1b",
        border: `1px solid ${type === "success" ? "#a7f3d0" : "#fecaca"}`,
    }) as React.CSSProperties,
    msgClose: { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "inherit", opacity: 0.7, padding: "0 4px" } as React.CSSProperties,
};

type AdminUser = { _id: string; name: string; email: string; role: string; status: string; createdAt: number; suspendedUntil?: number };

export default function AdminUsersPage() {
    const { user, isAdmin, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [allUsers, setAllUsers] = useState<AdminUser[] | null>(null);
    const [suspendModal, setSuspendModal] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: "", userName: "" });
    const [suspendDuration, setSuspendDuration] = useState<string>("24");
    const [customDuration, setCustomDuration] = useState<string>("");

    const fetchUsers = () => { api.users.listAll().then(setAllUsers).catch(() => setAllUsers([])); };

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (mounted && (!user || !isAdmin)) router.push("/");
    }, [mounted, user, isAdmin, router]);
    useEffect(() => { fetchUsers(); }, []);

    const handleAction = async (action: "ban" | "unban" | "suspend" | "reactivate", userId: string, durationHours?: number) => {
        setActionLoading(userId + action);
        setMessage(null);
        try {
            if (action === "ban") await api.users.banUser(userId);
            else if (action === "unban") await api.users.unbanUser(userId);
            else if (action === "suspend") await api.users.suspendUser(userId, durationHours);
            else if (action === "reactivate") await api.users.reactivateUser(userId);
            setMessage({ type: "success", text: `User ${action}${action.endsWith("e") ? "d" : "ned"} successfully.` });
            fetchUsers();
        } catch (err: unknown) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "Action failed." });
        } finally { setActionLoading(null); }
    };

    const handleSuspendSubmit = () => {
        const hours = suspendDuration === "custom" ? parseFloat(customDuration) : parseFloat(suspendDuration);
        if (isNaN(hours) || hours <= 0) {
            setMessage({ type: "error", text: "Please enter a valid duration." });
            return;
        }
        setSuspendModal({ open: false, userId: "", userName: "" });
        handleAction("suspend", suspendModal.userId, hours);
    };

    const formatRemaining = (until: number) => {
        const diff = until - Date.now();
        if (diff <= 0) return "Expired";
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (d > 0) return `${d}d ${h}h left`;
        if (h > 0) return `${h}h ${m}m left`;
        return `${m}m left`;
    };

    if (!mounted || !user || !isAdmin) {
        return (
            <>
                <style>{`@keyframes adminspin { to { transform: rotate(360deg); } }`}</style>
                <div style={S.loading}><div style={S.spinner} /></div>
            </>
        );
    }

    const regularUsers = allUsers?.filter((u) => u.role !== "admin") ?? [];

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
                    <Link href="/admin/users" style={S.navItem(true)}>
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
                        <h1 style={S.h1}>User Management</h1>
                        <p style={S.subtitle}>View and manage all registered users.</p>
                    </div>
                    <span style={S.badge}>{regularUsers.length} Users</span>
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
                                <th style={S.th}>Name</th>
                                <th style={S.th}>Email</th>
                                <th style={S.th}>Status</th>
                                <th style={S.th}>Joined</th>
                                <th style={S.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regularUsers.length === 0 ? (
                                <tr><td colSpan={5} style={S.tdEmpty as React.CSSProperties}>No registered users yet.</td></tr>
                            ) : (
                                regularUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td style={S.td}>
                                            <div style={S.userCell}>
                                                <div style={S.avatarSm}>{u.name.charAt(0).toUpperCase()}</div>
                                                {u.name}
                                            </div>
                                        </td>
                                        <td style={S.td}>{u.email}</td>
                                        <td style={S.td}>
                                            <span style={S.statusBadge(u.status)}>{u.status}</span>
                                            {u.status === "suspended" && u.suspendedUntil && (
                                                <div style={{ fontSize: "0.7rem", color: "#92400e", marginTop: 4, fontWeight: 500 }}>
                                                    ⏱ {formatRemaining(u.suspendedUntil)}
                                                </div>
                                            )}
                                        </td>
                                        <td style={S.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td style={S.td}>
                                            <div style={S.actionBtns}>
                                                {u.status === "active" && (
                                                    <>
                                                        <button style={S.actionBtn("ban")} onClick={() => handleAction("ban", u._id)} disabled={actionLoading === u._id + "ban"}>
                                                            {actionLoading === u._id + "ban" ? "..." : "Ban"}
                                                        </button>
                                                        <button style={S.actionBtn("suspend")} onClick={() => { setSuspendDuration("24"); setCustomDuration(""); setSuspendModal({ open: true, userId: u._id, userName: u.name }); }} disabled={actionLoading === u._id + "suspend"}>
                                                            {actionLoading === u._id + "suspend" ? "..." : "Suspend"}
                                                        </button>
                                                    </>
                                                )}
                                                {u.status === "banned" && (
                                                    <button style={S.actionBtn("unban")} onClick={() => handleAction("unban", u._id)} disabled={actionLoading === u._id + "unban"}>
                                                        {actionLoading === u._id + "unban" ? "..." : "Unban"}
                                                    </button>
                                                )}
                                                {u.status === "suspended" && (
                                                    <button style={S.actionBtn("reactivate")} onClick={() => handleAction("reactivate", u._id)} disabled={actionLoading === u._id + "reactivate"}>
                                                        {actionLoading === u._id + "reactivate" ? "..." : "Reactivate"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* ─── Suspension Duration Modal ─── */}
            {suspendModal.open && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSuspendModal({ open: false, userId: "", userName: "" })}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: "32px", width: "90%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#222", marginBottom: 4 }}>Suspend User</h3>
                        <p style={{ fontSize: "0.88rem", color: "#757575", marginBottom: 20 }}>Set suspension duration for <strong>{suspendModal.userName}</strong></p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                            {[
                                { label: "1 Hour", value: "1" },
                                { label: "6 Hours", value: "6" },
                                { label: "12 Hours", value: "12" },
                                { label: "24 Hours", value: "24" },
                                { label: "3 Days", value: "72" },
                                { label: "7 Days", value: "168" },
                                { label: "30 Days", value: "720" },
                                { label: "Custom", value: "custom" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSuspendDuration(opt.value)}
                                    style={{
                                        padding: "10px 8px",
                                        borderRadius: 8,
                                        border: `2px solid ${suspendDuration === opt.value ? "#d97706" : "#e8e8e8"}`,
                                        background: suspendDuration === opt.value ? "#fffbeb" : "#fff",
                                        color: suspendDuration === opt.value ? "#d97706" : "#555",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {suspendDuration === "custom" && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Duration in hours:</label>
                                <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(e.target.value)}
                                    placeholder="e.g. 48"
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e8e8e8", fontSize: "0.92rem", outline: "none", boxSizing: "border-box" }}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button
                                onClick={() => setSuspendModal({ open: false, userId: "", userName: "" })}
                                style={{ flex: 1, padding: "11px", borderRadius: 8, border: "1px solid #e8e8e8", background: "#f8f9fa", color: "#555", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspendSubmit}
                                style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #d97706, #f59e0b)", color: "#fff", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                            >
                                ⏱ Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
