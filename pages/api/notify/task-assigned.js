// pages/api/notify-task.js
import { sendTaskAssignedEmail } from "../../../lib/notifications/email";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const body = req.body || {};
    const {
      email,
      brandName,
      title,
      type,
      assigneeName,
      deadline,
      description,
    } = body;

    if (!email) {
      return res.status(400).json({ ok: false, error: "missing-email" });
    }

    await sendTaskAssignedEmail({
      to: email,
      brandName,
      title,
      type,
      assigneeName,
      deadline,
      description,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("notify-task error", err);
    return res.status(500).json({ ok: false });
  }
}
