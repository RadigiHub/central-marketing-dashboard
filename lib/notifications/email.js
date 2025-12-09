// lib/notifications/email.js

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const DEFAULT_FROM =
  process.env.NOTIFY_FROM_EMAIL || "Central Marketing <centralmarketing@raddigitalexperts.com>";

export async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.error("❌ RESEND API KEY missing");
    return { ok: false, error: "missing-key" };
  }

  try {
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

    const data = await response.json();
    console.log("📧 Email response:", data);

    return data;
  } catch (error) {
    console.error("🚨 Send email error:", error);
    return { ok: false, error: error.message };
  }
}
