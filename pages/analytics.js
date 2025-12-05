import { useEffect, useState } from "react";
import { getDailyUpdates } from "../lib/queries";
import Layout from "../components/Layout";

export default function AnalyticsPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getDailyUpdates();
      setUpdates(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const grouped = updates.reduce((acc, row) => {
    if (!acc[row.brand?.name]) acc[row.brand?.name] = [];
    acc[row.brand?.name].push(row);
    return acc;
  }, {});

  return (
    <Layout>
      <h1 className="page-title">Brand Performance & Daily Ops</h1>
      <p className="page-subtitle">
        Boss & management view – which brands are moving, stuck or improving.
      </p>

      {loading ? (
        <div>Loading…</div>
      ) : (
        Object.keys(grouped).map((brand) => (
          <div key={brand} className="card mb-lg">
            <h2 className="card-title">{brand}</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Focus</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {grouped[brand].map((u) => (
                  <tr key={u.id}>
                    <td>{u.date}</td>
                    <td>{u.assignee}</td>
                    <td>{u.status}</td>
                    <td>{u.focus}</td>
                    <td>{u.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </Layout>
  );
}
