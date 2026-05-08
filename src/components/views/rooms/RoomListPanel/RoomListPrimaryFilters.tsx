/*
 * Copyright 2025 New Vector Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import React, { type JSX } from "react";
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
    return (
        <Flex
            className="mx_RoomListPrimaryFilters"
            data-testid="primary-filters"
            gap="var(--cpd-space-2x)"
            justify="center"
            align="center"
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
    );
}
