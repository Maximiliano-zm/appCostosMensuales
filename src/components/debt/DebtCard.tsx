import Link from "next/link";
import type { Debt } from "@/types/database";

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Returns days until due date. Negative = past due. */
function daysUntilDue(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(isoDate + "T00:00:00");
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDueDate(isoDate: string): string {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

  // Color semántico basado en progreso de pago
  const statusColor =
    paidPercent === null
      ? "var(--color-danger)"
      : paidPercent >= 75
        ? "var(--color-success)"
        : paidPercent >= 40
          ? "var(--color-warning)"
          : "var(--color-danger)";

  const badgeBg =
    paidPercent !== null && paidPercent >= 75
      ? "var(--color-success-subtle)"
      : paidPercent !== null && paidPercent >= 40
        ? "var(--color-warning-subtle)"
        : "var(--color-danger-subtle)";

  // Due date alert
  const hasDueDate = debt.next_due_date != null;
  const daysLeft = hasDueDate ? daysUntilDue(debt.next_due_date!) : null;
  const dueDateLabel = hasDueDate ? formatDueDate(debt.next_due_date!) : null;

  let dueAlertColor = "var(--color-text-muted)";
  let dueAlertBg = "transparent";
  let dueAlertText = "";
  if (daysLeft !== null) {
    if (daysLeft < 0) {
      dueAlertColor = "var(--color-danger)";
      dueAlertBg = "var(--color-danger-subtle)";
      dueAlertText = `Vencida hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) !== 1 ? "s" : ""}`;
    } else if (daysLeft === 0) {
      dueAlertColor = "var(--color-danger)";
      dueAlertBg = "var(--color-danger-subtle)";
      dueAlertText = "Vence hoy";
    } else if (daysLeft <= 3) {
      dueAlertColor = "var(--color-warning)";
      dueAlertBg = "var(--color-warning-subtle)";
      dueAlertText = `Vence en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`;
    } else if (daysLeft <= 7) {
      dueAlertColor = "var(--color-warning)";
      dueAlertBg = "transparent";
      dueAlertText = `Vence en ${daysLeft} días`;
    } else {
      dueAlertColor = "var(--color-text-muted)";
      dueAlertBg = "transparent";
      dueAlertText = `Vence ${dueDateLabel}`;
    }
  }

  const hasStatement = debt.statement_balance != null && debt.statement_balance > 0;

  return (
    <div
      className="w-full border"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        borderLeftColor: statusColor,
        borderLeftWidth: "3px",
      }}
    >
      {/* ── Cuerpo principal ───────────────────────────── */}
      <div className="p-5">
        {/* Banco + badge de progreso */}
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            {debt.bank_name}
          </p>
          {paidPercent !== null && (
            <span
              className="text-xs font-bold px-2 py-0.5"
              style={{
                color: statusColor,
                backgroundColor: badgeBg,
              }}
            >
              {paidPercent}% pagado
            </span>
          )}
        </div>

        {/* Saldo actual */}
        <p
          className="text-3xl font-black tracking-tight"
          style={{ color: "var(--color-danger)" }}
        >
          {formatCLP(debt.current_balance)}
        </p>

        {hasOriginal && (
          <p
            className="text-xs mt-1"
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
              style={{ width: `${paidPercent}%`, backgroundColor: statusColor }}
            />
          </div>
        )}

        {/* ── Sección billing cycle ─────────────────────── */}
        {hasStatement && (
          <div
            className="mt-4 pt-4 flex flex-col gap-2"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            {/* Tasa de interés */}
            {debt.interest_rate != null && (
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Tasa de interés mensual
                </p>
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--color-warning)" }}
                >
                  {debt.interest_rate}%
                </p>
              </div>
            )}

            {/* Monto facturado */}
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Facturado este mes
              </p>
              <p
                className="text-sm font-black"
                style={{ color: "var(--color-text-primary)" }}
              >
                {formatCLP(debt.statement_balance!)}
              </p>
            </div>

            {/* Pago mínimo */}
            {debt.minimum_payment != null && (
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Pago mínimo
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {formatCLP(debt.minimum_payment)}
                </p>
              </div>
            )}

            {/* Alerta de vencimiento */}
            {hasDueDate && (
              <div
                className="flex items-center justify-between px-3 py-1.5 mt-1"
                style={{
                  backgroundColor: dueAlertBg,
                  border: dueAlertBg !== "transparent" ? `1px solid ${dueAlertColor}` : "none",
                }}
              >
                <p className="text-xs font-bold" style={{ color: dueAlertColor }}>
                  {dueAlertText}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {dueDateLabel}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Botonera de acciones ───────────────────────── */}
      <div
        className="flex border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Link
          href={`/dashboard/statement/${debt.id}`}
          className="flex-1 flex items-center justify-center text-xs font-semibold border-r py-3"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
            minHeight: "44px",
          }}
        >
          {hasStatement ? "✏️ Editar Factura" : "📋 Registrar Factura"}
        </Link>

        {hasStatement && (
          <Link
            href={`/dashboard/pay/${debt.id}`}
            className="flex-1 flex items-center justify-center text-xs font-black py-3"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#080d14",
              minHeight: "44px",
            }}
          >
            💳 Pagar
          </Link>
        )}

        {!hasStatement && (
          <span
            className="flex-1 flex items-center justify-center text-xs py-3"
            style={{
              color: "var(--color-text-muted)",
              opacity: 0.4,
            }}
          >
            Registra factura para pagar
          </span>
        )}
      </div>
    </div>
  );
}
