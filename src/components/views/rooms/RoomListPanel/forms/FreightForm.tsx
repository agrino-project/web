import React, { useState } from "react";
import { green, inputStyle, labelStyle, bodyStyle, FormHeader } from "./shared";

interface ShipmentForm {
    origin: string;
    productType: string;
    weight: string;
    billNumber: string;
    driverName: string;
    nationalId: string;
    phone: string;
    sendDate: string;
}

interface PreviousShipment {
    id: string;
    status: "تحویل‌شده" | "در حال حمل";
    origin: string;
    weight: string;
    driver: string;
}

const emptyForm: ShipmentForm = {
    origin: "",
    productType: "",
    weight: "",
    billNumber: "",
    driverName: "",
    nationalId: "",
    phone: "",
    sendDate: "",
};

const previousShipments: PreviousShipment[] = [
    { id: "#BL-301", status: "تحویل‌شده", origin: "روستای کهریزک", weight: "۱۸ تن", driver: "محمد احمدی" },
    { id: "#BL-298", status: "در حال حمل", origin: "مزرعه شماره ۲", weight: "۲۲ تن", driver: "حسن کریمی" },
];

const productOptions = ["گوجه‌فرنگی", "خیار", "فلفل", "بادمجان"];

const statusStyle = (status: PreviousShipment["status"]): React.CSSProperties => ({
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 999,
    backgroundColor: status === "تحویل‌شده" ? "#dcfce7" : "#fef9c3",
    color: status === "تحویل‌شده" ? green : "#ca8a04",
});

export function FreightForm({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState<ShipmentForm>(emptyForm);

    const set = (k: keyof ShipmentForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = () => {
        console.log("freight submit", form);
        alert("بارنامه با موفقیت ثبت شد.");
        setForm(emptyForm);
    };

    const sectionStyle: React.CSSProperties = {
        padding: 16,
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        gap: 12,
    };

    const gridTwo: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <FormHeader title="لجستیک حمل محصول به کارخانه" onClose={onClose} />

            <div style={bodyStyle}>
                {/* Shipment form */}
                <div style={sectionStyle}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>فرم ثبت بار</div>

                    <div>
                        <label style={labelStyle}>مبدا (نام روستا / مزرعه)</label>
                        <input
                            style={inputStyle}
                            placeholder="مثال: روستای کهریزک"
                            value={form.origin}
                            onChange={set("origin")}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>مقصد</label>
                        <input
                            style={{ ...inputStyle, backgroundColor: "#F3F4F6", color: "#9CA3AF" }}
                            value="کارخانه رب روژین"
                            disabled
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>نوع محصول</label>
                        <select
                            style={{ ...inputStyle, appearance: "none" }}
                            value={form.productType}
                            onChange={set("productType")}
                        >
                            <option value="">انتخاب کنید</option>
                            {productOptions.map((o) => (
                                <option key={o} value={o}>
                                    {o}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={gridTwo}>
                        <div>
                            <label style={labelStyle}>وزن (تن)</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: ۲۰"
                                value={form.weight}
                                onChange={set("weight")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>شماره بارنامه</label>
                            <input
                                style={inputStyle}
                                placeholder="شماره بارنامه"
                                value={form.billNumber}
                                onChange={set("billNumber")}
                            />
                        </div>
                    </div>
                </div>

                {/* Driver info */}
                <div style={sectionStyle}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>مشخصات راننده</div>

                    <div>
                        <label style={labelStyle}>نام راننده</label>
                        <input
                            style={inputStyle}
                            placeholder="نام و نام خانوادگی"
                            value={form.driverName}
                            onChange={set("driverName")}
                        />
                    </div>

                    <div style={gridTwo}>
                        <div>
                            <label style={labelStyle}>کد ملی</label>
                            <input
                                style={inputStyle}
                                placeholder="۱۰ رقم"
                                maxLength={10}
                                value={form.nationalId}
                                onChange={set("nationalId")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>تلفن</label>
                            <input
                                style={inputStyle}
                                placeholder="۰۹۱۲..."
                                maxLength={11}
                                value={form.phone}
                                onChange={set("phone")}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>تاریخ ارسال</label>
                        <input
                            style={inputStyle}
                            placeholder="مثال: ۱۴۰۴/۰۶/۰۵"
                            value={form.sendDate}
                            onChange={set("sendDate")}
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    style={{
                        width: "100%",
                        height: 48,
                        borderRadius: 12,
                        border: "none",
                        backgroundColor: green,
                        color: "white",
                        fontSize: 16,
                        cursor: "pointer",
                    }}
                >
                    ثبت بارنامه
                </button>

                {/* Previous shipments */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", paddingRight: 4 }}>بارهای قبلی</div>

                    {previousShipments.map((s) => (
                        <div
                            key={s.id}
                            style={{
                                backgroundColor: "white",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                borderRadius: 12,
                                padding: 16,
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{s.id}</span>
                                <span style={statusStyle(s.status)}>{s.status}</span>
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 4,
                                    fontSize: 12,
                                    color: "#9CA3AF",
                                }}
                            >
                                <span>مبدا: {s.origin}</span>
                                <span>وزن: {s.weight}</span>
                                <span>راننده: {s.driver}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
