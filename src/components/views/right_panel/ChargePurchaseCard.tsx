/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useEffect, useRef, useState } from "react";
import Modal from "../../../Modal";
import ErrorDialog from "../dialogs/ErrorDialog";
import InfoDialog from "../dialogs/InfoDialog";
import Spinner from "../elements/Spinner";
import CheckCircleIcon from "@vector-im/compound-design-tokens/assets/web/icons/check-circle-solid";
import { IconButton } from "@vector-im/compound-web";
import CloseIcon from "@vector-im/compound-design-tokens/assets/web/icons/close";
import { _t, type TranslationKey } from "../../../languageHandler";

/** Helper to cast new translation keys that the TS server hasn't picked up yet */
const t = (key: string, vars?: Record<string, string>): string => _t(key as TranslationKey, vars);

import CardToCardReport, { type ReportRow } from "./CardToCardReport";
import { ExpiryValidationResult, validateJalaliExpiry } from "./jalaliExpiry";

interface Props {
    onClose(): void;
}

const ChargePurchaseCard: React.FC<Props> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [card1, setCard1] = useState("");
    const [card2, setCard2] = useState("");
    const [card3, setCard3] = useState("");
    const [card4, setCard4] = useState("");
    const [expMonth, setExpMonth] = useState("");
    const [expYear, setExpYear] = useState("");
    const [cvv2, setCvv2] = useState("");
    const [otp, setOtp] = useState("");
    const [otpTimer, setOtpTimer] = useState(0);
    const [isOtpDisabled, setIsOtpDisabled] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const progressDialogRef = useRef<{ close: () => void } | null>(null);

    const card1Ref = useRef<HTMLInputElement>(null);
    const card2Ref = useRef<HTMLInputElement>(null);
    const card3Ref = useRef<HTMLInputElement>(null);
    const card4Ref = useRef<HTMLInputElement>(null);
    const expMonthRef = useRef<HTMLInputElement>(null);
    const expYearRef = useRef<HTMLInputElement>(null);
    const cvv2Ref = useRef<HTMLInputElement>(null);
    const otpRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        phoneRef.current?.focus();
    }, []);
    useEffect(() => {
        if (step === 2) card1Ref.current?.focus();
    }, [step]);
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
        if (expMonth.length === 2) expYearRef.current?.focus();
    }, [expMonth]);
    useEffect(() => {
        if (expYear.length === 2) cvv2Ref.current?.focus();
    }, [expYear]);
    useEffect(() => {
        if (cvv2.length >= 3) otpRef.current?.focus();
    }, [cvv2]);

    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (otpTimer === 0 && isOtpDisabled) {
            setIsOtpDisabled(false);
        }
    }, [otpTimer, isOtpDisabled]);

    const forceNumeric = (value: string): string => value.replace(/[^0-9]/g, "");

    const handleCardInput = (value: string, setter: (val: string) => void, maxLength: number) => {
        const numeric = forceNumeric(value);
        if (numeric.length <= maxLength) setter(numeric);
    };

    const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numeric = forceNumeric(e.target.value);
        if (numeric.length <= 11) setPhone(numeric);
    };

    const handleNextStep = () => {
        if (!phone || phone.length !== 11 || !selectedAmount) {
            Modal.createDialog(ErrorDialog, {
                title: _t("custom_panels|charge_error_title"),
                description: _t("custom_panels|charge_error_select"),
            });
            return;
        }
        setStep(2);
    };

    const handleGetOtp = () => {
        if (isOtpDisabled) return;
        Modal.createDialog(InfoDialog, {
            title: _t("custom_panels|charge_otp_sent_title"),
            description: _t("custom_panels|charge_otp_sent_desc"),
            hasCloseButton: true,
        });
        setOtp("483920");
        setIsOtpDisabled(true);
        setOtpTimer(60);
    };

    const handlePay = () => {
        const cardNumber = `${card1}${card2}${card3}${card4}`;
        if (cardNumber.length !== 16) {
            Modal.createDialog(ErrorDialog, {
                title: _t("custom_panels|charge_error_title"),
                description: _t("custom_panels|charge_error_card"),
            });
            return;
        }

        const validationResult = validateJalaliExpiry(expMonth, expYear);

        if (validationResult === ExpiryValidationResult.InvalidMonth) {
            Modal.createDialog(ErrorDialog, {
                title: t("custom_panels|card_to_card_error_title"),
                description: t("custom_panels|card_to_card_error_exp_month"),
            });
            return;
        }

        if (validationResult === ExpiryValidationResult.InvalidFormat) {
            Modal.createDialog(ErrorDialog, {
                title: t("custom_panels|card_to_card_error_title"),
                description: t("custom_panels|card_to_card_error_format"),
            });
            return;
        }

        if (validationResult === ExpiryValidationResult.Expired) {
            Modal.createDialog(ErrorDialog, {
                title: t("custom_panels|card_to_card_error_title"),
                description: t("custom_panels|card_to_card_error_expired"),
            });
            return;
        }

        setIsSubmitting(true);

        const progressDialog = Modal.createDialog(
            InfoDialog,
            {
                title: _t("custom_panels|charge_paying"),
                description: (
                    <div style={{ textAlign: "center", direction: "rtl", marginTop: "20px" }}>
                        <Spinner w={48} h={48} />
                        <div style={{ marginTop: "20px" }}>
                            <strong>{selectedAmount?.toLocaleString("fa-IR")} تومان</strong>
                            <br />
                            {_t("custom_panels|charge_for_number", { phone })}
                        </div>
                    </div>
                ),
                hasCloseButton: false,
                fixedWidth: true,
            },
            "mx_ChargePurchaseCard_progressDialog",
        );
        progressDialogRef.current = progressDialog;

        setTimeout(() => {
            progressDialog.close();
            setIsSubmitting(false);
            const rows: ReportRow[] = [
                {
                    label: t("custom_panels|card_to_card_report_amount"),
                    value: `${selectedAmount?.toLocaleString("fa-IR")} ${t("custom_panels|card_to_card_toman")}`,
                },
                { label: t("custom_panels|charge_number"), value: phone },
                { label: t("custom_panels|charge_tracking"), value: "۹۸۷۶۵۴۳۲۱" },
            ];

            let reportDialog: { close: () => void } | undefined;
            reportDialog = Modal.createDialog(
                InfoDialog,
                {
                    title: "",
                    description: (
                        <CardToCardReport status="success" rows={rows} onClose={() => reportDialog?.close()} />
                    ),
                    hasCloseButton: false,
                    fixedWidth: true,
                },
                "mx_ChargePurchaseCard_reportDialog",
            );
        }, 2800);
    };

    const amountButtons = [
        { amount: 10000, label: "۱۰,۰۰۰ تومان" },
        { amount: 20000, label: "۲۰,۰۰۰ تومان" },
        { amount: 30000, label: "۳۰,۰۰۰ تومان" },
        { amount: 40000, label: "۴۰,۰۰۰ تومان" },
        { amount: 50000, label: "۵۰,۰۰۰ تومان" },
    ];

    return (
        <div className="mx_ChargePurchaseCard">
            <div className="mx_ChargePurchaseCard_container">
                <div className="mx_ChargePurchaseCard_header">
                    <div className="mx_ChargePurchaseCard_headerContent">
                        <h1>{_t("custom_panels|charge_purchase_title")}</h1>
                        <p>{_t("custom_panels|charge_purchase_subtitle")}</p>
                    </div>
                    <IconButton
                        size="28px"
                        onClick={onClose}
                        tooltip={_t("custom_panels|close")}
                        kind="secondary"
                        className="mx_ChargePurchaseCard_closeBtn"
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className="mx_ChargePurchaseCard_formBody">
                    {step === 1 && (
                        <div className="mx_ChargePurchaseCard_step">
                            <div className="mx_ChargePurchaseCard_inputGroup">
                                <label>{_t("custom_panels|charge_phone_label")}</label>
                                <input
                                    ref={phoneRef}
                                    type="text"
                                    id="phone"
                                    value={phone}
                                    onChange={handlePhoneInput}
                                    placeholder={_t("custom_panels|charge_phone_placeholder")}
                                    maxLength={11}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="mx_ChargePurchaseCard_inputGroup">
                                <label>{_t("custom_panels|charge_amount_label")}</label>
                                <div className="mx_ChargePurchaseCard_amountButtons">
                                    {amountButtons.map((btn) => (
                                        <div
                                            key={btn.amount}
                                            className={`mx_ChargePurchaseCard_amountBtn ${selectedAmount === btn.amount ? "selected" : ""}`}
                                            onClick={() => setSelectedAmount(btn.amount)}
                                        >
                                            {btn.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="button" className="mx_ChargePurchaseCard_btnPrimary" onClick={handleNextStep}>
                                {_t("custom_panels|charge_next_step")}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="mx_ChargePurchaseCard_step">
                            <div className="mx_ChargePurchaseCard_summary">
                                {_t("custom_panels|charge_purchase")}{" "}
                                <strong>{selectedAmount?.toLocaleString("fa-IR")} تومان</strong>{" "}
                                {_t("custom_panels|charge_for_number", { phone: <strong>{phone}</strong> })}
                            </div>
                            <div className="mx_ChargePurchaseCard_inputGroup">
                                <label>{_t("custom_panels|charge_card_number")}</label>
                                <div className="mx_ChargePurchaseCard_cardInputs">
                                    <input
                                        ref={card1Ref}
                                        type="text"
                                        value={card1}
                                        onChange={(e) => handleCardInput(e.target.value, setCard1, 4)}
                                        maxLength={4}
                                        inputMode="numeric"
                                    />
                                    <input
                                        ref={card2Ref}
                                        type="text"
                                        value={card2}
                                        onChange={(e) => handleCardInput(e.target.value, setCard2, 4)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && card2 === "") card1Ref.current?.focus();
                                        }}
                                        maxLength={4}
                                        inputMode="numeric"
                                    />
                                    <input
                                        ref={card3Ref}
                                        type="text"
                                        value={card3}
                                        onChange={(e) => handleCardInput(e.target.value, setCard3, 4)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && card3 === "") card2Ref.current?.focus();
                                        }}
                                        maxLength={4}
                                        inputMode="numeric"
                                    />
                                    <input
                                        ref={card4Ref}
                                        type="text"
                                        value={card4}
                                        onChange={(e) => handleCardInput(e.target.value, setCard4, 4)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && card4 === "") card3Ref.current?.focus();
                                        }}
                                        maxLength={4}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                            <div className="mx_ChargePurchaseCard_row">
                                <div className="mx_ChargePurchaseCard_inputGroup">
                                    <label>{_t("custom_panels|charge_exp_month")}</label>
                                    <input
                                        ref={expMonthRef}
                                        type="text"
                                        value={expMonth}
                                        onChange={(e) => handleCardInput(e.target.value, setExpMonth, 2)}
                                        placeholder="۰۶"
                                        maxLength={2}
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="mx_ChargePurchaseCard_inputGroup">
                                    <label>{_t("custom_panels|charge_exp_year")}</label>
                                    <input
                                        ref={expYearRef}
                                        type="text"
                                        value={expYear}
                                        onChange={(e) => handleCardInput(e.target.value, setExpYear, 2)}
                                        placeholder="۰۵"
                                        maxLength={2}
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="mx_ChargePurchaseCard_inputGroup">
                                    <label>CVV2</label>
                                    <input
                                        ref={cvv2Ref}
                                        type="text"
                                        value={cvv2}
                                        onChange={(e) => handleCardInput(e.target.value, setCvv2, 4)}
                                        placeholder="۱۲۳"
                                        maxLength={4}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                            <div className="mx_ChargePurchaseCard_inputGroup">
                                <label>{_t("custom_panels|charge_otp")}</label>
                                <div className="mx_ChargePurchaseCard_otpGroup">
                                    <input
                                        ref={otpRef}
                                        type="text"
                                        value={otp}
                                        onChange={(e) => handleCardInput(e.target.value, setOtp, 6)}
                                        placeholder="------"
                                        maxLength={6}
                                        inputMode="numeric"
                                    />
                                    <button
                                        type="button"
                                        className="mx_ChargePurchaseCard_getOtpBtn"
                                        onClick={handleGetOtp}
                                        disabled={isOtpDisabled}
                                    >
                                        {isOtpDisabled ? `${otpTimer}s` : _t("custom_panels|charge_get_otp")}
                                    </button>
                                </div>
                                {otpTimer > 0 && (
                                    <div className="mx_ChargePurchaseCard_timer">
                                        {_t("custom_panels|charge_resend_otp", { seconds: String(otpTimer) })}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className="mx_ChargePurchaseCard_btnPrimary"
                                onClick={handlePay}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? _t("custom_panels|charge_paying_btn")
                                    : _t("custom_panels|charge_pay_btn")}
                            </button>
                            <button
                                type="button"
                                className="mx_ChargePurchaseCard_btnSecondary"
                                onClick={() => setStep(1)}
                            >
                                {_t("custom_panels|charge_prev_step")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChargePurchaseCard;
