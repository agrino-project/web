/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { cachedFetch, peekCache } from "./cache";
import { bazaarAuthHeader, bazaarBaseUrl } from "./config";

export interface BazaarOption {
    id: number;
    question: number;
    value: string;
    order: number;
    is_active: boolean;
}

/**
 * A single "initial question" returned by the subcategories endpoint. The
 * bazaar UI treats the options of the first `choice` question as the
 * subcategory list shown in the sidebar. Remaining questions come from the
 * next endpoint after the user picks an option.
 */
export interface BazaarQuestion {
    id: number;
    category: number;
    field_name: string;
    field_type: "choice" | "text" | "number" | "date" | "boolean" | string;
    is_required: boolean;
    order: number;
    min_value: number | null;
    max_value: number | null;
    date_min: string | null;
    date_max: string | null;
    depends_on: number | null;
    allow_multiple: boolean;
    is_active: boolean;
    validation_message: string;
    format_hint: string;
    options: BazaarOption[];
}

interface State {
    questions: BazaarQuestion[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * GET {{base_url}}/categories/{categoryId}/subcategories — the initial
 * questions for a category. Fetched only when `categoryId` is non-null;
 * results are cached per category.
 */
export function useBazaarSubcategories(categoryId: number | null): State {
    const url =
        categoryId != null ? `${bazaarBaseUrl()}/categories/${categoryId}/subcategories` : null;

    const [state, setState] = useState<State>(() => {
        if (!url) return { questions: [], isLoading: false, error: null };
        const cached = peekCache<BazaarQuestion[]>(url);
        return cached
            ? { questions: cached, isLoading: false, error: null }
            : { questions: [], isLoading: true, error: null };
    });

    useEffect(() => {
        if (!url) {
            setState({ questions: [], isLoading: false, error: null });
            return;
        }

        const cached = peekCache<BazaarQuestion[]>(url);
        if (cached) {
            setState({ questions: cached, isLoading: false, error: null });
            return;
        }

        let cancelled = false;
        setState((s) => ({ ...s, isLoading: true, error: null }));

        cachedFetch<BazaarQuestion[]>(url, async () => {
            const res = await fetch(url, { headers: bazaarAuthHeader() });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const list: BazaarQuestion[] = Array.isArray(json) ? json : (json?.questions ?? []);
            // Defensive sort in case the server ever ships questions out of order.
            return [...list].sort((a, b) => a.order - b.order);
        })
            .then((list) => {
                if (!cancelled) setState({ questions: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load bazaar subcategories", e);
                if (!cancelled) setState({ questions: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return state;
}
