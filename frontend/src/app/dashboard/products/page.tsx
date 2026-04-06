'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, ShoppingCart, Heart, Star, Filter,
  Zap, Shirt, Home, Dumbbell, Sparkles,
  ShoppingBag, Baby, Palette, PawPrint,
  ChevronLeft, ChevronRight, Loader2, Package,
} from 'lucide-react';
import styles from './products.module.css';

const CATEGORIES = [
  { slug: '',             label: 'All',           Icon: Package,     color: '#0f0f0f', bg: '#f2f0ec' },
  { slug: 'electronics',  label: 'Electronics',   Icon: Zap,         color: '#4f46e5', bg: '#eef2ff' },
  { slug: 'clothing',     label: 'Clothing',      Icon: Shirt,       color: '#e11d48', bg: '#fff1f2' },
  { slug: 'home-kitchen', label: 'Home & Kitchen',Icon: Home,        color: '#d97706', bg: '#fef3c7' },
  { slug: 'sports',       label: 'Sports',        Icon: Dumbbell,    color: '#059669', bg: '#d1fae5' },
  { slug: 'beauty',       label: 'Beauty',        Icon: Sparkles,    color: '#ea580c', bg: '#ffedd5' },
  { slug: 'grocery',      label: 'Grocery',       Icon: ShoppingBag, color: '#16a34a', bg: '#dcfce7' },
  { slug: 'baby',         label: 'Baby Products', Icon: Baby,        color: '#0284c7', bg: '#e0f2fe' },
  { slug: 'hobby',        label: 'Hobby & Arts',  Icon: Palette,     color: '#7c3aed', bg: '#ede9fe' },
  { slug: 'pets',         label: 'Pet Supplies',  Icon: PawPrint,    color: '#b45309', bg: '#fef3c7' },
];

const LIMIT = 20;

interface Product {
  id: string; name: string; price: number; rating: number;
  reviews: number; stock: number; image: string;
  category: string; categorySlug: string; store: string;
}

export default function ProductsPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [activeCat, setActiveCat]   = useState('');
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(true);
  const [cart, setCart]             = useState<Set<string>>(new Set());
  const [wishlist, setWishlist]     = useState<Set<string>>(new Set());

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: String(LIMIT),
      ...(activeCat && { category: activeCat }),
      ...(debouncedSearch && { search: debouncedSearch }),
    });
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, activeCat, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  function selectCat(slug: string) { setActiveCat(slug); setPage(0); }
  function toggleCart(id: string)  { setCart((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleWish(id: string)  { setWishlist((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const catMeta = (slug: string) => CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>Products</h2>
          <p>{loading ? '…' : `${total.toLocaleString()} items`}</p>
        </div>
        {cart.size > 0 && (
          <Link href="/dashboard/cart" className={`btn btn-primary btn-sm ${styles.cartBtn}`}>
            <ShoppingCart size={15} /> Cart ({cart.size})
          </Link>
        )}
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Category pills */}
      <div className={styles.cats}>
        {CATEGORIES.map((c) => {
          const active = activeCat === c.slug;
          return (
            <button
              key={c.slug}
              className={`${styles.catPill} ${active ? styles.catActive : ''}`}
              style={active ? { background: c.color, borderColor: c.color, color: '#fff', boxShadow: `3px 3px 0 ${c.color}55` } : {}}
              onClick={() => selectCat(c.slug)}
            >
              <c.Icon size={13} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <span className={styles.resultCount}>
          <Filter size={13} />
          {loading ? 'Loading…' : `${total.toLocaleString()} results${activeCat ? ` in ${catMeta(activeCat).label}` : ''}`}
        </span>
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft size={15} />
          </button>
          <span className={styles.pageNum}>{page + 1} / {Math.max(1, totalPages)}</span>
          <button className={styles.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <Package size={40} strokeWidth={1} />
          <p>No products found.</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); selectCat(''); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((p) => {
            const meta  = catMeta(p.categorySlug);
            const inCart = cart.has(p.id);
            const inWish = wishlist.has(p.id);
            return (
              <div key={p.id} className={styles.card}>
                {/* Image */}
                <div className={styles.cardImg} style={{ background: meta.bg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className={styles.img} />
                  <button
                    className={`${styles.wishBtn} ${inWish ? styles.wishActive : ''}`}
                    onClick={() => toggleWish(p.id)}
                  >
                    <Heart size={13} fill={inWish ? '#e11d48' : 'none'} color={inWish ? '#e11d48' : '#8a8a8a'} />
                  </button>
                  {p.stock === 0 && <span className={styles.outOfStock}>Out of stock</span>}
                  {p.stock > 0 && p.stock < 10 && <span className={styles.lowStock}>Only {p.stock} left</span>}
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.catTag} style={{ color: meta.color, background: meta.bg }}>
                      {p.category}
                    </span>
                    <span className={styles.rating}>
                      <Star size={10} fill="#d97706" color="#d97706" />
                      {p.rating} ({p.reviews})
                    </span>
                  </div>
                  <h4 className={styles.cardName}>{p.name}</h4>
                  <p className={styles.storeName}>{p.store}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
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
