/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

export const getCurrentJalali = (): { year: number; month: number } => {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
        year: "numeric",
        month: "numeric",
    }).formatToParts(new Date());

    const year = Number(parts.find((p) => p.type === "year")?.value);
    const month = Number(parts.find((p) => p.type === "month")?.value);

    return { year, month };
};

/**
 * Expiry inputs are expected as 2-digit Jalali month/year strings.
 *
 * Logic matches CardToCardCard:
 * - expMonth must be 01..12
 * - expYear must be >= currentYear%100
 * - if equal year, expMonth must be >= currentMonth
 */
export enum ExpiryValidationResult {
    Valid = "valid",
    InvalidFormat = "invalid_format",
    InvalidMonth = "invalid_month",
    Expired = "expired",
}

export const validateJalaliExpiry = (expMonth: string, expYear: string): ExpiryValidationResult => {
    const month = Number(expMonth);
    const year = Number(expYear);

    if (expMonth.length !== 2 || expYear.length !== 2) {
        return ExpiryValidationResult.InvalidFormat;
    }

    if (month < 1 || month > 12) {
        return ExpiryValidationResult.InvalidMonth;
    }

    const { year: curYear, month: curMonth } = getCurrentJalali();
    const curYear2 = curYear % 100;

    const isValid = year >= curYear2 && (year > curYear2 || month >= curMonth);

    return isValid ? ExpiryValidationResult.Valid : ExpiryValidationResult.Expired;
};
