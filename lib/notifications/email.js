// lib/notifications/email.js

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// From address – Vercel env se aayega
const DEFAULT_FROM =
  process.env.NOTIFY_FROM_EMAIL ||
  "Central Marketing <centralmarketing@raddigitalexperts.com>";

// Sirf logging ke liye – agar key missing ho
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY is missing. Emails will NOT be sent.");
}

// ---------- COMMON HELPER: actually email send karega ----------

async function sendEmail({ to, subject, html, text }) {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "missing-resend-api-key" };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error("Resend error:", res.status, errorBody);

    let errorCode = `resend-error-${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed && parsed.name) errorCode = parsed.name;
    } catch (_) {}

    throw new Error(errorCode);
  }

  return { ok: true };
}

// ===============================================================
// 1) TASK ASSIGNED EMAIL
// ===============================================================

export async function sendTaskAssignedEmail({
  to,
  brandName,
  title,
  type,
  assigneeName,
  deadline,
  description,
}) {
  const safeAssigneeName = assigneeName || "there";
  const safeBrandName = brandName || "-";
  const safeTitle = title || "-";
  const safeType = type || "-";
  const safeDeadline = deadline || "-";
  const safeDescription = description || "No extra details provided.";

  const subject = `New task assigned – ${safeBrandName}`;

  // ✅ Button styling fix + login link
  const html = `
<div style="font-family: Inter, Arial, sans-serif; background:#0f172a; padding:24px; color:#e2e8f0; border-radius:8px;">
  <h2 style="font-size:20px; color:#ffffff; margin-bottom:8px;">New Task Assigned</h2>
  <p style="font-size:14px; color:#94a3b8; margin-top:0;">Hi ${safeAssigneeName},</p>

  <div style="background:#1e293b; padding:16px; border-radius:6px; margin-bottom:16px;">
    <p style="margin:0 0 6px;"><strong>Brand:</strong> ${safeBrandName}</p>
    <p style="margin:0 0 6px;"><strong>Task:</strong> ${safeTitle}</p>
    <p style="margin:0 0 6px;"><strong>Type:</strong> ${safeType}</p>
    <p style="margin:0 0 6px;"><strong>Deadline:</strong> ${safeDeadline}</p>
    <p style="margin:12px 0 0;"><strong>Details:</strong><br>${safeDescription}</p>
  </div>

  <a href="https://central-marketing-dashboard.vercel.app/login"
     style="display:block; text-align:center; width:100%; background:#e8ff35; color:#000000; padding:12px 0; border-radius:6px; font-weight:700; text-decoration:none;">
     View Task in Dashboard
  </a>

  <p style="margin-top:24px; font-size:12px; color:#64748b;">
    This is an automated notification from Central Marketing Dashboard.
  </p>
</div>
  `;

  const text = `NEW TASK ASSIGNED TO YOU

Brand: ${safeBrandName}
Task: ${safeTitle}
Type: ${safeType}
Deadline: ${safeDeadline}

Details:
${safeDescription}

You can see this task in your dashboard (login required).`;

  return sendEmail({ to, subject, html, text });
}

// ===============================================================
// 2) DAILY SUMMARY EMAIL  (boss ke liye report)
// ===============================================================

function formatDateLabel(date) {
  try {
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (_) {
    return date.toISOString().slice(0, 10);
  }
}

function groupTasksForSummary(tasks) {
  const completedStatuses = ["DONE", "COMPLETED", "FINISHED"];
  const inProgressStatuses = ["IN_PROGRESS", "DOING"];
  const blockedStatuses = ["BLOCKED", "ON_HOLD"];

  const completed = [];
  const inProgress = [];
  const assigned = [];
  const blocked = [];
  const other = [];

  for (const t of tasks || []) {
    const status = (t.status || "").toUpperCase();

    if (completedStatuses.includes(status)) completed.push(t);
    else if (inProgressStatuses.includes(status)) inProgress.push(t);
    else if (blockedStatuses.includes(status)) blocked.push(t);
    else if (status === "ASSIGNED" || status === "NEW") assigned.push(t);
    else other.push(t);
  }

  return { completed, inProgress, blocked, assigned, other };
}

function buildOverviewHtml(tasks, date) {
  const total = tasks.length;
  const { completed, inProgress, blocked, assigned } =
    groupTasksForSummary(tasks);

  return `
  <div style="background:#1e293b; padding:16px; border-radius:6px; margin-bottom:16px;">
    <p style="margin:0 0 8px; font-size:14px; color:#e2e8f0;">
      <strong>Total tasks touched today:</strong> ${total}
    </p>
    <p style="margin:0; font-size:13px; color:#cbd5f5;">
      ✅ Completed: <strong>${completed.length}</strong> &nbsp;·&nbsp;
      🚧 In progress: <strong>${inProgress.length}</strong> &nbsp;·&nbsp;
      📌 Assigned / New: <strong>${assigned.length}</strong> &nbsp;·&nbsp;
      ⛔ Blocked: <strong>${blocked.length}</strong>
    </p>
  </div>
