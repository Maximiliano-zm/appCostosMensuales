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

  // Fetch deudas e ingreso en paralelo
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
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
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
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            Mis Deudas
          </p>

          {debtList.length === 0 ? (
            <div
              className="border border-dashed p-10 text-center"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Sin deudas registradas
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Toca el botón + para agregar tu primera deuda
              </p>
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

      {/* ── FAB: Agregar Deuda ──────────────────────────────────── */}
      <div className="fixed bottom-6 right-4 z-20">
        <Link
          href="/add-debt"
          className="flex items-center gap-2 px-6 text-sm font-black border"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#080d14",
            borderColor: "var(--color-accent-dim)",
            minHeight: "52px",
          }}
        >
          <span className="text-xl leading-none font-black">+</span>
          Agregar Deuda
        </Link>
      </div>
    </main>
  );
}
