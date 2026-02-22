"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Debt } from "@/types/database";

interface StatementFormProps {
  debt: Debt;
}

interface FormErrors {
  statement_balance?: string;
  minimum_payment?: string;
  next_due_date?: string;
  interest_rate?: string;
  general?: string;
}

function parseCLP(raw: string): number {
  return Number(raw.replace(/[.,\s]/g, "").replace(/[^0-9]/g, ""));
}

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function StatementForm({ debt }: StatementFormProps) {
  const router = useRouter();

  const [statementBalance, setStatementBalance] = useState(
    debt.statement_balance != null ? String(Math.round(debt.statement_balance)) : ""
  );
  const [minimumPayment, setMinimumPayment] = useState(
    debt.minimum_payment != null ? String(Math.round(debt.minimum_payment)) : ""
  );
  const [nextDueDate, setNextDueDate] = useState(debt.next_due_date ?? "");
  const [interestRate, setInterestRate] = useState(
    debt.interest_rate != null ? String(debt.interest_rate) : ""
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    const balance = parseCLP(statementBalance);
    if (!statementBalance || isNaN(balance) || balance <= 0) {
      errs.statement_balance = "Ingresa el monto facturado mayor a $0.";
    }
    const minPay = parseCLP(minimumPayment);
    if (!minimumPayment || isNaN(minPay) || minPay <= 0) {
      errs.minimum_payment = "Ingresa el pago mínimo mayor a $0.";
    } else if (balance > 0 && minPay > balance) {
      errs.minimum_payment = "El pago mínimo no puede superar el monto facturado.";
    }
    if (!nextDueDate) {
      errs.next_due_date = "Selecciona la fecha de vencimiento.";
    }
    if (interestRate) {
      const rate = parseFloat(interestRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        errs.interest_rate = "La tasa debe ser un número entre 0 y 100.";
      }
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    try {
      const { error } = await supabase
        .from("debts")
        .update({
          statement_balance: parseCLP(statementBalance),
          minimum_payment: parseCLP(minimumPayment),
          next_due_date: nextDueDate,
          interest_rate: interestRate ? parseFloat(interestRate) : null,
        })
        .eq("id", debt.id);

      if (error) {
        setErrors({ general: `Error al guardar: ${error.message}` });
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({ general: "Error inesperado. Intenta de nuevo." });
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-5"
    >
      {/* Info card: saldo actual */}
      <div
        className="border p-4"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderColor: "var(--color-border)",
          borderLeftColor: "var(--color-accent)",
          borderLeftWidth: "3px",
        }}
      >
        <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1"
          style={{ color: "var(--color-text-muted)" }}>
          Deuda total acumulada
        </p>
        <p className="text-2xl font-black" style={{ color: "var(--color-danger)" }}>
          {formatCLP(debt.current_balance)}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          Registra la factura de este mes para hacer el seguimiento de pagos.
        </p>
      </div>

      {/* Error general */}
      {errors.general && (
        <div
          className="border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--color-danger)",
            color: "var(--color-danger)",
            backgroundColor: "var(--color-danger-subtle)",
          }}
        >
          {errors.general}
        </div>
      )}

      {/* Campo: Monto Facturado */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="statement_balance"
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Monto Facturado este Mes (CLP){" "}
          <span style={{ color: "var(--color-danger)" }}>*</span>
        </label>
        <input
          id="statement_balance"
          type="text"
          inputMode="numeric"
          value={statementBalance}
          onChange={(e) => setStatementBalance(e.target.value)}
          placeholder="Ej: 120000"
          className="w-full border bg-transparent px-4 text-sm"
          style={{
            borderColor: errors.statement_balance
              ? "var(--color-danger)"
              : "var(--color-border)",
            color: "var(--color-text-primary)",
            minHeight: "48px",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors.statement_balance
              ? "var(--color-danger)"
              : "var(--color-border)")
          }
        />
        {errors.statement_balance && (
          <p className="text-xs" style={{ color: "var(--color-danger)" }}>
            {errors.statement_balance}
          </p>
        )}
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          El total a pagar que figura en tu estado de cuenta este mes.
        </p>
      </div>

      {/* Campo: Pago Mínimo */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="minimum_payment"
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Pago Mínimo (CLP){" "}
          <span style={{ color: "var(--color-danger)" }}>*</span>
        </label>
        <input
          id="minimum_payment"
          type="text"
          inputMode="numeric"
          value={minimumPayment}
          onChange={(e) => setMinimumPayment(e.target.value)}
          placeholder="Ej: 30000"
          className="w-full border bg-transparent px-4 text-sm"
          style={{
            borderColor: errors.minimum_payment
              ? "var(--color-danger)"
              : "var(--color-border)",
            color: "var(--color-text-primary)",
            minHeight: "48px",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors.minimum_payment
              ? "var(--color-danger)"
              : "var(--color-border)")
          }
        />
        {errors.minimum_payment && (
          <p className="text-xs" style={{ color: "var(--color-danger)" }}>
            {errors.minimum_payment}
          </p>
        )}
      </div>

      {/* Campo: Fecha de Vencimiento */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="next_due_date"
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Fecha de Vencimiento{" "}
          <span style={{ color: "var(--color-danger)" }}>*</span>
        </label>
        <input
          id="next_due_date"
          type="date"
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
          className="w-full border bg-transparent px-4 text-sm"
          style={{
            borderColor: errors.next_due_date
              ? "var(--color-danger)"
              : "var(--color-border)",
            color: "var(--color-text-primary)",
            minHeight: "48px",
            outline: "none",
            colorScheme: "dark",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors.next_due_date
              ? "var(--color-danger)"
              : "var(--color-border)")
          }
        />
        {errors.next_due_date && (
          <p className="text-xs" style={{ color: "var(--color-danger)" }}>
            {errors.next_due_date}
          </p>
        )}
      </div>

      {/* Campo: Tasa de Interés (opcional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="interest_rate"
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Tasa de Interés Mensual (%){" "}
          <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
            — opcional
          </span>
        </label>
        <input
          id="interest_rate"
          type="text"
          inputMode="decimal"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          placeholder="Ej: 2.5"
          className="w-full border bg-transparent px-4 text-sm"
          style={{
            borderColor: errors.interest_rate
              ? "var(--color-danger)"
              : "var(--color-border)",
            color: "var(--color-text-primary)",
            minHeight: "48px",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors.interest_rate
              ? "var(--color-danger)"
              : "var(--color-border)")
          }
        />
        {errors.interest_rate && (
          <p className="text-xs" style={{ color: "var(--color-danger)" }}>
            {errors.interest_rate}
          </p>
        )}
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Para priorizar qué tarjeta pagar primero (mayor tasa = mayor urgencia).
        </p>
      </div>

      {/* Botón guardar */}
      <button
        type="submit"
        disabled={loading}
        className="w-full border text-sm font-black tracking-wide transition-opacity duration-150 disabled:opacity-60"
        style={{
          backgroundColor: loading ? "var(--color-accent-dim)" : "var(--color-accent)",
          color: "#080d14",
          borderColor: "var(--color-accent-dim)",
          minHeight: "52px",
        }}
      >
        {loading ? "Guardando…" : "Guardar Estado de Cuenta"}
      </button>
    </form>
  );
}
