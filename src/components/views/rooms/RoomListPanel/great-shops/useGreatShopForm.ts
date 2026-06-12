/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../../../MatrixClientPeg";
import { type FormStructure } from "./formTypes";

interface State {
    form: FormStructure | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Fetches the auto-generated stepper / form structure for a subcategory from
 * the Synapse client API:
 *   GET /_synapse/client/forms/subcategories/{subcategoryId}/form
 *
 * Response shape is not yet typed — currently kept as `unknown` until we see
 * a real payload from the backend.
 */
export function useGreatShopForm(subcategoryId: string | null): State {
    const [state, setState] = useState<State>({ form: null, isLoading: false, error: null });

    useEffect(() => {
        if (!subcategoryId) {
            setState({ form: null, isLoading: false, error: null });
            return;
        }

        let cancelled = false;
        setState({ form: null, isLoading: true, error: null });

        const cli = MatrixClientPeg.safeGet();
        const baseUrl = cli.getHomeserverUrl();
        const token = cli.getAccessToken();

        (async () => {
            try {
                const res = await fetch(
                    `${baseUrl}/_synapse/client/forms/subcategories/${encodeURIComponent(subcategoryId)}/form`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                // eslint-disable-next-line no-console
                console.log("[GreatShops] form structure for", subcategoryId, json);
                if (!cancelled) setState({ form: json, isLoading: false, error: null });
            } catch (e) {
                logger.warn("Failed to load great shop form structure", e);
                if (!cancelled) setState({ form: null, isLoading: false, error: e as Error });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [subcategoryId]);

    return state;
}
