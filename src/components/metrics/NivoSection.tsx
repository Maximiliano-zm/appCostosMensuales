"use client";

import { ResponsivePie } from "@nivo/pie";

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface NivoProps {
  totalDebt: number;
  monthlyIncome: number;
}

export default function NivoSection({ totalDebt, monthlyIncome }: NivoProps) {
  if (totalDebt === 0 && monthlyIncome === 0) {
    return (
      <p className="text-xs text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        Sin datos — agrega tarjetas y configura tu ingreso.
      </p>
    );
  }

  const data = [
    {
      id: "Deuda",
      label: "Deuda Total",
      value: totalDebt,
      color: "#ef4444",
    },
    {
      id: "Ingreso",
      label: "Ingreso Mensual",
      value: monthlyIncome,
      color: "#22c55e",
    },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ height: 260 }}>
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
        innerRadius={0.55}
        padAngle={2}
        cornerRadius={1}
        colors={["#ef4444", "#22c55e"]}
        borderWidth={0}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsColor={{ from: "color" }}
        arcLinkLabelsTextColor="#8ba3bc"
        arcLinkLabelsThickness={1}
        arcLabelsSkipAngle={15}
        arcLabelsTextColor="#080d14"
        tooltip={({ datum }) => (
          <div
            style={{
              background: "#141e2e",
              border: "1px solid #1f2f45",
              padding: "6px 10px",
              fontSize: "12px",
              color: "#f0f4f8",
            }}
          >
            <strong>{datum.label}:</strong> {formatCLP(datum.value)}
          </div>
        )}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            translateY: 50,
            itemWidth: 120,
            itemHeight: 14,
            itemTextColor: "#8ba3bc",
            symbolSize: 10,
            symbolShape: "square",
          },
        ]}
        theme={{
          background: "transparent",
          text: { fill: "#8ba3bc", fontSize: 11 },
        }}
      />
    </div>
  );
}
