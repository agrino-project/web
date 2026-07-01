/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

// In-memory session cache for Great Shops read endpoints.
// The categories / subcategories / form-structure APIs return admin-managed
// data that changes slowly, so avoiding repeat GETs while the tab is open is
// pure win: no dependency, no persistence, no staleness to worry about across
// reloads.

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Fetch `url` via `fetcher`, memoising the resolved value for the rest of the
 * session. Concurrent callers for the same URL share a single in-flight
 * promise (request de-duplication). Failed requests are not cached so the
 * next attempt actually retries.
 */
export async function cachedFetch<T>(url: string, fetcher: () => Promise<T>): Promise<T> {
    if (cache.has(url)) return cache.get(url) as T;
    const existing = inflight.get(url);
    if (existing) return existing as Promise<T>;

    const promise = fetcher()
        .then((data) => {
            cache.set(url, data);
            return data;
        })
        .finally(() => {
            inflight.delete(url);
        });

    inflight.set(url, promise);
    return promise;
}

/** Synchronous lookup for hooks that want to initialise state without a loading flash. */
export function peekCache<T>(url: string): T | undefined {
    return cache.has(url) ? (cache.get(url) as T) : undefined;
}

/** Wipe the entire cache — call after a submission that could invalidate reads. */
export function invalidateGreatShopCache(): void {
    cache.clear();
    inflight.clear();
}
