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
import RightPanelStore from "../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../stores/right-panel/RightPanelStorePhases";
import { type OpenToTabPayload } from "../../../dispatcher/payloads/OpenToTabPayload";
import { UserTab } from "../dialogs/UserTab";
import Modal from "../../../Modal";
import LogoutDialog from "../dialogs/LogoutDialog";
import { OwnProfileStore } from "../../../stores/OwnProfileStore";
import { UPDATE_EVENT } from "../../../stores/AsyncStore";
import { useEventEmitter } from "../../../hooks/useEventEmitter";
import BaseAvatar from "../avatars/BaseAvatar";
import UserIdentifierCustomisations from "../../../customisations/UserIdentifier";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import SettingsStore from "../../../settings/SettingsStore";
import { SettingLevel } from "../../../settings/SettingLevel";
import { findHighContrastTheme, getCustomTheme, isHighContrastTheme } from "../../../theme";
import { useTheme } from "../../../hooks/useTheme";
import PosthogTrackers from "../../../PosthogTrackers";
import { RovingAccessibleButton } from "../../../accessibility/RovingTabIndex";

const MobileBottomNav: React.FC = () => {
    const { activeTab, navigate } = useMobileNav();
    const [moreOpen, setMoreOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const userId =
        UserIdentifierCustomisations.getDisplayUserIdentifier(MatrixClientPeg.safeGet().getSafeUserId(), {
            withDisplayName: true,
        }) ?? "";

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

    const { theme, systemThemeActivated } = useTheme();
    const isDarkTheme = ((): boolean => {
        if (systemThemeActivated) return window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (theme.startsWith("custom-")) {
            try {
                return !!getCustomTheme(theme.substring("custom-".length)).is_dark;
            } catch {
                return false;
            }
        }
        return theme === "dark";
    })();

    const isHighContrast = ((): boolean => {
        if (systemThemeActivated) return window.matchMedia("(prefers-contrast: more)").matches;
        if (theme.startsWith("custom-")) return false;
        return isHighContrastTheme(theme);
    })();

    const onSwitchThemeClick = (ev: React.SyntheticEvent): void => {
        ev.preventDefault();
        ev.stopPropagation();
        PosthogTrackers.trackInteraction("WebUserMenuThemeToggleButton", ev as any);
        // Disable system theme matching if the user hits this button.
        SettingsStore.setValue("use_system_theme", null, SettingLevel.DEVICE, false);
        let newTheme = isDarkTheme ? "light" : "dark";
        if (isHighContrast) {
            const hcTheme = findHighContrastTheme(newTheme);
            if (hcTheme) newTheme = hcTheme;
        }
        SettingsStore.setValue("theme", null, SettingLevel.DEVICE, newTheme);
    };

    const onSignOut = (): void => {
        setMoreOpen(false);
        Modal.createDialog(LogoutDialog);
    };

    return (
        <nav className="mx_MobileBottomNav">
            <button
                className={classNames("mx_MobileBottomNav_tab", { active: activeTab === "agriculture" })}
                onClick={() => {
                    if (
                        RightPanelStore.instance.isOpen &&
                        RightPanelStore.instance.currentCard.phase === RightPanelPhases.GreatShops
                    ) {
                        RightPanelStore.instance.hide(null);
                    }
                    navigate("agriculture");
                }}
            >
                <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_agriculture" />
                <span className="mx_MobileBottomNav_label">{_t("custom_panels|agriculture")}</span>
            </button>
            <button
                className={classNames("mx_MobileBottomNav_tab", { active: activeTab === "chat" })}
                onClick={() => {
                    if (
                        RightPanelStore.instance.isOpen &&
                        RightPanelStore.instance.currentCard.phase === RightPanelPhases.GreatShops
                    ) {
                        RightPanelStore.instance.hide(null);
                    }
                    navigate("chatList");
                }}
            >
                <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_chat" />
                <span className="mx_MobileBottomNav_label">{_t("common|social" as TranslationKey)}</span>
            </button>
            <button
                className={classNames("mx_MobileBottomNav_tab", { active: activeTab === "services" })}
                onClick={() => {
                    if (
                        RightPanelStore.instance.isOpen &&
                        RightPanelStore.instance.currentCard.phase === RightPanelPhases.GreatShops
                    ) {
                        RightPanelStore.instance.hide(null);
                    }
                    navigate("services");
                }}
            >
                <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_services" />
                <span className="mx_MobileBottomNav_label">{_t("custom_panels|services")}</span>
            </button>
            <button
                className={classNames("mx_MobileBottomNav_tab", { active: activeTab === "greatShops" })}
                onClick={() => {
                    RightPanelStore.instance.setCard({ phase: RightPanelPhases.GreatShops }, true, undefined);
                    navigate("greatShops");
                }}
            >
                <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_greatShops" />
                <span className="mx_MobileBottomNav_label">{_t("custom_panels|greatShops")}</span>
            </button>
            <button
                className={classNames("mx_MobileBottomNav_tab", { active: activeTab === "bazaar" })}
                onClick={() => {
                    RightPanelStore.instance.setCard({ phase: RightPanelPhases.Bazaar }, true, undefined);
                    navigate("bazaar");
                }}
            >
                <div className="mx_MobileBottomNav_icon mx_MobileBottomNav_icon_bazaar" />
                <span className="mx_MobileBottomNav_label">{_t("custom_panels|bazaar")}</span>
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
                        <div className="mx_UserMenu_contextMenu_header">
                            <div className="mx_MobileBottomNav_menuProfile">
                                <BaseAvatar idName={userId} name={displayName} url={avatarUrl} size="38px" />
                                <div className="mx_MobileBottomNav_menuProfileInfo">
                                    <span className="mx_MobileBottomNav_menuProfileName">{displayName}</span>
                                    <span className="mx_MobileBottomNav_menuProfileId">{userId}</span>
                                </div>
                            </div>
                            <RovingAccessibleButton
                                className="mx_UserMenu_contextMenu_themeButton"
                                onClick={onSwitchThemeClick}
                                title={
                                    isDarkTheme ? _t("user_menu|switch_theme_light") : _t("user_menu|switch_theme_dark")
                                }
                            >
                                <span className="mx_UserMenu_themeIcon" />
                            </RovingAccessibleButton>
                        </div>
                        <div className="mx_MobileBottomNav_menuDivider" />
                        <button
                            className="mx_MobileBottomNav_menuItem"
                            onClick={() => {
                                setMoreOpen(false);
                                navigate("agriculture");
                            }}
                        >
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_home" />
                            <span>{_t("common|home")}</span>
                        </button>
                        <button className="mx_MobileBottomNav_menuItem" onClick={() => openSettings()}>
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_settings" />
                            <span>{_t("common|settings")}</span>
                        </button>
                        {/* <button
                            className="mx_MobileBottomNav_menuItem"
                            onClick={() => openSettings(UserTab.Notifications)}
                        >
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_notifications" />
                            <span>{_t("notifications|enable_prompt_toast_title")}</span>
                        </button> */}
                        {/* <button className="mx_MobileBottomNav_menuItem" onClick={() => openSettings(UserTab.Security)}>
                            <div className="mx_MobileBottomNav_menuIcon mx_MobileBottomNav_menuIcon_security" />
                            <span>{_t("room_settings|security|title")}</span>
                        </button> */}
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
