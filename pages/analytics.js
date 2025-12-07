// pages/analytics.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function AnalyticsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      // brand_daily_stats view se latest data
      const { data, error } = await supabase
        .from("brand_daily_stats")
        .select("*")
        .order("date", { ascending: false })
        .limit(200); // zyada rows hon to yahan number adjust kar lena

      if (error) {
        console.error("Error loading analytics", error);
        setError("Analytics load karte huay error aa gaya.");
      } else {
        setRows(data || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="layout-main">
          <div className="card">
            <h2>Analytics</h2>
            <p>Loading analytics…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="layout-main">
          <div className="card">
            <h2>Analytics</h2>
            <p className="text-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔢 Top-level summary (totals)
  const totalSpend = rows.reduce((sum, r) => sum + (r.spend || 0), 0);
  const totalLeads = rows.reduce((sum, r) => sum + (r.leads || 0), 0);
  const totalImpressions = rows.reduce(
    (sum, r) => sum + (r.impressions || 0),
    0
  );
  const totalClicks = rows.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const totalRevenue = rows.reduce((sum, r) => sum + (r.revenue || 0), 0);

  const avgCpl =
    totalLeads > 0 ? Number(totalSpend / totalLeads).toFixed(2) : "-";
  const avgCtr =
    totalImpressions > 0
      ? Number((totalClicks / totalImpressions) * 100).toFixed(2)
      : "-";

  return (
    <div className="page">
      <div className="layout-main">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">
          High level view of spend, leads, CPL & CTR across all brands.
        </p>

        {/* Summary cards */}
        <div className="cards-grid">
          <div className="card">
            <h3>Total Spend</h3>
            <p className="metric">
              £{Number(totalSpend).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          <div className="card">
            <h3>Total Leads</h3>
            <p className="metric">
              {Number(totalLeads).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          <div className="card">
            <h3>Average CPL</h3>
            <p className="metric">
              {avgCpl === "-" ? "-" : `£${avgCpl}`}
            </p>
          </div>

          <div className="card">
            <h3>Average CTR</h3>
            <p className="metric">
              {avgCtr === "-" ? "-" : `${avgCtr}%`}
            </p>
          </div>
        </div>

        {/* Detailed table */}
        <div className="card">
          <h2>Brand daily performance (latest rows)</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Brand</th>
                  <th>Platform</th>
                  <th className="num">Spend</th>
                  <th className="num">Impressions</th>
                  <th className="num">Clicks</th>
                  <th className="num">Leads</th>
                  <th className="num">Revenue</th>
                  <th className="num">CPL</th>
                  <th className="num">CTR</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.brand_id}-${row.platform}-${row.date}`}>
                    <td>{row.date}</td>
                    <td>{row.brand_name}</td>
                    <td>{row.platform}</td>
                    <td className="num">
                      £{Number(row.spend || 0).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="num">
                      {Number(row.impressions || 0).toLocaleString()}
                    </td>
                    <td className="num">
                      {Number(row.clicks || 0).toLocaleString()}
                    </td>
                    <td className="num">
                      {Number(row.leads || 0).toLocaleString()}
                    </td>
                    <td className="num">
                      £{Number(row.revenue || 0).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="num">
                      {row.cpl == null ? "-" : `£${row.cpl}`}
                    </td>
                    <td className="num">
                      {row.ctr == null ? "-" : `${row.ctr}%`}
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center" }}>
                      No analytics data found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
