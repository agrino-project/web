/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { MatrixClientPeg } from "../../../../MatrixClientPeg";

import { bazaarAuthHeader, bazaarBaseUrl } from "./config";
import { invalidateBazaarCache } from "./cache";

/**
 * PATCH {{base_url}}/ads/{adId}/buy — mark an ad as purchased by the current
 * user. On success, wipes the cache so the ads list drops this ad and the
 * "my purchases" list picks it up on next read.
 */
export async function buyBazaarAd(adId: number): Promise<{ ok: true } | { ok: false; error: Error }> {
    try {
        const userId = MatrixClientPeg.safeGet().getSafeUserId();
        const res = await fetch(`${bazaarBaseUrl()}/ads/${adId}/buy`, {
            method: "PATCH",
            headers: { ...bazaarAuthHeader(), "Content-Type": "application/json" },
            body: JSON.stringify({ buyer_id: userId }),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            return { ok: false, error: new Error(`HTTP ${res.status}: ${text}`) };
        }

        invalidateBazaarCache();
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e as Error };
    }
}
