/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useEffect, useState, type JSX } from "react";

import { _t, type TranslationKey } from "../../../../languageHandler";
import { DynamicForm } from "../../rooms/RoomListPanel/great-shops/DynamicForm";
import { type FormValues } from "../../rooms/RoomListPanel/great-shops/formTypes";
import { greatShopWrapperStyle } from "../../rooms/RoomListPanel/great-shops/shared";
import { useInsuranceSubcategories } from "./useInsuranceSubcategories";
import { useInsuranceForm } from "./useInsuranceForm";
import { submitInsuranceForm } from "./submitInsuranceForm";
import "../../../../../res/css/views/agriculture/InsuranceView.pcss";

function Header({ title, onBack }: { title: string; onBack: () => void }): JSX.Element {
    return (
        <div className="mx_InsuranceView_header">
            <button
                className="mx_InsuranceView_back"
                onClick={onBack}
                aria-label={_t("action|back")}
                type="button"
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
            <h2 className="mx_InsuranceView_title">{title}</h2>
        </div>
    );
}

function ServiceIcon({ src, name }: { src?: string; name: string }): JSX.Element {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="mx_InsuranceView_iconFallback" aria-label={name}>
                {name.charAt(0)}
            </div>
        );
    }

    return (
        <img
            className="mx_InsuranceView_iconImg"
            src={src}
            alt=""
            onError={() => setFailed(true)}
        />
    );
}

export interface InsuranceViewProps {
    onBack: () => void;
}

/**
 * Agricultural insurance list + form, shown inline inside AgriculturePage
 * (no separate mobile tab / RightPanel phase).
 */
export function InsuranceView({ onBack }: InsuranceViewProps): JSX.Element {
    const { subcategories, isLoading, error } = useInsuranceSubcategories();
    const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
    const { form, isLoading: isFormLoading, error: formError } = useInsuranceForm(selected?.id ?? null);
    const [submitMessage, setSubmitMessage] = useState<{ kind: "success" | "error"; text: string } | null>(
        null,
    );

    useEffect(() => {
        setSubmitMessage(null);
    }, [selected?.id]);

    if (selected) {
        let formBody: JSX.Element;
        if (isFormLoading) {
            formBody = (
                <div className="mx_InsuranceView_status">
                    {_t("custom_panels|form_loading" as TranslationKey)}
                </div>
            );
        } else if (formError) {
            formBody = (
                <div className="mx_InsuranceView_status mx_InsuranceView_status_error">
                    {_t("custom_panels|form_load_error" as TranslationKey)}
                </div>
            );
        } else if (!form || !form.steps || form.steps.length === 0) {
            formBody = (
                <div className="mx_InsuranceView_status">
                    {_t("custom_panels|form_not_configured" as TranslationKey)}
                </div>
            );
        } else {
            formBody = (
                <div className="mx_InsuranceView_formScroll">
                    {submitMessage && (
                        <div
                            className={
                                submitMessage.kind === "success"
                                    ? "mx_InsuranceView_banner mx_InsuranceView_banner_success"
                                    : "mx_InsuranceView_banner mx_InsuranceView_banner_error"
                            }
                        >
                            {submitMessage.text}
                        </div>
                    )}
                    <DynamicForm
                        form={form}
                        onSubmit={async (values: FormValues) => {
                            setSubmitMessage(null);
                            try {
                                await submitInsuranceForm(selected.id, form, values);
                                setSubmitMessage({
                                    kind: "success",
                                    text: _t("custom_panels|form_submitted" as TranslationKey),
                                });
                                window.setTimeout(() => setSelected(null), 1500);
                            } catch (e) {
                                setSubmitMessage({
                                    kind: "error",
                                    text: _t("custom_panels|form_submit_error" as TranslationKey, {
                                        error: (e as Error).message,
                                    }),
                                });
                                throw e;
                            }
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="mx_InsuranceView" style={greatShopWrapperStyle}>
                <Header title={selected.name} onBack={() => setSelected(null)} />
                {formBody}
            </div>
        );
    }

    let body: JSX.Element;
    if (isLoading) {
        body = (
            <div className="mx_InsuranceView_status">
                {_t("custom_panels|loading" as TranslationKey)}
            </div>
        );
    } else if (error) {
        body = (
            <div className="mx_InsuranceView_status mx_InsuranceView_status_error">
                {_t("custom_panels|insurance_load_error" as TranslationKey)}
            </div>
        );
    } else if (subcategories.length === 0) {
        body = (
            <div className="mx_InsuranceView_status">
                {_t("custom_panels|no_insurance_services" as TranslationKey)}
            </div>
        );
    } else {
        body = (
            <div className="mx_InsuranceView_list">
                {[...subcategories]
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="mx_InsuranceView_card"
                            title={item.description}
                            onClick={() => setSelected({ id: String(item.id), name: item.name })}
                        >
                            <div className="mx_InsuranceView_card_icon">
                                <ServiceIcon src={item.image ?? undefined} name={item.name} />
                            </div>
                            <div className="mx_InsuranceView_card_text">
                                <h3 className="mx_InsuranceView_card_title">{item.name}</h3>
                                {item.description && (
                                    <p className="mx_InsuranceView_card_desc">{item.description}</p>
                                )}
                            </div>
                        </button>
                    ))}
            </div>
        );
    }

    return (
        <div className="mx_InsuranceView" style={greatShopWrapperStyle}>
            <Header title={_t("custom_panels|agriculture_insurance")} onBack={onBack} />
            {body}
        </div>
    );
}
