// pages/brand-analytics.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function BrandAnalyticsPage() {
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 1) Brands list load karo (table: "Brands" with capital B)
  useEffect(() => {
    async function loadBrands() {
      const { data, error } = await supabase
        .from("Brands") // ✅ correct table name
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading brands", error);
        setErrorMsg(error.message || "Failed to load brands");
        return;
      }

      setBrands(data || []);
    }

    loadBrands();
  }, []);

  // 🔹 2) Stats load karo selected brand + platform ke liye
  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setErrorMsg("");

      let query = supabase
        .from("brand_daily_stats") // tumhara SQL view jo humne banaya tha
        .select(
          "brand_id, brand_name:brand_name, platform, date, spend, impressions, clicks, leads, revenue, cpl, ctr"
        )
        .order("date", { ascending: false })
        .limit(60);

      if (selectedBrandId !== "all") {
        query = query.eq("brand_id", selectedBrandId);
      }

      if (selectedPlatform !== "all") {
        query = query.eq("platform", selectedPlatform);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading brand_daily_stats", error);
        setErrorMsg(error.message || "Failed to load analytics");
        setRows([]);
        setLoading(false);
        return;
      }

      setRows(data || []);
      setLoading(false);
    }

    loadStats();
  }, [selectedBrandId, selectedPlatform]);

  // 🔹 3) Aggregates calculate karo
  const totalSpend = rows.reduce((sum, r) => sum + (r.spend || 0), 0);
  const totalLeads = rows.reduce((sum, r) => sum + (r.leads || 0), 0);
  const totalClicks = rows.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const totalImpressions = rows.reduce(
    (sum, r) => sum + (r.impressions || 0),
    0
  );
  const totalRevenue = rows.reduce((sum, r) => sum + (r.revenue || 0), 0);

  const avgCPL =
    totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "—";

  const avgCTR =
    totalImpressions > 0
      ? (((totalClicks / totalImpressions) * 100).toFixed(2) + "%")
      : "—";

  return (
    <div className="page">
      <div className="layout-main">
        <section className="section">
          <h2 className="section-title">Brand Analytics</h2>
          <p className="section-subtitle">
            Har brand ke level par spend, leads, CPL &amp; CTR dekho. Upar se
            brand aur platform filter kar sakti ho.
          </p>

          {/* 🔹 Filters */}
          <div
            className="card"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label className="field-label">Brand</label>
              <select
                className="field-input"
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
              >
                <option value="all">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Platform</label>
              <select
                className="field-input"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                <option value="all">All platforms</option>
                <option value="Facebook Meta">Facebook / Instagram</option>
                <option value="Google Ads">Google Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                {/* aur platforms add kar sakti ho agar tumhari table mein hain */}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="card" style={{ marginTop: "1rem" }}>
              <p style={{ color: "#ff8080" }}>Error: {errorMsg}</p>
            </div>
          )}

          {/* 🔹 Summary cards */}
          <div className="grid grid-3" style={{ marginTop: "1rem" }}>
            <div className="card metric-card">
              <div className="metric-label">Total Spend</div>
              <div className="metric-value">£{totalSpend.toFixed(0)}</div>
            </div>

            <div className="card metric-card">
              <div className="metric-label">Total Leads</div>
              <div className="metric-value">{totalLeads}</div>
            </div>

            <div className="card metric-card">
              <div className="metric-label">Average CPL</div>
              <div className="metric-value">
                {avgCPL === "—" ? "—" : `£${avgCPL}`}
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-label">Average CTR</div>
              <div className="metric-value">{avgCTR}</div>
            </div>

            <div className="card metric-card">
              <div className="metric-label">Total Revenue</div>
              <div className="metric-value">£{totalRevenue.toFixed(0)}</div>
            </div>
          </div>

          {/* 🔹 Table */}
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h3 className="card-title">Daily breakdown</h3>

            {loading ? (
              <p>Loading brand analytics…</p>
            ) : rows.length === 0 ? (
              <p>No data found for selected filters.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Brand</th>
                      <th>Platform</th>
                      <th>Spend</th>
                      <th>Impressions</th>
                      <th>Clicks</th>
                      <th>Leads</th>
                      <th>Revenue</th>
                      <th>CPL</th>
                      <th>CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={`${row.brand_id}-${row.platform}-${row.date}`}>
                        <td>{row.date}</td>
                        <td>{row.brand_name || "—"}</td>
                        <td>{row.platform}</td>
                        <td>£{row.spend}</td>
                        <td>{row.impressions}</td>
                        <td>{row.clicks}</td>
                        <td>{row.leads}</td>
                        <td>£{row.revenue}</td>
                        <td>
                          {row.cpl !== null && row.cpl !== undefined
                            ? `£${row.cpl}`
                            : "—"}
                        </td>
                        <td>
                          {row.ctr !== null && row.ctr !== undefined
                            ? `${row.ctr}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
