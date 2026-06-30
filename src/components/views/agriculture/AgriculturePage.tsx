/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useContext, useCallback, useRef, useState, useEffect } from "react";
import { Icon as ConsultantIcon } from "../../../../res/img/element-icons/agriculture-consultant2.svg";
import { Icon as GreatShopsIcon } from "../../../../res/img/element-icons/greatShops.svg";
// import { Icon as OrganizationIcon } from "../../../../res/img/element-icons/agriculture-organization.svg";
// import { Icon as MarketIcon } from "../../../../res/img/element-icons/agriculture-market.svg";
import { Icon as EducationIcon } from "../../../../res/img/element-icons/agriculture-education2.svg";
// import { Icon as ClimateIcon } from "../../../../res/img/element-icons/agriculture-climate.svg";
import { Icon as TallarIcon } from "../../../../res/img/element-icons/messageTallar.svg";
// import { Icon as BankIcon } from "../../../../res/img/element-icons/BankIcon.svg";
import { Icon as BankGredientIcon } from "../../../../res/img/element-icons/BankGredient.svg";
import { Icon as BuildingsIcon } from "../../../../res/img/element-icons/Buildings.svg";
// import { Icon as ClubIcon } from "../../../../res/img/element-icons/agriculture-club2.svg";
import { Icon as InsuranceIcon } from "../../../../res/img/element-icons/agriculture-insurance2.svg";
// import { Icon as BazaarIcon } from "../../../../res/img/element-icons/agriculture-bazaar2.svg";
import { Icon as BazaarGrediantIcon } from "../../../../res/img/element-icons/agriculture-bazaar3.svg";
import { Icon as WeatherIcon } from "../../../../res/img/element-icons/weather.svg";
import { Icon as ClubIcon } from "../../../../res/img/element-icons/club.svg";
import { Icon as FarmerHand } from "../../../../res/img/element-icons/farmerHand.svg";
import { Icon as FaqIcon } from "../../../../res/img/element-icons/faq.svg";
import { Icon as MailboxIcon } from "../../../../res/img/element-icons/Mailbox.svg";
import { Icon as PhoneIcon } from "../../../../res/img/element-icons/Phone.svg";
import ATMBackground from "../../../../res/img/element-icons/ATM.png";
import GroceryBackground from "../../../../res/img/element-icons/groceryShop.png";
import article1 from "../../../../res/img/element-icons/article1.png";
import article2 from "../../../../res/img/element-icons/article2.png";

import "../../../../res/css/views/agriculture/AgriculturePage.pcss";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { DirectoryMember, startDmOnFirstMessage } from "../../../utils/direct-messages";
import { _t } from "../../../languageHandler";
import { useMobileNav } from "../../structures/mobile/MobileNavContext";
import RightPanelStore from "../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../stores/right-panel/RightPanelStorePhases";
import defaultDispatcher from "../../../dispatcher/dispatcher";
import { Action } from "../../../dispatcher/actions";
import { type ViewRoomPayload } from "../../../dispatcher/payloads/ViewRoomPayload";

interface AgricultureCardProps {
    title: string;
    subtitle?: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    background?: string;
    color?: string;
    disabled?: boolean;
    onClick?: () => void;
    variant?: "default" | "large" | "small" | "wide";
    BackgroundIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const AgricultureCard: React.FC<AgricultureCardProps> = ({
    title,
    subtitle,
    icon: Icon,
    background,
    color,
    disabled = false,
    onClick,
    variant = "default",
    BackgroundIcon,
}) => {
    return (
        <div
            className={`mx_AgriculturePage_card mx_AgriculturePage_card_${variant} ${disabled ? "mx_AgriculturePage_card_disabled" : ""}`}
            onClick={disabled ? undefined : onClick}
            role={disabled ? undefined : "button"}
            tabIndex={disabled ? undefined : 0}
            style={{ background }}
        >
            {BackgroundIcon && (
                <div className="mx_AgriculturePage_card_backgroundIcon">
                    <BackgroundIcon />
                </div>
            )}
            <div className="mx_AgriculturePage_card_icon">
                <Icon className="mx_AgriculturePage_card_icon_svg" />
            </div>
            <div className="mx_AgriculturePage_card_content">
                <h3 style={{ color: color }} className="mx_AgriculturePage_card_title">
                    {title}
                </h3>
                {subtitle && (
                    <p style={{ color: color }} className="mx_AgriculturePage_card_subtitle">
                        {subtitle}
                    </p>
                )}
            </div>
            {disabled && <span className="mx_AgriculturePage_card_badge">{_t("custom_panels|coming_soon")}</span>}
        </div>
    );
};

interface BannerSlideProps {
    title: string;
    subtitle: string;
    onClick?: () => void;
}

const BannerSlide: React.FC<BannerSlideProps> = ({ title, subtitle, onClick }) => {
    return (
        <div className="mx_AgriculturePage_banner_slide" onClick={onClick}>
            <div className="mx_AgriculturePage_banner_content">
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>
            <div className="mx_AgriculturePage_banner_image">
                <FarmerHand />
            </div>
        </div>
    );
};

interface ArticleCardProps {
    title: string;
    excerpt: string;
    image?: string;
    category?: string;
    onClick?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ title, excerpt, image, category, onClick }) => {
    return (
        <div className="mx_AgriculturePage_article" onClick={onClick}>
            {image && (
                <div className="mx_AgriculturePage_article_image">
                    <img src={image} alt={title} />
                </div>
            )}
            <div className="mx_AgriculturePage_article_content">
                {category && <span className="mx_AgriculturePage_article_category">{category}</span>}
                <h4 className="mx_AgriculturePage_article_title">{title}</h4>
                <p className="mx_AgriculturePage_article_excerpt">{excerpt}</p>
            </div>
        </div>
    );
};

