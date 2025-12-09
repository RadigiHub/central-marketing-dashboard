// lib/notifications/email.js

const RESEND_API_URL = "https://api.resend.com/emails";

// Vercel env vars se keys uthao
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Ye tum ne Vercel me set kiya hua hai:
// NOTIFY_FROM_EMAIL = Central Marketing <centralmarketing@raddigitalexperts.com>
const DEFAULT_FROM =
  process.env.NOTIFY_FROM_EMAIL ||
  "Central Marketing <centralmarketing@raddigitalexperts.com>";

// Sirf logging ke liye – agar key missing ho
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY is missing. Emails will NOT be sent.");
}

/**
 * Task assigned email bhejne wala helper
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
    return { ok: false, error: "missing-resend-api-key" };
  }

  // Safe defaults – agar kahin value na aaye to email tootay na
  const safeAssigneeName = assigneeName || "there";
  const safeBrandName = brandName || "-";
  const safeTitle = title || "-";
  const safeType = type || "-";
  const safeDeadline = deadline || "-";
  const safeDescription = description || "No extra details provided.";

  const subject = `New task assigned – ${safeBrandName}`;

  // 🔹 YAHAN hamara final branded HTML template
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

  <a href="https://central-marketing-dashboard.vercel.app/tasks"
     style="display:inline-block; background:#e8ff35; color:#000000; padding:10px 18px; border-radius:6px; font-weight:600; text-decoration:none;">
    View Task in Dashboard
  </a>

  <p style="margin-top:24px; font-size:12px; color:#64748b;">
    This is an automated notification from Central Marketing Dashboard.
  </p>
</div>
  `;

  // Plain text fallback (spam/old clients ke liye)
  const text = `NEW TASK ASSIGNED TO YOU

Brand: ${safeBrandName}
Task: ${safeTitle}
Type: ${safeType}
Deadline: ${safeDeadline}

Details:
${safeDescription}

You can see this task in your dashboard under "Tasks & Workloads".`;

  // Resend ko POST request
  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: DEFAULT_FROM,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  // Error handling
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
