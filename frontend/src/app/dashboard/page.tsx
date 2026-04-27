import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ShoppingBag, TrendingUp, ShoppingCart, Heart, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import styles from './overview.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

async function getStats(token?: string) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ query: `{ orders { id status total createdAt items { id quantity price product { name category { name } } } } cart { id quantity product { name price } } }` }),
      cache: 'no-store',
    });
    const { data } = await res.json();
    return { orders: data?.orders ?? [], cart: data?.cart ?? [] };
  } catch {
    return { orders: [], cart: [] };
  }
}

const STATUS_COLOR: Record<string, string> = {
  DELIVERED:  styles.delivered,
  SHIPPED:    styles.shipped,
  PROCESSING: styles.processing,
  CONFIRMED:  styles.confirmed,
  PENDING:    styles.pending,
  CANCELLED:  styles.cancelled,
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string })?.accessToken;
  const { orders, cart } = await getStats(token);

  const totalSpent = orders
    .filter((o: { status: string }) => o.status !== 'CANCELLED')
    .reduce((s: number, o: { total: number }) => s + Number(o.total), 0);

  const recentOrders = orders.slice(0, 5);

  const STATS = [
    { label: 'Total Orders',  value: orders.length.toString(),  delta: `${orders.filter((o: { status: string }) => o.status === 'DELIVERED').length} delivered`, icon: ShoppingBag, color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Total Spent',   value: `₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, delta: 'lifetime value', icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Cart Items',    value: cart.length.toString(),     delta: 'ready to checkout', icon: ShoppingCart, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Catalog',       value: '1,000+',                  delta: 'products available', icon: Package, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Good morning,</p>
          <h2 className={styles.name}>{session?.user?.name ?? session?.user?.email ?? 'Shopper'}</h2>
        </div>
        <span className="badge badge-filled">Dashboard</span>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: s.bg }}>
                <Icon size={20} color={s.color} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{s.label}</span>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statDelta}>{s.delta}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4>Recent Orders</h4>
          <Link href="/dashboard/orders" className={styles.viewAll}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className={styles.emptyOrders}>
            <ShoppingBag size={32} strokeWidth={1} color="#c4c4c4" />
            <p>No orders yet. <Link href="/dashboard/products" className={styles.link}>Start shopping →</Link></p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o: { id: string; status: string; total: number; items: unknown[]; createdAt: string }) => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>#{o.id.slice(-6).toUpperCase()}</td>
                    <td>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                    <td><span className={`${styles.badge} ${STATUS_COLOR[o.status]}`}>{o.status}</span></td>
                    <td className={styles.total}>₹{Number(o.total).toLocaleString('en-IN')}</td>
                    <td className={styles.date}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}><h4>Quick Actions</h4></div>
        <div className={styles.actions}>
          <Link href="/dashboard/products" className={`btn btn-primary ${styles.actionBtn}`}>
            <Package size={15} /> Browse Products
          </Link>
          <Link href="/dashboard/orders" className={`btn btn-secondary ${styles.actionBtn}`}>
            <ShoppingBag size={15} /> My Orders
          </Link>
          <Link href="/dashboard/cart" className={`btn btn-secondary ${styles.actionBtn}`}>
            <ShoppingCart size={15} /> View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
