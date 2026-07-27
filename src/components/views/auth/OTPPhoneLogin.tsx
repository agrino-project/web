/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX, type SyntheticEvent } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { _t } from "../../../languageHandler";
import { type ValidatedServerConfig } from "../../../utils/ValidatedServerConfig";
import AccessibleButton, { type ButtonEvent } from "../elements/AccessibleButton";
import Field from "../elements/Field";
import Spinner from "../elements/Spinner";
import { OTPAuth, type OTPRequestResponse } from "../../../utils/OTPAuth";

// For validating phone numbers without country codes
const PHONE_NUMBER_REGEX = /^[0-9۰-۹٠-٩+\-\s()]*$/;

const normalizeNumbers = (value: string): string => {
    return value
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
        .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

interface IProps {
    serverConfig: ValidatedServerConfig;
    disableSubmit?: boolean;
    busy?: boolean;

    onPhoneNumberChanged?(phoneNumber: string): void;
    onOTPRequested(phoneNumber: string): void;
    onBack(): void;
}

interface IState {
    phoneNumber: string;
    phoneNumberValid: boolean;
    requestingOTP: boolean;
    errorMessage?: string;
}

export default class OTPPhoneLogin extends React.Component<IProps, IState> {
    private phoneNumberFieldRef: React.RefObject<Field> = React.createRef();

    public constructor(props: IProps) {
        super(props);

        this.state = {
            phoneNumber: "",
            phoneNumberValid: false,
            requestingOTP: false,
        };
    }

    private onPhoneNumberChange = (ev: SyntheticEvent<HTMLInputElement>): void => {
        const phoneNumber = normalizeNumbers(ev.currentTarget.value);
        const phoneNumberValid = PHONE_NUMBER_REGEX.test(phoneNumber) && phoneNumber.length > 0;

        this.setState({
            phoneNumber,
            phoneNumberValid,
            errorMessage: undefined,
        });

        this.props.onPhoneNumberChanged?.(phoneNumber);
    };

    private onSubmit = async (ev: SyntheticEvent): Promise<void> => {
        ev.preventDefault();

        if (!this.state.phoneNumberValid || this.state.requestingOTP) {
            return;
        }

        this.setState({
            requestingOTP: true,
            errorMessage: undefined,
        });

        try {
            const response: OTPRequestResponse = await OTPAuth.requestOTP(
                this.props.serverConfig.hsUrl,
                normalizeNumbers(this.state.phoneNumber),
            );

            if (response.success) {
                this.props.onOTPRequested(normalizeNumbers(this.state.phoneNumber));
            } else {
                this.setState({
                    errorMessage: response.message || _t("auth|otp_request_failed"),
                });
            }
        } catch (error) {
            logger.error("OTP request failed:", error);
            this.setState({
                errorMessage: _t("auth|otp_request_failed"),
            });
        } finally {
            this.setState({
                requestingOTP: false,
            });
        }
    };

    private onBackClick = (ev: ButtonEvent): void => {
        ev.preventDefault();
        this.props.onBack();
    };

    private renderAlternativeLoginOptions = (): JSX.Element => {
        return (
            <div className="mx_Login_alternativeOptions">
                <div className="mx_Login_separator">
                    <span>{_t("auth|or")}</span>
                </div>
                <div className="mx_Login_sso_container">
                    <AccessibleButton kind="primary_outline" className="mx_Login_sso_btn" onClick={() => {}}>
                        <img
                            src={require("../../../../res/img/mygov.png")}
                            alt="دولت من"
                            className="mx_Login_sso_icon"
                        />
                        <span>دولت من</span>
                    </AccessibleButton>

                    <AccessibleButton kind="primary_outline" className="mx_Login_sso_btn" onClick={() => {}}>
                        <img
                            src={require("../../../../res/img/google.svg").default}
                            alt="Google"
                            className="mx_Login_sso_icon"
                        />
                        <span>گوگل</span>
                    </AccessibleButton>
                </div>
            </div>
        );
    };

    public render(): JSX.Element {
        const { phoneNumber, phoneNumberValid, requestingOTP, errorMessage } = this.state;

        let submitButtonOrSpinner: JSX.Element;
        if (requestingOTP) {
            submitButtonOrSpinner = <Spinner />;
        } else {
            submitButtonOrSpinner = (
                <AccessibleButton
                    type="submit"
                    kind="primary_sm"
                    style={{ fontSize: "14px" }}
                    disabled={!phoneNumberValid || this.props.disableSubmit}
                    onClick={this.onSubmit}
                >
                    {_t("auth|send_otp")}
                </AccessibleButton>
            );
        }

        return (
            <div>
                <h1 className="mx_AuthBody_title">به آگرینو خوش آمدید.</h1>

                <div className="mx_AuthBody_subtitle">
                    اولین سامانه تخصصی تقویت شده با هوش مصنوعی بانک کشاورزی ایران.
                </div>
                <form onSubmit={this.onSubmit}>
                    <p style={{ margin: "0 0 4px 0" }}>{_t("auth|phone_number_label")}</p>
                    <div className="mx_AuthBody_fieldRow">
                        <Field
                            name="phoneNumber"
                            ref={this.phoneNumberFieldRef}
                            type="text"
                            placeholder={_t("auth|phone_number_placeholder")}
                            value={phoneNumber}
                            onChange={this.onPhoneNumberChange}
                            disabled={requestingOTP}
                            autoFocus
                        />
                    </div>

                    {errorMessage && <div className="mx_AuthBody_error">{errorMessage}</div>}

                    <div className="mx_AuthBody_buttons">
                        {/*<AccessibleButton
                            kind="link"
                            onClick={this.onBackClick}
                            disabled={requestingOTP}
                        >
                            {_t("action|back")}
                        </AccessibleButton>*/}

                        {submitButtonOrSpinner}
                    </div>
                </form>

                <div className="mx_AuthBody_adminLogin">
                    <div className="mx_AuthBody_adminLogin_title">{_t("auth|admin_login")}</div>
                    <a
                        className="mx_AuthBody_adminLogin_link"
                        href="https://bots.agridemo.ir/admin"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {_t("auth|admin_login_bots")}
                    </a>
                    <a
                        className="mx_AuthBody_adminLogin_link"
                        href="https://forms.agridemo.ir/admin"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {_t("auth|admin_login_forms")}
                    </a>
                    <a
                        className="mx_AuthBody_adminLogin_link"
                        href="https://forms.agridemo.ir/admin"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {_t("auth|admin_login_users")}
                    </a>
                </div>
                {/* {this.renderAlternativeLoginOptions()} */}
            </div>
        );
    }
}
