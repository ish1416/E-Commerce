'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, ShoppingCart, Heart, Star,
  Zap, Shirt, Home, Dumbbell, Sparkles, BookOpen, Gamepad2, Watch, Package, Filter,
} from 'lucide-react';
import styles from './products.module.css';

const CATEGORIES = [
  { slug: '',             label: 'All',           Icon: Package  },
  { slug: 'electronics',  label: 'Electronics',   Icon: Zap      },
  { slug: 'clothing',     label: 'Clothing',      Icon: Shirt    },
  { slug: 'home-kitchen', label: 'Home & Kitchen',Icon: Home     },
  { slug: 'sports',       label: 'Sports',        Icon: Dumbbell },
  { slug: 'beauty',       label: 'Beauty',        Icon: Sparkles },
  { slug: 'books',        label: 'Books',         Icon: BookOpen },
  { slug: 'toys',         label: 'Toys',          Icon: Gamepad2 },
  { slug: 'accessories',  label: 'Accessories',   Icon: Watch    },
];

const CAT_STYLE: Record<string, { color: string; bg: string }> = {
  electronics:   { color: '#4f46e5', bg: '#eef2ff' },
  clothing:      { color: '#e11d48', bg: '#fff1f2' },
  'home-kitchen':{ color: '#d97706', bg: '#fef3c7' },
  sports:        { color: '#059669', bg: '#d1fae5' },
  beauty:        { color: '#ea580c', bg: '#ffedd5' },
  books:         { color: '#7c3aed', bg: '#ede9fe' },
  toys:          { color: '#0284c7', bg: '#e0f2fe' },
  accessories:   { color: '#b45309', bg: '#fef3c7' },
};

