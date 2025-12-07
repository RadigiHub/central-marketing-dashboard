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
  { href: "/analytics", label: "Analytics" },
];

export default function Layout({ children }) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const role = profile?.role || null;

  // 👉 role ke hisaab se sidebar items
  let visibleNavItems;

  if (role === "super_admin") {
    // super admin: full access, My Day bhi
    visibleNavItems = navItems;
  } else if (role === "boss") {
    // boss: sab dikhega, sirf My Day HIDE
    visibleNavItems = navItems.filter((item) => item.href !== "/my-day");
  } else if (role === "manager") {
    // manager: dashboard + brands + team + team updates
    visibleNavItems = navItems.filter((item) =>
      ["/", "/brands", "/team", "/team-updates"].includes(item.href)
    );
  } else if (role === "core_team") {
    // core team: dashboard + My Day + team updates
    visibleNavItems = navItems.filter((item) =>
      ["/", "/my-day", "/team-updates"].includes(item.href)
    );
  } else {
    // unknown role: sirf dashboard
    visibleNavItems = navItems.filter((item) => item.href === "/");
  }

  const displayName = profile?.full_name || user?.email || "User";

  let displayRole = "";
  if (role === "super_admin") {
    displayRole = "Central Marketing – Super Admin";
  } else if (role === "boss") {
    displayRole = "Head of Central Marketing";
  } else if (role === "manager") {
    displayRole = "Central Marketing – Manager";
  } else if (role === "core_team") {
    displayRole = "Central Marketing – Core Team";
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const isActive = (path) => router.pathname === path;

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
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${
                isActive(item.href) ? "nav-item-active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-title">{displayRole}</div>
          <div className="sidebar-footer-name">{displayName}</div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
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
