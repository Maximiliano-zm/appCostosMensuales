import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "./actions";
import DebtCard from "@/components/debt/DebtCard";
import SummaryBanner from "@/components/debt/SummaryBanner";
import type { Debt, Income } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch deudas e ingreso
  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .order("current_balance", { ascending: false });

  const { data: incomeRows } = await supabase
    .from("income")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  const debtList = (debts as unknown as Debt[]) ?? [];
  const incomeList = (incomeRows as unknown as Income[]) ?? [];
  const totalDebt = debtList.reduce((sum, d) => sum + d.current_balance, 0);
  const monthlyIncome = incomeList[0]?.monthly_amount ?? 0;

  return (
    <main
      className="min-h-dvh pb-28"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      {/* ── Header + Tab Nav (sticky juntos) ────────────────────── */}
      <div className="sticky top-0 z-10">
        <header
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div>
            <p
              className="text-xs font-black tracking-[0.25em] uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              Debt Tracker
            </p>
            <p
              className="text-xs truncate max-w-[200px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {user.email}
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="border px-4 text-xs font-semibold transition-colors duration-150 hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
                minHeight: "44px",
              }}
            >
              Salir
            </button>
          </form>
        </header>

        {/* Tab Nav */}
        <nav
          className="flex border-b"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <span
            className="flex-1 text-center text-xs font-bold border-b-2 flex items-center justify-center"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-accent)",
              minHeight: "44px",
            }}
          >
            Tarjetas
          </span>
          <Link
            href="/dashboard/metrics"
            className="flex-1 text-center text-xs font-semibold border-b-2 flex items-center justify-center"
            style={{
              borderColor: "transparent",
              color: "var(--color-text-muted)",
              minHeight: "44px",
            }}
          >
            Métricas
          </Link>
        </nav>
      </div>

      {/* ── Contenido ───────────────────────────────────────────── */}
      <div className="max-w-md mx-auto px-4 pt-5 flex flex-col gap-4">
        {/* Banner de resumen */}
        <SummaryBanner
          totalDebt={totalDebt}
          monthlyIncome={monthlyIncome}
          debtCount={debtList.length}
        />

        {/* Sección de deudas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "var(--color-text-muted)" }}
            >
              Mis Tarjetas
            </p>
            <Link
              href="/dashboard/import"
              className="text-xs font-semibold border px-3"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
              }}
            >
              ↑ Importar CSV
            </Link>
          </div>

          {debtList.length === 0 ? (
            <div
              className="border border-dashed p-10 text-center flex flex-col items-center gap-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>💳</span>
              <div>
                <p
                  className="text-sm font-bold mb-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Sin tarjetas registradas
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Agrega una tarjeta manualmente con el botón +<br />
                  o importa varias a la vez con CSV.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {debtList.map((debt) => (
                <DebtCard key={debt.id} debt={debt} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── FAB: Agregar Tarjeta ─────────────────────────────────── */}
      <div className="fixed bottom-6 right-4 z-20">
        <Link
          href="/dashboard/add-debt"
          className="flex items-center gap-2 px-6 text-sm font-black border"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#080d14",
            borderColor: "var(--color-accent-dim)",
            minHeight: "52px",
          }}
        >
          <span className="text-xl leading-none font-black">+</span>
          Agregar Tarjeta
        </Link>
      </div>
    </main>
  );
}
