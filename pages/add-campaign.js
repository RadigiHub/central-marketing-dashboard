// pages/add-campaign.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useAuth } from "../lib/auth";

export default function AddCampaignPage() {
  const { profile, loading } = useAuth();

  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [date, setDate] = useState("");
  const [platform, setPlatform] = useState("Facebook Meta");
  const [spend, setSpend] = useState("");
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [leads, setLeads] = useState("");
  const [revenue, setRevenue] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 🔐 sirf super_admin ko access
  if (!loading && profile && profile.role !== "super_admin") {
    return (
      <div className="page">
        <div className="layout-main">
          <div className="card">
            <h2>Not allowed</h2>
            <p>Sirf Super Admin yahan se campaign data add kar sakta hai.</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Brands list load
  useEffect(() => {
    async function loadBrands() {
      const { data, error } = await supabase
        .from("Brands")
        .select("id, name")
        .order("name", { ascending: true });

      if (!error && data) {
        setBrands(data);
        if (!brandId && data.length > 0) {
          setBrandId(data[0].id);
        }
      } else {
        console.error("Error loading brands", error);
      }
    }

    loadBrands();
  }, [brandId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      if (!brandId || !date || !platform) {
        setMessage("Brand, date aur platform required hain.");
        setSaving(false);
        return;
      }

      const payload = {
        brand_id: brandId,
        date, // YYYY-MM-DD
        platform,
        spend: spend ? Number(spend) : 0,
        impressions: impressions ? Number(impressions) : 0,
        clicks: clicks ? Number(clicks) : 0,
        leads: leads ? Number(leads) : 0,
        revenue: revenue ? Number(revenue) : null, // empty allowed
      };

      const { error } = await supabase.from("campaign_stats").insert([payload]);

      if (error) {
        console.error(error);
        setMessage(error.message || "Error saving data.");
      } else {
        setMessage("✅ Data save ho gaya!");

        // form reset
        setSpend("");
        setImpressions("");
        setClicks("");
        setLeads("");
        setRevenue("");
        // date & brand as-is rehne do: daily entry fast ho jati hai
      }
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error aaya, console check karo.");
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!date) {
      setDate(today);
    }
  }, [date, today]);

  return (
    <div className="page">
      <div className="layout-main">
        <div className="card">
          <h2>Add Campaign Data</h2>
          <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
            Har din ka Meta / Google / etc yahan add karo. Ye data Brand
            Analytics aur top analytics mein use hoga.
          </p>

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Brand */}
            <div className="form-field">
              <label>Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Platform */}
            <div className="form-field">
              <label>Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="Facebook Meta">Facebook Meta</option>
                <option value="Google Ads">Google Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="LinkedIn Ads">LinkedIn Ads</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Spend */}
            <div className="form-field">
              <label>Spend (£)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={spend}
                onChange={(e) => setSpend(e.target.value)}
              />
            </div>

            {/* Impressions */}
            <div className="form-field">
              <label>Impressions</label>
              <input
                type="number"
                min="0"
                step="1"
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
              />
            </div>

            {/* Clicks */}
            <div className="form-field">
              <label>Clicks</label>
              <input
                type="number"
                min="0"
                step="1"
                value={clicks}
                onChange={(e) => setClicks(e.target.value)}
              />
            </div>

            {/* Leads */}
            <div className="form-field">
              <label>Leads</label>
              <input
                type="number"
                min="0"
                step="1"
                value={leads}
                onChange={(e) => setLeads(e.target.value)}
              />
            </div>

            {/* Revenue */}
            <div className="form-field">
              <label>Revenue (£) (optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="blank if unknown"
              />
            </div>

            <div
              className="form-field"
              style={{ gridColumn: "1 / -1", marginTop: "1rem" }}
            >
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save entry"}
              </button>
            </div>
          </form>

          {message && (
            <p style={{ marginTop: "1rem", opacity: 0.9 }}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
