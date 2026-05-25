import React, { JSX } from "react";
import dis from "../../../../dispatcher/dispatcher";
import { Action } from "../../../../dispatcher/actions";

const shopItems = [
    {
        id: "kalleh",
        title: "کاله",
        image: "/images/kalleh.png",
    },
    {
        id: "rozhin",
        title: "روژین",
        image: "/images/rozhin.png",
    },
    {
        id: "haraz",
        title: "هراز",
        image: "/images/haraz.png",
    },
    {
        id: "pegah",
        title: "پگاه",
        image: "/images/pegah.png",
    },
    {
        id: "rozhin-2",
        title: "روژین",
        image: "/images/rozhin.png",
    },
    {
        id: "haraz-2",
        title: "هراز",
        image: "/images/haraz.png",
    },
];

export function GreatShopsView(): JSX.Element {
    return (
        <div
            style={{
                height: "100%",
                overflowY: "auto",
                padding: "12px",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "14px",
                }}
            >
                {shopItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => {
                            dis.dispatch({
                                action: Action.ViewGreatShopPage,
                                page: item.id,
                            });
                        }}
                        style={{
                            background: "#fff",
                            borderRadius: "14px",
                            height: "150px",
                            cursor: "pointer",
                            border: "1px solid #e6e6e6",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {/* Logo */}
                        <div
                            style={{
                                width: "90px",
                                height: "70px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "12px",
                            }}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </div>

                        {/* Title */}
                        <span
                            style={{
                                fontSize: "15px",
                                color: "#222",
                                fontWeight: 500,
                            }}
                        >
                            {item.title}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
