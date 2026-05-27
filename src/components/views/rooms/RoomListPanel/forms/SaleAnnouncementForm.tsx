import React, { useState } from "react";
import { green, inputStyle, labelStyle, StepIndicator, FormHeader, bodyStyle } from "./shared";

const steps = ["اعلان کشاورز", "تخصیص نوبت", "تأیید نهایی"];

export function SaleAnnouncementForm({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<Record<string, string>>({
        readyDate: "",
        estimatedVolume: "",
    });

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    // Mock data for step 2 (company-assigned slot)
    const assignedSlot = {
        volume: form.estimatedVolume || "—",
        date: "۱۴۰۴/۰۶/۰۳",
        timeRange: "صبح (۸ تا ۱۲)",
    };

    // Mock financial data for step 3
    const financial = {
        totalValue: 30_000_000,
        debtAmortized: 3_050_000,
        netPayable: 26_950_000,
    };

    const fmt = (n: number) => n.toLocaleString("fa-IR");

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <FormHeader title="اعلان فروش محصول" onClose={onClose} />

            <div style={bodyStyle}>
                <StepIndicator current={step} steps={steps} />

                {/* Step 0 — Farmer Announcement */}
                {step === 0 && (
                    <div
                        style={{
                            padding: 16,
                            backgroundColor: "#F9FAFB",
                            borderRadius: 12,
                            border: "1px solid #E5E7EB",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>اعلان کشاورز</div>

                        <div>
                            <label style={labelStyle}>تاریخ آماده شدن محصول</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: هفته اول شهریور / ۱۴۰۴/۰۶/۰۱"
                                value={form.readyDate}
                                onChange={set("readyDate")}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>حجم تخمینی (تن)</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: ۵۰"
                                value={form.estimatedVolume}
                                onChange={set("estimatedVolume")}
                            />
                        </div>
                    </div>
                )}

                {/* Step 1 — Company Slot Assignment */}
                {step === 1 && (
                    <div
                        style={{
                            padding: 16,
                            backgroundColor: "#F9FAFB",
                            borderRadius: 12,
                            border: "1px solid #E5E7EB",
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                        }}
                    >
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>
                            تخصیص نوبت توسط شرکت
                        </div>

                        {[
                            { label: "حجم اعلام‌شده:", value: `${assignedSlot.volume} تن` },
                            { label: "تاریخ نوبت:", value: assignedSlot.date },
                            { label: "محدوده زمانی:", value: assignedSlot.timeRange },
                        ].map(({ label, value }, i, arr) => (
                            <div
                                key={label}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    borderBottom: i < arr.length - 1 ? "1px solid #E5E7EB" : "none",
                                }}
                            >
                                <span style={{ fontSize: 14, color: "#9CA3AF" }}>{label}</span>
                                <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 2 — Confirmed */}
                {step === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Success indicator */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 8,
                                paddingTop: 8,
                                paddingBottom: 8,
                            }}
                        >
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    backgroundColor: green,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>✓</span>
                            </div>
                            <span style={{ fontWeight: "bold", color: "#374151" }}>نوبت تأیید شد</span>
                        </div>

                        {/* Financial summary */}
                        <div
                            style={{
                                backgroundColor: "white",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                borderRadius: 12,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: green,
                                    padding: "8px 16px",
                                }}
                            >
                                <span style={{ color: "white", fontSize: 14, fontWeight: 600 }}>وضعیت مالی من</span>
                            </div>

                            {[
                                {
                                    label: "ارزش کل محصول تحویلی",
                                    value: `${fmt(financial.totalValue)} تومان`,
                                    color: "#374151",
                                },
                                {
                                    label: "بدهی مستهلک‌شده",
                                    value: `${fmt(financial.debtAmortized)} تومان`,
                                    color: "#EF4444",
                                },
                                {
                                    label: "مانده قابل پرداخت",
                                    value: `${fmt(financial.netPayable)} تومان`,
                                    color: green,
                                },
                            ].map(({ label, value, color }, i, arr) => (
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "12px 16px",
                                        borderBottom: i < arr.length - 1 ? "1px solid #E5E7EB" : "none",
                                    }}
                                >
                                    <span style={{ fontSize: 14, color: "#9CA3AF" }}>{label}</span>
                                    <span style={{ fontSize: 14, fontWeight: 600, color }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation buttons */}
                <div style={{ display: "flex", gap: 8, paddingTop: 24 }}>
                    {step === 1 && (
                        <button
                            onClick={() => setStep(0)}
                            style={{
                                flex: 1,
                                height: 48,
                                borderRadius: 12,
                                border: `1px solid ${green}`,
                                background: "white",
                                color: green,
                                fontSize: 16,
                                cursor: "pointer",
                            }}
                        >
                            ویرایش
                        </button>
                    )}

                    {step < 2 && (
                        <button
                            onClick={() => setStep((s) => s + 1)}
                            style={{
                                flex: 1,
                                height: 48,
                                borderRadius: 12,
                                border: "none",
                                backgroundColor: green,
                                color: "white",
                                fontSize: 16,
                                cursor: "pointer",
                            }}
                        >
                            {step === 0 ? "ارسال اعلان" : "تأیید نوبت"}
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            onClick={() => {
                                console.log("Sale announcement confirmed", form);
                                onClose();
                            }}
                            style={{
                                flex: 1,
                                height: 48,
                                borderRadius: 12,
                                border: "none",
                                backgroundColor: green,
                                color: "white",
                                fontSize: 16,
                                cursor: "pointer",
                            }}
                        >
                            بستن
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
