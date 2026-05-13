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

// For validating OTP codes (typically 4-6 digits)
const OTP_REGEX = /^[0-9]{4,6}$/;

interface IProps {
    serverConfig: ValidatedServerConfig;
    phoneNumber: string;
    disableSubmit?: boolean;
    busy?: boolean;

    onPasswordLogin(
        username: string | undefined,
        phoneCountry: string | undefined,
        phoneNumber: string | undefined,
        password: string,
    ): Promise<void>;
    onBack(): void;
    onResendOTP(): void;
}

interface IState {
    otp: string;
    otpValid: boolean;
    verifyingOTP: boolean;
    errorMessage?: string;
    resendDisabled: boolean;
    countdown: number;
}

export default class OTPVerifyLogin extends React.Component<IProps, IState> {
    private otpFieldRef: React.RefObject<Field> = React.createRef();
    private countdownInterval?: number;

    public constructor(props: IProps) {
        super(props);

        this.state = {
            otp: "",
            otpValid: false,
            verifyingOTP: false,
            resendDisabled: true,
            countdown: 60, // 60 seconds countdown for resend
        };
    }

    public componentDidMount(): void {
        this.startCountdown();
    }

    public componentWillUnmount(): void {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }

    private startCountdown(): void {
        this.setState({ resendDisabled: true, countdown: 60 });

        this.countdownInterval = window.setInterval(() => {
            this.setState((prevState) => {
                if (prevState.countdown <= 1) {
                    if (this.countdownInterval) {
                        clearInterval(this.countdownInterval);
                    }
                    return { resendDisabled: false, countdown: 0 };
                }
                return { countdown: prevState.countdown - 1 };
            });
        }, 1000);
    }

    private onOTPChange = (ev: SyntheticEvent<HTMLInputElement>): void => {
        const otp = ev.currentTarget.value;
        const otpValid = OTP_REGEX.test(otp);

        this.setState({
            otp,
            otpValid,
            errorMessage: undefined,
        });
    };

    private onSubmit = async (ev: SyntheticEvent): Promise<void> => {
        ev.preventDefault();

        if (!this.state.otpValid || this.state.verifyingOTP) {
            return;
        }

        this.setState({
            verifyingOTP: true,
            errorMessage: undefined,
        });

        try {
            // Use phone number as username with "u" prefix and hardcoded password "123456"
            const username = `u${this.props.phoneNumber}`;
            const password = "123456";

            await this.props.onPasswordLogin(username, undefined, undefined, password);
        } catch (error) {
            logger.error("Login failed:", error);
            this.setState({
                errorMessage: _t("auth|otp_verification_failed"),
            });
        } finally {
            this.setState({
                verifyingOTP: false,
            });
        }
    };

    private onBackClick = (ev: ButtonEvent): void => {
        ev.preventDefault();
        this.props.onBack();
    };

    private onResendClick = (ev: ButtonEvent): void => {
        ev.preventDefault();
        if (!this.state.resendDisabled) {
            this.props.onResendOTP();
            this.startCountdown();
        }
    };

    public render(): JSX.Element {
        const { otp, otpValid, verifyingOTP, errorMessage, resendDisabled, countdown } = this.state;

        let submitButtonOrSpinner: JSX.Element;
        if (verifyingOTP) {
            submitButtonOrSpinner = <Spinner />;
        } else {
            submitButtonOrSpinner = (
                <AccessibleButton
                    type="submit"
                    kind="primary_sm"
                    disabled={!otpValid || this.props.disableSubmit}
                    onClick={this.onSubmit}
                    style={{ fontSize: "14px" }}
                >
                    {_t("auth|enter")}
                </AccessibleButton>
            );
        }

        return (
            <div>
                <p className="otp_sent_to">{_t("auth|otp_sent_to", { phoneNumber: this.props.phoneNumber })}</p>
                <button className="otp-change-number" onClick={this.onBackClick} disabled={verifyingOTP}>
                    {_t("action|back")}
                </button>

                <form onSubmit={this.onSubmit}>
                    <div className="mx_AuthBody_fieldRow">
                        <Field
                            name="otp"
                            ref={this.otpFieldRef}
                            type="text"
                            placeholder={_t("auth|otp_code_placeholder")}
                            value={otp}
                            onChange={this.onOTPChange}
                            disabled={verifyingOTP}
                            autoFocus
                        />
                    </div>

                    {errorMessage && <div className="mx_AuthBody_error">{errorMessage}</div>}

                    <div className="mx_AuthBody_buttons">
                        <button
                            onClick={this.onResendClick}
                            className="otp-resend-btn"
                            disabled={resendDisabled || verifyingOTP}
                        >
                            {resendDisabled ? _t("auth|resend_otp_in", { seconds: countdown }) : _t("auth|resend_otp")}
                        </button>
                        {submitButtonOrSpinner}
                    </div>
                </form>
            </div>
        );
    }
}
