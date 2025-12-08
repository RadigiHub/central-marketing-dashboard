// pages/team-updates.js
import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabase";
import { useAuth } from "../lib/auth";

// --- 1. CONSTS ---------------------------------------------------------

const TASK_TYPES = [
  "Meta Ads",
  "Google Ads",
  "SEO",
  "Content",
  "Website / Landing Page",
  "Design / Creatives",
  "Reporting",
  "Other",
];

const PRIORITY_OPTIONS = [
  { value: "p1", label: "P1 – Urgent", pillClass: "pill-priority-1" },
  { value: "p2", label: "P2 – High", pillClass: "pill-priority-2" },
  { value: "p3", label: "P3 – Normal", pillClass: "pill-priority-3" },
];

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

// helper: blank form
function emptyForm(defaultBrandId = "") {
  return {
    brand_id: defaultBrandId || "",
    type: "Meta Ads",
    assigned_to: "",
    due_date: "",
    title: "",
    description: "",
    priority: "p3",
    status: "not_started",
  };
}

// --- 2. PAGE COMPONENT -------------------------------------------------

export default function TeamUpdatesPage() {
  const { user } = useAuth();

  const [brands, setBrands] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());

  // ---- load data on mount --------------------------------------------

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setErrorMessage("");

      const [brandsRes, profilesRes, tasksRes] = await Promise.all([
        supabase.from("brands").select("id, name").order("name", {
          ascending: true,
        }),
        supabase.from("profiles").select("id, full_name, role"),
        supabase
          .from("tasks")
          .select("*")
          .order("due_date", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);

      if (brandsRes.error || profilesRes.error || tasksRes.error) {
        console.error("Load error", {
          brandsError: brandsRes.error,
          profilesError: profilesRes.error,
          tasksError: tasksRes.error,
        });
        setErrorMessage("Error loading tasks. Please refresh.");
      } else {
        setBrands(brandsRes.data || []);
        setProfiles(profilesRes.data || []);
        setTasks(tasksRes.data || []);

        // default brand selection
        const firstBrand = brandsRes.data?.[0];
        if (firstBrand && !selectedBrandId) {
          setSelectedBrandId(String(firstBrand.id));
          setForm(emptyForm(String(firstBrand.id)));
        }
      }

      setLoading(false);
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- derived data ---------------------------------------------------

  const profileMap = useMemo(() => {
    const map = new Map();
    for (const p of profiles) {
      map.set(p.id, p);
    }
    return map;
  }, [profiles]);

  // ✅ Sirf core_team members assignee dropdown me
  const assignees = useMemo(
    () => profiles.filter((p) => p.role === "core_team"),
    [profiles]
  );

  const filteredTasks = useMemo(() => {
    if (!selectedBrandId) return tasks;
    return tasks.filter((t) => String(t.brand_id) === String(selectedBrandId));
  }, [tasks, selectedBrandId]);

  const selectedBrand = brands.find(
    (b) => String(b.id) === String(selectedBrandId)
  );

  // ---- handlers -------------------------------------------------------

  function openNewTaskModal() {
    setForm(emptyForm(selectedBrandId || brands[0]?.id || ""));
    setShowModal(true);
    setErrorMessage("");
  }

  function closeModal() {
    setShowModal(false);
    setErrorMessage("");
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!form.brand_id || !form.assigned_to || !form.title) {
      setErrorMessage("Brand, assignee and task title are required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const insertPayload = {
      brand_id: Number(form.brand_id),
      type: form.type,
      assigned_to: form.assigned_to,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      due_date: form.due_date || null,
      created_by: user?.id || null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error("Create task error", error);
      setErrorMessage("Could not save task. Please try again.");
    } else if (data) {
      setTasks((prev) => [...prev, data]);
      setShowModal(false);
      setForm(emptyForm(selectedBrandId));
    }

    setSaving(false);
  }

  async function toggleTaskDone(task) {
    const newStatus = task.status === "done" ? "in_progress" : "done";
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      console.error("Update task error", error);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
  }

  // priority pill helper
  function priorityLabel(priority) {
    const match = PRIORITY_OPTIONS.find((p) => p.value === priority);
    return match ? match.label : "Normal";
  }
  function priorityClass(priority) {
    const match = PRIORITY_OPTIONS.find((p) => p.value === priority);
    return match ? match.pillClass : "pill-priority-3";
  }

  // ---- render ---------------------------------------------------------

  return (
    <div className="page-shell">
      {/* Header */}
      <header className="page-header">
        <div className="page-header-main">
          <div>
            <h1 className="page-title">Team Tasks</h1>
            <p className="page-subtitle">
              Har brand ke liye daily tasks – SEO, Content, Web, Ads, Creative –
              sab ek jagah track.
            </p>
          </div>

          <button
            type="button"
            className="pill-filter"
            onClick={openNewTaskModal}
          >
            <span>+ Assign New Task</span>
          </button>
        </div>

        <div className="page-header-meta">
          <span>
            {brands.length} brands • {filteredTasks.length} active tasks
          </span>
        </div>
      </header>

      {/* Brand filter */}
      <section className="section-card" style={{ marginTop: 0 }}>
        <div className="toolbar">
          <div className="toolbar-group">
            <label style={{ fontSize: "0.8rem" }}>
              Brand
              <select
                className="input"
                style={{ marginLeft: "0.5rem" }}
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
              >
                <option value="">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Error / loading */}
      {errorMessage && (
        <div className="empty-state" style={{ color: "#fecaca" }}>
          {errorMessage}
        </div>
      )}
      {loading && !errorMessage && (
        <div className="loading-state">Loading tasks…</div>
      )}

      {/* Task list */}
      {!loading && filteredTasks.length === 0 && !errorMessage && (
        <div className="empty-state">
          <div className="empty-state-dot" />
          <span>Abhi koi task nahi – “Assign New Task” se start karo.</span>
        </div>
      )}

      {!loading && filteredTasks.length > 0 && (
        <section className="section-card" style={{ marginTop: 16 }}>
          <div className="section-label">Tasks</div>
          <div className="table-shell">
            <div className="table-head-row">
              <div>Task</div>
              <div>Owner</div>
              <div>Meta</div>
              <div>Status</div>
            </div>
            <div className="table-body">
              {filteredTasks.map((task) => {
                const brand =
                  brands.find(
                    (b) => String(b.id) === String(task.brand_id)
                  ) || selectedBrand;
                const owner = profileMap.get(task.assigned_to);

                return (
                  <div key={task.id} className="table-row">
                    {/* Task / title */}
                    <div className="table-cell-brand">
                      <span className="table-brand-name">
                        {task.title || "(Untitled task)"}
                      </span>
                      <span className="table-brand-sub">
                        {brand?.name || "Unknown brand"} • {task.type}
                      </span>
                    </div>

                    {/* Owner */}
                    <div>
                      <div className="table-team-lead">
                        {owner?.full_name || "Unknown user"}
                      </div>
                      <div className="table-brand-sub">
                        Due:{" "}
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "No date"}
                      </div>
                    </div>

                    {/* Meta */}
                    <div>
                      <span
                        className={`pill ${priorityClass(task.priority)}`}
                        style={{ marginRight: 8 }}
                      >
                        {priorityLabel(task.priority)}
                      </span>
                      <span className="table-brand-sub">
                        Created{" "}
                        {task.created_at
                          ? new Date(task.created_at).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    {/* Status / toggle */}
                    <div className="table-status-cell">
                      <button
                        type="button"
                        className="pill-filter"
                        onClick={() => toggleTaskDone(task)}
                      >
                        <span>
                          {task.status === "done"
                            ? "Mark in progress"
                            : "Mark done"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* --- Modal: Assign New Task ------------------------------------ */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Assign New Task</h2>

            <form onSubmit={handleCreateTask}>
              <div className="form-grid">
                {/* Brand */}
                <label>
                  Brand
                  <select
                    className="input"
                    value={form.brand_id}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        brand_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Date */}
                <label>
                  Deadline
                  <input
                    type="date"
                    className="input"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        due_date: e.target.value,
                      }))
                    }
                  />
                </label>

                {/* Task type */}
                <label>
                  Task type
                  <select
                    className="input"
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Assigned to – sirf core_team se aa raha hai */}
                <label>
                  Assigned to
                  <select
                    className="input"
                    value={form.assigned_to}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        assigned_to: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select team member…</option>
                    {assignees.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Title */}
                <label className="full-width">
                  Task title
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 123 Flights – new Meta creatives"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </label>

                {/* Description */}
                <label className="full-width">
                  Task description
                  <textarea
                    rows={4}
                    className="input"
                    placeholder="Details, links, access info, references, etc."
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </label>

                {/* Priority */}
                <label>
                  Priority
                  <select
                    className="input"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Status */}
                <label>
                  Status
                  <select
                    className="input"
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {errorMessage && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "0.8rem",
                    color: "#fecaca",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="pill-filter"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="pill-filter pill-filter--active"
                  disabled={saving}
                >
                  <span>{saving ? "Saving…" : "Assign Task"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
