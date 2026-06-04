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

interface Props {
    onClose(): void;
}

const CardToCardCard: React.FC<Props> = ({ onClose }) => {
    const [card1, setCard1] = useState("");
    const [card2, setCard2] = useState("");
    const [card3, setCard3] = useState("");
    const [card4, setCard4] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
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
        if (expMonth.length === 2) expYearRef.current?.focus();
    }, [expMonth]);
    useEffect(() => {
        if (expYear.length === 2) cvv2Ref.current?.focus();
    }, [expYear]);
    useEffect(() => {
        if (cvv2.length === 4) otpRef.current?.focus();
    }, [cvv2]);

    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (otpTimer === 0 && isOtpDisabled) {
            setIsOtpDisabled(false);
        }
    }, [otpTimer, isOtpDisabled]);

    /** Current Jalali (Shamsi) year/month using the built-in Persian calendar */
    const getCurrentJalali = (): { year: number; month: number } => {
        const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
            year: "numeric",
            month: "numeric",
        }).formatToParts(new Date());
        const year = Number(parts.find((p) => p.type === "year")?.value);
        const month = Number(parts.find((p) => p.type === "month")?.value);
        return { year, month };
    };

    const forceNumeric = (v: string): string => v.replace(/[^0-9]/g, "");
    const handleCardInput = (v: string, set: (s: string) => void, max: number): void => {
        const n = forceNumeric(v);
        if (n.length <= max) set(n);
    };

    const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const val = e.target.value
            .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
            .replace(/[^0-9]/g, "");
        setAmount(val ? Number(val).toLocaleString("fa-IR") : "");
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

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        const fullCard = `${card1}-${card2}-${card3}-${card4}`;
        const cardNumber = fullCard.replace(/-/g, "");
        if (cardNumber.length !== 16 || !amount || amount === "۰") {
            Modal.createDialog(ErrorDialog, {
                title: t("custom_panels|card_to_card_error_title"),
                description: t("custom_panels|card_to_card_error_incomplete"),
            });
            return;
        }
        const month = Number(expMonth);
        const year = Number(expYear);
        if (expMonth.length !== 2 || month < 1 || month > 12) {
            Modal.createDialog(ErrorDialog, {
                title: t("custom_panels|card_to_card_error_title"),
                description: t("custom_panels|card_to_card_error_exp_month"),
            });
            return;
        }
        const { year: curYear, month: curMonth } = getCurrentJalali();
        const curYear2 = curYear % 100;
        if (expYear.length !== 2 || year < curYear2 || (year === curYear2 && month < curMonth)) {
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
                title: t("custom_panels|card_to_card_progress"),
                description: (
                    <div className="mx_CardToCardCard_progressContent">
                        <Spinner w={48} h={48} />
                        <div className="mx_CardToCardCard_progressInfo">
                            <strong>
                                {amount} {t("custom_panels|card_to_card_toman")}
                            </strong>
                            <br />
                            {fullCard}
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
            Modal.createDialog(InfoDialog, {
                title: t("custom_panels|card_to_card_success"),
                description: (
                    <div className="mx_CardToCardCard_successContent">
                        <div className="mx_CardToCardCard_checkmark">
                            <CheckCircleIcon width="80px" height="80px" className="mx_CardToCardCard_checkIcon" />
                        </div>
                        <p>
                            <strong>{t("custom_panels|card_to_card_amount_label")}</strong> {amount}{" "}
                            {t("custom_panels|card_to_card_toman")}
                        </p>
                        <p>
                            <strong>{t("custom_panels|card_to_card_dest_label")}</strong> {fullCard}
                        </p>
                        <p>
                            <strong>{t("custom_panels|card_to_card_tracking")}</strong> ۱۲۸۴۹۰۱۲۳
                        </p>
                    </div>
                ),
                hasCloseButton: true,
                fixedWidth: true,
            });
        }, 3000);
    };

    return (
        <div className="mx_CardToCardCard">
            <div className="mx_CardToCardCard_container">
                <div className="mx_CardToCardCard_header">
                    <div className="mx_CardToCardCard_headerContent">
                        <h1>{t("custom_panels|card_to_card_title")}</h1>
                        <p>{t("custom_panels|card_to_card_subtitle")}</p>
                    </div>
                    <IconButton
                        size="28px"
                        onClick={onClose}
                        tooltip={t("custom_panels|close")}
                        kind="secondary"
                        className="mx_CardToCardCard_closeBtn"
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
                <div className="mx_CardToCardCard_formBody">
                    <form onSubmit={handleSubmit}>
                        <div className="mx_CardToCardCard_inputGroup">
                            <label>{t("custom_panels|card_to_card_dest_card")}</label>
                            <div className="mx_CardToCardCard_cardInputs">
                                <input
                                    ref={card1Ref}
                                    type="text"
                                    value={card1}
                                    onChange={(e) => handleCardInput(e.target.value, setCard1, 4)}
                                    maxLength={4}
                                    inputMode="numeric"
                                    autoFocus
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
                        <div className="mx_CardToCardCard_inputGroup">
                            <label>{t("custom_panels|card_to_card_amount")}</label>
                            <div className="mx_CardToCardCard_amountWrapper">
                                <span className="mx_CardToCardCard_tomanLabel">
                                    {t("custom_panels|card_to_card_toman")}
                                </span>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={handleAmountInput}
                                    inputMode="numeric"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mx_CardToCardCard_inputGroup">
                            <label>{t("custom_panels|card_to_card_description")}</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="mx_CardToCardCard_row">
                            <div className="mx_CardToCardCard_inputGroup">
                                <label>{t("custom_panels|card_to_card_exp_month")}</label>
                                <input
                                    ref={expMonthRef}
                                    type="text"
                                    value={expMonth}
                                    onChange={(e) => handleCardInput(e.target.value, setExpMonth, 2)}
                                    maxLength={2}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="mx_CardToCardCard_inputGroup">
                                <label>{t("custom_panels|card_to_card_exp_year")}</label>
                                <input
                                    ref={expYearRef}
                                    type="text"
                                    value={expYear}
                                    onChange={(e) => handleCardInput(e.target.value, setExpYear, 2)}
                                    maxLength={2}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="mx_CardToCardCard_inputGroup">
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
                        <div className="mx_CardToCardCard_inputGroup">
                            <label>{t("custom_panels|card_to_card_otp")}</label>
                            <div className="mx_CardToCardCard_otpGroup">
                                <input
                                    ref={otpRef}
                                    type="text"
                                    value={otp}
                                    onChange={(e) => handleCardInput(e.target.value, setOtp, 6)}
                                    maxLength={6}
                                    inputMode="numeric"
                                    className="mx_CardToCardCard_otpInput"
                                />
                                <button
                                    type="button"
                                    className="mx_CardToCardCard_getOtpBtn"
                                    onClick={handleGetOtp}
                                    disabled={isOtpDisabled}
                                >
                                    {isOtpDisabled ? `${otpTimer}s` : t("custom_panels|card_to_card_get_otp")}
                                </button>
                            </div>
                            {otpTimer > 0 && (
                                <div className="mx_CardToCardCard_timer">
                                    {t("custom_panels|card_to_card_resend_otp", { seconds: String(otpTimer) })}
                                </div>
                            )}
                        </div>
                        <button type="submit" className="mx_CardToCardCard_btnPrimary" disabled={isSubmitting}>
                            {isSubmitting
                                ? t("custom_panels|card_to_card_submitting")
                                : t("custom_panels|card_to_card_submit")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CardToCardCard;
