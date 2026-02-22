import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { signOut } from "@/app/dashboard/actions";
import type { Debt, Income } from "@/types/database";
import RechartsSection from "@/components/metrics/RechartsSection";
import ChartJsSection from "@/components/metrics/ChartJsSection";
import VisxSection from "@/components/metrics/VisxSection";

import NivoWrapper from "@/components/metrics/wrappers/NivoWrapper";
import ApexWrapper from "@/components/metrics/wrappers/ApexWrapper";

interface SectionProps {
  title: string;
  library: string;
  children: React.ReactNode;
}

function ChartSection({ title, library, children }: SectionProps) {
  return (
    <div
      className="w-full border p-4"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        borderTopColor: "var(--color-accent)",
        borderTopWidth: "2px",
      }}
    >
      <div className="flex items-baseline justify-between mb-4">
        <p
          className="text-xs font-bold tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {title}
        </p>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 border"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          {library}
        </span>
      </div>
      {children}
    </div>
  );
}

export default async function MetricsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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

  // Datos serializables para los Client Components
  const metricsDebts = debtList.map((d) => ({
    bank_name: d.bank_name,
    current_balance: d.current_balance,
    original_amount: d.original_amount,
  }));

  return (
    <main
      className="min-h-dvh pb-10"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      {/* ── Header + Tab Nav (sticky) ────────────────────────────── */}
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
              className="border px-4 text-xs font-semibold transition-colors duration-150"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
                minHeight: "40px",
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
          <Link
            href="/dashboard"
            className="flex-1 text-center text-xs font-semibold py-2.5 border-b-2"
            style={{ borderColor: "transparent", color: "var(--color-text-muted)" }}
          >
            Tarjetas
          </Link>
          <span
            className="flex-1 text-center text-xs font-bold py-2.5 border-b-2"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
          >
            Métricas
          </span>
        </nav>
      </div>

      {/* ── Gráficos ─────────────────────────────────────────────── */}
      <div className="max-w-md mx-auto px-4 pt-5 flex flex-col gap-5">

        {/* 1. Recharts — Pie distribución */}
        <ChartSection title="Distribución por Tarjeta" library="Recharts">
          <RechartsSection debts={metricsDebts} />
        </ChartSection>

        {/* 2. Chart.js — Barras horizontales saldos */}
        <ChartSection title="Saldos por Tarjeta" library="Chart.js">
          <ChartJsSection debts={metricsDebts} />
        </ChartSection>

        {/* 3. Nivo — Donut deuda vs ingreso */}
        <ChartSection title="Deuda vs Ingreso Mensual" library="Nivo">
          <NivoWrapper totalDebt={totalDebt} monthlyIncome={monthlyIncome} />
        </ChartSection>

        {/* 4. Visx — Barras de progreso de pago */}
        <ChartSection title="Progreso de Pago por Tarjeta" library="Visx">
          <VisxSection debts={metricsDebts} />
        </ChartSection>

        {/* 5. ApexCharts — RadialBar cobertura */}
        <ChartSection title="Cobertura de Ingreso sobre Deuda" library="ApexCharts">
          <ApexWrapper totalDebt={totalDebt} monthlyIncome={monthlyIncome} />
        </ChartSection>

      </div>
    </main>
  );
}
