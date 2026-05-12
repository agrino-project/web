import React from "react";
import classNames from "classnames";

import SdkConfig from "../../../SdkConfig";

interface IProps {
    addBlur?: boolean;
}

export default class AuthPage extends React.PureComponent<React.PropsWithChildren<IProps>> {
    private static welcomeBackgroundUrl?: string;

    private static getWelcomeBackgroundUrl(): string {
        if (AuthPage.welcomeBackgroundUrl) return AuthPage.welcomeBackgroundUrl;

        const brandingConfig = SdkConfig.getObject("branding");
        AuthPage.welcomeBackgroundUrl = "themes/element/img/backgrounds/lake.jpg";

        const configuredUrl = brandingConfig?.get("welcome_background_url");
        if (configuredUrl) {
            if (Array.isArray(configuredUrl)) {
                const index = Math.floor(Math.random() * configuredUrl.length);
                AuthPage.welcomeBackgroundUrl = configuredUrl[index];
            } else {
                AuthPage.welcomeBackgroundUrl = configuredUrl;
            }
        }

        return AuthPage.welcomeBackgroundUrl;
    }

    public render(): React.ReactElement {
        const modalClasses = classNames({
            mx_AuthPage_modal: true,
            mx_AuthPage_modal_withBlur: this.props.addBlur !== false,
        });

        return (
            <div className="mx_AuthPage">
                <div className={modalClasses}>
                    <div
                        className="mx_AuthPage_imageSection"
                        style={{ backgroundImage: `url(${AuthPage.getWelcomeBackgroundUrl()})` }}
                    />
                    <div className="mx_AuthPage_formSection">{this.props.children}</div>
                </div>
            </div>
        );
    }
}
