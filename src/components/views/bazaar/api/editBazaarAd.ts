/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { bazaarAuthHeader, bazaarBaseUrl } from "./config";
import { invalidateBazaarCache } from "./cache";

/**
 * PATCH {{base_url}}/my-ads?ad_id={adId} — update fields of an ad owned by
 * the current user. Only the fields present in `updates` are changed.
 * On success, wipes the cache so the ads list reflects the new values.
 */
export async function editBazaarAd(
    adId: number,
    updates: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: Error }> {
    try {
        const res = await fetch(`${bazaarBaseUrl()}/my-ads?ad_id=${adId}`, {
            method: "PATCH",
            headers: { ...bazaarAuthHeader(), "Content-Type": "application/json" },
            body: JSON.stringify(updates),
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
