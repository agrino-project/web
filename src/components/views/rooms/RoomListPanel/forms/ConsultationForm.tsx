import React, { useState } from "react";
import { bodyStyle, FormHeader, inputStyle, labelStyle } from "./shared";

interface ConsultationFormProps {
    onClose: () => void;
}

interface ConsultationStatus {
    id: number;
    subject: string;
    status: "answered" | "pending";
    response?: string;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ onClose }) => {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [visitDate, setVisitDate] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const [consultations] = useState<ConsultationStatus[]>([
        {
            id: 1,
            subject: "آفت برگ",
            status: "answered",
            response: "استفاده از محلول‌پاشی آبامکتین توصیه می‌شود.",
        },
        {
            id: 2,
            subject: "کمبود آهن",
            status: "pending",
        },
    ]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        const data = {
            subject,
            description,
            visitDate,
            image: selectedImage?.name || null,
        };
        console.log("Consultation Request:", data);
        alert("درخواست مشاوره با موفقیت ثبت شد");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <FormHeader
                title="ثبت درخواست مشاوره: بررسی خاک و آب برای کشت محصول،بررسی وضعیت تناسب دما و رطوبت. گیاه شناس برای استفاده از آفت کش ها و سموم مناسب"
                onClose={onClose}
            />

            <div style={bodyStyle}>
                {/* Form Card */}
                <div
                    style={{
                        padding: "16px",
                        backgroundColor: "#F9FAFB",
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280" }}>ثبت درخواست مشاوره</div>

                    {/* Subject */}
                    <div>
                        <label style={labelStyle}>موضوع</label>
                        <input
                            type="text"
                            placeholder="مثال: آفت برگ، کمبود عناصر غذایی"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={labelStyle}>شرح مشکل</label>
                        <textarea
                            placeholder="مشکل را به طور کامل توضیح دهید..."
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                ...inputStyle,
                                resize: "vertical",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label style={labelStyle}>
                            آپلود عکس <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(اختیاری)</span>
                        </label>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                border: "1px dashed #E5E7EB",
                                borderRadius: "12px",
                                padding: "12px 16px",
                                transition: "border-color 0.2s",
                            }}
                        >
                            <span style={{ color: "#10B981", fontSize: "18px" }}>+</span>
                            <span style={{ fontSize: "14px", color: "#9CA3AF" }}>
                                {selectedImage ? selectedImage.name : "انتخاب عکس (برگ بیمار، مزرعه، ...)"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                        </label>
                    </div>

                    {/* Visit Date */}
                    <div>
                        <label style={labelStyle}>
                            تاریخ پیشنهادی بازدید{" "}
                            <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(در صورت لزوم)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="مثال: ۱۴۰۴/۰۴/۱۵"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    style={{
                        width: "100%",
                        height: "48px",
                        backgroundColor: "#10B981",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    ارسال درخواست
                </button>

                {/* Consultation History */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", padding: "0 4px" }}>
                        آخرین وضعیت مشاوره‌ها
                    </div>

                    {consultations.map((consultation) => (
                        <div
                            key={consultation.id}
                            style={{
                                backgroundColor: "white",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                borderRadius: "12px",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>
                                    {consultation.subject}
                                </span>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        padding: "2px 8px",
                                        borderRadius: "9999px",
                                        backgroundColor: consultation.status === "answered" ? "#D1FAE5" : "#FEF3C7",
                                        color: consultation.status === "answered" ? "#10B981" : "#D97706",
                                    }}
                                >
                                    {consultation.status === "answered" ? "پاسخ داده شد" : "در حال بررسی"}
                                </span>
                            </div>
                            {consultation.response && (
                                <p
                                    style={{
                                        fontSize: "14px",
                                        color: "#9CA3AF",
                                        backgroundColor: "#F9FAFB",
                                        borderRadius: "8px",
                                        padding: "8px",
                                        margin: 0,
                                    }}
                                >
                                    {consultation.response}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
