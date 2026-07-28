/*
Copyright 2025 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type JSX, useEffect, useState } from "react";

import { _t, type TranslationKey } from "../../../languageHandler";
import { fetchCities, type CitiesApiSource } from "../../../utils/iranLocations";

export interface ProvinceOption {
    id: number | string;
    value: string;
    label?: string;
}

interface ProvinceSelectProps {
    value: string;
    onChange: (value: string) => void;
    /** Province options from the server (form/bot field options). */
    options: ReadonlyArray<ProvinceOption>;
    disabled?: boolean;
}

export function ProvinceSelect({ value, onChange, options, disabled }: ProvinceSelectProps): JSX.Element {
    return (
        <select value={value} disabled={disabled || options.length === 0} onChange={(e) => onChange(e.target.value)}>
            <option value="">{_t("custom_panels|select_province" as TranslationKey)}</option>
            {options.map((o) => (
                <option key={String(o.id)} value={o.value}>
                    {o.label || o.value}
                </option>
            ))}
        </select>
    );
}

interface CitySelectProps {
    value: string;
    province: string;
    onChange: (value: string) => void;
    source?: CitiesApiSource;
    disabled?: boolean;
}

/**
 * Cascading city dropdown. Stays empty/disabled until `province` is set, then
 * loads cities from the forms or bots locations API.
 */
export function CitySelect({
    value,
    province,
    onChange,
    source = "bots",
    disabled,
}: CitySelectProps): JSX.Element {
    const [cities, setCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!province.trim()) {
            setCities([]);
            setLoading(false);
            setLoadError(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setLoadError(false);
        fetchCities(province, source)
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
    }, [province, source]);

    const placeholder = !province.trim()
        ? _t("custom_panels|select_province_first" as TranslationKey)
        : loading
          ? _t("custom_panels|loading_cities" as TranslationKey)
          : loadError
            ? _t("custom_panels|cities_load_error" as TranslationKey)
            : _t("custom_panels|select_city" as TranslationKey);

    const isDisabled = disabled || !province.trim() || loading || loadError || cities.length === 0;

    return (
        <select value={value} disabled={isDisabled} onChange={(e) => onChange(e.target.value)}>
            <option value="">{placeholder}</option>
            {cities.map((name) => (
                <option key={name} value={name}>
                    {name}
                </option>
            ))}
        </select>
    );
}
