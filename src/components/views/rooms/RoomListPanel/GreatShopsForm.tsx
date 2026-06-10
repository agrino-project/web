import React from "react";
import { JSX } from "react";
import { RozhinWorkRoom } from "./great-shops/RozhinWorkRoom";
import { KallehWorkRoom } from "./great-shops/KallehWorkRoom";
import { HarazWorkRoom } from "./great-shops/HarazWorkRoom";
import { PegahWorkRoom } from "./great-shops/PegahWorkRoom";

export function GreatShopsForm({ page }: { page: string | null }): JSX.Element {
    switch (page) {
        case "rozhin":
            return <RozhinWorkRoom />;
        case "kalleh":
            return <KallehWorkRoom />;
        case "haraz":
            return <HarazWorkRoom />;
        case "pegah":
            return <PegahWorkRoom />;
        case null:
            return (
                <div
                    style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6b7280",
                        padding: 24,
                        textAlign: "center",
                    }}
                >
                    برای مشاهده، یک کلان کسب‌وکار را از فهرست انتخاب کنید
                </div>
            );
        default:
            return <div style={{ padding: 24, color: "#6b7280" }}>صفحه یافت نشد</div>;
    }
}
