'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './Sidebar.module.css';

const NAV = [
  { href: '/dashboard',          label: 'Overview',  icon: '▦' },
  { href: '/dashboard/products', label: 'Products',  icon: '⊞' },
  { href: '/dashboard/orders',   label: 'Orders',    icon: '◫' },
  { href: '/dashboard/cart',     label: 'Cart',      icon: '⊡' },
];

interface Props {
  user?: { name?: string | null; email?: string | null } | null;
}

export function Sidebar({ user }: Props) {
  const path = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <Link href="/" className={styles.logo}>SHOPSMART</Link>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${path === item.href ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        <div className={styles.userBox}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name ?? 'User'}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
        </div>
        <button
          className={`btn btn-ghost btn-sm ${styles.signOut}`}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
