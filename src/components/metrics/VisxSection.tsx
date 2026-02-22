"use client";

import { scaleLinear, scaleBand } from "@visx/scale";
import { ParentSize } from "@visx/responsive";

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface DebtItem {
  bank_name: string;
  current_balance: number;
  original_amount: number | null;
}

interface ChartProps {
  debts: DebtItem[];
  width: number;
}

const MARGIN = { top: 10, right: 12, bottom: 10, left: 0 };
const BAR_HEIGHT = 36;
const BAR_GAP = 10;

function VisxChart({ debts, width }: ChartProps) {
  const payableDebts = debts.filter(
    (d) => d.original_amount != null && d.original_amount > 0
  );

  if (payableDebts.length === 0) {
    return (
      <text x={width / 2} y={40} textAnchor="middle" fill="#4a6080" fontSize={12}>
        Sin montos originales configurados
      </text>
    );
  }

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const svgHeight =
    MARGIN.top + payableDebts.length * (BAR_HEIGHT + BAR_GAP) + MARGIN.bottom;

  const maxPaidPercent = 100;

  const xScale = scaleLinear({
    domain: [0, maxPaidPercent],
    range: [0, innerWidth],
    clamp: true,
  });

  const yScale = scaleBand({
    domain: payableDebts.map((d) => d.bank_name),
    range: [MARGIN.top, svgHeight - MARGIN.bottom],
    padding: 0.25,
  });

  return (
    <svg width={width} height={svgHeight}>
      {payableDebts.map((d) => {
        const paidPercent = Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((d.original_amount! - d.current_balance) / d.original_amount!) *
                100
            )
          )
        );

        const barColor =
          paidPercent >= 75
            ? "#22c55e"
            : paidPercent >= 40
              ? "#f5a623"
              : "#ef4444";

        const y = yScale(d.bank_name) ?? 0;
        const barW = xScale(paidPercent);
        const trackW = xScale(100);
        const barH = yScale.bandwidth();
        const cy = y + barH / 2;

        return (
          <g key={d.bank_name}>
            {/* Track (fondo) */}
            <rect
              x={MARGIN.left}
              y={y}
              width={trackW}
              height={barH}
              fill="#1f2f45"
            />
            {/* Barra de progreso */}
            <rect
              x={MARGIN.left}
              y={y}
              width={barW}
              height={barH}
              fill={barColor}
              fillOpacity={0.85}
            />
            {/* Nombre del banco */}
            <text
              x={MARGIN.left + 8}
              y={cy + 1}
              dominantBaseline="middle"
              fill="#f0f4f8"
              fontSize={11}
              fontWeight={600}
            >
              {d.bank_name}
            </text>
            {/* Porcentaje */}
            <text
              x={MARGIN.left + trackW - 6}
              y={cy + 1}
              dominantBaseline="middle"
              textAnchor="end"
              fill="#080d14"
              fontSize={10}
              fontWeight={700}
            >
              {paidPercent}%
            </text>
            {/* Saldo actual debajo */}
            <text
              x={MARGIN.left + trackW + 6}
              y={cy + 1}
              dominantBaseline="middle"
              fill="#4a6080"
              fontSize={10}
            >
              {formatCLP(d.current_balance)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface Props {
  debts: DebtItem[];
}

export default function VisxSection({ debts }: Props) {
  if (debts.length === 0) {
    return (
      <p className="text-xs text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        Sin datos — agrega tarjetas primero.
      </p>
    );
  }

  const payableDebts = debts.filter(
    (d) => d.original_amount != null && d.original_amount > 0
  );

  if (payableDebts.length === 0) {
    return (
      <p className="text-xs text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        Agrega montos originales a tus tarjetas para ver el progreso de pago.
      </p>
    );
  }

  return (
    <ParentSize>
      {({ width }) =>
        width > 0 ? <VisxChart debts={debts} width={width} /> : null
      }
    </ParentSize>
  );
}
