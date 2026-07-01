/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

// In-memory session cache for Bazaar (AdvertiseBot) read endpoints.
// Mirrors the great-shops cache: URL → data, with in-flight de-dupe and
// no persistence across reloads.

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

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

export function peekCache<T>(url: string): T | undefined {
    return cache.has(url) ? (cache.get(url) as T) : undefined;
}

export function invalidateBazaarCache(): void {
    cache.clear();
    inflight.clear();
}
