"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Product } from "../lib/types";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Footer from "./Footer";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[] | undefined>(undefined);
  const [featuredProducts, setFeaturedProducts] = useState<Product[] | undefined>(undefined);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[] | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<Product[] | undefined>(undefined);

  // Fetch products
  const fetchProducts = useCallback(() => {
    api.products
      .list(activeCategory ? { category: activeCategory } : {})
      .then(setAllProducts)
      .catch(() => setAllProducts([]));
  }, [activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.products.getFeatured().then(setFeaturedProducts).catch(() => setFeaturedProducts([]));
    api.products.getFlashSale().then(setFlashSaleProducts).catch(() => setFlashSaleProducts([]));
  }, []);

  // Auto-seed if DB is empty
  useEffect(() => {
    if (allProducts && allProducts.length === 0 && !seeded) {
      api.seed().then(() => {
        setSeeded(true);
        fetchProducts();
        api.products.getFeatured().then(setFeaturedProducts);
        api.products.getFlashSale().then(setFlashSaleProducts);
      });
    }
  }, [allProducts, seeded, fetchProducts]);

  // Search
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      api.products.search(searchTerm).then(setSearchResults).catch(() => setSearchResults([]));
    } else {
      setSearchResults(undefined);
    }
  }, [searchTerm]);

  // Flash sale timer
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = Date.now() + 24 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSearching = searchTerm.trim().length > 1;
  const displayProducts = isSearching ? searchResults : allProducts;

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Hero Banner - only show when not searching */}
      {!isSearching && !activeCategory && (
        <section className="hero-section">
          <div className="hero-banner">
            <div className="hero-content">
              <span className="hero-tag">🔥 New Arrivals</span>
              <h1>Premium Collectibles & Action Figures</h1>
              <p>
                Discover rare action figures, limited-edition statues, and
                premium model kits from top brands. Your collection starts here.
              </p>
              <button
                className="hero-cta"
                onClick={() => {
                  window.scrollTo({
                    top: 500,
                    behavior: "smooth",
                  });
                }}
              >
                Shop Now →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale Section */}
      {!isSearching &&
        !activeCategory &&
        flashSaleProducts &&
        flashSaleProducts.length > 0 && (
          <section className="section">
            <div className="section-header">
              <div className="flash-sale-header">
                <h2>⚡ Flash Sale</h2>
                <div className="flash-timer">
                  <span>
                    {String(timeLeft.h).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span>
                    {String(timeLeft.m).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span>
                    {String(timeLeft.s).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
            <div className="product-scroll">
              {flashSaleProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

      {/* Featured Section */}
      {!isSearching &&
        !activeCategory &&
        featuredProducts &&
        featuredProducts.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2>🏆 Featured Collectibles</h2>
            </div>
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

      {/* Main Products / Search Results */}
      <section className="section">
        <div className="section-header">
          <h2>
            {isSearching
              ? `🔍 Results for "${searchTerm}"`
              : activeCategory
                ? `📦 ${activeCategory.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
                : "🎯 All Products"}
          </h2>
        </div>
        {displayProducts === undefined ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search term or browse our categories above.</p>
          </div>
        ) : (
          <div className="product-grid">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
