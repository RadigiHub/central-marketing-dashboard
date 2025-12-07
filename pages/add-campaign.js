// pages/add-campaign.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

const PLATFORMS = ["Facebook Meta", "Google Ads", "TikTok Ads", "Other"];

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// date range ke beech ke saare din banaane ke helper
function buildDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const dates = [];
  let cur = startDate;

  while (cur <= endDate) {
    dates.push(cur.toISOString().slice(0, 10));
    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
  }

  return dates;
}

export default function AddCampaignPage() {
  const [brands, setBrands] = useState([]);

  const [brandId, setBrandId] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [mode, setMode] = useState("single"); // "single" | "range"

  const [date, setDate] = useState(todayISO());
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());

  const [impressions, setImpressions] = useState("");
  const [spend, setSpend] = useState("");
  const [clicks, setClicks] = useState("");
  const [leads, setLeads] = useState("");
  const [revenue, setRevenue] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Brands load karna
  useEffect(() => {
    async function loadBrands() {
      const { data, error } = await supabase
        .from("Brands")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        setError("Brands load kernay mein issue aa gaya.");
        return;
      }

      setBrands(data || []);
      if (data && data.length > 0) {
        setBrandId(data[0].id);
      }
    }

    loadBrands();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!brandId) {
      setError("Brand select karo pehle.");
      return;
    }

    if (!spend && !impressions && !clicks && !leads && !revenue) {
      setError("Kuch na kuch metric fill karo (spend/leads etc.).");
      return;
    }

    try {
      setSaving(true);

      const baseRow = {
        brand_id: brandId,
        platform,
        impressions: impressions ? Number(impressions) : 0,
        spend: spend ? Number(spend) : 0,
        clicks: clicks ? Number(clicks) : 0,
        leads: leads ? Number(leads) : 0,
        revenue: revenue ? Number(revenue) : null, // optional
      };

      let rowsToInsert = [];

      if (mode === "single") {
        if (!date) {
          setError("Date select karo.");
          setSaving(false);
          return;
        }

        rowsToInsert = [{ ...baseRow, date }];
      } else {
        // range mode
        if (!startDate || !endDate) {
          setError("Start aur end date dono select karo.");
          setSaving(false);
          return;
        }

        if (startDate > endDate) {
          setError("Start date end date se pehle honi chahiye.");
          setSaving(false);
          return;
        }

        const dates = buildDateRange(startDate, endDate);

        rowsToInsert = dates.map((d) => ({
          ...baseRow,
          date: d,
        }));
      }

      const { error: insertError } = await supabase
        .from("campaign_stats")
        .insert(rowsToInsert);

      if (insertError) {
        console.error(insertError);
        setError("Data save kerte waqt issue aa gaya.");
        setSaving(false);
        return;
      }

      // form reset
      setImpressions("");
      setSpend("");
      setClicks("");
      setLeads("");
      setRevenue("");
      if (mode === "single") {
        setDate(todayISO());
      } else {
        setStartDate(todayISO());
        setEndDate(todayISO());
      }

      setSuccess(
        mode === "single"
          ? "1 din ka data save ho gaya ✅"
          : `${rowsToInsert.length} din ka data save ho gaya ✅`
      );
    } finally {
      setSaving(false);
    }
  }

  const dateSection =
    mode === "single" ? (
      <div className="form-field">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    ) : (
      <>
        <div className="form-field">
          <label>Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </>
    );

  return (
    <div className="page">
      <div className="layout-main">
        <div className="section-card">
          <h2 className="page-title">Add Campaign Data</h2>
          <p className="page-subtitle">
            Har din ka Meta / Google / etc yahan add karo. Ye data Brand
            Analytics aur top analytics mein use hoga.
          </p>

          {/* Mode toggle */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              margin: "16px 0 8px",
              fontSize: "0.8rem",
            }}
          >
            <button
              type="button"
              className={`pill-filter ${
                mode === "single" ? "pill-filter--active" : ""
              }`}
              onClick={() => setMode("single")}
            >
              <span>Single day</span>
            </button>
            <button
              type="button"
              className={`pill-filter ${
                mode === "range" ? "pill-filter--active" : ""
              }`}
              onClick={() => setMode("range")}
            >
              <span>Date range (multi-day)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginTop: "12px" }}>
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

              {/* Date or date range */}
              {dateSection}

              {/* Platform */}
              <div className="form-field">
                <label>Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
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
                  placeholder="blank if unknown"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "0.8rem",
                  color: "#fecaca",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "0.8rem",
                  color: "#bbf7d0",
                }}
              >
                {success}
              </div>
            )}

            <div style={{ marginTop: "18px" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ width: "100%" }}
              >
                {saving
                  ? "Saving…"
                  : mode === "single"
                  ? "Save entry"
                  : "Save all days in range"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
