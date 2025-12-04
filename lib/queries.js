// lib/queries.js
import supabase from "./supabase";

// ============= MAIN: Dashboard brands list =============
export async function getBrandsWithStats() {
  const { data, error } = await supabase
    .from("Brands") // table ka naam
    // "team lead" (space ke sath) ko alias karke team_lead banaya
    .select('id, name, status, current_focus, team_lead:"team lead"')
    .order("priority", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }

  return data || [];
}

// ============= (optional) baaki helpers – agar future me use karna ho =============
export async function getBrandPerformance() {
  const { data, error } = await supabase
    .from("brand_performance")
    .select("*")
    .order("priority", { ascending: true })
    .order("brand_name", { ascending: true });

  if (error) {
    console.error("Error loading brand performance", error);
    throw error;
  }

  return data || [];
}

export async function getBrandDailyStats(brandId) {
  const { data, error } = await supabase
    .from("brand_daily_stats")
    .select("*")
    .eq("brand_id", brandId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error loading brand daily stats", error);
    throw error;
  }

  return data || [];
}
