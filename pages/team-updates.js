// pages/team-updates.js
import { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import supabase from "../lib/supabase";

export default function TeamUpdatesPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [updates, setUpdates] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);

  // form state
  const [form, setForm] = useState({
    brand_id: "",
    assignee: "",
    status: "in progress",
    focus: "",
    impact: "",
  });

  // ---------- Helpers ----------
  function resetForm() {
    setForm({
      brand_id: "",
      assignee: "",
      status: "in progress",
      focus: "",
      impact: "",
    });
    setEditingUpdate(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(update) {
    setEditingUpdate(update);
    setForm({
      brand_id: update.brand_id,
      assignee: update.assignee || "",
      status: update.status || "in progress",
      focus: update.focus || "",
      impact: update.impact || "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  function handleFormChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ---------- Load brands + updates ----------
  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchUpdates();
  }, [selectedDate]);

  async function fetchBrands() {
    const { data, error } = await supabase
      .from("Brands")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setBrands(data || []);
    }
  }

  async function fetchUpdates() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("daily_updates")
      .select(
        `
        id,
        brand_id,
        date,
        created_at,
        assignee,
        status,
        focus,
        impact,
        Brands ( name )
      `
      )
      .eq("date", selectedDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Could not load updates.");
    } else {
      const mapped = (data || []).map((row) => ({
        ...row,
        brand_name: row.Brands?.name || "",
      }));
      setUpdates(mapped);
    }

    setLoading(false);
  }

  // ---------- Create / Update ----------
  async function handleSave(e) {
    e.preventDefault();
    if (!form.brand_id || !form.assignee.trim() || !form.focus.trim()) {
      alert("Brand, assignee aur focus required hain.");
      return;
    }

    setSaving(true);
    try {
      if (editingUpdate) {
        // UPDATE
        const { error } = await supabase
          .from("daily_updates")
          .update({
            brand_id: form.brand_id,
            assignee: form.assignee,
            status: form.status,
            focus: form.focus,
            impact: form.impact,
          })
          .eq("id", editingUpdate.id);

        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase.from("daily_updates").insert([
          {
            brand_id: form.brand_id,
            date: selectedDate,
            assignee: form.assignee,
            status: form.status,
            focus: form.focus,
            impact: form.impact,
          },
        ]);

        if (error) throw error;
      }

      await fetchUpdates(); // refresh list
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Error saving update – console check karo.");
    } finally {
      setSaving(false);
    }
  }

  // ---------- Delete ----------
  async function handleDelete(update) {
    if (
      !window.confirm(
        `Delete karein? "${update.brand_name}" ka yeh update hamesha ke liye hat jayega.`
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("daily_updates")
        .delete()
        .eq("id", update.id);

      if (error) throw error;

      setUpdates((prev) => prev.filter((u) => u.id !== update.id));
    } catch (err) {
      console.error(err);
      alert("Error deleting update.");
    }
  }

  // ---------- Render ----------
  return (
    <Layout>
      <Head>
        <title>Team Updates • Central Marketing Dashboard</title>
      </Head>

      <div className="page-header">
        <div>
          <h1 className="page-title">Team Updates</h1>
          <p className="page-subtitle">
            Roz ka detailed log – kis brand pe kis ne kya kaam kia.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreate}>
          + Add Update
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <label className="toolbar-label">
            Date
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            Updates for {selectedDate}{" "}
            <span className="muted">({updates.length})</span>
          </h2>
        </div>

        <div className="card-body table-wrapper">
          {loading ? (
            <div>Loading updates…</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : updates.length === 0 ? (
            <div className="empty">Is date ke liye koi updates nahi hain.</div>
          ) : (
            <div className="table-shell">
              <div className="table-head-row">
                <div>Time</div>
                <div>Brand</div>
                <div>Assignee</div>
                <div>Status</div>
                <div>Today&apos;s Focus</div>
                <div>Impact / Result</div>
                <div className="table-col-actions">Actions</div>
              </div>

              <div className="table-body">
                {updates.map((u) => (
                  <div key={u.id} className="table-row">
                    <div className="table-cell">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </div>
                    <div className="table-cell">{u.brand_name || "—"}</div>
                    <div className="table-cell">{u.assignee || "—"}</div>
                    <div className="table-cell">{u.status || "—"}</div>
                    <div className="table-cell">{u.focus || "—"}</div>
                    <div className="table-cell">{u.impact || "—"}</div>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(u)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">
              {editingUpdate ? "Edit Update" : "Add Update"}
            </h2>

            <form onSubmit={handleSave} className="modal-body">
              <div className="form-grid">
                <label>
                  Brand
                  <select
                    className="select"
                    value={form.brand_id}
                    onChange={(e) => handleFormChange("brand_id", e.target.value)}
                    required
                  >
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Assignee
                  <input
                    className="input"
                    value={form.assignee}
                    onChange={(e) =>
                      handleFormChange("assignee", e.target.value)
                    }
                    placeholder="e.g. Noraiz, Tahir…"
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    className="select"
                    value={form.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                  >
                    <option value="in progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </label>
              </div>

              <label className="full-width">
                Today&apos;s focus
                <textarea
                  className="textarea"
                  rows={2}
                  value={form.focus}
                  onChange={(e) => handleFormChange("focus", e.target.value)}
                  placeholder="Kis cheez pe kaam hua?"
                  required
                />
              </label>

              <label className="full-width">
                Impact / result
                <textarea
                  className="textarea"
                  rows={2}
                  value={form.impact}
                  onChange={(e) => handleFormChange("impact", e.target.value)}
                  placeholder="Is se kya result / impact aaya?"
                />
              </label>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
