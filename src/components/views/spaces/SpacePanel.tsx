/*
Copyright 2024 New Vector Ltd.
Copyright 2021, 2022 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, {
    type ComponentProps,
    type Dispatch,
    type ReactNode,
    type RefCallback,
    type SetStateAction,
    type JSX,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { DragDropContext, Draggable, Droppable, type DroppableProvidedProps } from "react-beautiful-dnd";
import classNames from "classnames";
import { type Room } from "matrix-js-sdk/src/matrix";

import { _t } from "../../../languageHandler";
import { useContextMenu } from "../../structures/ContextMenu";
import SpaceCreateMenu from "./SpaceCreateMenu";
import { SpaceButton, SpaceItem } from "./SpaceTreeLevel";
import { useEventEmitter, useEventEmitterState } from "../../../hooks/useEventEmitter";
import SpaceStore from "../../../stores/spaces/SpaceStore";
import {
    getMetaSpaceName,
    MetaSpace,
    type SpaceKey,
    UPDATE_HOME_BEHAVIOUR,
    UPDATE_INVITED_SPACES,
    UPDATE_SELECTED_SPACE,
    UPDATE_TOP_LEVEL_SPACES,
} from "../../../stores/spaces";
import { RovingTabIndexProvider } from "../../../accessibility/RovingTabIndex";
import {
    RoomNotificationStateStore,
    UPDATE_STATUS_INDICATOR,
} from "../../../stores/notifications/RoomNotificationStateStore";
import type SpaceContextMenu from "../context_menus/SpaceContextMenu";
import IconizedContextMenu, {
    IconizedContextMenuCheckbox,
    IconizedContextMenuOptionList,
} from "../context_menus/IconizedContextMenu";
import SettingsStore from "../../../settings/SettingsStore";
import { SettingLevel } from "../../../settings/SettingLevel";
import UIStore from "../../../stores/UIStore";
import { useSettingValue } from "../../../hooks/useSettings";
import UserMenu from "../../structures/UserMenu";
import IndicatorScrollbar from "../../structures/IndicatorScrollbar";
import { useDispatcher } from "../../../hooks/useDispatcher";
import defaultDispatcher from "../../../dispatcher/dispatcher";
import { type ActionPayload } from "../../../dispatcher/payloads";
import { Action } from "../../../dispatcher/actions";
import { type NotificationState } from "../../../stores/notifications/NotificationState";
import { KeyBindingAction } from "../../../accessibility/KeyboardShortcuts";
import { getKeyBindingsManager } from "../../../KeyBindingsManager";
import AccessibleButton from "../elements/AccessibleButton";
import { Landmark, LandmarkNavigation } from "../../../accessibility/LandmarkNavigation";
import { KeyboardShortcut } from "../settings/KeyboardShortcut";
import { ModuleApi } from "../../../modules/Api.ts";
import { useModuleSpacePanelItems } from "../../../modules/ExtrasApi.ts";
import { ReleaseAnnouncement } from "../../structures/ReleaseAnnouncement";
import RightPanelStore from "../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../stores/right-panel/RightPanelStorePhases";
import { UPDATE_EVENT } from "../../../stores/AsyncStore";
import { SdkContextClass } from "../../../contexts/SDKContext";

const useSpaces = (): [Room[], MetaSpace[], Room[], SpaceKey] => {
    const invites = useEventEmitterState<Room[]>(SpaceStore.instance, UPDATE_INVITED_SPACES, () => {
        return SpaceStore.instance.invitedSpaces;
    });
    const [metaSpaces, actualSpaces] = useEventEmitterState<[MetaSpace[], Room[]]>(
        SpaceStore.instance,
        UPDATE_TOP_LEVEL_SPACES,
        () => [SpaceStore.instance.enabledMetaSpaces, SpaceStore.instance.spacePanelSpaces],
    );
    const activeSpace = useEventEmitterState<SpaceKey>(SpaceStore.instance, UPDATE_SELECTED_SPACE, () => {
        return SpaceStore.instance.activeSpace;
    });
    return [invites, metaSpaces, actualSpaces, activeSpace];
};

export const HomeButtonContextMenu: React.FC<ComponentProps<typeof SpaceContextMenu>> = ({
    onFinished,
    hideHeader,
    ...props
}) => {
    const allRoomsInHome = useSettingValue("Spaces.allRoomsInHome");

    return (
        <IconizedContextMenu {...props} onFinished={onFinished} className="mx_SpacePanel_contextMenu" compact>
            {!hideHeader && <div className="mx_SpacePanel_contextMenu_header">{_t("common|home")}</div>}
            <IconizedContextMenuOptionList first>
                <IconizedContextMenuCheckbox
                    iconClassName="mx_SpacePanel_noIcon"
                    label={_t("settings|sidebar|metaspaces_home_all_rooms")}
                    active={allRoomsInHome}
                    onClick={() => {
                        onFinished();
                        SettingsStore.setValue("Spaces.allRoomsInHome", null, SettingLevel.ACCOUNT, !allRoomsInHome);
                    }}
                />
            </IconizedContextMenuOptionList>
        </IconizedContextMenu>
    );
};

interface IMetaSpaceButtonProps extends ComponentProps<typeof SpaceButton> {
    selected: boolean;
    isPanelCollapsed: boolean;
}

type MetaSpaceButtonProps = Pick<IMetaSpaceButtonProps, "selected" | "isPanelCollapsed">;

const MetaSpaceButton: React.FC<IMetaSpaceButtonProps> = ({ selected, isPanelCollapsed, size = "32px", ...props }) => {
    return (
        <li
            className={classNames("mx_SpaceItem", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={selected}
        >
            <SpaceButton {...props} selected={selected} isNarrow={isPanelCollapsed} size={size} />
        </li>
    );
};

const getHomeNotificationState = (): NotificationState => {
    return SpaceStore.instance.allRoomsInHome
        ? RoomNotificationStateStore.instance.globalState
        : SpaceStore.instance.getNotificationState(MetaSpace.Home);
};

const HomeButton: React.FC<MetaSpaceButtonProps> = ({ selected, isPanelCollapsed }) => {
    const allRoomsInHome = useEventEmitterState(SpaceStore.instance, UPDATE_HOME_BEHAVIOUR, () => {
        return SpaceStore.instance.allRoomsInHome;
    });
    const [notificationState, setNotificationState] = useState(getHomeNotificationState());
    const updateNotificationState = useCallback(() => {
        setNotificationState(getHomeNotificationState());
    }, []);
    useEffect(updateNotificationState, [updateNotificationState, allRoomsInHome]);
    useEventEmitter(RoomNotificationStateStore.instance, UPDATE_STATUS_INDICATOR, updateNotificationState);

    const onHomeClick = (): void => {
        SpaceStore.instance.setActiveSpace(MetaSpace.Home);
        RightPanelStore.instance.hide(null);
        defaultDispatcher.dispatch({ action: Action.LeaveGreatShops });
        // On mobile, show the room list when Home is clicked
        defaultDispatcher.dispatch({ action: "show_left_panel" });
    };

    return (
        <MetaSpaceButton
            spaceKey={MetaSpace.Home}
            className="mx_SpaceButton_home"
            selected={selected}
            isPanelCollapsed={isPanelCollapsed}
            label={_t("common|social")}
            notificationState={notificationState}
            ContextMenuComponent={HomeButtonContextMenu}
            contextMenuTooltip={_t("common|options")}
            size="32px"
            onClick={onHomeClick}
        />
    );
};

const FavouritesButton: React.FC<MetaSpaceButtonProps> = ({ selected, isPanelCollapsed }) => {
    const onFavouritesClick = (): void => {
        SpaceStore.instance.setActiveSpace(MetaSpace.Favourites);
        RightPanelStore.instance.hide(null);
    };

    return (
        <MetaSpaceButton
            spaceKey={MetaSpace.Favourites}
            className="mx_SpaceButton_favourites"
            selected={selected}
            isPanelCollapsed={isPanelCollapsed}
            label={getMetaSpaceName(MetaSpace.Favourites)}
            notificationState={SpaceStore.instance.getNotificationState(MetaSpace.Favourites)}
            size="32px"
            onClick={onFavouritesClick}
        />
    );
};

const PeopleButton: React.FC<MetaSpaceButtonProps> = ({ selected, isPanelCollapsed }) => {
    const onPeopleClick = (): void => {
        SpaceStore.instance.setActiveSpace(MetaSpace.People);
        RightPanelStore.instance.hide(null);
    };

    return (
        <MetaSpaceButton
            spaceKey={MetaSpace.People}
            className="mx_SpaceButton_people"
            selected={selected}
            isPanelCollapsed={isPanelCollapsed}
            label={getMetaSpaceName(MetaSpace.People)}
            notificationState={SpaceStore.instance.getNotificationState(MetaSpace.People)}
            size="32px"
            onClick={onPeopleClick}
        />
    );
};

const OrphansButton: React.FC<MetaSpaceButtonProps> = ({ selected, isPanelCollapsed }) => {
    const onOrphansClick = (): void => {
        SpaceStore.instance.setActiveSpace(MetaSpace.Orphans);
        RightPanelStore.instance.hide(null);
    };

    return (
        <MetaSpaceButton
            spaceKey={MetaSpace.Orphans}
            className="mx_SpaceButton_orphans"
            selected={selected}
            isPanelCollapsed={isPanelCollapsed}
            label={getMetaSpaceName(MetaSpace.Orphans)}
            notificationState={SpaceStore.instance.getNotificationState(MetaSpace.Orphans)}
            size="32px"
            onClick={onOrphansClick}
        />
    );
};

const VideoRoomsButton: React.FC<MetaSpaceButtonProps> = ({ selected, isPanelCollapsed }) => {
    const onVideoRoomsClick = (): void => {
        SpaceStore.instance.setActiveSpace(MetaSpace.VideoRooms);
        RightPanelStore.instance.hide(null);
    };

    return (
        <MetaSpaceButton
            spaceKey={MetaSpace.VideoRooms}
            className="mx_SpaceButton_videoRooms"
            selected={selected}
            isPanelCollapsed={isPanelCollapsed}
            label={getMetaSpaceName(MetaSpace.VideoRooms)}
            notificationState={SpaceStore.instance.getNotificationState(MetaSpace.VideoRooms)}
            size="32px"
            onClick={onVideoRoomsClick}
        />
    );
};

const CreateSpaceButton: React.FC<Pick<IInnerSpacePanelProps, "isPanelCollapsed" | "setPanelCollapsed">> = ({
    isPanelCollapsed,
    setPanelCollapsed,
}) => {
    const [menuDisplayed, handle, openMenu, closeMenu] = useContextMenu<HTMLDivElement>();

    useEffect(() => {
        if (!isPanelCollapsed && menuDisplayed) {
            closeMenu();
        }
    }, [isPanelCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps

    let contextMenu: JSX.Element | undefined;
    if (menuDisplayed) {
        contextMenu = <SpaceCreateMenu onFinished={closeMenu} />;
    }

    const onNewClick = menuDisplayed
        ? closeMenu
        : () => {
              if (!isPanelCollapsed) setPanelCollapsed(true);
              openMenu();
          };

    return (
        <li
            className={classNames("mx_SpaceItem mx_SpaceItem_new", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={false}
        >
            <SpaceButton
                data-testid="create-space-button"
                className={classNames("mx_SpaceButton_new", {
                    mx_SpaceButton_newCancel: menuDisplayed,
                })}
                label={menuDisplayed ? _t("action|cancel") : _t("create_space|label")}
                onClick={onNewClick}
                isNarrow={isPanelCollapsed}
                innerRef={handle}
                size="32px"
            />

            {contextMenu}
        </li>
    );
};

const CardToCardButton: React.FC<Pick<IInnerSpacePanelProps, "isPanelCollapsed">> = ({ isPanelCollapsed }) => {
    const currentCard = useEventEmitterState(
        RightPanelStore.instance,
        UPDATE_EVENT,
        () => RightPanelStore.instance.currentCard,
    );
    const isSelected = currentCard.phase === RightPanelPhases.CardToCard && RightPanelStore.instance.isOpen;

    const onCardToCardClick = (): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.CardToCard }, true, undefined);
    };

    return (
        <li
            className={classNames("mx_SpaceItem", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={isSelected}
        >
            <SpaceButton
                data-testid="card-to-card-button"
                className="mx_SpaceButton_cardToCard"
                label={_t("custom_panels|card_to_card")}
                onClick={onCardToCardClick}
                isNarrow={isPanelCollapsed}
                selected={isSelected}
                size="32px"
            />
        </li>
    );
};

const ChargePurchaseButton: React.FC<Pick<IInnerSpacePanelProps, "isPanelCollapsed">> = ({ isPanelCollapsed }) => {
    const currentCard = useEventEmitterState(
        RightPanelStore.instance,
        UPDATE_EVENT,
        () => RightPanelStore.instance.currentCard,
    );
    const isSelected = currentCard.phase === RightPanelPhases.ChargePurchase && RightPanelStore.instance.isOpen;

    const onChargePurchaseClick = (): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.ChargePurchase }, true, undefined);
    };

    return (
        <li
            className={classNames("mx_SpaceItem", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={isSelected}
        >
            <SpaceButton
                data-testid="charge-purchase-button"
                className="mx_SpaceButton_chargePurchase"
                label={_t("custom_panels|charge_purchase")}
                onClick={onChargePurchaseClick}
                isNarrow={isPanelCollapsed}
                selected={isSelected}
                size="32px"
            />
        </li>
    );
};

const BillPaymentButton: React.FC<Pick<IInnerSpacePanelProps, "isPanelCollapsed">> = ({ isPanelCollapsed }) => {
    const currentCard = useEventEmitterState(
        RightPanelStore.instance,
        UPDATE_EVENT,
        () => RightPanelStore.instance.currentCard,
    );
    const isSelected = currentCard.phase === RightPanelPhases.BillPayment && RightPanelStore.instance.isOpen;

    const onBillPaymentClick = (): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.BillPayment }, true, undefined);
    };

    return (
        <li
            className={classNames("mx_SpaceItem", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={isSelected}
        >
            <SpaceButton
                data-testid="bill-payment-button"
                className="mx_SpaceButton_billPayment"
                label={_t("custom_panels|bill_payment")}
                onClick={onBillPaymentClick}
                isNarrow={isPanelCollapsed}
                selected={isSelected}
                size="32px"
            />
        </li>
    );
};

const ServicesButton: React.FC<Pick<IInnerSpacePanelProps, "isPanelCollapsed">> = ({ isPanelCollapsed }) => {
    const currentCard = useEventEmitterState(
        RightPanelStore.instance,
        UPDATE_EVENT,
        () => RightPanelStore.instance.currentCard,
    );
    const phase = currentCard.phase;
    const isOpen = RightPanelStore.instance.isOpen;
    // Services tab stays selected when viewing service sub-pages (cards)
    const isSelected =
        isOpen &&
        (phase === RightPanelPhases.Services ||
            phase === RightPanelPhases.CardToCard ||
            phase === RightPanelPhases.ChargePurchase ||
            phase === RightPanelPhases.BillPayment);

    const onServicesClick = (): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.Services }, true, undefined);
        defaultDispatcher.dispatch({ action: "hide_left_panel" });
    };

    return (
        <li
            className={classNames("mx_SpaceItem", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={isSelected}
        >
            <SpaceButton
                data-testid="services-button"
                className="mx_SpaceButton_services"
                label={_t("custom_panels|services")}
                onClick={onServicesClick}
                isNarrow={isPanelCollapsed}
                selected={isSelected}
                size="32px"
            />
        </li>
    );
};

const AgricultureButton: React.FC<Pick<IInnerSpacePanelProps, "isPanelCollapsed">> = ({ isPanelCollapsed }) => {
    const currentCard = useEventEmitterState(
        RightPanelStore.instance,
        UPDATE_EVENT,
        () => RightPanelStore.instance.currentCard,
    );
    const isSelected = currentCard.phase === RightPanelPhases.Agriculture && RightPanelStore.instance.isOpen;

    const onAgricultureClick = (): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.Agriculture }, true, undefined);
        defaultDispatcher.dispatch({ action: "hide_left_panel" });
    };

    return (
        <li
            className={classNames("mx_SpaceItem", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={isSelected}
        >
            <SpaceButton
                data-testid="agriculture-button"
                className="mx_SpaceButton_agriculture"
                label={_t("custom_panels|agriculture")}
                onClick={onAgricultureClick}
                isNarrow={isPanelCollapsed}
                selected={isSelected}
                size="32px"
            />
        </li>
    );
};

const GreatShopsButton: React.FC<Pick<IInnerSpacePanelProps, "isPanelCollapsed"> & { selected: boolean }> = ({
    isPanelCollapsed,
    selected,
}) => {
    const onGreatShopsClick = (): void => {
        // Close any open custom section and make sure the left panel (shop list) is visible.
        RightPanelStore.instance.hide(null);
        defaultDispatcher.dispatch({ action: "show_left_panel" });
        defaultDispatcher.dispatch({ action: Action.ViewGreatShops });
    };

    return (
        <li
            className={classNames("mx_SpaceItem", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={selected}
        >
            <SpaceButton
                data-testid="great-shops-button"
                className="mx_SpaceButton_greatShops"
                label={_t("custom_panels|greatShops")}
                onClick={onGreatShopsClick}
                isNarrow={isPanelCollapsed}
                selected={selected}
                size="32px"
            />
        </li>
    );
};

const SettingsButton: React.FC<Pick<IInnerSpacePanelProps, "isPanelCollapsed">> = ({ isPanelCollapsed }) => {
    const onSettingsClick = (): void => {
        defaultDispatcher.dispatch({
            action: Action.ViewUserSettings,
        });
    };

    return (
        <li
            className={classNames("mx_SpaceItem", {
                collapsed: isPanelCollapsed,
            })}
            role="treeitem"
            aria-selected={false}
        >
            <SpaceButton
                className="mx_SpaceButton_settings"
                label=""
                onClick={onSettingsClick}
                isNarrow={isPanelCollapsed}
                selected={false}
                size="32px"
            />
        </li>
    );
};

const metaSpaceComponentMap: Record<MetaSpace, typeof HomeButton> = {
    [MetaSpace.Home]: HomeButton,
    [MetaSpace.Favourites]: FavouritesButton,
    [MetaSpace.People]: PeopleButton,
    [MetaSpace.Orphans]: OrphansButton,
    [MetaSpace.VideoRooms]: VideoRoomsButton,
};

interface IInnerSpacePanelProps extends DroppableProvidedProps {
    children?: ReactNode;
    isPanelCollapsed: boolean;
    setPanelCollapsed: Dispatch<SetStateAction<boolean>>;
    isDraggingOver: boolean;
    innerRef: RefCallback<HTMLElement>;
}

const ToggleRoomListButton: React.FC<{ isPanelCollapsed: boolean }> = ({ isPanelCollapsed }) => {
    const [isRoomListVisible, setRoomListVisible] = useState(() => window.innerWidth > 768);
    const visibleRef = useRef(window.innerWidth > 768);

    const applyVisibility = useCallback((visible: boolean) => {
        visibleRef.current = visible;
        setRoomListVisible(visible);
        const el = document.querySelector(".mx_LeftPanel_wrapper--user") as HTMLElement | null;
        if (el) {
            if (visible) {
                el.classList.remove("mx_LeftPanel_hidden");
            } else {
                el.classList.add("mx_LeftPanel_hidden");
            }
        }
    }, []);

    useEffect(() => {
        const onResize = (): void => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // On mobile, room list visibility is handled by Telegram-style
                // page switching (mx_MatrixChat_mobileShowRoomView class).
                // Always keep the room list element visible so CSS can control it.
                applyVisibility(true);
            } else {
                applyVisibility(true);
            }
        };
        window.addEventListener("resize", onResize);
        setTimeout(onResize, 300);
        return () => window.removeEventListener("resize", onResize);
    }, [applyVisibility]);

    const toggle = useCallback(() => {
        applyVisibility(!visibleRef.current);
    }, [applyVisibility]);

    return (
        <div
            className={classNames("mx_SpacePanel_toggleRoomListWrapper", {
                collapsed: isPanelCollapsed,
            })}
        >
            <AccessibleButton
                className={classNames("mx_SpacePanel_toggleRoomListBtn", {
                    mx_SpacePanel_toggleRoomListBtn_active: isRoomListVisible,
                })}
                onClick={toggle}
                title={isRoomListVisible ? _t("action|collapse") : _t("action|expand")}
            />
        </div>
    );
};

const CUSTOM_PHASES = [
    RightPanelPhases.Services,
    RightPanelPhases.Agriculture,
    RightPanelPhases.CardToCard,
    RightPanelPhases.ChargePurchase,
    RightPanelPhases.BillPayment,
];

// Optimisation based on https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md#recommended-droppable--performance-optimisation
const InnerSpacePanel = React.memo<IInnerSpacePanelProps>(
    ({ children, isPanelCollapsed, setPanelCollapsed, isDraggingOver, innerRef, ...props }) => {
        const [invites, metaSpaces, actualSpaces, activeSpace] = useSpaces();
        const activeSpaces = activeSpace ? [activeSpace] : [];

        const currentCard = useEventEmitterState(
            RightPanelStore.instance,
            UPDATE_EVENT,
            () => RightPanelStore.instance.currentCard,
        );
        const isCustomPanelOpen =
            RightPanelStore.instance.isOpen && CUSTOM_PHASES.includes(currentCard.phase as RightPanelPhases);

        // Track whether the Great Shops section is active so we can highlight its button
        // and deselect the meta-space buttons while it's open.
        const [greatShopsActive, setGreatShopsActive] = useState(false);
        useDispatcher(defaultDispatcher, (payload: ActionPayload) => {
            if (payload.action === Action.ViewGreatShops) setGreatShopsActive(true);
            else if (payload.action === Action.LeaveGreatShops || payload.action === Action.ViewRoom)
                setGreatShopsActive(false);
        });
        useEffect(() => {
            if (isCustomPanelOpen) setGreatShopsActive(false);
        }, [isCustomPanelOpen]);

        const moduleSpaceItems = useModuleSpacePanelItems(ModuleApi.instance.extras);

        const metaSpacesSection = metaSpaces
            .filter((key) => !(key === MetaSpace.VideoRooms && !SettingsStore.getValue("feature_video_rooms")))
            .map((key) => {
                const Component = metaSpaceComponentMap[key];
                return (
                    <Component
                        key={key}
                        selected={!isCustomPanelOpen && !greatShopsActive && activeSpace === key}
                        isPanelCollapsed={isPanelCollapsed}
                    />
                );
            });

        return (
            <>
                <IndicatorScrollbar
                    {...props}
                    wrappedRef={innerRef}
                    className="mx_SpaceTreeLevel"
                    style={
                        isDraggingOver
                            ? {
                                  pointerEvents: "none",
                              }
                            : undefined
                    }
                    element="ul"
                    role="tree"
                    aria-label={_t("common|spaces")}
                >
                    <AgricultureButton isPanelCollapsed={isPanelCollapsed} />
                    <GreatShopsButton isPanelCollapsed={isPanelCollapsed} selected={greatShopsActive} />
                    {metaSpacesSection}
                    {invites.map((s) => (
                        <SpaceItem
                            key={s.roomId}
                            space={s}
                            activeSpaces={activeSpaces}
                            isPanelCollapsed={isPanelCollapsed}
                            onExpand={() => setPanelCollapsed(false)}
                        />
                    ))}
                    {actualSpaces.map((s, i) => (
                        <Draggable key={s.roomId} draggableId={s.roomId} index={i}>
                            {(provided, snapshot) => (
                                <SpaceItem
                                    {...provided.draggableProps}
                                    dragHandleProps={provided.dragHandleProps}
                                    key={s.roomId}
                                    innerRef={provided.innerRef}
                                    className={snapshot.isDragging ? "mx_SpaceItem_dragging" : undefined}
                                    space={s}
                                    activeSpaces={activeSpaces}
                                    isPanelCollapsed={isPanelCollapsed}
                                    onExpand={() => setPanelCollapsed(false)}
                                />
                            )}
                        </Draggable>
                    ))}
                    {children}
                    {moduleSpaceItems.map((item) => (
                        <li
                            key={item.spaceKey}
                            className={classNames("mx_SpaceItem", {
                                collapsed: isPanelCollapsed,
                            })}
                            role="treeitem"
                            aria-selected={false} // TODO
                        >
                            <SpaceButton
                                {...item}
                                isNarrow={isPanelCollapsed}
                                size="32px"
                                selected={activeSpace === item.spaceKey}
                                onClick={() => {
                                    SpaceStore.instance.setActiveSpace(item.spaceKey);
                                    item.onSelected?.();
                                }}
                            />
                        </li>
                    ))}
                    {/* {shouldShowComponent(UIComponent.CreateSpaces) && (
                    <CreateSpaceButton isPanelCollapsed={isPanelCollapsed} setPanelCollapsed={setPanelCollapsed} />
                )} */}
                    <ServicesButton isPanelCollapsed={isPanelCollapsed} />
                    {/* <CardToCardButton isPanelCollapsed={isPanelCollapsed} />
                <ChargePurchaseButton isPanelCollapsed={isPanelCollapsed} />
                <BillPaymentButton isPanelCollapsed={isPanelCollapsed} /> */}
                </IndicatorScrollbar>
                <SettingsButton isPanelCollapsed={isPanelCollapsed} />
            </>
        );
    },
);

