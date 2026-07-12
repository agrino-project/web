/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

export interface FaqOption {
    id: string;
    label: string;
}

export interface FaqLayer {
    question: string;
    options: FaqOption[];
}

export interface ConsultantFaqDb {
    mainCategories: FaqOption[];
    layer2: Record<string, FaqLayer>;
    layer3: Record<string, FaqLayer>;
    answers: Record<string, string>;
}

export const CONSULTANT_FAQ_DB: ConsultantFaqDb = {
    "mainCategories": [
        {
            "id": "services",
            "label": "خدمات بانکی و حساب‌ها"
        },
        {
            "id": "passwords",
            "label": "رمزها و امنیت"
        },
        {
            "id": "baran",
            "label": "اپلیکیشن باران"
        },
        {
            "id": "digital",
            "label": "کانال‌های دیجیتال"
        },
        {
            "id": "loans",
            "label": "تسهیلات و وام‌ها"
        },
        {
            "id": "payments",
            "label": "پرداخت و انتقال وجه"
        },
        {
            "id": "agriculture",
            "label": "خدمات کشاورزی"
        },
        {
            "id": "rules",
            "label": "قوانین و آموزش‌ها"
        }
    ],
    "layer2": {
        "services": {
            "question": "کدام یک از خدمات حساب‌های بانکی مد نظر شماست؟",
            "options": [
                {
                    "id": "services_open",
                    "label": "افتتاح حساب"
                },
                {
                    "id": "services_statement",
                    "label": "صورتحساب و گردش حساب"
                },
                {
                    "id": "services_card",
                    "label": "کارت بانکی"
                },
                {
                    "id": "services_shaba",
                    "label": "استعلام شبا و اطلاعات حساب"
                }
            ]
        },
        "passwords": {
            "question": "کدام یک از موارد مربوط به رمزها مد نظر شماست؟",
            "options": [
                {
                    "id": "passwords_poya",
                    "label": "رمز پویا (یکبار مصرف)"
                },
                {
                    "id": "passwords_static",
                    "label": "رمز دوم ثابت"
                },
                {
                    "id": "passwords_rima",
                    "label": "برنامه ریما"
                },
                {
                    "id": "passwords_account",
                    "label": "رمز حساب (امنیتی)"
                }
            ]
        },
        "baran": {
            "question": "در مورد کدام بخش از اپلیکیشن باران سوال دارید؟",
            "options": [
                {
                    "id": "baran_install",
                    "label": "نصب، ورود و ارتقا سطح"
                },
                {
                    "id": "baran_transfer",
                    "label": "انتقال وجه و شارژ حساب"
                },
                {
                    "id": "baran_card",
                    "label": "مدیریت کارت‌ها"
                },
                {
                    "id": "baran_payment",
                    "label": "پرداخت قبوض و خرید شارژ"
                }
            ]
        },
        "digital": {
            "question": "کدام کانال دیجیتال مد نظر شماست؟",
            "options": [
                {
                    "id": "digital_hamrah",
                    "label": " همراه بانک"
                },
                {
                    "id": "digital_internet",
                    "label": " اینترنت بانک"
                }
            ]
        },
        "loans": {
            "question": "کدام نوع تسهیلات مد نظر شماست؟",
            "options": [
                {
                    "id": "loans_marriage",
                    "label": "ازدواج و فرزندآوری"
                },
                {
                    "id": "loans_ehsan",
                    "label": "طرح احسان"
                },
                {
                    "id": "loans_noavar",
                    "label": "طرح نوآور"
                },
                {
                    "id": "loans_noyan",
                    "label": "طرح نویان"
                },
                {
                    "id": "loans_house",
                    "label": "مسکن و سامانه آسان"
                }
            ]
        },
        "payments": {
            "question": "کدام نوع انتقال وجه مد نظر شماست؟",
            "options": [
                {
                    "id": "payments_paya",
                    "label": "پایا"
                },
                {
                    "id": "payments_satna",
                    "label": "ساتنا"
                },
                {
                    "id": "payments_pel",
                    "label": "پل (لحظه‌ای)"
                },
                {
                    "id": "payments_card",
                    "label": "کارت به کارت و قبوض"
                },
                {
                    "id": "payments_charge",
                    "label": "خرید شارژ و استعلام"
                }
            ]
        },
        "agriculture": {
            "question": "کدام سرویس کشاورزی مد نظر شماست؟",
            "options": [
                {
                    "id": "agri_bazar",
                    "label": "سامانه بازارگاه"
                },
                {
                    "id": "agri_paliz",
                    "label": "پلتفرم پالیز"
                },
                {
                    "id": "agri_noepo",
                    "label": "نوی‌پو"
                },
                {
                    "id": "agri_gandom",
                    "label": "وجوه گندم"
                },
                {
                    "id": "agri_gam",
                    "label": "اوراق گام و گرین‌پی"
                }
            ]
        },
        "rules": {
            "question": "کدام یک از قوانین آموزشی مد نظر شماست؟",
            "options": [
                {
                    "id": "rules_insurance",
                    "label": "اصول بیمه کشاورزی"
                },
                {
                    "id": "rules_aghd",
                    "label": "عقود بانکی اسلامی"
                },
                {
                    "id": "rules_aml",
                    "label": "مبارزه با پولشویی"
                },
                {
                    "id": "rules_rights",
                    "label": "حقوق و تکالیف مشتری"
                },
                {
                    "id": "rules_charter",
                    "label": "منشور رفتار حرفه‌ای"
                }
            ]
        }
    },
    "layer3": {
        "services_open": {
            "question": "نحوه افتتاح حساب مد نظر شماست؟",
            "options": [
                {
                    "id": "open_nonpresence",
                    "label": "افتتاح غیرحضوری (باران)"
                },
                {
                    "id": "open_presence",
                    "label": "افتتاح حضوری (شعبه)"
                }
            ]
        },
        "services_statement": {
            "question": "از چه کانالی می‌خواهید صورتحساب دریافت کنید؟",
            "options": [
                {
                    "id": "stmt_baran",
                    "label": "اپلیکیشن باران"
                },
                {
                    "id": "stmt_hamrah",
                    "label": "همراه بانک"
                },
                {
                    "id": "stmt_internet",
                    "label": "اینترنت بانک"
                }
            ]
        },
        "services_card": {
            "question": "کدام خدمات کارتی مد نظر شماست؟",
            "options": [
                {
                    "id": "card_issue",
                    "label": "صدور کارت جدید"
                },
                {
                    "id": "card_activate",
                    "label": "فعال‌سازی اولیه کارت"
                },
                {
                    "id": "card_block",
                    "label": "مسدودی کارت"
                },
                {
                    "id": "card_delete",
                    "label": "حذف کارت از برنامه"
                }
            ]
        },
        "services_shaba": {
            "question": "چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "shaba_get",
                    "label": "دریافت شماره شبا"
                },
                {
                    "id": "shaba_account",
                    "label": "استعلام شماره حساب"
                }
            ]
        },
        "passwords_poya": {
            "question": "کدام عملیات روی رمز پویا مد نظر شماست؟",
            "options": [
                {
                    "id": "pwd_activate",
                    "label": "فعال‌سازی رمز پویا"
                },
                {
                    "id": "pwd_deactivate",
                    "label": "غیرفعال‌سازی رمز پویا"
                },
                {
                    "id": "pwd_unblock",
                    "label": "رفع انسداد رمز پویا"
                },
                {
                    "id": "pwd_methods",
                    "label": "روش‌های دریافت رمز پویا"
                }
            ]
        },
        "passwords_static": {
            "question": "در مورد رمز دوم ثابت چه کمکی نیاز دارید؟",
            "options": [
                {
                    "id": "static_forget",
                    "label": "فراموشی رمز ثابت"
                },
                {
                    "id": "static_change",
                    "label": "تغییر رمز ثابت"
                },
                {
                    "id": "static_limit",
                    "label": "سقف تراکنش رمز ثابت"
                }
            ]
        },
        "passwords_rima": {
            "question": "در مورد برنامه ریما چه سوالی دارید؟",
            "options": [
                {
                    "id": "rima_download",
                    "label": "دانلود و نصب ریما"
                },
                {
                    "id": "rima_activate",
                    "label": "فعال‌سازی ریما"
                },
                {
                    "id": "rima_ios",
                    "label": "نسخه iOS ریما"
                }
            ]
        },
        "passwords_account": {
            "question": "در مورد رمز حساب چه کمکی نیاز دارید؟",
            "options": [
                {
                    "id": "accpwd_get",
                    "label": "دریافت رمز حساب"
                },
                {
                    "id": "accpwd_change",
                    "label": "تغییر رمز حساب"
                },
                {
                    "id": "accpwd_error",
                    "label": "خطای رمز اشتباه"
                }
            ]
        },
        "baran_install": {
            "question": "کدام بخش نصب و ورود باران مد نظر شماست؟",
            "options": [
                {
                    "id": "baran_download",
                    "label": "دانلود و نصب باران"
                },
                {
                    "id": "baran_login",
                    "label": "ورود به باران"
                },
                {
                    "id": "baran_levelup",
                    "label": "ارتقا سطح کاربری"
                },
                {
                    "id": "baran_web",
                    "label": "نسخه وب باران"
                }
            ]
        },
        "baran_transfer": {
            "question": "کدام نوع انتقال وجه مد نظر شماست؟",
            "options": [
                {
                    "id": "baran_transfer_smart",
                    "label": "انتقال وجه هوشمند"
                },
                {
                    "id": "baran_charge",
                    "label": "شارژ حساب"
                }
            ]
        },
        "baran_card": {
            "question": "کدام مدیریت کارت مد نظر شماست؟",
            "options": [
                {
                    "id": "baran_card_manage",
                    "label": "مدیریت کارت‌ها در باران"
                },
                {
                    "id": "baran_card_services",
                    "label": "خدمات کارت در باران"
                }
            ]
        },
        "baran_payment": {
            "question": "کدام پرداخت مد نظر شماست؟",
            "options": [
                {
                    "id": "baran_bill",
                    "label": "پرداخت قبوض در باران"
                },
                {
                    "id": "baran_package",
                    "label": "خرید شارژ و بسته اینترنتی"
                },
                {
                    "id": "baran_error",
                    "label": "خطاهای رایج در باران"
                }
            ]
        },
        "digital_hamrah": {
            "question": "در مورد کدام بخش همراه بانک سوال دارید؟",
            "options": [
                {
                    "id": "hamrah_activate",
                    "label": "فعال‌سازی همراه بانک"
                },
                {
                    "id": "hamrah_recovery",
                    "label": "بازیابی رمز عبور"
                },
                {
                    "id": "hamrah_transfer",
                    "label": "انتقال وجه و کارت به کارت"
                },
                {
                    "id": "hamrah_statement",
                    "label": "صورتحساب"
                },
                {
                    "id": "hamrah_pwd",
                    "label": "رمز پویا در همراه بانک"
                },
                {
                    "id": "hamrah_cheque",
                    "label": "ثبت چک و مسدودی کارت"
                }
            ]
        },
        "digital_internet": {
            "question": "در مورد کدام بخش اینترنت بانک سوال دارید؟",
            "options": [
                {
                    "id": "net_activate",
                    "label": "فعال‌سازی و ورود"
                },
                {
                    "id": "net_token",
                    "label": "توکن (سخت‌افزاری و نرم‌افزاری)"
                },
                {
                    "id": "net_transfer",
                    "label": "انتقال وجه"
                },
                {
                    "id": "net_statement",
                    "label": "دریافت صورتحساب PDF/Excel"
                },
                {
                    "id": "net_card",
                    "label": "مدیریت کارت"
                },
                {
                    "id": "net_cheque",
                    "label": "ثبت چک (چابک) و خطاها"
                }
            ]
        },
        "loans_marriage": {
            "question": "کدام یک از این تسهیلات تکمیلی مد نظر شماست؟",
            "options": [
                {
                    "id": "loan_marriage_detail",
                    "label": "تسهیلات ازدواج"
                },
                {
                    "id": "loan_child_detail",
                    "label": "تسهیلات فرزندآوری"
                }
            ]
        },
        "loans_ehsan": {
            "question": "در مورد طرح احسان چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "ehsan_conditions",
                    "label": "شرایط و نحوه دریافت"
                },
                {
                    "id": "ehsan_transfer",
                    "label": "انتقال امتیاز طرح احسان"
                },
                {
                    "id": "ehsan_calculator",
                    "label": "محاسبه‌گر طرح احسان"
                }
            ]
        },
        "loans_noavar": {
            "question": "در مورد طرح نوآور چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "noavar_conditions",
                    "label": "شرایط و نحوه دریافت"
                },
                {
                    "id": "noavar_amount",
                    "label": "سقف و ضریب تسهیلات"
                },
                {
                    "id": "noavar_calculator",
                    "label": "محاسبه‌گر طرح نوآور"
                }
            ]
        },
        "loans_noyan": {
            "question": "در مورد طرح نویان چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "noyan_conditions",
                    "label": "شرایط و نحوه دریافت"
                },
                {
                    "id": "noyan_coefficient",
                    "label": "ضریب تسهیلاتی نویان"
                }
            ]
        },
        "loans_house": {
            "question": "کدام یک از خدمات مسکن مد نظر شماست؟",
            "options": [
                {
                    "id": "house_rent",
                    "label": "ودیعه مسکن روستایی"
                },
                {
                    "id": "house_asan",
                    "label": "سامانه آسان (ثبت‌نام)"
                }
            ]
        },
        "payments_paya": {
            "question": "در مورد انتقال وجه پایا چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "paya_info",
                    "label": "مشخصات و زمان‌بندی پایا"
                },
                {
                    "id": "paya_cycles",
                    "label": "سیکل‌های تسویه پایا"
                },
                {
                    "id": "paya_services",
                    "label": "خدمات قابل پرداخت با پایا"
                }
            ]
        },
        "payments_satna": {
            "question": "در مورد انتقال وجه ساتنا چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "satna_info",
                    "label": "مشخصات و زمان ساتنا"
                },
                {
                    "id": "satna_limit",
                    "label": "سقف تراکنش ساتنا"
                }
            ]
        },
        "payments_pel": {
            "question": "در مورد انتقال وجه پل چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "pel_info",
                    "label": "مشخصات و مزایای پل"
                },
                {
                    "id": "pel_limit",
                    "label": "سقف تراکنش پل"
                },
                {
                    "id": "pel_restriction",
                    "label": "محدودیت‌های پل"
                }
            ]
        },
        "payments_card": {
            "question": "کدام یک از خدمات کارتی مد نظر شماست؟",
            "options": [
                {
                    "id": "card2card",
                    "label": "کارت به کارت"
                },
                {
                    "id": "bill_pay",
                    "label": "پرداخت قبوض"
                }
            ]
        },
        "payments_charge": {
            "question": "کدام یک از خدمات شارژ و استعلام مد نظر شماست؟",
            "options": [
                {
                    "id": "charge_buy",
                    "label": "خرید شارژ"
                },
                {
                    "id": "inquiry_trans",
                    "label": "استعلام تراکنش"
                }
            ]
        },
        "agri_bazar": {
            "question": "در مورد سامانه بازارگاه چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "bazar_info",
                    "label": "مشخصات و مدل بازارگاه"
                },
                {
                    "id": "bazar_register",
                    "label": "ثبت‌نام در بازارگاه"
                },
                {
                    "id": "bazar_buy",
                    "label": "انواع خرید در بازارگاه"
                }
            ]
        },
        "agri_paliz": {
            "question": "در مورد پلتفرم پالیز چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "paliz_info",
                    "label": "پالیز و کشاورزی قراردادی"
                },
                {
                    "id": "paliz_register",
                    "label": "ثبت‌نام در پالیز"
                },
                {
                    "id": "paliz_users",
                    "label": "استفاده‌کنندگان پالیز"
                }
            ]
        },
        "agri_noepo": {
            "question": "در مورد نوی‌پو چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "noepo_info",
                    "label": "مشخصات نوی‌پو"
                },
                {
                    "id": "noepo_benefits",
                    "label": "مزایا و ویژگی‌های نوی‌پو"
                }
            ]
        },
        "agri_gandom": {
            "question": "در مورد وجوه گندم چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "gandom_time",
                    "label": "زمان واریز وجوه گندم"
                },
                {
                    "id": "gandom_check",
                    "label": "پیگیری عدم واریز"
                },
                {
                    "id": "gandom_deduction",
                    "label": "کسورات از وجوه گندم"
                }
            ]
        },
        "agri_gam": {
            "question": "کدام یک از این ابزارهای مالی مد نظر شماست؟",
            "options": [
                {
                    "id": "gam_info",
                    "label": "اوراق گام"
                },
                {
                    "id": "greenpay_info",
                    "label": "گرین‌پی (کیف پول اعتباری)"
                }
            ]
        },
        "rules_insurance": {
            "question": "کدام یک از اصول بیمه کشاورزی مد نظر شماست؟",
            "options": [
                {
                    "id": "ins_principle",
                    "label": "اصول پنج‌گانه بیمه"
                },
                {
                    "id": "ins_terms",
                    "label": "قوانین پایه بیمه"
                }
            ]
        },
        "rules_aghd": {
            "question": "کدام یک از عقود بانکی مد نظر شماست؟",
            "options": [
                {
                    "id": "aghd_gharz",
                    "label": "قرض‌الحسنه"
                },
                {
                    "id": "aghd_morabehe",
                    "label": "مرابحه و فروش اقساطی"
                },
                {
                    "id": "aghd_mozarebe",
                    "label": "مضاربه و مشارکت مدنی"
                },
                {
                    "id": "aghd_salf",
                    "label": "سلف و اجاره به شرط تملیک"
                }
            ]
        },
        "rules_aml": {
            "question": "در مورد مبارزه با پولشویی چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "aml_definition",
                    "label": "تعریف پولشویی و مراحل آن"
                },
                {
                    "id": "aml_forms",
                    "label": "فرم‌های CTR و STR"
                },
                {
                    "id": "aml_customer",
                    "label": "شناسایی مشتری و ممنوع‌الخدمت‌ها"
                }
            ]
        },
        "rules_rights": {
            "question": "کدام یک از حقوق و تکالیف مد نظر شماست؟",
            "options": [
                {
                    "id": "rights_duties",
                    "label": "تکالیف مشتری و تعهدات بانک"
                },
                {
                    "id": "rights_secrets",
                    "label": "اسرار محرمانه بانکی"
                }
            ]
        },
        "rules_charter": {
            "question": "در مورد منشور رفتار حرفه‌ای چه اطلاعاتی نیاز دارید؟",
            "options": [
                {
                    "id": "charter_principles",
                    "label": "اصول کلیدی منشور"
                },
                {
                    "id": "charter_staff",
                    "label": "وظایف کارکنان بانک"
                }
            ]
        }
    },
    "answers": {}
};

export const FAQ_FALLBACK_ANSWER =
    "پاسخ کامل این مورد به‌زودی افزوده می‌شود. برای اطلاعات بیشتر با شعبه تماس بگیرید یا از منوی اصلی گزینه دیگری را انتخاب کنید.";

export const FAQ_WELCOME = "به مشاور بانکی کشاورزی خوش آمدید. لطفاً موضوع مورد نظر خود را انتخاب کنید:";

export const FAQ_FREE_TEXT_REPLY = "برای پاسخ دقیق‌تر لطفاً از منوی گزینه‌های موجود استفاده کنید.";

export const FAQ_HEADER_TITLE = "مشاور بانکی کشاورزی";

export const FAQ_HEADER_SUBTITLE = "با ۴ مرحله انتخاب، دقیق‌ترین راهنما را دریافت کنید";
