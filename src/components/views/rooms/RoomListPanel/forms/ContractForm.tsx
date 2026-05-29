import React, { useState } from "react";
import {
    green,
    neutralText,
    inputStyle,
    labelStyle,
    StepIndicator,
    FormHeader,
    bodyStyle,
    selectStyle,
    sectionStyle,
    buttonStyle,
} from "./shared.tsx";

const steps = ["اطلاعات شخصی", "مشخصات زمین و محصول", "برنامه تولید", "تأیید نهایی"];

export function ContractForm({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<Record<string, string>>({
        name: "",
        gender: "",
        nationalId: "",
        phone: "",
        address: "",
    });

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <FormHeader title="ثبت درخواست قرارداد" onClose={onClose} />
            {/* Form Content */}
            <div style={bodyStyle}>
                <StepIndicator current={step} steps={steps} />

                {step === 0 && (
                    <div style={sectionStyle}>
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
                            <select style={selectStyle} value={form.gender} onChange={set("gender")}>
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
                    <div style={sectionStyle}>
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
                                    value={form.city ?? ""}
                                    onChange={set("city")}
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
                            <select style={selectStyle} value={form.contractType ?? ""} onChange={set("contractType")}>
                                <option value="" disabled>
                                    انتخاب کنید
                                </option>
                                <option value="direct">مستقیم</option>
                                <option value="indirect">غیرمستقیم</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>رقم (واریته)</label>
                            <select style={selectStyle} value={form.variety ?? ""} onChange={set("variety")}>
                                <option value="" disabled>
                                    انتخاب کنید
                                </option>
                                <option value="v1">واریته ۱</option>
                                <option value="v2">واریته ۲</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>منبع آب</label>
                            <select style={selectStyle} value={form.waterSource ?? ""} onChange={set("waterSource")}>
                                <option value="" disabled>
                                    انتخاب کنید
                                </option>
                                <option value="well">چاه</option>
                                <option value="river">رودخانه</option>
                                <option value="canal">کانال</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>نوع مالکیت زمین</label>
                            <select style={selectStyle} value={form.ownership ?? ""} onChange={set("ownership")}>
                                <option value="" disabled>
                                    انتخاب کنید
                                </option>
                                <option value="owned">ملکی</option>
                                <option value="leased">اجاره‌ای</option>
                                <option value="shared">مشارکتی</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>
                                نوع خاک <span style={{ color: neutralText, fontWeight: 400 }}>(اختیاری)</span>
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
                    <div style={sectionStyle}>
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
                        <div style={sectionStyle}>
                            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>پیش‌نمایش اطلاعات</div>
                            {[
                                { label: "نام", value: form.name },
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
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        borderBottom: "1px solid #eee",
                                        paddingBottom: 6,
                                    }}
                                >
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
                                border: `1px solid ${green}`,
                                color: green,
                                fontSize: 14,
                                fontWeight: 500,
                                textDecoration: "none",
                                background: "transparent",
                            }}
                        >
                            <span>📄</span>
                            مشاهده پیش‌نمایش قرارداد
                        </a>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: 12,
                                background: "#f9f9f9",
                                borderRadius: 12,
                            }}
                        >
                            <input
                                type="checkbox"
                                id="acceptRules"
                                checked={!!form.acceptRules}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, acceptRules: e.target.checked ? "true" : "" }))
                                }
                                style={{ width: 18, height: 18, accentColor: green, cursor: "pointer" }}
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
                                ...buttonStyle,
                                border: `1px solid ${green}`,
                                background: "white",
                                color: green,
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
                            ...buttonStyle,
                            backgroundColor: step === steps.length - 1 && !form.acceptRules ? "#d1d5db" : green,
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
