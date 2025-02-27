import styles from './orders.module.css';

const ORDERS = [
  { id: 'ORD-001', date: 'Apr 2, 2025',  status: 'DELIVERED',  total: '$89.99',  items: 2 },
  { id: 'ORD-002', date: 'Mar 28, 2025', status: 'SHIPPED',    total: '$234.00', items: 3 },
  { id: 'ORD-003', date: 'Mar 21, 2025', status: 'PROCESSING', total: '$45.50',  items: 1 },
  { id: 'ORD-004', date: 'Mar 15, 2025', status: 'CONFIRMED',  total: '$120.00', items: 4 },
  { id: 'ORD-005', date: 'Mar 8, 2025',  status: 'DELIVERED',  total: '$67.00',  items: 2 },
  { id: 'ORD-006', date: 'Feb 22, 2025', status: 'CANCELLED',  total: '$199.00', items: 1 },
];

const STATUS_CLASS: Record<string, string> = {
  DELIVERED:  styles.delivered,
  SHIPPED:    styles.shipped,
  PROCESSING: styles.processing,
  CONFIRMED:  styles.confirmed,
  PENDING:    styles.pending,
  CANCELLED:  styles.cancelled,
};

export default function OrdersPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Orders</h2>
        <p>{ORDERS.length} total orders</p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => (
              <tr key={o.id}>
                <td className={styles.orderId}>{o.id}</td>
                <td className={styles.date}>{o.date}</td>
                <td>{o.items} item{o.items > 1 ? 's' : ''}</td>
                <td>
                  <span className={`${styles.badge} ${STATUS_CLASS[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className={styles.total}>{o.total}</td>
                <td>
                  <button className="btn btn-ghost btn-sm">Details →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
