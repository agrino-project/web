/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { bazaarAuthHeader, bazaarBaseUrl } from "../../../bazaar/api/config";
import { cachedFetch, peekCache } from "../../../bazaar/api/cache";
import { type ConsultantFaqCategory } from "./types";

interface State {
    categories: ConsultantFaqCategory[];
    isLoading: boolean;
    error: Error | null;
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.order - b.order);
}

/** Normalize / sort a category tree so UI navigation is stable. */
export function normalizeFaqCategories(raw: ConsultantFaqCategory[]): ConsultantFaqCategory[] {
    return sortByOrder(raw).map((cat) => ({
        ...cat,
        children: normalizeFaqCategories(cat.children ?? []),
        questions: sortByOrder(cat.questions ?? []).map((q) => ({
            ...q,
            options: sortByOrder(q.options ?? []),
        })),
    }));
}

/**
 * GET {{base_url}}/faqs — consultant FAQ tree (categories → questions → options).
 * Same bots base URL + Bearer auth as bazaar endpoints.
 */
export function useConsultantFaqs(): State {
    const url = `${bazaarBaseUrl()}/faqs`;

    const [state, setState] = useState<State>(() => {
        const cached = peekCache<ConsultantFaqCategory[]>(url);
        return cached
            ? { categories: cached, isLoading: false, error: null }
            : { categories: [], isLoading: true, error: null };
    });

    useEffect(() => {
        if (peekCache<ConsultantFaqCategory[]>(url)) return;

        let cancelled = false;

        cachedFetch<ConsultantFaqCategory[]>(url, async () => {
            const res = await fetch(url, { headers: bazaarAuthHeader() });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ""}`);
            }
            const json = await res.json();
            const list: ConsultantFaqCategory[] = Array.isArray(json) ? json : (json?.faqs ?? []);
            return normalizeFaqCategories(list);
        })
            .then((list) => {
                if (!cancelled) setState({ categories: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load consultant FAQs", e);
                if (!cancelled) setState({ categories: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return state;
}
