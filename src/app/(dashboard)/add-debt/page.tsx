"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface FormErrors {
  bank_name?: string;
  current_balance?: string;
  original_amount?: string;
  general?: string;
}

function parseCLP(raw: string): number {
  // Acepta "1.200.000" o "1200000" o "1,200,000"
  return Number(raw.replace(/[.,\s]/g, "").replace(/[^0-9]/g, ""));
}

export default function AddDebtPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bankName, setBankName] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // ── Manejo de foto ──────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Validación ──────────────────────────────────────────────
  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!bankName.trim()) {
      errs.bank_name = "El nombre del banco es requerido.";
    }
    const balance = parseCLP(currentBalance);
    if (!currentBalance || isNaN(balance) || balance <= 0) {
      errs.current_balance = "Ingresa un saldo actual válido mayor a $0.";
    }
    if (originalAmount) {
      const original = parseCLP(originalAmount);
      if (isNaN(original) || original <= 0) {
        errs.original_amount = "El monto original debe ser mayor a $0.";
      } else if (original < balance) {
        errs.original_amount =
          "El monto original no puede ser menor al saldo actual.";
      }
    }
    return errs;
  }

  // ── Submit ──────────────────────────────────────────────────
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrors({ general: "Sesión expirada. Por favor vuelve a iniciar sesión." });
        setLoading(false);
        return;
      }

      // Intentar subir foto (falla silenciosa si el bucket no existe)
      let imageUrl: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } =
          await supabase.storage.from("debt-images").upload(path, photoFile, {
            upsert: false,
            contentType: photoFile.type,
          });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("debt-images")
            .getPublicUrl(uploadData.path);
          imageUrl = urlData.publicUrl;
        }
        // Si uploadError: seguimos sin imagen, no bloqueamos el flujo
      }

      // Insertar deuda
      const { error: insertError } = await supabase.from("debts").insert({
        user_id: user.id,
        bank_name: bankName.trim(),
        current_balance: parseCLP(currentBalance),
        original_amount: originalAmount ? parseCLP(originalAmount) : null,
        image_url: imageUrl,
      });

      if (insertError) {
        setErrors({ general: `Error al guardar: ${insertError.message}` });
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrors({ general: "Ocurrió un error inesperado. Intenta de nuevo." });
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────
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
          href="/"
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
          Nueva Deuda
        </p>
      </header>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-5"
      >
        {/* Error general */}
        {errors.general && (
          <div
            className="border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--color-danger)",
              color: "var(--color-danger)",
              backgroundColor: "var(--color-accent-subtle)",
            }}
          >
            {errors.general}
          </div>
        )}

        {/* Campo: Banco */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="bank_name"
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Banco / Tarjeta <span style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <input
            id="bank_name"
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Ej: Santander, CMR Falabella…"
            autoComplete="off"
            className="w-full border bg-transparent px-4 text-sm"
            style={{
              borderColor: errors.bank_name
                ? "var(--color-danger)"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
              minHeight: "48px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-accent)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.bank_name
                ? "var(--color-danger)"
                : "var(--color-border)")
            }
          />
          {errors.bank_name && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>
              {errors.bank_name}
            </p>
          )}
        </div>

        {/* Campo: Saldo Actual */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="current_balance"
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Saldo Actual (CLP) <span style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <input
            id="current_balance"
            type="text"
            inputMode="numeric"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            placeholder="Ej: 450000"
            className="w-full border bg-transparent px-4 text-sm"
            style={{
              borderColor: errors.current_balance
                ? "var(--color-danger)"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
              minHeight: "48px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-accent)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.current_balance
                ? "var(--color-danger)"
                : "var(--color-border)")
            }
          />
          {errors.current_balance && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>
              {errors.current_balance}
            </p>
          )}
        </div>

        {/* Campo: Monto Original (opcional) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="original_amount"
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Monto Original (CLP){" "}
            <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
              — opcional
            </span>
          </label>
          <input
            id="original_amount"
            type="text"
            inputMode="numeric"
            value={originalAmount}
            onChange={(e) => setOriginalAmount(e.target.value)}
            placeholder="Ej: 800000"
            className="w-full border bg-transparent px-4 text-sm"
            style={{
              borderColor: errors.original_amount
                ? "var(--color-danger)"
                : "var(--color-border)",
              color: "var(--color-text-primary)",
              minHeight: "48px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-accent)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.original_amount
                ? "var(--color-danger)"
                : "var(--color-border)")
            }
          />
          {errors.original_amount && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>
              {errors.original_amount}
            </p>
          )}
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Úsalo para ver el % pagado en el dashboard.
          </p>
        </div>

        {/* Campo: Foto comprobante (opcional) */}
        <div className="flex flex-col gap-2">
          <p
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Foto Comprobante{" "}
            <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
              — opcional
            </span>
          </p>

          {!photoPreview ? (
            <label
              htmlFor="photo"
              className="flex items-center justify-center gap-2 border border-dashed text-sm font-semibold cursor-pointer transition-colors duration-150"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
                minHeight: "52px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📷</span>
              Seleccionar imagen
              <input
                ref={fileInputRef}
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Vista previa del comprobante"
                className="w-full object-cover"
                style={{ maxHeight: "200px", borderColor: "var(--color-border)", border: "1px solid" }}
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 border px-2 text-xs font-bold"
                style={{
                  backgroundColor: "var(--color-bg-surface)",
                  borderColor: "var(--color-danger)",
                  color: "var(--color-danger)",
                  minHeight: "32px",
                }}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Botón guardar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full border text-sm font-black tracking-wide transition-opacity duration-150 disabled:opacity-60"
          style={{
            backgroundColor: loading
              ? "var(--color-accent-dim)"
              : "var(--color-accent)",
            color: "#080d14",
            borderColor: "var(--color-accent-dim)",
            minHeight: "52px",
          }}
        >
          {loading ? "Guardando…" : "Guardar Deuda"}
        </button>
      </form>
    </main>
  );
}
