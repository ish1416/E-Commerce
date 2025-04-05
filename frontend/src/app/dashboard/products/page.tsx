'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, ShoppingCart, Heart, Star, Filter,
  Zap, Shirt, Home, Dumbbell, BookOpen,
  Sparkles, Gamepad2, Car, Footprints, Watch,
  ChevronLeft, ChevronRight, Loader2, Package,
} from 'lucide-react';
import styles from './products.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

const CATEGORIES = [
  { name: 'All',           icon: Package,    color: '#0a0a0a', bg: '#f0f0f0' },
  { name: 'Electronics',   icon: Zap,        color: '#4f46e5', bg: '#eef2ff' },
  { name: 'Clothing',      icon: Shirt,      color: '#f43f5e', bg: '#fff1f2' },
  { name: 'Home & Kitchen',icon: Home,       color: '#f59e0b', bg: '#fffbeb' },
  { name: 'Sports',        icon: Dumbbell,   color: '#10b981', bg: '#ecfdf5' },
  { name: 'Books',         icon: BookOpen,   color: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Beauty',        icon: Sparkles,   color: '#f97316', bg: '#fff7ed' },
  { name: 'Toys',          icon: Gamepad2,   color: '#0ea5e9', bg: '#f0f9ff' },
  { name: 'Automotive',    icon: Car,        color: '#6b6b6b', bg: '#f0f0f0' },
  { name: 'Footwear',      icon: Footprints, color: '#f43f5e', bg: '#fff1f2' },
  { name: 'Accessories',   icon: Watch,      color: '#f59e0b', bg: '#fffbeb' },
];

const LIMIT = 20;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: { id: string; name: string };
  store: { name: string };
}

async function fetchProducts(search: string, categoryId: string, offset: number): Promise<{ products: Product[]; total: number }> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query Products($search: String, $categoryId: String, $limit: Int, $offset: Int) {
        products(search: $search, categoryId: $categoryId, limit: $limit, offset: $offset) {
          id name description price stock
          category { id name }
          store { name }
        }
      }`,
      variables: { search: search || undefined, categoryId: categoryId || undefined, limit: LIMIT, offset },
    }),
  });
  const { data } = await res.json();
  return { products: data?.products ?? [], total: data?.products?.length ?? 0 };
}

async function fetchCategories(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `{ categories { id name } }` }),
  });
  const { data } = await res.json();
  return data?.categories ?? [];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [activeCatId, setActiveCatId] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load categories once
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Load products on filter/page change
  const load = useCallback(async () => {
    setLoading(true);
    const { products } = await fetchProducts(debouncedSearch, activeCatId, page * LIMIT);
    setProducts(products);
    setLoading(false);
  }, [debouncedSearch, activeCatId, page]);

  useEffect(() => { load(); }, [load]);

  function selectCategory(name: string) {
    setActiveCat(name);
    setPage(0);
    if (name === 'All') { setActiveCatId(''); return; }
    const found = categories.find((c) => c.name === name);
    setActiveCatId(found?.id ?? '');
  }

  function toggleCart(id: string) {
    setCart((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleWishlist(id: string) {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const catMeta = (name: string) => CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[0];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>Products</h2>
          <p>Browse our catalog of 1,000+ items</p>
        </div>
        {cart.length > 0 && (
          <Link href="/dashboard/cart" className={`btn btn-primary btn-sm ${styles.cartBtn}`}>
            <ShoppingCart size={15} />
            Cart ({cart.length})
          </Link>
        )}
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search 1,000+ products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {/* Category pills */}
      <div className={styles.cats}>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = activeCat === c.name;
          return (
            <button
              key={c.name}
              className={`${styles.catPill} ${active ? styles.catActive : ''}`}
              style={active ? { background: c.color, borderColor: c.color, color: '#fff' } : {}}
              onClick={() => selectCategory(c.name)}
            >
              <Icon size={13} />
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <span className={styles.resultCount}>
          <Filter size={13} />
          {loading ? 'Loading…' : `${products.length} results`}
          {activeCat !== 'All' && ` in ${activeCat}`}
        </span>
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft size={15} />
          </button>
          <span className={styles.pageNum}>Page {page + 1}</span>
          <button className={styles.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={products.length < LIMIT}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 size={28} className={styles.spinner} />
          <p>Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <Package size={40} strokeWidth={1} />
          <p>No products found.</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); selectCategory('All'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((p) => {
            const meta = catMeta(p.category.name);
            const Icon = meta.icon;
            const inCart = cart.includes(p.id);
            const inWish = wishlist.includes(p.id);
            const rating = (3.5 + Math.random() * 1.5).toFixed(1);

            return (
              <div key={p.id} className={styles.card}>
                {/* Image area */}
                <div className={styles.cardImg} style={{ background: meta.bg }}>
                  <Icon size={48} color={meta.color} strokeWidth={1.5} />
                  <button
                    className={`${styles.wishBtn} ${inWish ? styles.wishActive : ''}`}
                    onClick={() => toggleWishlist(p.id)}
                    title="Wishlist"
                  >
                    <Heart size={14} fill={inWish ? '#f43f5e' : 'none'} color={inWish ? '#f43f5e' : '#9a9a9a'} />
                  </button>
                  {p.stock === 0 && <span className={styles.outOfStock}>Out of stock</span>}
                  {p.stock > 0 && p.stock < 10 && <span className={styles.lowStock}>Only {p.stock} left</span>}
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.catTag} style={{ color: meta.color, background: meta.bg }}>
                      {p.category.name}
                    </span>
                    <span className={styles.rating}>
                      <Star size={10} fill="#f59e0b" color="#f59e0b" />
                      {rating}
                    </span>
                  </div>
                  <h4 className={styles.cardName}>{p.name}</h4>
                  <p className={styles.storeName}>{p.store.name}</p>

                  <div className={styles.cardFooter}>
                    <span className={styles.price}>₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <button
                      className={`${styles.addBtn} ${inCart ? styles.addBtnActive : ''}`}
                      onClick={() => toggleCart(p.id)}
                      disabled={p.stock === 0}
                    >
                      <ShoppingCart size={13} />
                      {inCart ? 'Added' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
