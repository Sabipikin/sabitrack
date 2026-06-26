import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials not configured — running in demo mode");
  }
  return createBrowserClient(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder");
};