`;
}

function buildTaskSection(title, tasks) {
  if (!tasks || !tasks.length) {
    return `
      <h3 style="font-size:16px; color:#ffffff; margin:20px 0 4px;">${title}</h3>
      <p style="font-size:13px; color:#64748b; margin:0 0 8px;">No items for today.</p>
    `;
  }

  const listItems = tasks
    .map((t) => {
      const brand =
        t.brand_name || t.brand || t.brandId || t.brand_id || "—";

      const assignee =
        t.assignee_name || t.assignee || t.assignee_email || "";

      const deadline = t.deadline || t.due_date || "";

      return `<li style="margin-bottom:6px;">
        <span style="color:#e5e7eb;"><strong>${brand}</strong> – ${t.title || "-"}</span>
        ${assignee ? `<span style="color:#9ca3af;"> (${assignee})</span>` : ""}
        ${deadline ? `<span style="color:#eab308;">  ·  ${deadline}</span>` : ""}
      </li>`;
    })
    .join("");

  return `
    <h3 style="font-size:16px; color:#ffffff; margin:20px 0 4px;">${title}</h3>
    <ul style="margin:4px 0 0 18px; padding:0; font-size:13px; color:#cbd5f5; list-style:disc;">
      ${listItems}
    </ul>
  `;
}

export async function sendDailySummaryEmail({ to, date, tasks }) {
  const dayLabel = formatDateLabel(date);
  const { completed, inProgress, blocked, assigned } =
    groupTasksForSummary(tasks);

  const subject = `Daily Task Summary – ${dayLabel}`;

  const html = `
<div style="font-family: Inter, Arial, sans-serif; background:#0f172a; padding:24px; color:#e2e8f0; border-radius:8px;">
  <h2 style="font-size:20px; color:#ffffff; margin-bottom:4px;">Daily Task Summary</h2>
  <p style="font-size:13px; color:#94a3b8; margin-top:0;">${dayLabel}</p>

  ${buildOverviewHtml(tasks, date)}

  ${buildTaskSection("✅ Completed today", completed)}
  ${buildTaskSection("🚧 In progress / ongoing", inProgress)}
  ${buildTaskSection("📌 Newly assigned today", assigned)}
  ${buildTaskSection("⛔ Blocked / on hold", blocked)}

  <p style="margin-top:28px; font-size:12px; color:#64748b;">
    Source: Central Marketing Dashboard &mdash; Tasks & Workloads.
  </p>
</div>
  `;

  const textLines = [];
  textLines.push(`Daily Task Summary – ${dayLabel}`);
  textLines.push("");

  const pushList = (title, list) => {
    textLines.push(title);
    if (!list.length) {
      textLines.push("  · None");
    } else {
      for (const t of list) {
        const brand =
          t.brand_name || t.brand || t.brandId || t.brand_id || "—";
        const assignee =
          t.assignee_name || t.assignee || t.assignee_email || "";
        const deadline = t.deadline || t.due_date || "";

        textLines.push(
          `  · ${brand} – ${t.title || "-"}${assignee ? ` (${assignee})` : ""}${
            deadline ? ` [${deadline}]` : ""
          }`
        );
      }
    }
    textLines.push("");
  };

  const { completed: c, inProgress: p, blocked: b, assigned: a } =
    groupTasksForSummary(tasks);

  pushList("Completed:", c);
  pushList("In progress:", p);
  pushList("Newly assigned:", a);
  pushList("Blocked / on hold:", b);

  const text = textLines.join("\n");

  return sendEmail({ to, subject, html, text });
}
