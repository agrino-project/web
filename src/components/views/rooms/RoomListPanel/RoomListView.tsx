/*
 * Copyright 2025 New Vector Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import React, { type JSX } from "react";

import { useRoomListViewModel } from "../../../viewmodels/roomlist/RoomListViewModel";
import { RoomList } from "./RoomList";
import { EmptyRoomList } from "./EmptyRoomList";
import { RoomListPrimaryFilters } from "./RoomListPrimaryFilters";
import { _t } from "../../../../languageHandler";
import { ReleaseAnnouncement } from "../../../structures/ReleaseAnnouncement";
import { GreatShopsView } from "./GreatShopsView";
import { useEventEmitterState } from "../../../../hooks/useEventEmitter";
import RightPanelStore from "../../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../../stores/right-panel/RightPanelStorePhases";
import { UPDATE_EVENT } from "../../../../stores/AsyncStore";

/**
 * Host the room list and the (future) room filters
 */
export function RoomListView(): JSX.Element {
    const vm = useRoomListViewModel();
    const isRoomListEmpty = vm.roomsResult.rooms.length === 0;
    const { greatShopsActive, greatShopPage } = useEventEmitterState(
        RightPanelStore.instance,
        UPDATE_EVENT,
        () => {
            const card = RightPanelStore.instance.currentCard;
            const active = RightPanelStore.instance.isOpen && card.phase === RightPanelPhases.GreatShops;
            return { greatShopsActive: active, greatShopPage: active ? card.state?.greatShopPage ?? null : null };
        },
    );
    let listBody;
    if (greatShopsActive) {
        listBody = <GreatShopsView />;
    } else if (vm.isLoadingRooms) {
        listBody = <div className="mx_RoomListSkeleton" />;
    } else if (isRoomListEmpty) {
        listBody = <EmptyRoomList vm={vm} />;
    } else {
        listBody = <RoomList vm={vm} greatShopPage={greatShopPage} />;
    }
    return (
        <>
            {!greatShopsActive && (
                <ReleaseAnnouncement
                    feature="newRoomList_filter"
                    header={_t("room_list|release_announcement|filter|title")}
                    description={_t("room_list|release_announcement|filter|description")}
                    closeLabel={_t("room_list|release_announcement|next")}
                    placement="right"
                >
                    <div>
                        <RoomListPrimaryFilters vm={vm} />
                    </div>
                </ReleaseAnnouncement>
            )}
            {listBody}
        </>
    );
}
