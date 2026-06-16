import React, { JSX, useEffect, useState } from "react";

import { useEventEmitterState } from "../../../../hooks/useEventEmitter";
import RightPanelStore from "../../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../../stores/right-panel/RightPanelStorePhases";
import { UPDATE_EVENT } from "../../../../stores/AsyncStore";
import { useGreatShopSubcategories } from "./great-shops/useGreatShopSubcategories";
import { useGreatShopForm } from "./great-shops/useGreatShopForm";
import { greatShopWrapperStyle } from "./great-shops/shared";
import { DynamicForm } from "./great-shops/DynamicForm";
import { type FormValues } from "./great-shops/formTypes";
import { submitGreatShopForm } from "./great-shops/submitGreatShopForm";
import { _t } from "../../../../languageHandler";

/** Header that delegates back navigation to the supplied handler. */
function Header({ title, onBack }: { title: string; onBack: () => void }): JSX.Element {
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
                    color: "#6b7280",
                    transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
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

    // Reset the inner selection and submission feedback when the parent category changes.
    useEffect(() => {
        setSelectedSub(null);
        setSubmitMessage(null);
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
                    color: "#6b7280",
                    padding: 24,
                    textAlign: "center",
                }}
            >
                برای مشاهده، یک کلان کسب‌وکار را از فهرست انتخاب کنید
            </div>
        );
    }

    // ---- Form view (a subcategory is selected) ----
    if (selectedSub) {
        let formBody: JSX.Element;
        if (isFormLoading) {
            formBody = <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>در حال بارگذاری فرم...</div>;
        } else if (formError) {
            formBody = <div style={{ padding: 24, textAlign: "center", color: "#d60000" }}>خطا در دریافت فرم</div>;
        } else if (!form || !form.steps || form.steps.length === 0) {
            formBody = (
                <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
                    ساختار فرم برای این بخش هنوز ثبت نشده.
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
                                setSubmitMessage({ kind: "success", text: "فرم با موفقیت ثبت شد." });
                                // After a short delay, return to the subcategory list so the user
                                // sees the success banner before navigation.
                                window.setTimeout(() => setSelectedSub(null), 1500);
                            } catch (e) {
                                setSubmitMessage({
                                    kind: "error",
                                    text: `خطا در ثبت فرم: ${(e as Error).message}`,
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

    // ---- Subcategory list view ----
    let body: JSX.Element;
    if (isLoading) {
        body = <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>در حال بارگذاری...</div>;
    } else if (error) {
        body = <div style={{ padding: 24, textAlign: "center", color: "#d60000" }}>خطا در دریافت زیرمجموعه‌ها</div>;
    } else if (subcategories.length === 0) {
        body = (
            <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
                زیرمجموعه‌ای برای این کسب‌وکار ثبت نشده
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
                                    border: "1px solid #e6e6e6",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    borderRadius: 12,
                                    padding: 16,
                                    cursor: "pointer",
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
                                        backgroundColor: "#326430",
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
                                        <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
                                            {sub.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px 0" }}>{sub.name}</h3>
                                    {sub.description && (
                                        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
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
            {body}
        </div>
    );
}
