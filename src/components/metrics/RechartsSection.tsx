"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#ef4444",
  "#f5a623",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Props {
  debts: { bank_name: string; current_balance: number }[];
}

export default function RechartsSection({ debts }: Props) {
  if (debts.length === 0) {
    return (
      <p className="text-xs text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        Sin datos — agrega tarjetas primero.
      </p>
    );
  }

  const data = debts.map((d) => ({
    name: d.bank_name,
    value: d.current_balance,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) =>
            value != null ? formatCLP(value) : "—"
          }
          contentStyle={{
            backgroundColor: "#141e2e",
            border: "1px solid #1f2f45",
            borderRadius: "2px",
            color: "#f0f4f8",
            fontSize: "12px",
          }}
        />
        <Legend
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", color: "#8ba3bc" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
