import React from "react";
import { JSX } from "react";
import { RozhinWorkRoom } from "./great-shops/RozhinWorkRoom";
import { KallehWorkRoom } from "./great-shops/KallehWorkRoom";
import { HarazWorkRoom } from "./great-shops/HarazWorkRoom";
import { PegahWorkRoom } from "./great-shops/PegahWorkRoom";

export function GreatShopsForm({ page }: { page: string }): JSX.Element {
    switch (page) {
        case "rozhin":
            return <RozhinWorkRoom />;
        case "kalleh":
            return <KallehWorkRoom />;
        case "haraz":
            return <HarazWorkRoom />;
        case "pegah":
            return <PegahWorkRoom />;
        default:
            return <div style={{ padding: 24, color: "#6b7280" }}>صفحه یافت نشد</div>;
    }
}
