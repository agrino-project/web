import React from "react";
import { JSX } from "react";
import rozhinLogo from "../../../../../res/img/great-shops/rozhin.png";

const menuItems = [
    {
        title: "ثبت درخواست قرارداد",
        desc: "تکمیل فرم الکترونیک قرارداد توسط کشاورز (گوجه کار).",
    },
    {
        title: "ثبت درخواست سم، کود، نشاء و بذر",
        desc: "ثبت درخواست سم، کود، نشاء، بذر مورد نیاز متناسب با مفاد قرارداد.",
    },
    {
        title: "صورتحساب گوجه‌کار",
        desc: "ایجاد صورتحساب گوجه کاران برای هزینه سم، کود، نشاء، بذر و سایر هزینه‌ها.",
    },
    {
        title: "لجستیک ارسال کود و سم و بذر",
        desc: "مدیریت حمل‌ونقل سم، کود، نشاء، بذر",
    },
    {
        title: "ثبت درخواست مشاوره",
        desc: "بررسی خاک و آب، وضعیت دما و رطوبت، و استفاده از آفت‌کش‌های مناسب.",
    },
    {
        title: "اعلان فروش محصول",
        desc: "اعلام حجم محصول قابل عرضه و نوبت‌دهی برای تحویل محصول.",
    },
    {
        title: "لجستیک حمل محصول به کارخانه",
        desc: "مدیریت حمل‌ونقل محصول از مزرعه به کارخانه.",
    },
];

export function GreatShopsForm({ page }: { page: string }): JSX.Element {
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
                    height: "76px"
                }}
            >
                اتاق کار کشاورز روژین
            </div>

            {/* Content */}
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
                        onClick={() => console.log(item.title, page)}
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
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, margin: "0 0 4px 0" }}>
                                {item.title}
                            </h3>
                            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
