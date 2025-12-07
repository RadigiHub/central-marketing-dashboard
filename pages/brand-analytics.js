// pages/brand-analytics.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useAuth } from "../lib/auth";

export default function BrandAnalytics() {
  const { profile } = useAuth();
  const role = profile?.role;

  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Fetch brands
  useEffect(() => {
    async function loadBrands() {
      let { data, error } = await supabase.from("brands").select("id, name");

      if (error) console.error(error);

      // if brand lead → show only their brand
      if (role === "brand_lead") {
        const filtered = data.filter((b) => b.id === profile.brand_id);
        setBrands(filtered);
        setSelectedBrand(filtered[0]?.id);
      } else {
        setBrands(data);
        setSelectedBrand(data[0]?.id);
      }
    }
    loadBrands();
  }, [role, profile]);

  // 2️⃣ Fetch stats of selected brand
  useEffect(() => {
    if (!selectedBrand) return;

    async function loadStats() {
      setLoading(true);

      let { data, error } = await supabase
        .from("campaign_stats")
        .select("*")
        .eq("brand_id", selectedBrand)
        .order("date", { ascending: false })
        .limit(30);

      if (error) console.error(error);

      setStats(data || []);
      setLoading(false);
    }

    loadStats();
  }, [selectedBrand]);

  // 3️⃣ Meta calc
  const metaStats = stats.filter((s) => s.platform === "Meta");
  const googleStats = stats.filter((s) => s.platform === "Google");

  const sum = (arr, field) => arr.reduce((a, b) => a + (b[field] || 0), 0);

  const metaSpend = sum(metaStats, "spend");
  const metaLeads = sum(metaStats, "leads");
  const metaCPL = metaLeads ? (metaSpend / metaLeads).toFixed(2) : 0;

  const googleSpend = sum(googleStats, "spend");
  const googleLeads = sum(googleStats, "leads");
  const googleCPL = googleLeads ? (googleSpend / googleLeads).toFixed(2) : 0;

  return (
    <div className="page">
      <div className="layout-main">
        <h1>Brand Analytics Overview</h1>
        <p>Select brand to view ads & spend performance.</p>

        {/* Brand Dropdown */}
        <select
          className="brand-select"
          value={selectedBrand || ""}
          onChange={(e) => setSelectedBrand(e.target.value)}
          disabled={role === "brand_lead"}
        >
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {loading ? (
          <p>Loading stats…</p>
        ) : (
          <>
            {/* Meta Block */}
            <div className="stats-block">
              <h2>Meta Ads</h2>
              <p>Total Spend: £{metaSpend}</p>
              <p>Leads: {metaLeads}</p>
              <p>Avg CPL: £{metaCPL}</p>
            </div>

            {/* Google Block */}
            <div className="stats-block">
              <h2>Google Ads</h2>
              <p>Total Spend: £{googleSpend}</p>
              <p>Leads: {googleLeads}</p>
              <p>Avg CPL: £{googleCPL}</p>
            </div>

            {/* Table */}
            <h2>Daily Campaign Log</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Platform</th>
                  <th>Spend</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>Leads</th>
                  <th>CPL</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td>{s.platform}</td>
                    <td>£{s.spend}</td>
                    <td>{s.impressions}</td>
                    <td>{s.clicks}</td>
                    <td>{s.leads}</td>
                    <td>£{(s.spend / s.leads).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
