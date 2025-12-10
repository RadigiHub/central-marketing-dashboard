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
// 1) TASK ASSIGNED EMAIL  (ye already chal raha hai)
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

  <a href="https://central-marketing-dashboard.vercel.app/my-tasks">
     style="display:inline-block; background:#e8ff35; color:#000000; padding:10px 18px; border-radius:6px; font-weight:600; text-decoration:none;">
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

You can see this task in your dashboard under "Tasks & Workloads".`;

  return sendEmail({ to, subject, html, text });
}

// ===============================================================
// 2) DAILY SUMMARY EMAIL  (boss ke liye clean report-style)
// ===============================================================

// small helper: nice date label
function formatDateLabel(date) {
  try {
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/London",
    });
  } catch (_) {
    return date.toISOString().slice(0, 10);
  }
}

// ek task ko normalize + extract helpers
function getStatus(task) {
  return (task.status || "").toLowerCase();
}

function getBrand(task) {
  return (
    task.brand_name ||
    task.brand ||
    task.brandId ||
    task.brand_id ||
    "-"
  );
}

function getOwner(task) {
  return (
    task.assignee_name ||
    task.assignee ||
    task.assignee_email ||
    "-"
  );
}

function getDeadline(task) {
  const raw = task.deadline || task.due_date || task.deadline_date || "";
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("en-GB");
  } catch {
    return String(raw);
  }
}

// ek row ka HTML
function renderRow(task) {
  const brand = getBrand(task);
  const title = task.title || task.task_title || task.name || "-";
  const owner = getOwner(task);
  const type = task.type || task.category || "-";
  const deadline = getDeadline(task);

  return `
    <tr>
      <td style="padding:6px 8px; border-bottom:1px solid #1e293b;">${brand}</td>
      <td style="padding:6px 8px; border-bottom:1px solid #1e293b;">
        <strong>${title}</strong><br/>
        <span style="font-size:12px; color:#9ca3af;">${type}</span>
      </td>
      <td style="padding:6px 8px; border-bottom:1px solid #1e293b;">${owner}</td>
      <td style="padding:6px 8px; border-bottom:1px solid #1e293b;">${
        deadline || "-"
      }</td>
    </tr>
  `;
}

// section renderer (table ya "no items")
function renderSection(heading, items, emptyText) {
  if (!items || items.length === 0) {
    return `
      <h3 style="margin:18px 0 4px; font-size:15px; color:#e5e7eb;">${heading}</h3>
      <p style="margin:0 0 8px; font-size:13px; color:#9ca3af;">${emptyText}</p>
    `;
  }

  return `
    <h3 style="margin:18px 0 4px; font-size:15px; color:#e5e7eb;">${heading}</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; font-size:13px; color:#e5e7eb; background:#020617; border-radius:6px; overflow:hidden;">
      <thead>
        <tr style="background:#020617;">
          <th align="left" style="padding:6px 8px; border-bottom:1px solid #1e293b; font-weight:500; color:#9ca3af;">Brand</th>
          <th align="left" style="padding:6px 8px; border-bottom:1px solid #1e293b; font-weight:500; color:#9ca3af;">Task</th>
          <th align="left" style="padding:6px 8px; border-bottom:1px solid #1e293b; font-weight:500; color:#9ca3af;">Owner</th>
          <th align="left" style="padding:6px 8px; border-bottom:1px solid #1e293b; font-weight:500; color:#9ca3af;">Deadline</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(renderRow).join("")}
      </tbody>
    </table>
  `;
}

export async function sendDailySummaryEmail({ to, date, tasks }) {
  const safeTasks = tasks || [];
  const dayStr = formatDateLabel(date);

  // grouping
  const completed = safeTasks.filter((t) =>
    ["done", "completed", "finished"].includes(getStatus(t))
  );
  const inProgress = safeTasks.filter((t) =>
    ["in_progress", "ongoing", "doing"].includes(getStatus(t))
  );
  const blocked = safeTasks.filter((t) =>
    ["blocked", "on_hold"].includes(getStatus(t))
  );
  const newlyAssigned = safeTasks.filter((t) =>
    ["assigned", "new"].includes(getStatus(t))
  );

  const totalTouched = safeTasks.length;

  const subject = `Daily Task Summary – ${dayStr}`;

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; font-size:14px; background:#020617; color:#e5e7eb; padding:24px;">
      <h1 style="margin:0 0 4px; font-size:20px;">Daily Task Summary</h1>
      <p style="margin:0 0 16px; font-size:13px; color:#9ca3af;">${dayStr}</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px;">
        <tr>
          <td style="padding:10px 12px; background:#0f172a; border-radius:8px;">
            <div style="font-size:12px; color:#9ca3af;">Total tasks touched today</div>
            <div style="font-size:18px; font-weight:600; margin-top:2px;">${totalTouched}</div>
            <div style="font-size:12px; color:#9ca3af; margin-top:6px;">
              ✅ Completed: ${completed.length} &nbsp;•&nbsp;
              ⏳ In progress: ${inProgress.length} &nbsp;•&nbsp;
              🆕 Assigned / New: ${newlyAssigned.length} &nbsp;•&nbsp;
              ⛔ Blocked: ${blocked.length}
            </div>
          </td>
        </tr>
      </table>

      ${renderSection("✅ Completed today", completed, "No tasks marked as completed today.")}
      ${renderSection("⏳ In progress / ongoing", inProgress, "No tasks currently in progress for today.")}
      ${renderSection("🆕 Newly assigned today", newlyAssigned, "No new tasks assigned today.")}
      ${renderSection("⛔ Blocked / on hold", blocked, "No blocked tasks today.")}

      <p style="margin-top:24px; font-size:11px; color:#6b7280;">
        Source: Central Marketing Dashboard — Tasks & Workloads.
      </p>
    </div>
  `;

  // plain-text version (simple summary for fallback)
  let text = `Daily Task Summary – ${dayStr}\n\n`;
  text += `Total tasks touched: ${totalTouched}\n`;
  text += `Completed: ${completed.length}\n`;
  text += `In progress: ${inProgress.length}\n`;
  text += `New / Assigned: ${newlyAssigned.length}\n`;
  text += `Blocked: ${blocked.length}\n`;

  return sendEmail({ to, subject, html, text });
}
