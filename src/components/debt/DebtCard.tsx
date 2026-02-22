import type { Debt } from "@/types/database";

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface DebtCardProps {
  debt: Debt;
}

export default function DebtCard({ debt }: DebtCardProps) {
  const hasOriginal =
    debt.original_amount != null && debt.original_amount > 0;

  const paidPercent = hasOriginal
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((debt.original_amount! - debt.current_balance) /
              debt.original_amount!) *
              100
          )
        )
      )
    : null;

  const barColor =
    paidPercent === null
      ? "var(--color-danger)"
      : paidPercent >= 75
        ? "var(--color-success)"
        : paidPercent >= 40
          ? "var(--color-warning)"
          : "var(--color-danger)";

  return (
    <div
      className="w-full border p-5"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Banco + badge de progreso */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          {debt.bank_name}
        </p>
        {paidPercent !== null && (
          <span
            className="text-xs font-bold px-2 py-0.5 border"
            style={{
              color: barColor,
              borderColor: barColor,
            }}
          >
            {paidPercent}% pagado
          </span>
        )}
      </div>

      {/* Saldo actual */}
      <p
        className="text-2xl font-black tracking-tight"
        style={{ color: "var(--color-danger)" }}
      >
        {formatCLP(debt.current_balance)}
      </p>

      {hasOriginal && (
        <p
          className="text-xs mt-1 mb-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          de {formatCLP(debt.original_amount!)} originales
        </p>
      )}

      {/* Barra de progreso de pago */}
      {paidPercent !== null && (
        <div
          className="w-full h-1.5 mt-3"
          style={{ backgroundColor: "var(--color-border)" }}
        >
          <div
            className="h-1.5 transition-all duration-500"
            style={{ width: `${paidPercent}%`, backgroundColor: barColor }}
          />
        </div>
      )}
    </div>
  );
}
