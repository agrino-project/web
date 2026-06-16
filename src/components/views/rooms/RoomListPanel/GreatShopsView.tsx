import React, { JSX, useState } from "react";

import { useEventEmitterState } from "../../../../hooks/useEventEmitter";
import RightPanelStore from "../../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../../stores/right-panel/RightPanelStorePhases";
import { UPDATE_EVENT } from "../../../../stores/AsyncStore";
import { useGreatShopsCategories } from "./great-shops/useGreatShopsCategories";

/**
 * Shows the shop image, or a styled fallback with the first letter of the name
 * if the image URL is missing or fails to load.
 */
function ShopLogo({ src, name }: { src?: string; name: string }): JSX.Element {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #326430 0%, #4a9e47 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "22px",
                    fontWeight: 700,
                }}
                aria-label={name}
            >
                {name.charAt(0)}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            onError={() => setFailed(true)}
            style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
            }}
        />
    );
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
                        const logo = item.image ?? undefined;
                        return (
                            <div
                                key={item.id}
                                title={item.description}
                                onClick={() => {
                                    RightPanelStore.instance.setCard({
                                        phase: RightPanelPhases.GreatShops,
                                        state: { greatShopPage: itemId, greatShopTitle: item.name },
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
                                    <ShopLogo src={logo} name={item.name} />
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
