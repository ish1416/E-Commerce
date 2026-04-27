'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Package, ShoppingBag, ShoppingCart, LogOut, Store } from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV = [
  { href: '/dashboard',          label: 'Overview',  Icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products',  Icon: Package },
  { href: '/dashboard/orders',   label: 'Orders',    Icon: ShoppingBag },
  { href: '/dashboard/cart',     label: 'Cart',      Icon: ShoppingCart },
];

interface Props {
  user?: { name?: string | null; email?: string | null } | null;
}

export function Sidebar({ user }: Props) {
  const path = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <Link href="/" className={styles.logoWrap}>
          <Store size={18} color="#fff" />
          <span className={styles.logo}>SHOPSMART</span>
        </Link>
        <nav className={styles.nav}>
          {NAV.map(({ href, label, Icon }) => {
            const active = path === href;
            return (
              <Link key={href} href={href} className={`${styles.navItem} ${active ? styles.active : ''}`}>
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
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
        <button className={styles.signOut} onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
