import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.NOTIFY_FROM_EMAIL;

export async function sendTaskAssignedEmail({ to, title, deadline }) {
  return await resend.emails.send({
    from: FROM,
    to,
    subject: `📌 New Task Assigned: ${title}`,
    html: `
      <h2>New Task Assigned</h2>
      <p><strong>${title}</strong></p>
      <p>Deadline: ${deadline || "No deadline"}</p>
      <p>Login & check task details.</p>
    `
  });
}
