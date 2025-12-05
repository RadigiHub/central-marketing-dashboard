import { useState, useEffect } from "react";
import supabase from "../lib/supabaseClient";
import Layout from "../components/Layout";

export default function TeamUpdates() {
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand_id: "",
    assignee: "",
    status: "",
    focus: "",
    impact: "",
  });

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    const { data } = await supabase.from("Brands").select("id, name");
    setBrands(data);
  }

  async function saveUpdate() {
    setSaving(true);
    const { error } = await supabase.from("daily_updates").insert({
      ...form,
      date: new Date(),
    });

    if (error) alert("Error saving");
    else alert("Saved successfully");

    setSaving(false);
  }

  return (
    <Layout>
      <h2>Team Daily Log</h2>
      <p>Add your daily brand updates below:</p>

      <select onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
        <option>Select Brand</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <input placeholder="Your Name"
        onChange={(e) => setForm({ ...form, assignee: e.target.value })}
      />

      <input placeholder="Status update"
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      />

      <input placeholder="Today's Focus"
        onChange={(e) => setForm({ ...form, focus: e.target.value })}
      />

      <input placeholder="Impact"
        onChange={(e) => setForm({ ...form, impact: e.target.value })}
      />

      <button disabled={saving} onClick={saveUpdate}>
        {saving ? "Saving..." : "Save Update"}
      </button>
    </Layout>
  );
}
