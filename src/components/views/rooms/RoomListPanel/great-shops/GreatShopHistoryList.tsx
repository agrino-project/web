/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { type JSX } from "react";

import { _t, type TranslationKey } from "../../../../../languageHandler";
import {
    formatHistoryTimestamp,
    getHistoryStatusStyle,
    groupHistoryItems,
    type HistoryTimeGroup,
} from "./historyUtils";
import { type GreatShopHistoryItem } from "./useGreatShopHistory";
import { errorColor, green, neutralText } from "./shared";
import React from "react";

const GROUP_LABEL_KEY: Record<HistoryTimeGroup, TranslationKey> = {
    this_week: "custom_panels|history_this_week" as TranslationKey,
    this_month: "custom_panels|history_this_month" as TranslationKey,
    last_month: "custom_panels|history_last_month" as TranslationKey,
    older: "custom_panels|history_older" as TranslationKey,
};

function HistoryCard({ item }: { item: GreatShopHistoryItem }): JSX.Element {
    const badge = getHistoryStatusStyle(item.status);
    const initial = item.title.charAt(0) || "؟";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "var(--agrino-surface)",
                borderRadius: 14,
                padding: "14px 16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid var(--agrino-surface-border)",
            }}
        >
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                }}
            >
                {item.image ? (
                    <div
                        style={{
                            width: 22,
                            height: 22,
                            backgroundImage: `url("${item.image}")`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}
                    />
                ) : (
                    <span style={{ color: "var(--cpd-color-text-on-solid-primary, #fff)", fontSize: 16, fontWeight: 700 }}>
                        {initial}
                    </span>
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0, textAlign: "start" }}>
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--cpd-color-text-primary)",
                        lineHeight: 1.45,
                        marginBottom: 4,
                    }}
                >
                    {item.title}
                </div>
                <div style={{ fontSize: 12, color: neutralText, lineHeight: 1.4 }}>
                    {formatHistoryTimestamp(item.createdAt)}
                </div>
            </div>

            {item.status ? (
                <span
                    style={{
                        flexShrink: 0,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: 8,
                        background: badge.background,
                        color: badge.color,
                        whiteSpace: "nowrap",
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                    title={item.status}
                >
                    {item.status}
                </span>
            ) : null}
        </div>
    );
}

interface Props {
    items: GreatShopHistoryItem[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * Time-grouped request history list matching the Great Shops History mock:
 * section headers (این هفته / این ماه / ماه گذشته) + icon/title/time/status cards.
 */
export function GreatShopHistoryList({ items, isLoading, error }: Props): JSX.Element {
    if (isLoading) {
        return (
            <div style={{ padding: 24, textAlign: "center", color: neutralText }}>
                {_t("custom_panels|loading" as TranslationKey)}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24, textAlign: "center", color: errorColor }}>
                {_t("custom_panels|history_load_error" as TranslationKey)}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{ padding: 24, textAlign: "center", color: neutralText }}>
                {_t("custom_panels|history_empty" as TranslationKey)}
            </div>
        );
    }

    const groups = groupHistoryItems(items);

    return (
        <div
            style={{
                padding: "8px 16px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                height: "100%",
                overflowY: "auto",
                background: "transparent",
                boxSizing: "border-box",
            }}
        >
            {groups.map(({ group, items: groupItems }) => (
                <section key={group} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <h4
                        style={{
                            margin: "4px 4px 0",
                            fontSize: 13,
                            fontWeight: 600,
                            color: neutralText,
                            textAlign: "start",
                        }}
                    >
                        {_t(GROUP_LABEL_KEY[group])}
                    </h4>
                    {groupItems.map((item) => (
                        <HistoryCard key={item.id} item={item} />
                    ))}
                </section>
            ))}
        </div>
    );
}
