// pages/tasks.js
import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabase";
import { useAuth } from "../lib/auth";

const TASK_TYPES = [
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "Performance Reporting",
  "Campaign Optimization",
  "Retargeting Setup",
  "SEO",
  "Technical SEO",
  "On-Page SEO",
  "Off-Page SEO",
  "Keyword Mapping",
  "Backlink Outreach",
  "Search Console Fixes",
  "Content",
  "Copywriting",
  "Creative Design",
  "Social Posts",
  "Newsletter / Email Content",
  "Reels / TikTok Editing",
  "Landing Page Copy",
  "Web Development",
  "Bug Fix",
  "UI/UX Improvements",
  "CRO Improvements",
  "Page Speed Optimization",
  "Pixel / GA4 / GTM Tracking",
  "UTM Setup",
  "Brand Strategy",
  "Messaging & Tone of Voice",
  "Brand Asset Update",
  "Campaign Concept",
  "Email Automation",
  "WhatsApp Automation",
  "CRM Setup",
  "Lead Pipeline Optimization",
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUS_LABELS = {
  assigned: "Assigned",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
  blocked: "Blocked",
};

export default function TasksPage() {
  const { profile } = useAuth();
  const role = profile?.role || null;

  const isAdmin =
    role === "super_admin" || role === "boss" || role === "manager";

  const [brands, setBrands] = useState([]);
  const [members, setMembers] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState({
    brandId: "all",
    assigneeId: "all",
    status: "all",
  });

  const [form, setForm] = useState({
    brand_id: "",
    title: "",
    type: TASK_TYPES[0],
    assigned_to: "",
    priority: "medium",
    deadline: "",
    description: "",
  });

  // -----------------------------
  // Load brands, members, tasks
  // -----------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const [brandsRes, membersRes] = await Promise.all([
        supabase
          .from("Brands")
          .select("id, name")
          .order("name", { ascending: true }),

        // dropdown me sirf core_team members
        supabase
          .from("profiles")
          .select("id, full_name, role, email")
          .eq("role", "core_team")
          .order("full_name", { ascending: true }),
      ]);

      if (brandsRes.error) {
        console.error("Error loading brands", brandsRes.error);
      } else {
        setBrands(brandsRes.data || []);
      }

      if (membersRes.error) {
        console.error("Error loading members", membersRes.error);
      } else {
        setMembers(membersRes.data || []);
      }

      await fetchTasks();
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // Supabase se tasks laao (simple select)
  // -----------------------------
  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        type,
        priority,
        status,
        deadline,
        created_at,
        brand_id,
        assigned_to,
        description,
        created_by
      `
      )
      .order("deadline", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading tasks", error);
      return;
    }

    let rows = data || [];

    // core_team user ko sirf apne tasks
    if (role === "core_team") {
      rows = rows.filter((t) => t.assigned_to === profile?.id);
    }

    setTasks(rows);
  }

  // -----------------------------
  // Modal open/close
  // -----------------------------
  function openModal() {
    setForm((prev) => ({
      ...prev,
      brand_id: brands[0]?.id || "",
      assigned_to: members[0]?.id || "",
      type: TASK_TYPES[0],
      priority: "medium",
      deadline: "",
    }));
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm({
      brand_id: "",
      title: "",
      type: TASK_TYPES[0],
      assigned_to: "",
      priority: "medium",
      deadline: "",
      description: "",
    });
  }

  function handleFormChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // -----------------------------
  // Task save + email notify
  // -----------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.brand_id || !form.title.trim() || !form.assigned_to) {
      alert("Brand, task title aur assignee required hain.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        brand_id: form.brand_id,
        title: form.title.trim(),
        type: form.type,
        assigned_to: form.assigned_to,
        priority: form.priority,
        deadline: form.deadline || null,
        description: form.description?.trim() || null,
        status: "assigned",
        created_by: profile?.id || null,
      };

      const { error } = await supabase.from("tasks").insert([payload]);

      if (error) {
        console.error("Error inserting task", error);
        alert("Task save kerte waqt error aaya:\n" + error.message);
        return;
      }

      // -------------------------
      // NEW: Email notification
      // -------------------------
      try {
        const brand = brands.find((b) => b.id === payload.brand_id);
        const assignee = members.find((m) => m.id === payload.assigned_to);

        const assigneeEmail = assignee?.email;
        const assigneeName = assignee?.full_name || "Team member";

        if (assigneeEmail) {
          await fetch("/api/notify/task-assigned", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: assigneeEmail,
              brandName: brand?.name || "Unknown brand",
              title: payload.title,
              type: payload.type,
              assigneeName,
              deadline: payload.deadline,
              description: payload.description,
            }),
          });
        } else {
          console.warn(
            "No email found for assignee id: ",
            payload.assigned_to
          );
        }
      } catch (notifyErr) {
        // Email fail ho jaye to bhi UI ko block nahi karna
        console.error("Error calling /api/notify/task-assigned", notifyErr);
      }

      await fetchTasks();
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Filters
  // -----------------------------
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.brandId !== "all" && t.brand_id !== filters.brandId) {
        return false;
      }
      if (filters.assigneeId !== "all" && t.assigned_to !== filters.assigneeId) {
        return false;
      }
      if (filters.status !== "all" && t.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);

  function priorityClass(priority) {
    return `badge-priority badge-priority-${priority}`;
  }

  function statusClass(status) {
    return `status-chip status-chip-${status}`;
  }

  // Helpers to show names instead of IDs
  function getBrandName(brand_id) {
    const b = brands.find((br) => br.id === brand_id);
    return b?.name || "—";
  }

  function getAssigneeName(user_id) {
    const m = members.find((mb) => mb.id === user_id);
    return m ? `${m.full_name} (${m.role})` : "—";
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-main">
          <div>
            <h1 className="page-title">Tasks & Workloads</h1>
            <p className="page-subtitle">
              Har brand ke liye daily tasks – SEO, Content, Web, Ads, Creative –
              sab ek jagah track.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openModal}
            >
              + Assign New Task
            </button>
          )}
        </div>

        <div className="page-header-meta">
          <span>Total tasks: {filteredTasks.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="toolbar-group">
          <label className="toolbar-label">
            Brand
            <select
              className="select"
              value={filters.brandId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, brandId: e.target.value }))
              }
            >
              <option value="all">All brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className="toolbar-label">
            Assignee
            <select
              className="select"
              value={filters.assigneeId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, assigneeId: e.target.value }))
              }
            >
              <option value="all">Everyone</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.role})
                </option>
              ))}
            </select>
          </label>

          <label className="toolbar-label">
            Status
            <select
              className="select"
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="all">All</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="section-card">
        {loading ? (
          <div className="loading-state">Loading tasks…</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-dot" />
            <span>No tasks yet – start assigning work from the top-right.</span>
          </div>
        ) : (
          <div className="table-shell">
            <div
              className="table-head-row"
              style={{
                gridTemplateColumns:
                  "minmax(180px, 1.6fr) 1fr 1fr 0.9fr 0.9fr 0.9fr",
              }}
            >
              <div>Task</div>
              <div>Brand</div>
              <div>Assignee</div>
              <div>Priority</div>
              <div>Status</div>
              <div>Deadline</div>
            </div>

            <div className="table-body">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="table-row"
                  style={{
                    gridTemplateColumns:
                      "minmax(180px, 1.6fr) 1fr 1fr 0.9fr 0.9fr 0.9fr",
                  }}
                >
                  {/* Task */}
                  <div className="table-cell-brand">
                    <div className="table-brand-name">{t.title}</div>
                    <div className="table-brand-sub">{t.type}</div>
                  </div>

                  {/* Brand */}
                  <div className="table-team-lead">
                    {getBrandName(t.brand_id)}
                  </div>

                  {/* Assignee */}
                  <div className="table-team-lead">
                    {getAssigneeName(t.assigned_to)}
                  </div>

                  {/* Priority */}
                  <div>
                    <span className={priorityClass(t.priority)}>
                      <span className="badge-dot" />
                      {t.priority.toUpperCase()}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={statusClass(t.status)}>
                      <span className="status-chip-dot" />
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                  </div>

                  {/* Deadline */}
                  <div>
                    {t.deadline
                      ? new Date(t.deadline).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Assign Task */}
      {showModal && isAdmin && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Assign New Task</h2>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                {/* Brand */}
                <label>
                  Brand
                  <select
                    className="select"
                    value={form.brand_id}
                    onChange={(e) =>
                      handleFormChange("brand_id", e.target.value)
                    }
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

                {/* Assignee */}
                <label>
                  Assigned to
                  <select
                    className="select"
                    value={form.assigned_to}
                    onChange={(e) =>
                      handleFormChange("assigned_to", e.target.value)
                    }
                    required
                  >
                    <option value="">Select team member…</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.role})
                      </option>
                    ))}
                  </select>
                </label>

                {/* Task Type */}
                <label>
                  Task type
                  <select
                    className="select"
                    value={form.type}
                    onChange={(e) =>
                      handleFormChange("type", e.target.value)
                    }
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Priority */}
                <label>
                  Priority
                  <select
                    className="select"
                    value={form.priority}
                    onChange={(e) =>
                      handleFormChange("priority", e.target.value)
                    }
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Deadline */}
                <label>
                  Deadline
                  <input
                    type="date"
                    className="input"
                    value={form.deadline}
                    onChange={(e) =>
                      handleFormChange("deadline", e.target.value)
                    }
                  />
                </label>

                {/* Title */}
                <label>
                  Task title
                  <input
                    className="input"
                    placeholder="e.g. 123 Flights – new Meta creatives"
                    value={form.title}
                    onChange={(e) =>
                      handleFormChange("title", e.target.value)
                    }
                    required
                  />
                </label>
              </div>

              {/* Description */}
              <label className="full-width" style={{ marginTop: "0.75rem" }}>
                Task description
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Details, links, access info, references, etc."
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
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
                  {saving ? "Saving…" : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
