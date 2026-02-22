"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function parseCLP(raw: string): number {
  return Number(raw.replace(/[.,\s]/g, "").replace(/[^0-9]/g, ""));
}

interface IncomeFormProps {
  existingId: string | null;
  initialAmount: number;
  initialNote: string;
}

export default function IncomeForm({
  existingId,
  initialAmount,
  initialNote,
}: IncomeFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(
    initialAmount > 0 ? String(initialAmount) : ""
  );
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = parseCLP(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Ingresa un monto válido mayor a $0.");
      return;
    }

    setError(null);
    setSaving(true);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const noteValue = note.trim() || null;
    let dbError: { message: string } | null = null;

    if (existingId) {
      const { error } = await supabase
        .from("income")
        .update({ monthly_amount: parsed, note: noteValue })
        .eq("id", existingId);
      dbError = error as { message: string } | null;
    } else {
      const { error } = await supabase.from("income").insert({
        user_id: user.id,
        monthly_amount: parsed,
        note: noteValue,
      });
      dbError = error as { message: string } | null;
    }

    if (dbError) {
      setError(`Error al guardar: ${dbError.message}`);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          aria-label="Volver al dashboard"
        >
          ← Volver
        </Link>
        <p
          className="text-sm font-black tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-primary)" }}
        >
          Ingreso Mensual
        </p>
      </header>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-5"
      >
        {/* Contexto */}
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {existingId
            ? "Actualiza tu ingreso mensual neto. El dashboard recalculará los porcentajes automáticamente."
            : "Configura tu ingreso mensual neto para que el dashboard pueda calcular el ratio deuda / ingreso."}
        </p>

        {/* Error general */}
        {error && (
          <div
            className="border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--color-danger)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        )}

        {/* Campo: Ingreso Mensual */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="monthly_amount"
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Ingreso Mensual Neto (CLP){" "}
            <span style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <input
            id="monthly_amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej: 1300000"
            className="w-full border bg-transparent px-4 text-sm"
            style={{
              borderColor: error ? "var(--color-danger)" : "var(--color-border)",
              color: "var(--color-text-primary)",
              minHeight: "56px",
              fontSize: "1.25rem",
              fontWeight: 700,
              outline: "none",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-accent)")
            }
            onBlur={(e) =>
            (e.currentTarget.style.borderColor = error
              ? "var(--color-danger)"
              : "var(--color-border)")
            }
          />
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Tu sueldo líquido mensual o el total que recibes habitualmente.
          </p>
        </div>

        {/* Campo: Nota (opcional) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="income_note"
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Nota{" "}
            <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
              — opcional
            </span>
          </label>
          <input
            id="income_note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Sueldo + arriendo"
            className="w-full border bg-transparent px-4 text-sm"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
              minHeight: "48px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-accent)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-border)")
            }
          />
        </div>

        {/* Botón guardar */}
        <button
          type="submit"
          disabled={saving}
          className="w-full border text-sm font-black tracking-wide transition-opacity duration-150 disabled:opacity-60"
          style={{
            backgroundColor: saving
              ? "var(--color-accent-dim)"
              : "var(--color-accent)",
            color: "#080d14",
            borderColor: "var(--color-accent-dim)",
            minHeight: "52px",
          }}
        >
          {saving
            ? "Guardando…"
            : existingId
              ? "Actualizar Ingreso"
              : "Guardar Ingreso"}
        </button>
      </form>
    </main>
  );
}
