/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useCallback, useEffect, useId, useRef, useState } from "react";

import { _t } from "../../../../languageHandler";
import {
    CONSULTANT_FAQ_DB,
    FAQ_FALLBACK_ANSWER,
    FAQ_FREE_TEXT_REPLY,
    FAQ_HEADER_SUBTITLE,
    FAQ_HEADER_TITLE,
    FAQ_WELCOME,
    type FaqOption,
} from "./consultantFaqData";

type TextItem =
    | { key: string; kind: "text"; role: "bot" | "user"; text: string }
    | { key: string; kind: "options"; options: FaqOption[]; active: boolean };

function buildWelcome(): TextItem[] {
    return [
        { key: "welcome", kind: "text", role: "bot", text: FAQ_WELCOME },
        {
            key: "main-options",
            kind: "options",
            options: CONSULTANT_FAQ_DB.mainCategories,
            active: true,
        },
    ];
}

function deactivateOptions(items: ChatItem[]): ChatItem[] {
    return items.map((item) => (item.kind === "options" ? { ...item, active: false } : item));
}

/**
 * Interactive FAQ chat for the agriculture banking consultant.
 * Port of the former static HTML guide into themed React UI.
 */
export const ConsultantFaqChat: React.FC = () => {
    const [items, setItems] = useState<ChatItem[]>(() => buildWelcome());
    const [history, setHistory] = useState<string[]>([]);
    const [draft, setDraft] = useState("");
    const listRef = useRef<HTMLDivElement>(null);
    const inputId = useId();
    const keySeq = useRef(0);

    const nextKey = useCallback((prefix: string): string => {
        keySeq.current += 1;
        return `${prefix}-${keySeq.current}`;
    }, []);

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [items]);

    const resetChat = useCallback((): void => {
        keySeq.current = 0;
        setHistory([]);
        setDraft("");
        setItems(buildWelcome());
    }, []);

    const appendLayer = useCallback(
        (categoryId: string, prevItems: ChatItem[]): ChatItem[] => {
            const layer2 = CONSULTANT_FAQ_DB.layer2[categoryId];
            if (layer2) {
                return [
                    ...prevItems,
                    { key: nextKey("q"), kind: "text", role: "bot", text: layer2.question },
                    { key: nextKey("opts"), kind: "options", options: layer2.options, active: true },
                ];
            }

            const layer3 = CONSULTANT_FAQ_DB.layer3[categoryId];
            if (layer3) {
                return [
                    ...prevItems,
                    { key: nextKey("q"), kind: "text", role: "bot", text: layer3.question },
                    { key: nextKey("opts"), kind: "options", options: layer3.options, active: true },
                ];
            }

            const answer = CONSULTANT_FAQ_DB.answers[categoryId] ?? FAQ_FALLBACK_ANSWER;
            return [...prevItems, { key: nextKey("ans"), kind: "text", role: "bot", text: answer }];
        },
        [nextKey],
    );

    const onSelectOption = useCallback(
        (option: FaqOption): void => {
            setItems((prev) => {
                const withUser: ChatItem[] = [
                    ...deactivateOptions(prev),
                    { key: nextKey("user"), kind: "text", role: "user", text: option.label },
                ];
                return appendLayer(option.id, withUser);
            });
            setHistory((prev) => [...prev, option.id]);
        },
        [appendLayer, nextKey],
    );

    const goBack = useCallback((): void => {
        if (history.length === 0) {
            resetChat();
            return;
        }

        const nextHistory = history.slice(0, -1);
        keySeq.current = 0;
        let nextItems = buildWelcome();
        for (const id of nextHistory) {
            const label =
                CONSULTANT_FAQ_DB.mainCategories.find((c) => c.id === id)?.label ??
                Object.values(CONSULTANT_FAQ_DB.layer2)
                    .flatMap((l) => l.options)
                    .find((o) => o.id === id)?.label ??
                Object.values(CONSULTANT_FAQ_DB.layer3)
                    .flatMap((l) => l.options)
                    .find((o) => o.id === id)?.label ??
                id;
            nextItems = deactivateOptions(nextItems);
            nextItems = [
                ...nextItems,
                { key: nextKey("user"), kind: "text", role: "user", text: label },
            ];
            nextItems = appendLayer(id, nextItems);
        }
        setHistory(nextHistory);
        setItems(nextItems);
    }, [appendLayer, history, nextKey, resetChat]);

    const sendFreeText = useCallback((): void => {
        const text = draft.trim();
        if (!text) return;
        setDraft("");
        setItems((prev) => [
            ...deactivateOptions(prev),
            { key: nextKey("user"), kind: "text", role: "user", text },
            { key: nextKey("bot"), kind: "text", role: "bot", text: FAQ_FREE_TEXT_REPLY },
        ]);
    }, [draft, nextKey]);

    return (
        <div className="mx_ConsultantFaqChat">
            <header className="mx_ConsultantFaqChat_header">
                <div className="mx_ConsultantFaqChat_logo" aria-hidden="true">
                    ک
                </div>
                <div className="mx_ConsultantFaqChat_headerText">
                    <h2 className="mx_ConsultantFaqChat_title">{FAQ_HEADER_TITLE}</h2>
                    <p className="mx_ConsultantFaqChat_subtitle">{FAQ_HEADER_SUBTITLE}</p>
                </div>
            </header>

            <div className="mx_ConsultantFaqChat_messages" ref={listRef} role="log" aria-live="polite">
                {items.map((item) => {
                    if (item.kind === "text") {
                        return (
                            <div
                                key={item.key}
                                className={`mx_ConsultantFaqChat_bubble mx_ConsultantFaqChat_bubble_${item.role}`}
                            >
                                {item.text}
                            </div>
                        );
                    }
                    return (
                        <div key={item.key} className="mx_ConsultantFaqChat_optionsBubble" role="group">
                            <div className="mx_ConsultantFaqChat_options">
                                {item.options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className="mx_ConsultantFaqChat_option mx_Dialog_nonDialogButton"
                                        disabled={!item.active}
                                        onClick={() => onSelectOption(opt)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer className="mx_ConsultantFaqChat_footer">
                <div className="mx_ConsultantFaqChat_inputRow">
                    <label className="mx_ConsultantFaqChat_srOnly" htmlFor={inputId}>
                        {_t("custom_panels|consultant_faq_input_label")}
                    </label>
                    <input
                        id={inputId}
                        className="mx_ConsultantFaqChat_input"
                        type="text"
                        value={draft}
                        placeholder={_t("custom_panels|consultant_faq_input_placeholder")}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                sendFreeText();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="mx_ConsultantFaqChat_send mx_Dialog_nonDialogButton"
                        onClick={sendFreeText}
                    >
                        {_t("custom_panels|consultant_faq_send")}
                    </button>
                </div>
                <div className="mx_ConsultantFaqChat_actions">
                    <button
                        type="button"
                        className="mx_ConsultantFaqChat_actionBtn mx_Dialog_nonDialogButton"
                        onClick={goBack}
                    >
                        {_t("custom_panels|consultant_faq_back")}
                    </button>
                    <button
                        type="button"
                        className="mx_ConsultantFaqChat_actionBtn mx_Dialog_nonDialogButton"
                        onClick={resetChat}
                    >
                        {_t("custom_panels|consultant_faq_restart")}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ConsultantFaqChat;
