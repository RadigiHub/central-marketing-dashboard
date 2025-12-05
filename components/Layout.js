// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/brands", label: "Brands" },
  { href: "/my-day", label: "My Day" },
  { href: "/team", label: "Team" },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-circle">CM</div>
          <div>
            <div className="sidebar-title">Central Marketing</div>
            <div className="sidebar-subtitle">Operations Dashboard</div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "nav-item-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-title">Central Marketing Lead</div>
          <div className="sidebar-footer-name">Shehroz Malik</div>
        </div>
      </aside>

      {/* Main area */}
      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="topbar-title">Central Marketing Dashboard</h1>
            <p className="topbar-subtitle">
              Snapshot of all brands, campaigns & team focus.
            </p>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
<li>
  <a href="/analytics">Analytics</a>
</li>
