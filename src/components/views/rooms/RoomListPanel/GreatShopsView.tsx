import React, { JSX } from "react";
import dis from "../../../../dispatcher/dispatcher";
import { Action } from "../../../../dispatcher/actions";

const menuItems = [
    { id: "farmer_room", label: "اتاق کار کشاورز روژین", emoji: "👨‍🌾" },
    { id: "management_rozhin", label: "مدیریت امور روژین", emoji: "🍎" },
    { id: "finance", label: "مدیریت مالی", emoji: "💰" },
    { id: "consulting", label: "مشاوره کشاورز", emoji: "🌾" },
    { id: "notifications", label: "اطلاع رسانی", emoji: "🔔" },
    { id: "education", label: "آموزش و ترویج", emoji: "👨‍🏫" },
    { id: "weather", label: "هواشناسی", emoji: "🌤️" },
];

const talkRooms = [
    { label: "کشاورزی", emoji: "🌿" },
    { label: "خدمات بانکی", emoji: "🏦" },
    { label: "علاقه‌مندی‌ها", emoji: "🧑‍🎨" },
];

export function GreatShopsView(): JSX.Element {
    return (
        <div
            style={{
                fontFamily: "Vazirmatn, Tahoma, sans-serif",
                overflowY: "auto",
                height: "100vh",
                padding: "16px",
                boxSizing: "border-box",
            }}
        >
            {/* Icon Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px",
                    marginBottom: "24px",
                }}
            >
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            dis.dispatch({
                                action: Action.ViewGreatShopPage,
                                page: item.id,
                            });
                        }}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                        }}
                    >
                        <div
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "16px",
                                backgroundColor: "#f5f5f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "28px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                        >
                            {item.emoji}
                        </div>
                        <span
                            style={{
                                fontSize: "11px",
                                color: "#333",
                                textAlign: "center",
                                lineHeight: "1.4",
                            }}
                        >
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Banner */}
            <div
                style={{
                    width: "100%",
                    height: "140px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    marginBottom: "24px",
                    background: "linear-gradient(135deg, #0a1628 0%, #1a3a6b 40%, #0d2d6b 60%, #1a1a4e 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
            >
                {/* Bokeh circles */}
                {[
                    { size: 80, top: "10%", left: "60%", opacity: 0.3, color: "#4fc3f7" },
                    { size: 50, top: "50%", left: "75%", opacity: 0.2, color: "#81d4fa" },
                    { size: 60, top: "20%", left: "80%", opacity: 0.25, color: "#29b6f6" },
                    { size: 40, top: "60%", left: "50%", opacity: 0.2, color: "#4fc3f7" },
                    { size: 30, top: "30%", left: "40%", opacity: 0.15, color: "#b3e5fc" },
                ].map((circle, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            width: circle.size,
                            height: circle.size,
                            borderRadius: "50%",
                            backgroundColor: circle.color,
                            opacity: circle.opacity,
                            top: circle.top,
                            left: circle.left,
                            filter: "blur(12px)",
                        }}
                    />
                ))}
                {/* Globe icon */}
                <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "48px" }}>🌐</div>
                    <div
                        style={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "12px",
                            marginTop: "4px",
                        }}
                    >
                        دنیای دیجیتال کشاورزی
                    </div>
                </div>
            </div>

            {/* Talk Rooms Section */}
            <div style={{ marginBottom: "16px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "16px",
                    }}
                >
                    <span style={{ fontSize: "20px" }}>🦉</span>
                    <span
                        style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#222",
                        }}
                    >
                        تالارهای گفتگو
                    </span>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "12px",
                    }}
                >
                    {talkRooms.map((room, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "16px",
                                padding: "20px 12px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                cursor: "pointer",
                                border: "1px solid #f0f0f0",
                            }}
                        >
                            <span style={{ fontSize: "32px" }}>{room.emoji}</span>
                            <span style={{ fontSize: "13px", color: "#333", fontWeight: "500" }}>{room.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
