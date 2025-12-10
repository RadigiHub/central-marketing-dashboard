// pages/my-tasks.js
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useAuth } from "../lib/auth";

const STATUS_OPTIONS = [
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked / On hold" },
];

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export default function MyTasksPage() {
  const { profile, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // tasks load karo – sirf current user ke
  useEffect(() => {
    if (!profile?.id) return;
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function fetchTasks() {
    try {
      setLoadingTasks(true);

      // NOTE:
      // Agar Brands table join se error aaye to
      // .select(...) me se "brand_name" wala part hata dena
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
          description,
          attachment_url,
          created_at,
          brand_id
        `
        )
        .eq("assigned_to", profile.id)
        .order("deadline", { ascending: true });

      if (error) {
        console.error("Error loading my tasks:", error);
        return;
      }

      setTasks(data || []);
    } finally {
      setLoadingTasks(false);
    }
  }

  // status + attachment link update
  async function handleSave(taskId, newStatus, newAttachmentUrl) {
    try {
      setSavingId(taskId);

      const updates = {
        status: newStatus,
        attachment_url: newAttachmentUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) {
        console.error("Update task error:", error);
        alert("Task update fail ho gaya, console check karo.");
        return;
      }

      // local state update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...data } : t))
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="layout-main">
          <div className="card">
            <h2>Loading your tasks…</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === statusFilter);

  return (
    <div className="page">
      <div className="layout-main">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">My Tasks</h2>
              <p className="card-subtitle">
                Yahan sirf woh tasks dikhenge jo tum par assign hain.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <label
                htmlFor="status-filter"
                style={{ fontSize: 13, color: "#94a3b8" }}
              >
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
                style={{ minWidth: 160 }}
              >
                <option value="all">All</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingTasks ? (
            <p style={{ fontSize: 14, color: "#94a3b8" }}>Loading tasks…</p>
          ) : filteredTasks.length === 0 ? (
            <p style={{ fontSize: 14, color: "#94a3b8" }}>
              Aaj tum par koi task assign nahi hai.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "26%" }}>Task</th>
                    <th style={{ width: "10%" }}>Type</th>
                    <th style={{ width: "10%" }}>Priority</th>
                    <th style={{ width: "12%" }}>Deadline</th>
                    <th style={{ width: "18%" }}>Attachment</th>
                    <th style={{ width: "24%" }}>Status / Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const priorityLabel =
                      PRIORITY_LABELS[task.priority] || task.priority;

                    const dateLabel = task.deadline
                      ? new Date(task.deadline).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "No date";

                    return (
                      <TaskRow
                        key={task.id}
                        task={task}
                        priorityLabel={priorityLabel}
                        dateLabel={dateLabel}
                        saving={savingId === task.id}
                        onSave={handleSave}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, priorityLabel, dateLabel, saving, onSave }) {
  const [editStatus, setEditStatus] = useState(task.status || "assigned");
  const [attachment, setAttachment] = useState(task.attachment_url || "");

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 500 }}>{task.title}</div>
        {task.description ? (
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              marginTop: 2,
              maxWidth: 340,
            }}
          >
            {task.description}
          </div>
        ) : null}
      </td>

      <td>
        <span className="badge badge-ghost">{task.type || "—"}</span>
      </td>

      <td>
        <span className="badge badge-priority">{priorityLabel || "—"}</span>
      </td>

      <td>
        <span style={{ fontSize: 13 }}>{dateLabel}</span>
      </td>

      <td>
        {task.attachment_url ? (
          <a
            href={task.attachment_url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: "#60a5fa" }}
          >
            Open attachment
          </a>
        ) : (
          <span style={{ fontSize: 13, color: "#64748b" }}>No attachment</span>
        )}

        <input
          type="text"
          className="input"
          placeholder="Paste link (Drive, Loom, etc.)"
          value={attachment}
          onChange={(e) => setAttachment(e.target.value)}
          style={{ marginTop: 6, fontSize: 12 }}
        />
      </td>

      <td>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <select
            className="input"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            style={{ fontSize: 13, minWidth: 130 }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-primary"
            onClick={() => onSave(task.id, editStatus, attachment)}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
          Status change + attachment link yahan se update karo.
        </div>
      </td>
    </tr>
  );
}
