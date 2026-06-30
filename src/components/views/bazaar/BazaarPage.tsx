/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useMemo, useState } from "react";
import classNames from "classnames";

import { _t } from "../../../languageHandler";

import "../../../../res/css/views/bazaar/BazaarPage.pcss";

type FieldType = "text" | "number" | "textarea";

interface FormField {
    label: string;
    type: FieldType;
    name: string;
}

interface MenuCategory {
    main: string;
    subs: string[];
}

interface AdSample {
    title: string;
    price: number;
    seller: string;
    location: string;
    image: string;
}

interface MyAd {
    main: string;
    sub: string;
    data: Record<string, string>;
    status: string;
}

interface MyPurchase {
    title: string;
    orderCode: number;
    status: string;
    date: string;
}

type DetailStage = "info" | "payment" | "success";

interface DetailState {
    item: AdSample;
    stage: DetailStage;
    orderCode?: number;
}

interface ActiveFilters {
    location: string;
    minPrice: number | null;
    maxPrice: number | null;
}

const MENU_DATA: MenuCategory[] = [
    { main: "زراعت", subs: ["گندم", "جو", "برنج", "ذرت", "یونجه", "کلزا"] },
    {
        main: "دامپروری",
        subs: ["گاو شیری", "گوساله پرواری", "گاومیش", "گوسفند داشتی", "گوسفند پرواری", "بز", "شتر", "اسب"],
    },
    {
        main: "طیور",
        subs: [
            "مرغ تخم‌گذار",
            "مرغ گوشتی",
            "نیمچه گوشتی",
            "نیمچه تخم گذار",
            "بوقلمون",
            "بلدرچین",
            "کبک",
            "شتر مرغ",
        ],
    },
    { main: "آبزی پروری", subs: ["ماهی", "میگو"] },
    {
        main: "محصولات باغی",
        subs: ["سیب", "پرتقال", "انگور", "پسته", "خرما", "لیمو", "کیوی", "گردو", "زردآلو"],
    },
    {
        main: "محصولات دام و طیور",
        subs: ["گوشت مرغ", "گوشت قرمز", "پوست و سالامبور", "شیر", "عسل", "پشم"],
    },
    { main: "محصولات گلخانه ای", subs: ["گوجه", "توت فرنگی", "فلفل دلمه ای"] },
    { main: "ماشین‌آلات کشاورزی", subs: ["تراکتور", "کمباین", "دروگر", "دیسک", "شخم‌زن"] },
    {
        main: "لوازم و تجهیزات",
        subs: ["لوازم آبیاری قطره ای", "ابزارهای باغبانی", "گرمکن مرغداری", "پمپ آب"],
    },
    { main: "نهاده‌ها", subs: ["کود", "سم", "بذر", "خوراک دام", "نشا"] },
    {
        main: "مشاوره و خدمات تخصصی",
        subs: ["آزمایش آب و خاک", "برنامه جیره", "مشاوره دام و طیور"],
    },
    {
        main: "آموزش",
        subs: ["مدیریت گلخانه", "اصلاح و آماده سازی خاک", "کنترل آفات و بیماری های گیاهی"],
    },
    { main: "سایر محصولات", subs: ["محصول ۱", "محصول ۲", "محصول ۳"] },
];

const SPECIAL_FORMS: Record<string, FormField[]> = {
    "گندم": [
        { label: "نوع گندم", type: "text", name: "نوع" },
        { label: "واحد", type: "text", name: "واحد" },
        { label: "درصد رطوبت", type: "number", name: "رطوبت" },
        { label: "مقدار", type: "number", name: "مقدار" },
        { label: "قیمت", type: "number", name: "قیمت" },
        { label: "درجه کیفی", type: "text", name: "کیفیت" },
        { label: "محل تولید", type: "text", name: "تولید" },
        { label: "محل ارسال", type: "text", name: "ارسال" },
    ],
    "جو": [
        { label: "نوع جو", type: "text", name: "نوع" },
        { label: "واحد", type: "text", name: "واحد" },
        { label: "درصد رطوبت", type: "number", name: "رطوبت" },
        { label: "مقدار", type: "number", name: "مقدار" },
        { label: "قیمت", type: "number", name: "قیمت" },
        { label: "درجه کیفی", type: "text", name: "کیفیت" },
        { label: "محل تولید", type: "text", name: "تولید" },
        { label: "محل ارسال", type: "text", name: "ارسال" },
    ],
};

