/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { type BazaarQuestion } from "./useBazaarSubcategories";

/**
 * Fixed English keys for Create/Update Ad (Postman `Create Ad` body).
 * The backend form sends Persian `field_name` labels; we translate them here
 * before POST/PATCH — never send Persian keys in the JSON body.
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

type AdFormFieldKey = Exclude<BazaarAdApiKey, "user_id" | "category">;

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

/**
 * Exact `field_name` values from the live ads API → English payload key.
 * Only add entries that the backend actually uses (or English aliases).
 */
const EXACT_LABEL_TO_API_KEY: Partial<Record<string, AdFormFieldKey>> = {
    // English (if backend ever sends them)
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
    // Persian — location & product
    استان: "province",
    شهر: "city",
    محصول: "product_type",
    "نوع محصول": "product_type",
    "نوع کالا": "product_type",
    "عنوان محصول": "product_type",
    کالا: "product_type",
    واحد: "unit",
    مقدار: "amount",
    تعداد: "amount",
    حجم: "amount",
    قیمت: "price",
    // Persian — contact (two separate API fields)
    "نام و نام خانوادگی": "contact_name",
    "شماره تماس": "contact_phone",
    // Persian — image
    تصویر: "image",
    عکس: "image",
};

/** `field_type` from the backend is the most reliable mapping signal. */
const FIELD_TYPE_TO_API_KEY: Partial<Record<string, AdFormFieldKey>> = {
    province: "province",
    city: "city",
    phone: "contact_phone",
    name: "contact_name",
    contact_name: "contact_name",
    image: "image",
    file: "image",
    photo: "image",
};

/**
 * Map a dynamic question to an API payload key, or null if it must not be sent.
 *
 * Priority: field_type → exact label → partial label patterns.
 * Returns null for extra form fields that are not in the Create Ad JSON contract
 * (e.g. "درجه کیفی", "وضعیت") — those stay on the form but are not POSTed.
 */
export function resolveAdApiFieldKey(q: BazaarQuestion): AdFormFieldKey | null {
    const type = (q.field_type || "").toLowerCase();
    const byType = FIELD_TYPE_TO_API_KEY[type];
    if (byType) return byType;

    const rawName = (q.field_name || "").trim();
    if (!rawName) return null;

    const byExact = EXACT_LABEL_TO_API_KEY[rawName] ?? EXACT_LABEL_TO_API_KEY[rawName.toLowerCase()];
    if (byExact) return byExact;

    // Labels often include hints in parentheses, e.g. "قیمت (تومان)".
    if (rawName.includes("نوع محصول") || rawName.includes("نوع کالا") || rawName.includes("عنوان محصول")) {
        return "product_type";
    }
    if (rawName.includes("استان")) return "province";
    if (rawName.includes("شهر")) return "city";
    if (rawName.includes("قیمت")) return "price";
    if (rawName.includes("واحد")) return "unit";
    if (rawName.includes("مقدار") || rawName.includes("تعداد")) return "amount";
    if (rawName.includes("تلفن") || rawName.includes("موبایل") || rawName.includes("شماره تماس")) {
        return "contact_phone";
    }
    if (rawName.includes("نام و نام") || rawName.includes("نام خانوادگی")) return "contact_name";
    if (rawName.includes("تصویر") || rawName.includes("عکس")) return "image";

    return null;
}

/** Sidebar subcategory picker (first `choice` on subcategories) — not repeated on sell form. */
export function isSidebarProductQuestion(q: BazaarQuestion, allSubQuestions: BazaarQuestion[]): boolean {
    const firstChoice = allSubQuestions.find((item) => item.field_type === "choice");
    return firstChoice != null && firstChoice.id === q.id;
}

/** Subcategory questions shown on the sell form (everything except the sidebar picker). */
export function getSellFormSubQuestions(subQuestions: BazaarQuestion[]): BazaarQuestion[] {
    return subQuestions.filter((q) => !isSidebarProductQuestion(q, subQuestions));
}

/**
 * Resolve `product_type` for Create Ad: sidebar selection, or a text field such as
 * "عنوان محصول" in categories without a choice subcategory.
 */
export function resolveAdProductType(
    subQuestions: BazaarQuestion[],
    questions: BazaarQuestion[],
    answers: Record<string, string | string[]>,
    sidebarLabel: string,
): string | null {
    if (sidebarLabel.trim()) return sidebarLabel.trim();

    for (const q of questions) {
        if (resolveAdApiFieldKey(q) !== "product_type") continue;
        if (isSidebarProductQuestion(q, subQuestions)) continue;
        const raw = answers[String(q.id)];
        if (raw == null || raw === "" || (Array.isArray(raw) && raw.length === 0)) continue;
        if (q.field_type === "choice") {
            const id = Array.isArray(raw) ? raw[0] : raw;
            return q.options.find((o) => String(o.id) === id)?.value ?? String(id);
        }
        return Array.isArray(raw) ? raw[0] : String(raw);
    }

    return null;
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
