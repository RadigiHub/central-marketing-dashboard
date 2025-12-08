// pages/api/notify/task-assigned.js
import supabase from "../../../lib/supabase";
import { sendTaskAssignedEmail } from "../../../lib/notifications/email";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: "taskId is required" });
  }

  // Task + assignee + brand fetch
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      type,
      priority,
      deadline,
      description,
      brand:Brands ( name ),
      assignee:profiles ( email, full_name )
    `
    )
    .eq("id", taskId)
    .single();

  if (error) {
    console.error("Task lookup error:", error);
    return res.status(500).json({ error: "Task lookup failed" });
  }

  const to = data.assignee?.email;
  if (!to) {
    console.warn("No assignee email, skipping send");
    return res.status(200).json({ ok: true, skipped: "no email on profile" });
  }

  await sendTaskAssignedEmail({
    to,
    brandName: data.brand?.name || "Central Marketing",
    taskTitle: data.title,
    taskType: data.type,
    priority: data.priority,
    deadline: data.deadline,
    description: data.description || "",
  });

  return res.status(200).json({ ok: true });
}
