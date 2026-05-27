import React, { useState } from "react";
import { bodyStyle, FormHeader, green } from "./shared";

interface InvoiceItem {
    id: number;
    name: string;
    farmerShare: number;
    companyShare: number;
}

const initialItems: InvoiceItem[] = [
    { id: 1, name: "سم نوع الف", farmerShare: 500000, companyShare: 500000 },
    { id: 2, name: "سم نوع ب", farmerShare: 350000, companyShare: 350000 },
    { id: 3, name: "کود نوع ۱", farmerShare: 450000, companyShare: 450000 },
    { id: 4, name: "کود نوع ۲", farmerShare: 450000, companyShare: 500000 },
    { id: 5, name: "نشاء", farmerShare: 900000, companyShare: 0 },
    { id: 6, name: "کلینیک", farmerShare: 250000, companyShare: 0 },
    { id: 7, name: "مشاوره", farmerShare: 200000, companyShare: 0 },
    { id: 8, name: "حمل و نقل", farmerShare: 400000, companyShare: 0 },
];

const fmt = (n: number) => n.toLocaleString("fa-IR");

export function InvoiceForm({ onClose }: { onClose: () => void }) {
    const [items] = useState(initialItems);
    const totalFarmer = items.reduce((s, i) => s + i.farmerShare, 0);
    const totalCompany = items.reduce((s, i) => s + i.companyShare, 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <FormHeader title="صورتحساب گوجه‌کار" onClose={onClose} />
            <div style={bodyStyle}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>
                            <th style={th}>ردیف</th>
                            <th style={{ ...th, textAlign: "right" }}>آیتم هزینه</th>
                            <th style={th}>سهم کشاورز (تومان)</th>
                            <th style={th}>سهم شرکت (تومان)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr
                                key={item.id}
                                style={{
                                    backgroundColor: i % 2 === 0 ? "white" : "#f9fafb",
                                    borderBottom: "1px solid #e5e7eb",
                                }}
                            >
                                <td style={td}>{item.id}</td>
                                <td style={{ ...td, textAlign: "right" }}>{item.name}</td>
                                <td style={td}>{fmt(item.farmerShare)}</td>
                                <td style={{ ...td, color: item.companyShare > 0 ? "#6b7280" : "#9ca3af" }}>
                                    {item.companyShare > 0 ? fmt(item.companyShare) : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: "#f0fdf4", borderTop: `2px solid ${green}` }}>
                            <td colSpan={2} style={{ ...td, textAlign: "right", fontWeight: 700, color: green }}>
                                جمع کل
                            </td>
                            <td style={{ ...td, fontWeight: 700, color: green }}>{fmt(totalFarmer)}</td>
                            <td style={{ ...td, fontWeight: 700, color: "#6b7280" }}>{fmt(totalCompany)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style={{ marginTop: 16, padding: "12px 16px", borderTop: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, color: "#9ca3af" }}>جمع کل سهم کشاورز:</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: green }}>{fmt(totalFarmer)} تومان</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                        بصورت «بدهی موقت» که از محل فروش گوجه مستهلک می‌شود.
                    </p>
                </div>
            </div>
        </div>
    );
}

const th: React.CSSProperties = {
    padding: "10px 8px",
    textAlign: "center",
    fontWeight: 600,
    borderBottom: "1px solid #d1d5db",
};
const td: React.CSSProperties = { padding: "10px 8px", textAlign: "center", color: "#6b7280" };
