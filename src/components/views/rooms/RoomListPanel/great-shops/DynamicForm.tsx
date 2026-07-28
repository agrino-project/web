/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX, useEffect, useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { _t, type TranslationKey } from "../../../../../languageHandler";
import {
    bodyStyle,
    buttonStyle,
    descriptionStyle,
    errorTextStyle,
    green,
    inputErrorStyle,
    inputStyle,
    labelStyle,
    secondaryButtonStyle,
    sectionStyle,
    selectStyle,
    StepIndicator,
} from "./shared";
import {
    type Field,
    type FieldCondition,
    type FieldValue,
    type FormErrors,
    type FormStructure,
    type FormValues,
} from "./formTypes";
import { fetchCities, isCityFieldTitle, isProvinceFieldTitle } from "../../../../../utils/iranLocations";

/** Jalali date string sent to the backend (e.g. 1403/04/01). */
const JALALI_DATE_FORMAT = "YYYY/MM/DD";

function toEnglishDigits(value: string): string {
    return value
        .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function isProvinceField(field: Field): boolean {
    return isProvinceFieldTitle(field.title) || (field.type as string) === "province";
}

function isCityField(field: Field): boolean {
    return isCityFieldTitle(field.title) || (field.type as string) === "city";
}

function findProvinceField(fields: Field[]): Field | undefined {
    return fields.find((f) => isProvinceField(f));
}

/**
 * Cities API expects the Persian province *name*.
 * Province fields store option value/id (numeric); resolve back to `label`.
 */
function resolveProvinceName(provinceField: Field | undefined, provinceValue: FieldValue): string | null {
    if (!provinceField || provinceValue == null || provinceValue === "") return null;
    const raw = String(provinceValue).trim();
    if (!raw) return null;

    const match = provinceField.options.find(
        (o) => o.value === raw || String(o.id) === raw || o.label === raw,
    );
    if (match) {
        // Prefer label (نام استان) for GET .../locations/cities?province=
        const name = (match.label || match.value || "").trim();
        return name || raw;
    }

    // Already a name, or options not loaded yet.
    return raw;
}

function allFormFields(form: FormStructure): Field[] {
    return form.steps.flatMap((s) => s.fields);
}

// ----- Condition evaluation -----

function evaluateCondition(cond: FieldCondition, values: FormValues): boolean {
    const depVal = values[cond.dependsOn];
    switch (cond.operator) {
        case "equals":
            return depVal === cond.value;
        case "not_equals":
            return depVal !== cond.value;
        case "in":
            return Array.isArray(cond.value) && typeof depVal === "string" && cond.value.includes(depVal);
        case "not_in":
            return Array.isArray(cond.value) && typeof depVal === "string" && !cond.value.includes(depVal);
        default:
            return true;
    }
}

function shouldShowField(field: Field, values: FormValues): boolean {
    if (!field.conditions || field.conditions.length === 0) return true;
    const results = field.conditions.map((c) => evaluateCondition(c, values));
    return field.condition_logic === "any" ? results.some(Boolean) : results.every(Boolean);
}

// ----- Validation -----

function isEmpty(v: FieldValue): boolean {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") return v.trim() === "";
    if (typeof v === "boolean") return v === false;
    if (Array.isArray(v)) return v.length === 0;
    if (v instanceof File) return false;
    if (typeof v === "object") return !v.lat?.trim() || !v.lng?.trim();
    return false;
}

function validateField(field: Field, value: FieldValue): string | undefined {
    if (field.required && isEmpty(value)) return _t("custom_panels|validation_required" as TranslationKey);
    if (isEmpty(value)) return undefined;

    const v = field.validation;
    switch (field.type) {
        case "text": {
            const s = String(value);
            if (v.minLength != null && s.length < v.minLength)
                return _t("custom_panels|validation_min_length" as TranslationKey, { count: v.minLength });
            if (v.maxLength != null && s.length > v.maxLength)
                return _t("custom_panels|validation_max_length" as TranslationKey, { count: v.maxLength });
            return undefined;
        }
        case "number": {
            const n = Number(value);
            if (Number.isNaN(n)) return _t("custom_panels|validation_invalid_number" as TranslationKey);
            if (v.min != null && n < v.min)
                return _t("custom_panels|validation_min_value" as TranslationKey, { value: v.min });
            if (v.max != null && n > v.max)
                return _t("custom_panels|validation_max_value" as TranslationKey, { value: v.max });
            return undefined;
        }
        case "file": {
            if (!(value instanceof File)) return undefined;
            if (v.maxFileSizeMb != null && value.size > v.maxFileSizeMb * 1024 * 1024) {
                return _t("custom_panels|validation_max_file_size" as TranslationKey, { size: v.maxFileSizeMb });
            }
            if (v.allowedExtensions && v.allowedExtensions.length) {
                const ext = value.name.split(".").pop()?.toLowerCase() ?? "";
                if (!v.allowedExtensions.map((e) => e.toLowerCase()).includes(ext)) {
                    return _t("custom_panels|validation_allowed_extensions" as TranslationKey, {
                        list: v.allowedExtensions.join(", "),
                    });
                }
            }
            return undefined;
        }
        default:
            return undefined;
    }
}

// ----- Per-type renderers -----

interface FieldProps {
    field: Field;
    value: FieldValue;
    error?: string;
    onChange: (v: FieldValue) => void;
    jalaliDates?: boolean;
    /** Persian province name for cascading city dropdowns. */
    provinceName?: string | null;
}

function TextFieldView({ field, value, error, onChange }: FieldProps): JSX.Element {
    return (
        <input
            style={error ? inputErrorStyle : inputStyle}
            placeholder={field.placeholder}
            maxLength={field.validation.maxLength}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function NumberFieldView({ field, value, error, onChange }: FieldProps): JSX.Element {
    return (
        <input
            type="number"
            style={error ? inputErrorStyle : inputStyle}
            placeholder={field.placeholder}
            min={field.validation.min}
            max={field.validation.max}
            value={typeof value === "string" ? value : value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function SingleChoiceView({ field, value, error, onChange }: FieldProps): JSX.Element {
    return (
        <select
            style={error ? { ...selectStyle, borderColor: "#d60000" } : selectStyle}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="" disabled>
                {_t("custom_panels|select_option" as TranslationKey)}
            </option>
            {field.options.map((opt) => (
                <option key={opt.id} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

/**
 * City / شهرستان dropdown: empty until a province is chosen, then loads
 * counties from `GET /_synapse/client/forms/locations/cities?province=…`.
 */
function CityFieldView({
    value,
    error,
    onChange,
    provinceName,
}: FieldProps & { provinceName: string | null }): JSX.Element {
    const [cities, setCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!provinceName) {
            setCities([]);
            setLoading(false);
            setLoadError(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setLoadError(false);
        fetchCities(provinceName, "forms")
            .then((list) => {
                if (cancelled) return;
                setCities(list);
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setCities([]);
                setLoading(false);
                setLoadError(true);
            });

        return () => {
            cancelled = true;
        };
    }, [provinceName]);

    const disabled = !provinceName || loading;
    const placeholder = !provinceName
        ? _t("custom_panels|select_province_first" as TranslationKey)
        : loading
          ? _t("custom_panels|loading_cities" as TranslationKey)
          : loadError
            ? _t("custom_panels|cities_load_error" as TranslationKey)
            : _t("custom_panels|select_city" as TranslationKey);

    return (
        <select
            style={error ? { ...selectStyle, borderColor: "#d60000" } : selectStyle}
            value={typeof value === "string" ? value : ""}
            disabled={disabled || loadError || cities.length === 0}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {cities.map((name) => (
                <option key={name} value={name}>
                    {name}
                </option>
            ))}
        </select>
    );
}

function MultiChoiceView({ field, value, onChange }: FieldProps): JSX.Element {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (val: string): void => {
        onChange(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {field.options.map((opt) => (
                <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={arr.includes(opt.value)} onChange={() => toggle(opt.value)} />
                    <span style={{ fontSize: 14 }}>{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

function DateFieldView({ field, value, error, onChange, jalaliDates }: FieldProps): JSX.Element {
    if (jalaliDates) {
        const str = typeof value === "string" ? value : "";
        return (
            <DatePicker
                calendar={persian}
                locale={persian_fa}
                format={JALALI_DATE_FORMAT}
                calendarPosition="bottom-right"
                containerStyle={{ width: "100%" }}
                style={error ? inputErrorStyle : inputStyle}
                inputClass="mx_DynamicForm_jalaliDate"
                placeholder={field.placeholder || "مثال: ۱۴۰۳/۰۱/۱۵"}
                value={str || undefined}
                onChange={(date) => {
                    if (!date || Array.isArray(date)) {
                        onChange(null);
                        return;
                    }
                    onChange(toEnglishDigits(date.format(JALALI_DATE_FORMAT)));
                }}
            />
        );
    }

    return (
        <input
            type="date"
            style={error ? inputErrorStyle : inputStyle}
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function BooleanFieldView({ field, value, onChange }: FieldProps): JSX.Element {
    return (
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
            <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => onChange(e.target.checked)}
                style={{ marginTop: 3 }}
            />
            <span style={{ fontSize: 14, lineHeight: 1.6 }}>{field.title}</span>
        </label>
    );
}

function FileFieldView({ field, error, onChange }: FieldProps): JSX.Element {
    return (
        <input
            type="file"
            style={error ? inputErrorStyle : inputStyle}
            accept={field.validation.allowedExtensions?.map((e) => `.${e}`).join(",")}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
    );
}

function GeoFieldView({ field, value, error, onChange }: FieldProps): JSX.Element {
    const v =
        value && typeof value === "object" && !(value instanceof File)
            ? (value as { lat: string; lng: string })
            : { lat: "", lng: "" };
    const baseStyle = error ? inputErrorStyle : inputStyle;
    return (
        <div style={{ display: "flex", gap: 8 }}>
            <input
                style={baseStyle}
                placeholder={_t("custom_panels|geo_lat" as TranslationKey)}
                value={v.lat}
                onChange={(e) => onChange({ lat: e.target.value, lng: v.lng })}
            />
            <input
                style={baseStyle}
                placeholder={_t("custom_panels|geo_lng" as TranslationKey)}
                value={v.lng}
                onChange={(e) => onChange({ lat: v.lat, lng: e.target.value })}
            />
            {field.placeholder && <div style={{ position: "absolute", visibility: "hidden" }}>{field.placeholder}</div>}
        </div>
    );
}

function FieldView(props: FieldProps): JSX.Element {
    const { field } = props;

    // شهرستان / شهر → cascading city dropdown (loads after province is chosen).
    if (isCityField(field)) {
        return <CityFieldView {...props} provinceName={props.provinceName ?? null} />;
    }

    // استان → always a select when the server sent options (even if type is still "text").
    if (isProvinceField(field) && field.options?.length > 0) {
        return <SingleChoiceView {...props} />;
    }

    switch (field.type) {
        case "text":
            return <TextFieldView {...props} />;
        case "number":
            return <NumberFieldView {...props} />;
        case "single_choice":
            return <SingleChoiceView {...props} />;
        case "multi_choice":
            return <MultiChoiceView {...props} />;
        case "date":
            return <DateFieldView {...props} />;
        case "boolean":
            return <BooleanFieldView {...props} />;
        case "file":
            return <FileFieldView {...props} />;
        case "geo":
            return <GeoFieldView {...props} />;
        default:
            return (
                <div style={{ color: "#9ca3af", fontSize: 12 }}>
                    {_t("custom_panels|unknown_field_type" as TranslationKey, { type: (field as Field).type })}
                </div>
            );
    }
}

// ----- Top-level DynamicForm -----

interface Props {
    form: FormStructure;
    onSubmit: (values: FormValues) => void | Promise<void>;
    /** When true, date fields use a Jalali picker and submit Shamsi strings (YYYY/MM/DD). */
    jalaliDates?: boolean;
}

export function DynamicForm({ form, onSubmit, jalaliDates = false }: Props): JSX.Element {
    const [stepIdx, setStepIdx] = useState(0);
    const [values, setValues] = useState<FormValues>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stepTitles = useMemo(() => form.titles.map((t) => t.title), [form.titles]);
    const currentStep = form.steps[stepIdx];
    const fields = useMemo(() => allFormFields(form), [form]);
    const provinceField = useMemo(() => findProvinceField(fields), [fields]);
    const provinceName = resolveProvinceName(provinceField, provinceField ? (values[provinceField.id] ?? null) : null);

    const setValue = (id: number, v: FieldValue): void => {
        setValues((prev) => {
            const next: FormValues = { ...prev, [id]: v };
            const changed = fields.find((f) => f.id === id);
            // Changing province clears any selected city/county.
            if (changed && isProvinceField(changed)) {
                for (const f of fields) {
                    if (isCityField(f)) next[f.id] = null;
                }
            }
            return next;
        });
        setErrors((prev) => ({ ...prev, [id]: undefined }));
    };

    /** Validate currently-visible fields in the active step; returns true if valid. */
    const validateStep = (): boolean => {
        if (!currentStep) return true;
        const visible = currentStep.fields.filter((f) => shouldShowField(f, values));
        const next: FormErrors = {};
        for (const f of visible) {
            const e = validateField(f, values[f.id] ?? null);
            if (e) next[f.id] = e;
        }
        setErrors((prev) => ({ ...prev, ...next }));
        return Object.keys(next).length === 0;
    };

    const goNext = (): void => {
        if (!validateStep()) return;
        if (stepIdx < form.steps.length - 1) setStepIdx(stepIdx + 1);
    };

    const goPrev = (): void => {
        if (stepIdx > 0) setStepIdx(stepIdx - 1);
    };

    const handleSubmit = async (): Promise<void> => {
        if (!validateStep()) return;
        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentStep) {
        return <div style={{ padding: 24, color: "#6b7280" }}>{_t("custom_panels|form_no_step" as TranslationKey)}</div>;
    }

    const sortedFields = [...currentStep.fields]
        .filter((f) => shouldShowField(f, values))
        .sort((a, b) => a.order - b.order);

    const isLast = stepIdx === form.steps.length - 1;

    return (
        <div style={bodyStyle}>
            {stepTitles.length > 0 && <StepIndicator current={stepIdx} steps={stepTitles} />}

            <div style={sectionStyle}>
                {sortedFields.map((f) => {
                    const err = errors[f.id];
                    return (
                        <div key={f.id}>
                            {f.type !== "boolean" && (
                                <label style={labelStyle}>
                                    {f.title}
                                    {f.required && <span style={{ color: "#d60000" }}> *</span>}
                                </label>
                            )}
                            {f.description && <div style={descriptionStyle}>{f.description}</div>}
                            <FieldView
                                field={f}
                                value={values[f.id] ?? null}
                                error={err}
                                jalaliDates={jalaliDates}
                                provinceName={provinceName}
                                onChange={(v) => setValue(f.id, v)}
                            />
                            {err && <div style={errorTextStyle}>{err}</div>}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                {stepIdx > 0 && (
                    <button type="button" onClick={goPrev} style={secondaryButtonStyle} disabled={isSubmitting}>
                        {_t("custom_panels|prev_step" as TranslationKey)}
                    </button>
                )}
                {!isLast && (
                    <button type="button" onClick={goNext} style={buttonStyle} disabled={isSubmitting}>
                        {_t("custom_panels|next_step" as TranslationKey)}
                    </button>
                )}
                {isLast && (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{ ...buttonStyle, opacity: isSubmitting ? 0.7 : 1 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? _t("custom_panels|submitting" as TranslationKey)
                            : _t("custom_panels|submit_final" as TranslationKey)}
                    </button>
                )}
            </div>

            <div style={{ height: 24 }} />
            <div style={{ fontSize: 11, color: green, textAlign: "center" }}>
                {_t("custom_panels|step_indicator" as TranslationKey, {
                    current: stepIdx + 1,
                    total: form.steps.length,
                })}
            </div>
        </div>
    );
}
