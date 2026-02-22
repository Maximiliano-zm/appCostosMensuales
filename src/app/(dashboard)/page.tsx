import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { signOut } from "./actions";

/**
 * Dashboard principal (Server Component).
 * Task 2.2 construirá la UI completa con métricas de deudas.
 * Esta versión confirma que la sesión funciona y expone el sign-out.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya debería haber redirigido — esto es una salvaguarda
  if (!user) {
    redirect("/login");
  }

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      <div
        className="w-full max-w-xs border p-7 text-center"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <p
          className="mb-1 text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Sesión activa
        </p>
        <h1
          className="mb-1 text-xl font-bold"
          style={{ color: "var(--color-accent)" }}
        >
          Bienvenido
        </h1>
        <p
          className="mb-6 truncate text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {user.email}
        </p>

        <p
          className="mb-8 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          Dashboard completo — Task 2.2
        </p>

        {/* Sign-out via Server Action */}
        <form action={signOut}>
          <button
            type="submit"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
              minHeight: "48px",
            }}
            className="w-full border bg-transparent px-5 py-3 text-sm font-semibold transition-colors duration-150 hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
