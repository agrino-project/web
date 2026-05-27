import React from "react";

export const greatShopWrapperStyle: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100%" };

export function GreatShopsHeader({ title }: { title: string }) {
    return (
        <div
            style={{
                fontWeight: "bold",
                color: "#6b7280",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderBottom: "1px solid #e6e6e6",
                height: 76,
            }}
        >
            {title}
        </div>
    );
}
