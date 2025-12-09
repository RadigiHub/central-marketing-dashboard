// lib/notifications/email.js

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Ye FROM address ab tumhari verified domain wali email hai
const DEFAULT_FROM =
  process.env.NOTIFY_FROM_EMAIL || "Central Marketing <centralmarketing@raddigitalexperts.com>";

export async function sendTaskAssignedEmail({
  to,
  brandName,
  title,
  type,
  assigneeName,
  deadline,
  description,
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,     // ⬅️ Correct verified domain sender
      to: [to],
      subject: `New task assigned – ${brandName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; font-size:14px;">
          <h2>New task assigned to you</h2>
          <p>Hi ${assigneeName},</p>

          <p><strong>Brand:</strong> ${brandName}</p>
          <p><strong>Task:</strong> ${title}</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Deadline:</strong> ${deadline}</p>
          <p><strong>Details:</strong><br/>${description}</p>

          <br />
          <p>You can see this task in your dashboard under <strong>Tasks & Workloads</strong>.</p>
        </div>
      `,
    });

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { ok: false, error: err.message };
  }
}
