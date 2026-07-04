import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { _t } from "../../../languageHandler";
import { useBazaarCategories, type BazaarCategory } from "./api/useBazaarCategories";
import { useBazaarSubcategories, type BazaarQuestion } from "./api/useBazaarSubcategories";
import { useBazaarQuestions } from "./api/useBazaarQuestions";
import { useBazaarAds, type BazaarAd } from "./api/useBazaarAds";
import { submitBazaarAd } from "./api/submitBazaarAd";
import { buyBazaarAd } from "./api/buyBazaarAd";
import { deleteBazaarAd } from "./api/deleteBazaarAd";
import { editBazaarAd } from "./api/editBazaarAd";
import { useMyBazaarAds } from "./api/useMyBazaarAds";
import ErrorDialog from "../dialogs/ErrorDialog";
import Modal from "../../../Modal";
import "../../../../res/css/views/bazaar/BazaarPage.pcss";

interface DraftAd {
    main: string;
    sub: string;
    data: Record<string, string | string[]>;
}

interface MyPurchase {
    title: string;
    orderCode: number;
    status: string;
    date: string;
}

type DetailStage = "info" | "payment" | "success";

interface DetailState {
    item: BazaarAd;
    stage: DetailStage;
    orderCode?: number;
}

interface ActiveFilters {
    location: string;
    minPrice: number | null;
    maxPrice: number | null;
}

type ActivePanel = "none" | "sell" | "preview" | "buy" | "detail" | "history";
type HistoryTab = "ads" | "purchases";

interface MyAdsListProps {
    ads: BazaarAd[];
    loading: boolean;
    error: boolean;
    openDetail: (item: BazaarAd) => void;
    onEdit: (adId: number) => void;
    onDelete: (adId: number) => void;
}

