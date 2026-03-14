"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { Product } from "../../../lib/types";
import { useAuth } from "../../AuthContext";
import AuthModal from "../../AuthModal";
import Header from "../../Header";
import Footer from "../../Footer";
import Link from "next/link";

function formatPrice(price: number) {
    return `₱${price.toLocaleString("en-PH")}`;
}

export default function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [showAuth, setShowAuth] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [product, setProduct] = useState<Product | null | undefined>(undefined);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);

    useEffect(() => {
        api.products.getById(id).then(setProduct).catch(() => setProduct(null));
    }, [id]);

    useEffect(() => {
        if (user && product) {
            // Check if purchased
            api.orders.getByUser(user.userId).then((orders: any[]) => {
                const bought = orders.some(order => 
                    order.status === 'completed' && 
                    order.items.some((item: any) => String(item.productId) === String(id))
                );
                setHasPurchased(bought);
            });
            
            // Check if already reviewed
            const reviewed = product.reviews?.some(r => String(r.userId) === String(user.userId));
            setAlreadyReviewed(!!reviewed);
        }
    }, [user, product, id]);

    const handleAddToCart = async () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        try {
            await api.cart.add({
                userId: user.userId,
                productId: id,
                quantity: 1,
            });
            window.dispatchEvent(new Event("cartUpdated"));
            setToast("Added to cart!");
            setTimeout(() => setToast(null), 3000);
        } catch (err: unknown) {
            setToast(err instanceof Error ? err.message : "Error adding to cart");
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        try {
            await api.cart.add({
                userId: user.userId,
                productId: id,
                quantity: 1,
            });
            window.dispatchEvent(new Event("cartUpdated"));
            router.push("/checkout");
        } catch (err: unknown) {
            setToast(err instanceof Error ? err.message : "Error adding to cart");
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setShowAuth(true);
            return;
        }
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            await api.products.addReview({
                userId: user.userId,
                productId: id,
                rating,
                comment,
            });
            setComment("");
            setRating(5);
            // Refresh product to show new review
            const updated = await api.products.getById(id);
            setProduct(updated);
            setToast("Review submitted successfully!");
        } catch (err: unknown) {
            setToast(err instanceof Error ? err.message : "Failed to submit review");
        } finally {
            setSubmitting(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    if (product === undefined) {
        return (
            <>
                <Header
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                    activeCategory={null}
                    onCategoryChange={() => { }}
                />
                <div className="loading-spinner">
                    <div className="spinner" />
                </div>
            </>
        );
    }

    if (!product) {
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
                        <div className="empty-state-icon">😕</div>
                        <h3>Product not found</h3>
                        <p>This product may have been removed or doesn&apos;t exist.</p>
                        <Link href="/" className="btn-secondary">
                            ← Back to Shop
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const discount = product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
        : null;

    return (
        <>
            <Header
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                activeCategory={null}
                onCategoryChange={() => { }}
            />

            <div className="page-container">
                <div style={{ marginBottom: 16, fontSize: "0.85rem" }}>
                    <Link href="/" style={{ color: "var(--primary)", textDecoration: "none" }}>
                        ← Back to Shop
                    </Link>
                </div>

                <div className="product-detail">
                    <div className="product-detail-img">
                        {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} />
                        ) : (
                            <span>🎮</span>
                        )}
                    </div>

                    <div className="product-detail-info">
                        <h1>{product.name}</h1>

                        <div className="product-detail-rating">
                            ⭐ <strong>{product.rating.toFixed(1)}</strong> ({product.ratingCount}{" "}
                            ratings) &nbsp;|&nbsp; {product.sold.toLocaleString()} sold
                        </div>

                        <div className="product-detail-price-box">
                            <span className="product-detail-price">
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                                <span className="product-detail-original">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                            {discount && (
                                <span
                                    className="product-card-discount"
                                    style={{ marginLeft: 8, fontSize: "0.85rem" }}
                                >
                                    -{discount}% OFF
                                </span>
                            )}
                        </div>

                        <dl className="product-detail-spec">
                            <dt>Brand</dt>
                            <dd>{product.brand}</dd>
                            <dt>Category</dt>
                            <dd>{product.category.replace(/-/g, " ")}</dd>
                            <dt>Condition</dt>
                            <dd>{product.condition.replace(/-/g, " ")}</dd>
                            {product.series && (
                                <>
                                    <dt>Series</dt>
                                    <dd>{product.series}</dd>
                                </>
                            )}
                            <dt>Stock</dt>
                            <dd>
                                {product.stock > 0 ? (
                                    <span style={{ color: "var(--accent-green)" }}>
                                        {product.stock} left
                                    </span>
                                ) : (
                                    <span style={{ color: "var(--accent-red)" }}>Out of stock</span>
                                )}
                            </dd>
                        </dl>

                        <div className="product-detail-tags">
                            {product.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>

                        <p className="product-detail-desc">{product.description}</p>

                        <div className="product-detail-actions">
                            <button
                                className="btn-add-cart"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                🛒 Add to Cart
                            </button>
                            <button
                                className="btn-buy-now"
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                <div className="product-reviews-section">
                    <h2>Customer Reviews</h2>

                    {user && hasPurchased && !alreadyReviewed && (
                        <form onSubmit={handleReviewSubmit} className="review-form">
                            <h3>Write a Review</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                You purchased this item. Share your experience!
                            </p>
                            <div className="rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setRating(star)}
                                        style={{ cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.1s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {star <= rating ? "⭐" : "☆"}
                                    </span>
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about this product..."
                                required
                            />
                            <button type="submit" className="btn-primary" disabled={submitting} style={{ width: 'auto', padding: '10px 24px' }}>
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    )}

                    <div className="reviews-list">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review) => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <strong>{review.userName}</strong>
                                        <span className="review-stars">
                                            {"⭐".repeat(review.rating)}
                                        </span>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                    <small className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString("en-PH", {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </small>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state" style={{ padding: '20px 0' }}>
                                <p>No reviews yet. Be the first to review this product!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />

            {toast && (
                <div className={`toast ${toast.includes("Error") ? "toast-error" : "toast-success"}`}>
                    {toast}
                </div>
            )}

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
    );
}
