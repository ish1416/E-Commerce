import Link from 'next/link';
import { Zap, Users, BarChart3, ShieldCheck, Package, Headphones } from 'lucide-react';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <main className={styles.main}>
      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.logo}>SHOPSMART</span>
          <div className={styles.navLinks}>
            <Link href="#features" className="btn btn-ghost btn-sm">Features</Link>
            <Link href="#how" className="btn btn-ghost btn-sm">How it works</Link>
            <Link href="/auth/signin" className="btn btn-secondary btn-sm">Sign in</Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">Get started →</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroTag}>
          <span className="badge badge-filled">AI-Powered</span>
          <span className="badge badge-outline">1,000+ Products</span>
          <span className="badge badge-outline">Real-Time</span>
        </div>
        <h1 className={styles.heroTitle}>
          Commerce that<br />
          <span className={styles.heroAccent}>thinks ahead.</span>
        </h1>
        <p className={styles.heroSub}>
          ShopSmart is a full-stack e-commerce platform with AI personalization,
          real-time inventory, and multi-vendor support — built for scale.
        </p>
        <div className={styles.heroCta}>
          <Link href="/auth/signup" className="btn btn-primary btn-lg">Start shopping →</Link>
          <Link href="/auth/signin" className="btn btn-secondary btn-lg">Sign in</Link>
        </div>
        <div className={styles.heroStats}>
          {[
            { value: '1,000+', label: 'Products' },
            { value: '10',     label: 'Stores' },
            { value: '99.9%',  label: 'Uptime' },
            { value: '<50ms',  label: 'Latency' },
          ].map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          {Array(3).fill(['Next.js 14','GraphQL','PostgreSQL','Redis','TypeScript','Docker','Prisma ORM','Socket.io','OpenAI','AWS S3']).flat().map((t, i) => (
            <span key={i} className={styles.marqueeItem}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className={`section ${styles.features}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="tag">Features</span>
            <h2>Everything you need.<br />Nothing you don&apos;t.</h2>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`card ${styles.featureCard}`}>
                  <div className={styles.featureIconWrap}>
                    <Icon size={20} color="#4f46e5" />
                  </div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className={`section ${styles.howSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="tag">How it works</span>
            <h2>Three steps to launch.</h2>
          </div>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.title} className={styles.step}>
                <span className={styles.stepNum}>0{i + 1}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2>Ready to build smarter?</h2>
            <Link href="/auth/signup" className="btn btn-secondary btn-lg">
              Create your account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <span className={styles.logo}>SHOPSMART</span>
            <p style={{ fontSize: '0.85rem', color: '#8a8a8a' }}>Built with ♥ by Ishita Singh</p>
            <div className={styles.footerLinks}>
              <Link href="/auth/signin">Sign in</Link>
              <Link href="/auth/signup">Sign up</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

const FEATURES = [
  { icon: Zap,         title: 'Real-Time Updates',    desc: 'Live inventory, order tracking, and recommendations via WebSocket.' },
  { icon: Headphones,  title: 'AI Personalization',   desc: 'Semantic search, smart recommendations, and dynamic pricing.' },
  { icon: Users,       title: 'Multi-Vendor',         desc: 'Onboard unlimited sellers with isolated dashboards and analytics.' },
  { icon: ShieldCheck, title: 'Secure Auth',          desc: 'OAuth 2.0, JWT sessions, and role-based access control.' },
  { icon: Package,     title: 'Order Management',     desc: 'Full order lifecycle with event sourcing and audit trails.' },
  { icon: BarChart3,   title: 'Analytics',            desc: 'Real-time sales dashboards, heatmaps, and conversion funnels.' },
];

const STEPS = [
  { title: 'Create an account', desc: 'Sign up with email or OAuth. Your dashboard is ready instantly.' },
  { title: 'Browse or list products', desc: 'Shop 1,000+ products or onboard as a seller and list your items.' },
  { title: 'Track everything live', desc: 'Real-time order updates, inventory alerts, and AI insights.' },
];
