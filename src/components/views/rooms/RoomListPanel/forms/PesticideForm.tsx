import React, { useState } from "react";
import { bodyStyle, FormHeader, green, inputStyle, labelStyle, sectionStyle, selectStyle } from "./shared";

interface InputItem {
    type: string;
    name: string;
    totalNeed: string;
    ownStock: string;
    requestAmount: string;
    note: string;
}

export function PesticideForm({ onClose }: { onClose: () => void }) {
    const [items, setItems] = useState<InputItem[]>([
        { type: "", name: "", totalNeed: "", ownStock: "", requestAmount: "", note: "" },
    ]);

    const updateItem = (index: number, field: keyof InputItem, value: string) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const addItem = () => {
        setItems([...items, { type: "", name: "", totalNeed: "", ownStock: "", requestAmount: "", note: "" }]);
    };

    const handleSubmit = () => {
        console.log("submit", items);
        alert("درخواست شما با موفقیت ارسال شد.");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <FormHeader title="ثبت درخواست سم، کود، نشاء و بذر" onClose={onClose} />
            {/* Body */}
            <div style={bodyStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {items.map((item, idx) => (
                        <div key={idx} style={sectionStyle}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 4,
                                }}
                            >
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#6b7280" }}>نهاده {idx + 1}</span>
                            </div>

                            <div>
                                <label style={labelStyle}>نوع نهاده</label>
                                <select
                                    value={item.type}
                                    onChange={(e) => updateItem(idx, "type", e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="">انتخاب کنید</option>
                                    <option value="fertilizer">کود</option>
                                    <option value="pesticide">سم</option>
                                    <option value="seedling">نشاء</option>
                                    <option value="seed">بذر</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>نام نهاده / ترکیب پیشنهادی</label>
                                <input
                                    type="text"
                                    placeholder="مثال: NPK 20-20-20"
                                    value={item.name}
                                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div>
                                    <label style={labelStyle}>نیاز کل مزرعه</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: ۲۰ کیسه"
                                        value={item.totalNeed}
                                        onChange={(e) => updateItem(idx, "totalNeed", e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>موجودی خودم</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: ۵ کیسه"
                                        value={item.ownStock}
                                        onChange={(e) => updateItem(idx, "ownStock", e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>مقدار درخواستی از روژین</label>
                                <input
                                    type="text"
                                    placeholder="مثال: ۱۵ کیسه"
                                    value={item.requestAmount}
                                    onChange={(e) => updateItem(idx, "requestAmount", e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    یادداشت <span style={{ color: "#9ca3af", fontWeight: 400 }}>(اختیاری)</span>
                                </label>
                                <textarea
                                    placeholder="توضیح خاص..."
                                    rows={2}
                                    value={item.note}
                                    onChange={(e) => updateItem(idx, "note", e.target.value)}
                                    style={{ ...inputStyle, resize: "vertical", minHeight: "40px" }}
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addItem}
                        style={{
                            width: "100%",
                            height: 44,
                            borderRadius: 12,
                            border: `1px solid ${green}`,
                            color: green,
                            backgroundColor: "white",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        + افزودن نهاده
                    </button>

                    <button
                        onClick={handleSubmit}
                        style={{
                            width: "100%",
                            height: 48,
                            borderRadius: 12,
                            backgroundColor: green,
                            color: "white",
                            fontSize: 14,
                            fontWeight: 500,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        ارسال درخواست
                    </button>
                </div>
            </div>
        </div>
    );
}
