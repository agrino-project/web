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

interface Props {
    desktopLayout: ReactNode;
    chatListElement: ReactNode;
    chatRoomElement: ReactNode;
    pageType?: string;
    currentRoomId: string | null;
    /** Single state from LoggedInView that tells us what desktop is showing */
    desktopPage: string;
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
        if (props.pageType === PageTypes.RoomView && props.currentRoomId && currentPage !== "chatRoom") {
            navigate("chatRoom");
        }
    }, [isMobile, props.pageType, props.currentRoomId, props.desktopPage]); // eslint-disable-line react-hooks/exhaustive-deps

    useDispatcher(defaultDispatcher, (payload) => {
        if (!isMobile) return;
        if (payload.action === Action.ViewRoom && payload.room_id) {
            navigate("chatRoom");
        } else if (payload.action === Action.ViewGreatShops) {
            navigate("greatShops");
        } else if (payload.action === Action.ViewGreatShopPage) {
            navigate("greatShopForm");
        }
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
