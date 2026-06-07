import React from "react";

import { _t } from "../../../../../languageHandler";
import { useMobileNav } from "../../../../structures/mobile/MobileNavContext";
import defaultDispatcher from "../../../../../dispatcher/dispatcher";
import { Action } from "../../../../../dispatcher/actions";

export const greatShopWrapperStyle: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100%" };

export function GreatShopsHeader({ title }: { title: string }) {
    const { navigate } = useMobileNav();

    const onBack = (): void => {
        // Clear the form state and return to the shop selection grid (chat list).
        // The chat list is unmounted while the form is shown, so its primary filter
        // state is lost; re-activate the Great Shops filter (dispatched async, it
        // arrives after the chat list re-mounts) so we land back on the shop grid
        // rather than the regular chat list.
        defaultDispatcher.dispatch({ action: Action.ClearGreatShopPage });
        navigate("chatList");
        defaultDispatcher.dispatch({ action: Action.ActivateGreatShopsFilter });
    };

    return (
        <div
            style={{
                position: "relative",
                fontWeight: "bold",
                color: "#6b7280",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderBottom: "1px solid #e6e6e6",
                height: 76,
            }}
        >
            <button
                className="mx_RoomHeader_mobileBackButton"
                onClick={onBack}
                aria-label={_t("action|back")}
                style={{ position: "absolute", insetInlineStart: 16 }}
            >
                <div className="mx_RoomHeader_mobileBackIcon" />
            </button>
            {title}
        </div>
    );
}
