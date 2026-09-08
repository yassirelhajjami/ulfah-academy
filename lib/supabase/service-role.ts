import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses every RLS policy.
 *
 * Import this ONLY from Server Actions or Route Handlers, never from a
 * Client Component and never re-exported through a "use client" boundary.
 * Use it exclusively for trusted server-side writes that a legitimate
 * anonymous flow needs (e.g. the public "book an assessment" lead form),
 * not as a general-purpose data client.
 */
export function createServiceRoleClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
