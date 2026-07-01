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
 * Shape of a single shop category returned by the Synapse forms endpoint.
 * Aligned to the JSON returned by `GET /_synapse/client/forms/categories`.
 */
export interface GreatShopCategory {
    id: number;
    name: string;
    slug: string | null;
    description: string;
    order: number;
    image: string | null;
}

interface State {
    categories: GreatShopCategory[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * Fetches the list of "Great Shops" categories from the Synapse client API.
 * Auth is taken from the current Matrix client (Bearer access token).
 */
export function useGreatShopsCategories(): State {
    const cli = MatrixClientPeg.safeGet();
    const baseUrl = cli.getHomeserverUrl();
    const url = `${baseUrl}/_synapse/client/forms/categories`;

    const [state, setState] = useState<State>(() => {
        const cached = peekCache<GreatShopCategory[]>(url);
        return cached
            ? { categories: cached, isLoading: false, error: null }
            : { categories: [], isLoading: true, error: null };
    });

    useEffect(() => {
        if (peekCache<GreatShopCategory[]>(url)) return;
        let cancelled = false;
        const token = cli.getAccessToken();

        cachedFetch<GreatShopCategory[]>(url, async () => {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return Array.isArray(json) ? json : (json?.categories ?? []);
        })
            .then((list) => {
                if (!cancelled) setState({ categories: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load great shops categories", e);
                if (!cancelled) setState({ categories: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url, cli]);

    return state;
}
