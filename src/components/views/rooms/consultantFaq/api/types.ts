/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

/** Answer payload attached to a leaf FAQ option (`GET /faqs`). */
export interface ConsultantFaqAnswer {
    id: number;
    title: string;
    content: string;
}

/** Option under a question. Either `next_question` or `answer` is set. */
export interface ConsultantFaqOption {
    id: number;
    title: string;
    next_question: number | null;
    answer: ConsultantFaqAnswer | null;
    order: number;
}

export interface ConsultantFaqQuestion {
    id: number;
    title: string;
    order: number;
    options: ConsultantFaqOption[];
}

/**
 * Top-level (or nested) FAQ category from `GET /_synapse/client/bots/faqs`.
 * `children` may hold nested categories; when empty, navigate via `questions`.
 */
export interface ConsultantFaqCategory {
    id: number;
    title: string;
    order: number;
    questions: ConsultantFaqQuestion[];
    children: ConsultantFaqCategory[];
}
