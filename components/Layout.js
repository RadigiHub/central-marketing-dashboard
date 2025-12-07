// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";
import supabase from "../lib/supabase";
import { useAuth } from "../lib/auth";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/brands", label: "Brands" },
  { href: "/my-day", label: "My Day" },
  { href: "/team", label: "Team" },
  { href: "/team-updates", label: "Team Updates" },
  { href: "/analytics", label: "Analytics" }, // NEW
];

export default function Layout({ children }) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="loading-screen">
        <p>You are not signed in.</p>
        <button
          onClick={() => router.push("/login")}
          className="btn-primary"
        >
          Go to login
        </button>
      </div>
    );
  }

  let filteredNavItems = navItems;

  if (profile?.role === "core_team") {
    filteredNavItems = navItems.filter((item) =>
      ["/my-day", "/team-updates"].includes(item.href)
    );
  } else if (profile?.role === "boss" || profile?.role === "super_admin") {
    filteredNavItems = navItems;
  } else {
    filteredNavItems = [];
  }

  const displayName = profile?.full_name || "User";
  const displayRole =
    profile?.role === "boss"
      ? "Head of Central Marketing"
      : profile?.role === "super_admin"
      ? "Central Marketing – Super Admin"
      : profile?.role === "core_team"
      ? "Central Marketing – Core Team"
      : "";

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-circle">CM</div>
          <div className="sidebar-title">Central Marketing</div>
          <div className="sidebar-subtitle">Operations Dashboard</div>
        </div>

        <nav className="nav">
          {filteredNavItems.map((item) => {
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
          <div className="sidebar-footer-title">{displayRole}</div>
          <div className="sidebar-footer-name">{displayName}</div>

          <button
            className="sidebar-logout"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="topbar-title">Central Marketing Dashboard</h1>
            <p className="topbar-subtitle">
              Snapshot of all brands, campaigns &amp; team focus.
            </p>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
