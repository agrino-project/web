/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { bazaarAuthHeader, bazaarBaseUrl } from "./config";
import { invalidateBazaarCache } from "./cache";

/**
 * DELETE {{base_url}}/my-ads?ad_id={adId} — delete an ad owned by the current user.
 * On success, wipes the cache so the my-ads list updates.
 */
export async function deleteBazaarAd(adId: number): Promise<{ ok: true } | { ok: false; error: Error }> {
    try {
        const res = await fetch(`${bazaarBaseUrl()}/my-ads?ad_id=${adId}`, {
            method: "DELETE",
            headers: { ...bazaarAuthHeader() },
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
