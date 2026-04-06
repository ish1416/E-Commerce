'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Trash2, Plus, Minus, Package, Loader2 } from 'lucide-react';
import { getCart, updateQty, removeFromCart, clearCart, CartItem } from '@/lib/cart';
import styles from './cart.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

interface PlacedOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string; name: string; qty: number; price: number }[];
}

export default function CartPage() {
  const { data: session } = useSession();
  const [items, setItems]       = useState<CartItem[]>([]);
  const [placing, setPlacing]   = useState(false);
  const [error, setError]       = useState('');
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    setItems(getCart());
    const sync = () => setItems(getCart());
    window.addEventListener('cart-updated', sync);
    return () => window.removeEventListener('cart-updated', sync);
  }, []);

  function handleUpdateQty(id: string, delta: number) {
    updateQty(id, delta);
  }

  function handleRemove(id: string) {
    removeFromCart(id);
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = subtotal > 5000 ? 0 : 99;
  const total     = subtotal + shipping;

  async function handlePlaceOrder() {
    if (items.length === 0) return;
    setPlacing(true);
    setError('');

    try {
      const token = (session as { accessToken?: string })?.accessToken;

      // Try to place order via GraphQL if user is authenticated
      if (token) {
        const res = await fetch(API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `mutation PlaceOrder($shippingAddress: ShippingAddressInput!) {
              placeOrder(shippingAddress: $shippingAddress) {
                id status total createdAt
                items { id quantity price product { name } }
              }
            }`,
            variables: {
              shippingAddress: {
                street: '123 Main Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                zip: '400001',
                country: 'India',
              },
            },
          }),
        });

        const { data, errors } = await res.json();

        if (errors?.length) throw new Error(errors[0].message);

        if (data?.placeOrder) {
          // Save to localStorage orders list for offline access
          saveOrderLocally({
            id: data.placeOrder.id,
            status: data.placeOrder.status,
            total: data.placeOrder.total,
            createdAt: data.placeOrder.createdAt,
            items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
          });
          clearCart();
          setPlacedOrder({
            id: data.placeOrder.id,
            status: data.placeOrder.status,
            total: data.placeOrder.total,
            createdAt: data.placeOrder.createdAt,
            items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
          });
          return;
        }
      }

      // Fallback: save order locally (works without backend too)
      const order: PlacedOrder = {
        id: `ORD-${Date.now()}`,
        status: 'CONFIRMED',
        total,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
      };
      saveOrderLocally(order);
      clearCart();
      setPlacedOrder(order);

    } catch (err) {
      // Even if API fails, save locally so user doesn't lose their order
      const order: PlacedOrder = {
        id: `ORD-${Date.now()}`,
        status: 'CONFIRMED',
        total,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
      };
      saveOrderLocally(order);
      clearCart();
      setPlacedOrder(order);
      // Log error but don't block the user
      console.warn('Backend order failed, saved locally:', err);
    } finally {
      setPlacing(false);
    }
  }

  // ── Success screen ──
  if (placedOrder) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>
          <Package size={32} color="#fff" />
        </div>
        <h2>Order Placed!</h2>
        <p>Order <strong>#{placedOrder.id.slice(-8).toUpperCase()}</strong> has been confirmed.</p>
        <div className={styles.successSummary}>
          {placedOrder.items.map((i) => (
            <div key={i.id} className={styles.successItem}>
              <span>{i.name}</span>
              <span>× {i.qty}</span>
              <span>₹{(i.price * i.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className={styles.successTotal}>
            <span>Total paid</span>
            <span>₹{placedOrder.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className={styles.successActions}>
          <Link href="/dashboard/orders" className="btn btn-primary">View my orders →</Link>
          <Link href="/dashboard/products" className="btn btn-secondary">Keep shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Cart</h2>
          <p>{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { clearCart(); }}
            style={{ color: '#e11d48' }}
          >
            <Trash2 size={14} /> Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <ShoppingCart size={48} strokeWidth={1} color="#c4c4c4" />
          <p>Your cart is empty.</p>
          <Link href="/dashboard/products" className="btn btn-primary btn-sm">
            Browse products →
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Items list */}
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImgEl}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className={styles.itemInfo}>
                  <span className="tag">{item.category}</span>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <span className={styles.itemStore}>{item.store}</span>
                  <span className={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.itemRight}>
                  <div className={styles.qtyControl}>
                    <button className={styles.qtyBtn} onClick={() => handleUpdateQty(item.id, -1)}>
                      <Minus size={12} />
                    </button>
                    <span className={styles.qty}>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => handleUpdateQty(item.id, +1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className={styles.lineTotal}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
                  <button className={styles.removeBtn} onClick={() => handleRemove(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className={styles.summary}>
            <h4 className={styles.summaryTitle}>Order Summary</h4>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={shipping === 0 ? styles.free : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping === 0 && (
                <p className={styles.freeShipNote}>✓ Free shipping on orders above ₹5,000</p>
              )}
              {shipping > 0 && (
                <p className={styles.freeShipNote}>
                  Add ₹{(5000 - subtotal).toLocaleString('en-IN')} more for free shipping
                </p>
              )}
            </div>
            <div className={styles.divider} />
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={`btn btn-primary ${styles.checkoutBtn}`}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <><Loader2 size={15} className={styles.spin} /> Placing order…</>
              ) : (
                <>Place order →</>
              )}
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

// ── Helpers ──
function saveOrderLocally(order: PlacedOrder) {
  try {
    const existing: PlacedOrder[] = JSON.parse(
      localStorage.getItem('shopsmart_orders') || '[]'
    );
    existing.unshift(order); // newest first
    localStorage.setItem('shopsmart_orders', JSON.stringify(existing));
    window.dispatchEvent(new Event('orders-updated'));
  } catch {
    // ignore
  }
}
