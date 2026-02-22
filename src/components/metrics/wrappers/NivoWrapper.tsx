"use client";

import dynamic from "next/dynamic";
import React from "react";

const NivoSection = dynamic(() => import("../NivoSection"), {
    ssr: false,
    loading: () => <ChartPlaceholder />,
});

function ChartPlaceholder() {
    return (
        <div
            className="w-full h-64 border flex items-center justify-center"
            style={{
                backgroundColor: "var(--color-bg-card)",
                borderColor: "var(--color-border)",
            }}
        >
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Cargando gráfico Nivo…
            </p>
        </div>
    );
}

interface Props {
    totalDebt: number;
    monthlyIncome: number;
}

export default function NivoWrapper(props: Props) {
    return <NivoSection {...props} />;
}
