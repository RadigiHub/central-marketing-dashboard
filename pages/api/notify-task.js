import { sendTaskAssignedEmail } from "../../lib/notifications/email";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { email, title, deadline } = req.body;
    await sendTaskAssignedEmail({ to: email, title, deadline });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false });
  }
}
