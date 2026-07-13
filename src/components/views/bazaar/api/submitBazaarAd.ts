/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { MatrixClientPeg } from "../../../../MatrixClientPeg";

import { bazaarApiUserId, resolveAdApiFieldKey } from "./adPayload";
import { bazaarAuthHeader, bazaarBaseUrl } from "./config";
import { invalidateBazaarCache } from "./cache";
import { type BazaarQuestion } from "./useBazaarSubcategories";

/**
 * Resolve a single question's answer into the value shape the server wants.
 * Choice fields store option IDs in `formData`, but the backend expects the
 * option's display `value`. Amount/price stay strings to match the ads API.
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

    if (q.field_type === "boolean") {
        return raw === "true";
    }

    // Ads API samples send amount/price as strings.
    return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * POST {{base_url}}/categories/{categoryId}/ads — create a new ad.
 * Body uses only English keys from the ads API contract.
 */
export async function submitBazaarAd(
    categoryId: number,
    questions: BazaarQuestion[],
    answers: Record<string, string | string[]>,
    options?: { imageDataUrl?: string | null; productType?: string | null },
): Promise<{ ok: true } | { ok: false; error: Error }> {
    try {
        const cli = MatrixClientPeg.safeGet();
        const body: Record<string, unknown> = {
            user_id: bazaarApiUserId(cli.getSafeUserId()),
            category: categoryId,
        };

        for (const q of questions) {
            const apiKey = resolveAdApiFieldKey(q);
            if (!apiKey) continue;
            // product_type comes from the sidebar selection below.
            if (apiKey === "product_type") continue;
            const value = resolveAnswer(q, answers[String(q.id)]);
            if (value === undefined) continue;
            body[apiKey] = Array.isArray(value) ? value.join(", ") : value;
        }

        if (options?.productType) {
            body.product_type = options.productType;
        }

        if (options?.imageDataUrl) {
            body.image = options.imageDataUrl;
        }

        const res = await fetch(`${bazaarBaseUrl()}/categories/${categoryId}/ads`, {
            method: "POST",
            headers: { ...bazaarAuthHeader(), "Content-Type": "application/json" },
            body: JSON.stringify(body),
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
