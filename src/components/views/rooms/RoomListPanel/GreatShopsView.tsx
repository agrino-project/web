import React, { JSX } from "react";
import dis from "../../../../dispatcher/dispatcher";
import { Action } from "../../../../dispatcher/actions";
import kallehLogo from "../../../../../res/img/great-shops/kalleh.png";
import rozhinLogo from "../../../../../res/img/great-shops/rozhin.png";
import harazLogo from "../../../../../res/img/great-shops/haraz.png";
import pegahLogo from "../../../../../res/img/great-shops/pegah.png";

const shopItems = [
    {
        id: "rozhin",
        title: "روژین",
        image: rozhinLogo,
    },
    {
        id: "kalleh",
        title: "کاله",
        image: kallehLogo,
    },
    {
        id: "haraz",
        title: "هراز",
        image: harazLogo,
    },
    {
        id: "pegah",
        title: "پگاه",
        image: pegahLogo,
    },
];

export function GreatShopsView(): JSX.Element {
    return (
        <div
            style={{
                height: "100%",
                overflowY: "auto",
                paddingInline: "16px",
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
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)")}
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
