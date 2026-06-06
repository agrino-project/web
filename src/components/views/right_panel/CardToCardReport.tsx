/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React from "react";
import { _t, type TranslationKey } from "../../../languageHandler";

/** Helper to cast new translation keys that the TS server hasn't picked up yet */
const t = (key: string, vars?: Record<string, string>): string => _t(key as TranslationKey, vars);

import CheckCircleIcon from "@vector-im/compound-design-tokens/assets/web/icons/check-circle-solid";
import CloseIcon from "@vector-im/compound-design-tokens/assets/web/icons/close";

export type ReportStatus = "success" | "failed" | "unknown";

export interface ReportRow {
    label: string;
    value: React.ReactNode;
    isCard?: boolean;
}

export interface CardToCardReportProps {
    status: ReportStatus;
    rows: ReportRow[];
    note?: string;
    showAddContact?: boolean;
    onClose(): void;
    title?: string;
    statusMessage?: string;
}

/** Styled "payment report" dialog content shown after a transfer attempt. */
const CardToCardReport: React.FC<CardToCardReportProps> = ({
    status,
    rows,
    note,
    showAddContact,
    title,
    statusMessage,
}) => {
    const [addContact, setAddContact] = React.useState(false);

    const displayStatusText =
        statusMessage ||
        (status === "success"
            ? t("custom_panels|card_to_card_status_success")
            : status === "failed"
              ? t("custom_panels|card_to_card_status_failed")
              : t("custom_panels|card_to_card_status_unknown"));

    const displayTitle = title || t("custom_panels|card_to_card_report_title");

    const handleShare = (): void => {
        if (typeof navigator !== "undefined" && navigator.share) {
            void navigator.share({ title: displayTitle, text: displayStatusText });
        }
    };

    return (
        <div className={`mx_CardToCardReport mx_CardToCardReport_${status}`}>
            <div className="mx_CardToCardReport_header">
                <h1>{displayTitle}</h1>
            </div>
            <div className="mx_CardToCardReport_body">
                <div className="mx_CardToCardReport_status">
                    <div className="mx_CardToCardReport_statusIcon">
                        {status === "success" && <CheckCircleIcon width="52px" height="52px" />}
                        {status === "failed" && (
                            <span className="mx_CardToCardReport_iconCircle">
                                <CloseIcon width="30px" height="30px" />
                            </span>
                        )}
                        {status === "unknown" && <span className="mx_CardToCardReport_iconCircle">!</span>}
                    </div>
                    <div className="mx_CardToCardReport_statusText">{displayStatusText}</div>
                </div>
                <div className="mx_CardToCardReport_rows">
                    {rows.map((row, i) => (
                        <div className="mx_CardToCardReport_row" key={i}>
                            <span className="mx_CardToCardReport_rowLabel">{row.label}</span>
                            <span
                                className={
                                    "mx_CardToCardReport_rowValue" +
                                    (row.isCard ? " mx_CardToCardReport_cardValue" : "")
                                }
                            >
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
                {showAddContact && (
                    <label className="mx_CardToCardReport_addContact">
                        <input type="checkbox" checked={addContact} onChange={(e) => setAddContact(e.target.checked)} />
                        {t("custom_panels|card_to_card_report_add_contact")}
                    </label>
                )}
                {note && <div className="mx_CardToCardReport_note">{note}</div>}
                <button type="button" className="mx_CardToCardReport_shareBtn" onClick={handleShare}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .12 1.07l-6.3 3.67a3 3 0 1 0 0 4.52l6.3 3.67A3 3 0 1 0 18 16a2.98 2.98 0 0 0-1.88.67l-6.3-3.67a3 3 0 0 0 0-1.94l6.3-3.67A2.98 2.98 0 0 0 18 8Z"
                            fill="currentColor"
                        />
                    </svg>
                    {t("custom_panels|card_to_card_report_share")}
                </button>
            </div>
        </div>
    );
};

export default CardToCardReport;
