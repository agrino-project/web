import { GreatShopsHeader, greatShopWrapperStyle } from "./shared";
import React, { useState } from "react";
import { JSX } from "react";
import ContractLogo from "../../../../../../res/img/great-shops/Contract.svg";
import PesticideLogo from "../../../../../../res/img/great-shops/Pesticide.svg";
import InvoiceLogo from "../../../../../../res/img/great-shops/Invoice.svg";
import LogisticsLogo from "../../../../../../res/img/great-shops/Logistics.svg";
import ConsultationLogo from "../../../../../../res/img/great-shops/Consultation.svg";
import SaleAnnouncementLogo from "../../../../../../res/img/great-shops/SaleAnnouncement.svg";
import FreightLogo from "../../../../../../res/img/great-shops/Freight.svg";
import { ContractForm } from "../forms/ContractForm";
import { PesticideForm } from "../forms/PesticideForm";
import { InvoiceForm } from "../forms/InvoiceForm";
import { LogisticsForm } from "../forms/LogisticsForm";
import { ConsultationForm } from "../forms/ConsultationForm";
import { SaleAnnouncementForm } from "../forms/SaleAnnouncementForm";
import { FreightForm } from "../forms/FreightForm";

const menuItems = [
    { title: "ثبت درخواست قرارداد", desc: "تکمیل فرم الکترونیک قرارداد توسط کشاورز (گوجه کار).", logo: ContractLogo },
    {
        title: "ثبت درخواست سم، کود، نشاء و بذر",
        desc: "ثبت درخواست سم، کود، نشاء، بذر مورد نیاز متناسب با مفاد قرارداد.",
        logo: PesticideLogo,
    },
    {
        title: "صورتحساب گوجه‌کار",
        desc: "ایجاد صورتحساب گوجه کاران برای هزینه سم، کود، نشاء، بذر و سایر هزینه‌ها.",
        logo: InvoiceLogo,
    },
    { title: "لجستیک ارسال کود و سم و بذر", desc: "مدیریت حمل‌ونقل سم، کود، نشاء، بذر", logo: LogisticsLogo },
    {
        title: "ثبت درخواست مشاوره",
        desc: "بررسی خاک و آب، وضعیت دما و رطوبت، و استفاده از آفت‌کش‌های مناسب.",
        logo: ConsultationLogo,
    },
    {
        title: "اعلان فروش محصول",
        desc: "اعلام حجم محصول قابل عرضه و نوبت‌دهی برای تحویل محصول.",
        logo: SaleAnnouncementLogo,
    },
    { title: "لجستیک حمل محصول به کارخانه", desc: "مدیریت حمل‌ونقل محصول از مزرعه به کارخانه.", logo: FreightLogo },
];

export function HarazWorkRoom() {
    const [activeForm, setActiveForm] = useState<string | null>(null);

    const formMap: Record<string, JSX.Element> = {
        "ثبت درخواست قرارداد": <ContractForm onClose={() => setActiveForm(null)} />,
        "ثبت درخواست سم، کود، نشاء و بذر": <PesticideForm onClose={() => setActiveForm(null)} />,
        "صورتحساب گوجه‌کار": <InvoiceForm onClose={() => setActiveForm(null)} />,
        "لجستیک ارسال کود و سم و بذر": <LogisticsForm onClose={() => setActiveForm(null)} />,
        "ثبت درخواست مشاوره": <ConsultationForm onClose={() => setActiveForm(null)} />,
        "اعلان فروش محصول": <SaleAnnouncementForm onClose={() => setActiveForm(null)} />,
        "لجستیک حمل محصول به کارخانه": <FreightForm onClose={() => setActiveForm(null)} />,
    };

    if (activeForm && formMap[activeForm]) {
        return formMap[activeForm];
    }
    return (
        <div style={greatShopWrapperStyle}>
            <GreatShopsHeader title="اتاق کار کشاورز هراز" />
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
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                backgroundColor: "#326430",
                            }}
                        >
                            <div
                                style={{
                                    width: 24,
                                    height: 24,
                                    backgroundImage: `url(${item.logo})`,
                                    backgroundSize: "contain",
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "center",
                                }}
                            />
                        </div>
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
