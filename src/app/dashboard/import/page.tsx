"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

// ── Plantilla CSV descargable ────────────────────────────────────────────────
const CSV_TEMPLATE = [
  "banco,saldo_actual,monto_original",
  "Santander,800000,1200000",
  "CMR Falabella,450000,",
  "BancoEstado,320000,500000",
].join("\n");

// ── Tipos ────────────────────────────────────────────────────────────────────
interface ParsedRow {
  banco: string;
  saldo_actual: number;
  monto_original: number | null;
  valid: boolean;
  errors: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseCSVLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cols.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cols.push(current);
  return cols;
}

function toNumber(raw: string): number | null {
  const clean = raw.replace(/[^0-9]/g, "");
  return clean ? Number(clean) : null;
}

function parseCSV(text: string): ParsedRow[] {
  const clean = text
    .replace(/^\uFEFF/, "") // quitar BOM de Excel
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const lines = clean.trim().split("\n");
  const dataLines = lines.slice(1).filter((l) => l.trim() !== "");

  return dataLines.map((line) => {
    const cols = parseCSVLine(line);
    const banco = (cols[0] ?? "").trim().replace(/^"|"$/g, "");
    const saldoRaw = (cols[1] ?? "").trim().replace(/^"|"$/g, "");
    const originalRaw = (cols[2] ?? "").trim().replace(/^"|"$/g, "");

    const saldo = toNumber(saldoRaw);
    const original = originalRaw ? toNumber(originalRaw) : null;

    const errors: string[] = [];
    if (!banco) errors.push("Banco requerido");
    if (saldo === null || saldo <= 0) errors.push("Saldo inválido");
    if (original !== null && original <= 0) errors.push("Monto original inválido");
    if (saldo !== null && original !== null && original < saldo)
      errors.push("Monto original < saldo actual");

    return {
      banco,
      saldo_actual: saldo ?? 0,
      monto_original: original,
      valid: errors.length === 0,
      errors,
    };
  });
}

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_deudas.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Componente ───────────────────────────────────────────────────────────────
export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setRows([]);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError(
          "El archivo no contiene filas de datos. Asegúrate de usar la plantilla correcta."
        );
      }
      setRows(parsed);
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleImport() {
    if (validRows.length === 0) return;
    setImporting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const inserts = validRows.map((row) => ({
      user_id: user.id,
      bank_name: row.banco,
      current_balance: row.saldo_actual,
      original_amount: row.monto_original,
    }));

    const { error: dbError } = await supabase.from("debts").insert(inserts);

    if (dbError) {
      setError(`Error al importar: ${dbError.message}`);
      setImporting(false);
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
        >
          ← Volver
        </Link>
        <p
          className="text-sm font-black tracking-[0.15em] uppercase"
          style={{ color: "var(--color-text-primary)" }}
        >
          Importar CSV
        </p>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-5">
        {/* Instrucciones + descarga */}
        <div
          className="border p-4"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <p
            className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            Formato esperado
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
            Descarga la plantilla, rellena tus deudas en Excel o Google Sheets
            (exporta como CSV) y sube el archivo aquí.
          </p>
          <p
            className="text-xs font-mono mb-3 px-3 py-2 border"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
              backgroundColor: "var(--color-bg-surface)",
            }}
          >
            banco,saldo_actual,monto_original
          </p>
          <button
            onClick={downloadTemplate}
            className="w-full border text-xs font-semibold"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-accent)",
              minHeight: "44px",
            }}
          >
            ↓ Descargar Plantilla CSV
          </button>
        </div>

        {/* Selector de archivo */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="csvFile"
            className="flex items-center justify-center gap-2 border border-dashed text-sm font-semibold cursor-pointer"
            style={{
              borderColor: fileName ? "var(--color-accent)" : "var(--color-border)",
              color: fileName ? "var(--color-accent)" : "var(--color-text-muted)",
              minHeight: "56px",
            }}
          >
            {fileName ? `✓ ${fileName}` : "↑ Seleccionar archivo CSV"}
            <input
              ref={fileInputRef}
              id="csvFile"
              type="file"
              accept=".csv,.txt"
              className="sr-only"
              onChange={handleFile}
            />
          </label>
          {fileName && (
            <button
              type="button"
              onClick={() => {
                setRows([]);
                setFileName(null);
                setError(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Cambiar archivo
            </button>
          )}
        </div>

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

        {/* Preview de filas */}
        {rows.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Resumen */}
            <div className="flex items-center gap-4">
              <p className="text-xs" style={{ color: "var(--color-success)" }}>
                ✓ {validRows.length} válidas
              </p>
              {invalidRows.length > 0 && (
                <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                  ✗ {invalidRows.length} con errores (se omitirán)
                </p>
              )}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--color-bg-surface)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <th className="text-left px-3 py-2 border" style={{ borderColor: "var(--color-border)" }}>
                      Banco
                    </th>
                    <th className="text-right px-3 py-2 border" style={{ borderColor: "var(--color-border)" }}>
                      Saldo Actual
                    </th>
                    <th className="text-right px-3 py-2 border" style={{ borderColor: "var(--color-border)" }}>
                      Original
                    </th>
                    <th className="px-3 py-2 border" style={{ borderColor: "var(--color-border)" }}>
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: row.valid
                          ? "var(--color-bg-card)"
                          : "var(--color-accent-subtle)",
                      }}
                    >
                      <td
                        className="px-3 py-2 border font-semibold"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {row.banco || <em style={{ color: "var(--color-danger)" }}>vacío</em>}
                      </td>
                      <td
                        className="px-3 py-2 border text-right"
                        style={{
                          borderColor: "var(--color-border)",
                          color: row.valid ? "var(--color-danger)" : "var(--color-text-muted)",
                        }}
                      >
                        {row.saldo_actual > 0 ? formatCLP(row.saldo_actual) : "—"}
                      </td>
                      <td
                        className="px-3 py-2 border text-right"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {row.monto_original ? formatCLP(row.monto_original) : "—"}
                      </td>
                      <td
                        className="px-3 py-2 border"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        {row.valid ? (
                          <span style={{ color: "var(--color-success)" }}>✓</span>
                        ) : (
                          <span
                            title={row.errors.join(", ")}
                            style={{ color: "var(--color-danger)", cursor: "help" }}
                          >
                            ✗ {row.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botón de importar */}
            {validRows.length > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full border text-sm font-black tracking-wide transition-opacity duration-150 disabled:opacity-60"
                style={{
                  backgroundColor: importing
                    ? "var(--color-accent-dim)"
                    : "var(--color-accent)",
                  color: "#080d14",
                  borderColor: "var(--color-accent-dim)",
                  minHeight: "52px",
                }}
              >
                {importing
                  ? "Importando…"
                  : `Importar ${validRows.length} deuda${validRows.length > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
