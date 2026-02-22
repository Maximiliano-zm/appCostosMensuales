"use client";

import dynamic from "next/dynamic";
import React from "react";

const ApexSection = dynamic(() => import("../ApexSection"), {
    ssr: false,
    loading: () => <ChartPlaceholder />,
});

function ChartPlaceholder() {
    return (
        <div
            className="w-full h-[260px] border flex items-center justify-center"
            style={{
                backgroundColor: "var(--color-bg-card)",
                borderColor: "var(--color-border)",
            }}
        >
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Cargando gráfico ApexCharts…
            </p>
        </div>
    );
}

interface Props {
    totalDebt: number;
    monthlyIncome: number;
}

export default function ApexWrapper(props: Props) {
    return <ApexSection {...props} />;
}
