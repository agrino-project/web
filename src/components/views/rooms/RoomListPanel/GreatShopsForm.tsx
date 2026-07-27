import React, { JSX, useEffect, useState } from "react";

import { useEventEmitterState } from "../../../../hooks/useEventEmitter";
import RightPanelStore from "../../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../../stores/right-panel/RightPanelStorePhases";
import { UPDATE_EVENT } from "../../../../stores/AsyncStore";
import { useGreatShopSubcategories } from "./great-shops/useGreatShopSubcategories";
import { useGreatShopForm } from "./great-shops/useGreatShopForm";
import { useGreatShopHistory } from "./great-shops/useGreatShopHistory";
import { GreatShopHistoryList } from "./great-shops/GreatShopHistoryList";
import { errorColor, greatShopWrapperStyle, green, neutralText } from "./great-shops/shared";
import { DynamicForm } from "./great-shops/DynamicForm";
import { type FormValues } from "./great-shops/formTypes";
import { submitGreatShopForm } from "./great-shops/submitGreatShopForm";
import { _t, type TranslationKey } from "../../../../languageHandler";

type ShopTab = "new" | "history";

/** Header that delegates back navigation to the supplied handler. */
function Header({ title, onBack }: { title: string; onBack: () => void }): JSX.Element {
    return (
        <div
            style={{
                position: "relative",
                fontWeight: "bold",
                color: neutralText,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderBottom: "1px solid var(--agrino-surface-border)",
                height: 76,
                flexShrink: 0,
            }}
        >
            <button
                onClick={onBack}
                aria-label={_t("action|back")}
                style={{
                    position: "absolute",
                    insetInlineStart: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                    borderRadius: "50%",
                    color: neutralText,
                    transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--agrino-surface-muted, rgba(128,128,128,0.15))")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            {title}
        </div>
    );
}

function ShopTabs({
    active,
    onChange,
}: {
    active: ShopTab;
    onChange: (tab: ShopTab) => void;
}): JSX.Element {
    const tabStyle = (isActive: boolean): React.CSSProperties => ({
        flex: 1,
        height: 40,
        border: "none",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        cursor: "pointer",
        background: isActive ? "var(--agrino-surface)" : "transparent",
        color: isActive ? "var(--cpd-color-text-primary)" : neutralText,
        boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.18)" : "none",
        transition: "background 0.15s, box-shadow 0.15s, color 0.15s",
    });

    return (
        <div
            style={{
                display: "flex",
                gap: 4,
                margin: "12px 16px 4px",
                padding: 4,
                borderRadius: 12,
                background: "var(--agrino-surface-muted, var(--cpd-color-form-bg))",
                flexShrink: 0,
            }}
            role="tablist"
        >
            <button
                type="button"
                role="tab"
                aria-selected={active === "new"}
                onClick={() => onChange("new")}
                style={tabStyle(active === "new")}
            >
                {_t("custom_panels|history_tab_new_request" as TranslationKey)}
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={active === "history"}
                onClick={() => onChange("history")}
                style={tabStyle(active === "history")}
            >
                {_t("custom_panels|history_tab_history" as TranslationKey)}
            </button>
        </div>
    );
}

