/*
Copyright 2024 New Vector Ltd.
Copyright 2020 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX } from "react";
import { useContext, useState } from "react";

import AutoHideScrollbar from "./AutoHideScrollbar";
import { getHomePageUrl } from "../../utils/pages";
import { _t, _tDom } from "../../languageHandler";
import SdkConfig from "../../SdkConfig";
import dis from "../../dispatcher/dispatcher";
import { Action } from "../../dispatcher/actions";
import BaseAvatar from "../views/avatars/BaseAvatar";
import { OwnProfileStore } from "../../stores/OwnProfileStore";
import AccessibleButton, { type ButtonEvent } from "../views/elements/AccessibleButton";
import { UPDATE_EVENT } from "../../stores/AsyncStore";
import { useEventEmitter } from "../../hooks/useEventEmitter";
import MatrixClientContext, { useMatrixClientContext } from "../../contexts/MatrixClientContext";
import MiniAvatarUploader, { AVATAR_SIZE } from "../views/elements/MiniAvatarUploader";
import PosthogTrackers from "../../PosthogTrackers";
import EmbeddedPage from "./EmbeddedPage";

const onClickSendDm = (ev: ButtonEvent): void => {
    PosthogTrackers.trackInteraction("WebHomeCreateChatButton", ev);
    dis.dispatch({ action: Action.CreateChat });
};

const onClickExplore = (ev: ButtonEvent): void => {
    PosthogTrackers.trackInteraction("WebHomeExploreRoomsButton", ev);
    dis.fire(Action.ViewRoomDirectory);
};

const onClickNewRoom = (ev: ButtonEvent): void => {
    PosthogTrackers.trackInteraction("WebHomeCreateRoomButton", ev);
    dis.dispatch({ action: Action.CreateRoom });
};

interface IProps {
    justRegistered?: boolean;
}

const getOwnProfile = (
    userId: string,
): {
    displayName: string;
    avatarUrl?: string;
} => ({
    displayName: OwnProfileStore.instance.displayName || userId,
    avatarUrl: OwnProfileStore.instance.getHttpAvatarUrl(parseInt(AVATAR_SIZE, 10)) ?? undefined,
});

// const UserWelcomeTop: React.FC = () => {
//     const cli = useContext(MatrixClientContext);
//     const userId = cli.getUserId()!;
//     const [ownProfile, setOwnProfile] = useState(getOwnProfile(userId));
//     useEventEmitter(OwnProfileStore.instance, UPDATE_EVENT, () => {
//         setOwnProfile(getOwnProfile(userId));
//     });

//     return (
//         <div>
//             <MiniAvatarUploader
//                 hasAvatar={!!ownProfile.avatarUrl}
//                 hasAvatarLabel={_t("onboarding|has_avatar_label")}
//                 noAvatarLabel={_t("onboarding|no_avatar_label")}
//                 setAvatarUrl={(url) => cli.setAvatarUrl(url)}
//                 isUserAvatar
//                 onClick={(ev) => PosthogTrackers.trackInteraction("WebHomeMiniAvatarUploadButton", ev)}
//             >
//                 <BaseAvatar
//                     idName={userId}
//                     name={ownProfile.displayName}
//                     url={ownProfile.avatarUrl}
//                     size={AVATAR_SIZE}
//                 />
//             </MiniAvatarUploader>

//             <h1>{_tDom("onboarding|welcome_user", { name: ownProfile.displayName })}</h1>
//             <h2>{_tDom("onboarding|welcome_detail")}</h2>
//         </div>
//     );
// };

const DmIcon = () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    </svg>
);

const ExploreIcon = () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
);

const RoomIcon = () => (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
);

const HomePage: React.FC<IProps> = ({ justRegistered = false }) => {
    const cli = useMatrixClientContext();
    const config = SdkConfig.get();
    const pageUrl = getHomePageUrl(config, cli);

    if (pageUrl) {
        return <EmbeddedPage className="mx_HomePage" url={pageUrl} scrollbar={true} />;
    }

    let introSection: JSX.Element;
    // if (justRegistered || !OwnProfileStore.instance.getHttpAvatarUrl(parseInt(AVATAR_SIZE, 10))) {
    //     introSection = <UserWelcomeTop />;
    // } else {
        const brandingConfig = SdkConfig.getObject("branding");
        const logoUrl = brandingConfig?.get("auth_header_logo_url") ?? "themes/element/img/logos/element-logo.svg";

        introSection = (
            <React.Fragment>
                <img src={logoUrl} alt={config.brand} />
                <h1>{_tDom("onboarding|intro_welcome", { appName: config.brand })}</h1>
                <h2>{_tDom("onboarding|intro_byline")}</h2>
            </React.Fragment>
        );
    // }

    return (
        <AutoHideScrollbar className="mx_HomePage mx_HomePage_default" element="main">
            <div className="mx_HomePage_default_wrapper">
                {introSection}
                <div className="mx_HomePage_default_buttons">
                    <AccessibleButton onClick={onClickSendDm} className="mx_HomePage_button_sendDm">
                        <div className="mx_IconBox">
                            <DmIcon />
                        </div>
                        <div className="mx_TextWrapper">
                            <div className="mx_CardText">{_tDom("onboarding|send_dm")}</div>
                            <div className="mx_CardSubtext">کلمه بنویسید یا عکس اضافه کنید</div>
                        </div>
                    </AccessibleButton>

                    <AccessibleButton onClick={onClickNewRoom} className="mx_HomePage_button_createGroup">
                        <div className="mx_IconBox">
                            <RoomIcon />
                        </div>
                        <div className="mx_TextWrapper">
                            <div className="mx_CardText">{_tDom("onboarding|create_room")}</div>
                            <div className="mx_CardSubtext">گروه جدید بسازید</div>
                        </div>
                    </AccessibleButton>

                    <AccessibleButton onClick={onClickExplore} className="mx_HomePage_button_explore">
                        <div className="mx_IconBox">
                            <ExploreIcon />
                        </div>
                        <div className="mx_TextWrapper">
                            <div className="mx_CardText">{_tDom("onboarding|explore_rooms")}</div>
                            <div className="mx_CardSubtext">جستجوی موضوعات جدید</div>
                        </div>
                    </AccessibleButton>
                </div>
            </div>
        </AutoHideScrollbar>
    );
};

export default HomePage;
