import React, { useState } from "react";
import { JSX } from "react";
import rozhinLogo from "../../../../../res/img/great-shops/rozhin.png";

const menuItems = [
    { title: "ثبت درخواست قرارداد", desc: "تکمیل فرم الکترونیک قرارداد توسط کشاورز (گوجه کار)." },
    {
        title: "ثبت درخواست سم، کود، نشاء و بذر",
        desc: "ثبت درخواست سم، کود، نشاء، بذر مورد نیاز متناسب با مفاد قرارداد.",
    },
    { title: "صورتحساب گوجه‌کار", desc: "ایجاد صورتحساب گوجه کاران برای هزینه سم، کود، نشاء، بذر و سایر هزینه‌ها." },
    { title: "لجستیک ارسال کود و سم و بذر", desc: "مدیریت حمل‌ونقل سم، کود، نشاء، بذر" },
    { title: "ثبت درخواست مشاوره", desc: "بررسی خاک و آب، وضعیت دما و رطوبت، و استفاده از آفت‌کش‌های مناسب." },
    { title: "اعلان فروش محصول", desc: "اعلام حجم محصول قابل عرضه و نوبت‌دهی برای تحویل محصول." },
    { title: "لجستیک حمل محصول به کارخانه", desc: "مدیریت حمل‌ونقل محصول از مزرعه به کارخانه." },
];

const steps = ["اطلاعات شخصی", "مشخصات زمین و محصول", "برنامه تولید", "تأیید نهایی"];

const green = "#10b981";
const neutralBg = "#e5e7eb";
const neutralText = "#9ca3af";

