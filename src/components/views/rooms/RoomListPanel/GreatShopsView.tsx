import React, { JSX } from "react";
import { useEventEmitterState } from "../../../../hooks/useEventEmitter";
import RightPanelStore from "../../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../../stores/right-panel/RightPanelStorePhases";
import { UPDATE_EVENT } from "../../../../stores/AsyncStore";
import kallehLogo from "../../../../../res/img/great-shops/kalleh.png";
import rozhinLogo from "../../../../../res/img/great-shops/rozhin.png";
import harazLogo from "../../../../../res/img/great-shops/haraz.png";
import pegahLogo from "../../../../../res/img/great-shops/pegah.png";

const shopItems = [
    {
        id: "rozhin",
        title: "روژین",
        image: rozhinLogo,
    },
    {
        id: "kalleh",
        title: "کاله",
        image: kallehLogo,
    },
    {
        id: "haraz",
        title: "هراز",
        image: harazLogo,
    },
    {
        id: "pegah",
        title: "پگاه",
        image: pegahLogo,
    },
];

export function GreatShopsView(): JSX.Element {
    const selectedId = useEventEmitterState(RightPanelStore.instance, UPDATE_EVENT, () => {
        const card = RightPanelStore.instance.currentCard;
        if (!RightPanelStore.instance.isOpen || card.phase !== RightPanelPhases.GreatShops) return null;
        return card.state?.greatShopPage ?? null;
    });
    return (
        <div
            style={{
                height: "100%",
                overflowY: "auto",
                padding: "16px",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "14px",
                }}
            >
                {shopItems.map((item) => {
                    const isSelected = item.id === selectedId;
                    return (
                    <div
                        key={item.id}
                        onClick={() => {
                            RightPanelStore.instance.setCard({
                                phase: RightPanelPhases.GreatShops,
                                state: { greatShopPage: item.id },
                            });
                        }}
                        style={{
                            borderRadius: "14px",
                            height: "140px",
                            cursor: "pointer",
                            border: isSelected ? "2px solid #326430" : "1px solid #e6e6e6",
                            boxShadow: isSelected ? "0 4px 8px rgba(50,100,48,0.20)" : "0 2px 6px rgba(0,0,0,0.06)",
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
                        {/* Logo */}
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
                            <img
                                src={item.image}
                                alt={item.title}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </div>

                        {/* Title */}
                        <span
                            style={{
                                fontSize: "15px",
                                color: "#222",
                                fontWeight: 500,
                            }}
                        >
                            {item.title}
                        </span>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}
