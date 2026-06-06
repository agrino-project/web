/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useEffect, useRef, useState } from "react";
import { _t, type TranslationKey } from "../../../languageHandler";
import Modal from "../../../Modal";

/** Helper to cast new translation keys that the TS server hasn't picked up yet */
const t = (key: string, vars?: Record<string, string>): string => _t(key as TranslationKey, vars);
import ErrorDialog from "../dialogs/ErrorDialog";
import InfoDialog from "../dialogs/InfoDialog";
import Spinner from "../elements/Spinner";
import CheckCircleIcon from "@vector-im/compound-design-tokens/assets/web/icons/check-circle-solid";

import { IconButton } from "@vector-im/compound-web";
import CloseIcon from "@vector-im/compound-design-tokens/assets/web/icons/close";
import { ExpiryValidationResult, validateJalaliExpiry } from "./jalaliExpiry";
import CardToCardReport, { type ReportRow } from "./CardToCardReport";

interface Props {
    onClose(): void;
}

const BillPaymentCard: React.FC<Props> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [billType, setBillType] = useState("electricity");
    const [billId, setBillId] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [finalAmount, setFinalAmount] = useState<number | null>(null);
    const [isBillChecked, setIsBillChecked] = useState(false);
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

    const card1Ref = useRef<HTMLInputElement>(null);
    const card2Ref = useRef<HTMLInputElement>(null);
    const card3Ref = useRef<HTMLInputElement>(null);
    const card4Ref = useRef<HTMLInputElement>(null);
    const expMonthRef = useRef<HTMLInputElement>(null);
    const expYearRef = useRef<HTMLInputElement>(null);
    const cvv2Ref = useRef<HTMLInputElement>(null);
    const otpRef = useRef<HTMLInputElement>(null);

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

    const forceNumeric = (v: string): string => v.replace(/[^0-9]/g, "");
    const handleCardInput = (v: string, set: (s: string) => void, max: number): void => {
        const n = forceNumeric(v);
        if (n.length <= max) set(n);
    };

    const billTypeKeys: { key: string; label: string }[] = [
        { key: "electricity", label: t("custom_panels|bill_type_electricity") },
        { key: "water", label: t("custom_panels|bill_type_water") },
        { key: "gas", label: t("custom_panels|bill_type_gas") },
        { key: "phone", label: t("custom_panels|bill_type_phone") },
    ];

    const handleCheckBill = (): void => {
        if (!billId || billId.length < 8) {
            Modal.createDialog(ErrorDialog, {
                title: t("custom_panels|card_to_card_error_title"),
                description: t("custom_panels|bill_check_error"),
            });
            return;
        }
        const amounts: Record<string, number> = { electricity: 185000, water: 92000, gas: 274000, phone: 45000 };
        setFinalAmount(amounts[billType] || 120000);
        setIsBillChecked(true);
    };

    const handleGetOtp = (): void => {
        if (isOtpDisabled) return;
        Modal.createDialog(InfoDialog, {
            title: t("custom_panels|card_to_card_otp_sent"),
            description: t("custom_panels|card_to_card_otp_sent_desc"),
            hasCloseButton: true,
        });
        setOtp("483920");
        setIsOtpDisabled(true);
        setOtpTimer(60);
    };

    const handlePay = (): void => {
        const cardNumber = `${card1}${card2}${card3}${card4}`;

        if (cardNumber.length !== 16) {
            Modal.createDialog(ErrorDialog, {
                title: t("custom_panels|card_to_card_error_title"),
                description: t("custom_panels|bill_pay_error_card"),
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
        const billLabel = billTypeKeys.find((b) => b.key === billType)?.label ?? billType;
        const progressDialog = Modal.createDialog(
            InfoDialog,
            {
                title: t("custom_panels|bill_pay_progress"),
                description: (
                    <div className="mx_CardToCardCard_progressContent">
                        <Spinner w={48} h={48} />
                        <div className="mx_CardToCardCard_progressInfo">
                            <strong>
                                {finalAmount?.toLocaleString("fa-IR")} {t("custom_panels|card_to_card_toman")}
                            </strong>
                            {billLabel}
                        </div>
                    </div>
                ),
                hasCloseButton: false,
                fixedWidth: true,
            },
            "mx_CardToCardCard_progressDialog",
        );

        setTimeout(() => {
            progressDialog.close();
            setIsSubmitting(false);
            const typeLabel = billTypeKeys.find((b) => b.key === billType)?.label ?? billType;

            const rows: ReportRow[] = [
                {
                    label: t("custom_panels|bill_type_label"),
                    value: typeLabel,
                },
                {
                    label: t("custom_panels|bill_id_label"),
                    value: billId,
                },
                {
                    label: t("custom_panels|bill_amount_label"),
                    value: `${finalAmount?.toLocaleString("fa-IR")} ${t("custom_panels|card_to_card_toman")}`,
                },
                {
                    label: t("custom_panels|bill_tracking"),
                    value: "۸۷۶۵۴۳۲۱۰",
                },
            ];

            let reportDialog: { close: () => void } | undefined;
            reportDialog = Modal.createDialog(
                InfoDialog,
                {
                    title: "",
                    description: (
                        <CardToCardReport
                            status="success"
                            rows={rows}
                            title={t("custom_panels|bill_receipt_title")}
                            statusMessage={t("custom_panels|bill_pay_success_message")}
                            showAddContact={false}
                            onClose={() => reportDialog?.close()}
                        />
                    ),
                    hasCloseButton: false,
                    button: _t("action|done"),
                    fixedWidth: true,
                },
                "mx_CardToCardCard_reportDialog",
            );
        }, 2800);
    };

    return (
        <div className="mx_BillPaymentCard">
            <div className="mx_BillPaymentCard_container">
                <div className="mx_BillPaymentCard_header">
                    <div className="mx_BillPaymentCard_headerContent">
                        <h1>{t("custom_panels|bill_payment_title")}</h1>
                        <p>{t("custom_panels|bill_payment_subtitle")}</p>
                    </div>
                    <IconButton
                        size="28px"
                        onClick={onClose}
                        tooltip={t("custom_panels|close")}
                        kind="secondary"
                        className="mx_BillPaymentCard_closeBtn"
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
                <div className="mx_BillPaymentCard_formBody">
                    {step === 1 && (
                        <div className="mx_BillPaymentCard_step">
                            <div className="mx_BillPaymentCard_inputGroup">
                                <label>{t("custom_panels|bill_type")}</label>
                                <div className="mx_BillPaymentCard_billTypes">
                                    {billTypeKeys.map((bt) => (
                                        <div
                                            key={bt.key}
                                            className={`mx_BillPaymentCard_billType ${billType === bt.key ? "selected" : ""}`}
                                            onClick={() => {
                                                setBillType(bt.key);
                                                setIsBillChecked(false);
                                                setFinalAmount(null);
                                            }}
                                        >
                                            {bt.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mx_BillPaymentCard_inputGroup">
                                <label>{t("custom_panels|bill_id")}</label>
                                <input
                                    type="text"
                                    value={billId}
                                    onChange={(e) => setBillId(forceNumeric(e.target.value))}
                                    placeholder={t("custom_panels|bill_id_placeholder")}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="mx_BillPaymentCard_inputGroup">
                                <label>{t("custom_panels|bill_payment_id")}</label>
                                <input
                                    type="text"
                                    value={paymentId}
                                    onChange={(e) => setPaymentId(forceNumeric(e.target.value))}
                                    placeholder={t("custom_panels|bill_payment_id_placeholder")}
                                    inputMode="numeric"
                                />
                            </div>
                            {finalAmount !== null && (
                                <div className="mx_BillPaymentCard_billResult">
                                    {t("custom_panels|bill_result", { amount: finalAmount.toLocaleString("fa-IR") })}
                                </div>
                            )}
                            {!isBillChecked ? (
                                <button
                                    type="button"
                                    className="mx_BillPaymentCard_btnPrimary"
                                    onClick={handleCheckBill}
                                >
                                    {t("custom_panels|bill_check")}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="mx_BillPaymentCard_btnPrimary"
                                    onClick={() => setStep(2)}
                                >
                                    {_t("custom_panels|charge_next_step")}
                                </button>
                            )}
                        </div>
                    )}
                    {step === 2 && (
                        <div className="mx_BillPaymentCard_step">
                            <div className="mx_BillPaymentCard_summary">
                                {t("custom_panels|bill_type_label")}{" "}
                                <strong>{billTypeKeys.find((b) => b.key === billType)?.label}</strong>
                                <br />
                                {t("custom_panels|bill_id_label")} <strong>{billId}</strong>
                                <br />
                                {t("custom_panels|bill_amount_label")}{" "}
                                <strong>
                                    {finalAmount?.toLocaleString("fa-IR")} {t("custom_panels|card_to_card_toman")}
                                </strong>
                            </div>
                            <div className="mx_BillPaymentCard_inputGroup">
                                <label>{_t("custom_panels|charge_card_number")}</label>
                                <div className="mx_BillPaymentCard_cardInputs">
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
                                            if (e.key === "Backspace" && !card2) card1Ref.current?.focus();
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
                                            if (e.key === "Backspace" && !card3) card2Ref.current?.focus();
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
                                            if (e.key === "Backspace" && !card4) card3Ref.current?.focus();
                                        }}
                                        maxLength={4}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                            <div className="mx_BillPaymentCard_row">
                                <div className="mx_BillPaymentCard_inputGroup">
                                    <label>{_t("custom_panels|charge_exp_month")}</label>
                                    <input
                                        ref={expMonthRef}
                                        type="text"
                                        value={expMonth}
                                        onChange={(e) => handleCardInput(e.target.value, setExpMonth, 2)}
                                        maxLength={2}
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="mx_BillPaymentCard_inputGroup">
                                    <label>{_t("custom_panels|charge_exp_year")}</label>
                                    <input
                                        ref={expYearRef}
                                        type="text"
                                        value={expYear}
                                        onChange={(e) => handleCardInput(e.target.value, setExpYear, 2)}
                                        maxLength={2}
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="mx_BillPaymentCard_inputGroup">
                                    <label>CVV2</label>
                                    <input
                                        ref={cvv2Ref}
                                        type="text"
                                        value={cvv2}
                                        onChange={(e) => handleCardInput(e.target.value, setCvv2, 4)}
                                        maxLength={4}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                            <div className="mx_BillPaymentCard_inputGroup">
                                <label>{_t("custom_panels|charge_otp")}</label>
                                <div className="mx_BillPaymentCard_otpGroup">
                                    <input
                                        ref={otpRef}
                                        type="text"
                                        value={otp}
                                        onChange={(e) => handleCardInput(e.target.value, setOtp, 6)}
                                        maxLength={6}
                                        inputMode="numeric"
                                    />
                                    <button
                                        type="button"
                                        className="mx_BillPaymentCard_getOtpBtn"
                                        onClick={handleGetOtp}
                                        disabled={isOtpDisabled}
                                    >
                                        {isOtpDisabled ? `${otpTimer}s` : _t("custom_panels|charge_get_otp")}
                                    </button>
                                </div>
                                {otpTimer > 0 && (
                                    <div className="mx_BillPaymentCard_timer">
                                        {t("custom_panels|card_to_card_resend_otp", { seconds: String(otpTimer) })}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className="mx_BillPaymentCard_btnPrimary"
                                onClick={handlePay}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t("custom_panels|bill_paying") : t("custom_panels|bill_pay")}
                            </button>
                            <button
                                type="button"
                                className="mx_BillPaymentCard_btnSecondary"
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

export default BillPaymentCard;
