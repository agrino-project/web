/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { type GreatShopHistoryItem } from "./useGreatShopHistory";

export type HistoryTimeGroup = "this_week" | "this_month" | "last_month" | "older";

export interface HistoryStatusStyle {
    background: string;
    color: string;
}

/**
 * Badge colors aligned to the History mock (green / orange / red / gray).
 * Soft tinted backgrounds + mid tones stay readable on both light and dark surfaces.
 */
export function getHistoryStatusStyle(status: string): HistoryStatusStyle {
    const s = status.trim();

    if (
        s === "تایید ادمین" ||
        s === "تأیید ادمین" ||
        s === "تکمیل شده توسط کاربر" ||
        s.includes("تأیید شده") ||
        s.includes("تایید شده")
    ) {
        return { background: "rgba(34, 197, 94, 0.18)", color: "var(--cpd-color-text-success-primary, #22c55e)" };
    }

    if (s === "رد شده توسط ادمین" || s.includes("رد شده")) {
        return {
            background: "rgba(239, 68, 68, 0.18)",
            color: "var(--cpd-color-text-critical-primary, #ef4444)",
        };
    }

    if (s === "لغو شده توسط کاربر" || s.includes("لغو")) {
        return {
            background: "rgba(156, 163, 175, 0.2)",
            color: "var(--cpd-color-text-secondary, #9ca3af)",
        };
    }

    if (
        s === "نیاز به پیگیری توسط ادمین" ||
        s.includes("پیگیری") ||
        s.includes("اصلاح") ||
        s.includes("در انتظار")
    ) {
        return { background: "rgba(245, 158, 11, 0.2)", color: "var(--cpd-color-text-warning-primary, #f59e0b)" };
    }

    // Default: soft orange for unknown / pending-like states.
    return { background: "rgba(245, 158, 11, 0.2)", color: "var(--cpd-color-text-warning-primary, #f59e0b)" };
}

function toPersianDate(ms: number): DateObject {
    return new DateObject({ date: new Date(ms), calendar: persian, locale: persian_fa });
}

/** e.g. یکشنبه، ۲۶ اردیبهشت ۱۴۰۵ ۰۹:۱۵ */
export function formatHistoryTimestamp(ms: number): string {
    try {
        return toPersianDate(ms).format("dddd، D MMMM YYYY HH:mm");
    } catch {
        return new Date(ms).toLocaleString("fa-IR");
    }
}

function startOfDay(d: DateObject): DateObject {
    const copy = new DateObject(d);
    copy.setHour(0);
    copy.setMinute(0);
    copy.setSecond(0);
    copy.setMillisecond(0);
    return copy;
}

/**
 * Bucket a timestamp into this-week / this-month / last-month / older using the
 * Persian calendar (week starts Saturday via the persian_fa locale).
 */
export function getHistoryTimeGroup(ms: number, nowMs: number = Date.now()): HistoryTimeGroup {
    const now = toPersianDate(nowMs);
    const date = toPersianDate(ms);

    const startWeek = startOfDay(new DateObject(now).toFirstOfWeek());
    if (date.valueOf() >= startWeek.valueOf()) return "this_week";

    if (date.year === now.year && date.month.number === now.month.number) return "this_month";

    const lastMonth = new DateObject(now).subtract(1, "month");
    if (date.year === lastMonth.year && date.month.number === lastMonth.month.number) {
        return "last_month";
    }

    return "older";
}

export interface GroupedHistory {
    group: HistoryTimeGroup;
    items: GreatShopHistoryItem[];
}

const GROUP_ORDER: HistoryTimeGroup[] = ["this_week", "this_month", "last_month", "older"];

export function groupHistoryItems(items: GreatShopHistoryItem[]): GroupedHistory[] {
    const buckets = new Map<HistoryTimeGroup, GreatShopHistoryItem[]>();
    for (const group of GROUP_ORDER) buckets.set(group, []);

    for (const item of items) {
        const group = getHistoryTimeGroup(item.createdAt);
        buckets.get(group)!.push(item);
    }

    return GROUP_ORDER.map((group) => ({ group, items: buckets.get(group)! })).filter(
        (g) => g.items.length > 0,
    );
}
