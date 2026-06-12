import React, { JSX } from "react";

import { useEventEmitterState } from "../../../../hooks/useEventEmitter";
import RightPanelStore from "../../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../../stores/right-panel/RightPanelStorePhases";
import { UPDATE_EVENT } from "../../../../stores/AsyncStore";
import { useGreatShopsCategories } from "./great-shops/useGreatShopsCategories";

// Webpack pre-bundles every PNG in res/img/great-shops at build time; the
// slug from the API (e.g. "rozhin-room") resolves to the same-named file.
// Project webpack config uses file-loader with esModule:false, so the
// context call returns the asset URL directly.
const logoContext = (require as any).context("../../../../../res/img/great-shops", false, /\.png$/);

function logoFor(slug: string | null): string | undefined {
    if (!slug) return undefined;
    try {
        return logoContext(`./${slug}.png`) as string;
    } catch {
        return undefined;
    }
}

export function GreatShopsView(): JSX.Element {
    const selectedId = useEventEmitterState(RightPanelStore.instance, UPDATE_EVENT, () => {
        const card = RightPanelStore.instance.currentCard;
        if (!RightPanelStore.instance.isOpen || card.phase !== RightPanelPhases.GreatShops) return null;
        return card.state?.greatShopPage ?? null;
    });

    const { categories, isLoading, error } = useGreatShopsCategories();

    let body: JSX.Element;
    if (isLoading) {
        body = <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>در حال بارگذاری...</div>;
    } else if (error) {
        body = <div style={{ padding: 24, textAlign: "center", color: "#d60000" }}>خطا در دریافت لیست کسب‌وکارها</div>;
    } else if (categories.length === 0) {
        body = <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>کسب‌وکاری یافت نشد</div>;
    } else {
        body = (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "14px",
                }}
            >
                {[...categories]
                    .sort((a, b) => a.order - b.order)
                    .map((item) => {
                        const itemId = String(item.id);
                        const isSelected = itemId === selectedId;
                        const logo = logoFor(item.slug);
                        return (
                            <div
                                key={item.id}
                                title={item.description}
                                onClick={() => {
                                    RightPanelStore.instance.setCard({
                                        phase: RightPanelPhases.GreatShops,
                                        state: { greatShopPage: itemId },
                                    });
                                }}
                                style={{
                                    borderRadius: "14px",
                                    height: "140px",
                                    cursor: "pointer",
                                    border: isSelected ? "2px solid #326430" : "1px solid #e6e6e6",
                                    boxShadow: isSelected
                                        ? "0 4px 8px rgba(50,100,48,0.20)"
                                        : "0 2px 6px rgba(0,0,0,0.06)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)")}
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.boxShadow = isSelected
                                        ? "0 4px 8px rgba(50,100,48,0.20)"
                                        : "0 1px 3px rgba(0,0,0,0.1)")
                                }
                            >
                                <div
                                    style={{
                                        width: "80px",
                                        height: "70px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "12px",
                                    }}
                                >
                                    {logo && (
                                        <img
                                            src={logo}
                                            alt={item.name}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "100%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    )}
                                </div>
                                <span
                                    style={{
                                        fontSize: "15px",
                                        fontWeight: 500,
                                        textAlign: "center",
                                        padding: "0 8px",
                                    }}
                                >
                                    {item.name}
                                </span>
                            </div>
                        );
                    })}
            </div>
        );
    }

    return (
        <div
            style={{
                height: "100%",
                overflowY: "auto",
                padding: "16px",
                boxSizing: "border-box",
            }}
        >
            {body}
        </div>
    );
}
