// lib/notifications/email.js

const RESEND_API_URL = "https://api.resend.com/emails";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM =
  process.env.NOTIFY_FROM_EMAIL || "Central Marketing <onboarding@resend.dev>";

// Ye sirf Vercel logs ke liye hai – agar key missing ho to pata chal jaye
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY is missing. Emails will NOT be sent.");
}

/**
 * Task assigned email Resend se send karega
 */
export async function sendTaskAssignedEmail({
  to,
  brandName,
  title,
  type,
  assigneeName,
  deadline,
  description,
}) {
  if (!RESEND_API_KEY) {
    throw new Error("missing-resend-api-key");
  }
  if (!to) {
    throw new Error("missing-recipient-email");
  }

  const subject = `New task assigned – ${
    brandName || "Central Marketing Dashboard"
  }`;

  const deadlineText = deadline ? new Date(deadline).toLocaleDateString() : "—";

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:14px; color:#0f172a;">
      <h2 style="font-size:18px; margin-bottom:4px;">New task assigned to you</h2>
      <p style="margin-top:0; margin-bottom:16px;">Hi ${assigneeName || ""},</p>

      <p style="margin:0 0 8px;"><strong>Brand:</strong> ${brandName || "—"}</p>
      <p style="margin:0 0 8px;"><strong>Task:</strong> ${title}</p>
      <p style="margin:0 0 8px;"><strong>Type:</strong> ${type || "—"}</p>
      <p style="margin:0 0 8px;"><strong>Deadline:</strong> ${deadlineText}</p>

      ${
        description
          ? `<p style="margin:16px 0 0;"><strong>Details:</strong><br/>${description
              .split("\n")
              .map((line) => line.trim())
              .join("<br/>")}</p>`
          : ""
      }

      <p style="margin-top:24px;">You can see this task in your Central Marketing Dashboard under <strong>Tasks & Workloads</strong>.</p>
      <p style="margin-top:24px; font-size:12px; color:#64748b;">This email was sent automatically by the Central Marketing Dashboard.</p>
    </div>
  `;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: DEFAULT_FROM,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Resend /emails error:", response.status, text);
    throw new Error(`resend-error-${response.status}`);
  }

  const data = await response.json();
  console.log("Resend /emails success:", data);
  return data;
}
