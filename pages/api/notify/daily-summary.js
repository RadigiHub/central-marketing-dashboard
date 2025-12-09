// pages/api/notify/daily-summary.js

import { createClient } from "@supabase/supabase-js";
import { sendDailySummaryEmail } from "../../../lib/notifications/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method-not-allowed" });
  }

  if (!supabase) {
    return res.status(500).json({ ok: false, error: "supabase-not-configured" });
  }

  try {
    // 🔥 FINAL FIXED RECIPIENTS (no env needed now)
    const recipients = ["azaz@timestravel.co.uk", "haris@timestravel.com"];

    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .gte("updated_at", startOfDay.toISOString())
      .lt("updated_at", endOfDay.toISOString())
      .order("updated_at", { ascending: true });

    if (error) {
      console.error("daily-summary supabase error:", error);
      return res.status(500).json({ ok: false, error: "supabase-query-error" });
    }

    await sendDailySummaryEmail({
      to: recipients, // ⭐ Now sends to both
      date: now,
      tasks: tasks || [],
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("notify/daily-summary error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "unknown-error",
    });
  }
}
