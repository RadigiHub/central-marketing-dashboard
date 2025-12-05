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

    const { data: brandsData } = await supabase
      .from("Brands")
      .select("*")
      .order("priority", { ascending: true });

    const { data: updatesData } = await supabase
      .from("daily_updates")
      .select("*, brand:Brands(name)")
      .order("date", { ascending: false });

    setBrands(brandsData || []);
    setUpdates(updatesData || []);
    setLoading(false);
  }

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
                    <td>{b.team_lead}</td>
                    <td>
                      {getStatusIcon(latest?.status)} {latest?.status || "—"}
                    </td>
                    <td>{latest?.focus || "—"}</td>
                    <td>{latest?.impact || "—"}</td>
                    <td>
                      {latest?.date
                        ? new Date(latest.date).toLocaleString()
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
