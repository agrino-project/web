import React, { useState } from "react";
import { bodyStyle, FormHeader, green, inputStyle, labelStyle } from "./shared";

interface LogisticsFormData {
    contractId: string;
    farmerName: string;
    farmLocation: string;
    crop: string;
    stage: string;
    inputType: string;
    inputName: string;
    requestedAmount: string;
    packageType: string;
    batchNumber: string;
    qualityNote: string;
    deliveryDate: string;
    timeSlot: "morning" | "noon" | "evening" | "no-pref";
    urgency: "normal" | "urgent";
    farmAddress: string;
    recipientPhone: string;
    routeNote: string;
}

const inputTypeOptions = [
    { value: "pesticide", label: "سم" },
    { value: "fertilizer", label: "کود" },
    { value: "seed", label: "بذر" },
    { value: "seedling", label: "نشاء" },
];

const packageOptions = [
    { value: "bag", label: "کیسه" },
    { value: "box", label: "جعبه" },
    { value: "bottle", label: "بطری" },
    { value: "gallon", label: "گالن" },
];

export function LogisticsForm({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState<LogisticsFormData>({
        contractId: "#CT-1042",
        farmerName: "علی رضایی",
        farmLocation: "مزرعه شماره ۳ – روستای کهریزک",
        crop: "گوجه‌فرنگی",
        stage: "مرحله داشت",
        inputType: "",
        inputName: "",
        requestedAmount: "",
        packageType: "",
        batchNumber: "",
        qualityNote: "",
        deliveryDate: "",
        timeSlot: "no-pref",
        urgency: "normal",
        farmAddress: "مزرعه شماره ۳ – روستای کهریزک",
        recipientPhone: "",
        routeNote: "",
    });

    const set = (key: keyof LogisticsFormData) => (e: any) => {
        const val = e.target ? e.target.value : e;
        setForm((prev) => ({ ...prev, [key]: val }));
    };

    const handleSubmit = () => {
        console.log("Logistics request:", form);
        alert("درخواست لجستیک با موفقیت ثبت شد");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <FormHeader title="لجستیک ارسال کود و سم و بذر" onClose={onClose} />
            <div style={bodyStyle}>
                <div style={cardStyle}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
                        اطلاعات قرارداد
                    </div>
                    <InfoRow label="شناسه قرارداد:" value={form.contractId} />
                    <InfoRow label="نام کشاورز:" value={form.farmerName} />
                    <InfoRow label="مزرعه مقصد:" value={form.farmLocation} />
                    <InfoRow label="محصول کشت‌شده:" value={form.crop} />
                    <InfoRow label="مرحله فعلی کشت:" value={form.stage} last />
                </div>

                <div style={cardStyle}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 12 }}>
                        اطلاعات نهاده
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>نوع نهاده</label>
                        <select value={form.inputType} onChange={set("inputType")} style={inputStyle}>
                            <option value="">انتخاب کنید</option>
                            {inputTypeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>نام نهاده</label>
                        <input
                            type="text"
                            placeholder="نام نهاده"
                            value={form.inputName}
                            onChange={set("inputName")}
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div>
                                <label style={labelStyle}>مقدار درخواستی</label>
                                <input
                                    type="text"
                                    placeholder="مثال: ۱۵ کیسه"
                                    value={form.requestedAmount}
                                    onChange={set("requestedAmount")}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>نوع بسته‌بندی</label>
                                <select value={form.packageType} onChange={set("packageType")} style={inputStyle}>
                                    <option value="">انتخاب</option>
                                    {packageOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>
                            شماره بچ / سری ساخت <span style={{ color: "#9ca3af", fontWeight: 400 }}>(اختیاری)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="شماره بچ"
                            value={form.batchNumber}
                            onChange={set("batchNumber")}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>
                            توضیح کیفیت / برند <span style={{ color: "#9ca3af", fontWeight: 400 }}>(اختیاری)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="مثال: برند X، کیفیت A"
                            value={form.qualityNote}
                            onChange={set("qualityNote")}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 12 }}>زمان تحویل</div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>تاریخ تحویل ترجیحی</label>
                        <input
                            type="text"
                            placeholder="مثال: ۱۴۰۴/۰۳/۱۵"
                            value={form.deliveryDate}
                            onChange={set("deliveryDate")}
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ ...labelStyle, marginBottom: 8 }}>بازه زمانی تحویل</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {[
                                { value: "morning", label: "صبح" },
                                { value: "noon", label: "ظهر" },
                                { value: "evening", label: "عصر" },
                                { value: "no-pref", label: "بدون ترجیح" },
                            ].map((opt) => (
                                <label key={opt.value} style={radioLabelStyle}>
                                    <input
                                        type="radio"
                                        name="timeSlot"
                                        value={opt.value}
                                        checked={form.timeSlot === opt.value}
                                        onChange={set("timeSlot")}
                                        style={{ marginLeft: 6 }}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{ ...labelStyle, marginBottom: 8 }}>فوریت</label>
                        <div style={{ display: "flex", gap: 16 }}>
                            {[
                                { value: "normal", label: "عادی" },
                                { value: "urgent", label: "فوری" },
                            ].map((opt) => (
                                <label key={opt.value} style={radioLabelStyle}>
                                    <input
                                        type="radio"
                                        name="urgency"
                                        value={opt.value}
                                        checked={form.urgency === opt.value}
                                        onChange={set("urgency")}
                                        style={{ marginLeft: 6 }}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 12 }}>محل تحویل</div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>آدرس مزرعه</label>
                        <input
                            type="text"
                            disabled
                            value={form.farmAddress}
                            style={{ ...inputStyle, backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={labelStyle}>شماره تماس تحویل‌گیرنده</label>
                        <input
                            type="text"
                            placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                            maxLength={11}
                            value={form.recipientPhone}
                            onChange={set("recipientPhone")}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>
                            توضیحات مسیر <span style={{ color: "#9ca3af", fontWeight: 400 }}>(اختیاری)</span>
                        </label>
                        <input
                            type="text"
                            placeholder='مثال: "جاده خاکی ۲ کیلومتر بعد از روستا"'
                            value={form.routeNote}
                            onChange={set("routeNote")}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <button onClick={handleSubmit} style={submitBtnStyle}>
                    ثبت درخواست
                </button>
            </div>
        </div>
    );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                padding: "4px 0",
                borderBottom: last ? "none" : "1px solid #e5e7eb",
            }}
        >
            <span style={{ color: "#9ca3af" }}>{label}</span>
            <span style={{ color: "#6b7280", fontWeight: 500 }}>{value}</span>
        </div>
    );
}

const cardStyle: React.CSSProperties = {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginBottom: 16,
};

const radioLabelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    fontSize: 14,
    color: "#6b7280",
    cursor: "pointer",
};

const submitBtnStyle: React.CSSProperties = {
    width: "100%",
    height: 48,
    backgroundColor: green,
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
};
