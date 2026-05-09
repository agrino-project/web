/*
 * Copyright 2025 New Vector Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import React, { type JSX, useEffect, useRef, useState } from "react";
import { Flex } from "@element-hq/web-shared-components";

import type { RoomListViewState } from "../../../viewmodels/roomlist/RoomListViewModel";
import { _t } from "../../../../languageHandler";

interface RoomListPrimaryFiltersProps {
    /**
     * The view model for the room list
     */
    vm: RoomListViewState;
}

/**
 * The primary filters for the room list - horizontal pill design
 */
export function RoomListPrimaryFilters({ vm }: RoomListPrimaryFiltersProps): JSX.Element {
    const scrollRef = useRef<HTMLDivElement>(null);

   const [canScrollStart, setCanScrollStart] = useState(false);
   const [canScrollEnd, setCanScrollEnd] = useState(false);

    const getScrollPosition = (el: HTMLDivElement) => {
        return Math.abs(el.scrollLeft);
    };

    const checkScroll = () => {
        const el = scrollRef.current;

        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;

        const current = getScrollPosition(el);

        const overflowing = maxScroll > 5;

        if (!overflowing) {
            setCanScrollStart(false);
            setCanScrollEnd(false);
            return;
        }

        setCanScrollStart(current > 5);

        setCanScrollEnd(current < maxScroll - 5);
    };

    const scroll = (direction: "start" | "end") => {
        const el = scrollRef.current;

        if (!el) return;

        const isRTL = getComputedStyle(el).direction === "rtl";

        const amount = 220;

        let left = 0;

        if (direction === "start") {
            left = isRTL ? amount : -amount;
        } else {
            left = isRTL ? -amount : amount;
        }

        el.scrollBy({
            left,
            behavior: "smooth",
        });
    };

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
    }, []);

    return (
        <div className="mx_RoomListPrimaryFilters_wrapper">
            {canScrollStart && (
                <button
                    className="mx_RoomListPrimaryFilters_arrow mx_RoomListPrimaryFilters_arrowStart"
                    onClick={() => scroll("start")}
                >
                    ‹
                </button>
            )}

            {canScrollEnd && (
                <button
                    className="mx_RoomListPrimaryFilters_arrow mx_RoomListPrimaryFilters_arrowEnd"
                    onClick={() => scroll("end")}
                >
                    ›
                </button>
            )}

            <Flex
                className="mx_RoomListPrimaryFilters"
                data-testid="primary-filters"
                gap="var(--cpd-space-2x)"
                align="center"
                ref={scrollRef}
            >
                {vm.primaryFilters.map((filter, i) => (
                    <button
                        key={i}
                        className={`mx_RoomListPrimaryFilters_button ${
                            filter.active ? "mx_RoomListPrimaryFilters_button_active" : ""
                        }`}
                        onClick={() => filter.toggle()}
                        aria-pressed={filter.active}
                    >
                        {filter.name}
                    </button>
                ))}
            </Flex>
        </div>
    );
}
