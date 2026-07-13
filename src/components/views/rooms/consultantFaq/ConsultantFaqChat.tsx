/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { _t } from "../../../../languageHandler";
import { useConsultantFaqs } from "./api/useConsultantFaqs";
import { type ConsultantFaqCategory } from "./api/types";
import {
    FAQ_FALLBACK_ANSWER,
    FAQ_FREE_TEXT_REPLY,
    FAQ_HEADER_SUBTITLE,
    FAQ_HEADER_TITLE,
    FAQ_WELCOME,
} from "./consultantFaqData";
import {
    findFaqCategory,
    findFaqOption,
    findFaqQuestion,
    findRootFaqQuestion,
    type FaqHistoryStep,
    type FaqUiOption,
} from "./faqNavigation";

type ChatItem =
    | { key: string; kind: "text"; role: "bot" | "user"; text: string }
    | { key: string; kind: "options"; options: FaqUiOption[]; active: boolean };

function deactivateOptions(items: ChatItem[]): ChatItem[] {
    return items.map((item) => (item.kind === "options" ? { ...item, active: false } : item));
}

function categoryUiOptions(categories: ConsultantFaqCategory[]): FaqUiOption[] {
    return categories.map((c) => ({ kind: "category", id: c.id, label: c.title }));
}

function questionUiOptions(category: ConsultantFaqCategory, questionId: number): FaqUiOption[] {
    const question = findFaqQuestion(category, questionId);
    if (!question) return [];
    return question.options.map((o) => ({
        kind: "answer_option",
        id: o.id,
        label: o.title,
        categoryId: category.id,
    }));
}

/**
 * Append the next bot turn after selecting a category:
 * nested children → list them; otherwise show the root question + options.
 */
function appendAfterCategory(
    category: ConsultantFaqCategory,
    prev: ChatItem[],
    nextKey: (prefix: string) => string,
): ChatItem[] {
    const children = category.children ?? [];
    if (children.length > 0) {
        return [
            ...prev,
            {
                key: nextKey("opts"),
                kind: "options",
                options: categoryUiOptions(children),
                active: true,
            },
        ];
    }

    const root = findRootFaqQuestion(category);
    if (!root) {
        return [...prev, { key: nextKey("ans"), kind: "text", role: "bot", text: FAQ_FALLBACK_ANSWER }];
    }

    return [
        ...prev,
        { key: nextKey("q"), kind: "text", role: "bot", text: root.title },
        {
            key: nextKey("opts"),
            kind: "options",
            options: questionUiOptions(category, root.id),
            active: true,
        },
    ];
}

/**
 * Append the next bot turn after selecting a question option
 * (`next_question` → follow-up question, else `answer.content`).
 */
function appendAfterOption(
    category: ConsultantFaqCategory,
    optionId: number,
    prev: ChatItem[],
    nextKey: (prefix: string) => string,
): ChatItem[] {
    const found = findFaqOption(category, optionId);
    if (!found) {
        return [...prev, { key: nextKey("ans"), kind: "text", role: "bot", text: FAQ_FALLBACK_ANSWER }];
    }

    const { option } = found;
    if (option.next_question != null) {
        const nextQ = findFaqQuestion(category, option.next_question);
        if (!nextQ) {
            return [...prev, { key: nextKey("ans"), kind: "text", role: "bot", text: FAQ_FALLBACK_ANSWER }];
        }
        return [
            ...prev,
            { key: nextKey("q"), kind: "text", role: "bot", text: nextQ.title },
            {
                key: nextKey("opts"),
                kind: "options",
                options: questionUiOptions(category, nextQ.id),
                active: true,
            },
        ];
    }

    const content = option.answer?.content?.trim() || FAQ_FALLBACK_ANSWER;
    return [...prev, { key: nextKey("ans"), kind: "text", role: "bot", text: content }];
}

