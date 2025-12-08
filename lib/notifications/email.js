// lib/notifications/email.js
import { Resend } from "resend";

// yeh sirf SERVER par chalega, browser par nahi
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTaskAssignedEmail({
  to,
  brandName,
  taskTitle,
  taskType,
  priority,
  deadline,
  description,
}) {
  if (!to) {
    console.warn("sendTaskAssignedEmail: no recipient email, skipping.");
    return;
  }

  const niceDeadline = deadline
    ? new Date(deadline).toLocaleDateString("en-GB")
    : "No specific deadline";

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px;">
      <h2 style="margin-bottom: 8px;">New Task Assigned – ${brandName}</h2>
      <p>You have a new task in the Central Marketing Dashboard.</p>
      <ul>
        <li><strong>Task:</strong> ${taskTitle}</li>
        <li><strong>Type:</strong> ${taskType}</li>
        <li><strong>Priority:</strong> ${priority.toUpperCase()}</li>
        <li><strong>Deadline:</strong> ${niceDeadline}</li>
      </ul>
      ${
        description
          ? `<p><strong>Details:</strong><br/>${description}</p>`
          : ""
      }
      <p style="margin-top:16px;">Please update the status after you start / complete it.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: process.env.NOTIFY_FROM_EMAIL,
      to: [to],
      subject: `New Task Assigned – ${brandName}`,
      html,
    });
  } catch (err) {
    console.error("Error sending task email:", err);
  }
}
