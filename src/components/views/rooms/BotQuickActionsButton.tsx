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

/**
 * Mobile fallback: icon button + context menu (original approach).
 */
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

/**
 * Desktop/Telegram-style: inline pill strip rendered above the composer input.
 * Shows commands as always-visible clickable chips.
 */
export function BotCommandsStrip({ room }: { room: Room }): React.JSX.Element | null {
    const commands = useEventEmitterState(room, RoomEvent.Timeline, () => findLatestCommands(room));
    const [argCommand, setArgCommand] = useState<BotCommand | null>(null);
    const [argValue, setArgValue] = useState("");

    if (!commands) return null;

    const send = async (text: string): Promise<void> => {
        try {
            await MatrixClientPeg.safeGet().sendEvent(room.roomId, EventType.RoomMessage, {
                msgtype: MsgType.Text,
                body: text,
            });
        } catch (e) {
            logger.warn("BotCommandsStrip: failed to send", e);
        }
    };

    const onPick = async (cmd: BotCommand): Promise<void> => {
        if (commandNeedsInput(cmd)) {
            setArgCommand(cmd);
            setArgValue("");
            return;
        }
        await send(cmd.command);
    };

    const onArgSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        const cmd = argCommand;
        const value = argValue.trim();
        setArgCommand(null);
        setArgValue("");
        if (!cmd || !value) return;
        await send(`${cmd.command} ${value}`);
    };

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                padding: "6px 12px",
                alignItems: "center",
            }}
        >
            {commands.map((cmd) => {
                const isActive = argCommand?.command === cmd.command;
                return (
                    <button
                        key={cmd.command}
                        onClick={() => onPick(cmd)}
                        title={cmd.description}
                        style={{
                            padding: "5px 14px",
                            borderRadius: "999px",
                            border: isActive ? "1px solid #326430" : "1px solid var(--cpd-color-border-interactive-secondary)",
                            background: isActive ? "#326430" : "var(--cpd-color-bg-subtle-secondary)",
                            color: isActive ? "#fff" : "var(--cpd-color-text-primary)",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "all 0.15s ease",
                        }}
                    >
                        {cmd.label}
                    </button>
                );
            })}

            {/* Inline search input that appears when a command needs an argument */}
            {argCommand && (
                <form
                    onSubmit={onArgSubmit}
                    style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        flex: 1,
                        minWidth: 180,
                    }}
                >
                    <input
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        type="text"
                        value={argValue}
                        onChange={(e) => setArgValue(e.target.value)}
                        placeholder={argCommand.description ?? argCommand.label}
                        style={{
                            flex: 1,
                            padding: "5px 10px",
                            borderRadius: 8,
                            border: "1px solid var(--cpd-color-border-interactive-secondary)",
                            background: "var(--cpd-color-bg-canvas-default)",
                            color: "var(--cpd-color-text-primary)",
                            outline: "none",
                            fontSize: 13,
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: "var(--cpd-color-bg-action-primary-rest)",
                            color: "var(--cpd-color-text-on-solid-primary)",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                    >
                        ارسال
                    </button>
                    <button
                        type="button"
                        onClick={() => setArgCommand(null)}
                        style={{
                            padding: "5px 10px",
                            borderRadius: 8,
                            border: "1px solid var(--cpd-color-border-interactive-secondary)",
                            background: "transparent",
                            color: "var(--cpd-color-text-secondary)",
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                    >
                        ✕
                    </button>
                </form>
            )}
        </div>
    );
}
