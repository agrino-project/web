/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { cachedFetch, peekCache } from "./cache";
import { bazaarAuthHeader, bazaarBaseUrl } from "./config";
import { type BazaarAd } from "./useBazaarAds";

interface State {
    purchases: BazaarAd[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * GET {baseUrl}/sells — every ad the current user has bought. Response shape
 * mirrors `/my-ads`, so we reuse the `BazaarAd` type. `refreshKey` bumps
 * force a refetch after `buyBazaarAd` clears the cache.
 */
export function useMyBazaarPurchases(enabled: boolean, refreshKey: number = 0): State {
    const url = enabled ? `${bazaarBaseUrl()}/sells` : null;

    const [state, setState] = useState<State>(() => {
        if (!url) return { purchases: [], isLoading: false, error: null };
        const cached = peekCache<BazaarAd[]>(url);
        return cached
            ? { purchases: cached, isLoading: false, error: null }
            : { purchases: [], isLoading: true, error: null };
    });

    useEffect(() => {
        if (!url) {
            setState({ purchases: [], isLoading: false, error: null });
            return;
        }

        const cached = peekCache<BazaarAd[]>(url);
        if (cached) {
            setState({ purchases: cached, isLoading: false, error: null });
            return;
        }

        let cancelled = false;
        setState((s) => ({ ...s, isLoading: true, error: null }));

        cachedFetch<BazaarAd[]>(url, async () => {
            const res = await fetch(url, { headers: bazaarAuthHeader() });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return Array.isArray(json) ? json : (json?.sells ?? json?.purchases ?? []);
        })
            .then((list) => {
                if (!cancelled) setState({ purchases: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load bazaar purchases", e);
                if (!cancelled) setState({ purchases: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url, refreshKey]);

    return state;
}
