import { getServerSession } from 'next-auth';
import styles from './overview.module.css';

const STATS = [
  { label: 'Total Orders',   value: '24',     delta: '+3 this week' },
  { label: 'Revenue',        value: '$1,284',  delta: '+12% vs last month' },
  { label: 'Cart Items',     value: '5',       delta: '2 new today' },
  { label: 'Wishlist',       value: '12',      delta: '4 on sale' },
];

const RECENT_ORDERS = [
  { id: 'ORD-001', date: 'Apr 2, 2025', status: 'DELIVERED', total: '$89.99' },
  { id: 'ORD-002', date: 'Mar 28, 2025', status: 'SHIPPED',   total: '$234.00' },
  { id: 'ORD-003', date: 'Mar 21, 2025', status: 'PROCESSING', total: '$45.50' },
  { id: 'ORD-004', date: 'Mar 15, 2025', status: 'CONFIRMED', total: '$120.00' },
];

const STATUS_STYLE: Record<string, string> = {
  DELIVERED:  styles.statusDelivered,
  SHIPPED:    styles.statusShipped,
  PROCESSING: styles.statusProcessing,
  CONFIRMED:  styles.statusConfirmed,
  PENDING:    styles.statusPending,
  CANCELLED:  styles.statusCancelled,
};

export default async function DashboardPage() {
  const session = await getServerSession();

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

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statDelta}>{s.delta}</span>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4>Recent Orders</h4>
          <a href="/dashboard/orders" className={styles.viewAll}>View all →</a>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id}>
                  <td className={styles.orderId}>{o.id}</td>
                  <td>{o.date}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${STATUS_STYLE[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className={styles.total}>{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}><h4>Quick Actions</h4></div>
        <div className={styles.actions}>
          <a href="/dashboard/products" className="btn btn-primary">Browse Products</a>
          <a href="/dashboard/orders"   className="btn btn-secondary">My Orders</a>
          <a href="/dashboard/cart"     className="btn btn-secondary">View Cart</a>
        </div>
      </div>
    </div>
  );
}
