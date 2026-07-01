/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { cachedFetch, peekCache } from "./cache";
import { bazaarAuthHeader, bazaarBaseUrl } from "./config";

export interface BazaarCategory {
    id: number;
    bot: number;
    name: string;
    order: number;
    is_active: boolean;
}

interface State {
    categories: BazaarCategory[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * GET {{base_url}}/categories — top-level Bazaar categories.
 * Results are cached in-memory for the session and de-duped for concurrent calls.
 */
export function useBazaarCategories(): State {
    const url = `${bazaarBaseUrl()}/categories`;

    const [state, setState] = useState<State>(() => {
        const cached = peekCache<BazaarCategory[]>(url);
        return cached
            ? { categories: cached, isLoading: false, error: null }
            : { categories: [], isLoading: true, error: null };
    });

    useEffect(() => {
        if (peekCache<BazaarCategory[]>(url)) return;

        let cancelled = false;

        cachedFetch<BazaarCategory[]>(url, async () => {
            const res = await fetch(url, { headers: bazaarAuthHeader() });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const list: BazaarCategory[] = Array.isArray(json) ? json : (json?.categories ?? []);
            // Server may already order, but sort defensively so UI is stable.
            return [...list].sort((a, b) => a.order - b.order);
        })
            .then((list) => {
                if (!cancelled) setState({ categories: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load bazaar categories", e);
                if (!cancelled) setState({ categories: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return state;
}
