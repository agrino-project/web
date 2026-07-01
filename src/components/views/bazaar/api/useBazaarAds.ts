/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { cachedFetch, peekCache } from "./cache";
import { bazaarAuthHeader, bazaarBaseUrl } from "./config";

export interface BazaarAd {
    id: number;
    user_id: string;
    buyer_id: string | null;
    category: number;
    product_type: string;
    province: string;
    city: string;
    unit: string;
    amount: string;
    price: string;
    contact_name: string;
    contact_phone: string;
}

interface State {
    ads: BazaarAd[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * GET {{base_url}}/categories/{categoryId}/ads — active ads within a category.
 * Callers filter client-side by product_type / location / price range.
 */
export function useBazaarAds(categoryId: number | null): State {
    const url = categoryId != null ? `${bazaarBaseUrl()}/categories/${categoryId}/ads` : null;

    const [state, setState] = useState<State>(() => {
        if (!url) return { ads: [], isLoading: false, error: null };
        const cached = peekCache<BazaarAd[]>(url);
        return cached
            ? { ads: cached, isLoading: false, error: null }
            : { ads: [], isLoading: true, error: null };
    });

    useEffect(() => {
        if (!url) {
            setState({ ads: [], isLoading: false, error: null });
            return;
        }

        const cached = peekCache<BazaarAd[]>(url);
        if (cached) {
            setState({ ads: cached, isLoading: false, error: null });
            return;
        }

        let cancelled = false;
        setState((s) => ({ ...s, isLoading: true, error: null }));

        cachedFetch<BazaarAd[]>(url, async () => {
            const res = await fetch(url, { headers: bazaarAuthHeader() });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return Array.isArray(json) ? json : (json?.ads ?? []);
        })
            .then((list) => {
                if (!cancelled) setState({ ads: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load bazaar ads", e);
                if (!cancelled) setState({ ads: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return state;
}
