'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import styles from './orders.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string; quantity: number; price: number; product: { name: string; category: { name: string } } }[];
}

const STATUS_META: Record<string, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',    Icon: Clock,        color: '#9a9a9a', bg: '#f9f9f9' },
  CONFIRMED:  { label: 'Confirmed',  Icon: CheckCircle,  color: '#0ea5e9', bg: '#f0f9ff' },
  PROCESSING: { label: 'Processing', Icon: RefreshCw,    color: '#f59e0b', bg: '#fffbeb' },
  SHIPPED:    { label: 'Shipped',    Icon: Truck,        color: '#4f46e5', bg: '#eef2ff' },
  DELIVERED:  { label: 'Delivered',  Icon: Package,      color: '#10b981', bg: '#ecfdf5' },
  CANCELLED:  { label: 'Cancelled',  Icon: XCircle,      color: '#f43f5e', bg: '#fff1f2' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        query: `{ orders { id status total createdAt items { id quantity price product { name category { name } } } } }`,
      }),
    })
      .then((r) => r.json())
      .then(({ data }) => { setOrders(data?.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Orders</h2>
          <p>{orders.length} total orders</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className={styles.tabs}>
        {FILTERS.map((f) => {
          const meta = f !== 'ALL' ? STATUS_META[f] : null;
          return (
            <button
              key={f}
              className={`${styles.tab} ${filter === f ? styles.tabActive : ''}`}
              style={filter === f && meta ? { borderColor: meta.color, color: meta.color } : {}}
              onClick={() => setFilter(f)}
            >
              {meta && <meta.Icon size={12} />}
              {f === 'ALL' ? 'All' : meta?.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className={styles.loading}><RefreshCw size={24} className={styles.spin} /><p>Loading orders…</p></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <ShoppingBag size={40} strokeWidth={1} color="#c4c4c4" />
          <p>No orders found.</p>
          <Link href="/dashboard/products" className="btn btn-primary btn-sm">Browse products →</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((o) => {
            const meta = STATUS_META[o.status] ?? STATUS_META.PENDING;
            const Icon = meta.Icon;
            return (
              <div key={o.id} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div className={styles.orderLeft}>
                    <span className={styles.orderId}>#{o.id.slice(-8).toUpperCase()}</span>
                    <span className={styles.orderDate}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={styles.statusBadge} style={{ color: meta.color, background: meta.bg, borderColor: meta.color }}>
                      <Icon size={11} />
                      {meta.label}
                    </span>
                    <span className={styles.orderTotal}>₹{Number(o.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className={styles.orderItems}>
                  {o.items.slice(0, 3).map((item) => (
                    <span key={item.id} className={styles.itemChip}>
                      {item.product.name} × {item.quantity}
                    </span>
                  ))}
                  {o.items.length > 3 && <span className={styles.itemChip}>+{o.items.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
