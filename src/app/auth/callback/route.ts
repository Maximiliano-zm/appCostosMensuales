import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * Callback OAuth de Supabase.
 * Google redirige aquí después de autenticar al usuario.
 * Intercambia el `code` temporal por una sesión real y redirige al dashboard.
 *
 * URL configurada en Supabase Dashboard:
 *   Authentication → URL Configuration → Redirect URLs
 *   → {NEXT_PUBLIC_APP_URL}/auth/callback
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Error al intercambiar código:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
