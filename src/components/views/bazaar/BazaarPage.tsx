import React, { useEffect, useMemo, useState } from "react";
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
import { fileToDataUrl, isSidebarProductQuestion, pickEditableAdFields } from "./api/adPayload";
import { useMyBazaarAds } from "./api/useMyBazaarAds";
import { useMyBazaarPurchases } from "./api/useMyBazaarPurchases";
import ErrorDialog from "../dialogs/ErrorDialog";
import QuestionDialog from "../dialogs/QuestionDialog";
import Modal from "../../../Modal";
import "../../../../res/css/views/bazaar/BazaarPage.pcss";

type DetailStage = "info" | "payment" | "success";

interface DetailState {
    item: BazaarAd;
    stage: DetailStage;
    orderCode?: number;
    returnPanel: ActivePanel;
    historyTab?: HistoryTab;
    readOnly?: boolean;
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
    editingAd: BazaarAd | null;
    editFormData: Record<string, string>;
    setEditFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onSave: () => void;
    onCancel: () => void;
}

const MyAdsList: React.FC<MyAdsListProps> = ({
    ads,
    loading,
    error,
    openDetail,
    onEdit,
    onDelete,
    editingAd,
    editFormData,
    setEditFormData,
    onSave,
    onCancel,
}) => {
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
                ].filter(Boolean);
                return (
                    <div className="mx_BazaarPage_myAd" key={ad.id}>
                        {ad.image ? (
                            <img className="mx_BazaarPage_adThumb" src={ad.image} alt="" />
                        ) : (
                            <div className="mx_BazaarPage_adThumb mx_BazaarPage_adThumb--empty" aria-hidden="true" />
                        )}
                        <div className="mx_BazaarPage_myAdInfo">
                            <strong>{title}</strong>
                            <div className="mx_BazaarPage_myAdMeta">
                                <span
                                    className={classNames("mx_BazaarPage_badge", {
                                        "mx_BazaarPage_badge--sold": !!ad.buyer_id,
                                        "mx_BazaarPage_badge--active": !ad.buyer_id,
                                    })}
                                >
                                    {ad.buyer_id
                                        ? _t("custom_panels|bazaar_status_sold")
                                        : _t("custom_panels|bazaar_status_registered")}
                                </span>
                            </div>
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
                        {editingAd?.id === ad.id && (
                            <div className="mx_BazaarPage_editPanel">
                                <h3>ویرایش آگهی</h3>

                                <div className="mx_BazaarPage_editGrid">
                                    <div className="mx_BazaarPage_editField">
                                        <label>عنوان</label>
                                        <input
                                            value={editFormData.product_type || ""}
                                            onChange={(e) =>
                                                setEditFormData((p) => ({
                                                    ...p,
                                                    product_type: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="mx_BazaarPage_editField">
                                        <label>قیمت</label>
                                        <input
                                            value={editFormData.price || ""}
                                            onChange={(e) =>
                                                setEditFormData((p) => ({
                                                    ...p,
                                                    price: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="mx_BazaarPage_editField">
                                        <label>مقدار</label>
                                        <input
                                            value={editFormData.amount || ""}
                                            onChange={(e) =>
                                                setEditFormData((p) => ({
                                                    ...p,
                                                    amount: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="mx_BazaarPage_editField">
                                        <label>استان</label>
                                        <input
                                            value={editFormData.province || ""}
                                            onChange={(e) =>
                                                setEditFormData((p) => ({
                                                    ...p,
                                                    province: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="mx_BazaarPage_editField">
                                        <label>شهر</label>
                                        <input
                                            value={editFormData.city || ""}
                                            onChange={(e) =>
                                                setEditFormData((p) => ({
                                                    ...p,
                                                    city: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="mx_BazaarPage_editField mx_BazaarPage_editField--full">
                                        <label>{_t("custom_panels|bazaar_field_image")}</label>
                                        <div className="mx_BazaarPage_imageField">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) {
                                                        setEditFormData((p) => {
                                                            const next = { ...p };
                                                            delete next.image;
                                                            return next;
                                                        });
                                                        return;
                                                    }
                                                    try {
                                                        const dataUrl = await fileToDataUrl(file);
                                                        setEditFormData((p) => ({ ...p, image: dataUrl }));
                                                    } catch {
                                                        Modal.createDialog(ErrorDialog, {
                                                            title: _t("common|error"),
                                                            description: _t("custom_panels|bazaar_image_error"),
                                                        });
                                                    }
                                                }}
                                            />
                                            {(editFormData.image || editingAd?.image) && (
                                                <img
                                                    className="mx_BazaarPage_imagePreview"
                                                    src={editFormData.image || editingAd?.image || ""}
                                                    alt=""
                                                />
                                            )}
                                            <small className="mx_BazaarPage_imageHint">
                                                {_t("custom_panels|bazaar_image_edit_hint")}
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <div className="mx_BazaarPage_editActions">
                                    <button
                                        className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                        onClick={onCancel}
                                    >
                                        انصراف
                                    </button>

                                    <button className="mx_BazaarPage_btn mx_BazaarPage_btn--buy" onClick={onSave}>
                                        ذخیره تغییرات
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

interface BazaarAdDetailGridProps {
    item: BazaarAd;
    categoryLabel?: string;
}

const BazaarAdDetailGrid: React.FC<BazaarAdDetailGridProps> = ({ item, categoryLabel }) => {
    const priceNum = Number(item.price);
    const priceLabel =
        Number.isFinite(priceNum) && item.price
            ? _t("custom_panels|bazaar_price_toman", { price: priceNum.toLocaleString() })
            : null;

    const rows: { label: string; value: string; highlight?: boolean }[] = [
        { label: _t("custom_panels|bazaar_field_order"), value: String(item.id) },
        {
            label: _t("custom_panels|bazaar_field_product"),
            value: item.product_type || _t("custom_panels|bazaar_field_not_set"),
        },
        {
            label: _t("custom_panels|bazaar_field_category"),
            value: categoryLabel ?? (item.category ? String(item.category) : _t("custom_panels|bazaar_field_not_set")),
        },
        {
            label: _t("custom_panels|bazaar_field_amount"),
            value:
                item.amount && item.unit
                    ? `${item.amount} ${item.unit}`
                    : item.amount || item.unit || _t("custom_panels|bazaar_field_not_set"),
        },
        {
            label: _t("custom_panels|bazaar_field_location"),
            value: [item.province, item.city].filter(Boolean).join(" / ") || _t("custom_panels|bazaar_field_not_set"),
        },
        {
            label: _t("custom_panels|bazaar_field_price"),
            value: priceLabel ?? _t("custom_panels|bazaar_field_not_set"),
            highlight: !!priceLabel,
        },
        {
            label: _t("custom_panels|bazaar_field_seller"),
            value: item.contact_name || _t("custom_panels|bazaar_field_not_set"),
        },
        {
            label: _t("custom_panels|bazaar_field_phone"),
            value: item.contact_phone || _t("custom_panels|bazaar_field_not_set"),
        },
        {
            label: _t("custom_panels|bazaar_field_buyer"),
            value: item.buyer_id || _t("custom_panels|bazaar_field_not_set"),
        },
    ];

    return (
        <div className="mx_BazaarPage_detailWrap">
            {item.image ? (
                <div className="mx_BazaarPage_detailImage">
                    <img src={item.image} alt={item.product_type || ""} />
                </div>
            ) : null}
            <dl className="mx_BazaarPage_detailGrid">
                {rows.map((row) => (
                    <div className="mx_BazaarPage_detailRow" key={row.label}>
                        <dt>{row.label}</dt>
                        <dd className={row.highlight ? "mx_BazaarPage_adPrice" : undefined}>{row.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};

const BazaarPage: React.FC = () => {
    const { categories: apiCategories, isLoading: categoriesLoading, error: categoriesError } = useBazaarCategories();

    const categoryNameById = useMemo(() => {
        const map = new Map<number, string>();
        apiCategories.forEach((cat: BazaarCategory) => map.set(cat.id, cat.name));
        return map;
    }, [apiCategories]);

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
    const [adImageDataUrl, setAdImageDataUrl] = useState<string | null>(null);
    // Bumped after a successful submit / buy so the my-ads/purchases hooks refetch.
    const [myAdsRefreshKey, setMyAdsRefreshKey] = useState(0);
    const { ads: myAds, isLoading: myAdsLoading, error: myAdsError } = useMyBazaarAds(true, myAdsRefreshKey);
    const {
        purchases: myPurchases,
        isLoading: purchasesLoading,
        error: purchasesError,
    } = useMyBazaarPurchases(true, myAdsRefreshKey);

    const [filterLocation, setFilterLocation] = useState<string>("");
    const [filterMinPrice, setFilterMinPrice] = useState<string>("");
    const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        location: "",
        minPrice: null,
        maxPrice: null,
    });
    const [detail, setDetail] = useState<DetailState | null>(null);
    const [editingAd, setEditingAd] = useState<BazaarAd | null>(null);
    const [editFormData, setEditFormData] = useState<Record<string, string>>({});

    const filteredAds = useMemo<BazaarAd[]>(() => {
        const loc = activeFilters.location.trim();
        return apiAds.filter((ad) => {
            if (
                selectedSub &&
                ad.product_type &&
                !ad.product_type.includes(selectedSub) &&
                !selectedSub.includes(ad.product_type)
            )
                return false;
            if (loc && !`${ad.province} ${ad.city}`.includes(loc)) return false;
            const priceNum = Number(ad.price);
            if (activeFilters.minPrice !== null && Number.isFinite(priceNum) && priceNum < activeFilters.minPrice)
                return false;
            if (activeFilters.maxPrice !== null && Number.isFinite(priceNum) && priceNum > activeFilters.maxPrice)
                return false;
            return true;
        });
    }, [apiAds, activeFilters, selectedSub]);

    useEffect(() => {
        setEditingAd(null);
        setEditFormData({});
    }, [activePanel, historyTab, selectedMain, selectedSub, openCategoryId]);

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

    const onSellSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        await onFinalSubmit();
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinalSubmit = async (): Promise<void> => {
        if (openCategoryId == null || isSubmitting) return;

        if (!selectedSub || selectedOptionId == null) {
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: _t("custom_panels|bazaar_select_first"),
            });
            return;
        }

        // Sidebar subcategory ("نوع محصول") is chosen from the menu, not the sell form.
        // Re-inject it so validation / payload never ask for a hidden field.
        const productQuestion = subQuestions.find((q) => q.field_type === "choice");
        const answers: Record<string, string | string[]> = { ...formData };
        if (productQuestion) {
            answers[String(productQuestion.id)] = String(selectedOptionId);
        }

        const allQuestions = [...subQuestions, ...sellQuestions];
        const missingFields = allQuestions
            .filter((q) => {
                if (!q.is_required) return false;
                // Satisfied by sidebar selection — not shown on the form.
                if (isSidebarProductQuestion(q, subQuestions)) return false;

                if (q.depends_on != null) {
                    const parentAnswer = answers[String(q.depends_on)];
                    const parentFilled = Array.isArray(parentAnswer)
                        ? parentAnswer.length > 0
                        : parentAnswer != null && parentAnswer !== "";
                    if (!parentFilled) return false;
                }

                const value = answers[String(q.id)];
                if (Array.isArray(value)) return value.length === 0;
                return value == null || value === "";
            })
            .map((q) => `• ${q.field_name}`);

        if (missingFields.length > 0) {
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: _t("custom_panels|bazaar_required_fields") + "\n\n" + missingFields.join("\n"),
            });
            return;
        }

        setIsSubmitting(true);
        const result = await submitBazaarAd(openCategoryId, allQuestions, answers, {
            imageDataUrl: adImageDataUrl,
            productType: selectedSub,
        });
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
        setAdImageDataUrl(null);
        setMyAdsRefreshKey((k) => k + 1);
    };

    const openDetail = (
        item: BazaarAd,
        options?: { returnPanel?: ActivePanel; historyTab?: HistoryTab; readOnly?: boolean },
    ): void => {
        setDetail({
            item,
            stage: "info",
            returnPanel: options?.returnPanel ?? (activePanel === "history" ? "history" : "buy"),
            historyTab: options?.historyTab,
            readOnly: options?.readOnly ?? activePanel === "history",
        });
        setActivePanel("detail");
    };

    const closeDetail = (): void => {
        if (!detail) return;
        if (detail.returnPanel === "history" && detail.historyTab) {
            setHistoryTab(detail.historyTab);
        }
        const returnPanel = detail.returnPanel === "detail" ? "none" : detail.returnPanel;
        setDetail(null);
        setActivePanel(returnPanel);
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
        setDetail({ ...detail, stage: "success", orderCode: detail.item.id });
        setMyAdsRefreshKey((k) => k + 1);
    };

    const backToBuyList = (): void => {
        closeDetail();
    };

    const handleDeleteAd = async (adId: number): Promise<void> => {
        const ad = myAds.find((a) => a.id === adId);
        const adTitle = ad?.product_type || `#${adId}`;

        const { finished } = Modal.createDialog(QuestionDialog, {
            title: _t("custom_panels|bazaar_delete"),
            description: (
                <div>
                    <p>{_t("custom_panels|bazaar_delete_confirm")}</p>
                    <strong>{adTitle}</strong>
                </div>
            ),
            button: _t("action|delete"),
            danger: true,
        });

        const [accepted] = await finished;
        if (!accepted) return;

        const result = await deleteBazaarAd(adId);
        if (!result.ok) {
            Modal.createDialog(ErrorDialog, {
                title: _t("common|error"),
                description: result.error.message || _t("custom_panels|bazaar_delete_error"),
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
        // Do not preload `image` — server may return a URL, and PATCHing it
        // back triggers "invalid base64" on the API.
        setEditFormData(pickEditableAdFields({ ...ad }));
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
                {q.is_required && <span style={{ color: "var(--cpd-color-text-critical-primary)" }}> *</span>}
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
                {(q.field_type === "image" || q.field_type === "file" || q.field_type === "photo") && (
                    <div className="mx_BazaarPage_imageField">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) {
                                    setAnswer(q.id, "");
                                    setAdImageDataUrl(null);
                                    return;
                                }
                                try {
                                    const dataUrl = await fileToDataUrl(file);
                                    setAnswer(q.id, dataUrl);
                                    setAdImageDataUrl(dataUrl);
                                } catch {
                                    Modal.createDialog(ErrorDialog, {
                                        title: _t("common|error"),
                                        description: _t("custom_panels|bazaar_image_error"),
                                    });
                                }
                            }}
                        />
                        {(stringValue || adImageDataUrl) && (
                            <img
                                className="mx_BazaarPage_imagePreview"
                                src={stringValue || adImageDataUrl || ""}
                                alt=""
                            />
                        )}
                    </div>
                )}
                {q.format_hint && q.field_type !== "text" && (
                    <small style={{ color: "var(--cpd-color-text-secondary)", fontSize: 12 }}>{q.format_hint}</small>
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
                                                    setActivePanel("buy");
                                                    // Seed the answer for the initial "choice" question so
                                                    // submitBazaarAd includes it in the payload alongside
                                                    // the sell form answers.
                                                    const seedKey = subQuestions.find(
                                                        (q) => q.field_type === "choice",
                                                    )?.id;
                                                    setFormData(
                                                        seedKey != null ? { [String(seedKey)]: String(opt.id) } : {},
                                                    );
                                                    setAdImageDataUrl(null);
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
                        <div className="mx_BazaarPage_sectionUnderline" />
                        <form onSubmit={onSellSubmit}>
                            {sellQuestionsLoading && <div className="mx_BazaarPage_empty">{_t("common|loading")}</div>}
                            {sellQuestionsError && !sellQuestionsLoading && (
                                <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_load_error")}</div>
                            )}
                            {!sellQuestionsLoading && !sellQuestionsError && (
                                <div className="mx_BazaarPage_grid">
                                    {sellQuestions.map(renderQuestion)}
                                    {!sellQuestions.some(
                                        (q) =>
                                            q.field_type === "image" ||
                                            q.field_type === "file" ||
                                            q.field_type === "photo" ||
                                            q.field_name === "image" ||
                                            q.field_name === "تصویر" ||
                                            q.field_name === "عکس",
                                    ) && (
                                        <div className="mx_BazaarPage_field">
                                            <label>{_t("custom_panels|bazaar_field_image")}</label>
                                            <div className="mx_BazaarPage_imageField">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) {
                                                            setAdImageDataUrl(null);
                                                            return;
                                                        }
                                                        try {
                                                            setAdImageDataUrl(await fileToDataUrl(file));
                                                        } catch {
                                                            Modal.createDialog(ErrorDialog, {
                                                                title: _t("common|error"),
                                                                description: _t("custom_panels|bazaar_image_error"),
                                                            });
                                                        }
                                                    }}
                                                />
                                                {adImageDataUrl ? (
                                                    <img
                                                        className="mx_BazaarPage_imagePreview"
                                                        src={adImageDataUrl}
                                                        alt=""
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mx_BazaarPage_sectionActions">
                                <button type="submit" className="mx_BazaarPage_btn mx_BazaarPage_btn--sell">
                                    {_t("custom_panels|bazaar_submit_initial")}
                                </button>
                                <button
                                    type="button"
                                    className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                    onClick={() => {
                                        // Keep sidebar product selection; only clear sell-form answers.
                                        const seedKey = subQuestions.find((q) => q.field_type === "choice")?.id;
                                        setFormData(
                                            seedKey != null && selectedOptionId != null
                                                ? { [String(seedKey)]: String(selectedOptionId) }
                                                : {},
                                        );
                                        setAdImageDataUrl(null);
                                    }}
                                >
                                    {_t("custom_panels|bazaar_reset_form")}
                                </button>
                            </div>
                        </form>

                        <div className="mx_BazaarPage_previousAds">
                            <h3>{_t("custom_panels|bazaar_my_ads")}</h3>
                            <div className="mx_BazaarPage_sectionUnderline" />

                            <MyAdsList
                                ads={myAds}
                                loading={myAdsLoading}
                                error={!!myAdsError}
                                openDetail={(ad) =>
                                    openDetail(ad, { returnPanel: "sell", readOnly: true })
                                }
                                onEdit={handleEditAd}
                                onDelete={handleDeleteAd}
                                editingAd={editingAd}
                                editFormData={editFormData}
                                setEditFormData={setEditFormData}
                                onSave={handleEditSubmit}
                                onCancel={() => {
                                    setEditingAd(null);
                                    setEditFormData({});
                                }}
                            />
                        </div>
                    </section>
                )}

                {activePanel === "buy" && (
                    <section className="mx_BazaarPage_panel">
                        <h3>{_t("custom_panels|bazaar_related_ads")}</h3>
                        <div className="mx_BazaarPage_sectionUnderline" />
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
                                        {ad.image ? (
                                            <img className="mx_BazaarPage_adThumb" src={ad.image} alt="" />
                                        ) : (
                                            <div
                                                className="mx_BazaarPage_adThumb mx_BazaarPage_adThumb--empty"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <div className="mx_BazaarPage_adMeta">
                                            <h4>{ad.product_type}</h4>
                                            <p>
                                                {_t("custom_panels|bazaar_seller", { name: sellerName })}
                                                <br />
                                                {`${ad.amount} ${ad.unit}`}
                                                {ad.province || ad.city ? (
                                                    <>
                                                        <br />
                                                        {`${ad.province} / ${ad.city}`}
                                                    </>
                                                ) : null}
                                            </p>
                                            {priceLabel ? (
                                                <span className="mx_BazaarPage_adPrice">{priceLabel}</span>
                                            ) : null}
                                        </div>
                                        <div className="mx_BazaarPage_adActions">
                                            <button
                                                className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                                onClick={() =>
                                                    openDetail(ad, { returnPanel: "buy", readOnly: false })
                                                }
                                            >
                                                {_t("custom_panels|bazaar_view")}
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
                        <h3>
                            {detail.historyTab === "purchases"
                                ? _t("custom_panels|bazaar_purchase_detail_title")
                                : _t("custom_panels|bazaar_detail_title")}
                        </h3>
                        <div className="mx_BazaarPage_sectionUnderline" />
                        {detail.stage === "info" && (
                            <div className="mx_BazaarPage_buyFlow">
                                <div className="mx_BazaarPage_step">
                                    <div className="mx_BazaarPage_stepTitle">
                                        {detail.historyTab === "purchases"
                                            ? _t("custom_panels|bazaar_purchase_detail_title")
                                            : _t("custom_panels|bazaar_detail_title")}
                                    </div>
                                    <p className="mx_BazaarPage_detailHighlight">
                                        {detail.item.product_type || `#${detail.item.id}`}
                                    </p>
                                    <BazaarAdDetailGrid
                                        item={detail.item}
                                        categoryLabel={categoryNameById.get(detail.item.category)}
                                    />
                                </div>
                                <div className="mx_BazaarPage_step mx_BazaarPage_step--actions">
                                    <button
                                        className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                        onClick={backToBuyList}
                                    >
                                        {detail.returnPanel === "history"
                                            ? _t("custom_panels|bazaar_back_to_history")
                                            : _t("custom_panels|bazaar_back_to_list")}
                                    </button>
                                    {!detail.readOnly && !myAds.some((ad) => ad.id === detail.item.id) && (
                                        <button
                                            className="mx_BazaarPage_btn mx_BazaarPage_btn--buy"
                                            onClick={startPayment}
                                        >
                                            {_t("custom_panels|bazaar_pay_now")}
                                        </button>
                                    )}
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
                        <div className="mx_BazaarPage_sectionUnderline" />
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
                                openDetail={(ad) =>
                                    openDetail(ad, {
                                        returnPanel: "history",
                                        historyTab: "ads",
                                        readOnly: true,
                                    })
                                }
                                onEdit={handleEditAd}
                                onDelete={handleDeleteAd}
                                editingAd={editingAd}
                                editFormData={editFormData}
                                setEditFormData={setEditFormData}
                                onSave={handleEditSubmit}
                                onCancel={() => {
                                    setEditingAd(null);
                                    setEditFormData({});
                                }}
                            />
                        )}

                        {historyTab === "purchases" && (
                            <div className="mx_BazaarPage_myAds">
                                {purchasesLoading && <div className="mx_BazaarPage_empty">{_t("common|loading")}</div>}
                                {purchasesError && !purchasesLoading && (
                                    <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_load_error")}</div>
                                )}
                                {!purchasesLoading && !purchasesError && myPurchases.length === 0 && (
                                    <div className="mx_BazaarPage_empty">{_t("custom_panels|bazaar_no_purchases")}</div>
                                )}
                                {myPurchases.map((p) => {
                                    const title = p.product_type || `#${p.id}`;
                                    const priceNum = Number(p.price);
                                    const priceLabel =
                                        Number.isFinite(priceNum) && p.price
                                            ? _t("custom_panels|bazaar_price_toman", {
                                                  price: priceNum.toLocaleString(),
                                              })
                                            : null;
                                    const parts = [
                                        _t("custom_panels|bazaar_order_code", { code: p.id }),
                                        p.amount && p.unit ? `${p.amount} ${p.unit}` : null,
                                        [p.province, p.city].filter(Boolean).join(" / ") || null,
                                        categoryNameById.get(p.category) ?? null,
                                    ].filter(Boolean);
                                    return (
                                        <div className="mx_BazaarPage_myAd" key={p.id}>
                                            {p.image ? (
                                                <img className="mx_BazaarPage_adThumb" src={p.image} alt="" />
                                            ) : (
                                                <div
                                                    className="mx_BazaarPage_adThumb mx_BazaarPage_adThumb--empty"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <div className="mx_BazaarPage_myAdInfo">
                                                <strong>{title}</strong>
                                                <small>{parts.join(" | ")}</small>
                                                {priceLabel ? (
                                                    <span className="mx_BazaarPage_adPrice">{priceLabel}</span>
                                                ) : null}
                                            </div>
                                            <div className="mx_BazaarPage_adRowActions">
                                                <button
                                                    className="mx_BazaarPage_btn mx_BazaarPage_btn--secondary"
                                                    onClick={() =>
                                                        openDetail(p, {
                                                            returnPanel: "history",
                                                            historyTab: "purchases",
                                                            readOnly: true,
                                                        })
                                                    }
                                                >
                                                    {_t("custom_panels|bazaar_view")}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default BazaarPage;
