'use client';

import { useState } from 'react';
import styles from './products.module.css';

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 299.99, stock: 42, image: '🎧' },
  { id: 'p2', name: 'Mechanical Keyboard TKL', category: 'Electronics', price: 149.00, stock: 18, image: '⌨️' },
  { id: 'p3', name: 'Minimalist Leather Wallet', category: 'Accessories', price: 59.99, stock: 85, image: '👜' },
  { id: 'p4', name: 'Ceramic Pour-Over Coffee Set', category: 'Kitchen', price: 89.00, stock: 30, image: '☕' },
  { id: 'p5', name: 'Merino Wool Crewneck', category: 'Apparel', price: 120.00, stock: 55, image: '🧥' },
  { id: 'p6', name: 'Portable SSD 1TB', category: 'Electronics', price: 109.99, stock: 22, image: '💾' },
  { id: 'p7', name: 'Bamboo Desk Organiser', category: 'Office', price: 44.00, stock: 67, image: '🗂️' },
  { id: 'p8', name: 'Running Shoes Pro', category: 'Footwear', price: 175.00, stock: 14, image: '👟' },
];

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Kitchen', 'Apparel', 'Office', 'Footwear'];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<string[]>([]);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function addToCart(id: string) {
    setCart((prev) => [...prev, id]);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Products</h2>
          <p>{filtered.length} items found</p>
        </div>
        {cart.length > 0 && (
          <a href="/dashboard/cart" className="btn btn-primary btn-sm">
            Cart ({cart.length}) →
          </a>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={`input ${styles.search}`}
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.cats}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map((p) => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardImg}>{p.image}</div>
            <div className={styles.cardBody}>
              <span className="tag">{p.category}</span>
              <h4 className={styles.cardName}>{p.name}</h4>
              <div className={styles.cardFooter}>
                <span className={styles.price}>${p.price.toFixed(2)}</span>
                <span className={styles.stock}>{p.stock} in stock</span>
              </div>
              <button
                className={`btn btn-primary btn-sm ${styles.addBtn}`}
                onClick={() => addToCart(p.id)}
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <p>No products match your search.</p>
        </div>
      )}
    </div>
  );
}
