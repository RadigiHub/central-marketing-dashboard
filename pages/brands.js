// pages/brands.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StatusBadge from "../components/StatusBadge";

export default function BrandsPage() {
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

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">All Brands</h2>
        <p className="section-subtitle">
          Detailed overview of each brand&apos;s website, SEO & campaign status.
        </p>
      </div>

      {loading ? (
        <div className="card">Loading brands...</div>
      ) : (
        <div className="grid grid-2 gap-lg">
          {brands.map((b) => (
            <div key={b.id} className="card brand-card">
              <div className="brand-card-header">
                <h3 className="brand-card-title">{b.name}</h3>
                <StatusBadge status={b.status} />
              </div>

              <div className="brand-card-meta">
                <div>
                  <span className="meta-label">Team Lead</span>
                  <span className="meta-value">{b["team lead"]}</span>
                </div>
              </div>

              <div className="brand-card-body">
                <div className="meta-label mb-2">Current Focus</div>
                <p className="brand-focus">{b.current_focus}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
