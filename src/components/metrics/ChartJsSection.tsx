"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Props {
  debts: { bank_name: string; current_balance: number; original_amount: number | null }[];
}

export default function ChartJsSection({ debts }: Props) {
  if (debts.length === 0) {
    return (
      <p className="text-xs text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        Sin datos — agrega tarjetas primero.
      </p>
    );
  }

  const labels = debts.map((d) => d.bank_name);

  const data = {
    labels,
    datasets: [
      {
        label: "Saldo Actual",
        data: debts.map((d) => d.current_balance),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 1,
        borderRadius: 2,
      },
      ...(debts.some((d) => d.original_amount)
        ? [
            {
              label: "Monto Original",
              data: debts.map((d) => d.original_amount ?? 0),
              backgroundColor: "rgba(245, 166, 35, 0.3)",
              borderColor: "#f5a623",
              borderWidth: 1,
              borderRadius: 2,
            },
          ]
        : []),
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#8ba3bc",
          font: { size: 11 },
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) =>
            `${ctx.dataset.label}: ${formatCLP(ctx.parsed.x ?? 0)}`,
        },
        backgroundColor: "#141e2e",
        borderColor: "#1f2f45",
        borderWidth: 1,
        titleColor: "#f0f4f8",
        bodyColor: "#8ba3bc",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#4a6080",
          font: { size: 10 },
          callback: (value: string | number) =>
            typeof value === "number"
              ? `$${(value / 1_000_000).toFixed(1)}M`
              : value,
        },
        grid: { color: "rgba(31,47,69,0.6)" },
      },
      y: {
        ticks: { color: "#8ba3bc", font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  const height = Math.max(160, debts.length * 48);

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}