export function GreatShopsForm({ page }: { page: string | null }): JSX.Element {
    const title = useEventEmitterState(RightPanelStore.instance, UPDATE_EVENT, () => {
        const card = RightPanelStore.instance.currentCard;
        if (!RightPanelStore.instance.isOpen || card.phase !== RightPanelPhases.GreatShops) return null;
        return card.state?.greatShopTitle ?? null;
    });

    const { subcategories, isLoading, error } = useGreatShopSubcategories(page);
    const [selectedSub, setSelectedSub] = useState<{ id: string; name: string } | null>(null);
    const { form, isLoading: isFormLoading, error: formError } = useGreatShopForm(selectedSub?.id ?? null);
    const [submitMessage, setSubmitMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<ShopTab>("new");

    const historyEnabled = page !== null && !selectedSub && activeTab === "history";
    const {
        items: historyItems,
        isLoading: historyLoading,
        error: historyError,
        refresh: refreshHistory,
    } = useGreatShopHistory(historyEnabled, page);

    // Reset the inner selection, tab, and submission feedback when the parent category changes.
    useEffect(() => {
        setSelectedSub(null);
        setSubmitMessage(null);
        setActiveTab("new");
    }, [page]);

    // Also reset the submission banner whenever a new sub-form is opened.
    useEffect(() => {
        setSubmitMessage(null);
    }, [selectedSub?.id]);

    if (page === null) {
        return (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: neutralText,
                    padding: 24,
                    textAlign: "center",
                }}
            >
                {_t("custom_panels|select_category_hint" as TranslationKey)}
            </div>
        );
    }

    // ---- Form view (a subcategory is selected) ----
    if (selectedSub) {
        let formBody: JSX.Element;
        if (isFormLoading) {
            formBody = (
                <div style={{ padding: 24, textAlign: "center", color: neutralText }}>
                    {_t("custom_panels|form_loading" as TranslationKey)}
                </div>
            );
        } else if (formError) {
            formBody = (
                <div style={{ padding: 24, textAlign: "center", color: errorColor }}>
                    {_t("custom_panels|form_load_error" as TranslationKey)}
                </div>
            );
        } else if (!form || !form.steps || form.steps.length === 0) {
            formBody = (
                <div style={{ padding: 24, textAlign: "center", color: neutralText }}>
                    {_t("custom_panels|form_not_configured" as TranslationKey)}
                </div>
            );
        } else {
            formBody = (
                <div
                    style={{
                        margin: "0 auto",
                        width: "100%",
                        overflowY: "auto",
                        flex: 1,
                        boxSizing: "border-box",
                        minHeight: 0,
                    }}
                >
                    {submitMessage && (
                        <div
                            style={{
                                margin: "16px 24px 0",
                                padding: "10px 14px",
                                borderRadius: 12,
                                fontSize: 13,
                                textAlign: "center",
                                color: submitMessage.kind === "success" ? "#15803d" : "#d60000",
                                background:
                                    submitMessage.kind === "success"
                                        ? "rgba(34, 197, 94, 0.08)"
                                        : "rgba(214, 0, 0, 0.08)",
                                border:
                                    submitMessage.kind === "success"
                                        ? "1px solid rgba(34, 197, 94, 0.35)"
                                        : "1px solid rgba(214, 0, 0, 0.35)",
                            }}
                        >
                            {submitMessage.text}
                        </div>
                    )}
                    <DynamicForm
                        form={form}
                        onSubmit={async (values: FormValues) => {
                            setSubmitMessage(null);
                            try {
                                await submitGreatShopForm(selectedSub.id, form, values);
                                setSubmitMessage({
                                    kind: "success",
                                    text: _t("custom_panels|form_submitted" as TranslationKey),
                                });
                                refreshHistory();
                                // After a short delay, return to the subcategory list so the user
                                // sees the success banner before navigation.
                                window.setTimeout(() => setSelectedSub(null), 1500);
                            } catch (e) {
                                setSubmitMessage({
                                    kind: "error",
                                    text: _t("custom_panels|form_submit_error" as TranslationKey, {
                                        error: (e as Error).message,
                                    }),
                                });
                                throw e; // bubble so DynamicForm clears its `isSubmitting` flag.
                            }
                        }}
                    />
                </div>
            );
        }
        return (
            <div style={greatShopWrapperStyle}>
                <Header title={selectedSub.name} onBack={() => setSelectedSub(null)} />
                {formBody}
            </div>
        );
    }

    // ---- Subcategory list / History tabs ----
    let body: JSX.Element;
    if (activeTab === "history") {
        body = (
            <GreatShopHistoryList items={historyItems} isLoading={historyLoading} error={historyError} />
        );
    } else if (isLoading) {
        body = (
            <div style={{ padding: 24, textAlign: "center", color: neutralText }}>
                {_t("custom_panels|loading" as TranslationKey)}
            </div>
        );
    } else if (error) {
        body = (
            <div style={{ padding: 24, textAlign: "center", color: errorColor }}>
                {_t("custom_panels|subcategories_error" as TranslationKey)}
            </div>
        );
    } else if (subcategories.length === 0) {
        body = (
            <div style={{ padding: 24, textAlign: "center", color: neutralText }}>
                {_t("custom_panels|no_subcategory" as TranslationKey)}
            </div>
        );
    } else {
        body = (
            <div
                style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    height: "100%",
                    overflowY: "auto",
                    minHeight: 0,
                }}
            >
                {[...subcategories]
                    .sort((a, b) => a.order - b.order)
                    .map((sub) => {
                        const icon = sub.image ?? undefined;
                        return (
                            <div
                                key={sub.id}
                                onClick={() => setSelectedSub({ id: String(sub.id), name: sub.name })}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 16,
                                    border: "1px solid var(--agrino-surface-border)",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    borderRadius: 12,
                                    padding: 16,
                                    cursor: "pointer",
                                    background: "var(--agrino-surface)",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)")}
                                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)")}
                            >
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        backgroundColor: green,
                                    }}
                                >
                                    {icon ? (
                                        <div
                                            style={{
                                                width: 24,
                                                height: 24,
                                                backgroundImage: `url("${icon}")`,
                                                backgroundSize: "contain",
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition: "center",
                                            }}
                                        />
                                    ) : (
                                        <span style={{ color: "var(--cpd-color-text-on-solid-primary, #fff)", fontSize: 18, fontWeight: 700 }}>
                                            {sub.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            margin: "0 0 4px 0",
                                            color: "var(--cpd-color-text-primary)",
                                        }}
                                    >
                                        {sub.name}
                                    </h3>
                                    {sub.description && (
                                        <p style={{ fontSize: 14, color: neutralText, lineHeight: 1.6, margin: 0 }}>
                                            {sub.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    }

    const backToShopList = (): void => {
        RightPanelStore.instance.setCard({
            phase: RightPanelPhases.GreatShops,
            state: { greatShopPage: null },
        });
    };

    return (
        <div style={greatShopWrapperStyle}>
            <Header title={title ?? ""} onBack={backToShopList} />
            <ShopTabs active={activeTab} onChange={setActiveTab} />
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{body}</div>
        </div>
    );
}
