import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PayForm from "@/components/debt/PayForm";
import type { Debt } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PayPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("debts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) notFound();
  const debt = data as unknown as Debt;

  // Redirect if there's no active statement to pay
  if (!debt.statement_balance || debt.statement_balance <= 0) {
    redirect(`/dashboard/statement/${id}`);
  }

  return (
    <main
      className="min-h-dvh pb-10"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-4 px-5 py-4 border-b"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-xs font-semibold border px-3"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
            minHeight: "44px",
          }}
        >
          ← Volver
        </Link>
        <div>
          <p
            className="text-sm font-black tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-primary)" }}
          >
            Registrar Pago
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--color-accent)" }}
          >
            {debt.bank_name}
          </p>
        </div>
      </header>

      <PayForm debt={debt} />
    </main>
  );
}
