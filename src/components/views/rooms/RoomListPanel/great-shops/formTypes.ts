/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

// Shape of the form structure returned by
// GET /_synapse/client/forms/subcategories/{id}/form

export type FieldType = "text" | "number" | "single_choice" | "multi_choice" | "date" | "boolean" | "file" | "geo";

export interface FieldOption {
    id: number;
    value: string;
    label: string;
}

export interface FieldCondition {
    dependsOn: number; // field id
    operator: "equals" | "not_equals" | "in" | "not_in";
    value: string | string[];
}

export interface FieldValidation {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    maxFileSizeMb?: number;
    allowedExtensions?: string[];
    geoFence?: string; // GeoJSON Polygon as a string
}

export interface Field {
    id: number;
    type: FieldType;
    title: string;
    description: string;
    required: boolean;
    order: number;
    placeholder: string;
    condition_logic: "all" | "any";
    options: FieldOption[];
    conditions: FieldCondition[];
    validation: FieldValidation;
}

export interface Step {
    id: number;
    fields: Field[];
}

export interface StepTitle {
    id: number;
    title: string;
}

export interface FormStructure {
    type: "stepper";
    subCategoryId: number;
    subCategoryName: string;
    titles: StepTitle[];
    steps: Step[];
}

// ---------- Runtime form state ----------

/** Value stored per field. `null` means "not set". */
export type FieldValue = string | string[] | boolean | { lat: string; lng: string } | File | null;

export type FormValues = Record<number, FieldValue>;
export type FormErrors = Record<number, string | undefined>;
