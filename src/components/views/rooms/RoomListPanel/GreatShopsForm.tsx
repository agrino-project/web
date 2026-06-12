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
import { _t } from "../../../../languageHandler";

// Webpack pre-bundles every SVG in res/img/great-shops at build time; the
// subcategory slug (e.g. "contract-request") resolves to the matching file.
// The "!!file-loader…!" inline loader prefix bypasses the project's configured
// SVG rules (which have an `issuer` filter that require.context can't satisfy)
// and forces a plain URL output for every match.
const iconContext = (require as any).context(
    "!!file-loader?esModule=false&name=img/[name].[hash:7].[ext]!../../../../../res/img/great-shops",
    false,
    /\.svg$/,
);

function iconFor(slug: string | null): string | undefined {
    if (!slug) return undefined;
    try {
        return iconContext(`./${slug}.svg`) as string;
    } catch {
        return undefined;
    }
}

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

export function GreatShopsForm({ page }: { page: string | null }): JSX.Element {
    const title = useEventEmitterState(RightPanelStore.instance, UPDATE_EVENT, () => {
        const card = RightPanelStore.instance.currentCard;
        if (!RightPanelStore.instance.isOpen || card.phase !== RightPanelPhases.GreatShops) return null;
        return card.state?.greatShopTitle ?? null;
    });

    const { subcategories, isLoading, error } = useGreatShopSubcategories(page);
    const [selectedSub, setSelectedSub] = useState<{ id: string; name: string } | null>(null);
    const { form, isLoading: isFormLoading, error: formError } = useGreatShopForm(selectedSub?.id ?? null);

    // Reset the inner selection when the parent category changes.
    useEffect(() => {
        setSelectedSub(null);
    }, [page]);

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
                <DynamicForm
                    form={form}
                    onSubmit={async (values: FormValues) => {
                        // TODO: wire this to the submit endpoint (API #4).
                        // eslint-disable-next-line no-console
                        console.log("[GreatShops] submit", selectedSub.id, values);
                    }}
                />
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
                        const icon = iconFor(sub.slug);
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
                                    {icon && (
                                        <div
                                            style={{
                                                width: 24,
                                                height: 24,
                                                backgroundImage: `url(${icon})`,
                                                backgroundSize: "contain",
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition: "center",
                                            }}
                                        />
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
