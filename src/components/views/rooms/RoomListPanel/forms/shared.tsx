import React from "react";

export const green = "#10b981";
export const neutralBg = "#e5e7eb";
export const neutralText = "#9ca3af";

export const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    textAlign: "start",
};

export const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "start",
};

export const bodyStyle: React.CSSProperties = {
    padding: "24px 56px",
    margin: "0 auto",
    width: "100%",
    overflowY: "auto",
    flex: 1,
    boxSizing: "border-box",
    minHeight: 0,
};

export function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
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
                                backgroundColor: i === current ? green : neutralBg,
                                color: i === current ? "white" : neutralText,
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
                                backgroundColor: neutralBg,
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

export function FormHeader({ title, onClose }: { title: string; onClose: () => void }) {
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
                height: 62,
                paddingInline: "40px",
                position: "relative",
                textAlign: "center",
                boxSizing: "border-box",
            }}
        >
            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    right: 16,
                    border: "none",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#6b7280",
                    transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>
            {title}
        </div>
    );
}
