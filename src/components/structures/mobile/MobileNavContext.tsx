/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

export type MobilePage =
    | "chatList"
    | "chatRoom"
    | "services"
    | "agriculture"
    | "cardToCard"
    | "chargePurchase"
    | "billPayment";

export type MobileTab = "chat" | "agriculture" | "services";

/** Pages that are "sub-pages" opened from a parent tab */
const SUB_PAGES: Set<MobilePage> = new Set(["cardToCard", "chargePurchase", "billPayment"]);

interface MobileNavState {
    currentPage: MobilePage;
    activeTab: MobileTab;
    navigate: (page: MobilePage) => void;
    goBack: () => void;
}

const MobileNavContext = createContext<MobileNavState>({
    currentPage: "chatList",
    activeTab: "chat",
    navigate: () => {},
    goBack: () => {},
});

export const useMobileNav = (): MobileNavState => useContext(MobileNavContext);

function getTabForPage(page: MobilePage, parentTab: MobileTab): MobileTab {
    // Sub-pages inherit the tab of their parent
    if (SUB_PAGES.has(page)) return parentTab;
    switch (page) {
        case "chatList":
            return "chat";
        case "services":
            return "services";
        case "agriculture":
            return "agriculture";
        default:
            return "chat";
    }
}

/** Map a tab to its root page */
function rootPageForTab(tab: MobileTab): MobilePage {
    switch (tab) {
        case "chat": return "chatList";
        case "services": return "services";
        case "agriculture": return "agriculture";
    }
}

export const MobileNavProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState<MobilePage>("agriculture");
    // Track which tab the user was on before navigating to a sub-page
    const parentTabRef = useRef<MobileTab>("chat");

    const navigate = useCallback((page: MobilePage) => {
        // When navigating to a top-level tab page, update the parent tab
        if (!SUB_PAGES.has(page)) {
            switch (page) {
                case "chatList":
                case "chatRoom":
                    parentTabRef.current = "chat"; break;
                case "services": parentTabRef.current = "services"; break;
                case "agriculture": parentTabRef.current = "agriculture"; break;
            }
        }
        setCurrentPage(page);
    }, []);

    const goBack = useCallback(() => {
        // Go back to the root page of the parent tab
        setCurrentPage(rootPageForTab(parentTabRef.current));
    }, []);

    const activeTab = getTabForPage(currentPage, parentTabRef.current);

    return (
        <MobileNavContext.Provider value={{ currentPage, activeTab, navigate, goBack }}>
            {children}
        </MobileNavContext.Provider>
    );
};
