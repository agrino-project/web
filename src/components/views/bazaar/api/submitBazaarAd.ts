/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { MatrixClientPeg } from "../../../../MatrixClientPeg";

import { bazaarAuthHeader, bazaarBaseUrl } from "./config";
import { invalidateBazaarCache } from "./cache";
import { type BazaarQuestion } from "./useBazaarSubcategories";

/**
 * Resolve a single question's answer into the value shape the server wants.
 * Choice fields store option IDs in `formData`, but the backend expects the
 * option's display `value`. Numeric fields come through as strings and get
 * coerced to real numbers. Multi-choice becomes an array of option values.
 */
function resolveAnswer(q: BazaarQuestion, raw: string | string[] | undefined): unknown {
    if (raw === undefined || raw === "" || (Array.isArray(raw) && raw.length === 0)) return undefined;

    if (q.field_type === "choice") {
        if (q.allow_multiple) {
            const ids = Array.isArray(raw) ? raw : [raw];
            return ids
                .map((id) => q.options.find((o) => String(o.id) === id)?.value)
                .filter((v): v is string => v != null);
        }
        const id = Array.isArray(raw) ? raw[0] : raw;
        return q.options.find((o) => String(o.id) === id)?.value ?? id;
    }

    if (q.field_type === "number" || q.field_type === "integer") {
        const num = Number(raw);
        return Number.isFinite(num) ? num : undefined;
    }

    if (q.field_type === "boolean") {
        return raw === "true";
    }

    return raw;
}

/**
 * POST {{base_url}}/categories/{categoryId}/ads — create a new ad.
 * Body is keyed by each question's `field_name`, plus a `user_id` from the
 * current Matrix session. On success the ads cache is invalidated so the
 * next fetch reflects the new ad.
 */
export async function submitBazaarAd(
    categoryId: number,
    questions: BazaarQuestion[],
    answers: Record<string, string | string[]>,
): Promise<{ ok: true } | { ok: false; error: Error }> {
    try {
        const cli = MatrixClientPeg.safeGet();
        const userId = cli.getSafeUserId();

        const body: Record<string, unknown> = { user_id: userId };
        for (const q of questions) {
            const value = resolveAnswer(q, answers[String(q.id)]);
            if (value === undefined) continue;
            body[q.field_name] = value;
        }

        const res = await fetch(`${bazaarBaseUrl()}/categories/${categoryId}/ads/`, {
            method: "POST",
            headers: { ...bazaarAuthHeader(), "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            return { ok: false, error: new Error(`HTTP ${res.status}: ${text}`) };
        }

        // Reads may have changed for this user — clear cache so buy list &
        // "my ads" refetch on next open.
        invalidateBazaarCache();
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e as Error };
    }
}