const AgriculturePage: React.FC = () => {
    const cli = useContext(MatrixClientContext);
    const { navigate } = useMobileNav();
    const bannerScrollRef = useRef<HTMLDivElement>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    const scrollToSlide = (index: number) => {
        if (bannerScrollRef.current) {
            const slideElement = bannerScrollRef.current.children[index] as HTMLElement;

            if (slideElement) {
                slideElement.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
            setActiveSlide(index);
        }
    };

    const handleScroll = () => {
        if (bannerScrollRef.current) {
            const scrollLeft = Math.abs(bannerScrollRef.current.scrollLeft);
            const slideWidth = bannerScrollRef.current.clientWidth;

            const newIndex = Math.round(scrollLeft / slideWidth);

            if (newIndex >= 0 && newIndex < bannerSlides.length) {
                setActiveSlide(newIndex);
            }
        }
    };

    useEffect(() => {
        const container = bannerScrollRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, []);

    const exitAgricultureView = useCallback((): void => {
        const store = RightPanelStore.instance;
        if (store.isOpen && store.currentCard.phase === RightPanelPhases.Agriculture) {
            store.hide(null);
        }
    }, []);

    const handleMarketClick = useCallback(
        async (target: string): Promise<void> => {
            // Close agriculture overlay so RoomView can replace AgriculturePage (desktop + mobile sync).
            exitAgricultureView();
            if (target.startsWith("#")) {
                // Room alias — resolve to a room and view it directly (no DM creation).
                defaultDispatcher.dispatch<ViewRoomPayload>({
                    action: Action.ViewRoom,
                    room_alias: target,
                    metricsTrigger: "RoomDirectory",
                });
            } else {
                // User ID — start a DM with that user.
                const member = new DirectoryMember({ user_id: target });
                await startDmOnFirstMessage(cli, [member]);
            }
            navigate("chatRoom");
        },
        [cli, navigate, exitAgricultureView],
    );

    const handleBankingServicesClick = useCallback((): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.Services }, true, undefined);
        navigate("services");
    }, [navigate]);

    const handleGreatShopsClick = useCallback((): void => {
        exitAgricultureView();
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.GreatShops }, true, undefined);
        navigate("greatShops");
    }, [navigate, exitAgricultureView]);

    const handleBazaarClick = useCallback((): void => {
        exitAgricultureView();
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.Bazaar }, true, undefined);
        navigate("bazaar");
    }, [navigate, exitAgricultureView]);

    const bannerSlides = [
        {
            title: "بهترین قیمت نهاده‌ها در آگرینو",
            subtitle: "کلیک کنید !",
        },
        {
            title: "محصولات ارگانیک با تخفیف ویژه",
            subtitle: "مشاهده کنید",
        },
        {
            title: "مشاوره رایگان کشاورزی",
            subtitle: "همین حالا",
        },
    ];

    const articles = [
            {
            title: "افزایش ۳۰ درصدی قیمت برخی نهاده‌های دامی: چالش جدید برای دامداران",
            excerpt:
                "در حالی که بازار کشاورزی ایران با نوسانات متعددی روبرو است، گزارش‌های جدید نشان می‌دهد که قیمت برخی نهاده‌های دامی مانند ذرت، جو و کنجاله سویا، تا ۳۰ درصد افزایش یافته است. این افزایش ناگهانی، که از ابتدای ماه جاری آغاز شده، نگرانی‌های جدی را در میان دامداران و تولیدکنندگان گوشت و لبنیات ایجاد کرده است.",
            image: article1,
            category: "اخبار",
        },
        {
            title: "چگونه بیشترین محصول برنج را در زمین خود بکارم؟",
            excerpt:
                "برای کاشت بیشترین محصول برنج در زمین خود، باید به روش‌های کشاورزی مدرن و بهینه توجه کنید. افزایش محصول برنج به عوامل مختلفی مانند انتخاب بذر مناسب، آماده‌سازی خاک، مدیریت آب، کوددهی، کنترل آفات و علف‌های هرز بستگی دارد. در ادامه، گام‌به‌گام توضیح می‌دهم چگونه می‌توانید محصول خود را به حداکثر برسانید. این توصیه‌ها بر اساس بهترین شیوه‌های کشاورزی است.",
            image: article2,
            category: "مقاله",
        }
    ];

    return (
        <div className="mx_AgriculturePage">
            <div className="mx_AgriculturePage_container">
                {/* Top Row - Two Cards */}
                <div className="mx_AgriculturePage_row mx_AgriculturePage_row_top">
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_bazaar")}
                        icon={BazaarGrediantIcon}
                        background={`url(${GroceryBackground}) center/cover no-repeat`}
                        onClick={handleBazaarClick}
                        variant="default"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|banking_services")}
                        icon={BankGredientIcon}
                        background={`url(${ATMBackground}) center/cover no-repeat`}
                        onClick={handleBankingServicesClick}
                        variant="default"
                    />
                </div>

                {/* Consultant Card - Full Width */}
                <div className="mx_AgriculturePage_row mx_AgriculturePage_row_top">
                    <AgricultureCard
                        title={_t("custom_panels|greatShops")}
                        icon={GreatShopsIcon}
                        onClick={handleGreatShopsClick}
                        variant="default"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_consultant")}
                        icon={ConsultantIcon}
                        onClick={() => handleMarketClick("@useller:agridemo.ir")}
                        variant="default"
                    />
                </div>

                {/* Section Title */}
                <div className="mx_AgriculturePage_section_title">{_t("custom_panels|quick_access")}</div>

                {/* Four Small Cards */}
                <div className="mx_AgriculturePage_row mx_AgriculturePage_row_small">
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_education")}
                        icon={EducationIcon}
                        onClick={() => handleMarketClick("#amoozesh:agridemo.ir")}
                        variant="small"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_insurance")}
                        icon={InsuranceIcon}
                        onClick={() => handleMarketClick("#insurance:agridemo.ir")}
                        variant="small"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|Weather")}
                        icon={WeatherIcon}
                        onClick={() => handleMarketClick("#weather:agridemo.ir")}
                        variant="small"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_club")}
                        icon={ClubIcon}
                        disabled={true}
                        variant="small"
                    />
                </div>

                {/* Banner Carousel */}
                <div className="mx_AgriculturePage_banner_wrapper">
                    <div className="mx_AgriculturePage_banner_container" ref={bannerScrollRef}>
                        {bannerSlides.map((slide, index) => (
                            <BannerSlide key={index} title={slide.title} subtitle={slide.subtitle} />
                        ))}
                    </div>
                    <div className="mx_AgriculturePage_banner_dots">
                        {bannerSlides.map((_, index) => (
                            <span
                                key={index}
                                className={`mx_AgriculturePage_banner_dot ${activeSlide === index ? "active" : ""}`}
                                onClick={() => scrollToSlide(index)}
                            ></span>
                        ))}
                    </div>
                </div>

                {/* Bottom Row - Two Cards */}
                <div className="mx_AgriculturePage_row mx_AgriculturePage_row_bottom">
                    <AgricultureCard
                        title={_t("custom_panels|interaction_with_organizations")}
                        subtitle={_t("custom_panels|local_agriculture_for_each_other")}
                        icon={TallarIcon}
                        BackgroundIcon={TallarIcon}
                        background="#326430"
                        variant="large"
                        disabled={true}
                    />
                    <AgricultureCard
                        title={_t("custom_panels|discussion_forum")}
                        subtitle={_t("custom_panels|for_iranian_agricultural_communities")}
                        icon={BuildingsIcon}
                        background="#F9FAF9"
                        color="#151A14"
                        BackgroundIcon={BuildingsIcon}
                        variant="large"
                        disabled={true}
                    />
                </div>

                {/* Final Row - Three Cards
                <div className="mx_AgriculturePage_row mx_AgriculturePage_row_final">
                    <AgricultureCard
                        title={_t("custom_panels|product_market")}
                        icon={BazaarIcon}
                        disabled={true}
                        variant="small"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_book")}
                        icon={EducationIcon}
                        disabled={true}
                        variant="small"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|banking_services")}
                        icon={BankIcon}
                        disabled={true}
                        variant="small"
                    />
                </div> */}

                {/* Articles Section */}
                <div className="mx_AgriculturePage_section">
                    <div className="mx_AgriculturePage_section_header">
                        <h3 className="mx_AgriculturePage_section_title_main">{_t("custom_panels|articles")}</h3>
                    </div>
                    <div className="mx_AgriculturePage_articles">
                        {articles.map((article, index) => (
                            <ArticleCard
                                key={index}
                                title={article.title}
                                excerpt={article.excerpt}
                                image={article.image}
                                category={article.category}
                            />
                        ))}
                    </div>
                </div>

                {/* Support Section */}
                <div className="mx_AgriculturePage_support">
                    <h3 className="mx_AgriculturePage_support_title">{_t("custom_panels|support")}</h3>
                    <div className="mx_AgriculturePage_support_cards">
                        <AgricultureCard
                            title={_t("custom_panels|support")}
                            icon={PhoneIcon}
                            disabled={true}
                            variant="small"
                        />
                        <AgricultureCard
                            title={_t("custom_panels|faq")}
                            icon={FaqIcon}
                            disabled={true}
                            variant="small"
                        />
                        <AgricultureCard
                            title={_t("custom_panels|contact")}
                            icon={MailboxIcon}
                            disabled={true}
                            variant="small"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgriculturePage;
