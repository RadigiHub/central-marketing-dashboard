// pages/my-day.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import supabase from '../lib/supabase';
import Layout from '../components/Layout';

export default function MyDayPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('Brands')
        .select('*')
        .order('priority', { ascending: true });
      setBrands(data || []);
      setLoading(false);
    })();
  }, []);

  const highPriority = brands.filter((b) => (b.priority || 3) === 1);
  const inProgress = brands.filter((b) => b.status === 'In Progress');

  return (
    <Layout>
      <Head>
        <title>My Day • Central Marketing Dashboard</title>
      </Head>

      <div className="page-header">
        <div>
          <h1 className="page-title">My Day</h1>
          <p className="page-subtitle">
            Auto-generated priority list based on brand status & priority.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body">Loading tasks…</div>
        </div>
      ) : (
        <>
          <div className="grid grid-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🔥 High-priority brands</h2>
              </div>
              <div className="card-body">
                {highPriority.length === 0 ? (
                  <p className="muted">No high-priority items today.</p>
                ) : (
                  <ul className="task-list">
                    {highPriority.map((b) => (
                      <li key={b.id}>
                        <div className="task-title">{b.name}</div>
                        <div className="task-meta">
                          Status: {b.status || '—'} • Lead: {b.team_lead || '—'}
                        </div>
                        <div className="task-desc">
                          {b.current_focus || 'Define next actions for this brand.'}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🚧 In progress / revamp work</h2>
              </div>
              <div className="card-body">
                {inProgress.length === 0 ? (
                  <p className="muted">Nothing in progress right now.</p>
                ) : (
                  <ul className="task-list">
                    {inProgress.map((b) => (
                      <li key={b.id}>
                        <div className="task-title">{b.name}</div>
                        <div className="task-meta">
                          Lead: {b.team_lead || '—'} • Priority:{' '}
                          {b.priority || 3}
                        </div>
                        <div className="task-desc">
                          {b.current_focus ||
                            'Review this brand and add a clear focus update.'}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
