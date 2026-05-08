/*
 * Copyright 2025 New Vector Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import React, { type JSX, useState, useRef } from "react";
import { IconButton } from "@vector-im/compound-web";
import SearchIcon from "@vector-im/compound-design-tokens/assets/web/icons/search";
import CloseIcon from "@vector-im/compound-design-tokens/assets/web/icons/close";
import { Flex } from "@element-hq/web-shared-components";

import { _t } from "../../../../languageHandler";
import { Action } from "../../../../dispatcher/actions";
import defaultDispatcher from "../../../../dispatcher/dispatcher";

type RoomListSearchProps = {
    /**
     * Current active space
     */
    activeSpace: string;
};

/**
 * A search component to be displayed at the top of the room list
 */
export function RoomListSearch({ activeSpace }: RoomListSearchProps): JSX.Element {
    const [searchValue, setSearchValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClear = () => {
        setSearchValue("");
        inputRef.current?.focus();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const handleSearchClick = () => {
        defaultDispatcher.fire(Action.OpenSpotlight);
    };

    return (
        <Flex className="mx_RoomListSearch" role="search" gap="var(--cpd-space-2x)" align="center">
            <div className="mx_RoomListSearch_inputWrapper">
                <IconButton
                    className="mx_RoomListSearch_searchIcon"
                    size="24px"
                    onClick={handleSearchClick}
                    aria-label={_t("action|search")}
                >
                    <SearchIcon />
                </IconButton>

                <input
                    ref={inputRef}
                    type="text"
                    className="mx_RoomListSearch_input"
                    placeholder={_t("action|search")}
                    value={searchValue}
                    onChange={handleSearchChange}
                    onClick={handleSearchClick}
                />
                {searchValue && (
                    <IconButton
                        className="mx_RoomListSearch_closeButton"
                        size="24px"
                        onClick={handleClear}
                        aria-label={_t("action|clear")}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </div>
        </Flex>
    );
}
