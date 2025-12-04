// pages/analytics.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import supabase from '../lib/supabase';
import Layout from '../components/Layout';

export default function AnalyticsPage() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('Brands').select('*');
      setBrands(data || []);
    })();
  }, []);

  const total = brands.length;
  const onTrack = brands.filter((b) => b.status === 'On Track').length;
  const inProgress = brands.filter((b) => b.status === 'In Progress').length;

  const byLead = brands.reduce((acc, b) => {
    const key = b.team_lead || 'Unassigned';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <Head>
        <title>Analytics • Central Marketing Dashboard</title>
      </Head>

      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            High-level overview of brand health & ownership.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-3">
        <div className="card metric-card">
          <div className="metric-label">Total brands</div>
          <div className="metric-value">{total}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">On track</div>
          <div className="metric-value success">{onTrack}</div>
          <div className="metric-sub">
            {total ? `${Math.round((onTrack / total) * 100)}%` : '—'}
          </div>
        </div>
        <div className="card metric-card">
          <div className="metric-label">In progress / revamp</div>
          <div className="metric-value warning">{inProgress}</div>
          <div className="metric-sub">
            {total ? `${Math.round((inProgress / total) * 100)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Team lead load */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Brands per team lead</h2>
        </div>
        <div className="card-body">
          {Object.keys(byLead).length === 0 && <p>No brands yet.</p>}
          <ul className="bar-list">
            {Object.entries(byLead).map(([lead, count]) => {
              const ratio = total ? (count / total) * 100 : 0;
              return (
                <li key={lead} className="bar-row">
                  <span className="bar-label">{lead}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                  <span className="bar-value">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
