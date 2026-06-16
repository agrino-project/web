/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useRef, useState } from "react";
import { EventType, MsgType, type Room } from "matrix-js-sdk/src/matrix";

import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { CollapsibleButton } from "./CollapsibleButton";
import ContextMenu, { aboveLeftOf, useContextMenu } from "../../structures/ContextMenu";
import IconizedContextMenu, {
    IconizedContextMenuOption,
    IconizedContextMenuOptionList,
} from "../context_menus/IconizedContextMenu";
import { logger } from "matrix-js-sdk/src/logger";

interface Props {
    room: Room;
    /** When inside the overflow menu, callers pass this so the menu closes after a selection. */
    onMenuFinished?: () => void;
}

/**
 * Quick-actions button for bot rooms: a single button that opens a context menu
 * with "restart" / "stop" / "search" entries. Each entry sends a predefined
 * plain-text message to the room (mirrors how Telegram bot keyboards work).
 */
export function BotQuickActionsButton({ room, onMenuFinished }: Props): React.JSX.Element {
    const [menuDisplayed, button, openMenu, closeMenu] = useContextMenu<HTMLButtonElement>();
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const send = async (text: string): Promise<void> => {
        try {
            await MatrixClientPeg.safeGet().sendEvent(room.roomId, EventType.RoomMessage, {
                msgtype: MsgType.Text,
                body: text,
            });
        } catch (e) {
            logger.warn("BotQuickActionsButton: failed to send", e);
        }
    };

    const finish = (): void => {
        closeMenu();
        onMenuFinished?.();
    };

    const onRestart = async (): Promise<void> => {
        finish();
        await send("s");
    };

    const onStop = async (): Promise<void> => {
        finish();
        await send("q");
    };

    const onSearchClick = (): void => {
        closeMenu();
        setSearchOpen(true);
        // Focus the input on the next tick once it has mounted.
        setTimeout(() => searchInputRef.current?.focus(), 0);
    };

    const onSearchSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        const value = searchInputRef.current?.value?.trim();
        setSearchOpen(false);
        if (!value) return;
        await send(`جستن ${value}`);
        onMenuFinished?.();
    };

    let menu: React.JSX.Element | undefined;
    if (menuDisplayed && button.current) {
        const rect = button.current.getBoundingClientRect();
        menu = (
            <IconizedContextMenu {...aboveLeftOf(rect)} onFinished={closeMenu} compact>
                <IconizedContextMenuOptionList>
                    <IconizedContextMenuOption label="شروع مجدد" onClick={onRestart} />
                    <IconizedContextMenuOption label="توقف" onClick={onStop} />
                    <IconizedContextMenuOption label="جستجو" onClick={onSearchClick} />
                </IconizedContextMenuOptionList>
            </IconizedContextMenu>
        );
    }

    let searchPopover: React.JSX.Element | undefined;
    if (searchOpen && button.current) {
        const rect = button.current.getBoundingClientRect();
        searchPopover = (
            <ContextMenu {...aboveLeftOf(rect)} onFinished={() => setSearchOpen(false)}>
                <form
                    onSubmit={onSearchSubmit}
                    style={{
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        minWidth: 240,
                    }}
                >
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--cpd-color-text-secondary)" }}>
                        جستجو
                    </label>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="عبارت جستجو"
                        style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid var(--cpd-color-border-interactive-secondary)",
                            background: "var(--cpd-color-bg-canvas-default)",
                            color: "var(--cpd-color-text-primary)",
                            outline: "none",
                            fontSize: 14,
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: "var(--cpd-color-bg-action-primary-rest)",
                            color: "var(--cpd-color-text-on-solid-primary)",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: 13,
                        }}
                    >
                        ارسال
                    </button>
                </form>
            </ContextMenu>
        );
    }

    return (
        <>
            <CollapsibleButton
                inputRef={button as React.RefObject<HTMLElement | null>}
                title="دستورهای سریع ربات"
                className="mx_MessageComposer_button"
                iconClassName="mx_MessageComposer_bot_quick_actions"
                onClick={openMenu}
            />
            {menu}
            {searchPopover}
        </>
    );
}
