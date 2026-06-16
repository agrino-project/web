/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useState } from "react";
import { EventType, MsgType, type Room, RoomEvent } from "matrix-js-sdk/src/matrix";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { useEventEmitterState } from "../../../hooks/useEventEmitter";

interface PinnedCategory {
    id: number;
    key: string;
    name: string;
}

interface Props {
    room: Room;
}

/**
 * Find the most recent bot message that exposes a `custom_meta_data.pinned_categories`
 * array — those are the quick-filter pills the bot wants pinned to the top of the chat.
 */
function findLatestPinned(room: Room): PinnedCategory[] | null {
    const selfUserId = MatrixClientPeg.safeGet().getSafeUserId();
    const events = room.getLiveTimeline().getEvents();
    for (let i = events.length - 1; i >= 0; i--) {
        const ev = events[i];
        if (ev.getType() !== EventType.RoomMessage) continue;
        if (ev.getSender() === selfUserId) continue;
        const pinned = ev.getContent()?.custom_meta_data?.pinned_categories as PinnedCategory[] | undefined;
        if (Array.isArray(pinned) && pinned.length > 0) return pinned;
    }
    return null;
}

/**
 * Horizontally-scrollable strip of "pinned category" pills shown above the timeline
 * when the latest bot message contains `pinned_categories`. Clicking a pill sends
 * the category's `name` as a plain text message — the bot then drives the next turn.
 */
export function BotPinnedCategories({ room }: Props): React.JSX.Element | null {
    const categories = useEventEmitterState(room, RoomEvent.Timeline, () => findLatestPinned(room));
    const [activeId, setActiveId] = useState<number | null>(null);

    if (!categories) return null;

    const onPick = async (cat: PinnedCategory): Promise<void> => {
        setActiveId(cat.id);
        try {
            await MatrixClientPeg.safeGet().sendEvent(room.roomId, EventType.RoomMessage, {
                msgtype: MsgType.Text,
                body: cat.name,
            });
        } catch (e) {
            logger.warn("BotPinnedCategories: failed to send", e);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                gap: 10,
                padding: "8px 12px",
                overflowX: "auto",
                overflowY: "hidden",
                background: "var(--cpd-color-bg-canvas-default)",
                borderBottom: "1px solid var(--cpd-color-gray-300)",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            // Hide scrollbar on Webkit too — the row scrolls via touch / drag / wheel.
            // eslint-disable-next-line react/no-unknown-property
            data-bot-pinned-categories="true"
        >
            {categories.map((cat) => {
                const active = activeId === cat.id;
                return (
                    <button
                        key={cat.id}
                        onClick={() => onPick(cat)}
                        title={cat.name}
                        style={{
                            flex: "0 0 auto",
                            padding: "8px 12px",
                            borderRadius: "999px",
                            border: active ? "1px solid #326430" : "1px solid transparent",
                            background: active ? "#326430" : "var(--agrino-bg)",
                            color: active ? "#fff" : "var(--cpd-color-text-primary)",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            if (!active) {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.12)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!active) {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
                            }
                        }}
                    >
                        {cat.name}
                    </button>
                );
            })}
        </div>
    );
}
