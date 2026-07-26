/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EventType, MsgType, type Room, RoomEvent } from "matrix-js-sdk/src/matrix";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { useEventEmitterState } from "../../../hooks/useEventEmitter";
import "../../../../res/css/views/rooms/BotPinnedCategories.pcss";

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
 *
 * Mouse users get left/right arrow buttons when the row overflows (scrollbar is hidden).
 */
export function BotPinnedCategories({ room }: Props): React.JSX.Element | null {
    const categories = useEventEmitterState(room, RoomEvent.Timeline, () => findLatestPinned(room));
    const [activeId, setActiveId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollStart, setCanScrollStart] = useState(false);
    const [canScrollEnd, setCanScrollEnd] = useState(false);

    const checkScroll = useCallback((): void => {
        const el = scrollRef.current;
        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 5) {
            setCanScrollStart(false);
            setCanScrollEnd(false);
            return;
        }

        const current = Math.abs(el.scrollLeft);
        setCanScrollStart(current > 5);
        setCanScrollEnd(current < maxScroll - 5);
    }, []);

    const scroll = useCallback((direction: "start" | "end"): void => {
        const el = scrollRef.current;
        if (!el) return;

        const isRTL = getComputedStyle(el).direction === "rtl";
        const amount = 200;
        const left = direction === "start" ? (isRTL ? amount : -amount) : isRTL ? -amount : amount;
        el.scrollBy({ left, behavior: "smooth" });
    }, []);

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [checkScroll, categories]);

    if (!categories) return null;

    const onPick = async (cat: PinnedCategory): Promise<void> => {
        setActiveId(cat.id);
        const client = MatrixClientPeg.safeGet();
        const send = (body: string): Promise<unknown> =>
            client.sendEvent(room.roomId, EventType.RoomMessage, {
                msgtype: MsgType.Text,
                body,
            });
        try {
            // 1. Stop the bot (quit current conversation)
            await send("<<<USER_RESTARTED_INPUT::USER_RESTARTED_BOT::QR7T-N8VP-Z1W6>>>");
            // 2. Start the bot (fresh session)
            await send("<<<USER_STARTED_INPUT::USER_STARTED_BOT::SX9K-M4LP-T2H8>>>");
            // 3. Send the selected category name
            await send(cat.name);
        } catch (e) {
            logger.warn("BotPinnedCategories: failed to send", e);
        }
    };

    return (
        <div className="mx_BotPinnedCategories">
            {canScrollStart && (
                <button
                    type="button"
                    className="mx_BotPinnedCategories_arrow mx_BotPinnedCategories_arrowStart"
                    onClick={() => scroll("start")}
                    aria-label="اسکرول به ابتدا"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M9 6L15 12L9 18"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
            {canScrollEnd && (
                <button
                    type="button"
                    className="mx_BotPinnedCategories_arrow mx_BotPinnedCategories_arrowEnd"
                    onClick={() => scroll("end")}
                    aria-label="اسکرول به انتها"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M15 6L9 12L15 18"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
            <div
                ref={scrollRef}
                className={[
                    "mx_BotPinnedCategories_row",
                    canScrollStart ? "mx_BotPinnedCategories_row--padStart" : "",
                    canScrollEnd ? "mx_BotPinnedCategories_row--padEnd" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                data-bot-pinned-categories="true"
            >
                {categories.map((cat) => {
                    const active = activeId === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            className={
                                active
                                    ? "mx_BotPinnedCategories_pill mx_BotPinnedCategories_pill_active"
                                    : "mx_BotPinnedCategories_pill"
                            }
                            onClick={() => onPick(cat)}
                            title={cat.name}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
