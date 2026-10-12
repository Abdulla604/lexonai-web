import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iezmsjxahwdhmuynhiql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_oMJM6bX4MttNWCPgt0zqjQ_93jofz5N';

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}