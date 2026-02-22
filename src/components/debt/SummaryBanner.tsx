import Link from "next/link";

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface SummaryBannerProps {
  totalDebt: number;
  monthlyIncome: number;
  debtCount: number;
}

export default function SummaryBanner({
  totalDebt,
  monthlyIncome,
  debtCount,
}: SummaryBannerProps) {
  const ratio = monthlyIncome > 0 ? totalDebt / monthlyIncome : 0;
  const coveragePercent =
    totalDebt > 0 && monthlyIncome > 0
      ? Math.min(100, Math.round((monthlyIncome / totalDebt) * 100))
      : 0;

  const ratioColor =
    ratio > 3
      ? "var(--color-danger)"
      : ratio > 1.5
        ? "var(--color-warning)"
        : "var(--color-success)";

  return (
    <div
      className="w-full border p-6"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        borderTopColor: "var(--color-accent)",
        borderTopWidth: "2px",
      }}
    >
      {/* Label */}
      <p
        className="text-xs font-semibold tracking-[0.2em] uppercase mb-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        Total Tarjetas de Crédito &middot; {debtCount}{" "}
        {debtCount === 1 ? "tarjeta" : "tarjetas"}
      </p>

      {/* Número grande — protagonista visual */}
      <p
        className="text-5xl font-black tracking-tight leading-none mb-5"
        style={{ color: "var(--color-danger)" }}
      >
        {formatCLP(totalDebt)}
      </p>

      {/* Divider */}
      <div
        className="w-full mb-4"
        style={{ height: "1px", backgroundColor: "var(--color-border)" }}
      />

      {/* Ingreso vs Ratio */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Ingreso mensual
            </p>
            <Link
              href="/dashboard/settings"
              className="text-xs font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              {monthlyIncome > 0 ? "Editar" : "Configurar ›"}
            </Link>
          </div>
          <p
            className="text-xl font-bold"
            style={{
              color:
                monthlyIncome > 0
                  ? "var(--color-success)"
                  : "var(--color-text-muted)",
            }}
          >
            {monthlyIncome > 0 ? formatCLP(monthlyIncome) : "No configurado"}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-xs mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Ratio deuda&nbsp;/&nbsp;ingreso
          </p>
          <p className="text-2xl font-black" style={{ color: ratioColor }}>
            {monthlyIncome > 0 ? `${ratio.toFixed(1)}x` : "—"}
          </p>
        </div>
      </div>

      {/* Barra de cobertura */}
      {totalDebt > 0 && monthlyIncome > 0 && (
        <>
          <div
            className="w-full h-2"
            style={{ backgroundColor: "var(--color-border)" }}
          >
            <div
              className="h-2 transition-all duration-500"
              style={{
                width: `${coveragePercent}%`,
                backgroundColor: "var(--color-success)",
              }}
            />
          </div>
          <p
            className="text-xs mt-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            Tu ingreso mensual cubre el{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {coveragePercent}%
            </span>{" "}
            de tu deuda total
          </p>
        </>
      )}

      {totalDebt > 0 && monthlyIncome === 0 && (
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Configura tu ingreso para ver el ratio y la cobertura.
        </p>
      )}

      {totalDebt === 0 && (
        <p className="text-sm font-semibold" style={{ color: "var(--color-success)" }}>
          Sin deudas registradas. ¡Excelente!
        </p>
      )}
    </div>
  );
}