const SpacePanel: React.FC = () => {
    const [dragging, setDragging] = useState(false);
    const [isPanelCollapsed, setPanelCollapsed] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (SdkContextClass.instance.roomViewStore.getRoomId()) return;
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.Agriculture }, true);
    }, []);

    useLayoutEffect(() => {
        if (ref.current) UIStore.instance.trackElementDimensions("SpacePanel", ref.current);
        return () => UIStore.instance.stopTrackingElementDimensions("SpacePanel");
    }, []);

    useDispatcher(defaultDispatcher, (payload: ActionPayload) => {
        if (payload.action === Action.ToggleSpacePanel) {
            setPanelCollapsed(!isPanelCollapsed);
        }
    });

    const newRoomListEnabled = useSettingValue("feature_new_room_list");

    return (
        <RovingTabIndexProvider handleHomeEnd handleUpDown={!dragging}>
            {({ onKeyDownHandler, onDragEndHandler }) => (
                <DragDropContext
                    onDragStart={() => {
                        setDragging(true);
                    }}
                    onDragEnd={(result) => {
                        setDragging(false);
                        if (!result.destination) return; // dropped outside the list
                        SpaceStore.instance.moveRootSpace(result.source.index, result.destination.index);
                        onDragEndHandler();
                    }}
                >
                    <ReleaseAnnouncement
                        feature="newNotificationSounds"
                        header={_t("settings|notifications|sounds_release_announcement|title")}
                        description={_t("settings|notifications|sounds_release_announcement|description")}
                        closeLabel={_t("action|ok")}
                        displayArrow={false}
                        placement="right-start"
                    >
                        <nav
                            className={classNames("mx_SpacePanel", {
                                collapsed: isPanelCollapsed,
                                newUi: newRoomListEnabled,
                            })}
                            onKeyDown={(ev) => {
                                const navAction = getKeyBindingsManager().getNavigationAction(ev);
                                if (
                                    navAction === KeyBindingAction.NextLandmark ||
                                    navAction === KeyBindingAction.PreviousLandmark
                                ) {
                                    LandmarkNavigation.findAndFocusNextLandmark(
                                        Landmark.ACTIVE_SPACE_BUTTON,
                                        navAction === KeyBindingAction.PreviousLandmark,
                                    );
                                    ev.stopPropagation();
                                    ev.preventDefault();
                                    return;
                                }
                                onKeyDownHandler(ev);
                            }}
                            ref={ref}
                            aria-label={_t("common|spaces")}
                        >
                            {/* <ToggleRoomListButton isPanelCollapsed={isPanelCollapsed} /> */}
                            <UserMenu isPanelCollapsed={isPanelCollapsed}>
                                {/* <AccessibleButton
                                    className={classNames("mx_SpacePanel_toggleCollapse", {
                                        expanded: !isPanelCollapsed,
                                    })}
                                    onClick={() => setPanelCollapsed(!isPanelCollapsed)}
                                    title={isPanelCollapsed ? _t("action|expand") : _t("action|collapse")}
                                    caption={
                                        <KeyboardShortcut
                                            value={{ ctrlOrCmdKey: true, shiftKey: true, key: "d" }}
                                            className="mx_SpacePanel_Tooltip_KeyboardShortcut"
                                        />
                                    }
                                /> */}
                            </UserMenu>
                            <Droppable droppableId="top-level-spaces">
                                {(provided, snapshot) => (
                                    <InnerSpacePanel
                                        {...provided.droppableProps}
                                        isPanelCollapsed={isPanelCollapsed}
                                        setPanelCollapsed={setPanelCollapsed}
                                        isDraggingOver={snapshot.isDraggingOver}
                                        innerRef={provided.innerRef}
                                    >
                                        {provided.placeholder}
                                    </InnerSpacePanel>
                                )}
                            </Droppable>

                            {/* <ThreadsActivityCentre displayButtonLabel={!isPanelCollapsed} /> */}

                            {/* <QuickSettingsButton isPanelCollapsed={isPanelCollapsed} /> */}
                        </nav>
                    </ReleaseAnnouncement>
                </DragDropContext>
            )}
        </RovingTabIndexProvider>
    );
};

export default SpacePanel;
