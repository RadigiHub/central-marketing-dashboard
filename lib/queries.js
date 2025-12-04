import supabase from './supabase';

export async function getBrandPerformance() {
  const { data, error } = await supabase
    .from('brand_performance')
    .select('*')
    .order('priority', { ascending: true })
    .order('brand_name', { ascending: true });

  if (error) {
    console.error('Error loading brand performance', error);
    throw error;
  }

  return data;
}

export async function getBrandDailyStats(brandId) {
  const { data, error } = await supabase
    .from('brand_daily_stats')
    .select('*')
    .eq('brand_id', brandId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error loading brand daily stats', error);
    throw error;
  }

  return data;
}
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
