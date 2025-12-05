// pages/team-updates.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import supabase from '../lib/supabase';

// helper: aaj ki date "YYYY-MM-DD" format
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeamUpdatesPage() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUpdates(selectedDate);
  }, [selectedDate]);

  async function loadUpdates(date) {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('daily_updates')
        .select(`
          id,
          date,
          assignee,
          status,
          focus,
          impact,
          created_at,
          brand:Brands (
            id,
            name
          )
        `)
        .eq('date', date)               // sirf is date ke updates
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (err) {
      console.error('Error loading updates', err);
      setError('Updates load karte waqt error aaya.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Head>
        <title>Team Updates • Central Marketing Dashboard</title>
      </Head>

      <div className="page-header">
        <div>
          <h1 className="page-title">Team Updates</h1>
          <p className="page-subtitle">
            Roz ka detailed log – kis brand pe kis ne kya kaam kia.
          </p>
        </div>

        <div className="toolbar">
          <label className="toolbar-group">
            <span style={{ fontSize: 12, opacity: 0.8 }}>Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </label>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <h2 className="card-title">
            Updates for <span className="muted">{selectedDate}</span>{' '}
            <span className="muted">({updates.length})</span>
          </h2>
        </div>

        <div className="card-body table-wrapper">
          {loading ? (
            <div>Loading updates…</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : updates.length === 0 ? (
            <div className="table-empty">
              Is date ke liye koi update nahi mila.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Brand</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Today&apos;s Focus</th>
                  <th>Impact / Result</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleTimeString()
                        : '—'}
                    </td>
                    <td>{u.brand?.name || '—'}</td>
                    <td>{u.assignee || '—'}</td>
                    <td>{u.status || '—'}</td>
                    <td>{u.focus || '—'}</td>
                    <td>{u.impact || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
