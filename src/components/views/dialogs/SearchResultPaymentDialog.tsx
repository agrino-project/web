/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useState, useRef, useEffect } from "react";

import BaseDialog from "./BaseDialog";

interface Props {
    item: any;
    onFinished(): void;
}

/**
 * A payment form dialog shown when the user clicks "پرداخت" on a search result.
 */
const SearchResultPaymentDialog: React.FC<Props> = ({ item, onFinished }) => {
    const [card1, setCard1] = useState("");
    const [card2, setCard2] = useState("");
    const [card3, setCard3] = useState("");
    const [card4, setCard4] = useState("");
    const [expMonth, setExpMonth] = useState("");
    const [expYear, setExpYear] = useState("");
    const [cvv2, setCvv2] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const card1Ref = useRef<HTMLInputElement>(null);
    const card2Ref = useRef<HTMLInputElement>(null);
    const card3Ref = useRef<HTMLInputElement>(null);
    const card4Ref = useRef<HTMLInputElement>(null);
    const expMonthRef = useRef<HTMLInputElement>(null);
    const expYearRef = useRef<HTMLInputElement>(null);
    const cvv2Ref = useRef<HTMLInputElement>(null);

    useEffect(() => { card1Ref.current?.focus(); }, []);
    useEffect(() => { if (card1.length === 4) card2Ref.current?.focus(); }, [card1]);
    useEffect(() => { if (card2.length === 4) card3Ref.current?.focus(); }, [card2]);
    useEffect(() => { if (card3.length === 4) card4Ref.current?.focus(); }, [card3]);
    useEffect(() => { if (card4.length === 4) expMonthRef.current?.focus(); }, [card4]);
    useEffect(() => { if (expMonth.length === 2) expYearRef.current?.focus(); }, [expMonth]);
    useEffect(() => { if (expYear.length === 2) cvv2Ref.current?.focus(); }, [expYear]);

    const forceNumeric = (value: string): string => value.replace(/[^0-9]/g, "");

    const handleInput = (value: string, setter: (v: string) => void, max: number): void => {
        const numeric = forceNumeric(value);
        if (numeric.length <= max) setter(numeric);
    };

    const handlePay = (): void => {
        const cardNumber = `${card1}${card2}${card3}${card4}`;
        if (cardNumber.length !== 16 || !expMonth || !expYear || !cvv2) {
            return;
        }
        setIsSubmitting(true);
        // Simulate payment processing
        setTimeout(() => {
            setIsSubmitting(false);
            setSuccess(true);
        }, 2000);
    };

    const title = item?.fields?.find((f: any) => f.key === "product_type")?.value
        || item?.all_data?.["نوع محصول"] || "محصول";
    const price = item?.all_data?.["قیمت (تومان)"]
        ? `${Number(item.all_data["قیمت (تومان)"]).toLocaleString("fa-IR")} تومان`
        : "";
    const amount = item?.fields?.find((f: any) => f.key === "amount")?.value || "";
    const unit = item?.fields?.find((f: any) => f.key === "unit")?.value || "";

    if (success) {
        return (
            <BaseDialog title="پرداخت موفق" onFinished={onFinished} fixedWidth={true}>
                <div style={{ textAlign: "center", padding: "24px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <h3 style={{ marginBottom: 8, color: "#326430" }}>پرداخت با موفقیت انجام شد</h3>
                    {title && <p style={{ color: "var(--cpd-color-text-secondary)" }}>{title}</p>}
                    {amount && unit && <p style={{ fontSize: 13 }}>{amount} {unit}</p>}
                    {price && <p style={{ fontWeight: 600, fontSize: 18 }}>{price}</p>}
                    <button
                        onClick={onFinished}
                        style={{
                            marginTop: 20,
                            padding: "10px 32px",
                            borderRadius: 8,
                            border: "none",
                            background: "#326430",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: 14,
                        }}
                    >
                        بستن
                    </button>
                </div>
            </BaseDialog>
        );
    }

    return (
        <BaseDialog title="فرم پرداخت" onFinished={onFinished} fixedWidth={true}>
            <div style={{ padding: "16px 0" }}>
                {/* Item summary */}
                <div
                    style={{
                        background: "var(--cpd-color-bg-subtle-secondary)",
                        borderRadius: 10,
                        padding: "12px 16px",
                        marginBottom: 20,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>{title}</span>
                        {item?.category && (
                            <span style={{ fontSize: 11, background: "#326430", color: "#fff", padding: "2px 8px", borderRadius: 999 }}>
                                {item.category}
                            </span>
                        )}
                    </div>
                    {amount && unit && (
                        <div style={{ fontSize: 13, color: "var(--cpd-color-text-secondary)" }}>
                            مقدار: {amount} {unit}
                        </div>
                    )}
                    {price && (
                        <div style={{ fontWeight: 700, color: "#326430", marginTop: 4, fontSize: 16 }}>
                            {price}
                        </div>
                    )}
                </div>

                {/* Card number */}
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
                    شماره کارت
                </label>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, direction: "ltr" }}>
                    <input
                        ref={card1Ref}
                        type="text"
                        value={card1}
                        onChange={(e) => handleInput(e.target.value, setCard1, 4)}
                        maxLength={4}
                        inputMode="numeric"
                        style={inputStyle}
                    />
                    <input
                        ref={card2Ref}
                        type="text"
                        value={card2}
                        onChange={(e) => handleInput(e.target.value, setCard2, 4)}
                        maxLength={4}
                        inputMode="numeric"
                        style={inputStyle}
                    />
                    <input
                        ref={card3Ref}
                        type="text"
                        value={card3}
                        onChange={(e) => handleInput(e.target.value, setCard3, 4)}
                        maxLength={4}
                        inputMode="numeric"
                        style={inputStyle}
                    />
                    <input
                        ref={card4Ref}
                        type="text"
                        value={card4}
                        onChange={(e) => handleInput(e.target.value, setCard4, 4)}
                        maxLength={4}
                        inputMode="numeric"
                        style={inputStyle}
                    />
                </div>

                {/* Expiry + CVV */}
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
                            ماه
                        </label>
                        <input
                            ref={expMonthRef}
                            type="text"
                            value={expMonth}
                            onChange={(e) => handleInput(e.target.value, setExpMonth, 2)}
                            placeholder="06"
                            maxLength={2}
                            inputMode="numeric"
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
                            سال
                        </label>
                        <input
                            ref={expYearRef}
                            type="text"
                            value={expYear}
                            onChange={(e) => handleInput(e.target.value, setExpYear, 2)}
                            placeholder="05"
                            maxLength={2}
                            inputMode="numeric"
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
                            CVV2
                        </label>
                        <input
                            ref={cvv2Ref}
                            type="text"
                            value={cvv2}
                            onChange={(e) => handleInput(e.target.value, setCvv2, 4)}
                            placeholder="123"
                            maxLength={4}
                            inputMode="numeric"
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* Pay button */}
                <button
                    onClick={handlePay}
                    disabled={isSubmitting}
                    style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 8,
                        border: "none",
                        background: isSubmitting ? "#999" : "#326430",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                >
                    {isSubmitting ? "در حال پردازش..." : "پرداخت"}
                </button>
            </div>
        </BaseDialog>
    );
};

const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--cpd-color-border-interactive-secondary)",
    background: "var(--cpd-color-bg-canvas-default)",
    color: "var(--cpd-color-text-primary)",
    fontSize: 15,
    textAlign: "center",
    outline: "none",
};

export default SearchResultPaymentDialog;
