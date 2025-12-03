import Link from 'next/link'
import { useRouter } from 'next/router'

export function Layout({ title, children }) {
  const router = useRouter();
  const path = router.pathname;

  const nav = [
    { href: '/', label: 'Overview' },
    { href: '/brands', label: 'Brands' },
    { href: '/team', label: 'Team' },
    { href: '/my-day', label: 'My Day' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">Central Marketing</div>
        <div className="nav-section-title">Main</div>
        {nav.map(item => (
          <Link key={item.href} href={item.href}>
            <div className={`nav-link ${path === item.href ? 'active' : ''}`}>
              <span>●</span>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <div className="breadcrumb">Dashboard / {title}</div>
            <div className="page-title">{title}</div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-outline">This week</button>
            <button className="btn btn-primary">+ New Task</button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
