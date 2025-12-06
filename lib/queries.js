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

// 1) Sirf brands dropdown ke liye (My Day form)
export async function getSimpleBrands() {
  const { data, error } = await supabase
    .from('Brands')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error loading brands list', error);
    throw error;
  }

  return data || [];
}

// 2) My Day ke liye – latest daily updates list
export async function getDailyUpdates() {
  const { data, error } = await supabase
    .from('daily_updates')
    .select(`
      id,
      assignee,
      status,
      focus,
      impact,
      created_at,
      brand:Brands ( name )
    `)
    .order('created_at', { ascending: false }); // 🔁 ab created_at se sort

  if (error) {
    console.error('Error loading daily updates', error);
    throw error;
  }

  return data || [];
}

// 3) Naya daily update insert karne ke liye
export async function addDailyUpdate(payload) {
  const { data, error } = await supabase
    .from('daily_updates')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error adding daily update', error);
    throw error;
  }

  return data;
}
