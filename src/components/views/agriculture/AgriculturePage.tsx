/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useContext, useCallback, useRef, useState, useEffect } from "react";
import { Icon as ConsultantIcon } from "../../../../res/img/element-icons/agriculture-consultant.svg";
import { Icon as OrganizationIcon } from "../../../../res/img/element-icons/agriculture-organization.svg";
import { Icon as MarketIcon } from "../../../../res/img/element-icons/agriculture-market.svg";
import { Icon as EducationIcon } from "../../../../res/img/element-icons/agriculture-education.svg";
import { Icon as ClimateIcon } from "../../../../res/img/element-icons/agriculture-climate.svg";
import { Icon as ClubIcon } from "../../../../res/img/element-icons/agriculture-club.svg";
import { Icon as InsuranceIcon } from "../../../../res/img/element-icons/agriculture-insurance.svg";
import { Icon as BazaarIcon } from "../../../../res/img/element-icons/agriculture-bazaar.svg";

import "../../../../res/css/views/agriculture/AgriculturePage.pcss";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { DirectoryMember, startDmOnFirstMessage } from "../../../utils/direct-messages";
import { _t } from "../../../languageHandler";
import { useMobileNav } from "../../structures/mobile/MobileNavContext";

interface AgricultureCardProps {
    title: string;
    subtitle?: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    disabled?: boolean;
    onClick?: () => void;
    variant?: "default" | "large" | "small" | "wide";
}

const AgricultureCard: React.FC<AgricultureCardProps> = ({
    title,
    subtitle,
    icon: Icon,
    disabled = false,
    onClick,
    variant = "default",
}) => {
    return (
        <div
            className={`mx_AgriculturePage_card mx_AgriculturePage_card_${variant} ${disabled ? "mx_AgriculturePage_card_disabled" : ""}`}
            onClick={disabled ? undefined : onClick}
            role={disabled ? undefined : "button"}
            tabIndex={disabled ? undefined : 0}
        >
            <div className="mx_AgriculturePage_card_icon">
                <Icon className="mx_AgriculturePage_card_icon_svg" />
            </div>
            <div className="mx_AgriculturePage_card_content">
                <h3 className="mx_AgriculturePage_card_title">{title}</h3>
                {subtitle && <p className="mx_AgriculturePage_card_subtitle">{subtitle}</p>}
                {disabled && <span className="mx_AgriculturePage_card_badge">{_t("custom_panels|coming_soon")}</span>}
            </div>
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
            <div className="mx_AgriculturePage_banner_image">{/* Image placeholder */}</div>
        </div>
    );
};

