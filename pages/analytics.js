// pages/analytics.js
import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabase";

const PRIORITY_LABEL = {
  p1: "P1 – Urgent",
  p2: "P2 – High",
  p3: "P3 – Normal",
};

const STATUS_LABEL = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

export default function TaskAnalyticsPage() {
  const [brands, setBrands] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ---- Load data ------------------------------------------------------
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setErrorMessage("");

      const [brandsRes, profilesRes, tasksRes] = await Promise.all([
        supabase.from("Brands").select("id, name").order("name", {
          ascending: true,
        }),
        supabase.from("profiles").select("id, full_name, role"),
        supabase
          .from("tasks")
          .select("*")
          .order("deadline", { ascending: true }) // 👈 yahan change
          .order("created_at", { ascending: false }),
      ]);

      if (brandsRes.error || profilesRes.error || tasksRes.error) {
        console.error("Task analytics load error", {
          brandsError: brandsRes.error,
          profilesError: profilesRes.error,
          tasksError: tasksRes.error,
        });
        setErrorMessage("Error loading task analytics. Please refresh.");
      } else {
        setBrands(brandsRes.data || []);
        setProfiles(profilesRes.data || []);
        setTasks(tasksRes.data || []);

        if (!selectedBrandId && brandsRes.data && brandsRes.data.length > 0) {
          setSelectedBrandId(String(brandsRes.data[0].id));
        }
      }

      setLoading(false);
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Derived data ---------------------------------------------------

  const profileMap = useMemo(() => {
    const m = new Map();
    for (const p of profiles) {
      m.set(p.id, p);
    }
    return m;
  }, [profiles]);

  const filteredTasks = useMemo(() => {
    if (!selectedBrandId) return tasks;
    return tasks.filter(
      (t) => String(t.brand_id) === String(selectedBrandId)
    );
  }, [tasks, selectedBrandId]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const totalTasks = filteredTasks.length;
  const doneTasks = filteredTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in_progress"
  ).length;
  const blockedTasks = filteredTasks.filter(
    (t) => t.status === "blocked"
  ).length;

  const overdueTasks = filteredTasks.filter((t) => {
  if (!t.deadline) return false;
  const d = new Date(t.deadline);
  d.setHours(0, 0, 0, 0);
  return d < today && t.status !== "done";
}).length;

  const completionRate =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  function formatDate(value) {
    if (!value) return "No date";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  }

  // ---- Render ---------------------------------------------------------

  return (
    <div className="page-shell">
      {/* Header */}
      <header className="page-header">
        <div className="page-header-main">
          <div>
            <h1 className="page-title">Analytics – Team Tasks</h1>
            <p className="page-subtitle">
              Yahan se dekh sakte ho har brand ka overall task workload:
              kitne tasks banay, kitne complete, kitne block / overdue.
            </p>
          </div>
        </div>

        <div className="page-header-meta">
          <span>
            {brands.length} brands • {totalTasks} tasks (filtered)
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
        <div className="loading-state">Loading task analytics…</div>
      )}

      {/* Metrics */}
      {!loading && !errorMessage && (
        <section className="section" style={{ marginTop: 16 }}>
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-label">Total Tasks</div>
              <div className="metric-value">{totalTasks}</div>
              <div className="metric-context">
                Is brand filter ke andar jitne bhi tasks hain (all statuses).
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Completed</div>
              <div className="metric-value">{doneTasks}</div>
              <div className="metric-context">
                Completion rate ~{completionRate}%.
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">In Progress / Blocked</div>
              <div className="metric-value">
                {inProgressTasks} in progress • {blockedTasks} blocked
              </div>
              <div className="metric-context">
                Overdue (date nikal chuki, done nahi): {overdueTasks}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Task table */}
      {!loading && !errorMessage && (
        <section className="section-card" style={{ marginTop: 16 }}>
          <div className="section-label">Task breakdown</div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-dot" />
              <span>
                Is brand / filter ke liye abhi koi task nahi mila.
              </span>
            </div>
          ) : (
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
                    ) || null;
                  const owner = profileMap.get(task.assigned_to);

                  const priority = PRIORITY_LABEL[task.priority] || "Normal";
                  const statusLabel =
                    STATUS_LABEL[task.status] || task.status || "Unknown";

                  return (
                    <div key={task.id} className="table-row">
                      {/* Task / title */}
                      <div className="table-cell-brand">
                        <span className="table-brand-name">
                          {task.title || "(Untitled task)"}
                        </span>
                        <span className="table-brand-sub">
                          {brand?.name || "Unknown brand"} •{" "}
                          {task.type || "Task"}
                        </span>
                      </div>

                      {/* Owner */}
                      <div>
                        <div className="table-team-lead">
                          {owner?.full_name || "Unassigned"}
                        </div>
                        <div className="table-brand-sub">
                          Due: {formatDate(task.deadline)}
                        </div>
                      </div>

                      {/* Meta */}
                      <div>
                        <span
                          className={`pill ${
                            task.priority === "p1"
                              ? "pill-priority-1"
                              : task.priority === "p2"
                              ? "pill-priority-2"
                              : "pill-priority-3"
                          }`}
                          style={{ marginRight: 8 }}
                        >
                          {priority}
                        </span>
                        <span className="table-brand-sub">
                          Created {formatDate(task.created_at)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="table-status-cell">
                        <span className="pill pill-neutral">
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
