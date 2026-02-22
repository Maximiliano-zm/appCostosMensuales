"use client";

import ReactApexChart from "react-apexcharts";

export interface ApexProps {
  totalDebt: number;
  monthlyIncome: number;
}

export default function ApexSection({ totalDebt, monthlyIncome }: ApexProps) {
  if (totalDebt === 0) {
    return (
      <p className="text-xs text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        Sin deuda registrada.
      </p>
    );
  }

  if (monthlyIncome === 0) {
    return (
      <p className="text-xs text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        Configura tu ingreso mensual para ver este gráfico.
      </p>
    );
  }

  const realCoveragePercent = Math.round((monthlyIncome / totalDebt) * 100);
  const chartPercent = Math.min(100, realCoveragePercent);

  const series = [chartPercent];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "radialBar",
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    plotOptions: {
      radialBar: {
        startAngle: -130,
        endAngle: 130,
        hollow: {
          size: "58%",
          background: "transparent",
        },
        track: {
          background: "#1f2f45",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            show: true,
            color: "#8ba3bc",
            fontSize: "12px",
            offsetY: 20,
          },
          value: {
            show: true,
            color: "#f0f4f8",
            fontSize: "28px",
            fontWeight: 900,
            offsetY: -10,
            formatter: () => `${realCoveragePercent}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        gradientToColors: ["#22c55e"],
        stops: [0, 100],
      },
    },
    colors: ["#f5a623"],
    labels: ["Cobertura mensual"],
    theme: { mode: "dark" },
  };

  return (
    <div className="flex flex-col items-center">
      <ReactApexChart
        type="radialBar"
        series={series}
        options={options}
        height={260}
        width="100%"
      />
      <p className="text-xs text-center mt-1" style={{ color: "var(--color-text-muted)" }}>
        Tu ingreso mensual cubre el{" "}
        <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
          {realCoveragePercent}%
        </span>{" "}
        de tu deuda total
      </p>
    </div>
  );
}
