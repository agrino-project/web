/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type ReactNode, useEffect } from "react";

import { useIsMobile } from "../../../hooks/useMobileCheck";
import { MobileNavProvider, useMobileNav } from "./MobileNavContext";
import MobileLayout from "./MobileLayout";
import PageTypes from "../../../PageTypes";
import defaultDispatcher from "../../../dispatcher/dispatcher";
import { Action } from "../../../dispatcher/actions";
import { useDispatcher } from "../../../hooks/useDispatcher";
import { useEventEmitter } from "../../../hooks/useEventEmitter";
import RightPanelStore from "../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../stores/right-panel/RightPanelStorePhases";
import { UPDATE_EVENT } from "../../../stores/AsyncStore";

interface Props {
    desktopLayout: ReactNode;
    chatListElement: ReactNode;
    chatRoomElement: ReactNode;
    pageType?: string;
    currentRoomId: string | null;
    /** Single state from LoggedInView that tells us what desktop is showing */
    desktopPage: string;
}

/** The mobile page the GreatShops card maps to, or null when the card is not open. */
function greatShopsPage(): "greatShops" | "greatShopForm" | null {
    const card = RightPanelStore.instance.currentCard;
    if (!RightPanelStore.instance.isOpen || card.phase !== RightPanelPhases.GreatShops) return null;
    return card.state?.greatShopPage ? "greatShopForm" : "greatShops";
}

/**
 * Syncs desktop state changes to mobile nav context.
 */
const MobileNavSync: React.FC<Props> = (props) => {
    const { navigate, currentPage } = useMobileNav();
    const isMobile = useIsMobile();

    // Sync store-initiated navigation to mobile nav (only when opening)
    useEffect(() => {
        if (!isMobile) return;
        // GreatShops lives in RightPanelStore, not desktopPage. When resizing into mobile while it's
        // open, the store emits no event, so sync it here and let it take priority over the room view.
        const shopsPage = greatShopsPage();
        if (shopsPage) {
            if (currentPage !== shopsPage) navigate(shopsPage);
            return;
        }
        const dp = props.desktopPage;
        if (dp === "services" && currentPage !== "services") navigate("services");
        else if (dp === "agriculture" && currentPage !== "agriculture") navigate("agriculture");
        else if (dp === "cardToCard" && currentPage !== "cardToCard") navigate("cardToCard");
        else if (dp === "chargePurchase" && currentPage !== "chargePurchase") navigate("chargePurchase");
        else if (dp === "billPayment" && currentPage !== "billPayment") navigate("billPayment");
    }, [isMobile, props.desktopPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync room navigation
    useEffect(() => {
        if (!isMobile) return;
        if (props.desktopPage !== "default") return;
        // Don't hijack the nav to the room view while GreatShops is the active section.
        if (greatShopsPage()) return;
        if (props.pageType === PageTypes.RoomView && props.currentRoomId && currentPage !== "chatRoom") {
            navigate("chatRoom");
        }
    }, [isMobile, props.pageType, props.currentRoomId, props.desktopPage]); // eslint-disable-line react-hooks/exhaustive-deps

    useDispatcher(defaultDispatcher, (payload) => {
        if (!isMobile) return;
        if (payload.action === Action.ViewRoom && payload.room_id) {
            navigate("chatRoom");
        }
    });

    // Mirror GreatShops phase transitions into mobile nav.
    useEventEmitter(RightPanelStore.instance, UPDATE_EVENT, () => {
        if (!isMobile) return;
        const shopsPage = greatShopsPage();
        if (shopsPage) navigate(shopsPage);
    });

    if (!isMobile) {
        return <>{props.desktopLayout}</>;
    }

    return <MobileLayout chatListElement={props.chatListElement} chatRoomElement={props.chatRoomElement} />;
};

const MobileAwareLayout: React.FC<Props> = (props) => {
    return (
        <MobileNavProvider>
            <MobileNavSync {...props} />
        </MobileNavProvider>
    );
};

export default MobileAwareLayout;
