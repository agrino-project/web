/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React from "react";
import AccessibleButton from "../elements/AccessibleButton";
import RightPanelStore from "../../../stores/right-panel/RightPanelStore";
import { RightPanelPhases } from "../../../stores/right-panel/RightPanelStorePhases";
import LinkIcon from "@vector-im/compound-design-tokens/assets/web/icons/link";
import { Icon as ChargeIcon } from "../../../../res/img/element-icons/charge.svg";
import { Icon as BillIcon } from "../../../../res/img/element-icons/bill.svg";
import { Icon as ConsultantIcon } from "../../../../res/img/element-icons/agriculture-consultant.svg";
// import { Icon as SupportIcon } from "../../../../res/img/element-icons/support.svg";
import { _t } from "../../../languageHandler";

import "../../../../res/css/views/services/ServicesPage.pcss";

interface ServiceCardProps {
    title: string;
    description?: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    onClick: () => void;
    variant?: "default" | "large";
    disabled?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
    title,
    description,
    icon: Icon,
    onClick,
    variant = "default",
    disabled = false,
}) => {
    return (
        <AccessibleButton
            className={`mx_ServicesPage_card ${variant === "large" ? "mx_ServicesPage_card--large" : ""} ${disabled ? "mx_ServicesPage_card--disabled" : ""}`}
            onClick={disabled ? () => {} : onClick}
            element="div"
            disabled={disabled}
        >
            <div className="mx_ServicesPage_card_icon">
                <Icon className="mx_ServicesPage_card_icon_svg" />
            </div>
            <div className="mx_ServicesPage_card_content">
                <h3 className="mx_ServicesPage_card_title">{title}</h3>
                {description && <p className="mx_ServicesPage_card_description">{description}</p>}
                {disabled && <span className="mx_ServicesPage_card_badge">{_t("custom_panels|coming_soon")}</span>}
            </div>
        </AccessibleButton>
    );
};

interface Transaction {
    id: string;
    title: string;
    subtitle: string;
    amount: string;
    isNegative: boolean;
}

const TransactionItem: React.FC<Transaction> = ({ title, subtitle, amount, isNegative }) => {
    return (
        <div className="mx_ServicesPage_transaction">
            <div className="mx_ServicesPage_transaction_info">
                <div className="mx_ServicesPage_transaction_title">{title}</div>
                <div className="mx_ServicesPage_transaction_subtitle">{subtitle}</div>
            </div>
            <div className={`mx_ServicesPage_transaction_amount ${isNegative ? "negative" : "positive"}`}>
                {isNegative && "-"}
                {amount}
                <span className="mx_ServicesPage_transaction_currency"> ریال</span>
            </div>
        </div>
    );
};

const ServicesPage: React.FC = () => {
    const onCardToCardClick = (): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.CardToCard }, true, undefined);
    };
    const onChargePurchaseClick = (): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.ChargePurchase }, true, undefined);
    };
    const onBillPaymentClick = (): void => {
        RightPanelStore.instance.setCard({ phase: RightPanelPhases.BillPayment }, true, undefined);
    };

    const transactions: Transaction[] = [
        {
            id: "1",
            title: "واریز حقوق",
            subtitle: "۱۴۰۴/۰۲/۱۷، ۱۲:۳۶",
            amount: "۴۱,۹۴۰,۰۰۰,۰۰۰",
            isNegative: false,
        },
        {
            id: "2",
            title: "خرید سوپرمارکت",
            subtitle: "۱۴۰۴/۰۲/۱۷، ۱۲:۳۶",
            amount: "۸۰۰,۰۰۰",
            isNegative: true,
        },
        {
            id: "3",
            title: "قبض برق",
            subtitle: "۱۴۰۴/۰۲/۱۷، ۱۲:۳۶",
            amount: "۸۰۰,۰۰۰",
            isNegative: true,
        },
        {
            id: "4",
            title: "انتقال ارزی",
            subtitle: "۱۴۰۴/۰۲/۱۷، ۱۲:۳۶",
            amount: "۸۰۰,۰۰۰",
            isNegative: true,
        },
        {
            id: "5",
            title: "خرید سوپرمارکت",
            subtitle: "۱۴۰۴/۰۲/۱۷، ۱۲:۳۶",
            amount: "۸۰۰,۰۰۰",
            isNegative: true,
        },
    ];

    return (
        <div className="mx_ServicesPage">
            <div className="mx_ServicesPage_container">
                <div className="mx_ServicesPage_header">
                    <h1 className="mx_ServicesPage_title">{_t("custom_panels|services_title")}</h1>
                    <div className="mx_ServicesPage_title_underline"></div>
                </div>

                {/* Services Grid - Only 3 active cards */}
                <div className="mx_ServicesPage_grid">
                    <div className="mx_ServicesPage_grid_row mx_ServicesPage_grid_row--top">
                        <ServiceCard
                            title={_t("custom_panels|card_to_card")}
                            description={_t("custom_panels|card_to_card_desc")}
                            icon={LinkIcon}
                            onClick={onCardToCardClick}
                            variant="large"
                        />
                    </div>

                    <div className="mx_ServicesPage_grid_row mx_ServicesPage_grid_row--middle">
                        <ServiceCard
                            title={_t("custom_panels|bill_payment")}
                            description={_t("custom_panels|bill_payment_desc")}
                            icon={BillIcon}
                            onClick={onBillPaymentClick}
                        />
                        <ServiceCard
                            title={_t("custom_panels|charge_purchase")}
                            description={_t("custom_panels|charge_purchase_desc")}
                            icon={ChargeIcon}
                            onClick={onChargePurchaseClick}
                        />
                        <ServiceCard title="خرید بسته اینترنت" icon={ChargeIcon} onClick={() => {}} disabled />
                    </div>

                    <div className="mx_ServicesPage_grid_row mx_ServicesPage_grid_row--bottom">
                        <ServiceCard title="مشاوره مالی" icon={ConsultantIcon} onClick={() => {}} disabled />
                        <ServiceCard title="پشتیبانی" icon={ChargeIcon} onClick={() => {}} disabled />
                    </div>
                </div>

                {/* Banner */}
                <div className="mx_ServicesPage_banner">
                    <div className="mx_ServicesPage_banner_content">
                        <h2 className="mx_ServicesPage_banner_title">تسهیلات تا سقف ۶۰۰ میلیون تومان</h2>
                        <p className="mx_ServicesPage_banner_subtitle">کلیک کنید!</p>
                    </div>
                    <div className="mx_ServicesPage_banner_image">
                        <img src="../../../../res/img/safe-vault.png" alt="Safe" />
                    </div>
                </div>

                {/* Transactions Section */}
                <div className="mx_ServicesPage_transactions">
                    <div className="mx_ServicesPage_transactions_header">
                        <h2 className="mx_ServicesPage_transactions_title">خلاصه تراکنش‌های اخیر</h2>
                        <div className="mx_ServicesPage_transactions_underline"></div>
                    </div>
                    <div className="mx_ServicesPage_transactions_list">
                        {transactions.map((transaction) => (
                            <TransactionItem key={transaction.id} {...transaction} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
