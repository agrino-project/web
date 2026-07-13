/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import {
    type ConsultantFaqCategory,
    type ConsultantFaqOption,
    type ConsultantFaqQuestion,
} from "./api/types";

/** Find a category (including nested `children`) by id. */
export function findFaqCategory(
    categories: ConsultantFaqCategory[],
    categoryId: number,
): ConsultantFaqCategory | null {
    for (const cat of categories) {
        if (cat.id === categoryId) return cat;
        const nested = findFaqCategory(cat.children ?? [], categoryId);
        if (nested) return nested;
    }
    return null;
}

export function findFaqQuestion(
    category: ConsultantFaqCategory,
    questionId: number,
): ConsultantFaqQuestion | null {
    return category.questions.find((q) => q.id === questionId) ?? null;
}

/**
 * Entry question for a category: not targeted by any option's `next_question`.
 * Falls back to the first question by `order`.
 */
export function findRootFaqQuestion(category: ConsultantFaqCategory): ConsultantFaqQuestion | null {
    const questions = category.questions ?? [];
    if (questions.length === 0) return null;

    const referenced = new Set<number>();
    for (const q of questions) {
        for (const opt of q.options ?? []) {
            if (opt.next_question != null) referenced.add(opt.next_question);
        }
    }

    const roots = questions.filter((q) => !referenced.has(q.id));
    return roots[0] ?? questions[0] ?? null;
}

export function findFaqOption(
    category: ConsultantFaqCategory,
    optionId: number,
): { question: ConsultantFaqQuestion; option: ConsultantFaqOption } | null {
    for (const question of category.questions ?? []) {
        const option = question.options.find((o) => o.id === optionId);
        if (option) return { question, option };
    }
    return null;
}

/** Chat option button model (ids stay numeric from the API). */
export type FaqUiOption =
    | { kind: "category"; id: number; label: string }
    | { kind: "answer_option"; id: number; label: string; categoryId: number };

export type FaqHistoryStep =
    | { kind: "category"; categoryId: number }
    | { kind: "option"; categoryId: number; optionId: number };