function StepIndicator({ current }: { current: number }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 4,
                marginBottom: 24,
                width: "100%",
            }}
        >
            {steps.map((label, i) => (
                <React.Fragment key={i}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                            width: 60,
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: "bold",
                                backgroundColor: i === current ? green : neutralBg,
                                color: i === current ? "white" : neutralText,
                                flexShrink: 0,
                                zIndex: 2,
                            }}
                        >
                            {i + 1}
                        </div>
                        <span
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                width: "100%",
                                lineHeight: "1.2",
                                color: i === current ? green : neutralText,
                                fontWeight: i === current ? 600 : 400,
                                minHeight: 24,
                            }}
                        >
                            {label}
                        </span>
                    </div>

                    {i < steps.length - 1 && (
                        <div
                            style={{
                                flex: 1,
                                height: 2,
                                backgroundColor: neutralBg,
                                marginTop: 14,
                                marginLeft: -8,
                                marginRight: -8,
                                minWidth: 10,
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    textAlign: "start",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "start",
};

function ContractForm({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<Record<string, string>>({ name: "", gender: "", nationalId: "", phone: "", address: "" });

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <div
                style={{
                    fontWeight: "bold",
                    color: "#6b7280",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderBottom: "1px solid #e6e6e6",
                    height: 62,
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        right: 16,
                        border: "none",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#6b7280",
                        transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
                ثبت درخواست قرارداد
            </div>

            {/* Form Content */}
            <div
                style={{
                    padding: "24px 48px",
                    margin: "0 auto",
                    width: "100%",
                    overflowY: "auto",
                    flex: 1,
                    boxSizing: "border-box",
                    minHeight: 0,
                }}
            >
                <StepIndicator current={step} />

                {step === 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={labelStyle}>نام و نام خانوادگی</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: علی رضایی"
                                value={form.name}
                                onChange={set("name")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>جنسیت</label>
                            <select
                                style={{ ...inputStyle, color: form.gender ? "#111" : neutralText }}
                                value={form.gender}
                                onChange={set("gender")}
                            >
                                <option value="" disabled>
                                    انتخاب کنید
                                </option>
                                <option value="male">مرد</option>
                                <option value="female">زن</option>
                            </select>
                        </div>
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
                            <label style={labelStyle}>شماره تلفن همراه</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                                maxLength={11}
                                value={form.phone}
                                onChange={set("phone")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>آدرس</label>
                            <input
                                style={inputStyle}
                                placeholder="آدرس محل سکونت"
                                value={form.address}
                                onChange={set("address")}
                            />
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={labelStyle}>کد بهره‌بردار</label>
                            <input
                                style={inputStyle}
                                placeholder="کد بهره‌بردار"
                                value={form.operatorCode ?? ""}
                                onChange={set("operatorCode")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>موقعیت جغرافیایی (GPS)</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: ۳۵.۶۸, ۵۱.۳۸"
                                value={form.gps ?? ""}
                                onChange={set("gps")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>روستا</label>
                            <input
                                style={inputStyle}
                                placeholder="نام روستا"
                                value={form.village ?? ""}
                                onChange={set("village")}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>دهستان</label>
                                <input
                                    style={inputStyle}
                                    placeholder="دهستان"
                                    value={form.district ?? ""}
                                    onChange={set("district")}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>شهرستان</label>
                                <input
                                    style={inputStyle}
                                    placeholder="شهرستان"
                                    value={form.county ?? ""}
                                    onChange={set("county")}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>مساحت (هکتار)</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: ۲.۵"
                                value={form.area ?? ""}
                                onChange={set("area")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>نوع قرارداد</label>
                            <select
                                style={{ ...inputStyle, color: form.contractType ? "#111" : neutralText }}
                                value={form.contractType ?? ""}
                                onChange={set("contractType")}
                            >
                                <option value="" disabled>انتخاب کنید</option>
                                <option value="direct">مستقیم</option>
                                <option value="indirect">غیرمستقیم</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>رقم (واریته)</label>
                            <select
                                style={{ ...inputStyle, color: form.variety ? "#111" : neutralText }}
                                value={form.variety ?? ""}
                                onChange={set("variety")}
                            >
                                <option value="" disabled>انتخاب کنید</option>
                                <option value="v1">واریته ۱</option>
                                <option value="v2">واریته ۲</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>منبع آب</label>
                            <select
                                style={{ ...inputStyle, color: form.waterSource ? "#111" : neutralText }}
                                value={form.waterSource ?? ""}
                                onChange={set("waterSource")}
                            >
                                <option value="" disabled>انتخاب کنید</option>
                                <option value="well">چاه</option>
                                <option value="river">رودخانه</option>
                                <option value="canal">کانال</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>نوع مالکیت زمین</label>
                            <select
                                style={{ ...inputStyle, color: form.ownership ? "#111" : neutralText }}
                                value={form.ownership ?? ""}
                                onChange={set("ownership")}
                            >
                                <option value="" disabled>انتخاب کنید</option>
                                <option value="owned">ملکی</option>
                                <option value="leased">اجاره‌ای</option>
                                <option value="shared">مشارکتی</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>
                                نوع خاک{" "}
                                <span style={{ color: neutralText, fontWeight: 400 }}>(اختیاری)</span>
                            </label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: رسی، شنی، لومی"
                                value={form.soilType ?? ""}
                                onChange={set("soilType")}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={labelStyle}>حجم تخمینی تولید (تن)</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: ۵۰"
                                value={form.estimatedVolume ?? ""}
                                onChange={set("estimatedVolume")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>تاریخ کاشت</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: ۱۴۰۴/۰۲/۰۱"
                                value={form.plantingDate ?? ""}
                                onChange={set("plantingDate")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>تاریخ تخمین برداشت</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: ۱۴۰۴/۰۵/۱۵"
                                value={form.harvestDate ?? ""}
                                onChange={set("harvestDate")}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>الگوی کشت قبلی (سال گذشته)</label>
                            <input
                                style={inputStyle}
                                placeholder="مثال: گندم، ذرت، ..."
                                value={form.previousCrop ?? ""}
                                onChange={set("previousCrop")}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{
                            padding: 16,
                            background: "#f9f9f9",
                            borderRadius: 12,
                            border: "1px solid #e5e5e5",
                            fontSize: 13,
                            color: "#444",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>پیش‌نمایش اطلاعات</div>
                            {[
                                { label: "نام", value: form.fullName },
                                { label: "کد ملی", value: form.nationalId },
                                { label: "شماره تماس", value: form.phone },
                                { label: "روستا", value: form.village },
                                { label: "شهرستان", value: form.city },
                                { label: "مساحت", value: form.area },
                                { label: "رقم", value: form.variety },
                                { label: "منبع آب", value: form.waterSource },
                                { label: "حجم تولید", value: form.estimatedVolume },
                                { label: "تاریخ کاشت", value: form.plantingDate },
                            ].map(({ label, value }) => (
                                <div key={label} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    borderBottom: "1px solid #eee",
                                    paddingBottom: 6,
                                }}>
                                    <span style={{ color: "#888" }}>{label}:</span>
                                    <span>{value || "—"}</span>
                                </div>
                            ))}
                        </div>

                        <a
                            href="/files/1404-10-21 (gharardad haye jadid goje).pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                padding: "12px 16px",
                                borderRadius: 12,
                                border: "1px solid #4caf50",
                                color: "#4caf50",
                                fontSize: 14,
                                fontWeight: 500,
                                textDecoration: "none",
                                background: "transparent",
                            }}
                        >
                            <span>📄</span>
                            مشاهده پیش‌نمایش قرارداد
                        </a>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: 12,
                            background: "#f9f9f9",
                            borderRadius: 12,
                        }}>
                            <input
                                type="checkbox"
                                id="acceptRules"
                                checked={!!form.acceptRules}
                                onChange={(e) => setForm((prev) => ({ ...prev, acceptRules: e.target.checked ? "true" : "" }))}
                                style={{ width: 18, height: 18, accentColor: "#4caf50", cursor: "pointer" }}
                            />
                            <label htmlFor="acceptRules" style={{ fontSize: 14, color: "#444", cursor: "pointer" }}>
                                قوانین و مقررات شرکت روژین را می‌پذیرم
                            </label>
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: 8, paddingTop: 24 }}>
                    {step > 0 && (
                        <button
                            onClick={() => setStep((s) => s - 1)}
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
                            قبلی
                        </button>
                    )}
                    <button
                        disabled={step === steps.length - 1 && !form.acceptRules}
                        onClick={() => {
                            if (step < steps.length - 1) {
                                setStep((s) => s + 1);
                            } else {
                                console.log("submit", form);
                                alert("درخواست شما با موفقیت ارسال شد.");
                            }
                        }}
                        style={{
                            flex: 1,
                            height: 48,
                            borderRadius: 12,
                            border: "none",
                            backgroundColor: step === steps.length - 1 && !form.acceptRules ? "#d1d5db" : green,
                            color: "white",
                            fontSize: 16,
                            cursor: step === steps.length - 1 && !form.acceptRules ? "not-allowed" : "pointer",
                        }}
                    >
                        {step < steps.length - 1 ? "بعدی" : "ارسال برای بررسی شرکت"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export function GreatShopsForm({ page }: { page: string }): JSX.Element {
    const [activeForm, setActiveForm] = useState<string | null>(null);

    if (activeForm === "ثبت درخواست قرارداد") {
        return <ContractForm onClose={() => setActiveForm(null)} />;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div
                style={{
                    fontWeight: "bold",
                    color: "#6b7280",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderBottom: "1px solid #e6e6e6",
                    height: 76,
                }}
            >
                اتاق کار کشاورز روژین
            </div>
            <div
                style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    height: "100%",
                    overflowY: "auto",
                }}
            >
                {menuItems.map((item, i) => (
                    <div
                        key={i}
                        onClick={() => setActiveForm(item.title)}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 16,
                            backgroundColor: "white",
                            border: "1px solid #e6e6e6",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            borderRadius: 12,
                            padding: 16,
                            cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)")}
                    >
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                backgroundImage: `url(${rozhinLogo})`,
                                backgroundSize: "contain",
                                backgroundRepeat: "no-repeat",
                                flexShrink: 0,
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px 0" }}>{item.title}</h3>
                            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
