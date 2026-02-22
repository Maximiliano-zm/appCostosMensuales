import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 * Úsalo en Client Components ("use client").
 * Gestiona la sesión en localStorage/cookies del navegador.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
