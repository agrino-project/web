/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useRef, useState } from "react";
import { EventType, MsgType, type Room, RoomEvent } from "matrix-js-sdk/src/matrix";
import { logger } from "matrix-js-sdk/src/logger";

import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { CollapsibleButton } from "./CollapsibleButton";
import ContextMenu, { aboveLeftOf, useContextMenu } from "../../structures/ContextMenu";
import IconizedContextMenu, {
    IconizedContextMenuOption,
    IconizedContextMenuOptionList,
} from "../context_menus/IconizedContextMenu";
import { useEventEmitterState } from "../../../hooks/useEventEmitter";

interface Props {
    room: Room;
    /** When inside the overflow menu, callers pass this so the menu closes after a selection. */
    onMenuFinished?: () => void;
}

interface BotCommand {
    command: string;
    label: string;
    description?: string;
}

function findLatestCommands(room: Room): BotCommand[] | null {
    const selfUserId = MatrixClientPeg.safeGet().getSafeUserId();
    const events = room.getLiveTimeline().getEvents();
    for (let i = events.length - 1; i >= 0; i--) {
        const ev = events[i];
        if (ev.getType() !== EventType.RoomMessage) continue;
        if (ev.getSender() === selfUserId) continue;
        const commands = ev.getContent()?.custom_meta_data?.commands as BotCommand[] | undefined;
        if (Array.isArray(commands) && commands.length > 0) return commands;
    }
    return null;
}

function commandNeedsInput(cmd: BotCommand): boolean {
    return cmd.label === "جستجو" || cmd.command === "جستن";
}

export function BotQuickActionsButton({ room, onMenuFinished }: Props): React.JSX.Element | null {
    const [menuDisplayed, button, openMenu, closeMenu] = useContextMenu<HTMLButtonElement>();
    const [argCommand, setArgCommand] = useState<BotCommand | null>(null);
    const argInputRef = useRef<HTMLInputElement>(null);

    const commands = useEventEmitterState(room, RoomEvent.Timeline, () => findLatestCommands(room));
    if (!commands) return null;

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

    const onPick = async (cmd: BotCommand): Promise<void> => {
        if (commandNeedsInput(cmd)) {
            // Switch from the menu to the inline input popover so the user can supply the argument.
            closeMenu();
            setArgCommand(cmd);
            setTimeout(() => argInputRef.current?.focus(), 0);
            return;
        }
        closeMenu();
        onMenuFinished?.();
        await send(cmd.command);
    };

    const onArgSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        const cmd = argCommand;
        const value = argInputRef.current?.value?.trim() ?? "";
        setArgCommand(null);
        if (!cmd || !value) return;
        await send(`${cmd.command} ${value}`);
        onMenuFinished?.();
    };

    let menu: React.JSX.Element | undefined;
    if (menuDisplayed && button.current) {
        const rect = button.current.getBoundingClientRect();
        menu = (
            <IconizedContextMenu {...aboveLeftOf(rect)} onFinished={closeMenu} compact>
                <IconizedContextMenuOptionList>
                    {commands.map((cmd) => (
                        <IconizedContextMenuOption
                            key={cmd.command}
                            label={cmd.label}
                            title={cmd.description}
                            onClick={() => onPick(cmd)}
                        />
                    ))}
                </IconizedContextMenuOptionList>
            </IconizedContextMenu>
        );
    }

    let argPopover: React.JSX.Element | undefined;
    if (argCommand && button.current) {
        const rect = button.current.getBoundingClientRect();
        argPopover = (
            <ContextMenu {...aboveLeftOf(rect)} onFinished={() => setArgCommand(null)}>
                <form
                    onSubmit={onArgSubmit}
                    style={{
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        minWidth: 240,
                    }}
                >
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--cpd-color-text-secondary)" }}>
                        {argCommand.label}
                    </label>
                    {argCommand.description && (
                        <span style={{ fontSize: 11, color: "var(--cpd-color-text-secondary)" }}>
                            {argCommand.description}
                        </span>
                    )}
                    <input
                        ref={argInputRef}
                        type="text"
                        placeholder={argCommand.label}
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
            {argPopover}
        </>
    );
}
