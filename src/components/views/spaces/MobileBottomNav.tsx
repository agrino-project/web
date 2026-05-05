/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";

import { _t, type TranslationKey } from "../../../languageHandler";
import { useMobileNav } from "../../structures/mobile/MobileNavContext";
import defaultDispatcher from "../../../dispatcher/dispatcher";
import { Action } from "../../../dispatcher/actions";
import { type OpenToTabPayload } from "../../../dispatcher/payloads/OpenToTabPayload";
import { UserTab } from "../dialogs/UserTab";
import Modal from "../../../Modal";
import LogoutDialog from "../dialogs/LogoutDialog";
import { OwnProfileStore } from "../../../stores/OwnProfileStore";
import { UPDATE_EVENT } from "../../../stores/AsyncStore";
import { useEventEmitter } from "../../../hooks/useEventEmitter";
import BaseAvatar from "../avatars/BaseAvatar";
import { useMatrixClientContext } from "../../../contexts/MatrixClientContext";

const MobileBottomNav: React.FC = () => {
    const { activeTab, navigate } = useMobileNav();
    const [moreOpen, setMoreOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const cli = useMatrixClientContext();
    const userId = cli.getUserId() ?? "";

    // User profile
    const [displayName, setDisplayName] = useState(OwnProfileStore.instance.displayName || userId);
    const [avatarUrl, setAvatarUrl] = useState(OwnProfileStore.instance.getHttpAvatarUrl(32) ?? undefined);
    useEventEmitter(OwnProfileStore.instance, UPDATE_EVENT, () => {
        setDisplayName(OwnProfileStore.instance.displayName || userId);
        setAvatarUrl(OwnProfileStore.instance.getHttpAvatarUrl(32) ?? undefined);
    });

    // Close menu when clicking outside
    useEffect(() => {
        if (!moreOpen) return;
        const onClickOutside = (e: MouseEvent): void => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMoreOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [moreOpen]);

    const openSettings = (tabId?: UserTab): void => {
        setMoreOpen(false);
        const payload: OpenToTabPayload = { action: Action.ViewUserSettings, initialTabId: tabId };
        defaultDispatcher.dispatch(payload);
    };

    const onSignOut = (): void => {
        setMoreOpen(false);
        Modal.createDialog(LogoutDialog);
    };

    return (
        <nav className="mx_MobileBottomNav">
            <button
                className={classNames("mx_MobileBottomNav_tab", { active: activeTab === "agriculture" })}
                onClick={() => navigate("agriculture")}
            >
                <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_agriculture" />
                <span className="mx_MobileBottomNav_label">{_t("custom_panels|agriculture")}</span>
            </button>
            <button
                className={classNames("mx_MobileBottomNav_tab", { active: activeTab === "chat" })}
                onClick={() => navigate("chatList")}
            >
                <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_chat" />
                <span className="mx_MobileBottomNav_label">{_t("common|social" as TranslationKey)}</span>
            </button>
            <button
                className={classNames("mx_MobileBottomNav_tab", { active: activeTab === "services" })}
                onClick={() => navigate("services")}
            >
                <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_services" />
                <span className="mx_MobileBottomNav_label">{_t("custom_panels|services")}</span>
            </button>
            <div className="mx_MobileBottomNav_moreWrapper" ref={menuRef}>
                <button
                    className={classNames("mx_MobileBottomNav_tab", { active: moreOpen })}
                    onClick={() => setMoreOpen(!moreOpen)}
                >
                    <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_more" />
                    <span className="mx_MobileBottomNav_label">{_t("common|more" as TranslationKey)}</span>
                </button>
                {moreOpen && (
                    <div className="mx_MobileBottomNav_moreMenu">
                        <div className="mx_MobileBottomNav_menuProfile">
                            <BaseAvatar idName={userId} name={displayName} url={avatarUrl} size="36px" />
                            <div className="mx_MobileBottomNav_menuProfileInfo">
                                <span className="mx_MobileBottomNav_menuProfileName">{displayName}</span>
                                <span className="mx_MobileBottomNav_menuProfileId">{userId}</span>
                            </div>
                        </div>
                        <div className="mx_MobileBottomNav_menuDivider" />
                        <button
                            className="mx_MobileBottomNav_menuItem"
                            onClick={() => {
                                setMoreOpen(false);
                                defaultDispatcher.dispatch({ action: Action.ViewHomePage });
                            }}
                        >
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_home" />
                            <span>{_t("common|home")}</span>
                        </button>
                        <button className="mx_MobileBottomNav_menuItem" onClick={() => openSettings()}>
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_settings" />
                            <span>{_t("common|settings")}</span>
                        </button>
                        <button
                            className="mx_MobileBottomNav_menuItem"
                            onClick={() => openSettings(UserTab.Notifications)}
                        >
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_notifications" />
                            <span>{_t("notifications|enable_prompt_toast_title")}</span>
                        </button>
                        <button className="mx_MobileBottomNav_menuItem" onClick={() => openSettings(UserTab.Security)}>
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_security" />
                            <span>{_t("room_settings|security|title")}</span>
                        </button>
                        <div className="mx_MobileBottomNav_menuDivider" />
                        <button
                            className="mx_MobileBottomNav_menuItem mx_MobileBottomNav_menuItem--danger"
                            onClick={onSignOut}
                        >
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_signout" />
                            <span>{_t("action|sign_out")}</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
