// lib/queries.js
import supabase from "./supabase";

// Dashboard ke liye brands + basic fields
export async function getBrandsWithStats() {
  const { data, error } = await supabase
    .from("Brands") // 👈 table ka exact naam, capital B
    .select('id, name, status, current_focus, team_lead:"team lead"')
    .order("priority", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }

  return data || [];
}

// (optional) neeche future ke liye helper functions rakh sakte ho
// jaise brand performance ya daily stats, but abhi zaroori nahi.

// 👇 existing code rehne do bilkul

export async function getBrands() {
  const { data, error } = await supabase
    .from("Brands")
    .select("*")
    .order("priority", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading brands", error);
    throw error;
  }

  return data || [];
}

export async function getBrandsWithStats() {
  const { data, error } = await supabase
    .from("Brands")
    .select(
      `
      id,
      name,
      status,
      team_lead,
      current_focus,
      website_url,
      category,
      priority,
      last_update,
      campaign_stats (
        id,
        date,
        platform,
        spend,
        impressions,
        clicks,
        leads,
        revenue,
        ctr,
        cpl
      )
    `
    )
    .order("priority", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading brands with stats", error);
    throw error;
  }

  return data || [];
}
