import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ title, subtitle, children }) {
  const router = useRouter();

  const isActive = (path) => (router.pathname === path ? "nav-link active" : "nav-link");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1>Central Marketing</h1>
        <p className="tagline">All brands • One dashboard</p>

        <p className="nav-section-title">Overview</p>
        <Link href="/" className={isActive("/")}>
          📊 Dashboard
        </Link>

        <p className="nav-section-title">Operations</p>
        <Link href="/brands" className={isActive("/brands")}>
          🏷️ Brands
        </Link>
        <Link href="/my-day" className={isActive("/my-day")}>
          ✅ My Day
        </Link>
        <Link href="/team" className={isActive("/team")}>
          👥 Team
        </Link>
      </aside>

      <main className="main">
        <div className="main-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