const MyAdsList: React.FC<MyAdsListProps> = ({ ads, loading, error, openDetail, onEdit, onDelete }) => {
    if (loading) return <div className="mx_BazaarPage_empty">{_t("common|loading")}</div>;
    if (error) return <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_load_error")}</div>;
    if (ads.length === 0) return <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_no_ads")}</div>;

    return (
        <div className="mx_BazaarPage_myAds">
            {ads.map((ad) => {
                const title = ad.product_type || `#${ad.id}`;
                const parts = [
                    ad.amount && ad.unit ? `${ad.amount} ${ad.unit}` : null,
                    [ad.province, ad.city].filter(Boolean).join(" / ") || null,
                    ad.buyer_id ? _t("custom_panels|bazaar_status_sold") : _t("custom_panels|bazaar_status_registered"),
                ].filter(Boolean);
                return (
                    <div className="mx_BazaarPage_myAd" key={ad.id}>
                        <div>
                            <strong>{title}</strong>
                            <br />
                            <small>{parts.join(" | ")}</small>
                        </div>
                        <div className="mx_BazaarPage_adRowActions">
                            <button
                                className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                onClick={() => openDetail(ad)}
                            >
                                {_t("custom_panels|bazaar_view")}
                            </button>
                            <button
                                className="mx_BazaarPage_btn mx_BazaarPage_btn--warning"
                                onClick={() => onEdit(ad.id)}
                            >
                                {_t("custom_panels|bazaar_edit")}
                            </button>
                            <button
                                className="mx_BazaarPage_btn mx_BazaarPage_btn--danger"
                                onClick={() => onDelete(ad.id)}
                            >
                                {_t("custom_panels|bazaar_delete")}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const BazaarPage: React.FC = () => {
    const { categories: apiCategories, isLoading: categoriesLoading, error: categoriesError } = useBazaarCategories();

    const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
    const [selectedMain, setSelectedMain] = useState<string>("");
    const [selectedSub, setSelectedSub] = useState<string>("");
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

    const {
        questions: subQuestions,
        isLoading: subsLoading,
        error: subsError,
    } = useBazaarSubcategories(openCategoryId);

    // The first "choice" question drives the visible subcategory list under
    // the open category. Additional questions come from endpoint #3 after
    // the user picks an option.
    const subOptions = subQuestions.find((q) => q.field_type === "choice")?.options ?? [];

    // Remaining questions for the sell form (endpoint #3). Fetched whenever a
    // category is open so the form is ready by the time the user clicks Sell.
    const {
        questions: sellQuestions,
        isLoading: sellQuestionsLoading,
        error: sellQuestionsError,
    } = useBazaarQuestions(openCategoryId);

    // Available ads within the open category (endpoint #4). Client filters
    // by selected subcategory + location + price on top of this list.
    const { ads: apiAds, isLoading: adsLoading, error: adsError } = useBazaarAds(openCategoryId);

    const [activePanel, setActivePanel] = useState<ActivePanel>("none");
    const [historyTab, setHistoryTab] = useState<HistoryTab>("ads");

    const [formData, setFormData] = useState<Record<string, string | string[]>>({});
    const [draftAd, setDraftAd] = useState<DraftAd | null>(null);

    const [myPurchases, setMyPurchases] = useState<MyPurchase[]>([]);
    // Bumped after a successful submit / buy so the my-ads hook refetches.
    const [myAdsRefreshKey, setMyAdsRefreshKey] = useState(0);
    const { ads: myAds, isLoading: myAdsLoading, error: myAdsError } = useMyBazaarAds(true, myAdsRefreshKey);

    const [filterLocation, setFilterLocation] = useState<string>("");
    const [filterMinPrice, setFilterMinPrice] = useState<string>("");
    const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        location: "",
        minPrice: null,
        maxPrice: null,
    });
    const [filterProvince, setFilterProvince] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterActiveOnly, setFilterActiveOnly] = useState(false);
    const [sortBy, setSortBy] = useState("");

    const [detail, setDetail] = useState<DetailState | null>(null);
    const [editingAd, setEditingAd] = useState<BazaarAd | null>(null);
    const [editFormData, setEditFormData] = useState<Record<string, string>>({});

    const filteredAds = useMemo<BazaarAd[]>(() => {
        const loc = activeFilters.location.trim();
        return apiAds
            .filter((ad) => {
                // Narrow to the picked subcategory when one is selected. Falls
                // back to the whole category otherwise so the panel isn't empty
                // if the user clicks Buy without picking a specific product.
                if (selectedSub && ad.product_type !== selectedSub) return false;
                if (loc && !`${ad.province} ${ad.city}`.includes(loc)) return false;
                const priceNum = Number(ad.price);
                if (activeFilters.minPrice !== null && Number.isFinite(priceNum) && priceNum < activeFilters.minPrice)
                    return false;
                if (activeFilters.maxPrice !== null && Number.isFinite(priceNum) && priceNum > activeFilters.maxPrice)
                    return false;
                if (filterProvince && ad.province !== filterProvince) return false;
                if (filterCity && ad.city !== filterCity) return false;
                if (filterActiveOnly && ad.buyer_id) return false;
                return true;
            })
            .sort((a, b) => {
                if (sortBy === "priceAsc") return Number(a.price) - Number(b.price);
                if (sortBy === "priceDesc") return Number(b.price) - Number(a.price);
                return 0;
            });
    }, [
        apiAds,
        selectedSub,
        filterLocation,
        filterProvince,
        filterCity,
        filterMinPrice,
        filterMaxPrice,
        filterActiveOnly,
        sortBy,
    ]);

    const openSellPanel = (): void => {
        if (!selectedSub) {
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: _t("custom_panels|bazaar_select_first"),
            });
            return;
        }
        setActivePanel("sell");
    };

    const openBuyPanel = (): void => {
        if (!selectedSub) {
            //TODO: check if this is needed
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: _t("custom_panels|bazaar_select_first"),
            });
            return;
        }
        setActivePanel("buy");
    };

    const openHistoryPanel = (): void => {
        setActivePanel("history");
    };

    const setAnswer = (questionId: number, value: string | string[]): void => {
        setFormData((prev) => ({ ...prev, [String(questionId)]: value }));
    };

    const toggleMultiOption = (questionId: number, optionId: string): void => {
        setFormData((prev) => {
            const key = String(questionId);
            const current = prev[key];
            const arr = Array.isArray(current) ? current : [];
            const next = arr.includes(optionId) ? arr.filter((v) => v !== optionId) : [...arr, optionId];
            return { ...prev, [key]: next };
        });
    };

    const isQuestionVisible = (q: BazaarQuestion): boolean => {
        if (q.depends_on == null) return true;
        const parentAnswer = formData[String(q.depends_on)];
        if (Array.isArray(parentAnswer)) return parentAnswer.length > 0;
        return parentAnswer != null && parentAnswer !== "";
    };

    const onSellSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        setDraftAd({ main: selectedMain, sub: selectedSub, data: formData });
        setActivePanel("preview");
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinalSubmit = async (): Promise<void> => {
        if (!draftAd || openCategoryId == null || isSubmitting) return;
        setIsSubmitting(true);
        const allQuestions = [...subQuestions, ...sellQuestions];
        const result = await submitBazaarAd(openCategoryId, allQuestions, formData);
        setIsSubmitting(false);

        if (!result.ok) {
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: _t("custom_panels|bazaar_submit_error") + "\n" + result.error.message,
            });
            return;
        }

        Modal.createDialog(ErrorDialog, {
            title: _t("common|success"),
            description: _t("custom_panels|bazaar_ad_submitted"),
        });

        setActivePanel("none");
        setFormData({});
        setDraftAd(null);
        // Trigger my-ads refetch (submitBazaarAd already cleared the cache).
        setMyAdsRefreshKey((k) => k + 1);
    };

    const openDetail = (item: BazaarAd): void => {
        setDetail({ item, stage: "info" });
        setActivePanel("detail");
    };

    const startPayment = (): void => {
        setDetail((prev) => (prev ? { ...prev, stage: "payment" } : prev));
    };

    const [isBuying, setIsBuying] = useState(false);

    const confirmPayment = async (): Promise<void> => {
        if (!detail || isBuying) return;
        setIsBuying(true);
        const result = await buyBazaarAd(detail.item.id);
        setIsBuying(false);

        if (!result.ok) {
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: _t("custom_panels|bazaar_submit_error") + "\n" + result.error.message,
            });
            return;
        }

        // The ad id becomes the order code; the backend doesn't return one,
        // so reusing the ad id keeps the UI receipt stable and traceable.
        const orderCode = detail.item.id;
        setMyPurchases((prev) => [
            {
                title: detail.item.product_type,
                orderCode,
                status: _t("custom_panels|bazaar_status_shipping"),
                date: new Date().toLocaleDateString("fa-IR"),
            },
            ...prev,
        ]);
        setDetail({ ...detail, stage: "success", orderCode });
        setMyAdsRefreshKey((k) => k + 1);
    };

    const backToBuyList = (): void => {
        setDetail(null);
        setActivePanel("buy");
    };

    const handleDeleteAd = async (adId: number): Promise<void> => {
        const result = await deleteBazaarAd(adId);
        if (!result.ok) {
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: result.error.message,
            });
            return;
        }
        setMyAdsRefreshKey((k) => k + 1);
    };

    const handleEditAd = (adId: number): void => {
        // Find the ad in myAds and switch to edit mode
        const ad = myAds.find((a) => a.id === adId);
        if (!ad) return;
        setEditingAd(ad);
        setEditFormData({ ...ad } as unknown as Record<string, string>);
    };

    const handleEditSubmit = async (): Promise<void> => {
        if (!editingAd) return;
        const result = await editBazaarAd(editingAd.id, editFormData);
        if (!result.ok) {
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: result.error.message,
            });
            return;
        }
        setEditingAd(null);
        setEditFormData({});
        setMyAdsRefreshKey((k) => k + 1);
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
        setFilterProvince("");
        setFilterCity("");
        setFilterActiveOnly(false);
        setSortBy("");
    };

    const renderQuestion = (q: BazaarQuestion): React.ReactNode => {
        if (!isQuestionVisible(q)) return null;
        const key = String(q.id);
        const raw = formData[key];
        const stringValue = typeof raw === "string" ? raw : "";
        const arrayValue = Array.isArray(raw) ? raw : [];
        const label = (
            <label>
                {q.field_name}
                {q.is_required && <span style={{ color: "var(--bz-red, #dc2626)" }}> *</span>}
            </label>
        );

        const isMultiChoice = q.field_type === "choice" && q.allow_multiple;
        const isSingleChoice = q.field_type === "choice" && !q.allow_multiple;
        const isNumeric = q.field_type === "number" || q.field_type === "integer";

        return (
            <div className="mx_BazaarPage_field" key={q.id}>
                {label}
                {isSingleChoice && (
                    <select value={stringValue} onChange={(e) => setAnswer(q.id, e.target.value)}>
                        <option value="">—</option>
                        {q.options.map((opt) => (
                            <option key={opt.id} value={String(opt.id)}>
                                {opt.value}
                            </option>
                        ))}
                    </select>
                )}
                {isMultiChoice && (
                    <div className="mx_BazaarPage_checkboxGroup">
                        {q.options.map((opt) => {
                            const optId = String(opt.id);
                            const checked = arrayValue.includes(optId);
                            return (
                                <label key={opt.id} className="mx_BazaarPage_checkboxItem">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleMultiOption(q.id, optId)}
                                    />
                                    <span>{opt.value}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
                {isNumeric && (
                    <input
                        type="number"
                        value={stringValue}
                        min={q.min_value ?? undefined}
                        max={q.max_value ?? undefined}
                        step={q.field_type === "integer" ? 1 : "any"}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                    />
                )}
                {q.field_type === "date" && (
                    <input
                        type="date"
                        value={stringValue}
                        min={q.date_min ?? undefined}
                        max={q.date_max ?? undefined}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                    />
                )}
                {q.field_type === "boolean" && (
                    <input
                        type="checkbox"
                        checked={stringValue === "true"}
                        onChange={(e) => setAnswer(q.id, e.target.checked ? "true" : "false")}
                    />
                )}
                {(q.field_type === "text" ||
                    q.field_type === "phone" ||
                    q.field_type === "province" ||
                    q.field_type === "city") && (
                    <input
                        type={q.field_type === "phone" ? "tel" : "text"}
                        value={stringValue}
                        placeholder={q.format_hint || undefined}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                    />
                )}
                {q.format_hint && q.field_type !== "text" && (
                    <small style={{ color: "var(--bz-muted, #6b7280)", fontSize: 12 }}>{q.format_hint}</small>
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
                    {categoriesLoading && <div className="mx_BazaarPage_empty">{_t("common|loading")}</div>}
                    {categoriesError && !categoriesLoading && (
                        <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_load_error")}</div>
                    )}
                    {!categoriesLoading && !categoriesError && apiCategories.length === 0 && (
                        <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_no_categories")}</div>
                    )}
                    {apiCategories.map((cat: BazaarCategory) => {
                        const isOpen = openCategoryId === cat.id;
                        return (
                            <div key={cat.id} className={classNames("mx_BazaarPage_menuItem", { open: isOpen })}>
                                <button
                                    className={classNames("mx_BazaarPage_menuMain", {
                                        active: selectedMain === cat.name,
                                    })}
                                    onClick={() => setOpenCategoryId(isOpen ? null : cat.id)}
                                >
                                    <span>{cat.name}</span>
                                    <span className="mx_BazaarPage_chevron">▾</span>
                                </button>
                                {isOpen && (
                                    <div className="mx_BazaarPage_submenu">
                                        {subsLoading && (
                                            <div className="mx_BazaarPage_empty">{_t("common|loading")}</div>
                                        )}
                                        {subsError && !subsLoading && (
                                            <div className="mx_BazaarPage_empty">
                                                {_t("custom_panels|bazaar_load_error")}
                                            </div>
                                        )}
                                        {!subsLoading && !subsError && subOptions.length === 0 && (
                                            <div className="mx_BazaarPage_empty">
                                                {_t("custom_panels|bazaar_no_categories")}
                                            </div>
                                        )}
                                        {subOptions.map((opt) => (
                                            <button
                                                key={opt.id}
                                                className={classNames({
                                                    selected: selectedOptionId === opt.id,
                                                })}
                                                onClick={() => {
                                                    setSelectedMain(cat.name);
                                                    setSelectedSub(opt.value);
                                                    setSelectedOptionId(opt.id);
                                                    setActivePanel("none");
                                                    // Seed the answer for the initial "choice" question so
                                                    // submitBazaarAd includes it in the payload alongside
                                                    // the sell form answers.
                                                    const seedKey = subQuestions.find(
                                                        (q) => q.field_type === "choice",
                                                    )?.id;
                                                    setFormData(
                                                        seedKey != null ? { [String(seedKey)]: String(opt.id) } : {},
                                                    );
                                                }}
                                            >
                                                {opt.value}
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
                        <button className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary" onClick={openHistoryPanel}>
                            {_t("custom_panels|bazaar_history")}
                        </button>
                    </div>
                </section>

                {activePanel === "sell" && (
                    <section className="mx_BazaarPage_panel">
                        <h3>{_t("custom_panels|bazaar_form_title")}</h3>
                        <form onSubmit={onSellSubmit}>
                            {sellQuestionsLoading && <div className="mx_BazaarPage_empty">{_t("common|loading")}</div>}
                            {sellQuestionsError && !sellQuestionsLoading && (
                                <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_load_error")}</div>
                            )}
                            {!sellQuestionsLoading && !sellQuestionsError && (
                                <div className="mx_BazaarPage_grid">{sellQuestions.map(renderQuestion)}</div>
                            )}
                            <div className="mx_BazaarPage_sectionActions">
                                <button type="submit" className="mx_BazaarPage_btn mx_BazaarPage_btn--sell">
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
                            <button
                                className="mx_BazaarPage_btn mx_BazaarPage_btn--sell"
                                onClick={onFinalSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? _t("custom_panels|submitting")
                                    : _t("custom_panels|bazaar_submit_final")}
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
                            <div className="mx_BazaarPage_field">
                                <label>{_t("custom_panels|bazaar_filter_province")}</label>
                                <input
                                    type="text"
                                    value={filterProvince}
                                    onChange={(e) => setFilterProvince(e.target.value)}
                                    placeholder={_t("custom_panels|bazaar_filter_province_placeholder")}
                                />
                            </div>
                            <div className="mx_BazaarPage_field">
                                <label>{_t("custom_panels|bazaar_filter_city")}</label>
                                <input
                                    type="text"
                                    value={filterCity}
                                    onChange={(e) => setFilterCity(e.target.value)}
                                    placeholder={_t("custom_panels|bazaar_filter_city_placeholder")}
                                />
                            </div>
                            <div className="mx_BazaarPage_field">
                                <label>{_t("custom_panels|bazaar_filter_active_only")}</label>
                                <input
                                    type="checkbox"
                                    checked={filterActiveOnly}
                                    onChange={(e) => setFilterActiveOnly(e.target.checked)}
                                />
                            </div>
                            <div className="mx_BazaarPage_field">
                                <label>{_t("custom_panels|bazaar_sort_by")}</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="">{_t("common|none")}</option>
                                    <option value="priceAsc">{_t("custom_panels|bazaar_sort_price_asc")}</option>
                                    <option value="priceDesc">{_t("custom_panels|bazaar_sort_price_desc")}</option>
                                </select>
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
                            {adsLoading && <div className="mx_BazaarPage_empty">{_t("common|loading")}</div>}
                            {adsError && !adsLoading && (
                                <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_load_error")}</div>
                            )}
                            {!adsLoading && !adsError && filteredAds.length === 0 && (
                                <div className="mx_BazaarPage_empty">
                                    {_t("custom_panels|bazaar_no_filter_results")}
                                </div>
                            )}
                            {filteredAds.map((ad) => {
                                const priceNum = Number(ad.price);
                                const priceLabel =
                                    Number.isFinite(priceNum) && ad.price
                                        ? _t("custom_panels|bazaar_price_toman", { price: priceNum.toLocaleString() })
                                        : "";
                                const sellerName = ad.contact_name || ad.contact_phone;
                                return (
                                    <div className="mx_BazaarPage_adCard" key={ad.id}>
                                        {/* تصویر آگهی */}
                                        {/* <img src={ad.image_url || "/default.jpg"} alt={ad.product_type} /> */}
                                        <div className="mx_BazaarPage_adMeta">
                                            <h4>{ad.product_type}</h4>
                                            <p>
                                                {_t("custom_panels|bazaar_seller", { name: sellerName })}
                                                <br />
                                                {`${ad.amount} ${ad.unit}`}
                                                {ad.province || ad.city ? (
                                                    <>
                                                        {" "}
                                                        <br />
                                                        {`${ad.province} / ${ad.city}`}
                                                    </>
                                                ) : null}
                                                {priceLabel ? (
                                                    <>
                                                        {" "}
                                                        <br />
                                                        {priceLabel}
                                                    </>
                                                ) : null}
                                                {/* وضعیت آگهی */}
                                                <br />
                                                {ad.buyer_id ? (
                                                    <span className="mx_BazaarPage_badge mx_BazaarPage_badge--sold">
                                                        {_t("custom_panels|bazaar_status_sold")}
                                                    </span>
                                                ) : (
                                                    <span className="mx_BazaarPage_badge mx_BazaarPage_badge--active">
                                                        {_t("custom_panels|bazaar_status_active")}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="mx_BazaarPage_adActions">
                                            <button
                                                className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                                onClick={() => openDetail(ad)}
                                            >
                                                {_t("custom_panels|bazaar_view")}
                                            </button>
                                            {/* دکمه تماس */}
                                            <button
                                                className="mx_BazaarPage_btn mx_BazaarPage_btn--buy"
                                                onClick={() => window.open(`tel:${ad.contact_phone}`)}
                                            >
                                                {_t("custom_panels|bazaar_contact")}
                                            </button>
                                            <button
                                                className="mx_BazaarPage_btn mx_BazaarPage_btn--buy"
                                                onClick={() => navigator.clipboard.writeText(ad.contact_phone)}
                                            >
                                                {_t("custom_panels|bazaar_copy_phone")}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                                    <p>{detail.item.product_type}</p>
                                    <p>
                                        {_t("custom_panels|bazaar_seller", {
                                            name: detail.item.contact_name || detail.item.contact_phone,
                                        })}
                                    </p>
                                    <p>{`${detail.item.amount} ${detail.item.unit}`}</p>
                                    {[detail.item.province, detail.item.city].filter(Boolean).length > 0 && (
                                        <p>{[detail.item.province, detail.item.city].filter(Boolean).join(" / ")}</p>
                                    )}
                                    {detail.item.price && Number.isFinite(Number(detail.item.price)) && (
                                        <p>
                                            {_t("custom_panels|bazaar_price_toman", {
                                                price: Number(detail.item.price).toLocaleString(),
                                            })}
                                        </p>
                                    )}
                                </div>
                                <div className="mx_BazaarPage_step mx_BazaarPage_step--actions">
                                    <button
                                        className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                        onClick={backToBuyList}
                                    >
                                        {_t("custom_panels|bazaar_back_to_list")}
                                    </button>
                                    <button className="mx_BazaarPage_btn mx_BazaarPage_btn--buy" onClick={startPayment}>
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
                                            disabled={isBuying}
                                        >
                                            {isBuying
                                                ? _t("custom_panels|submitting")
                                                : _t("custom_panels|bazaar_confirm_payment")}
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
                                    <p>{_t("custom_panels|bazaar_product", { name: detail.item.product_type })}</p>
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
                            <MyAdsList
                                ads={myAds}
                                loading={myAdsLoading}
                                error={!!myAdsError}
                                openDetail={openDetail}
                                onEdit={handleEditAd}
                                onDelete={handleDeleteAd}
                            />
                        )}

                        {historyTab === "purchases" && (
                            <div className="mx_BazaarPage_myAds">
                                <h4>{_t("custom_panels|bazaar_my_purchases")}</h4>
                                {myPurchases.length === 0 && (
                                    <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_no_purchases")}</div>
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
            </main>
        </div>
    );
};

export default BazaarPage;
