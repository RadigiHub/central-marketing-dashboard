// pages/analytics.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import supabase from "../lib/supabase";

export default function AnalyticsPage() {
  const [brands, setBrands] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Brands – same pattern as queries.js (team lead alias)
    const { data: brandsData, error: brandsError } = await supabase
      .from("Brands")
      .select('id, name, status, current_focus, team_lead:"team lead"')
      .order("priority", { ascending: true })
      .order("name", { ascending: true });

    if (brandsError) {
      console.error("Error loading brands", brandsError);
    }

    // Daily updates – use created_at instead of date
    const { data: updatesData, error: updatesError } = await supabase
      .from("daily_updates")
      .select(
        `
        id,
        brand_id,
        created_at,
        assignee,
        status,
        focus,
        impact,
        brand:Brands ( name )
      `
      )
      .order("created_at", { ascending: false });

    if (updatesError) {
      console.error("Error loading updates", updatesError);
    }

    setBrands(brandsData || []);
    setUpdates(updatesData || []);
    setLoading(false);
  }

  // list already created_at DESC hai, to first match hi latest hoga
  function getLatestUpdate(brandId) {
    return updates.find((u) => u.brand_id === brandId);
  }

  function getStatusIcon(status) {
    if (!status) return "⚪";
    const s = status.toLowerCase();
    if (s.includes("done")) return "🟢";
    if (s.includes("progress")) return "🟡";
    if (s.includes("blocked")) return "🔴";
    return "🔘";
  }

  return (
    <Layout>
      <h1 className="page-title">Brand Performance & Daily Ops</h1>
      <p className="page-subtitle">
        Boss & management view – which brands are moving, stuck or improving.
      </p>

      {loading ? (
        <div className="card">Loading…</div>
      ) : (
        <div className="card table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Team Lead</th>
                <th>Latest Status</th>
                <th>Today Focus</th>
                <th>Impact</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => {
                const latest = getLatestUpdate(b.id);
                return (
                  <tr key={b.id}>
                    <td className="table-brand-name">{b.name}</td>
                    <td>{b.team_lead || "—"}</td>
                    <td>
                      {getStatusIcon(latest?.status)} {latest?.status || "—"}
                    </td>
                    <td>{latest?.focus || "—"}</td>
                    <td>{latest?.impact || "—"}</td>
                    <td>
                      {latest?.created_at
                        ? new Date(latest.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
