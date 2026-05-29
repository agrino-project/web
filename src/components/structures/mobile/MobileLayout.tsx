/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type ReactNode } from "react";

import { useMobileNav } from "./MobileNavContext";
import MobileBottomNav from "../../views/spaces/MobileBottomNav";
import ServicesPage from "../../views/services/ServicesPage";
import AgriculturePage from "../../views/agriculture/AgriculturePage";
import CardToCardCard from "../../views/right_panel/CardToCardCard";
import ChargePurchaseCard from "../../views/right_panel/ChargePurchaseCard";
import BillPaymentCard from "../../views/right_panel/BillPaymentCard";

import "../../../../res/css/structures/mobile/_MobileLayout.pcss";
import RightPanelStore from "../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../stores/right-panel/RightPanelStorePhases";

interface MobileLayoutProps {
    /** The chat list (LeftPanel) to show on the chatList page */
    chatListElement: ReactNode;
    /** The room view / home page to show on the chatRoom page */
    chatRoomElement: ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ chatListElement, chatRoomElement }) => {
    const { currentPage, goBack } = useMobileNav();

    let content: ReactNode;
    switch (currentPage) {
        case "chatList":
            content = <div className="mx_MobileLayout_page">{chatListElement}</div>;
            break;
        case "chatRoom":
            content = <div className="mx_MobileLayout_page">{chatRoomElement}</div>;
            break;
        case "services":
            content = (
                <div className="mx_MobileLayout_page mx_MobileLayout_page--scrollable">
                    <ServicesPage />
                </div>
            );
            break;
        case "agriculture":
            content = (
                <div className="mx_MobileLayout_page mx_MobileLayout_page--scrollable">
                    <AgriculturePage />
                </div>
            );
            break;
        case "cardToCard":
            content = (
                <div className="mx_MobileLayout_page mx_MobileLayout_page--scrollable">
                    <CardToCardCard
                        onClose={(): void => {
                            RightPanelStore.instance.setCard({
                                phase: RightPanelPhases.Services,
                            });
                        }}
                    />
                </div>
            );
            break;
        case "chargePurchase":
            content = (
                <div className="mx_MobileLayout_page mx_MobileLayout_page--scrollable">
                    <ChargePurchaseCard
                        onClose={(): void => {
                            RightPanelStore.instance.setCard({
                                phase: RightPanelPhases.Services,
                            });
                        }}
                    />
                </div>
            );
            break;
        case "billPayment":
            content = (
                <div className="mx_MobileLayout_page mx_MobileLayout_page--scrollable">
                    <BillPaymentCard
                        onClose={(): void => {
                            RightPanelStore.instance.setCard({
                                phase: RightPanelPhases.Services,
                            });
                        }}
                    />
                </div>
            );
            break;
    }

    return (
        <div className="mx_MobileLayout">
            <div className="mx_MobileLayout_content">{content}</div>
            <MobileBottomNav />
        </div>
    );
};

export default MobileLayout;
