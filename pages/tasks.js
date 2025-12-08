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

// yahan ap real emails daal lena:
const CORE_TEAM_EMAILS = {
  // "Shehroz Malik": "tumhara-email@example.com",
  // "Muskan": "muskan@example.com",
  // "Tahir": "tahir@example.com",
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

  // Load brands, members, tasks
  useEffect(() => {
    async function load() {
      setLoading(true);

      const [brandsRes, membersRes] = await Promise.all([
        supabase
          .from("Brands")
          .select("id, name")
          .order("name", { ascending: true }),
        supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("role", ["core_team", "manager", "super_admin", "boss"])
          .order("full_name", { ascending: true }),
      ]);

      if (!brandsRes.error) {
        setBrands(brandsRes.data || []);
      } else {
        console.error("Error loading brands", brandsRes.error);
      }

      if (!membersRes.error) {
        setMembers(membersRes.data || []);
      } else {
        console.error("Error loading members", membersRes.error);
      }

      await fetchTasks();
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        description,
        brand:Brands ( id, name ),
        assignee:profiles ( id, full_name )
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
      rows = rows.filter((t) => t.assignee?.id === profile?.id);
    }

    setTasks(rows);
  }

  function openModal() {
    setForm((prev) => ({
      ...prev,
      brand_id: brands[0]?.id || "",
      assigned_to: "",
      type: TASK_TYPES[0],
      priority: "medium",
      deadline: "",
      title: "",
      description: "",
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
        alert("Task save kerte waqt error aaya. Console check karo.");
        return;
      }

      // Email notification – sirf tab, jab mapping me email ho
      const assignee = members.find((m) => m.id === form.assigned_to);
      const brand = brands.find((b) => b.id === form.brand_id);
      const toEmail = assignee ? CORE_TEAM_EMAILS[assignee.full_name] : null;

      if (assignee && toEmail) {
        // background me bhej do – UI ko block mat karo
        sendTaskAssignedEmail({
          to: toEmail,
          assigneeName: assignee.full_name,
          taskTitle: payload.title,
          brandName: brand?.name || "",
          priority: payload.priority,
          deadline: payload.deadline,
        }).catch((err) => {
          console.error("Error sending task email", err);
        });
      }

      await fetchTasks();
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.brandId !== "all" && t.brand?.id !== filters.brandId) {
        return false;
      }
      if (
        filters.assigneeId !== "all" &&
        t.assignee?.id !== filters.assigneeId
      ) {
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
                    {t.brand?.name || "—"}
                  </div>

                  {/* Assignee */}
                  <div className="table-team-lead">
                    {t.assignee?.full_name || "—"}
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
    </div>
  );
}
