/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { MatrixClientPeg } from "../MatrixClientPeg";

export type CitiesApiSource = "forms" | "bots";

function authHeaders(): HeadersInit {
    const token = MatrixClientPeg.safeGet().getAccessToken();
    return { Authorization: `Bearer ${token}` };
}

function homeserverBase(): string {
    return MatrixClientPeg.safeGet().getHomeserverUrl().replace(/\/$/, "");
}

function citiesUrl(source: CitiesApiSource, province: string): string {
    const base = homeserverBase();
    const q = `province=${encodeURIComponent(province)}`;
    if (source === "bots") {
        return `${base}/_synapse/client/bots/cities?${q}`;
    }
    return `${base}/_synapse/client/forms/locations/cities?${q}`;
}

function extractCityNames(json: unknown): string[] {
    if (Array.isArray(json)) {
        return json
            .map((item) => {
                if (typeof item === "string") return item;
                if (item && typeof item === "object") {
                    const rec = item as Record<string, unknown>;
                    const name = rec.name ?? rec.title ?? rec.city ?? rec.value;
                    return typeof name === "string" ? name : null;
                }
                return null;
            })
            .filter((n): n is string => !!n);
    }
    if (json && typeof json === "object") {
        const rec = json as Record<string, unknown>;
        for (const key of ["cities", "items", "results", "data"]) {
            if (Array.isArray(rec[key])) return extractCityNames(rec[key]);
        }
    }
    return [];
}

/**
 * Fetch city/county names for a province.
 * - forms: `GET /_synapse/client/forms/locations/cities?province=<نام استان>`
 * - bots:  `GET /_synapse/client/bots/cities?province=<province>`
 *
 * Provinces themselves come from the form/bot field `options` on the server
 * (not a separate client-side list).
 */
export async function fetchCities(province: string, source: CitiesApiSource = "forms"): Promise<string[]> {
    const trimmed = province.trim();
    if (!trimmed) return [];

    const res = await fetch(citiesUrl(source, trimmed), { headers: authHeaders() });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    return extractCityNames(json);
}

/** True when the field title looks like a province selector (not city/county). */
export function isProvinceFieldTitle(title: string): boolean {
    const t = title.trim();
    if (!t) return false;
    if (t.includes("شهرستان")) return false;
    return t.includes("استان");
}

/** True when the field title looks like a city / county selector. */
export function isCityFieldTitle(title: string): boolean {
    const t = title.trim();
    if (!t) return false;
    if (t.includes("استان") && !t.includes("شهر")) return false;
    return t.includes("شهرستان") || t.includes("شهر");
}
