// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// ENV variables from Vercel / .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helpful warning in console if something is missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create a single client instance for the whole app
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ DEFAULT EXPORT – so `import supabase from '../lib/supabase'` works
export default supabase;
