/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { cachedFetch, peekCache } from "./cache";
import { bazaarAuthHeader, bazaarBaseUrl } from "./config";
import { type BazaarQuestion } from "./useBazaarSubcategories";

interface State {
    questions: BazaarQuestion[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * GET {{base_url}}/categories/{categoryId}/questions — the remaining form
 * questions for a category, shown once the user has picked a subcategory.
 * Shape matches the subcategories endpoint (same BazaarQuestion type) but
 * covers unit / quantity / price / conditional fields etc.
 */
export function useBazaarQuestions(categoryId: number | null): State {
    const url = categoryId != null ? `${bazaarBaseUrl()}/categories/${categoryId}/questions` : null;

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
            return [...list].sort((a, b) => a.order - b.order);
        })
            .then((list) => {
                if (!cancelled) setState({ questions: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load bazaar questions", e);
                if (!cancelled) setState({ questions: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return state;
}
