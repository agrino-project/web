import React from "react";

import { _t } from "../../../../../languageHandler";
import { useMobileNav } from "../../../../structures/mobile/MobileNavContext";
import RightPanelStore from "../../../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../../../stores/right-panel/RightPanelStorePhases";

export const greatShopWrapperStyle: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100%" };

// ---------- Brand tokens ----------

export const green = "#326430";
export const neutralBg = "#e5e7eb";
export const neutralText = "#9ca3af";
export const errorColor = "#d60000";

// ---------- Form-control styles ----------

export const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    textAlign: "start",
};

export const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: errorColor,
};

export const selectStyle: React.CSSProperties = {
    ...inputStyle,
    color: "#111",
};

export const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "start",
};

export const descriptionStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    marginBottom: 8,
    textAlign: "start",
};

export const errorTextStyle: React.CSSProperties = {
    fontSize: 12,
    color: errorColor,
    marginTop: 6,
    textAlign: "start",
};

export const bodyStyle: React.CSSProperties = {
    padding: "24px 40px",
    margin: "0 auto",
    width: "100%",
    overflowY: "auto",
    flex: 1,
    boxSizing: "border-box",
    minHeight: 0,
};

export const sectionStyle: React.CSSProperties = {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    display: "flex",
    flexDirection: "column",
    gap: 16,
};

export const buttonStyle: React.CSSProperties = {
    flex: 1,
    height: 44,
    backgroundColor: green,
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "bold",
    cursor: "pointer",
};

export const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#fff",
    color: green,
    border: `1px solid ${green}`,
};

// ---------- StepIndicator (from the old static forms) ----------

export function StepIndicator({ current, steps }: { current: number; steps: string[] }): React.JSX.Element {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 4,
                marginBottom: 24,
                width: "100%",
            }}
        >
            {steps.map((label, i) => (
                <React.Fragment key={i}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                            width: 60,
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: "bold",
                                backgroundColor: i <= current ? green : neutralBg,
                                color: i <= current ? "white" : neutralText,
                                flexShrink: 0,
                                zIndex: 2,
                            }}
                        >
                            {i + 1}
                        </div>
                        <span
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                width: "100%",
                                lineHeight: "1.2",
                                color: i === current ? green : neutralText,
                                fontWeight: i === current ? 600 : 400,
                                minHeight: 24,
                            }}
                        >
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            style={{
                                flex: 1,
                                height: 2,
                                backgroundColor: i < current ? green : neutralBg,
                                marginTop: 14,
                                marginLeft: -8,
                                marginRight: -8,
                                minWidth: 10,
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ---------- Header with back button (used by shop list + subcategory list) ----------

export function GreatShopsHeader({ title }: { title: string }): React.JSX.Element {
    const { navigate } = useMobileNav();

    const onBack = (): void => {
        // Clear the selected shop form and return to the shop list, staying within
        // the Great Shops section.
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.GreatShops, state: { greatShopPage: null } });
        navigate("greatShops");
    };

    return (
        <div
            style={{
                position: "relative",
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
            <button
                className="mx_RoomHeader_mobileBackButton"
                onClick={onBack}
                aria-label={_t("action|back")}
                style={{ position: "absolute", insetInlineStart: 16 }}
            >
                <div className="mx_RoomHeader_mobileBackIcon" />
            </button>
            {title}
        </div>
    );
}
