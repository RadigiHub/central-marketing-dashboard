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
