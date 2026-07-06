import { createClient } from '@supabase/supabase-js';

// This client uses the SERVICE ROLE key and must only ever be imported
// from server-side code (API routes, server components) — never from
// a "use client" component. The service role key bypasses row-level
// security, which is why it's kept out of the browser entirely.
export function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