const PRODUCTS = [
  { id: '1',  name: 'Wireless Noise-Cancelling Headphones', category: 'electronics',   price: 2999,  stock: 42,  rating: 4.5, reviews: 320, store: 'TechZone India',    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { id: '2',  name: 'Mechanical Keyboard TKL',              category: 'electronics',   price: 4499,  stock: 18,  rating: 4.3, reviews: 210, store: 'TechZone India',    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80' },
  { id: '3',  name: 'Smart Watch Series 5',                 category: 'electronics',   price: 8999,  stock: 25,  rating: 4.6, reviews: 540, store: 'GadgetHub',         image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
  { id: '4',  name: 'Portable Bluetooth Speaker',           category: 'electronics',   price: 1799,  stock: 60,  rating: 4.2, reviews: 180, store: 'SoundWave',         image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80' },
  { id: '5',  name: 'Slim Fit Denim Jeans',                 category: 'clothing',      price: 1299,  stock: 85,  rating: 4.1, reviews: 95,  store: 'FashionHub',        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
  { id: '6',  name: 'Oversized Cotton Hoodie',              category: 'clothing',      price: 999,   stock: 120, rating: 4.4, reviews: 210, store: 'UrbanWear',         image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80' },
  { id: '7',  name: 'Formal Oxford Shirt',                  category: 'clothing',      price: 1499,  stock: 55,  rating: 4.0, reviews: 78,  store: 'FashionHub',        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80' },
  { id: '8',  name: 'Cast Iron Skillet Pan',                category: 'home-kitchen',  price: 2199,  stock: 30,  rating: 4.7, reviews: 430, store: 'KitchenKing',       image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80' },
  { id: '9',  name: 'Pour Over Coffee Set',                 category: 'home-kitchen',  price: 1599,  stock: 40,  rating: 4.5, reviews: 290, store: 'BrewMaster',        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
  { id: '10', name: 'Ceramic Mug Set of 4',                 category: 'home-kitchen',  price: 799,   stock: 70,  rating: 4.3, reviews: 155, store: 'KitchenKing',       image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80' },
  { id: '11', name: 'Yoga Mat Anti-Slip',                   category: 'sports',        price: 899,   stock: 95,  rating: 4.4, reviews: 380, store: 'SportsPro',         image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80' },
  { id: '12', name: 'Adjustable Dumbbell Set',              category: 'sports',        price: 3499,  stock: 22,  rating: 4.6, reviews: 210, store: 'FitGear',           image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  { id: '13', name: 'Vitamin C Face Serum',                 category: 'beauty',        price: 599,   stock: 150, rating: 4.5, reviews: 620, store: 'GlowUp Beauty',     image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80' },
  { id: '14', name: 'SPF 50 Moisturiser',                   category: 'beauty',        price: 449,   stock: 200, rating: 4.3, reviews: 410, store: 'SkinCare Co',       image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80' },
  { id: '15', name: 'Atomic Habits — James Clear',          category: 'books',         price: 399,   stock: 300, rating: 4.9, reviews: 1200,store: 'BookNest',          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80' },
  { id: '16', name: 'The Psychology of Money',              category: 'books',         price: 349,   stock: 250, rating: 4.8, reviews: 890, store: 'BookNest',          image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80' },
  { id: '17', name: 'LEGO Classic Creative Set',            category: 'toys',          price: 2499,  stock: 35,  rating: 4.7, reviews: 340, store: 'ToyWorld',          image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80' },
  { id: '18', name: 'Minimalist Leather Wallet',            category: 'accessories',   price: 799,   stock: 80,  rating: 4.4, reviews: 175, store: 'StyleCraft',        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80' },
  { id: '19', name: 'Polarised Sunglasses',                 category: 'accessories',   price: 1299,  stock: 60,  rating: 4.2, reviews: 130, store: 'StyleCraft',        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80' },
  { id: '20', name: 'Canvas Tote Bag',                      category: 'accessories',   price: 499,   stock: 110, rating: 4.1, reviews: 88,  store: 'BagCo',             image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80' },
];

export default function ProductsPage() {
  const [search, setSearch]     = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [cart, setCart]         = useState<Set<string>>(new Set());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const filtered = PRODUCTS.filter((p) => {
    const matchCat    = !activeCat || p.category === activeCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function toggleCart(id: string) { setCart((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleWish(id: string) { setWishlist((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const style = (cat: string) => CAT_STYLE[cat] ?? { color: '#0f0f0f', bg: '#f2f0ec' };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Products</h2>
          <p>{filtered.length} items</p>
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
        {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
      </div>

      {/* Category pills */}
      <div className={styles.cats}>
        {CATEGORIES.map((c) => {
          const active = activeCat === c.slug;
          const s = style(c.slug);
          return (
            <button
              key={c.slug}
              className={`${styles.catPill} ${active ? styles.catActive : ''}`}
              style={active ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
              onClick={() => setActiveCat(c.slug)}
            >
              <c.Icon size={13} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div className={styles.filterBar}>
        <span className={styles.resultCount}>
          <Filter size={13} />
          {filtered.length} results{activeCat ? ` in ${CATEGORIES.find(c => c.slug === activeCat)?.label}` : ''}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Package size={40} strokeWidth={1} />
          <p>No products found.</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setActiveCat(''); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => {
            const s      = style(p.category);
            const inCart = cart.has(p.id);
            const inWish = wishlist.has(p.id);
            return (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardImg} style={{ background: s.bg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className={styles.img}
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.style.display = 'none';
                    }}
                  />
                  <button className={`${styles.wishBtn} ${inWish ? styles.wishActive : ''}`} onClick={() => toggleWish(p.id)}>
                    <Heart size={13} fill={inWish ? '#e11d48' : 'none'} color={inWish ? '#e11d48' : '#8a8a8a'} />
                  </button>
                  {p.stock === 0 && <span className={styles.outOfStock}>Out of stock</span>}
                  {p.stock > 0 && p.stock < 10 && <span className={styles.lowStock}>Only {p.stock} left</span>}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.catTag} style={{ color: s.color, background: s.bg }}>
                      {CATEGORIES.find(c => c.slug === p.category)?.label}
                    </span>
                    <span className={styles.rating}>
                      <Star size={10} fill="#d97706" color="#d97706" />
                      {p.rating} ({p.reviews})
                    </span>
                  </div>
                  <h4 className={styles.cardName}>{p.name}</h4>
                  <p className={styles.storeName}>{p.store}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>₹{p.price.toLocaleString('en-IN')}</span>
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