const DEFAULT_FORM: FormField[] = [
    { label: "عنوان آگهی", type: "text", name: "title" },
    { label: "قیمت", type: "number", name: "price" },
    { label: "مقدار", type: "text", name: "amount" },
    { label: "محل تحویل", type: "text", name: "location" },
    { label: "توضیحات", type: "textarea", name: "desc" },
    { label: "شماره تماس", type: "text", name: "phone" },
];

const BUY_SAMPLES: AdSample[] = [
    {
        title: "آگهی نمونه ۱",
        price: 25000000,
        seller: "احمدی",
        location: "تهران",
        image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80",
    },
    {
        title: "آگهی نمونه ۲",
        price: 18500000,
        seller: "رضایی",
        location: "اصفهان",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    },
    {
        title: "آگهی نمونه ۳",
        price: 31000000,
        seller: "محمدی",
        location: "شیراز",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80",
    },
];

type ActivePanel = "none" | "sell" | "preview" | "buy" | "detail" | "history";
type HistoryTab = "ads" | "purchases";

const BazaarPage: React.FC = () => {
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [selectedMain, setSelectedMain] = useState<string>("");
    const [selectedSub, setSelectedSub] = useState<string>("");

    const [activePanel, setActivePanel] = useState<ActivePanel>("none");
    const [historyTab, setHistoryTab] = useState<HistoryTab>("ads");

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [draftAd, setDraftAd] = useState<MyAd | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [myAds, setMyAds] = useState<MyAd[]>([]);
    const [myPurchases, setMyPurchases] = useState<MyPurchase[]>([]);

    const [filterLocation, setFilterLocation] = useState<string>("");
    const [filterMinPrice, setFilterMinPrice] = useState<string>("");
    const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        location: "",
        minPrice: null,
        maxPrice: null,
    });

    const [detail, setDetail] = useState<DetailState | null>(null);

    const fields = useMemo<FormField[]>(
        () => (selectedSub && SPECIAL_FORMS[selectedSub] ? SPECIAL_FORMS[selectedSub] : DEFAULT_FORM),
        [selectedSub],
    );

    const filteredAds = useMemo<AdSample[]>(() => {
        return BUY_SAMPLES.filter((item) => {
            if (activeFilters.location && !item.location.includes(activeFilters.location.trim())) return false;
            if (activeFilters.minPrice !== null && item.price < activeFilters.minPrice) return false;
            if (activeFilters.maxPrice !== null && item.price > activeFilters.maxPrice) return false;
            return true;
        });
    }, [activeFilters]);

    const selectProduct = (main: string, sub: string): void => {
        setSelectedMain(main);
        setSelectedSub(sub);
        setActivePanel("none");
        setEditingIndex(null);
        setFormData({});
    };

    const openSellPanel = (): void => {
        if (!selectedSub) {
            alert(_t("custom_panels|bazaar_select_first"));
            return;
        }
        setActivePanel("sell");
    };

    const openBuyPanel = (): void => {
        if (!selectedSub) {
            alert(_t("custom_panels|bazaar_select_first"));
            return;
        }
        setActivePanel("buy");
    };

    const openHistoryPanel = (): void => {
        setActivePanel("history");
    };

    const onFieldChange = (name: string, value: string): void => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const onSellSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        setDraftAd({ main: selectedMain, sub: selectedSub, data: formData, status: _t("custom_panels|bazaar_status_registered") });
        setActivePanel("preview");
    };

    const onFinalSubmit = (): void => {
        if (!draftAd) return;
        if (editingIndex !== null) {
            setMyAds((prev) => {
                const next = [...prev];
                next[editingIndex] = { ...draftAd, status: _t("custom_panels|bazaar_status_edited") };
                return next;
            });
        } else {
            setMyAds((prev) => [{ ...draftAd, status: _t("custom_panels|bazaar_status_registered") }, ...prev]);
        }
        alert(_t("custom_panels|bazaar_ad_submitted"));
        setActivePanel("none");
        setFormData({});
        setDraftAd(null);
        setEditingIndex(null);
    };

    const editAd = (idx: number): void => {
        const ad = myAds[idx];
        setSelectedMain(ad.main);
        setSelectedSub(ad.sub);
        setFormData(ad.data);
        setEditingIndex(idx);
        setActivePanel("sell");
    };

    const deleteAd = (idx: number): void => {
        setMyAds((prev) => prev.filter((_a, i) => i !== idx));
    };

    const openDetail = (item: AdSample): void => {
        setDetail({ item, stage: "info" });
        setActivePanel("detail");
    };

    const startPayment = (): void => {
        setDetail((prev) => (prev ? { ...prev, stage: "payment" } : prev));
    };

    const confirmPayment = (): void => {
        if (!detail) return;
        const orderCode = Math.floor(Math.random() * 900000 + 100000);
        setMyPurchases((prev) => [
            {
                title: detail.item.title,
                orderCode,
                status: _t("custom_panels|bazaar_status_shipping"),
                date: new Date().toLocaleDateString("fa-IR"),
            },
            ...prev,
        ]);
        setDetail({ ...detail, stage: "success", orderCode });
    };

    const backToBuyList = (): void => {
        setDetail(null);
        setActivePanel("buy");
    };

    const applyFilters = (): void => {
        setActiveFilters({
            location: filterLocation,
            minPrice: filterMinPrice ? parseInt(filterMinPrice, 10) : null,
            maxPrice: filterMaxPrice ? parseInt(filterMaxPrice, 10) : null,
        });
    };

    const resetFilters = (): void => {
        setFilterLocation("");
        setFilterMinPrice("");
        setFilterMaxPrice("");
        setActiveFilters({ location: "", minPrice: null, maxPrice: null });
    };

    const renderField = (f: FormField): React.ReactNode => {
        const value = formData[f.name] ?? "";
        const common = {
            name: f.name,
            value,
            onChange: (
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ): void => onFieldChange(f.name, e.target.value),
        };
        return (
            <div className="mx_BazaarPage_field" key={f.name}>
                <label>{f.label}</label>
                {f.type === "textarea" ? (
                    <textarea {...common} />
                ) : (
                    <input type={f.type} {...common} />
                )}
            </div>
        );
    };

    return (
        <div className="mx_BazaarPage">
            <aside className="mx_BazaarPage_sidebar">
                <div className="mx_BazaarPage_sidebarHeader">
                    <h1>{_t("custom_panels|bazaar")}</h1>
                    <p>{_t("custom_panels|bazaar_subtitle")}</p>
                </div>
                <div className="mx_BazaarPage_menu">
                    {MENU_DATA.map((cat) => {
                        const isOpen = openCategory === cat.main;
                        return (
                            <div
                                key={cat.main}
                                className={classNames("mx_BazaarPage_menuItem", { open: isOpen })}
                            >
                                <button
                                    className={classNames("mx_BazaarPage_menuMain", {
                                        active: selectedMain === cat.main,
                                    })}
                                    onClick={() => setOpenCategory(isOpen ? null : cat.main)}
                                >
                                    <span>{cat.main}</span>
                                    <span className="mx_BazaarPage_chevron">▾</span>
                                </button>
                                {isOpen && (
                                    <div className="mx_BazaarPage_submenu">
                                        {cat.subs.map((sub) => (
                                            <button
                                                key={sub}
                                                className={classNames({
                                                    selected: selectedSub === sub && selectedMain === cat.main,
                                                })}
                                                onClick={() => selectProduct(cat.main, sub)}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>

            <main className="mx_BazaarPage_content">
                <section className="mx_BazaarPage_topbar">
                    <div className="mx_BazaarPage_selectedInfo">
                        <h2>{selectedSub || _t("custom_panels|bazaar_no_selection_title")}</h2>
                        <span>
                            {selectedSub
                                ? `${selectedMain} / ${selectedSub}`
                                : _t("custom_panels|bazaar_no_selection_path")}
                        </span>
                    </div>
                    <div className="mx_BazaarPage_actions">
                        <button className="mx_BazaarPage_btn mx_BazaarPage_btn--buy" onClick={openBuyPanel}>
                            {_t("custom_panels|bazaar_buy")}
                        </button>
                        <button className="mx_BazaarPage_btn mx_BazaarPage_btn--sell" onClick={openSellPanel}>
                            {_t("custom_panels|bazaar_sell")}
                        </button>
                        <button
                            className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                            onClick={openHistoryPanel}
                        >
                            {_t("custom_panels|bazaar_history")}
                        </button>
                    </div>
                </section>

                {activePanel === "sell" && (
                    <section className="mx_BazaarPage_panel">
                        <h3>{_t("custom_panels|bazaar_form_title")}</h3>
                        <form onSubmit={onSellSubmit}>
                            <div className="mx_BazaarPage_grid">{fields.map(renderField)}</div>
                            <div className="mx_BazaarPage_sectionActions">
                                <button
                                    type="submit"
                                    className="mx_BazaarPage_btn mx_BazaarPage_btn--sell"
                                >
                                    {_t("custom_panels|bazaar_submit_initial")}
                                </button>
                                <button
                                    type="button"
                                    className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                    onClick={() => setFormData({})}
                                >
                                    {_t("custom_panels|bazaar_reset_form")}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {activePanel === "preview" && draftAd && (
                    <section className="mx_BazaarPage_panel">
                        <h3>{_t("custom_panels|bazaar_preview_title")}</h3>
                        <div className="mx_BazaarPage_preview">
                            <div>
                                <strong>{_t("custom_panels|bazaar")}:</strong> {draftAd.sub}
                            </div>
                            <div>
                                <strong>{selectedMain}</strong>
                            </div>
                            <pre>{JSON.stringify(draftAd.data, null, 2)}</pre>
                        </div>
                        <div className="mx_BazaarPage_sectionActions">
                            <button className="mx_BazaarPage_btn mx_BazaarPage_btn--sell" onClick={onFinalSubmit}>
                                {_t("custom_panels|bazaar_submit_final")}
                            </button>
                            <button
                                className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                onClick={() => setActivePanel("sell")}
                            >
                                {_t("custom_panels|bazaar_back_to_edit")}
                            </button>
                        </div>
                    </section>
                )}

                {activePanel === "buy" && (
                    <section className="mx_BazaarPage_panel">
                        <h3>{_t("custom_panels|bazaar_related_ads")}</h3>
                        <div className="mx_BazaarPage_filters">
                            <div className="mx_BazaarPage_field">
                                <label>{_t("custom_panels|bazaar_filter_location")}</label>
                                <input
                                    type="text"
                                    value={filterLocation}
                                    onChange={(e) => setFilterLocation(e.target.value)}
                                    placeholder={_t("custom_panels|bazaar_filter_location_placeholder")}
                                />
                            </div>
                            <div className="mx_BazaarPage_field">
                                <label>{_t("custom_panels|bazaar_filter_min_price")}</label>
                                <input
                                    type="number"
                                    value={filterMinPrice}
                                    onChange={(e) => setFilterMinPrice(e.target.value)}
                                    placeholder={_t("custom_panels|bazaar_filter_price_placeholder")}
                                />
                            </div>
                            <div className="mx_BazaarPage_field">
                                <label>{_t("custom_panels|bazaar_filter_max_price")}</label>
                                <input
                                    type="number"
                                    value={filterMaxPrice}
                                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                                    placeholder={_t("custom_panels|bazaar_filter_price_placeholder")}
                                />
                            </div>
                            <div className="mx_BazaarPage_filterButtons">
                                <button
                                    className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                    onClick={applyFilters}
                                >
                                    {_t("custom_panels|bazaar_filter_apply")}
                                </button>
                                <button
                                    className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                    onClick={resetFilters}
                                >
                                    {_t("custom_panels|bazaar_filter_reset")}
                                </button>
                            </div>
                        </div>

                        <div className="mx_BazaarPage_cardList">
                            {filteredAds.length === 0 && (
                                <div className="mx_BazaarPage_empty">
                                    {_t("custom_panels|bazaar_no_filter_results")}
                                </div>
                            )}
                            {filteredAds.map((item) => (
                                <div className="mx_BazaarPage_adCard" key={item.title}>
                                    <img src={item.image} alt={item.title} />
                                    <div className="mx_BazaarPage_adMeta">
                                        <h4>{item.title}</h4>
                                        <p>
                                            {_t("custom_panels|bazaar_seller", { name: item.seller })}
                                            <br />
                                            {item.location}
                                            <br />
                                            {_t("custom_panels|bazaar_price_toman", {
                                                price: item.price.toLocaleString(),
                                            })}
                                        </p>
                                    </div>
                                    <div className="mx_BazaarPage_adActions">
                                        <button
                                            className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                            onClick={() => openDetail(item)}
                                        >
                                            {_t("custom_panels|bazaar_view")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activePanel === "detail" && detail && (
                    <section className="mx_BazaarPage_panel">
                        <h3>{_t("custom_panels|bazaar_detail_title")}</h3>
                        {detail.stage === "info" && (
                            <div className="mx_BazaarPage_buyFlow">
                                <div className="mx_BazaarPage_step">
                                    <div className="mx_BazaarPage_stepTitle">
                                        {_t("custom_panels|bazaar_detail_title")}
                                    </div>
                                    <p>{detail.item.title}</p>
                                    <p>{_t("custom_panels|bazaar_seller", { name: detail.item.seller })}</p>
                                    <p>{detail.item.location}</p>
                                    <p>
                                        {_t("custom_panels|bazaar_price_toman", {
                                            price: detail.item.price.toLocaleString(),
                                        })}
                                    </p>
                                </div>
                                <div className="mx_BazaarPage_step mx_BazaarPage_step--actions">
                                    <button
                                        className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                        onClick={backToBuyList}
                                    >
                                        {_t("custom_panels|bazaar_back_to_list")}
                                    </button>
                                    <button
                                        className="mx_BazaarPage_btn mx_BazaarPage_btn--buy"
                                        onClick={startPayment}
                                    >
                                        {_t("custom_panels|bazaar_pay_now")}
                                    </button>
                                </div>
                            </div>
                        )}
                        {detail.stage === "payment" && (
                            <div className="mx_BazaarPage_buyFlow">
                                <div className="mx_BazaarPage_step">
                                    <div className="mx_BazaarPage_stepTitle">
                                        {_t("custom_panels|bazaar_payment_gateway")}
                                    </div>
                                    <div className="mx_BazaarPage_paymentPlaceholder" />
                                    <div className="mx_BazaarPage_step--actions">
                                        <button
                                            className="mx_BazaarPage_btn mx_BazaarPage_btn--buy"
                                            onClick={confirmPayment}
                                        >
                                            {_t("custom_panels|bazaar_confirm_payment")}
                                        </button>
                                        <button
                                            className="mx_BazaarPage_btn mx_BazaarPage_btn--danger"
                                            onClick={backToBuyList}
                                        >
                                            {_t("custom_panels|bazaar_cancel")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {detail.stage === "success" && (
                            <div className="mx_BazaarPage_buyFlow">
                                <div className="mx_BazaarPage_step">
                                    <div className="mx_BazaarPage_stepTitle">
                                        {_t("custom_panels|bazaar_payment_success")}
                                    </div>
                                    <p>{_t("custom_panels|bazaar_payment_success_desc")}</p>
                                    <p>{_t("custom_panels|bazaar_product", { name: detail.item.title })}</p>
                                    <p>
                                        {_t("custom_panels|bazaar_order_code", {
                                            code: detail.orderCode,
                                        })}
                                    </p>
                                    <p>{_t("custom_panels|bazaar_eta")}</p>
                                    <button
                                        className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                        onClick={backToBuyList}
                                    >
                                        {_t("custom_panels|bazaar_return_to_list")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {activePanel === "history" && (
                    <section className="mx_BazaarPage_panel">
                        <h3>{_t("custom_panels|bazaar_history")}</h3>
                        <div className="mx_BazaarPage_tabButtons">
                            <button
                                className={classNames("mx_BazaarPage_btn mx_BazaarPage_btn--secondary", {
                                    active: historyTab === "ads",
                                })}
                                onClick={() => setHistoryTab("ads")}
                            >
                                {_t("custom_panels|bazaar_my_ads")}
                            </button>
                            <button
                                className={classNames("mx_BazaarPage_btn mx_BazaarPage_btn--secondary", {
                                    active: historyTab === "purchases",
                                })}
                                onClick={() => setHistoryTab("purchases")}
                            >
                                {_t("custom_panels|bazaar_my_purchases")}
                            </button>
                        </div>

                        {historyTab === "ads" && (
                            <div className="mx_BazaarPage_myAds">
                                <h4>{_t("custom_panels|bazaar_my_ads")}</h4>
                                {myAds.length === 0 && (
                                    <div className="mx_BazaarPage_empty">
                                        {_t("custom_panels|bazaar_no_ads")}
                                    </div>
                                )}
                                {myAds.map((ad, idx) => (
                                    <div className="mx_BazaarPage_myAd" key={`${ad.sub}-${idx}`}>
                                        <div>
                                            <strong>{ad.sub}</strong>
                                            <br />
                                            <small>
                                                {ad.main} | {ad.status}
                                            </small>
                                        </div>
                                        <div className="mx_BazaarPage_adRowActions">
                                            <button
                                                className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                                onClick={() => alert(JSON.stringify(ad.data, null, 2))}
                                            >
                                                {_t("custom_panels|bazaar_view")}
                                            </button>
                                            <button
                                                className="mx_BazaarPage_btn mx_BazaarPage_btn--warning"
                                                onClick={() => editAd(idx)}
                                            >
                                                {_t("custom_panels|bazaar_edit")}
                                            </button>
                                            <button
                                                className="mx_BazaarPage_btn mx_BazaarPage_btn--danger"
                                                onClick={() => deleteAd(idx)}
                                            >
                                                {_t("custom_panels|bazaar_delete")}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {historyTab === "purchases" && (
                            <div className="mx_BazaarPage_myAds">
                                <h4>{_t("custom_panels|bazaar_my_purchases")}</h4>
                                {myPurchases.length === 0 && (
                                    <div className="mx_BazaarPage_empty">
                                        {_t("custom_panels|bazaar_no_purchases")}
                                    </div>
                                )}
                                {myPurchases.map((p) => (
                                    <div className="mx_BazaarPage_myAd" key={p.orderCode}>
                                        <div>
                                            <strong>{p.title}</strong>
                                            <br />
                                            <small>
                                                {_t("custom_panels|bazaar_order_code", { code: p.orderCode })} |{" "}
                                                {p.status} | {p.date}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="mx_BazaarPage_panel">
                    <h3>{_t("custom_panels|bazaar_my_ads")}</h3>
                    {myAds.length === 0 ? (
                        <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_no_ads")}</div>
                    ) : (
                        <div className="mx_BazaarPage_myAds">
                            {myAds.map((ad, idx) => (
                                <div className="mx_BazaarPage_myAd" key={`bottom-${ad.sub}-${idx}`}>
                                    <div>
                                        <strong>{ad.sub}</strong>
                                        <br />
                                        <small>
                                            {ad.main} | {ad.status}
                                        </small>
                                    </div>
                                    <div className="mx_BazaarPage_adRowActions">
                                        <button
                                            className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                            onClick={() => alert(JSON.stringify(ad.data, null, 2))}
                                        >
                                            {_t("custom_panels|bazaar_view")}
                                        </button>
                                        <button
                                            className="mx_BazaarPage_btn mx_BazaarPage_btn--warning"
                                            onClick={() => editAd(idx)}
                                        >
                                            {_t("custom_panels|bazaar_edit")}
                                        </button>
                                        <button
                                            className="mx_BazaarPage_btn mx_BazaarPage_btn--danger"
                                            onClick={() => deleteAd(idx)}
                                        >
                                            {_t("custom_panels|bazaar_delete")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default BazaarPage;
