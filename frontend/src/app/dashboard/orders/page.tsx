'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  ShoppingBag, Package, Truck, CheckCircle,
  XCircle, Clock, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import styles from './orders.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

interface OrderItem {
  id: string;
  name?: string;
  qty?: number;
  quantity?: number;
  price: number;
  product?: { name: string; category?: { name: string } };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  source?: 'local' | 'backend';
}

const STATUS_META: Record<string, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',    Icon: Clock,        color: '#9a9a9a', bg: '#f9f9f9' },
  CONFIRMED:  { label: 'Confirmed',  Icon: CheckCircle,  color: '#0ea5e9', bg: '#f0f9ff' },
  PROCESSING: { label: 'Processing', Icon: RefreshCw,    color: '#f59e0b', bg: '#fffbeb' },
  SHIPPED:    { label: 'Shipped',    Icon: Truck,        color: '#4f46e5', bg: '#eef2ff' },
  DELIVERED:  { label: 'Delivered',  Icon: Package,      color: '#059669', bg: '#ecfdf5' },
  CANCELLED:  { label: 'Cancelled',  Icon: XCircle,      color: '#e11d48', bg: '#fff1f2' },
};

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);

    // 1. Load local orders from localStorage (always works)
    let localOrders: Order[] = [];
    try {
      localOrders = JSON.parse(localStorage.getItem('shopsmart_orders') || '[]')
        .map((o: Order) => ({ ...o, source: 'local' as const }));
    } catch {
      localOrders = [];
    }

    // 2. Try to load orders from backend if user is logged in
    let backendOrders: Order[] = [];
    const token = (session as { accessToken?: string })?.accessToken;

    if (token) {
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `{
              orders {
                id status total createdAt
                items {
                  id quantity price
                  product { name category { name } }
                }
              }
            }`,
          }),
        });
        const { data } = await res.json();
        backendOrders = (data?.orders ?? []).map((o: Order) => ({
          ...o,
          source: 'backend' as const,
        }));
      } catch {
        // Backend unavailable — use local only
      }
    }

    // 3. Merge: backend orders first, then local orders not already in backend
    const backendIds = new Set(backendOrders.map((o) => o.id));
    const merged = [
      ...backendOrders,
      ...localOrders.filter((o) => !backendIds.has(o.id)),
    ].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setOrders(merged);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    loadOrders();
    // Re-load when a new order is placed
    window.addEventListener('orders-updated', loadOrders);
    return () => window.removeEventListener('orders-updated', loadOrders);
  }, [loadOrders]);

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  function getItemName(item: OrderItem): string {
    return item.name ?? item.product?.name ?? 'Product';
  }

  function getItemQty(item: OrderItem): number {
    return item.qty ?? item.quantity ?? 1;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>My Orders</h2>
          <p>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadOrders} disabled={loading}>
          <RefreshCw size={13} className={loading ? styles.spin : ''} />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className={styles.tabs}>
        {FILTERS.map((f) => {
          const meta = f !== 'ALL' ? STATUS_META[f] : null;
          const count = f === 'ALL' ? orders.length : orders.filter((o) => o.status === f).length;
          return (
            <button
              key={f}
              className={`${styles.tab} ${filter === f ? styles.tabActive : ''}`}
              style={filter === f && meta ? { borderColor: meta.color, color: meta.color, background: meta.bg } : {}}
              onClick={() => setFilter(f)}
            >
              {meta && <meta.Icon size={12} />}
              {f === 'ALL' ? 'All' : meta?.label}
              {count > 0 && <span className={styles.tabCount}>{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <RefreshCw size={24} className={styles.spin} />
          <p>Loading orders…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <ShoppingBag size={48} strokeWidth={1} color="#c4c4c4" />
          <p>{filter === 'ALL' ? "You haven't placed any orders yet." : `No ${filter.toLowerCase()} orders.`}</p>
          {filter === 'ALL' && (
            <Link href="/dashboard/products" className="btn btn-primary btn-sm">
              Start shopping →
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((o) => {
            const meta = STATUS_META[o.status] ?? STATUS_META.PENDING;
            const Icon = meta.Icon;
            const isExpanded = expanded === o.id;

            return (
              <div key={o.id} className={styles.orderCard}>
                {/* Order header */}
                <div
                  className={styles.orderTop}
                  onClick={() => setExpanded(isExpanded ? null : o.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setExpanded(isExpanded ? null : o.id)}
                >
                  <div className={styles.orderLeft}>
                    <span className={styles.orderId}>
                      #{o.id.slice(-8).toUpperCase()}
                    </span>
                    <span className={styles.orderDate}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className={styles.orderRight}>
                    <span
                      className={styles.statusBadge}
                      style={{ color: meta.color, background: meta.bg, borderColor: meta.color }}
                    >
                      <Icon size={11} />
                      {meta.label}
                    </span>
                    <span className={styles.orderTotal}>
                      ₹{Number(o.total).toLocaleString('en-IN')}
                    </span>
                    {isExpanded
                      ? <ChevronUp size={16} color="#8a8a8a" />
                      : <ChevronDown size={16} color="#8a8a8a" />
                    }
                  </div>
                </div>

                {/* Item chips (always visible) */}
                <div className={styles.orderItems}>
                  {o.items.slice(0, 3).map((item, idx) => (
                    <span key={item.id ?? idx} className={styles.itemChip}>
                      {getItemName(item)} × {getItemQty(item)}
                    </span>
                  ))}
                  {o.items.length > 3 && (
                    <span className={styles.itemChip}>+{o.items.length - 3} more</span>
                  )}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className={styles.orderDetail}>
                    <table className={styles.detailTable}>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {o.items.map((item, idx) => (
                          <tr key={item.id ?? idx}>
                            <td>{getItemName(item)}</td>
                            <td>{getItemQty(item)}</td>
                            <td>₹{Number(item.price).toLocaleString('en-IN')}</td>
                            <td>₹{(Number(item.price) * getItemQty(item)).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className={styles.detailFooter}>
                      <span>Order Total</span>
                      <span className={styles.detailTotal}>
                        ₹{Number(o.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
