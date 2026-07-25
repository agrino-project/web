/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../../MatrixClientPeg";
import { cachedFetch, peekCache } from "../../rooms/RoomListPanel/great-shops/cache";

/**
 * Shape of a single insurance subcategory from:
 *   GET /_synapse/client/forms/insurance/subcategories
 */
export interface InsuranceSubcategory {
    id: number;
    name: string;
    slug: string | null;
    description: string;
    order: number;
    image: string | null;
}

interface State {
    subcategories: InsuranceSubcategory[];
    isLoading: boolean;
    error: Error | null;
}

/** Keep only entries that are clearly insurance-related (slug / name / description). */
function isInsuranceItem(item: InsuranceSubcategory): boolean {
    const hay = `${item.slug ?? ""} ${item.name} ${item.description}`.toLowerCase();
    return hay.includes("insurance") || hay.includes("بیمه");
}

/**
 * Fetches agricultural-insurance subcategories from the Synapse client API.
 * Filters out any mixed non-insurance entries that may appear in the payload.
 */
export function useInsuranceSubcategories(): State {
    const cli = MatrixClientPeg.safeGet();
    const baseUrl = cli.getHomeserverUrl();
    const url = `${baseUrl}/_synapse/client/forms/insurance/subcategories`;

    const [state, setState] = useState<State>(() => {
        const cached = peekCache<InsuranceSubcategory[]>(url);
        return cached
            ? { subcategories: cached, isLoading: false, error: null }
            : { subcategories: [], isLoading: true, error: null };
    });

    useEffect(() => {
        if (peekCache<InsuranceSubcategory[]>(url)) return;

        let cancelled = false;
        const token = cli.getAccessToken();

        cachedFetch<InsuranceSubcategory[]>(url, async () => {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const list: InsuranceSubcategory[] = Array.isArray(json)
                ? json
                : (json?.subcategories ?? []);
            const insuranceOnly = list.filter(isInsuranceItem);
            // If nothing matched the filter (e.g. API already scoped), keep the full list.
            return insuranceOnly.length > 0 ? insuranceOnly : list;
        })
            .then((list) => {
                if (!cancelled) setState({ subcategories: list, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load insurance subcategories", e);
                if (!cancelled) setState({ subcategories: [], isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url, cli]);

    return state;
}
