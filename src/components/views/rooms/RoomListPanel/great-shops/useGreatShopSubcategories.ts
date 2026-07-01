/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../../../MatrixClientPeg";
import { cachedFetch, peekCache } from "./cache";

/**
 * Shape of a single subcategory entry returned by the Synapse forms endpoint.
 * Aligned to `GET /_synapse/client/forms/categories/{category_id}/subcategories`.
 */
export interface GreatShopSubcategory {
    id: number;
    name: string;
    slug: string | null;
    description: string;
    order: number;
    image: string | null;
}

interface State {
    subcategories: GreatShopSubcategory[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * Fetches subcategories for a given category from the Synapse client API.
 * Re-fetches whenever `categoryId` changes; returns empty state when null.
 */
export function useGreatShopSubcategories(categoryId: string | null): State {
    const cli = MatrixClientPeg.safeGet();
    const baseUrl = cli.getHomeserverUrl();
    const url = categoryId
        ? `${baseUrl}/_synapse/client/forms/categories/${encodeURIComponent(categoryId)}/subcategories`
        : null;

    const [state, setState] = useState<State>(() => {
        if (!url) return { subcategories: [], isLoading: false, error: null };
        const cached = peekCache<GreatShopSubcategory[]>(url);
        return cached
            ? { subcategories: cached, isLoading: false, error: null }
            : { subcategories: [], isLoading: true, error: null };
    });

    useEffect(() => {
        if (!url) {
            setState({ subcategories: [], isLoading: false, error: null });
            return;
        }

        const cached = peekCache<GreatShopSubcategory[]>(url);
        if (cached) {
            setState({ subcategories: cached, isLoading: false, error: null });
            return;
        }

        let cancelled = false;
        setState((s) => ({ ...s, isLoading: true, error: null }));
        const token = cli.getAccessToken();

        cachedFetch<GreatShopSubcategory[]>(url, async () => {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return Array.isArray(json) ? json : (json?.subcategories ?? []);
        })
            .then((list) => {
                if (!cancelled) setState({ subcategories: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load great shop subcategories", e);
                if (!cancelled) setState({ subcategories: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url, cli]);

    return state;
}
