// lib/notifications/email.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.NOTIFY_FROM_EMAIL;
const BOSS = process.env.BOSS_REPORT_EMAIL || process.env.NOTIFY_FROM_EMAIL;

function safe(value, fallback = "—") {
  if (!value) return fallback;
  return String(value);
}

// 1) Jab task assign ho, assignee ko email
export async function sendTaskAssignedEmail({
  to,
  brandName,
  title,
  type,
  assigneeName,
  deadline,
  description,
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing – skipping task email");
    return;
  }

  const subject = `New task assigned – ${title || "New Task"}`;
  const deadlineText = deadline
    ? new Date(deadline).toLocaleDateString()
    : "No deadline set";

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color:#111;">
      <p>Hi ${safe(assigneeName, "there")},</p>
      <p>A new task has been assigned to you in the Central Marketing Dashboard:</p>
      <table style="border-collapse:collapse;margin:12px 0;">
        <tr><td style="padding:4px 8px;font-weight:600;">Brand</td><td style="padding:4px 8px;">${safe(
          brandName
        )}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Task</td><td style="padding:4px 8px;">${safe(
          title
        )}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Type</td><td style="padding:4px 8px;">${safe(
          type
        )}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;">Deadline</td><td style="padding:4px 8px;">${deadlineText}</td></tr>
      </table>
      ${
        description
          ? `<p style="margin-top:8px;"><strong>Details:</strong><br/>${safe(
              description
            )}</p>`
          : ""
      }
      <p style="margin-top:16px;">You can view / update this task inside the dashboard.</p>
      <p style="margin-top:24px;font-size:12px;color:#666;">Central Marketing – Task Automation</p>
    </div>
  `;

  const text = `New task assigned
Brand: ${safe(brandName)}
Task: ${safe(title)}
Type: ${safe(type)}
Deadline: ${deadlineText}
`;

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
  });
}

// 2) Rozana boss ko summary email
export async function sendDailySummaryEmail({ tasks }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing – skipping daily summary email");
    return;
  }

  const today = new Date();
  const dateLabel = today.toLocaleDateString();

  const subject = `Daily task summary – ${dateLabel}`;

  let htmlBody;

  if (!tasks || tasks.length === 0) {
    htmlBody = `<p>No tasks with deadline today.</p>`;
  } else {
    const rows = tasks
      .map((t) => {
        const d = t.deadline
          ? new Date(t.deadline).toLocaleDateString()
          : "—";
        const pri = t.priority ? String(t.priority).toUpperCase() : "—";

        return `<tr>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${safe(
            t.brand?.name
          )}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${safe(
            t.title
          )}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${safe(
            t.assignee?.full_name
          )}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${pri}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${safe(
            t.status
          )}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${d}</td>
        </tr>`;
      })
      .join("");

    htmlBody = `
      <p>Here is today's task snapshot (deadline = today):</p>
      <table style="border-collapse:collapse;margin-top:8px;font-size:13px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;">Brand</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;">Task</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;">Assignee</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;">Priority</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;">Status</th>
            <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #ddd;">Deadline</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color:#111;">
      <p>Daily task summary – ${dateLabel}</p>
      ${htmlBody}
      <p style="margin-top:16px;font-size:12px;color:#666;">Data source: Central Marketing Dashboard</p>
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to: BOSS,
    subject,
    html,
  });
}
