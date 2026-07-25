/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../../MatrixClientPeg";
import { type FormStructure } from "../../rooms/RoomListPanel/great-shops/formTypes";
import { cachedFetch, peekCache } from "../../rooms/RoomListPanel/great-shops/cache";

interface State {
    form: FormStructure | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Fetches the insurance form stepper for a subcategory:
 *   GET /_synapse/client/forms/insurance/subcategories/{id}/form
 */
export function useInsuranceForm(subcategoryId: string | null): State {
    const cli = MatrixClientPeg.safeGet();
    const baseUrl = cli.getHomeserverUrl();
    const url = subcategoryId
        ? `${baseUrl}/_synapse/client/forms/insurance/subcategories/${encodeURIComponent(subcategoryId)}/form`
        : null;

    const [state, setState] = useState<State>(() => {
        if (!url) return { form: null, isLoading: false, error: null };
        const cached = peekCache<FormStructure>(url);
        return cached
            ? { form: cached, isLoading: false, error: null }
            : { form: null, isLoading: true, error: null };
    });

    useEffect(() => {
        if (!url) {
            setState({ form: null, isLoading: false, error: null });
            return;
        }

        const cached = peekCache<FormStructure>(url);
        if (cached) {
            setState({ form: cached, isLoading: false, error: null });
            return;
        }

        let cancelled = false;
        setState({ form: null, isLoading: true, error: null });
        const token = cli.getAccessToken();

        cachedFetch<FormStructure>(url, async () => {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
            .then((json) => {
                if (!cancelled) setState({ form: json, isLoading: false, error: null });
            })
            .catch((e) => {
                logger.warn("Failed to load insurance form structure", e);
                if (!cancelled) setState({ form: null, isLoading: false, error: e as Error });
            });

        return () => {
            cancelled = true;
        };
    }, [url, cli]);

    return state;
}
