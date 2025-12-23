
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL ERROR: Supabase env variables missing!");
} else {
    console.log("Supabase Client initializing with URL:", supabaseUrl);
}

const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder';

if (finalUrl.includes('placeholder')) {
    console.warn("WARNING: Using placeholder Supabase URL. Connection will fail.");
}

export const supabase = createClient(finalUrl, finalKey);
