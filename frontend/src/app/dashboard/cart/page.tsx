'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './cart.module.css';

const INITIAL_CART = [
  { id: 'p1', name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 299.99, qty: 1, image: '🎧' },
  { id: 'p3', name: 'Minimalist Leather Wallet',            category: 'Accessories', price: 59.99,  qty: 2, image: '👜' },
  { id: 'p5', name: 'Merino Wool Crewneck',                 category: 'Apparel',     price: 120.00, qty: 1, image: '🧥' },
];

export default function CartPage() {
  const [items, setItems] = useState(INITIAL_CART);
  const [ordered, setOrdered] = useState(false);

  function updateQty(id: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 200 ? 0 : 9.99;
  const total = subtotal + shipping;

  function placeOrder() {
    setOrdered(true);
    setItems([]);
  }

  if (ordered) {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon}>✓</span>
        <h2>Order placed!</h2>
        <p>Your order has been confirmed. You&apos;ll receive a tracking update shortly.</p>
        <div className={styles.successActions}>
          <Link href="/dashboard/orders" className="btn btn-primary">View orders →</Link>
          <Link href="/dashboard/products" className="btn btn-secondary">Keep shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Cart</h2>
        <p>{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>Your cart is empty.</p>
          <Link href="/dashboard/products" className="btn btn-primary btn-sm">Browse products →</Link>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImg}>{item.image}</div>
                <div className={styles.itemInfo}>
                  <span className="tag">{item.category}</span>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                </div>
                <div className={styles.qtyControl}>
                  <button className={styles.qtyBtn} onClick={() => updateQty(item.id, -1)}>−</button>
                  <span className={styles.qty}>{item.qty}</span>
                  <button className={styles.qtyBtn} onClick={() => updateQty(item.id, +1)}>+</button>
                </div>
                <span className={styles.lineTotal}>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h4 className={styles.summaryTitle}>Order Summary</h4>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping === 0 && (
                <p className={styles.freeShip}>✓ Free shipping applied</p>
              )}
            </div>
            <div className={styles.divider} />
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={placeOrder}>
              Place order →
            </button>
            <Link href="/dashboard/products" className={`btn btn-ghost btn-sm ${styles.continueBtn}`}>
              ← Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
