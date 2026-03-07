"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { CartItem } from "../../lib/types";
import { useAuth } from "../AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import Link from "next/link";

function formatPrice(price: number) {
    return `₱${price.toLocaleString("en-PH")}`;
}

export default function CartPage() {
    const { user } = useAuth();
    const [toast, setToast] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [cartItems, setCartItems] = useState<CartItem[] | undefined>(undefined);

    const fetchCart = useCallback(() => {
        if (!user) return;
        api.cart.get(user.userId).then(setCartItems).catch(() => setCartItems([]));
    }, [user]);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const handleQuantityChange = async (cartItemId: number, newQty: number) => {
        try {
            await api.cart.updateQuantity({ cartItemId, quantity: newQty });
            window.dispatchEvent(new Event("cartUpdated"));
            fetchCart();
        } catch (err: unknown) {
            setToast(err instanceof Error ? err.message : "Error");
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleRemove = async (cartItemId: number) => {
        try {
            await api.cart.remove({ cartItemId });
            window.dispatchEvent(new Event("cartUpdated"));
            setToast("Item removed from cart");
            fetchCart();
            setTimeout(() => setToast(null), 3000);
        } catch (err: unknown) {
            setToast(err instanceof Error ? err.message : "Error");
            setTimeout(() => setToast(null), 3000);
        }
    };

    const subtotal =
        cartItems?.reduce(
            (sum, item) =>
                sum + (item.product ? item.product.price * item.quantity : 0),
            0
        ) ?? 0;

    const shippingFee = subtotal > 5000 ? 0 : 150;
    const total = subtotal + shippingFee;

    if (!user) {
        return (
            <>
                <Header
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                    activeCategory={null}
                    onCategoryChange={() => { }}
                />
                <div className="page-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔒</div>
                        <h3>Sign in to view your cart</h3>
                        <p>You need to be logged in to manage your shopping cart.</p>
                        <Link href="/" className="btn-secondary">
                            ← Go to Shop
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                activeCategory={null}
                onCategoryChange={() => { }}
            />

            <div className="page-container">
                <h1 className="page-title">🛒 Shopping Cart</h1>

                {cartItems === undefined ? (
                    <div className="loading-spinner">
                        <div className="spinner" />
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Start adding some awesome collectibles!</p>
                        <Link href="/" className="btn-secondary">
                            ← Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item._id} className="cart-item">
                                    <div className="cart-item-img">
                                        {item.product?.images[0] ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                            />
                                        ) : (
                                            <span>🎮</span>
                                        )}
                                    </div>

                                    <div className="cart-item-details">
                                        <Link
                                            href={`/product/${item.productId}`}
                                            className="cart-item-name"
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            {item.product?.name}
                                        </Link>
                                        <p className="cart-item-brand">{item.product?.brand}</p>
                                        <p className="cart-item-price">
                                            {item.product && formatPrice(item.product.price)}
                                        </p>

                                        <div className="quantity-control">
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item._id,
                                                        item.quantity - 1
                                                    )
                                                }
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item._id,
                                                        item.quantity + 1
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        className="cart-item-remove"
                                        onClick={() => handleRemove(item._id)}
                                        title="Remove item"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping Fee</span>
                                <span>
                                    {shippingFee === 0 ? (
                                        <span style={{ color: "var(--accent-green)" }}>FREE</span>
                                    ) : (
                                        formatPrice(shippingFee)
                                    )}
                                </span>
                            </div>
                            {shippingFee > 0 && (
                                <div
                                    className="summary-row"
                                    style={{ fontSize: "0.78rem", color: "var(--accent-green)" }}
                                >
                                    <span>Free shipping for orders above ₱5,000</span>
                                </div>
                            )}
                            <div className="summary-total">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <Link href="/checkout">
                                <button className="checkout-btn">Proceed to Checkout</button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {toast && (
                <div
                    className={`toast ${toast.includes("Error") ? "toast-error" : "toast-success"}`}
                >
                    {toast}
                </div>
            )}
        </>
    );
}
