/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { useCallback, useEffect, useState } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../../../MatrixClientPeg";

/**
 * Status values returned by `GET /_synapse/client/forms/history`.
 * The API currently emits these Persian labels as the raw `status` string.
 */
export type GreatShopHistoryStatus =
    | "تکمیل شده توسط کاربر"
    | "لغو شده توسط کاربر"
    | "تایید ادمین"
    | "رد شده توسط ادمین"
    | "نیاز به پیگیری توسط ادمین"
    | string;

export interface GreatShopHistoryItem {
    id: string;
    status: GreatShopHistoryStatus;
    /** Epoch ms used for sorting / time-grouping. */
    createdAt: number;
    title: string;
    image: string | null;
    categoryId: string | null;
    subcategoryId: string | null;
}

interface State {
    items: GreatShopHistoryItem[];
    isLoading: boolean;
    error: Error | null;
    refresh: () => void;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function pickString(...candidates: unknown[]): string | null {
    for (const c of candidates) {
        if (typeof c === "string" && c.trim()) return c.trim();
        if (typeof c === "number" && Number.isFinite(c)) return String(c);
    }
    return null;
}

function pickTimestamp(...candidates: unknown[]): number | null {
    for (const c of candidates) {
        if (typeof c === "number" && Number.isFinite(c)) {
            // Accept both seconds and milliseconds.
            return c < 1e12 ? c * 1000 : c;
        }
        if (typeof c === "string" && c.trim()) {
            const asNum = Number(c);
            if (Number.isFinite(asNum) && asNum > 0) {
                return asNum < 1e12 ? asNum * 1000 : asNum;
            }
            const parsed = Date.parse(c);
            if (!Number.isNaN(parsed)) return parsed;
        }
    }
    return null;
}

function nestedName(obj: unknown): string | null {
    const rec = asRecord(obj);
    if (!rec) return null;
    return pickString(rec.name, rec.title, rec.label);
}

function nestedImage(obj: unknown): string | null {
    const rec = asRecord(obj);
    if (!rec) return null;
    return pickString(rec.image, rec.icon, rec.logo);
}

function nestedId(obj: unknown): string | null {
    const rec = asRecord(obj);
    if (!rec) return null;
    return pickString(rec.id, rec.slug);
}

/**
 * Normalise a single history row from whatever shape the backend returns.
 * The forms history endpoint is still settling, so we accept several aliases.
 */
export function normalizeHistoryItem(raw: unknown, index: number): GreatShopHistoryItem | null {
    const rec = asRecord(raw);
    if (!rec) return null;

    const subcategory = rec.subcategory ?? rec.sub_category ?? rec.form;
    const category = rec.category;

    const title =
        pickString(
            rec.title,
            rec.name,
            rec.subcategory_name,
            rec.sub_category_name,
            nestedName(subcategory),
            nestedName(category),
        ) ?? `درخواست ${index + 1}`;

    const createdAt =
        pickTimestamp(
            rec.created_at,
            rec.createdAt,
            rec.submitted_at,
            rec.submittedAt,
            rec.updated_at,
            rec.updatedAt,
            rec.timestamp,
            rec.ts,
        ) ?? Date.now();

    const status = pickString(rec.status, rec.state) ?? "";

    const id =
        pickString(rec.id, rec.submission_id, rec.submissionId) ?? `history-${index}-${createdAt}`;

    return {
        id,
        status,
        createdAt,
        title,
        image:
            pickString(rec.image, rec.icon, nestedImage(subcategory), nestedImage(category)) ?? null,
        categoryId: pickString(rec.category_id, rec.categoryId, nestedId(category)),
        subcategoryId: pickString(
            rec.subcategory_id,
            rec.sub_category_id,
            rec.subcategoryId,
            nestedId(subcategory),
        ),
    };
}

function extractList(json: unknown): unknown[] {
    if (Array.isArray(json)) return json;
    const rec = asRecord(json);
    if (!rec) return [];
    for (const key of ["submissions", "history", "items", "results", "data"]) {
        if (Array.isArray(rec[key])) return rec[key] as unknown[];
    }
    return [];
}

/**
 * Fetches the current user's non-insurance form submission history.
 * Auth is taken from the Matrix client (Bearer access token).
 *
 * History is not session-cached: it changes after every submit and when the
 * admin updates a status, so each open of the History tab refetches.
 */
export function useGreatShopHistory(enabled: boolean, categoryId: string | null = null): State {
    const cli = MatrixClientPeg.safeGet();
    const baseUrl = cli.getHomeserverUrl();
    const url = `${baseUrl}/_synapse/client/forms/history`;

    const [items, setItems] = useState<GreatShopHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback((): void => {
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;
        setIsLoading(true);
        setError(null);
        const token = cli.getAccessToken();

        (async (): Promise<GreatShopHistoryItem[]> => {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return extractList(json)
                .map((row, i) => normalizeHistoryItem(row, i))
                .filter((row): row is GreatShopHistoryItem => row !== null)
                .sort((a, b) => b.createdAt - a.createdAt);
        })()
            .then((list) => {
                if (cancelled) return;
                const filtered =
                    categoryId == null
                        ? list
                        : list.filter(
                              (item) => item.categoryId == null || item.categoryId === String(categoryId),
                          );
                setItems(filtered);
                setIsLoading(false);
                setError(null);
            })
            .catch((e) => {
                logger.warn("Failed to load great shop form history", e);
                if (!cancelled) {
                    setItems([]);
                    setIsLoading(false);
                    setError(e as Error);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [enabled, url, cli, refreshKey, categoryId]);

    return { items, isLoading, error, refresh };
}