interface ArticleCardProps {
    title: string;
    image?: string;
    category?: string;
    onClick?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ title, image, category, onClick }) => {
    return (
        <div className="mx_AgriculturePage_article" onClick={onClick}>
            {image && (
                <div className="mx_AgriculturePage_article_image">
                    <img src={image} alt={title} />
                    {category && <span className="mx_AgriculturePage_article_category">{category}</span>}
                </div>
            )}
            <div className="mx_AgriculturePage_article_content">
                <h4 className="mx_AgriculturePage_article_title">{title}</h4>
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

    const handleMarketClick = useCallback(
        async (userId: string): Promise<void> => {
            const advertiseBot = new DirectoryMember({
                user_id: userId,
            });
            await startDmOnFirstMessage(cli, [advertiseBot]);
            navigate("chatRoom");
        },
        [cli, navigate],
    );

    const bannerSlides = [
        {
            title: "بهترین قیمت نهاده‌ها در آگرینو",
            subtitle: "کلیک کنید",
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
            title: "چگونه بیشترین محصول برنج را در زمین خود بکارید؟",
            image: "/path/to/rice-field.jpg",
            category: "مقاله",
        },
        {
            title: "افزایش ۳۰ درصدی قیمت برنج نهاده‌های دامی؛ چالش جدید برای دامداران",
            image: "/path/to/wheat.jpg",
            category: "اقتصاد",
        },
    ];

    return (
        <div className="mx_AgriculturePage">
            <div className="mx_AgriculturePage_container">
                {/* Top Row - Two Cards */}
                <div className="mx_AgriculturePage_row mx_AgriculturePage_row_top">
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_bazaar")}
                        icon={BazaarIcon}
                        disabled={true}
                        variant="default"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_market")}
                        icon={MarketIcon}
                        onClick={() => handleMarketClick("@advertisebot:agridemo.ir")}
                        variant="default"
                    />
                </div>

                {/* Consultant Card - Full Width */}
                <div className="mx_AgriculturePage_row">
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_consultant")}
                        icon={ConsultantIcon}
                        onClick={() => handleMarketClick("@useller:agridemo.ir")}
                        variant="wide"
                    />
                </div>

                {/* Section Title */}
                <div className="mx_AgriculturePage_section_title">{_t("custom_panels|quick_access")}</div>

                {/* Four Small Cards */}
                <div className="mx_AgriculturePage_row mx_AgriculturePage_row_small">
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_education")}
                        icon={EducationIcon}
                        disabled={true}
                        variant="small"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_insurance")}
                        icon={InsuranceIcon}
                        disabled={true}
                        variant="small"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|agriculture_climate")}
                        icon={ClimateIcon}
                        disabled={true}
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
                        subtitle={_t("custom_panels|for_iranian_agricultural_communities")}
                        icon={OrganizationIcon}
                        disabled={true}
                        variant="large"
                    />
                    <AgricultureCard
                        title={_t("custom_panels|discussion_forum")}
                        subtitle={_t("custom_panels|local_agriculture_for_each_other")}
                        icon={ConsultantIcon}
                        disabled={true}
                        variant="large"
                    />
                </div>

                {/* Final Row - Three Cards */}
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
                        icon={MarketIcon}
                        disabled={true}
                        variant="small"
                    />
                </div>

                {/* Personalized Section */}
                <h3 className="mx_AgriculturePage_personalized_title">{_t("custom_panels|for_you")}</h3>
                <div className="mx_AgriculturePage_personalized">
                    <div className="mx_AgriculturePage_personalized_icon">+</div>
                    <p className="mx_AgriculturePage_personalized_description">{_t("custom_panels|enter_product")}</p>
                </div>

                {/* Articles Section */}
                <div className="mx_AgriculturePage_section">
                    <div className="mx_AgriculturePage_section_header">
                        <h3 className="mx_AgriculturePage_section_title_main">{_t("custom_panels|articles")}</h3>
                        <button className="mx_AgriculturePage_section_more">{_t("custom_panels|show_all")}</button>
                    </div>
                    <div className="mx_AgriculturePage_articles">
                        {articles.map((article, index) => (
                            <ArticleCard
                                key={index}
                                title={article.title}
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
                        <div className="mx_AgriculturePage_support_card">
                            <div className="mx_AgriculturePage_support_icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M20 7C20 5.897 19.103 5 18 5H6C4.897 5 4 5.897 4 7V17C4 18.103 4.897 19 6 19H18C19.103 19 20 18.103 20 17V7Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M4 7L12 13L20 7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <h4 className="mx_AgriculturePage_support_card_title">{_t("custom_panels|Marketplace")}</h4>
                        </div>

                        <div className="mx_AgriculturePage_support_card">
                            <div className="mx_AgriculturePage_support_icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <h4 className="mx_AgriculturePage_support_card_title">{_t("custom_panels|Club")}</h4>
                        </div>

                        <div className="mx_AgriculturePage_support_card">
                            <div className="mx_AgriculturePage_support_icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M3 16.5C3 19.5 5.5 21 8 21C10.5 21 12 19.5 12 16.5V7.5C12 4.5 14.5 3 17 3C19.5 3 21 4.5 21 7.5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M3 7.5L3 16.5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <h4 className="mx_AgriculturePage_support_card_title">{_t("custom_panels|Weather")}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgriculturePage;
