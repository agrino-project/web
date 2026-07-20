/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useEffect, useMemo, useRef, useState } from "react";
import { _t } from "../../../languageHandler";
import Modal from "../../../Modal";
import ErrorDialog from "../dialogs/ErrorDialog";
import InfoDialog from "../dialogs/InfoDialog";
import type { BazaarAd } from "./api/useBazaarAds";
import "../../../../res/css/views/bazaar/BazaarPaymentGateway.pcss";

interface Props {
    item: BazaarAd;
    isProcessing: boolean;
    onPay: () => void;
    onCancel: () => void;
}

const SESSION_SECONDS = 600;

function forceNumeric(value: string): string {
    return value.replace(/[^0-9]/g, "");
}

function formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function generateCaptcha(): string {
    return String(Math.floor(10000 + Math.random() * 90000));
}

const BazaarPaymentGateway: React.FC<Props> = ({ item, isProcessing, onPay, onCancel }) => {
    const [card1, setCard1] = useState("");
    const [card2, setCard2] = useState("");
    const [card3, setCard3] = useState("");
    const [card4, setCard4] = useState("");
    const [expMonth, setExpMonth] = useState("");
    const [expYear, setExpYear] = useState("");
    const [cvv2, setCvv2] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [otp, setOtp] = useState("");
    const [otpTimer, setOtpTimer] = useState(0);
    const [isOtpDisabled, setIsOtpDisabled] = useState(false);
    const [sessionTimer, setSessionTimer] = useState(SESSION_SECONDS);
    const [captchaCode, setCaptchaCode] = useState(generateCaptcha);
    const [receiveReceipt, setReceiveReceipt] = useState(false);

    const card1Ref = useRef<HTMLInputElement>(null);
    const card2Ref = useRef<HTMLInputElement>(null);
    const card3Ref = useRef<HTMLInputElement>(null);
    const card4Ref = useRef<HTMLInputElement>(null);
    const expMonthRef = useRef<HTMLInputElement>(null);
    const expYearRef = useRef<HTMLInputElement>(null);
    const cvv2Ref = useRef<HTMLInputElement>(null);
    const captchaRef = useRef<HTMLInputElement>(null);
    const otpRef = useRef<HTMLInputElement>(null);

    const priceNum = Number(item.price);
    const amountRial = Number.isFinite(priceNum) && priceNum > 0 ? priceNum * 10 : 0;
    const amountRialLabel = amountRial.toLocaleString("fa-IR");
    const amountTomanLabel = Number.isFinite(priceNum) && priceNum > 0 ? priceNum.toLocaleString("fa-IR") : "۰";

    const merchantNo = useMemo(() => String(44000000 + (item.id % 1000000)).slice(0, 8), [item.id]);
    const terminalNo = useMemo(() => String(85000000 + (item.id % 1000000)).slice(0, 8), [item.id]);
    const merchantName = item.contact_name?.trim() || _t("custom_panels|bazaar_payment_merchant_default");

    useEffect(() => {
        card1Ref.current?.focus();
    }, []);

    useEffect(() => {
        if (card1.length === 4) card2Ref.current?.focus();
    }, [card1]);
    useEffect(() => {
        if (card2.length === 4) card3Ref.current?.focus();
    }, [card2]);
    useEffect(() => {
        if (card3.length === 4) card4Ref.current?.focus();
    }, [card3]);
    useEffect(() => {
        if (card4.length === 4) expMonthRef.current?.focus();
    }, [card4]);
    useEffect(() => {
        if (expMonth.length === 2) expYearRef.current?.focus();
    }, [expMonth]);
    useEffect(() => {
        if (expYear.length === 2) cvv2Ref.current?.focus();
    }, [expYear]);
    useEffect(() => {
        if (cvv2.length >= 3) captchaRef.current?.focus();
    }, [cvv2]);

    useEffect(() => {
        if (sessionTimer <= 0) return;
        const timer = setTimeout(() => setSessionTimer((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [sessionTimer]);

    useEffect(() => {
        if (otpTimer <= 0) {
            if (isOtpDisabled) setIsOtpDisabled(false);
            return;
        }
        const timer = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [otpTimer, isOtpDisabled]);

    const handleCardInput = (value: string, setter: (v: string) => void, max: number): void => {
        const numeric = forceNumeric(value);
        if (numeric.length <= max) setter(numeric);
    };

    const refreshCaptcha = (): void => {
        setCaptchaCode(generateCaptcha());
        setCaptchaInput("");
    };

    const handleGetOtp = (): void => {
        if (isOtpDisabled) return;
        Modal.createDialog(InfoDialog, {
            title: _t("custom_panels|card_to_card_otp_sent"),
            description: _t("custom_panels|card_to_card_otp_sent_desc"),
            hasCloseButton: true,
        });
        setOtp("483920");
        setIsOtpDisabled(true);
        setOtpTimer(60);
    };

    const handlePay = (): void => {
        if (isProcessing) return;

        const cardNumber = `${card1}${card2}${card3}${card4}`;
        if (cardNumber.length !== 16) {
            Modal.createDialog(ErrorDialog, {
                title: _t("custom_panels|card_to_card_error_title"),
                description: _t("custom_panels|card_to_card_error_incomplete"),
            });
            return;
        }
        if (!expMonth || !expYear || cvv2.length < 3) {
            Modal.createDialog(ErrorDialog, {
                title: _t("custom_panels|card_to_card_error_title"),
                description: _t("custom_panels|card_to_card_error_incomplete"),
            });
            return;
        }
        if (captchaInput !== captchaCode) {
            Modal.createDialog(ErrorDialog, {
                title: _t("custom_panels|card_to_card_error_title"),
                description: _t("custom_panels|bazaar_payment_captcha_error"),
            });
            refreshCaptcha();
            return;
        }
        if (!otp || otp.length < 4) {
            Modal.createDialog(ErrorDialog, {
                title: _t("custom_panels|card_to_card_error_title"),
                description: _t("custom_panels|bazaar_payment_otp_required"),
            });
            return;
        }

        onPay();
    };

    return (
        <div className="mx_BazaarPaymentGateway">
            <div className="mx_BazaarPaymentGateway_header">
                <div className="mx_BazaarPaymentGateway_logo mx_BazaarPaymentGateway_logo--ap" aria-hidden="true">
                    <span className="mx_BazaarPaymentGateway_logoMark">A</span>
                </div>
                <div className="mx_BazaarPaymentGateway_headerTitle">
                    {_t("custom_panels|bazaar_payment_gateway_title")}
                </div>
                <div className="mx_BazaarPaymentGateway_logo mx_BazaarPaymentGateway_logo--shaparak">
                    <span className="mx_BazaarPaymentGateway_shaparakIcon" aria-hidden="true" />
                    <span className="mx_BazaarPaymentGateway_shaparakText">
                        {_t("custom_panels|bazaar_payment_shaparak")}
                    </span>
                </div>
            </div>

            <div className="mx_BazaarPaymentGateway_body">
                <aside className="mx_BazaarPaymentGateway_sidebar">
                    <div className="mx_BazaarPaymentGateway_timer">
                        <span className="mx_BazaarPaymentGateway_timerIcon" aria-hidden="true" />
                        <span>{formatTimer(sessionTimer)}</span>
                    </div>

                    <div className="mx_BazaarPaymentGateway_amountBlock">
                        <div className="mx_BazaarPaymentGateway_amountRial">
                            {amountRialLabel} {_t("custom_panels|bazaar_payment_rial")}
                        </div>
                        <div className="mx_BazaarPaymentGateway_amountToman">
                            {_t("custom_panels|bazaar_payment_toman_words", { amount: amountTomanLabel })}
                        </div>
                    </div>

                    <dl className="mx_BazaarPaymentGateway_merchantInfo">
                        <div>
                            <dt>{_t("custom_panels|bazaar_payment_merchant")}</dt>
                            <dd>{merchantName}</dd>
                        </div>
                        <div>
                            <dt>{_t("custom_panels|bazaar_payment_merchant_no")}</dt>
                            <dd>{Number(merchantNo).toLocaleString("fa-IR")}</dd>
                        </div>
                        <div>
                            <dt>{_t("custom_panels|bazaar_payment_terminal_no")}</dt>
                            <dd>{Number(terminalNo).toLocaleString("fa-IR")}</dd>
                        </div>
                        <div>
                            <dt>{_t("custom_panels|bazaar_field_product")}</dt>
                            <dd>{item.product_type || `#${item.id}`}</dd>
                        </div>
                    </dl>
                </aside>

                <form
                    className="mx_BazaarPaymentGateway_form"
                    autoComplete="off"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handlePay();
                    }}
                >
                    <div className="mx_BazaarPaymentGateway_field">
                        <label>{_t("custom_panels|charge_card_number")}</label>
                        <div className="mx_BazaarPaymentGateway_cardRow">
                            <div className="mx_BazaarPaymentGateway_cardInputs" dir="ltr">
                                <input
                                    ref={card1Ref}
                                    type="text"
                                    value={card1}
                                    onChange={(e) => handleCardInput(e.target.value, setCard1, 4)}
                                    maxLength={4}
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                                <span>-</span>
                                <input
                                    ref={card2Ref}
                                    type="text"
                                    value={card2}
                                    onChange={(e) => handleCardInput(e.target.value, setCard2, 4)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !card2) card1Ref.current?.focus();
                                    }}
                                    maxLength={4}
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                                <span>-</span>
                                <input
                                    ref={card3Ref}
                                    type="text"
                                    value={card3}
                                    onChange={(e) => handleCardInput(e.target.value, setCard3, 4)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !card3) card2Ref.current?.focus();
                                    }}
                                    maxLength={4}
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                                <span>-</span>
                                <input
                                    ref={card4Ref}
                                    type="text"
                                    value={card4}
                                    onChange={(e) => handleCardInput(e.target.value, setCard4, 4)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !card4) card3Ref.current?.focus();
                                    }}
                                    maxLength={4}
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mx_BazaarPaymentGateway_row">
                        <div className="mx_BazaarPaymentGateway_field mx_BazaarPaymentGateway_field--cvv">
                            <label>CVV2</label>
                            <div className="mx_BazaarPaymentGateway_cvvWrap">
                                <input
                                    ref={cvv2Ref}
                                    type="text"
                                    value={cvv2}
                                    onChange={(e) => handleCardInput(e.target.value, setCvv2, 4)}
                                    maxLength={4}
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                                <span className="mx_BazaarPaymentGateway_keypadIcon" aria-hidden="true" />
                            </div>
                        </div>
                        <div className="mx_BazaarPaymentGateway_field mx_BazaarPaymentGateway_field--expiry">
                            <label>{_t("custom_panels|bazaar_payment_expiry")}</label>
                            <div className="mx_BazaarPaymentGateway_expiryInputs">
                                <input
                                    ref={expMonthRef}
                                    type="text"
                                    value={expMonth}
                                    onChange={(e) => handleCardInput(e.target.value, setExpMonth, 2)}
                                    placeholder={_t("custom_panels|charge_exp_month")}
                                    maxLength={2}
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                                <input
                                    ref={expYearRef}
                                    type="text"
                                    value={expYear}
                                    onChange={(e) => handleCardInput(e.target.value, setExpYear, 2)}
                                    placeholder={_t("custom_panels|charge_exp_year")}
                                    maxLength={2}
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mx_BazaarPaymentGateway_field">
                        <label>{_t("custom_panels|bazaar_payment_captcha")}</label>
                        <div className="mx_BazaarPaymentGateway_captchaRow">
                            <div className="mx_BazaarPaymentGateway_captchaImage" aria-hidden="true">
                                {captchaCode}
                            </div>
                            <button
                                type="button"
                                className="mx_BazaarPaymentGateway_iconBtn"
                                onClick={refreshCaptcha}
                                title={_t("custom_panels|bazaar_payment_captcha_refresh")}
                                aria-label={_t("custom_panels|bazaar_payment_captcha_refresh")}
                            >
                                ↻
                            </button>
                            <button
                                type="button"
                                className="mx_BazaarPaymentGateway_iconBtn"
                                title={_t("custom_panels|bazaar_payment_captcha_audio")}
                                aria-label={_t("custom_panels|bazaar_payment_captcha_audio")}
                            >
                                🔊
                            </button>
                            <input
                                ref={captchaRef}
                                type="text"
                                value={captchaInput}
                                onChange={(e) => handleCardInput(e.target.value, setCaptchaInput, 5)}
                                maxLength={5}
                                inputMode="numeric"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="mx_BazaarPaymentGateway_field">
                        <label>{_t("custom_panels|card_to_card_otp")}</label>
                        <div className="mx_BazaarPaymentGateway_otpRow">
                            <input
                                ref={otpRef}
                                type="password"
                                value={otp}
                                onChange={(e) => handleCardInput(e.target.value, setOtp, 8)}
                                maxLength={8}
                                inputMode="numeric"
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                className="mx_BazaarPaymentGateway_getOtpBtn"
                                onClick={handleGetOtp}
                                disabled={isOtpDisabled}
                            >
                                {isOtpDisabled
                                    ? `${otpTimer} ${_t("custom_panels|bazaar_payment_seconds")}`
                                    : _t("custom_panels|card_to_card_get_otp")}
                            </button>
                        </div>
                    </div>

                    <div className="mx_BazaarPaymentGateway_actions">
                        <button
                            type="submit"
                            className="mx_BazaarPaymentGateway_payBtn"
                            disabled={isProcessing || sessionTimer <= 0}
                        >
                            {isProcessing
                                ? _t("custom_panels|bazaar_payment_processing")
                                : _t("custom_panels|bazaar_payment_pay")}
                        </button>
                        <button
                            type="button"
                            className="mx_BazaarPaymentGateway_cancelBtn"
                            onClick={onCancel}
                            disabled={isProcessing}
                        >
                            {_t("custom_panels|bazaar_cancel")}
                        </button>
                    </div>

                    <label className="mx_BazaarPaymentGateway_receiptOpt">
                        <input
                            type="checkbox"
                            checked={receiveReceipt}
                            onChange={(e) => setReceiveReceipt(e.target.checked)}
                        />
                        <span>{_t("custom_panels|bazaar_payment_receipt_opt")}</span>
                    </label>
                </form>
            </div>
        </div>
    );
};

export default BazaarPaymentGateway;
