/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../../MatrixClientPeg";
import { cachedFetch, peekCache } from "./cache";
import { bazaarAuthHeader, bazaarBaseUrl } from "./config";
import { type BazaarAd } from "./useBazaarAds";

interface State {
    ads: BazaarAd[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * GET {{base_url}}/my-ads?user_id={userId} — every ad the current user has
 * posted (regardless of category / buyer status). Fetched lazily; caller
 * passes `enabled=false` when the panel isn't visible to skip the request.
 */
export function useMyBazaarAds(enabled: boolean, refreshKey: number = 0): State {
    const userId = MatrixClientPeg.safeGet().getSafeUserId();
    const url = enabled ? `${bazaarBaseUrl()}/my-ads?user_id=${encodeURIComponent(userId)}` : null;

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
                logger.warn("Failed to load my bazaar ads", e);
                if (!cancelled) setState({ ads: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url, refreshKey]);

    return state;
}
