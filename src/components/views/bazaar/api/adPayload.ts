/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { type BazaarQuestion } from "./useBazaarSubcategories";

/**
 * Canonical Create/Update Ad body keys from the bots ads API contract.
 * Never send Persian labels as keys — only these English fields.
 */
export const BAZAAR_AD_API_KEYS = [
    "user_id",
    "province",
    "city",
    "category",
    "product_type",
    "unit",
    "amount",
    "price",
    "contact_name",
    "contact_phone",
    "image",
] as const;

export type BazaarAdApiKey = (typeof BAZAAR_AD_API_KEYS)[number];

/** Fields the UI may PATCH on an existing ad. */
export const BAZAAR_AD_EDITABLE_KEYS = [
    "province",
    "city",
    "product_type",
    "unit",
    "amount",
    "price",
    "contact_name",
    "contact_phone",
    "image",
] as const;

const FIELD_NAME_TO_API_KEY: Record<string, Exclude<BazaarAdApiKey, "user_id" | "category">> = {
    // English
    province: "province",
    city: "city",
    product_type: "product_type",
    product: "product_type",
    unit: "unit",
    amount: "amount",
    quantity: "amount",
    price: "price",
    contact_name: "contact_name",
    contact_phone: "contact_phone",
    phone: "contact_phone",
    image: "image",
    photo: "image",
    // Persian labels sometimes shipped as field_name
    استان: "province",
    شهر: "city",
    محصول: "product_type",
    "نوع محصول": "product_type",
    "نوع کالا": "product_type",
    کالا: "product_type",
    واحد: "unit",
    مقدار: "amount",
    تعداد: "amount",
    حجم: "amount",
    قیمت: "price",
    نام: "contact_name",
    "نام تماس": "contact_name",
    "نام فروشنده": "contact_name",
    تلفن: "contact_phone",
    موبایل: "contact_phone",
    "شماره تماس": "contact_phone",
    "شماره تلفن": "contact_phone",
    تصویر: "image",
    عکس: "image",
};

/**
 * Map a dynamic question to an API payload key, or null if it must not be sent.
 * Only known Create-Ad keys are returned — never invent keys from Persian labels.
 */
export function resolveAdApiFieldKey(q: BazaarQuestion): Exclude<BazaarAdApiKey, "user_id" | "category"> | null {
    const type = (q.field_type || "").toLowerCase();
    if (type === "province") return "province";
    if (type === "city") return "city";
    if (type === "phone") return "contact_phone";
    if (type === "image" || type === "file" || type === "photo") return "image";

    const rawName = (q.field_name || "").trim();
    if (!rawName) return null;

    const byName = FIELD_NAME_TO_API_KEY[rawName] ?? FIELD_NAME_TO_API_KEY[rawName.toLowerCase()];
    if (byName) return byName;

    // Labels often include hints in parentheses, e.g. "قیمت (تومان)" / "محل فعلی محصول (استان)".
    if (rawName.includes("نوع محصول") || rawName.includes("نوع کالا")) return "product_type";
    if (rawName.includes("استان")) return "province";
    if (rawName.includes("شهر")) return "city";
    if (rawName.includes("قیمت")) return "price";
    if (rawName.includes("واحد")) return "unit";
    if (rawName.includes("مقدار") || rawName.includes("تعداد")) return "amount";
    if (rawName.includes("تلفن") || rawName.includes("موبایل") || rawName.includes("شماره تماس")) {
        return "contact_phone";
    }
    if (rawName.includes("نام تماس") || rawName.includes("نام فروشنده")) return "contact_name";
    if (rawName.includes("تصویر") || rawName.includes("عکس")) return "image";

    // Do NOT map every choice field to product_type (e.g. quality grade).
    return null;
}

/** True when this question is the sidebar subcategory picker (not shown on the sell form). */
export function isSidebarProductQuestion(q: BazaarQuestion, allSubQuestions: BazaarQuestion[]): boolean {
    const firstChoice = allSubQuestions.find((item) => item.field_type === "choice");
    return firstChoice != null && firstChoice.id === q.id;
}

/**
 * Create-ad `user_id` in the API collection is a phone-like local id
 * (e.g. "09386339738"), not the full Matrix MXID.
 */
export function bazaarApiUserId(matrixUserId: string): string {
    const local = matrixUserId.split(":")[0]?.replace(/^@/, "") ?? matrixUserId;
    return local.replace(/^u/i, "");
}

/** True when value is a data-URL the ads API accepts as `image`. */
export function isValidAdImageDataUrl(value: string): boolean {
    const normalized = value.replace(/\s/g, "");
    return /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/]+={0,2}$/.test(normalized);
}

/**
 * Keep only editable English keys for PATCH/form bodies.
 * Existing server image URLs are omitted — resending them as `image` causes
 * "invalid base64" from the API. Only fresh data-URL uploads are kept.
 */
export function pickEditableAdFields(
    source: Record<string, unknown>,
    options?: { includeImageUpload?: boolean },
): Record<string, string> {
    const out: Record<string, string> = {};
    for (const key of BAZAAR_AD_EDITABLE_KEYS) {
        const value = source[key];
        if (value == null || value === "") continue;
        const str = String(value);
        if (key === "image") {
            if (!options?.includeImageUpload) continue;
            if (!isValidAdImageDataUrl(str)) continue;
        }
        out[key] = str;
    }
    return out;
}

export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"));
        reader.readAsDataURL(file);
    });
}
