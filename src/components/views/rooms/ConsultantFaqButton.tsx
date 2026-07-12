/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React from "react";
import { type Room } from "matrix-js-sdk/src/matrix";

import Modal from "../../../Modal";
import BaseDialog from "../dialogs/BaseDialog";
import { _t } from "../../../languageHandler";

interface Props {
    room: Room;
}

/** Room name markers we treat as the agriculture consultant bot. */
const CONSULTANT_NAME_TOKENS = ["مشاور هوشمند کشاورز", "مشاور کشاورز", "مشاور هوشمند"];

/** Path served by webpack's CopyPlugin from res/media/faq/agriculture-consultant.html */
const FAQ_URL = "media/faq/agriculture-consultant.html";

function isConsultantRoom(room: Room): boolean {
    const name = (room.name ?? "").trim();
    if (!name) return false;
    return CONSULTANT_NAME_TOKENS.some((token) => name.includes(token));
}

function openFaqDialog(): void {
    Modal.createDialog(
        FaqDialog,
        {},
        "mx_ConsultantFaqDialog",
        /* isPriority */ false,
        /* isStatic */ false,
    );
}

const FaqDialog: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
    return (
        <BaseDialog
            className="mx_ConsultantFaqDialog"
            hasCancel={true}
            onFinished={onFinished}
            title={_t("custom_panels|consultant_faq_title")}
            fixedWidth={false}
        >
            <div className="mx_ConsultantFaqDialog_frameWrapper">
                <iframe
                    className="mx_ConsultantFaqDialog_frame"
                    src={FAQ_URL}
                    title={_t("custom_panels|consultant_faq_title")}
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        </BaseDialog>
    );
};

/**
 * "سوالات متداول" button. Only renders inside a room that looks like the
 * agriculture consultant bot; on click opens a modal that embeds the static
 * FAQ HTML asset in an iframe.
 */
export const ConsultantFaqButton: React.FC<Props> = ({ room }) => {
    if (!isConsultantRoom(room)) return null;
    return (
        <button
            type="button"
            className="mx_ConsultantFaqButton"
            onClick={openFaqDialog}
            title={_t("custom_panels|consultant_faq_title")}
        >
            <span className="mx_ConsultantFaqButton_icon" aria-hidden="true">
                ?
            </span>
            <span className="mx_ConsultantFaqButton_label">{_t("custom_panels|consultant_faq_short")}</span>
        </button>
    );
};

export default ConsultantFaqButton;
