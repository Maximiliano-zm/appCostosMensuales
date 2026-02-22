"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

/**
 * Server Action: cierra la sesión del usuario y redirige al login.
 */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
