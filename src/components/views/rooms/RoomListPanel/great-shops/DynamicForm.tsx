/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX, useMemo, useState } from "react";

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
    if (field.required && isEmpty(value)) return "این فیلد الزامی است";
    if (isEmpty(value)) return undefined;

    const v = field.validation;
    switch (field.type) {
        case "text": {
            const s = String(value);
            if (v.minLength != null && s.length < v.minLength) return `حداقل ${v.minLength} کاراکتر`;
            if (v.maxLength != null && s.length > v.maxLength) return `حداکثر ${v.maxLength} کاراکتر`;
            return undefined;
        }
        case "number": {
            const n = Number(value);
            if (Number.isNaN(n)) return "عدد نامعتبر";
            if (v.min != null && n < v.min) return `حداقل ${v.min}`;
            if (v.max != null && n > v.max) return `حداکثر ${v.max}`;
            return undefined;
        }
        case "file": {
            if (!(value instanceof File)) return undefined;
            if (v.maxFileSizeMb != null && value.size > v.maxFileSizeMb * 1024 * 1024) {
                return `حداکثر حجم ${v.maxFileSizeMb} مگابایت`;
            }
            if (v.allowedExtensions && v.allowedExtensions.length) {
                const ext = value.name.split(".").pop()?.toLowerCase() ?? "";
                if (!v.allowedExtensions.map((e) => e.toLowerCase()).includes(ext)) {
                    return `فرمت مجاز: ${v.allowedExtensions.join(", ")}`;
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
                انتخاب کنید
            </option>
            {field.options.map((opt) => (
                <option key={opt.id} value={opt.value}>
                    {opt.label}
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

function DateFieldView({ field, value, error, onChange }: FieldProps): JSX.Element {
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
                placeholder="عرض جغرافیایی (lat)"
                value={v.lat}
                onChange={(e) => onChange({ lat: e.target.value, lng: v.lng })}
            />
            <input
                style={baseStyle}
                placeholder="طول جغرافیایی (lng)"
                value={v.lng}
                onChange={(e) => onChange({ lat: v.lat, lng: e.target.value })}
            />
            {field.placeholder && <div style={{ position: "absolute", visibility: "hidden" }}>{field.placeholder}</div>}
        </div>
    );
}

function FieldView(props: FieldProps): JSX.Element {
    const { field } = props;
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
            return <div style={{ color: "#9ca3af", fontSize: 12 }}>نوع فیلد ناشناخته: {(field as Field).type}</div>;
    }
}

// ----- Top-level DynamicForm -----

interface Props {
    form: FormStructure;
    onSubmit: (values: FormValues) => void | Promise<void>;
}

export function DynamicForm({ form, onSubmit }: Props): JSX.Element {
    const [stepIdx, setStepIdx] = useState(0);
    const [values, setValues] = useState<FormValues>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stepTitles = useMemo(() => form.titles.map((t) => t.title), [form.titles]);
    const currentStep = form.steps[stepIdx];

    const setValue = (id: number, v: FieldValue): void => {
        setValues((prev) => ({ ...prev, [id]: v }));
        // Clear the field's error as soon as it's edited.
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
        return <div style={{ padding: 24, color: "#6b7280" }}>این فرم هنوز step ندارد.</div>;
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
                        مرحله قبل
                    </button>
                )}
                {!isLast && (
                    <button type="button" onClick={goNext} style={buttonStyle} disabled={isSubmitting}>
                        مرحله بعد
                    </button>
                )}
                {isLast && (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{ ...buttonStyle, opacity: isSubmitting ? 0.7 : 1 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "در حال ارسال..." : "ثبت نهایی"}
                    </button>
                )}
            </div>

            <div style={{ height: 24 }} />
            <div style={{ fontSize: 11, color: green, textAlign: "center" }}>
                مرحله {stepIdx + 1} از {form.steps.length}
            </div>
        </div>
    );
}