function rebuildFromHistory(
    categories: ConsultantFaqCategory[],
    history: FaqHistoryStep[],
    nextKey: (prefix: string) => string,
): ChatItem[] {
    let items: ChatItem[] = [
        { key: "welcome", kind: "text", role: "bot", text: FAQ_WELCOME },
        {
            key: "main-options",
            kind: "options",
            options: categoryUiOptions(categories),
            active: history.length === 0,
        },
    ];

    for (const step of history) {
        items = deactivateOptions(items);
        if (step.kind === "category") {
            const category = findFaqCategory(categories, step.categoryId);
            if (!category) continue;
            items = [
                ...items,
                { key: nextKey("user"), kind: "text", role: "user", text: category.title },
            ];
            items = appendAfterCategory(category, items, nextKey);
            continue;
        }

        const category = findFaqCategory(categories, step.categoryId);
        if (!category) continue;
        const found = findFaqOption(category, step.optionId);
        const label = found?.option.title ?? String(step.optionId);
        items = [...items, { key: nextKey("user"), kind: "text", role: "user", text: label }];
        items = appendAfterOption(category, step.optionId, items, nextKey);
    }

    return items;
}

/**
 * Interactive FAQ chat for the agriculture banking consultant.
 * Content is loaded from GET `/_synapse/client/bots/faqs`.
 */
export const ConsultantFaqChat: React.FC = () => {
    const { categories, isLoading, error } = useConsultantFaqs();
    const [items, setItems] = useState<ChatItem[]>([]);
    const [history, setHistory] = useState<FaqHistoryStep[]>([]);
    const [draft, setDraft] = useState("");
    const listRef = useRef<HTMLDivElement>(null);
    const inputId = useId();
    const keySeq = useRef(0);

    const nextKey = useCallback((prefix: string): string => {
        keySeq.current += 1;
        return `${prefix}-${keySeq.current}`;
    }, []);

    const hasData = categories.length > 0;

    const welcomeItems = useMemo((): ChatItem[] => {
        if (!hasData) return [];
        return [
            { key: "welcome", kind: "text", role: "bot", text: FAQ_WELCOME },
            {
                key: "main-options",
                kind: "options",
                options: categoryUiOptions(categories),
                active: true,
            },
        ];
    }, [categories, hasData]);

    useEffect(() => {
        if (!hasData) return;
        keySeq.current = 0;
        setHistory([]);
        setDraft("");
        setItems(welcomeItems);
    }, [hasData, welcomeItems]);

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [items]);

    const resetChat = useCallback((): void => {
        keySeq.current = 0;
        setHistory([]);
        setDraft("");
        setItems(welcomeItems);
    }, [welcomeItems]);

    const onSelectOption = useCallback(
        (option: FaqUiOption): void => {
            if (option.kind === "category") {
                const category = findFaqCategory(categories, option.id);
                if (!category) return;
                setHistory((prev) => [...prev, { kind: "category", categoryId: option.id }]);
                setItems((prev) => {
                    const withUser: ChatItem[] = [
                        ...deactivateOptions(prev),
                        { key: nextKey("user"), kind: "text", role: "user", text: option.label },
                    ];
                    return appendAfterCategory(category, withUser, nextKey);
                });
                return;
            }

            const category = findFaqCategory(categories, option.categoryId);
            if (!category) return;
            setHistory((prev) => [
                ...prev,
                { kind: "option", categoryId: option.categoryId, optionId: option.id },
            ]);
            setItems((prev) => {
                const withUser: ChatItem[] = [
                    ...deactivateOptions(prev),
                    { key: nextKey("user"), kind: "text", role: "user", text: option.label },
                ];
                return appendAfterOption(category, option.id, withUser, nextKey);
            });
        },
        [categories, nextKey],
    );

    const goBack = useCallback((): void => {
        if (history.length === 0) {
            resetChat();
            return;
        }
        const nextHistory = history.slice(0, -1);
        keySeq.current = 0;
        setHistory(nextHistory);
        setItems(rebuildFromHistory(categories, nextHistory, nextKey));
    }, [categories, history, nextKey, resetChat]);

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

    if (isLoading) {
        return (
            <div className="mx_ConsultantFaqChat mx_ConsultantFaqChat--status">
                <p>{_t("common|loading")}</p>
            </div>
        );
    }

    if (error || !hasData) {
        return (
            <div className="mx_ConsultantFaqChat mx_ConsultantFaqChat--status">
                <p>{_t("custom_panels|consultant_faq_load_error")}</p>
            </div>
        );
    }

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
                                        key={`${opt.kind}-${opt.id}`}
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
