"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Debt } from "@/types/database";

interface PayFormProps {
  debt: Debt;
}

type PaymentOption = "minimum" | "full" | "custom";

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseCLP(raw: string): number {
  return Number(raw.replace(/[.,\s]/g, "").replace(/[^0-9]/g, ""));
}

function daysUntilDue(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(isoDate + "T00:00:00");
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PayForm({ debt }: PayFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<PaymentOption>("full");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const statementBalance = debt.statement_balance!;
  const minimumPayment = debt.minimum_payment ?? 0;

  const daysLeft =
    debt.next_due_date != null ? daysUntilDue(debt.next_due_date) : null;
  const isPastDue = daysLeft !== null && daysLeft < 0;
  const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  function getPaymentAmount(): number {
    if (selected === "minimum") return minimumPayment;
    if (selected === "full") return statementBalance;
    return parseCLP(customAmount);
  }

  function validate(): string {
    const amount = getPaymentAmount();
    if (selected === "custom") {
      if (!customAmount || isNaN(amount) || amount <= 0) {
        return "Ingresa un monto válido mayor a $0.";
      }
    }
    if (amount > debt.current_balance) {
      return `El pago (${formatCLP(amount)}) supera el saldo actual (${formatCLP(debt.current_balance)}).`;
    }
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const amount = getPaymentAmount();
    const newBalance = Math.max(0, debt.current_balance - amount);

    try {
      const { error: updateError } = await supabase
        .from("debts")
        .update({
          current_balance: newBalance,
          statement_balance: null,
          minimum_payment: null,
          next_due_date: null,
        })
        .eq("id", debt.id);

      if (updateError) {
        setError(`Error al registrar el pago: ${updateError.message}`);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-5">
      {/* Alerta de vencimiento */}
      {(isPastDue || isDueSoon) && (
        <div
          className="border px-4 py-3 text-sm font-bold"
          style={{
            borderColor: isPastDue ? "var(--color-danger)" : "var(--color-warning)",
            color: isPastDue ? "var(--color-danger)" : "var(--color-warning)",
            backgroundColor: isPastDue
              ? "var(--color-danger-subtle)"
              : "var(--color-warning-subtle)",
          }}
        >
          {isPastDue
            ? `⚠️ Factura vencida hace ${Math.abs(daysLeft!)} día${Math.abs(daysLeft!) !== 1 ? "s" : ""}`
            : daysLeft === 0
              ? "⚠️ Vence hoy"
              : `⚠️ Vence en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`}
        </div>
      )}

      {/* Resumen de la deuda */}
      <div
        className="border p-4 flex flex-col gap-3"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderColor: "var(--color-border)",
          borderTopColor: "var(--color-accent)",
          borderTopWidth: "2px",
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Deuda total acumulada
          </p>
          <p className="text-lg font-black" style={{ color: "var(--color-danger)" }}>
            {formatCLP(debt.current_balance)}
          </p>
        </div>
        <div
          className="pt-3 flex flex-col gap-2"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Facturado este mes
            </p>
            <p className="text-sm font-black" style={{ color: "var(--color-text-primary)" }}>
              {formatCLP(statementBalance)}
            </p>
          </div>
          {minimumPayment > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Pago mínimo
              </p>
              <p className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                {formatCLP(minimumPayment)}
              </p>
            </div>
          )}
          {debt.interest_rate != null && (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Tasa de interés mensual
              </p>
              <p className="text-xs font-bold" style={{ color: "var(--color-warning)" }}>
                {debt.interest_rate}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Opciones de pago */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          ¿Cuánto deseas pagar?
        </p>

        {/* Opción: Pago completo */}
        <button
          type="button"
          onClick={() => setSelected("full")}
          className="w-full border p-4 text-left transition-colors duration-150"
          style={{
            backgroundColor:
              selected === "full"
                ? "var(--color-bg-card-elevated)"
                : "var(--color-bg-card)",
            borderColor:
              selected === "full" ? "var(--color-accent)" : "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Pago Completo
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Salda la factura completa del mes
              </p>
            </div>
            <p className="text-lg font-black" style={{ color: "var(--color-success)" }}>
              {formatCLP(statementBalance)}
            </p>
          </div>
        </button>

        {/* Opción: Pago mínimo */}
        {minimumPayment > 0 && (
          <button
            type="button"
            onClick={() => setSelected("minimum")}
            className="w-full border p-4 text-left transition-colors duration-150"
            style={{
              backgroundColor:
                selected === "minimum"
                  ? "var(--color-bg-card-elevated)"
                  : "var(--color-bg-card)",
              borderColor:
                selected === "minimum" ? "var(--color-warning)" : "var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Pago Mínimo
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-warning)" }}
                >
                  Evita mora, pero genera intereses
                </p>
              </div>
              <p className="text-lg font-black" style={{ color: "var(--color-warning)" }}>
                {formatCLP(minimumPayment)}
              </p>
            </div>
          </button>
        )}

        {/* Opción: Monto personalizado */}
        <button
          type="button"
          onClick={() => setSelected("custom")}
          className="w-full border p-4 text-left transition-colors duration-150"
          style={{
            backgroundColor:
              selected === "custom"
                ? "var(--color-bg-card-elevated)"
                : "var(--color-bg-card)",
            borderColor:
              selected === "custom" ? "var(--color-accent)" : "var(--color-border)",
          }}
        >
          <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            Otro monto
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Ingresa un monto personalizado
          </p>
        </button>

        {/* Input monto personalizado */}
        {selected === "custom" && (
          <input
            type="text"
            inputMode="numeric"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Ej: 80000"
            autoFocus
            className="w-full border bg-transparent px-4 text-sm"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-text-primary)",
              minHeight: "48px",
              outline: "none",
            }}
          />
        )}

        {/* Error */}
        {error && (
          <p className="text-xs" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        {/* Botón confirmar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full border text-sm font-black tracking-wide transition-opacity duration-150 disabled:opacity-60 mt-2"
          style={{
            backgroundColor: loading ? "var(--color-accent-dim)" : "var(--color-accent)",
            color: "#080d14",
            borderColor: "var(--color-accent-dim)",
            minHeight: "52px",
          }}
        >
          {loading ? "Registrando pago…" : "Confirmar Pago"}
        </button>

        <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
          El pago reducirá el saldo acumulado de la tarjeta y cerrará la factura del mes.
        </p>
      </form>
    </div>
  );
}
