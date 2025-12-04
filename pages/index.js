// pages/index.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StatusBadge from "../components/StatusBadge";

export default function DashboardPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      const { data, error } = await supabase
        .from("Brands")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setBrands(data || []);
      }
      setLoading(false);
    }

    loadBrands();
  }, []);

  const total = brands.length;
  const onTrack = brands.filter((b) =>
    (b.status || "").toLowerCase().includes("track")
  ).length;
  const inProgress = brands.filter((b) =>
    (b.status || "").toLowerCase().includes("progress")
  ).length;

  return (
    <div>
      {/* Summary cards */}
      <section className="grid grid-3 gap-lg">
        <div className="card">
          <div className="card-label">Total Brands</div>
          <div className="card-value">{total}</div>
          <div className="card-footnote">
            Across travel, fitness & digital products.
          </div>
        </div>

        <div className="card">
          <div className="card-label">On Track</div>
          <div className="card-value text-green">{onTrack}</div>
          <div className="card-footnote">
            Stable performance & clear roadmap.
          </div>
        </div>

        <div className="card">
          <div className="card-label">In Progress / Revamp</div>
          <div className="card-value text-amber">{inProgress}</div>
          <div className="card-footnote">
            Website revamps, SEO & new campaigns in motion.
          </div>
        </div>
      </section>

      {/* Brands snapshot */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Brands Snapshot</h2>
          <p className="section-subtitle">
            Quick view of current focus & status for each brand.
          </p>
        </div>

        {loading ? (
          <div className="card">Loading brands...</div>
        ) : (
          <div className="card table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Team Lead</th>
                  <th>Status</th>
                  <th>Current Focus</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td className="table-brand-name">{b.name}</td>
                    <td>{b["team lead"]}</td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>{b.current_focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
